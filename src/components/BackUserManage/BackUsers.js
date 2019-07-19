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
import '../../config/config.js';
import reqwest from 'reqwest';

const Search = Input.Search;
const {Option} = Select;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;

//栅格设置
const formItemLayout_8 = {
    labelCol: {span: 4},
    wrapperCol: {span: 8}
};
const formItemLayout_10 = {
    labelCol: {span: 4},
    wrapperCol: {span: 10}
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
        const {visible, onCancel, onCreate, form, orgList, checkPhone, checkPassword, handleSearch, handleChange, departmentList, onChangeDepartment, roleList, confirmLoading} = props;
        const {getFieldDecorator} = form;
        
        // 机构选项生成
        const optionsOfOrgList = [];
        orgList.forEach((item, index) => {
            optionsOfOrgList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
        });

        // 角色选项生成
        const optionsOfRoleList = [];
        roleList.forEach((item, index) => {
            optionsOfRoleList.push(<Option key={index + 1} value={item.role.id}>{item.role.roleName}</Option>);
        });        

        return (
            <Modal
                visible={visible}
                title="账号添加"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="backUser-add backUser-form">
                    <Form layout="vertical">
                        {/*账号类型项仅对机构管理员可见，其他登陆人默认写入自身账号类型*/}
                        <FormItem style={{display: Number(sessionStorage.EId) === 0 ? "block" : "none"}}
                                  className="adminType" {...formItemLayout_10} label="账号类型：">
                            {getFieldDecorator('adminType', {
                                rules: [{
                                    required: Number(sessionStorage.EId) === 0,
                                    message: '账号类型不能为空',
                                }]
                            })(
                                <Select
                                    style={{width: '100%'}}
                                    placeholder="请选择账号类型"
                                >
                                    <Option value={0}>超级管理员</Option>
                                    <Option value={1}>机构</Option>
                                    <Option value={2}>技术</Option>
                                    <Option value={3}>市场</Option>
                                    <Option value={4}>运营</Option>
                                    <Option value={5}>总经办</Option>
                                    <Option value={6}>妈董会</Option>
                                </Select>
                            )}
                        </FormItem>
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
                                <RadioGroup 
                                    style={{marginTop: "5px"}} 
                                    onChange={(e) => {}}>
                                    <Radio value={1}>男</Radio>
                                    <Radio value={0}>女</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem className="orgId" {...formItemLayout_14} label="所属机构：">
                            {getFieldDecorator('orgId', {                                
                                rules: [{
                                    required: true,
                                    message: '机构不能为空',
                                }]
                            })(
                                <Select
                                    showSearch
                                    style={{width: '100%'}}
                                    placeholder="请选择机构"
                                    onSearch={handleSearch}
                                    onChange={handleChange}                        
                                    filterOption={false}
                                    // optionFilterProp="children"
                                    notFoundContent={null} 
                                    // onSelect}
                                    // filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {optionsOfOrgList}
                                </Select>
                                // <TreeSelect
                                //     placeholder="请选择机构"
                                //     dropdownStyle={{maxHeight: 400, overflow: "auto"}}
                                //     allowClear
                                //     treeData={orgList}
                                //     onChange={onChangeOrg}
                                //     showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                // />
                            )}
                        </FormItem>
                        <FormItem className="departmentId" {...formItemLayout_14} label="所属部门：">
                            {getFieldDecorator('departmentId', {
                                rules: [{
                                    required: false,
                                    message: '部门不能为空',
                                }]
                            })(
                                // <Select
                                //     // mode="multiple"
                                //     style={{width: '100%'}}
                                //     placeholder="请选择部门"
                                // >
                                //     {optionsOfDepartmentList}
                                // </Select>
                                <TreeSelect
                                    placeholder="请选择部门"
                                    dropdownStyle={{maxHeight: 400, overflow: "auto"}}
                                    allowClear
                                    treeData={departmentList}
                                    onChange={onChangeDepartment}
                                    showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                />
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
                                    // mode="multiple"
                                    style={{width: '100%'}}
                                    placeholder="请选择角色"
                                >
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
        // 账号所属机构列表
        orgList: [],
        // 账号所属部门列表
        departmentList: [],
        // 账号可选角色列表
        roleList: [],
        confirmLoading: false
    };

    // 手机号校验
    checkPhone = (rule, value, callback) => {
        if (!value) {
            callback('手机号码不能为空'); // 校验不通过
            return false;
        } else {
            const isMob=/^1[0-9]{10}$/; // 格式已经包括长度校验了
            const valuePhone = value.trim(); // 去掉空格处理
            if (isMob.test(valuePhone)) { // 正则验证
                callback(); // 校验通过
                return true;
            } else {
                callback('请输入正确手机号'); // 校验不通过
                return false;
            }
        }
    };
    
    // 密码8-16位字母与数字校验
    checkPassword = (rule, value, callback) => {
        if (!value) {
            callback('密码不能为空');
            return false;
        } else {
            const isPwd = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/;
            if (isPwd.test(value)) {
                callback();
                return true;
            } else {
                callback("请输入8-16位字母与数字");
                return false;
            }
        }
    };

    // 根据输入机构名字模糊查找机构列表
    handleSearch = (value) => {
        console.log(value);
        reqwest({
            url: '/admin/org/list',
            type: 'json',
            method: 'get',
            data: {
                orgName: value,
                status: 2,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {},
            success: (json) => {
                if (json.result === 0) {
                    console.log(json.data.list)
                    const data = [];
                    if (json.data.list.length) {
                        json.data.list.forEach((item, index) => {
                            data.push({
                                id: item.id,
                                name: item.name,
                            })
                        });
                    }
                    this.setState({
                        orgList: data
                    });
                    // if (currentValue === value) {
                    //     const result = d.result;
                    //     const data = [];
                    //     result.forEach(r => {
                    //         data.push({
                    //             value: r[0],
                    //             text: r[0]
                    //         });
                    //     });
                    //     callback(data);
                    // }
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
                    }
                }
            }
        });
    };

    handleChange = (value) => {
        console.log(value)
        this.getDepartmentList(value);
        this.getRoleList(value);
    };

    // 机构列表departmentList写入（部门有子部门需要处理）
    getOrgList = () => {
        reqwest({
            url: '/admin/org/list',
            type: 'json',
            method: 'get',
            data: {
                status: 2
            },
            headers: {
                Authorization: sessionStorage.token
            },           
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: [
                //         {id: 1, roleName: ""},
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    // const data = [];
                    // json.data.forEach((item) => {
                    //     let subData = [];
                    //     if (item.list) {
                    //         item.list.forEach((subItem) => {
                    //             subData.push({
                    //                 key: subItem.id,
                    //                 value: String(subItem.id),
                    //                 label: subItem.name
                    //             })
                    //         })
                    //     }
                    //     data.push({
                    //         key: item.id,
                    //         value: String(item.id),
                    //         label: item.name,
                    //         children: subData
                    //     })
                    // });
                    this.setState({
                        orgList: json.data.list
                    });                    
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
        })
    };

    onChangeOrg =(value) => {
        console.log(value);
        this.getDepartmentList(value);
        this.getRoleList(value);
    };

    // 部门列表departmentList写入（部门有子部门需要处理）
    getDepartmentList = (orgId) => {
        reqwest({
            url: '/sys/department/list',
            type: 'json',
            method: 'get',
            data: { 
                orgId: orgId,
                name: '',
                pageNum: 1,
                pageSize: 10,
            },           
            headers: {
                Authorization: sessionStorage.token
            },           
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: [
                //         {id: 1, roleName: ""},
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    const data = [];
                    json.data.list.forEach((item) => {
                        let subData = [];
                        if (item.children) {
                            item.children.forEach((subItem) => {
                                subData.push({
                                    key: subItem.id,
                                    value: String(subItem.id),
                                    title: subItem.name
                                })
                            })
                        }
                        data.push({
                            key: item.sysDepartment.id,
                            value: String(item.sysDepartment.id),
                            title: item.sysDepartment.name,
                            children: subData
                        })
                    });
                    this.setState({
                        departmentList: data
                    });                    
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
        })
    };

    // 所属部门选择处理
    onChangeDepartment = (value) => {
        console.log(value);
        // if (value) {
        //     this.getRoleList(value);
        // } else {
        //     this.setState({
        //         roleList: [],
        //     })
        // }        
    };

    // 当前角色列表roleList写入
    getRoleList = (orgId) => {
        reqwest({
            url: '/admin/role/getRolePage',
            type: 'json',
            method: 'get',
            data: {
                pageNum: 1,
                pageSize: 10,
                roleName: '',
                orgId: orgId,
            },
            headers: {
                Authorization: sessionStorage.token
            },            
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: [
                //         {id: 1, roleName: ""},
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        roleList: json.data.list
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
        })
    };

    // 弹框控制
    showModal = () => {
        // 获取账号可选所属机构列表
        this.handleSearch();
        // this.getOrgList();
        // 获取账号可选所属部门列表
        // this.getDepartmentList();
        // 获取账号可选角色列表
        this.getRoleList();
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
                confirmLoading: false
            });
            form.resetFields();
        });
    };

    // 添加
    handleCreate = () => {
        const form = this.form;
        console.log("handleCreate--add")
        form.validateFields((err, values) => {
            console.log(err)
            console.log("error")
            if (err) {
                console.log("error--12")
                return;
            }
            console.log("success--22")
            // 非系统管理员账号类型项写入
            // if (Number(sessionStorage.EId) === 1) {
            //     values.adminType = 6
            // }
            // if (Number(sessionStorage.EId) > 1) {
            //     values.adminType = 1
            // }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/admin/user/save',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    // adminType: values.adminType,
                    phone: values.phone,
                    username: values.username,
                    password: values.password,
                    gender: values.gender,
                    orgId: values.orgId,                    
                    departmentId: values.departmentId,
                    roleId: values.roleId,
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("账号添加成功");
                        this.setState({
                            visible: false,
                        }, () => {
                            this.setState({
                                departmentList: [],
                                roleList: [],
                                confirmLoading: false
                            });
                        });
                        this.props.setFlag()
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
            })
        })
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
                    checkPhone={this.checkPhone}
                    checkPassword={this.checkPassword}
                    onChangeOrg={this.onChangeOrg}
                    onChangeDepartment={this.onChangeDepartment}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    resetPassword={this.resetPassword}
                    handleSearch={this.handleSearch}
                    handleChange={this.handleChange}
                    orgList={this.state.orgList}
                    departmentList={this.state.departmentList}
                    roleList={this.state.roleList}
                    confirmLoading={this.state.confirmLoading}
                />
            </div>
        )
    }
}

//账号编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, checkPhone, checkPassword, handleChange, handleSearch, orgList, departmentList, roleList, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 可选所属部门列表写入
        const optionsOfOrgList = [];
        if (orgList) {
             orgList.forEach((item, index) => {                
                optionsOfOrgList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
            });
        }       

        // 可选所属部门列表写入
        // const optionsOfDepartmentList = [];
        // departmentList.forEach((item, index) => {
        //     // optionsOfDepartmentList.push(<Option key={index + 1} value={item.id}>{item.departmentName}</Option>);
        //     optionsOfDepartmentList.push(<Option key={index + 1} value={item.sysDepartment.id}>{item.sysDepartment.name}</Option>);
        // });

        // 可选角色列表写入
        const optionsOfRoleList = [];
        roleList.forEach((item, index) => {
            optionsOfRoleList.push(<Option key={index + 1} value={item.role.id}>{item.role.roleName}</Option>);
        });
        
        return (
            <Modal
                visible={visible}
                title="编辑账号"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
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
                                initialValue: data.gender || 0,
                                rules: [{
                                    required: false,
                                    message: '请选择性别',
                                }],
                            })(
                                <RadioGroup style={{marginTop: "5px"}}>
                                    <Radio value={1}>男</Radio>
                                    <Radio value={0}>女</Radio>
                                </RadioGroup>                                
                            )}
                        </FormItem>
                        <FormItem className="orgId" {...formItemLayout_14} label="所属机构：">
                            {getFieldDecorator('orgId', {
                                initialValue: data.orgId,
                                rules: [{
                                    required: true,
                                    message: '机构不能为空',
                                }]
                            })(
                                <Select
                                    showSearch
                                    style={{width: '100%'}}
                                    placeholder="请选择机构"
                                    onSearch={handleSearch}
                                    onChange={handleChange}
                                    filterOption={false}
                                    notFoundContent={null}
                                >
                                    {optionsOfOrgList}
                                </Select>
                                // <TreeSelect
                                //     placeholder="请选择机构"
                                //     dropdownStyle={{maxHeight: 400, overflow: "auto"}}
                                //     allowClear
                                //     treeData={orgList}
                                //     showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                // />
                            )}
                        </FormItem>
                        <FormItem className="departmentId" {...formItemLayout_14} label="所属部门：">
                            {getFieldDecorator('departmentId', {
                                initialValue: data.departmentId || undefined,
                                rules: [{
                                    required: false,
                                    message: '部门不能为空',
                                }]
                            })(
                                // <Select
                                //     // mode="multiple"
                                //     style={{width: '100%'}}
                                //     placeholder="请选择部门"
                                // >
                                //     {optionsOfDepartmentList}
                                // </Select>
                                <TreeSelect
                                    placeholder="请选择部门"
                                    dropdownStyle={{maxHeight: 400, overflow: "auto"}}
                                    treeData={departmentList}
                                    showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                />
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
        // 账号当前岗位列表
        data: {},
        orgList: [],
        // 账号可选所属部门列表
        departmentList: [],
        // 账号可选角色列表
        roleList: [],
        confirmLoading: false
    };

    // 手机号校验
    checkPhone = (rule, value, callback) => {
        if (!value) {
            callback('手机号码不能为空'); // 校验不通过
            return false;
        } else {
            const isMob=/^1[0-9]{10}$/; // 格式已经包括长度校验了
            const valuePhone = value.trim(); // 去掉空格处理
            if (isMob.test(valuePhone)) { // 正则验证
                callback(); // 校验通过
                return true;
            } else {
                callback('请输入正确手机号'); // 校验不通过
                return false;
            }
        }
    };

    // 密码8-16位字母与数字校验
    checkPassword = (rule, value, callback) => {
        if (!value) {
            callback('密码不能为空');
            return false;
        } else {
            const isPwd = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/;
            if (isPwd.test(value)) {
                callback();
                return true;
            } else {
                callback("请输入8-16位字母与数字");
                return false;
            }
        }        
    };

    // 账号当前岗位列表写入
    getData = () => {
        reqwest({
            url: '/admin/user/getById',
            type: 'json',
            method: 'get',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: this.props.id,
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: [
                //         {id: 1, roleName: ""},
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    // const tempData = [];
                    // json.data.forEach((item) => {
                    //     tempData.push(item.id)
                    // });
                    const tempData = {
                        id: json.data.id,
                        phone: json.data.phone,
                        username: json.data.username,
                        orgId: json.data.orgId,
                        gender: json.data.gender,
                        departmentName: json.data.departmentName,
                        departmentId: json.data.departmentId,
                        roleId: json.data.sysRole && json.data.sysRole.id ? json.data.sysRole.id : "",
                        orgCode: json.data.orgCode,
                    };
                    console.log(tempData)
                    // console.log(json.data);
                    this.setState({
                        data: tempData,
                    }, () => {
                        // 所属机构查询
                        this.handleSearch(json.data.orgName);
                        this.getDepartmentList(json.data.orgId);
                        this.getRoleList(json.data.orgId);
                    })
                    // this.getOrgList(json.data.orgId);
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
                    }
                }
            }
        })
    };

    // 所属机构按姓名模糊查找
    handleSearch = (value) => {
        console.log(value);
        reqwest({
            url: '/admin/org/list',
            type: 'json',
            method: 'get',
            data: {
                orgName: value,
                status: 2,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {},
            success: (json) => {
                if (json.result === 0) {
                    console.log(json.data.list)
                    const data = [];
                    if (json.data.list.length) {
                        json.data.list.forEach((item, index) => {
                            data.push({
                                id: item.id,
                                name: item.name,
                            })
                        });
                    }
                    this.setState({
                        orgList: data
                    });
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
                    }
                }
            }
        });
    };

    handleChange = (value) => {
        console.log(value);
        this.getDepartmentList(value);
        this.getRoleList(value);  
    };
    // 账号可选所属机构列表写入
    getOrgList = () => {
        reqwest({
            url: '/admin/org/list',
            type: 'json',
            method: 'get',
            data: {                
                status: 2
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         size: 100,
                //         list: [
                //             {id: 1, roleName: ""},
                //         ]
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    // const data = [];
                    // json.data.forEach((item) => {
                    //     let subData = [];
                    //     if (item.list) {
                    //         item.list.forEach((subItem) => {
                    //             subData.push({
                    //                 key: subItem.id,
                    //                 value: String(subItem.id),
                    //                 label: subItem.name
                    //             })
                    //         })
                    //     }
                    //     data.push({
                    //         key: item.id,
                    //         value: String(item.id),
                    //         label: item.name,
                    //         children: subData
                    //     })
                    // });
                    this.setState({
                       orgList: json.data.list
                    });                     
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
        })
    };

    // 账号可选所属部门列表写入
    getDepartmentList = (orgId) => {
        reqwest({
            url: '/sys/department/list',
            type: 'json',
            method: 'get',
            data: {                
                name: "",
                pageNum: 1,
                pageSize: 10,
                orgId: orgId,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         size: 100,
                //         list: [
                //             {id: 1, roleName: ""},
                //         ]
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    const data = [];
                    json.data.list.forEach((item) => {
                        let subData = [];
                        if (item.children) {
                            item.children.forEach((subItem) => {
                                subData.push({
                                    key: subItem.id,
                                    value: String(subItem.id),
                                    label: subItem.name
                                })
                            })
                        }
                        data.push({
                            key: item.sysDepartment.id,
                            value: String(item.sysDepartment.id),
                            label: item.sysDepartment.name,
                            children: subData
                        })
                    });
                    this.setState({
                        departmentList: data
                    });                     
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
        })
    };

    // 账号可选角色列表写入
    getRoleList = (orgId) => {
        reqwest({
            url: '/admin/role/getRolePage',
            type: 'json',
            method: 'get',
            data: {
                orgId: orgId,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         size: 100,
                //         list: [
                //             {id: 1, roleName: ""},
                //         ]
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        roleList: json.data.list
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
        })
    };

    onChangeOrg =(value) => {
        console.log(value);
        this.getDepartmentList(value);
        this.getRoleList(value);       
    };

    showModal = () => {
        // 所属机构按姓名模糊查找 先显示十条
        this.handleSearch();
        // this.getOrgList();
        this.getData();        
        // this.getDepartmentList();
        // this.getRoleList();
        this.setState({
            visible: true,
        });
    };

    // 信息比对函数
    dataContrast = (values) => {
        const initValues = this.state.data;
        // console.log(initValues);
        // console.log(values);
        const result = {};
        if (values.phone !== initValues.phone) {
            result.phone = values.phone;
        }
        if (values.password !== initValues.password) {
            result.password = values.password;
        }
        if (values.username !== initValues.username) {
            result.username = values.username;
        }
        if (values.gender !== initValues.gender) {
            result.gender = values.gender;
        }
        // if (values.orgId.sort().toString() !== initValues.toString()) {
        if (values.orgId !== initValues.orgId) {
            result.orgId = values.orgId;
        }
        if (values.departmentId !== initValues.departmentId) {
            result.departmentId = values.departmentId;
        }
        // if (values.roleId.sort().toString() !== initValues.toString()) {
        if (values.roleId !== initValues.roleId ) {
            result.roleId = values.roleId;
        }
       
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
                data: [],
                departmentList: [],
                roleList: [],
                confirmLoading: false
            });
            form.resetFields();
        })
    };

    handleCreate = () => {
        const form = this.form;
        console.log("handleCreate---");
        form.validateFields((err, values) => {
            console.log(23434234234)
            console.log(err);
            console.log(values);
            if (err) {
                console.log("error")
                return;
            }
            console.log("suc-21232")
            // value与初始data进行比对，得到修改项集合
            // const result = this.dataContrast(values);
            // console.log(result);
            const result = {
                id: this.props.id,
                phone: values.phone,
                password: values.password,
                username: values.username,
                gender: values.gender,
                orgId: values.orgId,
                departmentId: values.departmentId,
                roleId: values.roleId,
            }
            if (!result) {
                // 修改项为空则直接return
                message.error("暂无信息更改，无法提交");
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/admin/user/update',
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
                        message.success("账号设置成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                data: [],
                                roleList: [],
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
            })
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
                    checkPhone={this.checkPhone}
                    checkPassword={this.checkPassword}
                    onChangeOrg={this.onChangeOrg}
                    handleChange={this.handleChange}
                    handleSearch={this.handleSearch}
                    orgList={this.state.orgList}
                    departmentList={this.state.departmentList}
                    roleList={this.state.roleList}
                    confirmLoading={this.state.confirmLoading}
                />
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
        this.setState({
            loading: true
        });
        // reqwest({
        //     url: '/admin/org/list',
        //     type: 'json',
        //     method: 'get',
        //     data: {
        //         // 机构类型
        //         typeId: this.state.type,
        //         // 机构状态
        //         status: this.state.status,
        //         // 机构名称
        //         orgName: keyword ? keyword.educationName : this.props.keyword.educationName,
        //         // 城市
        //         cityCode: keyword ? keyword.cityCode : this.props.keyword.cityCode,
        //         startTime: keyword ? keyword.startTime : this.props.keyword.startTime,
        //         endTime: keyword ? keyword.endTime : this.props.keyword.endTime,
        //         pageNum: this.state.pagination.current,
        //         pageSize: this.state.pagination.pageSize,
        //     },
        //     headers: {
        //         Authorization: sessionStorage.token
        //     },
        //     error: (XMLHttpRequest) => {
        //         message.error("获取失败");
        //         this.setState({
        //             loading: false
        //         })
        //         // const json = {
        //         //     result: 0,
        //         //     data: {
        //         //         size: 100,
        //         //         list: [
        //         //             {id: 1, status: 2},
        //         //             {id: 2, status: 2},
        //         //         ]
        //         //     }
        //         // };
        //     },
        //     success: (json) => {
        //         const data = [];
        //         if (json.result === 0) {
        //             if (json.data.list.length === 0 && this.state.pagination.current !== 1) {
        //                 this.setState({
        //                     pagination: {
        //                         current: 1,
        //                         pageSize: this.state.pagination.pageSize
        //                     }
        //                 }, () => {
        //                     this.getData();
        //                 });
        //                 return
        //             }
        //             json.data.list.forEach((item, index) => {
        //                 const fnFilter = (para) => {
        //                     return para.id === item.id
        //                 };
        //                 const tempShopStatus = json.data.shopStatus ? json.data.shopStatus.filter(fnFilter)[0].shopStatus : 1;
        //                 let tempStatus = "";
        //                 if (item.status === 1) {
        //                     tempStatus = "审核中"
        //                 }
        //                 if (item.status === 2) {
        //                     tempStatus = "启用"
        //                 }
        //                 if (item.status === 3) {
        //                     tempStatus = "审核失败"
        //                 }
        //                 if (item.status === 0) {
        //                     tempStatus = "禁用"
        //                 }
        //                 data.push({
        //                     key: index.toString(),
        //                     id: item.id,
        //                     educationKey: item.educationKey,
        //                     index: index + 1,
        //                     sort: item.sort !== 0 ? item.sort : "",
        //                     photo: item.orgPath,
        //                     name: item.name,
        //                     // address: item.areaName,
        //                     address: item.provinceName + item.cityName + item.areaName + item.street,
        //                     // typeName: (item.typeName || "") + (item.typeNameTwo ? ("/" + item.typeNameTwo) : "") + (item.typeNameThree ? ("/" + item.typeNameThree) : ""),
        //                     typeName: item.typeNameStr || "暂无",
        //                     managerName: item.managerName,
        //                     telephone: item.telephone,
        //                     subscribeNumber: item.subscribeNumber || 10,
        //                     managerPhone: item.managerPhone,
        //                     createUserName: item.createUserName,
        //                     shopStatus: tempShopStatus,
        //                     createTime: item.createTime ? this.dateHandle(item.createTime) : "",
        //                     statusCode: item.status,
        //                     status: tempStatus
        //                 });
        //             });
        //             this.setState({
        //                 loading: false,
        //                 data: data,
        //                 pagination: {
        //                     total: json.data.total,
        //                     current: this.state.pagination.current,
        //                     pageSize: this.state.pagination.pageSize
        //                 }
        //             });
        //         } else {
        //             if (json.code === 901) {
        //                 message.error("请先登录");
        //                 // 返回登陆页
        //                 this.props.toLoginPage();
        //             } else if (json.code === 902) {
        //                 message.error("登录信息已过期，请重新登录");
        //                 // 返回登陆页
        //                 this.props.toLoginPage();
        //             } else {
        //                 message.error(json.message);
        //                 this.setState({
        //                     loading: false
        //                 })
        //             }
        //         }
        //     }
        // });
        reqwest({
            url: '/admin/user/list',
            type: 'json',
            method: 'get',
            data: {
                // type: keyword ? keyword.type : this.props.keyword.type,
                phone: keyword ? keyword.phone : this.props.keyword.phone,
                memberName: keyword ? keyword.memberName : this.props.keyword.memberName,
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
                });
            },
            success: (json) => {
                const data = [];
                // 过滤器，用于从账号列表中过滤当前登录人账号
                // const fnFilter = (para) => {
                //     return para.id !== Number(sessionStorage.id)
                // };
                if (json.result === 0) {
                    if (json.data) {
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
                        json.data.list.forEach((item, index) => {
                            // let tempRole = "";
                            // if (item.roleList) {
                            //     item.roleList.forEach((roleItem) => {
                            //         tempRole += roleItem.roleName + " "
                            //     });
                            //     tempRole = tempRole.slice(0, -1)
                            // }
                            let tempGender = "";
                            if (item.gender === 1) {
                                tempGender = "男";
                            }
                            if (item.gender === 0) {
                                tempGender = "女";
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
                                // role: item.roleListString || "暂无",
                                phone: item.phone,
                                status: tempStatus,
                            })
                        })
                    }
                    this.setState({
                        loading: false,
                        data: data,
                        pagination: {
                            total: json.data.total,
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

    //账号封禁与启用
    itemStatus = (id, status) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/admin/user/ban',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: id,
                status: status === "启用" ? 0 : 1
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success(status === "启用" ? "账号封禁成功" : "账号启用成功");
                    this.getData();
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

    //账号删除
    itemDelete = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/admin/user/delete?id='+para,
            type: 'json',
            method: 'delete',
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
                    message.success("账号删除成功");
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

    // 重置密码
    resetPassword = (phone) => {
        console.log(88888888);
        reqwest({
            url: '/admin/user/resetPassword',
            type: 'json',
            method: 'post',
            data: {
                phone: phone,
                code: '1234',
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: [
                //         {id: 1, roleName: ""},
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success('密码重置成功');
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
                    }
                }
            }
        })              
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
        })
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
        return <Table bordered
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
                // 账号类型
                type: Number(sessionStorage.EId) === 0 ? null : Number(sessionStorage.adminType),
                // 手机号
                phone: '',
                // 员工姓名
                memberName: '',
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
    setKeyword = (type, value) => {
        if (type === 1) {
            if (value !== this.state.keyword.type) {
                this.setState({
                    keyword: {
                        type: value,
                        phone: this.state.keyword.phone,
                        memberName: this.state.keywork.memberName,
                    }
                })
            }
        }
        if (type === 2) {
            if (value !== this.state.keyword.phone) {
                this.setState({
                    keyword: {
                        type: this.state.keyword.type,
                        phone: value,
                        memberName: value,
                    }
                })
            }
        }
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
                                {/*超级管理员可进行账号类型筛选*/}
                                <Select 
                                    defaultValue="全部"
                                    style={{
                                        display: Number(sessionStorage.adminType) === 0 ? "block" : "none",
                                        width: "150px",
                                        float: "left",
                                        marginRight: "20px"
                                    }}
                                    onChange={(value) => this.setKeyword(1, value)}
                                >
                                    <Option value={null}>全部</Option>
                                    <Option value={0}>超级管理员</Option>
                                    <Option value={1}>机构</Option>
                                    <Option value={2}>技术</Option>
                                    <Option value={3}>市场</Option>
                                    <Option value={4}>运营</Option>
                                    <Option value={5}>总经办</Option>
                                    <Option value={6}>妈董会</Option>
                                </Select>
                                <Search 
                                    placeholder="请输入姓名或手机号"
                                    onSearch={(value) => this.setKeyword(2, value)}
                                    enterButton
                                    style={{
                                        width: "320px",
                                        float: "left",
                                    }}
                                />
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