import React, {Component} from 'react';
import {
    Table,
    Input,
    Select,
    Button,
    Radio,
    message,
    Modal,
    Popconfirm,
    Form,
    TreeSelect,
} from 'antd';
import { accountList, addAccount, deleteAccount, updateAccount, accountDetail, ban, resetPwd, departmentList, roleList } from '../../config';
import { checkPhone, checkPassword } from '../../config/common';

const Search = Input.Search;
const {Option} = Select;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;

//栅格设置
const formItemLayout_8 = {
    labelCol: {span: 4},
    wrapperCol: {span: 8}
};
const formItemLayout_14 = {
    labelCol: {span: 4},
    wrapperCol: {span: 12},
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//新增账号表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, onChangeDepartment, departmentList, roleList, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 角色选项生成
        const optionsOfRoleList = [];
        if (roleList.length) {
            roleList.forEach((item, index) => {
                optionsOfRoleList.push(<Option key={index + 1} value={item.id}>{item.roleName}</Option>);
            }); 
        }                

        return (
            <Modal
                visible={visible}
                title="账号添加"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}>
                <div className="backUser-add backUser-form">
                    <Form layout="vertical">                       
                        <FormItem className="phone" {...formItemLayout_14} label="手机号码：">
                            {getFieldDecorator('phone', {
                                rules: [{
                                    required: true,
                                    validator: checkPhone
                                }]
                            })(
                                <Input placeholder="请填写手机号作为登录账号"/>
                            )}
                        </FormItem>
                        <FormItem className="password" {...formItemLayout_8} label="登录密码：">
                            {getFieldDecorator('password', {
                                rules: [{
                                    required: true,
                                    validator: checkPassword
                                }]
                            })(
                                <div style={{width: "100%"}}>
                                    <Input placeholder="8-16位字母与数字组合"/>                                    
                                </div>
                            )}
                        </FormItem>
                        <FormItem className="username" {...formItemLayout_14} label="员工姓名：">
                            {getFieldDecorator('username', {
                                rules: [{
                                    required: true,
                                    message: '姓名不能为空',
                                }]
                            })(
                                <Input placeholder="请输入姓名"/>
                            )}
                        </FormItem>
                        <FormItem className="gender" {...formItemLayout_14} label="员工性别：">
                            {getFieldDecorator('gender', {
                                initialValue: 1,
                                rules: [{
                                    required: false,
                                    message: '请选择性别',
                                }],
                            })(
                                <RadioGroup style={{marginTop: "5px"}}>
                                    <Radio value={0}>女</Radio>
                                    <Radio value={1}>男</Radio>                                    
                                </RadioGroup>
                            )}
                        </FormItem>                        
                        <FormItem className="departmentId" {...formItemLayout_14} label="所属部门：">
                            {getFieldDecorator('departmentId', {
                                rules: [{
                                    required: true,
                                    message: '部门不能为空',
                                }]
                            })(                               
                                <TreeSelect
                                    placeholder="请选择部门"
                                    dropdownStyle={{maxHeight: 400, overflow: "auto"}}
                                    allowClear
                                    treeData={departmentList}
                                    onChange={onChangeDepartment}
                                    showCheckedStrategy={TreeSelect.SHOW_CHILD}/>
                            )}
                        </FormItem>                       
                        <FormItem className="roleId" {...formItemLayout_14} label="当前角色：">
                            {getFieldDecorator('roleId', {
                                rules: [{
                                    required: true,
                                    message: '角色不能为空',
                                }]
                            })(
                                <Select                                   
                                    style={{width: '100%'}}
                                    placeholder="请选择角色">
                                    {optionsOfRoleList}
                                </Select>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        )
    }
);

//新增账号组件
class ItemAdd extends Component {
    state = {
        visible: false,
        // 账号所属部门值
        value: null,
        // 账号所属部门列表
        departmentList: [],
        // 账号可选角色列表
        roleList: [],
        loading: false
    };       

    // 部门列表departmentList写入（部门有子部门需要处理）
    getDepartmentList = (name) => {
        const params = {            
            name: name,
            pageNum: 1,
            pageSize: 20
        };        
        departmentList(params).then((json) => {
            if (json.data.result === 0) {
                const data = [];
                console.log(json.data.data.list)
                json.data.data.list.forEach((item) => {
                    let subData = [];
                    if (item.children) {
                        item.children.forEach((subItem) => {
                            subData.push({
                                key: subItem.id,
                                value: subItem.id,
                                title: subItem.name
                            })
                        })
                    }
                    data.push({
                        key: item.id,
                        value: item.id,
                        title: item.name,
                        children: subData
                    })
                });
                this.setState({
                    departmentList: data
                });                    
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {this.errorHandle(err);})
    };

    // 所属部门选择处理
    onChangeDepartment = (value) => {
        console.log(value);             
    };

    // 当前角色列表roleList写入
    getRoleList = (roleName) => {
        const params = {            
            roleName: roleName,
            pageNum: 1,
            pageSize: 10
        };
        roleList(params).then((json) => {
            if (json.data.result === 0) {
                this.setState({
                    roleList: json.data.data.list
                });
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {this.errorHandle();});
    };

    // 弹框控制
    showModal = () => {        
        this.getDepartmentList();// 获取账号可选所属部门列表        
        this.getRoleList();// 获取账号可选角色列表
        this.setState({visible: true})
    };

    // 取消
    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false,
        }, () => {
            this.setState({
                departmentList: [],
                roleList: [],
                loading: false
            });
            form.resetFields();
        });
    };

    // 添加
    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {            
            if (err) {return;}            
            this.setState({loading: true});
            console.log(values);          
            const data = {
                phone: values.phone,
                username: values.username,
                password: values.password,
                gender: values.gender,
                departmentId: values.departmentId,
                roleId: values.roleId
            };
            addAccount(data).then((json) => {
                if (json.data.result === 0) {
                    message.success("账号添加成功");
                    this.handleCancel();
                    this.props.setFlag();
                } else {
                    this.exceptHandle(json.data);
                }
            }).catch((err) => {this.errorHandle(err);});
        });
    };

    // 异常处理
    exceptHandle = (json) => {
        if (json.code === 901) {
            message.error("请先登录");            
            this.props.toLoginPage();// 返回登陆页
        } else if (json.code === 902) {
            message.error("登录信息已过期，请重新登录");
            
            this.props.toLoginPage();// 返回登陆页
        } else {
            message.error(json.message);
            this.setState({loading: false});
        }
    };
    
    // 错误处理
    errorHandle = (err) => {
        message.error("保存失败");
        this.setState({loading: false});
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button type="primary" onClick={this.showModal}>添加账号</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    value={this.state.value}
                    onChangeDepartment={this.onChangeDepartment}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    // resetPassword={this.resetPassword}                   
                    departmentList={this.state.departmentList}
                    roleList={this.state.roleList}
                    confirmLoading={this.state.loading}/>
            </div>
        )
    }
}

//账号编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, departmentList, roleList, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 可选角色列表写入
        const optionsOfRoleList = [];
        roleList.forEach((item, index) => {
            optionsOfRoleList.push(<Option key={index + 1} value={item.id}>{item.roleName}</Option>);
        });
        
        return (
            <Modal
                visible={visible}
                title="编辑账号"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}>
                <div className="backUser-edit backUser-form">
                    <Form layout="vertical">
                        <FormItem className="phone" {...formItemLayout_14} label="手机号码：">
                            {getFieldDecorator('phone', {
                                initialValue: data.phone,
                                rules: [{
                                    required: true,
                                    validator: checkPhone
                                }]
                            })(
                                <Input placeholder="请填写手机号作为登录账号"/>
                            )}
                        </FormItem>
                        <FormItem className="password" {...formItemLayout_8} label="登录密码：">
                            {getFieldDecorator('password' , {
                                initialValue: data.password,
                                rules: [{
                                    required: true,
                                    validator: checkPassword
                                }]
                            })(
                                <Input placeholder="8-16位字母与数字组合"/>                                   
                            )}
                        </FormItem>
                        <FormItem className="username" {...formItemLayout_14} label="员工姓名：">
                            {getFieldDecorator('username', {
                                initialValue: data.username,
                                rules: [{
                                    required: true,
                                    message: '姓名不能为空',
                                }]
                            })(
                                <Input placeholder="请输入姓名"/>
                            )}
                        </FormItem>
                        <FormItem className="gender" {...formItemLayout_14} label="员工性别：">
                            {getFieldDecorator('gender', {
                                initialValue: Number(data.gender) || 1,
                                rules: [{
                                    required: true,
                                    message: '请选择性别',
                                }],
                            })(
                                <RadioGroup style={{marginTop: "5px"}}>
                                    <Radio value={0}>女</Radio>
                                    <Radio value={1}>男</Radio>                                    
                                </RadioGroup>                                
                            )}
                        </FormItem>
                        <FormItem className="departmentId" {...formItemLayout_14} label="所属部门：">
                            {getFieldDecorator('departmentId', {
                                initialValue: data.departmentId || undefined,
                                rules: [{
                                    required: true,
                                    message: '部门不能为空',
                                }]
                            })(
                                <TreeSelect
                                    placeholder="请选择部门"
                                    dropdownStyle={{maxHeight: 400, overflow: "auto"}}
                                    treeData={departmentList}
                                    showCheckedStrategy={TreeSelect.SHOW_CHILD}/>
                            )}
                        </FormItem>                       
                        <FormItem className="roleId" {...formItemLayout_14} label="当前角色：">
                            {getFieldDecorator('roleId', {
                                initialValue: data.roleId || undefined,
                                rules: [{
                                    required: true,
                                    message: '角色不能为空',
                                }]
                            })(
                                <Select placeholder="请选择角色">
                                    {optionsOfRoleList}
                                </Select>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//账号编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,        
        data: {},      
        departmentList: [],       
        roleList: [],
        loading: false
    };

    // 账号当前角色列表写入
    getData = () => {
        accountDetail({id: this.props.id}).then((json) => {
            if (json.data.result === 0) {
                this.setState({data: json.data.data});
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {this.errorHandle();})
    };  

    // 账号可选所属部门列表写入
    getDepartmentList = (name) => {       
        const params = {                
            name: name,
            pageNum: 1,
            pageSize: 10,
        };
        departmentList(params).then((json) => {
            if (json.data.result === 0) {
                const data = [];
                json.data.data.list.forEach((item) => {
                    let subData = [];
                    if (item.children) {
                        item.children.forEach((subItem) => {
                            subData.push({
                                key: subItem.id,
                                value: subItem.id,
                                label: subItem.name
                            })
                        })
                    }
                    data.push({
                        key: item.id,
                        value: item.id,
                        label: item.name,
                        children: subData
                    })
                });
                this.setState({
                    departmentList: data
                });                     
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {this.errorHandle();});
    };

    // 账号可选角色列表写入
    getRoleList = (roleName) => {
        const params = {                
            roleName: '',
            pageNum: 1,
            pageSize: 15
        };       
        roleList(params).then((json) => {
            if (json.data.result === 0) {
                this.setState({
                    roleList: json.data.data.list
                })
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {this.errorHandle();});
    };

    showModal = () => {
        this.getDepartmentList();
        this.getRoleList(); 
        this.getData();
        this.setState({visible: true});
    };

    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false
        }, () => {
            this.setState({
                data: [],
                departmentList: [],
                roleList: [],
                loading: false
            });
            form.resetFields();
        })
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {return;}           
            const result = {
                id: this.props.id,
                phone: values.phone,
                password: values.password,
                username: values.username,
                gender: values.gender,
                departmentId: values.departmentId,
                roleId: values.roleId,
            };            
            this.setState({loading: true});
            updateAccount(result).then((json) => {
                if (json.data.result === 0) {
                    message.success("账号设置成功");
                    this.handleCancel();
                    this.props.recapture();
                } else {
                    this.exceptHandle(json.data);
                }
            }).catch((err) => {this.errorHandle();});
        })
    };

    // 异常处理
    exceptHandle = (json) => {
        if (json.code === 901) {
            message.error("请先登录");            
            this.props.toLoginPage();// 返回登陆页
        } else if (json.code === 902) {
            message.error("登录信息已过期，请重新登录");
            
            this.props.toLoginPage();// 返回登陆页
        } else {
            message.error(json.message);
            this.setState({loading: false});
        }
    };
    
    // 错误处理
    errorHandle = () => {
        message.error("保存失败");
        this.setState({loading: false});
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>编辑</span>
                <ItemEditForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    data={this.state.data}
                    departmentList={this.state.departmentList}
                    roleList={this.state.roleList}
                    confirmLoading={this.state.loading}/>
            </a>
        )
    }
}

//账号列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
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
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '姓名',
                dataIndex: 'name',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '性别',
                dataIndex: 'gender',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'gender'),
            },
            {
                title: '所属部门',
                dataIndex: 'department',
                width: '14%',
                render: (text, record) => this.renderColumns(text, record, 'department'),
            },
            {
                title: '当前角色',
                dataIndex: 'role',
                width: '14%',
                render: (text, record) => this.renderColumns(text, record, 'role'),
            },
            {
                title: '手机号',
                dataIndex: 'phone',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'phone'),
            },
            {
                title: '状态',
                dataIndex: 'status',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'status'),
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
                            {/*封禁启用*/}
                            <Popconfirm title={record.status === "启用" ? "确认禁用？" : "确认启用？"}
                                        placement="topRight"
                                        onConfirm={() => this.itemStatus(record.id, record.status)}
                                        onCancel=""
                                        okType="danger"
                                        okText="确认"
                                        cancelText="取消">
                                <a style={{display: this.props.opObj.ban ? "inline" : "none"}}>{record.status === "启用" ? "禁用" : "启用"}</a>
                            </Popconfirm>
                            {/*删除*/}
                            <Popconfirm title="确认删除?"
                                        placement="topRight"
                                        onConfirm={() => this.itemDelete(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="立即删除"
                                        cancelText="取消">
                                <a style={{display: this.props.opObj.delete ? "inline" : "none"}}>删除</a>
                            </Popconfirm>
                            {/*重置密码*/}
                            <Popconfirm title="确认重置密码?"
                                        placement="topRight"
                                        onConfirm={() => this.resetPassword(record.phone)}
                                        onCancel=""
                                        okType="danger"
                                        okText="立即重置"
                                        cancelText="取消">
                                <a style={{display: this.props.opObj.resetPassword ? "inline" : "none"}}>重置密码</a>
                            </Popconfirm>                
                        </div>
                    )
                }
            }
        ]
    };

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    };

    //获取本页信息
    getData = (keyword) => {
        this.setState({loading: true});
        const params = {
            keyword: keyword ? keyword.phoneAndName : this.props.keyword.phoneAndName,                
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize
        };
        accountList(params).then((json) => {
            const data = [];                
            if (json.data.result === 0) {
                if (json.data) {
                    if (json.data.data.list.length === 0 && this.state.pagination.current !== 1) {
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
                    json.data.data.list.forEach((item, index) => {                           
                        let tempGender = "";
                        if (item.gender === 0) {
                            tempGender = "女";
                        }
                        if (item.gender === 1) {
                            tempGender = "男";
                        }                        
                        let tempStatus = "";
                        if (item.status === 0) {
                            tempStatus = "禁用"
                        }
                        if (item.status === 1) {
                            tempStatus = "启用"
                        }                            
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            name: item.username,                                
                            gender: tempGender,
                            department: item.departmentName,
                            role: item.roleName,                           
                            phone: item.phone,
                            status: tempStatus,
                        })
                    })
                }
                this.setState({
                    loading: false,
                    data: data,
                    pagination: {
                        total: json.data.data.total,
                        current: this.state.pagination.current,
                        pageSize: this.state.pagination.pageSize
                    }
                });
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {
            this.errorHandle();
        });
    };

    //账号封禁与启用
    itemStatus = (id, status) => {
        this.setState({loading: true});
        ban({
            id: id,
            status: status === "启用" ? 0 : 1
        }).then((json) => {
             if (json.data.result === 0) {
                message.success(status === "启用" ? "账号封禁成功" : "账号启用成功");
                this.getData();
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {
            this.errorHandle();
        });
    };

    //账号删除
    itemDelete = (para) => {
        this.setState({loading: true});
        deleteAccount({id: para}).then((json) => {
            if (json.data.result === 0) {
                message.success("账号删除成功");
                this.getData();
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {
            this.errorHandle();
        });
    };

    // 重置密码
    resetPassword = (phone) => {
        resetPwd({phone: phone}).then((json) => {
            if (json.data.result === 0) {
                message.success('密码重置成功');
                this.getData();
            } else {
               this.exceptHandle(json.data);
            }
        }).catch((err) => {
            this.errorHandle();
        });
    };

    // 异常处理
    exceptHandle = (json) => {
        if (json.code === 901) {
            message.error("请先登录");            
            this.props.toLoginPage();// 返回登陆页
        } else if (json.code === 902) {
            message.error("登录信息已过期，请重新登录");
            
            this.props.toLoginPage();// 返回登陆页
        } else {
            message.error(json.message);
            this.setState({loading: false});
        }
    };
    
    // 错误处理
    errorHandle = () => {
        message.error("获取失败");
        this.setState({loading: false});
    };

    //页码变化处理
    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.backUserSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.backUserSize);
        this.setState({
            pagination: pager
        }, () => {
            this.getData();
        });
    };

    componentWillMount() {
        this.getData();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.keyword !== this.props.keyword) {
            this.getData(nextProps.keyword);
        }
        if (nextProps.flag_add !== this.props.flag_add) {
            this.getData();
        }
    };

    render() {
        return <Table 
                    bordered
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    columns={this.columns}
                    onChange={this.handleTableChange}/>
    }
}

class BackUsers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {
                select: true,
                add: true,
                modify: true,
                delete: true,
                resetPassword: true,
                ban: true,
            },
            // 获取信息列表所需关键词
            keyword: {
                phoneAndName: '',// 姓名、手机号
            },
            flag_add: false
        };
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
        });
    };

    // 关键词写入
    setKeyword = (value) => {
        console.log(value)
        this.setState({
            keyword: {                
                phoneAndName: value,
            }
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
            <div className="backUsers">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                <Search                                     
                                    onSearch={(value) => this.setKeyword(value)}
                                    enterButton
                                    style={{width: "320px",float: "left"}}
                                    placeholder="请输入姓名或手机号"/>
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd 
                                        opStatus={this.state.opObj.add} 
                                        setFlag={this.setFlag} 
                                        toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            <div className="table-box">
                                <DataTable 
                                    opObj={this.state.opObj} 
                                    keyword={this.state.keyword}
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

export default BackUsers;