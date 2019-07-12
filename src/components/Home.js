import React, {Component} from 'react';
import {
    HashRouter  as Router,
    Route,
    Link
} from 'react-router-dom';
import AppHome from './AppHome/AppHome';
import OrgManage from './OrgManage/OrgManage';
import Mine from './Mine/Mine';
import EduManage from './EduManage/EduManage';
import OrderManage from './OrderManage/OrderManage';
import CheckManage from './CheckManage/CheckManage';

import DataStatistics from './DataStatistics/DataStatistics';
import MdhManage from './MdhManage/MdhManage';
import InformationManage from './InformationManage/InformationManage';
import MallManage from './MallManage/MallManage';

import FinancialManage from './FinancialManage/FinancialManage';
import UserManage from './UserManage/UserManage';
import BackUserManage from './BackUserManage/BackUserManage';
import AgentManage from './AgentManage/AgentManage';
import SysManage from './SysManage/SysManage';

import {
    Table,
    Layout,
    Menu,
    Popconfirm,
    Input,
    message,
    Button,
    Modal,
    Form
} from 'antd';
import '../config/config.js';
import reqwest from 'reqwest';
import logoImg from "../logo.png";

const {Header, Footer} = Layout;
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

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

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
        confirmLoading: false
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
                            this.setState({
                                codeButtonStatus: true,
                                countDown: 60
                            }, () => {
                                this.fn_countDown = setInterval(this.countDown, 1000)
                            })
                        } else {
                            message.error(json.message);
                        }
                    },
                    error: (XMLHttpRequest) => {
                        message.error("发送失败");
                    }
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
                    userKey: sessionStorage.userKey,
                    pwd: values.pwd
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("密码设置成功，请重新登录");
                        // 密码设置成功后更新缓存登陆信息
                        const loginMsg = {
                            phone: values.phone
                        };
                        localStorage.loginMsg = JSON.stringify(loginMsg);
                        // 退出登录
                        this.props.signOut()
                    } else {
                        if (json.code === "703") {
                            message.error("短信验证码错误或已过期")
                        } else if (json.code === "803") {
                            message.error("密码格式错误")
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
                <span onClick={this.showModal}>修改密码</span>
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

//机构列表表格
const InstitutionListTable = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, pagination, data, columns, pageChange, loading} = props;

        return (
            <Modal
                width={1000}
                visible={visible}
                title="机构列表"
                footer={null}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
            >
                <div className="institution-list">
                    <Table bordered pagination={pagination} dataSource={data} columns={columns}
                           onChange={pageChange} loading={loading}/>;
                </div>
            </Modal>
        );
    }
);

//机构列表组件
class InstitutionList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            // 列表信息加载状态 true：加载中；false：加载完成
            loading: false,
            // 机构列表
            data: [],
            // 分页相关变量
            pagination: {
                // 当前页码
                current: 1,
                // 每页信息条数
                pageSize: 5,
            },
        };
        // 表格的列配置
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '机构名称',
                dataIndex: 'name',
                width: '40%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*当前机构项展示此信息*/}
                            <p style={{display: Number(sessionStorage.EId) === record.id ? "inline" : "none"}}>当前机构</p>
                            <Popconfirm title="确认切换?"
                                        placement="topRight"
                                        onConfirm={() => this.itemSwitch(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="立即切换"
                                        cancelText="取消">
                                {/*当前机构项不展示此按钮*/}
                                <a style={{display: Number(sessionStorage.EId) === record.id ? "none" : "inline"}}>切换</a>
                            </Popconfirm>
                            <Popconfirm title="确认设置该机构为主机构?"
                                        placement="topRight"
                                        onConfirm={() => this.itemMainInstitution(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="确认"
                                        cancelText="取消">
                                {/*当前机构项不展示此按钮*/}
                                <a style={{display: Number(sessionStorage.EId) === record.id ? "none" : "inline"}}>设为主机构</a>
                            </Popconfirm>
                        </div>
                    )
                }
            }
        ]
    }

    // 列表信息写入
    getData = () => {
        this.setState({
            data: this.props.institutionList
        }, () => {
            const data = [];
            this.state.data.forEach((item, index) => {
                data.push({
                    key: index.toString(),
                    id: item.id,
                    index: index + 1,
                    name: item.name,
                });
            });
            this.setState({
                data: data
            })
        })
    };

    // 机构切换
    itemSwitch = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/user/switchAdminUser',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                eid: id
            },
            success: (json) => {
                if (json.result === 0) {
                    // 切换成功后登陆信息更新
                    sessionStorage.token = json.data.token;
                    sessionStorage.id = json.data.userInfo.id;
                    sessionStorage.EId = json.data.userInfo.EId;
                    sessionStorage.name = json.data.userInfo.username;
                    sessionStorage.phone = json.data.userInfo.phone;
                    sessionStorage.userKey = json.data.userInfo.userKey;
                    // 切换成功后其他操作
                    this.props.switchSuccess(json.data.menuList);
                    // 取消对话框
                    this.handleCancel();
                    message.success("机构切换成功");
                    this.setState({
                        loading: false
                    });
                } else {
                    message.error(json.message);
                    this.setState({
                        loading: false
                    });
                }
            },
            error: (XMLHttpRequest) => {
                message.error("切换失败");
                this.setState({
                    loading: false
                });
            }
        });
    };

    // 主机构设置
    itemMainInstitution = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/institution/switchMainEducation',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                eId: id
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("设置成功，请重新登录");
                    this.props.signOut()
                } else {
                    message.error(json.message);
                    this.setState({
                        loading: false
                    });
                }
            },
            error: (XMLHttpRequest) => {
                message.error("设置失败");
                this.setState({
                    loading: false
                });
            }
        });
    };

    showModal = () => {
        this.getData();
        this.setState({visible: true});
    };

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    //页码变化处理
    pageChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        })
    };

    // 取消对话框
    handleCancel = () => {
        this.setState({visible: false})
    };

    render() {
        return (
            <a style={{display: this.props.flag ? "inline" : "none", marginRight: 10}}>
                <span onClick={() => this.showModal(this.props.id)}>机构列表</span>
                <InstitutionListTable
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    pagination={this.state.pagination}
                    loading={this.state.loading}
                    data={this.state.data}
                    columns={this.columns}
                    pageChange={this.pageChange}
                />
            </a>
        )
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

    // 菜单分级处理函数
    dataHandle = (data) => {
        const dataEffective = (para) => {
            return para && para.status === false
        };
        data = data.filter(dataEffective);
        const tempResult = [];
        const result = [];
        const fnFilter01 = (para) => {
            return para.parentId === 0
        };
        let data01 = data.filter(fnFilter01);
        data01.sort((a, b) => {
            return a.orderNum - b.orderNum
        });
        data01.forEach((item) => {
            const temp = {
                id: item.id,
                name: item.name,
                url: item.url,
            };
            tempResult.push(temp)
        });
        tempResult.forEach((item) => {
            const fnFilter02 = (para) => {
                return para.parentId === item.id
            };
            let data02 = data.filter(fnFilter02);
            data02.sort((a, b) => {
                return a.orderNum - b.orderNum
            });
            if (data02.length) {
                item.children = [];
                data02.forEach((subItem) => {
                    const fnFilter03 = (para) => {
                        return para.parentId === subItem.id
                    };
                    let data03 = data.filter(fnFilter03);
                    const temp = {
                        id: subItem.id,
                        name: subItem.name,
                        url: subItem.url,
                        children: data03
                    };
                    item.children.push(temp)
                });
                // console.log(item)
                result.push(item)
            }
        });
        return result
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
            // console.log(this.props.location.pathname);
            // 地址有误当有三级菜单路由时，暂时不改，有时间改
            if (this.props.location.pathname === "/index") {
                this.props.history.push(handleResult[0].url);
                // console.log(handleResult[0].url);
                this.setState({
                    highlight: "1"
                })
            } else {
                // console.log(this.props.location.pathname);
                const superiorPath = this.getSuperiorPath(this.props.location.pathname);
                const tempMenuList = JSON.parse(sessionStorage.menuListOne);
                tempMenuList.forEach((item, index) => {
                    // console.log(superiorPath);
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
        reqwest({
            url: '/user/loginOut',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                sessionStorage.clear();
                this.props.history.push('/')
            },
            success: (json) => {
                // 清除登陆信息
                sessionStorage.clear();
                // 跳转至登陆页面
                this.props.history.push('/')
            }
        });
    };

    getInstitutionList = () => {
        reqwest({
            url: '/institution/getEducations',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        institutionList: json.data.list
                    })
                }
            },
            error: (XMLHttpRequest) => {}
        });
    };

    // 设置机构切换开关
    setSwitchFlag = () => {
        reqwest({
            url: '/institution/getDetail',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {

            },
            success: (json) => {
                if (json.result === 0) {
                    if (json.data.institution) {
                        // 若该机构为主机构，则机构切换开关开启
                        this.setState({
                            switchFlag: json.data.institution.mainEducation === 0
                        })
                    }
                }
            }
        });
    };

    // 机构切换成功函数
    switchSuccess = (data) => {
        // 设置机构切换开关
        this.setSwitchFlag();
        // 菜单列表重新写入
        const tempMenuList = [];
        const handleResult = this.dataHandle(data);
        sessionStorage.menuList = JSON.stringify(handleResult);
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
            // 跳转至第一个二级菜单
            this.props.history.push(handleResult[0].children[0].url + "?flag=true")
        });
        // 其他信息重新写入
        this.setState({
            highlight: "1",
            name: sessionStorage.name,
            userKey: sessionStorage.userKey
        })
    };

    // 高亮选项设置
    setHighlight = (value) => {
        this.setState({
            highlight: value.key
        })
    };

    componentWillMount() {
        // 登陆人为机构管理员的分支操作
        if (Number(sessionStorage.EId) !== 0 && Number(sessionStorage.EId) !== 1) {
            // 获取该机构管理员下属机构列表
            // this.getInstitutionList();
            // 设置机构切换开关
            // this.setSwitchFlag();
        }
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
                                onClick={this.setHighlight}
                            >
                                {this.state.menuList}
                            </Menu>
                            {/*登陆信息相关*/}
                            <div className="right-box">
                                {/*当前登录人信息*/}
                                <span
                                    className="username">{sessionStorage.name ? (sessionStorage.name + "(" + sessionStorage.phone + ")") : "未登录"}</span>
                                {/*机构管理员下属机构列表，当前机构为主机构且机构数量大于1时展示*/}
                                <InstitutionList 
                                    institutionList={this.state.institutionList}
                                    switchSuccess={this.switchSuccess}
                                    signOut={this.signOut}
                                    flag={this.state.institutionList.length > 1 && this.state.switchFlag}/>
                                {/*重置密码*/}
                                <ResetPassword signOut={this.signOut}/> 
                                {/*退出登录*/}
                                <Popconfirm title="确认退出?"
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
                    <Route path="/index/org-manage" component={OrgManage}/>
                    <Route path="/index/mine" component={Mine}/>
                    <Route path="/index/edu-manage" component={EduManage}/>
                    <Route path="/index/order-manage" component={OrderManage}/>
                    
                    <Route path="/index/check-manage" component={CheckManage}/>

                    <Route path="/index/data-statistics" component={DataStatistics}/>
                    <Route path="/index/mdh-manage" component={MdhManage}/>                 
                    <Route path="/index/information-manage" component={InformationManage}/>
                    <Route path="/index/mall-manage" component={MallManage}/>
                    
                    <Route path="/index/financial-manage" component={FinancialManage}/>
                    <Route path="/index/user-manage" component={UserManage}/>
                    <Route path="/index/backUser-manage" component={BackUserManage}/>
                    <Route path="/index/agent-manage" component={AgentManage}/>                     
                    <Route path="/index/sys-manage" component={SysManage}/> 
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