import React, {Component} from 'react';
import {
    HashRouter as Router,
    Route,
    Link
} from 'react-router-dom';
import Category from './Category';
import AdvManage from './AdvManage';
import StarManage from './StarManage';
import NotificationManage from './NotificationManage';
import SignList from './SignList';
import StarCheck from './StarCheck';
import CoffeeCircle from './CoffeeCircle';
import EvaluationManage from './EvaluationManage';

import {Layout, Menu} from 'antd';

const {SubMenu} = Menu;
const {Content, Sider} = Layout;

class AppHome extends Component {
    constructor(props) {
        super(props);
        this.rootSubmenuKeys = ['sub1', 'sub2', 'sub3'];
        this.state = {
            // 二级菜单组件列表
            menuList: [],
            // 二级菜单组件列表
            // menuList02: [],
            // 二级菜单组件列表
            // menuList03: [],
            // 高亮项索引
            highlight: "",
            openKeys: ['sub1'],
        };
        // 二级菜单列表
        this.menu = [];
        // this.menu02 = [];
        // this.menu03 = [];  
    }

    // 二级菜单组件列表生成 (暂时不用)
    menuHandle02 = () => {
        let tempSubMenu = [];
        // 获取当前页面一级菜单下属二级菜单列表
        JSON.parse(sessionStorage.menuListOne).forEach((item) => {
            if (item.url === "/index/app-home") {
                if (item.children) {
                    this.menu03 = item.children;
                    item.children.forEach((subItem, subIndex) => {
                        let tempMenuList = [];
                        if (subItem.children) {
                            subItem.children.forEach((thirdItem, thirdIndex) => {
                                tempMenuList.push(
                                    <Menu.Item key={thirdIndex + 1} style={{textAlign: "center"}}>
                                        <Link to={thirdItem.url}>
                                            {thirdItem.name}
                                        </Link>
                                    </Menu.Item>
                                )
                            })
                        }
                        tempSubMenu.push(
                            <SubMenu key={"sub" + (subIndex + 1)} title={<span>{subItem.name}</span>}>
                                {tempMenuList}                         
                            </SubMenu>
                        )
                    })
                }         
            }
        });
        // 二级菜单组件列表写入
        this.setState({
            menuList: tempSubMenu
            // menuList03: tempSubMenu
        });
        // 路由中缺失二级菜单信息时默认跳转至当前一级菜单下属第一项二级菜单并标为高亮
        if (this.props.location.pathname === "/index/app-home") {
            this.menu03.forEach((item, index) => {
                if (item.children) {
                    item.children.forEach((subItem, subIndex) => {
                        if (subItem.name === this.menu03[0].children[0].name) {
                            this.setState({
                                highlight: (subIndex + 1).toString()
                            })
                            this.props.history.push(subItem.url);
                        }
                    })                
                }
            });
        }
    };

    menuHandle = () => {
        const tempMenuList = [];
        JSON.parse(sessionStorage.menuListOne).forEach((item) => {
            if (item.url === "/index/app-home") {
                this.menu = item.children;
            }
        });
        this.menu.forEach((item, index) => {
            if (item.url === this.props.location.pathname) {
                this.setState({
                    highlight: (index + 1).toString()
                })
            }
            tempMenuList.push(
                <Menu.Item key={index + 1} style={{textAlign: "center"}}>
                    <Link to={item.url}>
                        {item.name}
                    </Link>
                </Menu.Item>
            )
        });
        this.setState({
            menuList: tempMenuList
        });
        if (this.props.location.pathname === "/index/app-home") {
            this.setState({
                highlight: "1"
            });
            this.props.history.push(this.menu[0].url);
        }
    };

    // 高亮选项设置
    setHighlight = (value) => {
        this.setState({
            highlight: value.key
        })
    };

    componentWillMount() {
        if (sessionStorage.menuListOne) {
            // 获取二级菜单组件列表
            this.menuHandle();
            if (this.props.location.search) {
                console.log(this.menu[0].url)
                this.props.history.push(this.menu[0].url)
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        // url有变化，则重新设置高亮项
        if(nextProps.location.pathname!==this.props.location.pathname){
            this.menu.forEach((item, index) => {
                if (item.url === nextProps.location.pathname) {
                    this.setState({
                        highlight: (index + 1).toString()
                    })
                }
            });
        }
        if (nextProps.location.search) {
            this.menuHandle();
            this.setState({
                highlight: "1"
            })
        }
    }

    onOpenChange = (openKeys) => {
        const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1);
        if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
            this.setState({ openKeys });
        } else {
            this.setState({
                openKeys: latestOpenKey ? [latestOpenKey] : [],
            });
        }
    }

    render() {
        return (
            <Router>
                <div className="app-home">
                    <Layout>
                        <Sider width={200} style={{background: '#fff', position: "fixed", top: "64px", left: "0",minHeight: 600}}>
                            <Menu
                                mode="inline"
                                openKeys={this.state.openKeys}
                                onOpenChange={this.onOpenChange}
                                selectedKeys={[this.state.highlight]}
                                style={{height: '100%', borderRight: 0}}
                                onClick={this.setHighlight}>
                                {/*二级菜单栏*/}
                                {/*this.state.menuList03*/}
                                <SubMenu key={"sub" + (1)} title={<span>小咖爱</span>}>
                                    <Menu.Item key={1} style={{textAlign: "center"}}>
                                        <Link to="/index/app-home/category">
                                            分类管理
                                        </Link>
                                    </Menu.Item>
                                    <Menu.Item key={2} style={{textAlign: "center"}}>
                                        <Link to="/index/app-home/adv-manage">
                                            广告管理
                                        </Link>
                                    </Menu.Item>
                                    <Menu.Item key={3} style={{textAlign: "center"}}>
                                        <Link to="/index/app-home/star-manage">
                                            明星管理
                                        </Link>
                                    </Menu.Item>
                                    <Menu.Item key={4} style={{textAlign: "center"}}>
                                        <Link to="/index/app-home/notification-manage">
                                            通告管理
                                        </Link>
                                    </Menu.Item>
                                    <Menu.Item key={5} style={{textAlign: "center"}}>
                                        <Link to="/index/app-home/star-check">
                                            明星审核
                                        </Link>
                                    </Menu.Item>
                                    <Menu.Item key={6} style={{textAlign: "center"}}>
                                        <Link to="/index/app-home/coffee-circle">
                                            小咖圈管理
                                        </Link>
                                    </Menu.Item>
                                    <Menu.Item key={7} style={{textAlign: "center"}}>
                                        <Link to="/index/app-home/evaluatioin-manage">
                                            评论管理
                                        </Link>
                                    </Menu.Item>                                    
                                </SubMenu>
                            </Menu>
                        </Sider>
                        {/*二级菜单路由组件映射表*/}
                        <Layout style={{padding: '24px'}}>
                            <Content style={{background: '#fff', padding: "24px 24px 0", margin: "0 0 0 200px", minHeight: 406}}>
                                <Route path="/index/app-home/category" component={Category}/>
                                <Route path="/index/app-home/adv-manage" component={AdvManage}/>
                                <Route path="/index/app-home/star-manage" component={StarManage}/>
                                <Route path="/index/app-home/notification-manage" component={NotificationManage}/>
                                <Route path="/index/app-home/sign-list/:id/:name" component={SignList}/>
                                <Route path="/index/app-home/star-check" component={StarCheck}/>
                                <Route path="/index/app-home/coffee-circle" component={CoffeeCircle}/>
                                <Route path="/index/app-home/evaluatioin-manage" component={EvaluationManage}/>                                
                            </Content>
                        </Layout>
                    </Layout>
                </div>
            </Router>
        )
    }
}

export default AppHome;