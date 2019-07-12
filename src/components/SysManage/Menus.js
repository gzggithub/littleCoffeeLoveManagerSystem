import React, {Component} from 'react';
import {
    Table,
    Input,
    message,
    Form,
} from 'antd';
import reqwest from 'reqwest';

const FormItem = Form.Item;

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

//新增主菜单表单
// const AddItemForm = Form.create()(
//     (props) => {
//         const {visible, onCancel, onCreate, form, confirmLoading} = props;
//         const {getFieldDecorator} = form;

//         return (
//             <Modal
//                 visible={visible}
//                 title="添加菜单"
//                 width={600}
//                 onCancel={onCancel}
//                 onOk={onCreate}
//                 destroyOnClose={true}
//                 confirmLoading={confirmLoading}
//             >
//                 <div className="menu-add menu-form">
//                     <Form layout="vertical">
//                         <FormItem className="name" {...formItemLayout_8} label="菜单名称：">
//                             {getFieldDecorator('name', {
//                                 rules: [{
//                                     required: true,
//                                     message: '菜单名称不能为空',
//                                 }],
//                             })(
//                                 <Input placeholder="请输入菜单名称"/>
//                             )}
//                         </FormItem>
//                         <FormItem className="url" {...formItemLayout_12} label="菜单链接：">
//                             {getFieldDecorator('url', {
//                                 rules: [{
//                                     required: true,
//                                     message: '菜单链接不能为空',
//                                 }],
//                             })(
//                                 <Input placeholder="请输入菜单链接"/>
//                             )}
//                         </FormItem>
//                     </Form>
//                 </div>
//             </Modal>
//         );
//     }
// );

//新增主菜单组件
// class AddItem extends Component {
//     state = {
//         visible: false,
//         confirmLoading: false
//     };

//     showModal = () => {
//         this.setState({visible: true});
//     };

//     handleCancel = () => {
//         const form = this.form;
//         const cancel = () => {
//             this.setState({
//                 visible: false
//             }, () => {
//                 this.setState({
//                     confirmLoading: false
//                 });
//             })
//         };
//         const data = form.getFieldsValue();
//         let flag = false;
//         for (let x in data) {
//             if (data[x]) {
//                 flag = true
//             }
//         }
//         if (flag) {
//             confirm({
//                 title: '已添加信息未保存，确认放弃添加？',
//                 content: "",
//                 okText: '确认',
//                 okType: 'danger',
//                 cancelText: '取消',
//                 onOk() {
//                     cancel();
//                 },
//                 onCancel() {
//                 }
//             });
//         } else {
//             cancel()
//         }
//     };

//     handleCreate = () => {
//         const form = this.form;
//         form.validateFields((err, values) => {
//             if (err) {
//                 return;
//             }
//             this.setState({
//                 confirmLoading: true
//             });
//             reqwest({
//                 url: '/menu/saveSysMenu',
//                 type: 'json',
//                 method: 'post',
//                 headers: {
//                     Authorization: sessionStorage.token
//                 },
//                 data: {
//                     name: values.name,
//                     parentId: 0,
//                     url: values.url,
//                     type: 0
//                 },
//                 error: (XMLHttpRequest) => {
//                     message.error("保存失败");
//                     this.setState({
//                         confirmLoading: false
//                     })
//                 },
//                 success: (json) => {
//                     if (json.result === 0) {
//                         message.success("菜单添加成功");
//                         this.setState({
//                             visible: false
//                         }, () => {
//                             this.setState({
//                                 confirmLoading: false
//                             });
//                         });
//                         this.props.setFlag()
//                     } else {
//                         if (json.code === 901) {
//                             message.error("请先登录");
//                             this.props.toLoginPage();
//                         } else if (json.code === 902) {
//                             message.error("登录信息已过期，请重新登录");
//                             this.props.toLoginPage();
//                         } else {
//                             message.error(json.message);
//                             this.setState({
//                                 loading: false
//                             })
//                         }
//                     }
//                 }
//             });
//         });
//     };

//     saveFormRef = (form) => {
//         this.form = form;
//     };

//     render() {
//         return (
//             <div style={{display: this.props.opStatus ? "block" : "none"}}>
//                 <Button type="primary" onClick={this.showModal}>添加菜单</Button>
//                 <AddItemForm
//                     ref={this.saveFormRef}
//                     visible={this.state.visible}
//                     onCancel={this.handleCancel}
//                     onCreate={this.handleCreate}
//                     confirmLoading={this.state.confirmLoading}
//                 />
//             </div>
//         );
//     }
// }

//新增子菜单表单
// const AddSubItemForm = Form.create()(
//     (props) => {
//         const {visible, onCancel, onCreate, form, confirmLoading} = props;
//         const {getFieldDecorator} = form;

//         return (
//             <Modal
//                 visible={visible}
//                 title="添加菜单"
//                 width={600}
//                 onCancel={onCancel}
//                 onOk={onCreate}
//                 destroyOnClose={true}
//                 confirmLoading={confirmLoading}
//             >
//                 <div className="menu-add menu-form">
//                     <Form layout="vertical">
//                         <FormItem className="name" {...formItemLayout_8} label="菜单名称：">
//                             {getFieldDecorator('name', {
//                                 rules: [{
//                                     required: true,
//                                     message: '菜单名称不能为空',
//                                 }],
//                             })(
//                                 <Input placeholder="请输入菜单名称"/>
//                             )}
//                         </FormItem>
//                         <FormItem className="url" {...formItemLayout_12} label="菜单链接：">
//                             {getFieldDecorator('url', {
//                                 rules: [{
//                                     required: true,
//                                     message: '菜单链接不能为空',
//                                 }],
//                             })(
//                                 <Input placeholder="请输入菜单链接"/>
//                             )}
//                         </FormItem>
//                     </Form>
//                 </div>
//             </Modal>
//         );
//     }
// );

//新增子菜单组件
// class AddSubItem extends Component {
//     state = {
//         visible: false,
//         confirmLoading: false
//     };

//     showModal = () => {
//         this.setState({visible: true});
//     };

//     handleCancel = () => {
//         const form = this.form;
//         const cancel = () => {
//             this.setState({
//                 visible: false
//             }, () => {
//                 this.setState({
//                     confirmLoading: false
//                 });
//             })
//         };
//         const data = form.getFieldsValue();
//         let flag = false;
//         for (let x in data) {
//             if (data[x]) {
//                 flag = true
//             }
//         }
//         if (flag) {
//             confirm({
//                 title: '已添加信息未保存，确认放弃添加？',
//                 content: "",
//                 okText: '确认',
//                 okType: 'danger',
//                 cancelText: '取消',
//                 onOk() {
//                     cancel();
//                 },
//                 onCancel() {
//                 }
//             });
//         } else {
//             cancel()
//         }
//     };

//     handleCreate = () => {
//         const form = this.form;
//         form.validateFields((err, values) => {
//             if (err) {
//                 return;
//             }
//             this.setState({
//                 confirmLoading: true
//             });
//             reqwest({
//                 url: '/menu/saveSysMenu',
//                 type: 'json',
//                 method: 'post',
//                 headers: {
//                     Authorization: sessionStorage.token
//                 },
//                 data: {
//                     name: values.name,
//                     parentId: this.props.id,
//                     url: values.url,
//                     type: 1
//                 },
//                 error: (XMLHttpRequest) => {
//                     message.error("保存失败");
//                     this.setState({
//                         confirmLoading: false
//                     })
//                 },
//                 success: (json) => {
//                     if (json.result === 0) {
//                         message.success("菜单添加成功");
//                         this.setState({
//                             visible: false
//                         }, () => {
//                             this.setState({
//                                 confirmLoading: false
//                             });
//                         });
//                         this.props.recapture();
//                     } else {
//                         if (json.code === 901) {
//                             message.error("请先登录");
//                             this.props.toLoginPage();
//                         } else if (json.code === 902) {
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
//             });
//         });
//     };

//     saveFormRef = (form) => {
//         this.form = form;
//     };

//     render() {
//         return (
//             // 仅一级菜单项展示此按钮
//             <a style={{display: this.props.opStatus && !this.props.parentId ? "inline" : "none"}}>
//                 <span onClick={() => this.showModal()}>添加子菜单</span>
//                 <AddSubItemForm
//                     ref={this.saveFormRef}
//                     visible={this.state.visible}
//                     onCancel={this.handleCancel}
//                     onCreate={this.handleCreate}
//                     confirmLoading={this.state.confirmLoading}
//                 />
//             </a>
//         );
//     }
// }

//菜单信息编辑表单
// const ItemEditForm = Form.create()(
//     (props) => {
//         const {visible, onCancel, onCreate, form, data, confirmLoading} = props;
//         const {getFieldDecorator} = form;

//         return (
//             <Modal
//                 visible={visible}
//                 title="菜单编辑"
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
//                         <div className="institution-edit institution-form">
//                             <Form layout="vertical">
//                                 <FormItem className="name" {...formItemLayout_8} label="菜单名称：">
//                                     {getFieldDecorator('name', {
//                                         initialValue: data.name,
//                                         rules: [{
//                                             required: true,
//                                             message: '菜单名称不能为空',
//                                         }]
//                                     })(
//                                         <Input placeholder="请输入菜单名称"/>
//                                     )}
//                                 </FormItem>
//                                 <FormItem className="parentId" {...formItemLayout_8} label="父菜单ID：">
//                                     {getFieldDecorator('parentId', {
//                                         initialValue: data.parentId,
//                                         rules: [{
//                                             required: true,
//                                             message: '父菜单ID不能为空',
//                                         }]
//                                     })(
//                                         <Input placeholder="请输入父菜单ID"/>
//                                     )}
//                                 </FormItem>
//                                 <FormItem className="url" {...formItemLayout_12} label="菜单链接：">
//                                     {getFieldDecorator('url', {
//                                         initialValue: data.url,
//                                         rules: [{
//                                             required: true,
//                                             message: '菜单链接不能为空',
//                                         }]
//                                     })(
//                                         <Input placeholder="请输入菜单链接"/>
//                                     )}
//                                 </FormItem>
//                             </Form>
//                         </div>
//                 }
//             </Modal>
//         );
//     }
// );

//菜单信息编辑组件
/*class ItemEdit extends Component {
    state = {
        visible: false,
        data: {},
        confirmLoading: false
    };

    getData = () => {
        reqwest({
            url: '/menu/getInfoById',
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
                //         sysMenu: {
                //             id: 1,
                //             name: "",
                //             parentId: null,
                //             url: ""
                //         }
                //     },
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        data: json.data.sysMenu
                    })
                } else {
                    if (json.code === 901) {
                        message.error("请先登录");
                        this.props.toLoginPage();
                    } else if (json.code === 902) {
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
        this.getData();
        this.setState({
            visible: true,
        })
    };

    // 信息比对函数
    dataContrast = (values) => {
        const initValues = this.state.data;
        const itemList = ["name", "parentId", "url"];
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
                visible: false
            }, () => {
                this.setState({
                    data: {},
                    confirmLoading: false
                });
            })
        };
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
                cancel();
            }
        })
    };

    handleCreate = () => {
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
                url: global.config.baseUrl + '/menu/modifySysMenu',
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
                        message.success("菜单信息编辑成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                data: {},
                                confirmLoading: false
                            });
                        });
                        this.props.recapture();
                    } else {
                        if (json.code === 901) {
                            message.error("请先登录");
                            this.props.toLoginPage();
                        } else if (json.code === 902) {
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
            });
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={() => this.showModal()}>编辑</span>
                <ItemEditForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    id={this.props.id}
                    data={this.state.data}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}*/

//菜单列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            // 处理后的菜单列表
            data: [],
            pagination: {
                current: 1,
                pageSize: 15,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            }
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '15%',
            },
            {
                title: '排序',
                dataIndex: 'sort',
                width: 150,
                editable: true,
            },
            {
                title: '名称',
                dataIndex: 'name',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: 'URL',
                dataIndex: 'URL',
                render: (text, record) => this.renderColumns(text, record, 'URL'),
            },
            // {
            //     title: '操作',
            //     dataIndex: '操作',
            //     render: (text, record) => {
            //         return (
            //             <div className="editable-row-operations">
            //                 {/*编辑*/}
            //                 <ItemEdit id={record.id} recapture={this.getData} opStatus={this.props.opObj.modify}
            //                           toLoginPage={this.props.toLoginPage}/>
            //                 {/*上移*/}
            //                 <a onClick={() => this.reOrder(record.id, 1, record.index - 1, record.parentId)}
            //                    style={{display: this.props.opObj.modify ? "inline" : "none"}}>上移</a>
            //                 {/*下移*/}
            //                 <a onClick={() => this.reOrder(record.id, 0, record.index - 1, record.parentId)}
            //                    style={{display: this.props.opObj.modify ? "inline" : "none"}}>下移</a>
            //                 {/*删除*/}
            //                 <Popconfirm title="确认删除?"
            //                             placement="topRight"
            //                             onConfirm={() => this.deleteItem(record.id)}
            //                             onCancel=""
            //                             okType="danger"
            //                             okText="立即删除"
            //                             cancelText="取消">
            //                     <a style={{display: this.props.opObj.delete ? "inline" : "none"}}>删除</a>
            //                 </Popconfirm>
            //                 {/*添加子菜单*/}
            //                 <AddSubItem id={record.id} parentId={record.parentId} recapture={this.getData}
            //                             opStatus={this.props.opObj.modify} toLoginPage={this.props.toLoginPage}/>
            //             </div>
            //         );
            //     },
            // }
        ];
    }

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    // 菜单列表处理函数
    dataHandle = (data) => {
        // 获取一级菜单列表（parentId为0的项）；
        const result = [];
        const fnFilter = (para) => {
            return para.parentId === 0
        };
        data.filter(fnFilter).forEach((item, index) => {
            const temp = {
                key: item.id,
                id: item.id,
                parentId: item.parentId,
                index: index + 1,
                sort: item.orderNum === 0 ? "" : item.orderNum,
                name: item.name,
                URL: item.url,
            };
            result.push(temp)
        });
        // 遍历一级菜单，生成所需要的权限菜单列表
        result.forEach((item) => {
            // 获取当前一级菜单下属二级菜单列表，写入children属性
            const fnFilter__ = (para) => {
                return para.parentId === item.id
            };
            if (data.filter(fnFilter__).length) {
                item.children = [];
                data.filter(fnFilter__).forEach((subItem, subIndex) => {
                    const temp = {
                        key: subItem.id,
                        id: subItem.id,
                        parentId: subItem.parentId,
                        index: subIndex + 1,
                        name: subItem.name,
                        sort: subItem.orderNum === 0 ? "" : subItem.orderNum,
                        URL: subItem.url,
                    };
                    item.children.push(temp)
                })
            }
        });
        return result;
    };

    //获取本页信息
    getData = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/menu/list',
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
                //         {id: 11, name: "", parentId: 0, url: ""},
                //         {id: 12, name: "", parentId: 0, url: ""},
                //         {id: 13, name: "", parentId: 0, url: ""},
                //         {id: 14, name: "", parentId: 0, url: ""},
                //         {id: 15, name: "", parentId: 0, url: ""},
                //         {id: 16, name: "", parentId: 0, url: ""},
                //         {id: 17, name: "", parentId: 0, url: ""},
                //         {id: 18, name: "", parentId: 0, url: ""},
                //         {id: 19, name: "", parentId: 0, url: ""},
                //         {id: 20, name: "", parentId: 0, url: ""},
                //         {id: 21, name: "", parentId: 0, url: ""},
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        // 对原始菜单列表进行处理后写入
                        data: this.dataHandle(json.data),
                        pagination: {
                            total: json.data.length,
                            current: this.state.pagination.current,
                            pageSize: this.state.pagination.pageSize
                        }
                    })
                } else {
                    if (json.code === 901) {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === 902) {
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
        })
    };

    //菜单删除
    deleteItem = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/menu/deleteSysMenu',
            type: 'json',
            method: 'post',
            data: {
                id: para
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("菜单删除成功");
                    this.getData();
                } else {
                    if (json.code === 901) {
                        message.error("请先登录");
                        this.props.toLoginPage();
                    } else if (json.code === 902) {
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

    //菜单排序
    reOrder = (para_id, para_type, para_index, parentId) => {
        let dataArr = [], targetId = "";
        // 获取操作项所在列表对象
        const fnFilter = (item) => {
            return item.id === parentId
        };
        if (parentId === 0) {
            // 操作项为一级菜单，dataArr即为data对象本身
            dataArr = this.state.data
        } else {
            // 操作项非一级菜单，dataArr即为当前操作项父菜单下属子菜单列表
            dataArr = this.state.data.filter(fnFilter)[0].children
        }
        // type为1，进入上移分支
        if (para_type === 1) {
            // 首项无法上移，直接return
            if (para_index <= 0) {
                message.error("该项无法上移");
                return;
            }
            // 上一项Id设为目标Id
            targetId = dataArr[para_index - 1].id
        }
        // type为0，进入下移分支
        if (para_type === 0) {
            // 末项无法下移，直接return
            if (para_index >= dataArr.length - 1) {
                message.error("该项无法下移");
                return;
            }
            // 下一项Id设为目标Id
            targetId = dataArr[para_index + 1].id;
        }
        this.setState({
            loading: true
        });
        reqwest({
            url: '/menu/sortSysMenu',
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
                    if (json.code === 901) {
                        message.error("请先登录");
                        this.props.toLoginPage();
                    } else if (json.code === 902) {
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

    // 设置排序
    handleSort = (row) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/menu/updateSort',
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
                    if (json.code === 901) {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === 902) {
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
    }

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
                      pagination={false}
                      // 排序权限设置
                      columns={this.props.opObj.updateSort ? columns : columns.filter((ele, index) => {return index !== 1 })}
                      onChange={this.handleTableChange}/>;
    }
}

class Menus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            flag_add: false
        }
    };

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
        // 菜单信息为空则直接返回登陆页
        if (!sessionStorage.menuListOne) {
            this.toLoginPage();
            return
        }
        JSON.parse(sessionStorage.menuListOne).forEach((item) => {
            item.children.forEach((subItem) => {
                if (subItem.url === this.props.location.pathname) {
                    let data = {};
                    subItem.children.forEach((thirdItem) => {
                        data[thirdItem.url] = true;
                    });
                    this.setState({
                        opObj: data
                    })
                }
            })
        })
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
        return (
            <div className="menus">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                菜单列表
                                <div className="add-button" style={{float: "right"}}>
                                    {/*新增主菜单*/}
                                    {/*<AddItem opStatus={this.state.opObj.add} setFlag={this.setFlag}
                                             toLoginPage={this.toLoginPage}/>*/}
                                </div>
                            </header>
                            {/*菜单列表*/}
                            <div className="table-box">
                                <DataTable 
                                    opObj={this.state.opObj} 
                                    flag_add={this.state.flag_add}
                                    toLoginPage={this.toLoginPage}/>
                            </div>
                        </div>
                        :
                        <p>暂无查询权限</p>
                }
            </div>
        )
    }
}

export default Menus;