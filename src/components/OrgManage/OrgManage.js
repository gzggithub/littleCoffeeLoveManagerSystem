import React, {Component} from 'react';
import {
    HashRouter  as Router,
    Route,
    Link
} from 'react-router-dom';
import Category from './Category';
import Org from './Org';
import MyInstitution from './MyInstitution';
import Teachers from './Teachers';
import Courses from './Courses';
import Coupons from './Coupons';
import AttendConfirm from './AttendConfirm';
import TeachersMonitor from './TeachersMonitor';
import CoursesMonitor from './CoursesMonitor';
import {Layout, Menu} from 'antd';
const {SubMenu} = Menu;
const {Content, Sider} = Layout;

class OrgManage extends Component {
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
            // console.log(item)
            if (item.url === "/index/org-manage") {
                console.log(item.children)
                this.menu = item.children;
            }
        });
        // console.log(this.menu)
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
        // console.log(this.props.location.pathname);

        if (this.props.location.pathname === "/index/org-manage") {
            this.setState({
                highlight: "1"
            });
            console.log(this.menu)
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
                <div className="institution-manage">
                    <Layout>
                        <Sider width={200} style={{background: '#fff'}}>
                            <Menu
                                mode="inline"
                                selectedKeys={[this.state.highlight]}
                                defaultOpenKeys={['sub1']}
                                style={{height: '100%', borderRight: 0}}
                                onClick={this.setHighlight}
                            >
                                <SubMenu key="sub1" title={<span>机构管理</span>}>
                                    {this.state.menuList}
                                </SubMenu>                                
                            </Menu>
                        </Sider>
                        <Layout style={{padding: '24px'}}>
                            <Content style={{background: '#fff', padding: "24px 24px 0", margin: 0, minHeight: 406}}>
                                <Route path="/index/org-manage/category" component={Category}/>
                                <Route path="/index/org-manage/org" component={Org}/>
                                <Route path="/index/org-manage/myInstitution" component={MyInstitution}/>
                                <Route path="/index/org-manage/teachers/:id/:name" component={Teachers}/>
                                <Route path="/index/org-manage/courses/:id/:name" component={Courses}/>
                                <Route path="/index/org-manage/coupons" component={Coupons}/>
                                <Route path="/index/org-manage/attend-confirm" component={AttendConfirm}/>
                                <Route path="/index/org-manage/teachers-monitor" component={TeachersMonitor}/>
                                <Route path="/index/org-manage/courses-monitor" component={CoursesMonitor}/>
							</Content>
                        </Layout>
                    </Layout>
                </div>
            </Router>
        )
    }
}

export default OrgManage;