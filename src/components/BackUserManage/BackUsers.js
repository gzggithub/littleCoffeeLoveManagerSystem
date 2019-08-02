import React, {Component} from 'react';
import {
    Table,
    Input,
    Select,
    Button,
    message,
    Modal,
    Popconfirm,
    Form,
    TreeSelect,
} from 'antd';
// import { accountList, addAccount, deleteAccount, updateAccount, accountDetail, ban, resetPwd, departmentList, roleList } from '../../config';
// import { getPower, toLoginPage, checkPhone, checkPassword, genderOptions, genderStatus, banStatus, pagination, handleTableChange, exceptHandle, errorHandle } from '../../config/common';
import * as common from '../../config/common';
import * as config from '../../config';

const Search = Input.Search;
const {Option} = Select;
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
        const {visible, onCancel, onCreate, form, departmentList, roleList, confirmLoading} = props;
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
                                    validator: common.checkPhone
                                }]
                            })(
                                <Input placeholder="请填写手机号作为登录账号"/>
                            )}
                        </FormItem>
                        <FormItem className="password" {...formItemLayout_8} label="登录密码：">
                            {getFieldDecorator('password', {
                                rules: [{
                                    required: true,
                                    validator: common.checkPassword
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
                                <Select style={{marginTop: "5px"}}>{common.genderOptions}</Select>
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
                                <Select style={{width: '100%'}} placeholder="请选择角色">
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
        departmentList: [],// 账号所属部门列表        
        roleList: [],// 账号可选角色列表
        loading: false
    };       

    // 部门列表departmentList写入（部门有子部门需要处理）
    getDepartmentList = (name) => {
        const params = {            
            name: name,
            pageNum: 1,
            pageSize: 20
        };        
        config.departmentList(params).then((json) => {
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
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    // 当前角色列表roleList写入
    getRoleList = (roleName) => {
        const params = {            
            roleName: roleName,
            pageNum: 1,
            pageSize: 10
        };
        config.roleList(params).then((json) => {
            if (json.data.result === 0) {
                this.setState({
                    roleList: json.data.data.list
                });
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
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
            config.addAccount(data).then((json) => {
                if (json.data.result === 0) {
                    message.success("账号添加成功");
                    this.handleCancel();
                    this.props.setFlag();
                } else {
                    common.exceptHandle(this, json.data);
                }
            }).catch((err) => common.errorHandle(this, err));
        });
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
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}                    
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
                                    validator: common.checkPhone
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
                                    validator: common.checkPassword
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
                                initialValue: data.gender,
                                rules: [{
                                    required: false,
                                    message: '请选择性别',
                                }],
                            })(
                                <Select style={{marginTop: "5px"}}>{common.genderOptions}</Select>                                
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
                                <Select placeholder="请选择角色">{optionsOfRoleList}</Select>
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
        config.accountDetail({id: this.props.id}).then((json) => {
            if (json.data.result === 0) {
                this.setState({data: json.data.data});
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };  

    // 账号可选所属部门列表写入
    getDepartmentList = (name) => {       
        const params = {                
            name: name,
            pageNum: 1,
            pageSize: 10,
        };
        config.departmentList(params).then((json) => {
            if (json.data.result === 0) {
                const data = [];
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
                this.setState({departmentList: data});                     
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    // 账号可选角色列表写入
    getRoleList = (roleName) => {
        const params = {                
            roleName: '',
            pageNum: 1,
            pageSize: 15
        };       
        config.roleList(params).then((json) => {
            if (json.data.result === 0) {
                this.setState({
                    roleList: json.data.data.list
                })
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
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
            config.updateAccount(result).then((json) => {
                if (json.data.result === 0) {
                    message.success("账号设置成功");
                    this.handleCancel();
                    this.props.recapture();
                } else {
                    common.exceptHandle(this, json.data);
                }
            }).catch((err) => common.errorHandle(this, err));
        })
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
            pagination: common.pagination
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
            // {
            //     title: '状态',
            //     dataIndex: 'status',
            //     width: '8%',
            //     render: (text, record) => this.renderColumns(text, record, 'status'),
            // },
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

    dataHandle = (data) => {
        const result = [];
        data.forEach((item, index) => {
            result.push({
                key: index.toString(),
                id: item.id,
                index: index + 1,
                name: item.username,                                
                gender: common.genderStatus(item.gender),
                department: item.departmentName,
                role: item.roleName,                           
                phone: item.phone,
                status: common.banStatus(item.status)
            })
        });
        return result;
    };

    //获取本页信息
    getData = (keyword) => {
        this.setState({loading: true});
        const params = {
            keyword: keyword ? keyword.phoneAndName : this.props.keyword.phoneAndName,                
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize
        };
        config.accountList(params).then((json) => {             
            if (json.data.result === 0) {
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
                this.setState({
                    loading: false,
                    data: this.dataHandle(json.data.data.list),
                    pagination: {
                        total: json.data.data.total,
                        current: this.state.pagination.current,
                        pageSize: this.state.pagination.pageSize
                    }
                });
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    //账号封禁与启用
    itemStatus = (id, status) => {
        this.setState({loading: true});
        config.ban({
            id: id,
            status: status === "启用" ? 0 : 1
        }).then((json) => {
             if (json.data.result === 0) {
                message.success(status === "启用" ? "账号封禁成功" : "账号启用成功");
                this.getData();
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    //账号删除
    itemDelete = (para) => {
        this.setState({loading: true});
        config.deleteAccount({id: para}).then((json) => {
            if (json.data.result === 0) {
                message.success("账号删除成功");
                this.getData();
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    // 重置密码
    resetPassword = (phone) => {
        config.resetPwd({phone: phone}).then((json) => {
            if (json.data.result === 0) {
                message.success('密码重置成功');
                this.getData();
            } else {
               common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
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
                    onChange={(pagination) => common.handleTableChange(this, pagination)}/>
    }
}

class BackUsers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            // 获取信息列表所需关键词
            keyword: {
                phoneAndName: '',// 姓名、手机号
            },
            flag_add: false
        };
    };

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
        this.setState({opObj: common.getPower(this).data});
    };

    // 关键词写入
    setKeyword = (value) => {
        this.setState({keyword: { phoneAndName: value}});
    };

    setFlag = () => {
        this.setState({flag_add: !this.state.flag_add});
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
        console.log(this.state.opObj);
        return (
            <div className="backUsers">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                <Search                                     
                                    onSearch={(value) => this.setKeyword(value)}
                                    enterButton allowClear
                                    style={{width: "320px",float: "left"}}
                                    placeholder="请输入姓名或手机号"/>
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd 
                                        opStatus={this.state.opObj.add} 
                                        setFlag={this.setFlag} 
                                        toLoginPage={() => common.toLoginPage(this)}/>
                                </div>
                            </header>
                            <div className="table-box">
                                <DataTable 
                                    opObj={this.state.opObj} 
                                    keyword={this.state.keyword}
                                    flag_add={this.state.flag_add} 
                                    toLoginPage={() => common.toLoginPage(this)}/>
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