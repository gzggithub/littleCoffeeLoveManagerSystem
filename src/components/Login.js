import React, {Component} from 'react';
import {Form, Icon, Input, Button, Modal, Checkbox, Tooltip, message} from 'antd';
import * as config from '../config';
import * as common from '../config/common';
import logo from "../static/images/logo.png";

const FormItem = Form.Item;

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
            confirmLoading={confirmLoading}>
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
                        <Button onClick={getCode} type="primary" style={{float: "right", width: "100px"}}>
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
        loading: false
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
        });
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
            if (regPhone.test(phone)) {                
                config.getVerificationCode({phone: phone}).then((json) => {
                    if (json.data.result === 0) {
                        // 开启倒计时
                        this.setState({
                            codeButtonStatus: true,
                            countDown: 60
                        }, () => {
                            this.fn_countDown = setInterval(this.countDown, 1000);
                        });
                    } else {
                        common.exceptHandle(this, json.data);
                    }
                }).catch((err) => common.errorHandle(this, err));
            } else {
                if (phone) {
                    message.warning("请填写正确的手机号码");
                } else {
                    message.warning("手机号码不能为空");
                }
            }
        }
    };

    // 取消处理
    handleCancel = () => {
        const form = this.form;
        // 取消操作函数，用以进行变量初始化
        this.setState({
            visible: false
        }, () => {
            this.setState({
                countDown: 0,
                codeButtonStatus: false,
                loading: false
            });
            form.resetFields();
        });
    };

    // 确认处理
    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {return;}
            this.setState({loading: true});            
            const data = {
                phone: values.phone,
                code: values.code,
                userKey: values.userKey,
                pwd: values.pwd
            };
            config.resetPassword(data).then((json) => {
                if (json.data.result === 0) {
                    message.success("密码设置成功");
                    // 设置成功之后变量初始化
                    this.handleCancel();
                    // 更新缓存登陆信息
                    const loginMsg = {
                        phone: values.phone
                    };
                    localStorage.loginMsg = JSON.stringify(loginMsg);
                    this.props.resetPhone(values.phone)
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
                    confirmLoading={this.state.loading}/>
            </a>
        );
    }
}

// 登录组件
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
            loading: false
        }
    }

    // 登录处理
    handleSubmit = (e) => {
        e.preventDefault();
        // 表单内容校验
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({loading: true});                
                const data = {
                    phone: values.phone,
                    password: values.password,
                    code: values.code,
                    key: this.state.key
                };
                config.login(data).then((json) => {
                    if (json.data.result === 0) {
                        // 登陆信息写入sessionStorage
                        sessionStorage.token = json.data.data.token;
                        sessionStorage.name = json.data.data.userInfo.username;
                        sessionStorage.phone = json.data.data.userInfo.phone;
                        if (json.data.data.menuList.length) {
                            const menuListOne = common.dataHandle(json.data.data.menuList);//菜单分级处理
                            sessionStorage.menuListOne = JSON.stringify(menuListOne);
                        }
                        
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
                        this.props.history.push('/index');// 登录成功跳转
                    } else {                        
                        this.getCode();// 登录失败重新获取图片验证码
                        common.exceptHandle(this, json.data);
                    }
                }).catch((err) => common.errorHandle(this, err));
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
                    key: Math.round(Math.random() * 1000)// 0-1000随机自然数生成
                }, () => {
                    this.setState({                        
                        code: "/code?key=" + this.state.key,// 获取图片验证码地址
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
        if (localStorage.loginMsg) {// 已缓存登陆信息写入
            const tempMsg = JSON.parse(localStorage.loginMsg);
            this.setState({
                loginMsg: {
                    phone: tempMsg.phone,
                    password: tempMsg.password,                    
                    remember: tempMsg.remember// 记住密码按钮状态
                }
            })
        }        
        this.getCode();// 获取图片验证码
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
                            <Input prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>} placeholder="手机号/用户名"/>
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
                                <Input style={{width: "170px"}} placeholder="请输入右侧验证码"/>
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
                        <Button loading={this.state.loading} type="primary" htmlType="submit" className="login-form-button">登录</Button>
                        <div className="login-form-forgot" style={{display: "none"}}>
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