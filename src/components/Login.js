import React, {Component} from 'react';
import {Form, Icon, Input, Button, Modal, Checkbox, Tooltip, message} from 'antd';
import '../config/config.js';
import reqwest from 'reqwest';
import logo from "../static/images/logo.png";



const FormItem = Form.Item;
const confirm = Modal.confirm;

//栅格设置
const formItemLayout_8 = {
    labelCol: {span: 4},
    wrapperCol: {span: 8},
};
const formItemLayout_10 = {
    labelCol: {span: 4},
    wrapperCol: {span: 10},
};
const formItemLayout_12 = {
    labelCol: {span: 4},
    wrapperCol: {span: 12},
};

//找回密码表单
const ResetPasswordForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, countDown, codeButtonStatus, getCode, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return <Modal
            visible={visible}
            title="找回密码"
            width={600}
            onCancel={onCancel}
            onOk={onCreate}
            destroyOnClose={true}
            confirmLoading={confirmLoading}
        >
            <div className="resetPassword">
                <Form layout="vertical">
                    <FormItem className="phone" {...formItemLayout_8} label="手机号码：">
                        {getFieldDecorator('phone', {
                            rules: [{
                                required: true,
                                message: '手机号码不能为空',
                            }],
                        })(
                            <Input placeholder="请输入手机号码"/>
                        )}
                    </FormItem>
                    <FormItem className="codeButton" {...formItemLayout_12}>
                        <Button style={{float: "right", width: "100px"}}
                                type="primary"
                                onClick={getCode}
                        >
                            {codeButtonStatus ? countDown + "s后重发" : "获取验证码"}
                        </Button>
                    </FormItem>
                    <FormItem className="code" {...formItemLayout_8} label="验证码：">
                        {getFieldDecorator('code', {
                            rules: [{
                                required: true,
                                message: '短信验证码不能为空',
                            }],
                        })(
                            <Input placeholder="请输入短信验证码"/>
                        )}
                    </FormItem>
                    <FormItem className="userKey unnecessary" {...formItemLayout_8} label="用户名：">
                        {getFieldDecorator('userKey', {
                            rules: [{
                                required: false
                            }],
                        })(
                            <Input placeholder="请输入您的用户名"/>
                        )}
                    </FormItem>
                    <div style={{marginLeft: "100px", marginBottom: "10px", color: "#999"}} className="UserKeyHint">
                        如果您的名下有多家机构，需填写此项。
                    </div>
                    <FormItem className="pwd" {...formItemLayout_10} label="新密码：">
                        {getFieldDecorator('pwd', {
                            rules: [{
                                required: true,
                                message: '密码不能为空',
                            }],
                        })(
                            <Input placeholder="8-16位字母与数字组合"/>
                        )}
                    </FormItem>
                </Form>
            </div>
        </Modal>;
    }
);

//找回密码组件
class ResetPassword extends Component {
    state = {
        visible: false,
        // 验证码倒计时
        countDown: 0,
        // 倒计时状态标识变量 true即为倒计时进行中，按钮不可点击
        codeButtonStatus: false,
        // 确认按钮状态变量
        confirmLoading: false
    };
    // 倒计时监听函数
    fn_countDown = "";

    showModal = () => {
        this.setState({visible: true});
    };

    // 短信验证码倒计时函数
    countDown = () => {
        if (this.state.countDown <= 0) {
            // 倒计时结束，清除监听函数
            clearInterval(this.fn_countDown);
            this.setState({
                countDown: 0,
                codeButtonStatus: false
            });
            return;
        }
        this.setState({
            countDown: this.state.countDown - 1
        })
    };

    // 获取验证码
    getCode = () => {
        const form = this.form;
        const phone = form.getFieldValue("phone");
        if (this.state.codeButtonStatus) {
            // 倒计时未结束，直接return
            return;
        } else {
            const regPhone = /^1[0-9]{10}$/;
            // const regPhone = /^1[3|4|5|7|8][0-9]{9}$/;
            if (regPhone.test(phone)) {
                reqwest({
                    url: '/mobileCode/sendVerificationCode',
                    type: 'json',
                    method: 'post',
                    data: {
                        phone: phone
                    },
                    headers: {
                        Authorization: sessionStorage.token
                    },
                    success: (json) => {
                        if (json.result === 0) {
                            // 开启倒计时
                            this.setState({
                                codeButtonStatus: true,
                                countDown: 60
                            }, () => {
                                this.fn_countDown = setInterval(this.countDown, 1000)
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
                    },
                    error: (XMLHttpRequest) => {
                        message.error("发送失败");
                    }
                });
            } else {
                if (phone) {
                    message.warning("请填写正确的手机号码")
                } else {
                    message.warning("手机号码不能为空")
                }
            }
        }
    };

    // 取消处理
    handleCancel = () => {
        const form = this.form;
        // 取消操作函数，用以进行变量初始化
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
                    countDown: 0,
                    codeButtonStatus: false,
                    confirmLoading: false
                });
            })
        };
        // 获取表单内容
        const data = form.getFieldsValue();
        // 校验表单内容是否全为空
        let flag = false;
        for (let x in data) {
            if (data[x]) {
                flag = true
            }
        }
        if (flag) {
            // 表单内容不为空，进行取消操作的二次确认
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
            // 表单内容为空，直接执行取消操作
            cancel()
        }
    };

    // 确认处理
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
                url: '/user/resetPassword',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    phone: values.phone,
                    code: values.code,
                    userKey: values.userKey,
                    pwd: values.pwd
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("密码设置成功");
                        // 设置成功之后变量初始化
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                countDown: 0,
                                codeButtonStatus: false,
                                confirmLoading: false
                            });
                        });
                        // 更新缓存登陆信息
                        const loginMsg = {
                            phone: values.phone
                        };
                        localStorage.loginMsg = JSON.stringify(loginMsg);
                        this.props.resetPhone(values.phone)
                    } else {
                        if (json.code === "605") {
                            message.error("您的名下有多家机构，需填写用户名才能重置密码。’")
                        } else if (json.code === "703") {
                            message.error("短信验证码错误或已过期")
                        } else if (json.code === "803") {
                            message.error("密码格式错误")
                        } else if (json.code === "1004") {
                            message.error("用户不存在")
                        } else {
                            message.error(json.message);
                        }
                        this.setState({
                            confirmLoading: false
                        });
                    }
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    });
                },
            });
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a style={{marginLeft: 10}}>
                <span onClick={this.showModal}>忘记密码</span>
                <ResetPasswordForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    countDown={this.state.countDown}
                    codeButtonStatus={this.state.codeButtonStatus}
                    getCode={this.getCode}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

// 登陆组件
class NormalLoginForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 登陆信息初始值,取自localStorage
            loginMsg: {},
            // 密码明文开关
            passwordHidden: false,
            // 图片验证码相关变量
            code: "",
            codeStatus: true,
            key: "",
            // 登录按钮状态开关
            confirmLoading: false
        }
    }

    // 菜单分级处理函数
    dataHandle = (data) => {
        const dataEffective = (para) => {
            return para && para.status === false
        };
        data = data.filter(dataEffective);
        console.log(data)
        const tempResult = [];
        const result = [];
        const fnFilter01 = (para) => {
            return para.parentId === 0
        };
        let data01 = data.filter(fnFilter01);
        console.log(data01);
        data01.sort((a, b) => {
            return a.orderNum - b.orderNum
        });
        data01.forEach((item) => {
            const temp = {
                id: item.id,
                name: item.name,
                url: item.url,
                orderNum: item.orderNum
            };
            tempResult.push(temp)
        });
        console.log(tempResult)
        tempResult.forEach((item) => {
            const fnFilter02 = (para) => {
                return para.parentId === item.id
            };
            let data02 = data.filter(fnFilter02);
            data02.sort((a, b) => {
                // return a.orderNum - b.orderNum
                return a.id - b.id
            });
            console.log(data02)
            if (data02.length) {
                item.children = [];
                data02.forEach((subItem) => {
                    const fnFilter03 = (para) => {
                        return para.parentId === subItem.id
                    };
                    let data03 = data.filter(fnFilter03);
                    console.log(data03)                   

                    // 多了一级
                    if (data03.length) {
                        subItem.children = [];
                        data03.forEach((thirdItem) => {
                            const fnFilter04 = (para) => {
                                return para.parentId === thirdItem.id
                            };
                            let data04 = data.filter(fnFilter04);
                            // console.log(data04)
                            const temp = {
                                id: thirdItem.id,
                                name: thirdItem.name,
                                url: thirdItem.url,
                                children: data04
                            };
                            subItem.children.push(temp)
                        })
                        item.children.push(subItem)
                    } else {
                        const temp = {
                            id: subItem.id,
                            name: subItem.name,
                            url: subItem.url,
                            children: data03
                        };
                        item.children.push(temp)
                    }
                });
                console.log(item)
                result.push(item)
            }
        });
        console.log(result);
        return result
    };

    // 登陆处理
    handleSubmit = (e) => {
        e.preventDefault();
        // 表单内容校验
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    confirmLoading: true
                });
                reqwest({
                    url: "/user/login",
                    type: 'json',
                    method: 'post',
                    data: {
                        phone: values.phone,
                        password: values.password,
                        code: values.code,
                        key: this.state.key
                    },
                    success: (json) => {
                        if (json.result === 0) {
                            // 登陆信息写入sessionStorage
                            sessionStorage.token = json.data.token;
                            sessionStorage.id = json.data.userInfo.id;
                            // orgId的数据类型是string
                            sessionStorage.orgId = json.data.userInfo.orgId;
                            // sessionStorage.EId = json.data.userInfo.EId;
                            sessionStorage.name = json.data.userInfo.username;
                            sessionStorage.adminType = json.data.userInfo.adminType;
                            sessionStorage.phone = json.data.userInfo.phone;
                            sessionStorage.userKey = json.data.userInfo.userKey;
                            console.log(json.data.menuList);

                            sessionStorage.menuListData = JSON.stringify(json.data.menuList);
                            console.log(JSON.stringify(sessionStorage.menuListData))

                            const menuListOne = this.dataHandle(json.data.menuList);
                            sessionStorage.menuListOne = JSON.stringify(menuListOne);
                            // sessionStorage.menuListOne = json.data.menuList;
                            // JSON.stringify(json.data.menuList)
                            
                            // 账号密码缓存
                            let loginMsg = {};
                            if (values.remember) {
                                loginMsg = {
                                    phone: values.phone,
                                    password: values.password,
                                    remember: true
                                };
                            } else {
                                loginMsg = {
                                    phone: values.phone,
                                    remember: false
                                };
                            }
                            localStorage.loginMsg = JSON.stringify(loginMsg);
                            // 登录成功跳转
                            this.props.history.push('/index');
                        } else {
                            // 登陆失败重新获取图片验证码
                            this.getCode();
                            if (json.code === "603") {
                                message.error("账号不存在")
                            } else if (json.code === "605") {
                                message.error("您的名下有多个机构，请使用用户名进行登录")
                            } else if (json.code === "704") {
                                message.error("图片验证码为空")
                            } else if (json.code === "705") {
                                message.error("验证码错误")
                            } else if (json.code === "802") {
                                message.error("密码错误")
                            } else if (json.code === "903") {
                                message.error("请先配置用户角色或权限")
                            } else {
                                message.error(json.message);
                            }
                            this.setState({
                                confirmLoading: false
                            })
                        }
                    },
                    error: (XMLHttpRequest) => {
                        message.error("登陆失败");
                        this.setState({
                            confirmLoading: false
                        })
                    }
                })
            }
        })
    };

    // 获取图片验证码
    getCode = () => {
        this.setState({
            code: "",
            codeStatus: false
        }, () => {
            setTimeout(() => {
                this.setState({
                    // 0-1000随机自然数生成
                    key: Math.round(Math.random() * 1000)
                }, () => {
                    this.setState({
                        // 获取图片验证码地址
                        code: "/code?key=" + this.state.key,
                        codeStatus: true
                    })
                })
            }, 500)
        })
    };

    // 重置密码成功后重新写入账号
    resetPhone = (phone) => {
        this.props.form.setFieldsValue({"phone": phone});
    };

    // 密码明文开关设置
    setPasswordHidden = () => {
        this.setState({
            passwordHidden: !this.state.passwordHidden
        })
    };

    componentWillMount() {
        // 已缓存登陆信息写入
        if (localStorage.loginMsg) {
            const tempMsg = JSON.parse(localStorage.loginMsg);
            this.setState({
                loginMsg: {
                    phone: tempMsg.phone,
                    password: tempMsg.password,
                    // 记住密码按钮状态
                    remember: tempMsg.remember
                }
            })
        }
        // 获取图片验证码
        this.getCode()
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        return (
            <div className="login">
                <img src={logo} alt="" className="logo"/>
                <Form onSubmit={this.handleSubmit} className="login-form">
                    <FormItem className="phone">
                        {getFieldDecorator('phone', {
                            initialValue: this.state.loginMsg.phone,
                            rules: [{required: true, message: '请输入账号!'}],
                        })(
                            <Input prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                   placeholder="手机号/用户名"/>
                        )}
                    </FormItem>
                    <FormItem className="password">
                        {getFieldDecorator('password', {
                            initialValue: this.state.loginMsg.password,
                            rules: [{required: true, message: '请输入密码!'}],
                        })(
                            <Input prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                   suffix={<Icon type={this.state.passwordHidden ? "eye" : "eye-o"}
                                                 onClick={this.setPasswordHidden}
                                                 style={{fontSize: 20, color: 'rgba(0,0,0,.25)', padding: "4px"}}/>}
                                   type={this.state.passwordHidden ? "text" : "password"}
                                   placeholder="密码"/>
                        )}
                    </FormItem>
                    <FormItem className="code">
                        {getFieldDecorator('code', {
                            rules: [{required: true, message: '请输入验证码!'}],
                        })(
                            <div className="code-input">
                                <Input style={{width: "200px"}} placeholder="请输入右侧验证码"/>
                                <div className="code-box" onClick={this.getCode}>
                                    <Tooltip title="点击重新获取" placement="rightTop">
                                        {this.state.codeStatus ?
                                            <img src={this.state.code} alt=""/> :
                                            <div className="icon-box">
                                                <Icon type="loading" style={{fontSize: 20}}/>
                                            </div>
                                        }
                                    </Tooltip>
                                </div>
                            </div>
                        )}
                    </FormItem>
                    <FormItem className="others">
                        {getFieldDecorator('remember', {
                            valuePropName: 'checked',
                            initialValue: this.state.loginMsg.remember,
                        })(
                            <Checkbox>记住密码</Checkbox>
                        )}
                        <Button type="primary" htmlType="submit" className="login-form-button"
                                loading={this.state.confirmLoading}>
                            登录
                        </Button>
                        <div className="login-form-forgot">
                            <ResetPassword resetPhone={this.resetPhone}/>
                        </div>
                    </FormItem>
                </Form>
            </div>
        );
    }
}

const Login = Form.create()(NormalLoginForm);

export default Login;