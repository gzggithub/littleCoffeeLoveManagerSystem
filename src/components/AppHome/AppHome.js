import React, {Component} from 'react';
import {
    HashRouter as Router,
    Route,
    Link
} from 'react-router-dom';
import Category from './Category';
import AdvManage from './AdvManage';
import StarManage from './StarManage';
import NoticeManage from './NoticeManage';
import SignList from './SignList';
import StarCheck from './StarCheck';
import CoffeeCircle from './CoffeeCircle';
import CommentManage from './CommentManage';

import {Layout, Menu} from 'antd';

const {SubMenu} = Menu;
const {Content, Sider} = Layout;

class AppHome extends Component {
    constructor(props) {
        super(props);
        this.state = {            
            menuList: [],// 二级菜单组件列表            
            highlight: ""// 高亮项索引
        };        
        this.menu = [];// 二级菜单列表
    }

    // 二级菜单组件列表生成
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
            this.menuHandle();// 获取二级菜单组件列表
            if (this.props.location.search) {
                console.log(this.menu[0].url)
                this.props.history.push(this.menu[0].url)
            }
        }
    }

    componentWillReceiveProps(nextProps) {// url有变化，则重新设置高亮项        
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

    render() {
        return (
            <Router>
                <div className="app-home">
                    <Layout>
                        <Sider width={200} style={{background: '#fff', position: "fixed", top: "64px", left: "0",minHeight: 600}}>
                            <Menu
                                mode="inline"                                
                                selectedKeys={[this.state.highlight]}
                                defaultOpenKeys={['sub1']}
                                style={{height: '100%', borderRight: 0}}
                                onClick={this.setHighlight}>
                                {/*二级菜单栏*/}                                
                                <SubMenu key="sub1" title={<span>小咖爱</span>}>
                                    {this.state.menuList}
                                    {/*<Menu.Item key={1} style={{textAlign: "center"}}>
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
                                        <Link to="/index/app-home/notice-manage">
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
                                        <Link to="/index/app-home/comment-manage">
                                            评论管理
                                        </Link>
                                    </Menu.Item>*/}                                    
                                </SubMenu>
                            </Menu>
                        </Sider>
                        {/*二级菜单路由组件映射表*/}
                        <Layout style={{padding: '24px'}}>
                            <Content style={{background: '#fff', padding: "24px 24px 0", margin: "0 0 0 200px", minHeight: 406}}>
                                <Route path="/index/app-home/category" component={Category}/>
                                <Route path="/index/app-home/adv-manage" component={AdvManage}/>
                                <Route path="/index/app-home/star-manage" component={StarManage}/>
                                <Route path="/index/app-home/notice-manage" component={NoticeManage}/>
                                <Route path="/index/app-home/sign-list/:id/:name" component={SignList}/>
                                <Route path="/index/app-home/star-check" component={StarCheck}/>
                                <Route path="/index/app-home/coffee-circle" component={CoffeeCircle}/>
                                <Route path="/index/app-home/comment-manage" component={CommentManage}/>                                
                            </Content>
                        </Layout>
                    </Layout>
                </div>
            </Router>
        )
    }
}

export default AppHome;