import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    message,
    Form,
    Popconfirm,
    Spin,
} from 'antd';
import reqwest from 'reqwest';

const FormItem = Form.Item;
const {TextArea} = Input;

const formItemLayout_14 = {
    labelCol: {span: 4},
    wrapperCol: {span: 14},
};

const formItemLayout_16 = {
    labelCol: {span: 6},
    wrapperCol: {span: 12},
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//新增部门表单
const AddItemForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="添加部门"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="menu-add menu-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_14} label="部门名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '部门名称不能为空',
                                },
                                {
                                    max: 10,
                                    message: '部门名称最长10个字',
                                }],
                            })(
                                <Input placeholder="请输入部门名称"/>
                            )}
                        </FormItem>                        
                        <FormItem className="description" {...formItemLayout_14} label="部门描述：">
                            {getFieldDecorator('description', {
                                rules: [{
                                    required: false,
                                    max: 300,
                                    message: '部门描述最长为300字'
                                }]
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写部门描述" rows={5}/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//新增部门组件
class AddItem extends Component {
    state = {
        visible: false,
        confirmLoading: false
    };

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false
        }, () => {
            this.setState({
                confirmLoading: false
            });
            form.resetFields();
        });
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
                url: '/sys/department/save',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    name: values.name,
                    parentId: 0,
                    description: values.description,
                    type: 0
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("部门添加成功");
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
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button style={{marginBottom: "10px"}} type="primary" onClick={this.showModal}>添加部门</Button>
                <AddItemForm
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

//新增子部门表单
const AddSubItemForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="添加子部门"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="menu-add menu-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_16} label="子部门名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '子部门名称不能为空',
                                },
                                {
                                    max: 10,
                                    message: '子部门名称最长10个字'
                                }],
                            })(
                                <Input placeholder="请输入子部门名称"/>
                            )}
                        </FormItem>                        
                        <FormItem className="description" {...formItemLayout_16} label="部门描述：">
                            {getFieldDecorator('description', {
                                rules: [{
                                    required: false,
                                    max: 300,
                                    message: '部门描述最长300字'
                                }]
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写部门描述" rows={5}/>
                            )}
                        </FormItem>                        
                    </Form>
                </div>
            </Modal>
        );
    }
);

//新增子部门组件
class AddSubItem extends Component {
    state = {
        visible: false,
        confirmLoading: false
    };

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false
        }, () => {
            this.setState({
                confirmLoading: false
            });
            form.resetFields();
        });
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
                url: '/sys/department/save',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    name: values.name,
                    parentId: this.props.id,
                    description: values.description,
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("子部门添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                confirmLoading: false
                            });
                        });
                        this.props.recapture();
                    } else {
                        if (json.code === "901") {
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
            // 仅一级菜单项展示此按钮
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={() => this.showModal()}>添加子部门</span>
                <AddSubItemForm
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

//成员名单表单
const NumDetailForm = Form.create()(
    (props) => {
        const {visible, onCancel, confirmLoading, loading, data, columns, pagination} = props;
        // const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="部门成员"
                width={600}
                onCancel={onCancel}
                // onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
                footer={null}
            >
                <div className="table-box">                    
                    <Table bordered
                      loading={loading}
                      dataSource={data}
                      pagination={pagination}
                      columns={columns}/>
                </div>
            </Modal>
        );
    }
);

//成员名单组件
class NumDetail extends Component {
    state = {
        visible: false,
        confirmLoading: false,
        loading: false,
        data: [],
        pagination: {
            current: 1,
            pageSize: Number(localStorage.institutionPageSize) || 10,
            pageSizeOptions: ["5", "10", "15", "20"],
            showQuickJumper: true,
            showSizeChanger: true
        }
    };
                     
    columns = [
            {
                title: '姓名',
                dataIndex: 'username',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'username'),
            },
            {
                title: '手机号',
                dataIndex: 'phone',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'phone'),
            },
            {
                title: '部门',
                dataIndex: 'departmentName',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'departmentName'),                
            },
        ];

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    showModal = () => {
        this.setState({visible: true});
        this.getDataMemberList();
    };

    getDataMemberList = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/admin/user/list',
            type: 'json',
            method: 'get',
            data: {
                departmentId: this.props.id,
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
                    this.setState({
                        data: json.data.list,
                        loading: false,
                        pagination: {
                            total: json.data.total,
                            current: this.state.pagination.current,
                            pageSize: this.state.pagination.pageSize
                        }
                    })
                    // const memberList = [];
                    // json.data.userList.forEach((item, index) => {
                    //     memberList.push({
                    //         id: item.id,
                    //         userId: item.userId,
                    //         departmentId: item.departmentId,
                    //         userName: item.userName,
                    //         // phone: item.phone || "暂无",
                    //         departmentName: item.departmentName
                    //     })
                    // })
                    // this.setState({
                    //     data: json.data.userList,
                    //     loading: false,
                    // })
                } else {
                    if (json.code === "901") {
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

    handleCancel = () => {
        this.setState({
            visible: false
        }, () => {
            this.setState({
                confirmLoading: false,
                loading: false,
            });
        })       
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
                url: '/menu/saveSysMenu',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    name: values.name,
                    parentId: this.props.id,
                    url: values.url,
                    type: 1
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("子部门添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                confirmLoading: false
                            });
                        });
                        this.props.recapture();
                    } else {
                        if (json.code === "901") {
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
            <a>
                <span onClick={() => this.showModal()}>{this.props.num}</span>
                <NumDetailForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    // onCreate={this.handleCreate}
                    confirmLoading={this.state.confirmLoading}
                    loading={this.state.loading}
                    data={this.state.data}
                    columns={this.columns}
                    pagination={this.pagination}
                />
            </a>
        );
    }
}

//部门信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="部门编辑"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                {
                    JSON.stringify(data) === "{}" ?
                        <div className="spin-box">
                            <Spin/>
                        </div>
                        :
                        <div className="institution-edit institution-form">
                            <Form layout="vertical">
                                <FormItem className="name" {...formItemLayout_14} label="部门名称：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.name,
                                        rules: [
                                        {
                                            required: true,
                                            message: '部门名称不能为空',
                                        },
                                        {
                                            max: 20,
                                            message: '部门名称最长10个字',
                                        }]
                                    })(
                                        <Input placeholder="请输入部门名称"/>
                                    )}
                                </FormItem>                                                      
                                <FormItem className="description" {...formItemLayout_14} label="部门描述：">
                                    {getFieldDecorator('description', {
                                        initialValue: data.description,
                                        rules: [{
                                            required: false,                             
                                            max: 600,
                                            message: '部门名称最长300个字',
                                        }]                                        
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写部门描述" rows={5}/>
                                    )}
                                </FormItem>                                
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

//部门信息编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,
        data: {},
        confirmLoading: false
    };

    getData = () => {
        reqwest({
            url: '/sys/department/getById',
            type: 'json',
            method: 'get',
            data: {
                id: this.props.id,
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
                        // data: json.data.sysMenu,
                        data: json.data.sysDepartment,
                    })
                } else {
                    if (json.code === "901") {
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
        const itemList = ["name", "parentId", "personInCharge", "description", "id"];
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
        this.setState({
            visible: false
        }, () => {
            this.setState({
                data: {},
                confirmLoading: false
            });
            form.resetFields();
        });
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
                url: '/sys/department/update',
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
                        message.success("部门信息编辑成功");
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
                        if (json.code === "901") {
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
}

//部门信息列表
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
                width: 70,
            },
            {
                title: '部门名称',
                dataIndex: 'name',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '部门成员',
                dataIndex: 'num',
                width: '15%',
                // render: (text, record) => this.renderColumns(text, record, 'num'),
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            <NumDetail id={record.id} parentId={record.parentId} num={record.num} recapture={this.getData}
                                        toLoginPage={this.props.toLoginPage}/>
                        </div>
                    )
                }
            },
            {
                title: '部门描述',
                dataIndex: 'description',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'description'),
            },
            {
                title: '更新时间',
                dataIndex: 'updateTime',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'updateTime'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*编辑*/}
                            <ItemEdit 
                                id={record.id} 
                                recapture={this.getData} 
                                opStatus={this.props.opObj.modify}
                                toLoginPage={this.props.toLoginPage}/>
                            {/*删除*/}
                            <Popconfirm 
                                title="确认删除?"
                                placement="topRight"
                                onConfirm={() => this.deleteItem(record.id)}
                                onCancel=""
                                okType="danger"
                                okText="立即删除"
                                cancelText="取消">
                                <a style={{display: this.props.opObj.delete ? "inline" : "none"}}>删除</a>
                            </Popconfirm>
                            {/*添加子部门*/}
                            <AddSubItem 
                                id={record.id} 
                                parentId={record.parentId} 
                                recapture={this.getData}
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

    // 日期处理函数
    dateHandle = (para) => {
        const tempDate = new Date(para.replace("CST", "GMT+0800")),
            oMonthT = (tempDate.getMonth() + 1).toString(),
            oMonth = oMonthT.length <= 1 ? "0" + oMonthT : oMonthT,
            oDayT = tempDate.getDate().toString(),
            oDay = oDayT.length <= 1 ? "0" + oDayT : oDayT,
            oYear = tempDate.getFullYear().toString(),
            oTime = oYear + '-' + oMonth + '-' + oDay;
        return oTime;
    };

    dateHandle02 = (para) => {
        const add0 = (m) => {
            return m < 10 ? '0' + m : m;
        }
        //shijianchuo是整数，否则要parseInt转换
        const time = new Date(para),
            y = time.getFullYear(),
            m = time.getMonth()+1,
            d = time.getDate();
        return y + '-' + add0(m) + '-' + add0(d);
    };

    // 部门列表处理函数
    dataHandle = (data) => {
        // 获取一级菜单列表（parentId为0的项）；
        const result = [];
        const fnFilter = (para) => {
            return para.sysDepartment.parentId === 0
        };
        data.filter(fnFilter).forEach((item, index) => {
            const temp = {
                key: item.sysDepartment.id,
                id: item.sysDepartment.id,
                parentId: item.sysDepartment.parentId,
                index: index + 1,
                name: item.sysDepartment.name,
                num: item.sysDepartment.num,
                description: item.sysDepartment.description,
                updateTime: item.sysDepartment.updateTime,
                children: item.children,
                userList: item.userList,
                // URL: item.url,
            };
            result.push(temp)
        });
        result.forEach((item) => {
            if (item.children) {
                item.children.forEach((subItem, subIndex) => {
                    subItem.updateTime = this.dateHandle(subItem.updateTime);
                    subItem.key = subItem.id;
                    subItem.index = subIndex + 1;
                });
            }
            
        });
        // 遍历一级菜单，生成所需要的权限菜单列表
        // result.forEach((item) => {
            // 获取当前一级菜单下属二级菜单列表，写入children属性
        //     const fnFilter__ = (para) => {
        //         return para.parentId === item.id
        //     };
        //     if (data.filter(fnFilter__).length) {
        //         item.children = [];
        //         data.filter(fnFilter__).forEach((subItem, subIndex) => {
        //             const temp = {
        //                 key: subItem.id,
        //                 id: subItem.id,
        //                 parentId: subItem.parentId,
        //                 index: subIndex + 1,
        //                 name: subItem.name,
        //                 num: subItem.num || 10,
        //                 description: subItem.description || "暂无相关描述",
        //                 // URL: subItem.url,
        //             };
        //             item.children.push(temp)
        //         })
        //     }
        // });
        return result;
    };

    //获取本页信息
    getData = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/department/list',
            type: 'json',
            method: 'get',
            data: {
                name: '',
                orgId: sessionStorage.orgId,
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize,
            },
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
                        // 对原始菜单列表进行处理后写入
                        data: this.dataHandle(json.data.list),
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

    //部门删除
    deleteItem = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/department/delete',
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
                    message.success("部门删除成功");
                    this.getData();
                } else {
                    if (json.code === "901") {
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

    //部门排序
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
                    if (json.code === "901") {
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
        return <Table bordered
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={this.state.pagination}
                      columns={this.columns}
                      onChange={this.handleTableChange}/>;
    }
}

class DepartmentManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {
                select: true,
                add: true,
                modify: true,
                delete: true
            },
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
                                部门列表
                                <div className="add-button" style={{float: "right"}}>
                                    {/*新增部门*/}
                                    <AddItem 
                                        opStatus={this.state.opObj.add} 
                                        setFlag={this.setFlag}
                                        toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            {/*部门列表*/}
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

export default DepartmentManage;