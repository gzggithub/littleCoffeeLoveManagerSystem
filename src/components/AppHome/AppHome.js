import React, {Component} from 'react';
import {
    HashRouter as Router,
    Route,
    Link
} from 'react-router-dom';
import Category from './Category';
import AdvManage from './AdvManage';
import TeacherCertification from './TeacherCertification';
import QualityCourse from './QualityCourse';
import AdvPositionManage from './AdvPositionManage';
import Banner from './Banner';
import CrowdFunding from './CrowdFunding';
import RecommendCourses from './RecommendCourses';
import VideoCourses from './VideoCourses';
import RecommendInstitutions from './RecommendInstitutuions';
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
            menuList02: [],
            // 二级菜单组件列表
            menuList03: [],
            // 高亮项索引
            highlight: "",
            openKeys: ['sub1'],
        };
        // 二级菜单列表
        this.menu = [];
        this.menu02 = [];
        this.menu03 = [];  
    }

    // 二级菜单组件列表生成
    menuHandle = () => {
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
            menuList03: tempSubMenu
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
                        <Sider width={200} style={{background: '#fff'}}>
                            <Menu
                                mode="inline"
                                openKeys={this.state.openKeys}
                                onOpenChange={this.onOpenChange}
                                selectedKeys={[this.state.highlight]}
                                style={{height: '100%', borderRight: 0}}
                                onClick={this.setHighlight}>
                                {/*二级菜单栏*/}
                                {this.state.menuList03}
                                {/*<SubMenu key={"sub" + (3)} title={<span>名师入驻</span>}>
                                    <Menu.Item key={8} style={{textAlign: "center"}}>
                                        <Link to="/index/app-home/teacher-certification">
                                            名师认证
                                        </Link>
                                    </Menu.Item>
                                    <Menu.Item key={9} style={{textAlign: "center"}}>
                                        <Link to="/index/app-home/quality-course">
                                            精品课程
                                        </Link>
                                    </Menu.Item>
                                </SubMenu>*/}
                            </Menu>
                        </Sider>
                        {/*二级菜单路由组件映射表*/}
                        <Layout style={{padding: '24px'}}>
                            <Content style={{background: '#fff', padding: "24px 24px 0", margin: 0, minHeight: 406}}>
                                <Route path="/index/app-home/category" component={Category}/>
                                <Route path="/index/app-home/adv-manage" component={AdvManage}/>
                                <Route path="/index/app-home/teacher-certification" component={TeacherCertification}/>
                                <Route path="/index/app-home/quality-course" component={QualityCourse}/>
                                <Route path="/index/app-home/banner" component={Banner}/>
                                <Route path="/index/app-home/crowdFunding" component={CrowdFunding}/>
                                <Route path="/index/app-home/adv-position-manage" component={AdvPositionManage}/>
                                <Route path="/index/app-home/recommend-courses" component={RecommendCourses}/>
                                <Route path="/index/app-home/video-courses" component={VideoCourses}/>
                                <Route path="/index/app-home/recommend-institutions" component={RecommendInstitutions}/>
                            </Content>
                        </Layout>
                    </Layout>
                </div>
            </Router>
        )
    }
}

export default AppHome;