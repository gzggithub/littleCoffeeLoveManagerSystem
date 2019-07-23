import React, {Component} from 'react';
import {
    HashRouter  as Router,
    Route,
    Link
} from 'react-router-dom';
import AppHome from './AppHome/AppHome';
import BackUserManage from './BackUserManage/BackUserManage';

import {
    Layout,
    Menu,
    Popconfirm,
    Input,
    message,
    Button,
    Modal,
    Form
} from 'antd';
import { getVerificationCode, loginOut, resetPassword } from '../config';
import logoImg from "../logo.png";

const {Header, Footer} = Layout;
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

//修改密码表单
const ResetPasswordForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, countDown, codeButtonStatus, getCode, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="修改密码"
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
                                    message: '验证码不能为空',
                                }],
                            })(
                                <Input placeholder="请输入短信验证码"/>
                            )}
                        </FormItem>
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
            </Modal>
        );
    }
);

//修改密码组件
class ResetPassword extends Component {
    state = {
        visible: false,
        countDown: 0,
        codeButtonStatus: false,
        // 确认按钮状态开关
        loading: false
    };
    fn_countDown = "";

    showModal = () => {
        this.setState({visible: true});
    };

    countDown = () => {
        if (this.state.countDown <= 0) {
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
            return;
        } else {
            const regPhone = /^1[0-9]{10}$/;
            if (regPhone.test(phone)) {               
                getVerificationCode({phone: phone}).then((json) => {
                    if (json.data.result === 0) {                        
                        this.setState({// 开启倒计时
                            codeButtonStatus: true,
                            countDown: 60
                        }, () => {
                            this.fn_countDown = setInterval(this.countDown, 1000)
                        })
                    } else {
                        if (json.data.code === 901) {
                            message.error("请先登录");                           
                            this.props.toLoginPage(); // 返回登陆页
                        } else if (json.data.code === 902) {
                            message.error("登录信息已过期，请重新登录");                            
                            this.props.toLoginPage();// 返回登陆页
                        } else {
                            message.error(json.data.message);
                            this.setState({loading: false});
                        }
                    }
                }).catch((err) => {
                    message.error("发送失败");
                });
            } else {
                if (phone) {
                    message.error("请填写正确的手机号码")
                } else {
                    message.error("手机号码不能为空")
                }
            }
        }
    };

    // 取消处理
    handleCancel = () => {
        const form = this.form;
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
            if (err) {
                return;
            }
            this.setState({loading: true});            
            const data = {
                phone: values.phone,
                code: values.code,
                pwd: values.pwd
            };
            resetPassword(data).then((json) => {
                if (json.data.result === 0) {
                    message.success("密码设置成功，请重新登录");
                    // 设置成功之后变量初始化
                    this.handleCancel();
                    // 密码设置成功后更新缓存登陆信息
                    const loginMsg = {
                        phone: values.phone
                    };
                    localStorage.loginMsg = JSON.stringify(loginMsg);
                    // 退出登录
                    this.props.signOut();                    
                } else {
                    if (json.data.code === 703) {
                        message.error("短信验证码错误或已过期")
                    } else if (json.data.code === 803) {
                        message.error("密码格式错误")
                    } else {
                        message.error(json.data.message);
                    }                        
                    this.setState({loading: false});
                }
            }).catch((err) => {
                message.error("保存失败");
                this.setState({loading: false});
            });
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a>
                <span onClick={this.showModal}>修改密码</span>
                <ResetPasswordForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    countDown={this.state.countDown}
                    codeButtonStatus={this.state.codeButtonStatus}
                    getCode={this.getCode}
                    confirmLoading={this.state.loading}
                />
            </a>
        );
    }
}

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            userKey: "",
            // 一级菜单组件列表
            menuList: [],
            // 高亮项索引
            highlight: "",
            // 登陆人下属机构列表
            institutionList: [],
            // 机构切换开关
            switchFlag: true
        }
    }

    // 获取一级菜单路由
    getSuperiorPath = (para) => {
        const index01 = para.slice(1).indexOf("/") + 1;
        const index02 = para.slice(index01 + 1).indexOf("/") + 1;
        return index02 ? para.slice(0, index01 + index02) : para;
    };
    
    // 导航数据
    getMenuList = () => {
        const tempMenuList = [];           
        // 新改的菜单数据
        const handleResult = JSON.parse(sessionStorage.menuListOne);       
        handleResult.forEach((item, index) => {
            tempMenuList.push(
                <Menu.Item key={index + 1}>
                    <Link to={item.url}>
                        {item.name}
                    </Link>
                </Menu.Item>
            )
        });
        this.setState({
            menuList: tempMenuList
        }, () => {            
            if (this.props.location.pathname === "/index") {
                this.props.history.push(handleResult[0].url);                
                this.setState({
                    highlight: "1"
                })
            } else {               
                const superiorPath = this.getSuperiorPath(this.props.location.pathname);
                const tempMenuList = JSON.parse(sessionStorage.menuListOne);
                tempMenuList.forEach((item, index) => {                   
                    if (item.url === superiorPath) {
                        this.setState({
                            highlight: (index + 1).toString()
                        })
                    }
                })
            }
        })
    };

    // 退出登录处理
    signOut = () => {
        loginOut().then((json) => {            
            sessionStorage.clear();// 清除登陆信息            
            this.props.history.push('/');// 跳转至登陆页面
        }).catch((err) => {
            // message.error("失败");
            sessionStorage.clear();
            this.props.history.push('/')
        })
    };

    // 高亮选项设置
    setHighlight = (value) => {
        this.setState({
            highlight: value.key
        })
    };

    componentWillMount() {        
        // 登陆信息写入
        this.setState({
            name: sessionStorage.name,
            userKey: sessionStorage.userKey
        });
        // 获取菜单列表
        this.getMenuList();
    }

    componentWillReceiveProps(nextProps) {
        // url一级菜单部分有变化，则重新设置高亮项
        // console.log(nextProps);
        // console.log(this.getSuperiorPath(nextProps.location.pathname));
        // console.log(this.getSuperiorPath(this.getSuperiorPath(this.props.location.pathname)));
        if (this.getSuperiorPath(nextProps.location.pathname) !== this.getSuperiorPath(this.props.location.pathname)) {
            JSON.parse(sessionStorage.menuListOne).forEach((item, index) => {
                // console.log(item.url);
                // console.log(this.getSuperiorPath(nextProps.location.pathname))
                if (item.url === this.getSuperiorPath(nextProps.location.pathname)) {
                    this.setState({
                        highlight: (index + 1).toString()
                    })
                }
            })
        }
    }

    render() {
        return (
            <Router>
                <div className="home">
                    <Layout>
                        <Header className="header">
                            {/*LOGO框*/}
                            <div className="logo">
                                <img src={logoImg} alt=""/>
                                <div className="pic-right">
                                    <p>淘儿学</p>
                                    <p>运营管理系统</p>
                                </div>
                            </div>
                            {/*一级菜单栏*/}
                            <Menu
                                theme="dark"
                                mode="horizontal"
                                selectedKeys={[this.state.highlight]}
                                style={{marginLeft: '150px', lineHeight: '64px'}}
                                onClick={this.setHighlight}>
                                {this.state.menuList}
                                {/*<Menu.Item key={1} style={{textAlign: "center"}}>
                                    <Link to="/index/app-home">
                                        小咖爱
                                    </Link>
                                </Menu.Item>
                                <Menu.Item key={2} style={{textAlign: "center"}}>
                                    <Link to="/index/backUser-manage">
                                        账号管理
                                    </Link>
                                </Menu.Item>*/}
                            </Menu>
                            {/*登录信息相关*/}
                            <div className="right-box">
                                {/*当前登录人信息*/}
                                <span className="username">{sessionStorage.name ? (sessionStorage.name + "(" + sessionStorage.phone + ")") : "未登录"}</span>                                
                                {/*重置密码*/}
                                <ResetPassword signOut={this.signOut}/> 
                                {/*退出登录*/}
                                <Popconfirm 
                                    title="确认退出?"
                                    placement="topRight"
                                    onConfirm={this.signOut}
                                    onCancel=""
                                    okType="danger"
                                    okText="立即退出"
                                    cancelText="取消">
                                    <a style={{marginLeft: "10px"}}>退出</a>
                                </Popconfirm>
                            </div>
                        </Header>
                        
                    </Layout>
                    {/*一级菜单路由组件映射表*/}
                    <Route path="/index/app-home" component={AppHome}/> 
                    <Route path="/index/backUser-manage" component={BackUserManage}/> 
                    <Layout>
                        <Footer className="footer">
                            <div className="version-infor">Copyright © www.taoerxue.com, All Rights Reserved.</div>
                            <div className="version-infor">浙江淘儿学教育科技有限公司</div>
                        </Footer>
                    </Layout>                   
                </div>
            </Router>
        )
    }
}

export default Home;