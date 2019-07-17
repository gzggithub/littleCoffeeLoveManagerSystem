import React, {Component} from 'react';
import {
    HashRouter  as Router,
    Route,
    Link
} from 'react-router-dom';
import BackUsers from './BackUsers';
import Roles from './Roles';
import Department from './Department';
import {Layout, Menu} from 'antd';
const {SubMenu} = Menu;
const {Content, Sider} = Layout;

class BackUserManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menuList: [],
            highlight: ""
        };
        this.menu = []
    }

    menuHandle = () => {
        const tempMenuList = [];
        JSON.parse(sessionStorage.menuListOne).forEach((item) => {
            if (item.url === "/index/backUser-manage") {
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
        if (this.props.location.pathname === "/index/backUser-manage") {
            this.setState({
                highlight: "1"
            });
            this.props.history.push(this.menu[0].url);
        }
    };

    setHighlight = (value) => {
        this.setState({
            highlight: value.key
        })
    };

    componentWillMount() {
        if (sessionStorage.menuListOne) {
            this.menuHandle();
            if (this.props.location.search) {
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

    render() {
        return (
            <Router>
                <div className="backUser-manage">
                    <Layout>
                        <Sider width={200} style={{background: '#fff',position: "fixed", top: "64px", left: "0", minHeight: 600}}>
                            <Menu
                                mode="inline"
                                selectedKeys={[this.state.highlight]}
                                defaultOpenKeys={['sub1']}
                                style={{height: '100%', borderRight: 0}}
                                onClick={this.setHighlight}>
                                <SubMenu key="sub1" title={<span>帐号管理</span>}>
                                    {/*this.state.menuList*/}
                                    <Menu.Item key={1} style={{textAlign: "center"}}>
                                        <Link to="/index/backUser-manage/backUsers">
                                            所有账号
                                        </Link>
                                    </Menu.Item>
                                    <Menu.Item key={2} style={{textAlign: "center"}}>
                                        <Link to="/index/backUser-manage/Roles">
                                            角色管理
                                        </Link>
                                    </Menu.Item>
                                    <Menu.Item key={3} style={{textAlign: "center"}}>
                                        <Link to="/index/backUser-manage/Department">
                                            部门管理
                                        </Link>
                                    </Menu.Item>
                                </SubMenu>
                            </Menu>
                        </Sider>
                        <Layout style={{padding: '24px'}}>
                            <Content style={{background: '#fff', padding: "24px 24px 0", margin: "0 0 0 200px", minHeight: 406}}>
                                <Route path="/index/backUser-manage/backUsers" component={BackUsers}/>
                                <Route path="/index/backUser-manage/Roles" component={Roles}/>
                                <Route path="/index/backUser-manage/Department" component={Department}/>
                            </Content>
                        </Layout>
                    </Layout>
                </div>
            </Router>
        )
    }
}

export default BackUserManage;