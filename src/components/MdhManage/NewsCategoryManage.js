import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    Form,
    message,
    Popconfirm,
} from 'antd';
import '../../config/config';
import reqwest from 'reqwest';

const FormItem = Form.Item;
const confirm = Modal.confirm;

//栅格设置
const formItemLayout_8 = {
    labelCol: {span: 4},
    wrapperCol: {span: 8}
};
const formItemLayout_12 = {
    labelCol: {span: 5},
    wrapperCol: {span: 11}
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

// 可编辑的单元格
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends Component {
    state = {
        editing: false,
    }

    toggleEdit = (valuess) => {
        console.log(valuess);
        const editing = !this.state.editing;
        this.setState({ editing }, () => {
            if (editing) {
                this.input.focus();
            }
        });
    }

    sort = (props1, e) => {
        const { record, handleSort } = this.props;
        this.form.validateFields((error, values) => {
            if (error && error[e.currentTarget.id]) {
                return;
            }
            this.toggleEdit();
            // 判断排序值是否改变，不变就不用排序，只有改变才请求sort接口
            if (props1 !== Number(values.sort)) {
                handleSort({ ...record, ...values });
            } 
        });
    }

    render() {
        const { editing } = this.state;
        const { editable, dataIndex, title, record, index, handleSort, ...restProps } = this.props;
        return (
        <td {...restProps}>
            {editable ? (
            <EditableContext.Consumer>
                {(form) => {
                    this.form = form;
                    return (
                        editing ? (
                        <FormItem style={{ margin: 0 }}>
                            {form.getFieldDecorator(dataIndex, {
                                rules: [{
                                    required: false,                                   
                                    message: "只能输入数字",                                    
                                }],                               
                                initialValue: record[dataIndex],
                                })(
                                <Input style={{textAlign: "center"}}
                                    // allowClear
                                    ref={node => (this.input = node)}
                                    onPressEnter={this.sort.bind(this, record[dataIndex])}
                                    onBlur={this.sort.bind(this, record[dataIndex])}
                                    placeholder="双击设置排序"
                                />
                            )}
                        </FormItem>
                        ) : (
                        <div
                            className="editable-cell-value-wrap "
                            onClick={this.toggleEdit}
                        >
                            <Input style={{textAlign: "center"}}
                                // allowClear
                                ref= {node => (this.input = node)}
                                value={record[dataIndex]}
                                placeholder="双击设置排序"
                            />
                        </div>
                        )
                    );
                }}
            </EditableContext.Consumer>
            ) : restProps.children}
        </td>
        );
    }
}

//新增一级类型表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="添加类型"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="category-add category-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_8} label="类型名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '名称不能为空',
                                }],
                            })(
                                <Input placeholder="请输入类型名称"/>
                            )}
                        </FormItem>                    
                    </Form>
                </div>
            </Modal>
        );
    }
);

//新增一级类型组件
class ItemAdd extends Component {
    state = {
        visible: false,
        confirmLoading: false
    };

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
                    confirmLoading: false
                });
            })
        };
        const data = form.getFieldsValue();
        let flag = false;
        for (let x in data) {
            if (data[x]) {
                flag = true
            }
        }
        if (flag) {
            confirm({
                title: '已添加信息未保存，确认放弃添加？',
                content: "",
                okText: '确认',
                okType: 'danger',
                cancelText: '取消',
                onOk() {
                    cancel();
                },
                onCancel() {
                }
            });
        } else {
            cancel()
        }
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/sys/newsType/save',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    name: values.name,
                    parentId: 0,
                },
                error: (XMLHttpRequest) => {
                    message.error("添加失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("资讯类型添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                confirmLoading: false
                            });
                        });
                        this.props.setFlag()
                    } else {
                        if (json.code === "901") {
                            message.error("请先登录");
                            this.props.toLoginPage();
                        } else if (json.code === "902") {
                            message.error("登录信息已过期，请重新登录");
                            this.props.toLoginPage();
                        } else {
                            message.error(json.message);
                            this.setState({
                                confirmLoading: false
                            })
                        }
                    }
                }
            })
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <div>
            {/*注释也要在一个根标签里，否则报错*/}
            {/*<div style={{display: this.props.opStatus ? "block" : "none"}}>*/}
                <Button style={{marginBottom: "10px"}} type="primary" onClick={this.showModal}>添加类型</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    confirmLoading={this.state.confirmLoading}
                />
            </div>
        );
    }
}

//新增二级类型表单
const SubItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="添加子类型"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="category-add category-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_12} label="子类型名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '子名称不能为空',
                                }],
                            })(
                                <Input placeholder="请输入子类型名称"/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//新增二级类型组件
class SubItemAdd extends Component {
    state = {
        visible: false,
        confirmLoading: false
    };

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
                    confirmLoading: false
                });
            })
        };
        const data = form.getFieldsValue();
        let flag = false;
        for (let x in data) {
            if (data[x]) {
                flag = true
            }
        }
        if (flag) {
            confirm({
                title: '已添加信息未保存，确认放弃添加？',
                content: "",
                okText: '确认',
                okType: 'danger',
                cancelText: '取消',
                onOk() {
                    cancel();
                },
                onCancel() {
                }
            });
        } else {
            cancel()
        }
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/sys/newsType/save',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    name: values.name,
                    parentId: this.props.id
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("资讯子类型添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                confirmLoading: false
                            });
                        });
                        this.props.recapture()
                    } else {
                        if (json.code === "901") {
                            message.error("请先登录");
                            this.props.toLoginPage();
                        } else if (json.code === "902") {
                            message.error("登录信息已过期，请重新登录");
                            this.props.toLoginPage();
                        } else {
                            message.error(json.message);
                            this.setState({
                                confirmLoading: false
                            })
                        }
                    }
                }
            })
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a style={{display: this.props.parentId === 0 ? "inline" : "none"}}>
                <span onClick={() => this.showModal()}>添加子类型</span>
                <SubItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//修改一级类型表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="类型编辑"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                {
                    // JSON.stringify(data) === "{}" ?
                    //     <div className="spin-box">
                    //         <Spin/>
                    //     </div>
                    //     :
                        <div className="category-add category-form">
                            <Form layout="vertical">
                                <FormItem className="name" {...formItemLayout_8} label="类型名称：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.name,
                                        rules: [{
                                            required: true,
                                            message: '名称不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入类型名称"/>
                                    )}
                                </FormItem>
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

//修改一级类型组件
class ItemEdit extends Component {
    state = {
        visible: false,
        data: {},
        confirmLoading: false
    };

    getData = () => {
        reqwest({
            url: '/institution/getTypeDetail',
            type: 'json',
            method: 'post',
            data: {
                id: this.props.id
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         typeDetails: {
                //             id: 1,
                //             name: "",
                //             photo: ""
                //         }
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        data: json.data.typeDetails,
                    });
                }else{
                    if (json.code === "901") {
                        message.error("请先登录");
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                    }
                }
            }
        });
    };

    showModal = () => {
        // this.getData();
        this.setState({
            visible: true,
            data: {
                name: this.props.record.name,
            }
        });
    };
    // 信息比对函数
    dataContrast = (values) => {
        const initValues = this.state.data;
        const itemList = ["name"];
        const result = {};

        itemList.forEach((item) => {
            if (values[item] !== initValues[item]) {
                result[item] = values[item];
            }
        });
        if (JSON.stringify(result) === "{}") {
            return false;
        } else {
            result.id = this.props.id;
            return result;
        }
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false,
            }, () => {
                this.setState({
                    data: {},
                    confirmLoading: false
                });
            })
        };
        if (JSON.stringify(this.state.data) === "{}") {
            cancel();
            return;
        }
        form.validateFields((err, values) => {
            const result = this.dataContrast(values);
            if (result) {
                confirm({
                    title: '已修改信息未保存，确认放弃修改？',
                    content: "",
                    okText: '确认',
                    okType: 'danger',
                    cancelText: '取消',
                    onOk() {
                        cancel();
                    }
                });
            } else {
                cancel()
            }
        })
    };

    handleCreate = () => {
        if (JSON.stringify(this.state.data) === "{}") {
            return;
        }
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            const result = this.dataContrast(values);
            if (!result) {
                message.error("暂无信息更改，无法提交");
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/sys/newsType/update',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: result,
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("类型编辑成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                data: {},
                                confirmLoading: false
                            });
                        });
                        this.props.recapture()
                    } else {
                        if (json.code === "901") {
                            message.error("请先登录");
                            this.props.toLoginPage();
                        } else if (json.code === "902") {
                            message.error("登录信息已过期，请重新登录");
                            this.props.toLoginPage();
                        } else {
                            message.error(json.message);
                            this.setState({
                                confirmLoading: false
                            })
                        }
                    }
                }
            })
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a>          
                <span onClick={this.showModal}>编辑</span>
                <ItemEditForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    data={this.state.data}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//修改二级类型表单
// const SubItemEditForm = Form.create()(
//     (props) => {
//         const {visible, onCancel, onCreate, form, data, confirmLoading} = props;
//         const {getFieldDecorator} = form;

//         return (
//             <Modal
//                 visible={visible}
//                 title="子类型编辑"
//                 width={600}
//                 onCancel={onCancel}
//                 onOk={onCreate}
//                 destroyOnClose={true}
//                 confirmLoading={confirmLoading}
//             >
//                 {
//                     JSON.stringify(data) === "{}" ?
//                         <div className="spin-box">
//                             <Spin/>
//                         </div>
//                         :
//                         <div className="category-add category-form">
//                             <Form layout="vertical">
//                                 <FormItem className="name" {...formItemLayout_12} label="子类型名称：">
//                                     {getFieldDecorator('name', {
//                                         initialValue: data.name,
//                                         rules: [{
//                                             required: true,
//                                             message: '名称不能为空',
//                                         }],
//                                     })(
//                                         <Input placeholder="请输入子类型名称"/>
//                                     )}
//                                 </FormItem>
//                             </Form>
//                         </div>
//                 }
//             </Modal>
//         );
//     }
// );

//修改二级类型组件
// class SubItemEdit extends Component {
//     state = {
//         visible: false,
//         data: {},
//         confirmLoading: false
//     };

//     getData = () => {
//         reqwest({
//             url: '/institution/getTypeDetail',
//             type: 'json',
//             method: 'post',
//             data: {
//                 id: this.props.id
//             },
//             headers: {
//                 Authorization: sessionStorage.token
//             },
//             error: (XMLHttpRequest) => {
//                 // const json = {
//                 //     result: 0,
//                 //     data: {
//                 //         typeDetails: {
//                 //             id: 1,
//                 //             name: "123"
//                 //         }
//                 //     }
//                 // };
//             },
//             success: (json) => {
//                 if (json.result === 0) {
//                     this.setState({
//                         data: json.data.typeDetails
//                     });
//                 }else{
//                     if (json.code === "901") {
//                         message.error("请先登录");
//                         this.props.toLoginPage();
//                     } else if (json.code === "902") {
//                         message.error("登录信息已过期，请重新登录");
//                         this.props.toLoginPage();
//                     } else {
//                         message.error(json.message);
//                     }
//                 }
//             }
//         });
//     };

//     showModal = () => {
//         // this.getData();
//         this.setState({
//             visible: true,
//             data: {
//                 name: this.props.record.name,
//             }
//         });
//     };

//     // 信息比对函数
//     dataContrast = (values) => {
//         const initValues = this.state.data;
//         const itemList = ["name"];
//         const result = {};

//         itemList.forEach((item) => {
//             if (values[item] !== initValues[item]) {
//                 result[item] = values[item];
//             }
//         });
//         if (JSON.stringify(result) === "{}") {
//             return false;
//         } else {
//             result.id = this.props.id;
//             return result;
//         }
//     };

//     handleCancel = () => {
//         const form = this.form;
//         const cancel = () => {
//             this.setState({
//                 visible: false,
//             }, () => {
//                 this.setState({
//                     data: {},
//                     confirmLoading: false
//                 });
//             })
//         };
//         if (JSON.stringify(this.state.data) === "{}") {
//             cancel();
//             return;
//         }
//         form.validateFields((err, values) => {
//             values.photo = this.state.data_pic;
//             const result = this.dataContrast(values);
//             if (result) {
//                 confirm({
//                     title: '已修改信息未保存，确认放弃修改？',
//                     content: "",
//                     okText: '确认',
//                     okType: 'danger',
//                     cancelText: '取消',
//                     onOk() {
//                         cancel();
//                     }
//                 });
//             } else {
//                 cancel()
//             }
//         })
//     };

//     handleCreate = () => {
//         if (JSON.stringify(this.state.data) === "{}") {
//             return;
//         }
//         const form = this.form;
//         form.validateFields((err, values) => {
//             if (err) {
//                 return;
//             }
//             const result = this.dataContrast(values);
//             if (!result) {
//                 message.error("暂无信息更改，无法提交");
//                 return;
//             }
//             this.setState({
//                 confirmLoading: true
//             });
//             reqwest({
//                 url: '/sys/newsType/update',
//                 type: 'json',
//                 method: 'post',
//                 headers: {
//                     Authorization: sessionStorage.token
//                 },
//                 data: result,
//                 error: (XMLHttpRequest) => {
//                     message.error("保存失败");
//                     this.setState({
//                         confirmLoading: false
//                     })
//                 },
//                 success: (json) => {
//                     if (json.result === 0) {
//                         message.success("类型编辑成功");
//                         this.setState({
//                             visible: false
//                         }, () => {
//                             this.setState({
//                                 data: {},
//                                 confirmLoading: false
//                             });
//                         });
//                         this.props.recapture()
//                     } else {
//                         if (json.code === "901") {
//                             message.error("请先登录");
//                             this.props.toLoginPage();
//                         } else if (json.code === "902") {
//                             message.error("登录信息已过期，请重新登录");
//                             this.props.toLoginPage();
//                         } else {
//                             message.error(json.message);
//                             this.setState({
//                                 confirmLoading: false
//                             })
//                         }
//                     }
//                 }
//             })
//         });
//     };

//     saveFormRef = (form) => {
//         this.form = form;
//     };

//     render() {
//         return (
//             <a>
//             {/*<a style={{display: this.props.opStatus ? "inline" : "none"}}>*/}
//                 <span onClick={this.showModal}>编辑</span>
//                 <SubItemEditForm
//                     ref={this.saveFormRef}
//                     visible={this.state.visible}
//                     onCancel={this.handleCancel}
//                     onCreate={this.handleCreate}
//                     data={this.state.data}
//                     confirmLoading={this.state.confirmLoading}
//                 />
//             </a>
//         );
//     }
// }

//类型列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.institutionPageSize) || 15,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            }
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: "10%",
            },
            {
                title: '排序',
                dataIndex: 'sort',
                width: 150,
                editable: true,
            },
            {
                title: '分类名称',
                dataIndex: 'name',
                className: 'categoryName',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'name')
            },
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*一级类型编辑*/}
                            <ItemEdit id={record.id} record={record} parentId={record.parentId} recapture={this.getData}
                                      opStatus={this.props.opObj.modify && record.parentId === 0}
                                      toLoginPage={this.props.toLoginPage}/>
                            {/*二级类型编辑*/}
                            {/*<SubItemEdit id={record.id} parentId={record.parentId} recapture={this.getData}
                                         opStatus={this.props.opObj.modify && record.parentId !== 0}
                                         toLoginPage={this.props.toLoginPage}
                                         />*/}                   
                            {/*<a onClick={() => this.reOrder(record.id, 1, record.index - 1, record.parentId)}
                               style={{display: this.props.opObj.modify ? "inline" : "none"}}>上移</a>
                            <a onClick={() => this.reOrder(record.id, 0, record.index - 1, record.parentId)}
                               style={{display: this.props.opObj.modify ? "inline" : "none"}}>下移</a>*/}
                            <Popconfirm title="确认删除?"
                                        placement="topRight"
                                        onConfirm={() => this.itemDelete(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="立即删除"
                                        cancelText="取消">
                                {/*<a style={{display: this.props.opObj.delete ? "inline" : "none"}}>删除</a>*/}
                                <a>删除</a>
                            </Popconfirm>

                            {/*二级类型新增*/}
                            <SubItemAdd id={record.id} parentId={record.parentId} recapture={this.getData}
                                        opStatus={this.props.opObj.add && record.parentId === 0}
                                        toLoginPage={this.props.toLoginPage}/>
                        </div>
                    );
                },
            }
        ];
    }

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    // 列表信息处理函数
    dataHandle = (data) => {
        let result = [];
        // data.sort((a, b) => {
        //     return a.sort - b.sort
        // });
        data.list.forEach((item, index) => {
            const temp = {
                key: item.id,
                id: item.id,
                sort: item.sort !== 0 ? item.sort : '',
                parentId: item.parentId,
                index: index + 1,
                name: item.name,
                Icon: item.photo
            };
            if (item.list) {
                const tempChildren = [];
                const dataItem = item.list.sort((a, b) => {
                    return a.sort - b.sort
                });
                dataItem.forEach((subItem, subIndex) => {
                    const temp = {
                        key: subItem.id,
                        id: subItem.id,
                        sort: subItem.sort !== 0 ? subItem.sort : '',
                        parentId: subItem.parentId,
                        index: subIndex + 1,
                        name: subItem.name
                    };
                    tempChildren.push(temp)
                });
                temp.children = tempChildren
            }
            result.push(temp)
        });
        return result;
    };

    //获取本页信息
    getData = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/newsType/list',
            type: 'json',
            method: 'get',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                })
                // const json = {
                //     result: 0,
                //     data: [
                //         {
                //             id: 1,
                //             name: "",
                //             photo: "",
                //             parentId: 0,
                //             sort: 1,
                //             list: [
                //                 {id: 11, name: "", parentId: 1, sort: 5},
                //             ]
                //         },
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    if (json.data.list.length === 0 && this.state.pagination.current !== 1) {
                        this.setState({
                            pagination: {
                                current: 1,
                                pageSize: this.state.pagination.pageSize
                            }
                        }, () => {
                            this.getData();
                        });
                        return
                    }
                    this.setState({
                        loading: false,
                        data: this.dataHandle(json.data),
                        pagination: {
                            total: json.data.total,
                            current: this.state.pagination.current,
                            pageSize: this.state.pagination.pageSize
                        }
                    })
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                        this.setState({
                            loading: false
                        })
                    }
                }
            }
        });
    };

    //分类排序
    reOrder = (para_id, para_type, para_index, para_parentId) => {
        const fn_filter = (item) => {
            return item.id === para_parentId
        };
        const data = para_parentId === 0 ? this.state.data : this.state.data.filter(fn_filter)[0].children;
        let targetId = "";
        if (para_type === 1) {
            if (para_index <= 0) {
                message.error("该项无法上移");
                return;
            }
            targetId = data[para_index - 1].id
        }
        if (para_type === 0) {
            if (para_index >= data.length - 1) {
                message.error("该项无法下移");
                return;
            }
            targetId = data[para_index + 1].id;
        }
        this.setState({
            loading: true
        });
        reqwest({
            url: '/institution/sortEducationType',
            type: 'json',
            method: 'post',
            data: {
                id: para_id,
                targetId: targetId
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: () => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("排序成功");
                    this.getData();
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                        this.setState({
                            loading: false
                        })
                    }
                }
            }
        });
    };

    // 设置排序
    handleSort = (row) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/newsType/updateSort',
            type: 'json',
            method: 'post',
            data: {
                // 机构Id
                id: row.id,
                // 排序
                sort: Number(row.sort),
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                    });
                    this.getData(); //刷新数据
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                        this.setState({
                            loading: false
                        })
                    }
                }
            }
        });  
    };

    //分类删除
    itemDelete = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/newsType/delete?id=' + para,
            type: 'json',
            method: 'delete',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("删除失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("分类删除成功");
                    this.getData();
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                        this.setState({
                            loading: false
                        })
                    }
                }
            }
        });
    };

    //表格参数变化处理
    handleTableChange = (pagination, filters) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.institutionPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.institutionPageSize);
        this.setState({
            type: filters.type ? filters.type[0] : null,
            status: filters.status ? filters.status[0] : null,
            pagination: pager,
        }, () => {
            this.getData();
        });
    };

    componentWillMount() {
        this.getData();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData();
    }

    render() {
        const components = {
            body: {
              row: EditableFormRow,
              cell: EditableCell,
            },
        };
        const columns = this.columns.map((col) => {
            if (!col.editable) {
              return col;
            }
            return {
              ...col,
              onCell: record => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSort: this.handleSort,
              }),
            };
        });
        return <Table bordered
                      components={components}
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={this.state.pagination}
                      columns={columns}
                      onChange={this.handleTableChange}
                      />;
    }
}

class NewsCategoryManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            flag_add: false
        }
    };

    // 获取当前登录人对此菜单的操作权限
    // 多了一级循环
    setPower = () => {
        // 菜单信息为空则直接返回登陆页
        if (!sessionStorage.menuListOne) {
            this.toLoginPage();
            return
        }
        JSON.parse(sessionStorage.menuListOne).forEach((item) => {
            item.children.forEach((subItem) => {                
                subItem.children.forEach((thirdItem) => {
                    if (thirdItem.url === this.props.location.pathname) {
                        let data = {};
                        thirdItem.children.forEach((fourthItem) => {
                            data[fourthItem.url] = true;
                        });
                        this.setState({
                            opObj: data
                        })
                    }
                })
                
            })
        });        
    };

    setFlag = () => {
        this.setState({
            flag_add: !this.state.flag_add
        })
    };

    // 登陆信息过期或不存在时的返回登陆页操作
    toLoginPage = () => {
        sessionStorage.clear();
        this.props.history.push('/')
    };

    componentWillMount() {
        this.setPower();
        if (this.props.location.search) {
            this.props.history.push(this.props.location.pathname)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location.search) {
            this.props.history.push(nextProps.location.pathname);
            this.setFlag();
        }
    }

    render() {
        console.log(this.state.opObj)
        return (
            <div className="category">
                {
                    // this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                {/*<span>类型列表</span>*/}
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd opStatus={this.state.opObj.add} setFlag={this.setFlag}
                                             toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            <div className="table-box">
                                <DataTable opObj={this.state.opObj} flag_add={this.state.flag_add}
                                           toLoginPage={this.toLoginPage}/>
                            </div>
                        </div>
                        // :
                        // <p>暂无查询权限</p>
                }
            </div>
        )
    }
}

export default NewsCategoryManage;