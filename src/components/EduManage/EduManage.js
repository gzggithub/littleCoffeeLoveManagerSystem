import React, {Component} from 'react';
import {
    HashRouter  as Router,
    Route,
    Link
} from 'react-router-dom';

import GrowthCategoryManage from './GrowthCategoryManage';
import GrowthManage from './GrowthManage';
import DoubtfulAnswer from './DoubtfulAnswer';
import ListeningBookCategoryManage from './ListeningBookCategoryManage';
import ListeningBookManage from './ListeningBookManage';
import NewsCategoryManage from './NewsCategoryManage';
import NewsManage from './NewsManage';

import {Layout, Menu} from 'antd';
const {SubMenu} = Menu;
const {Content, Sider} = Layout;

class MdhManage extends Component {
    constructor(props) {
        super(props);
        this.rootSubmenuKeys = ['sub1', 'sub2', 'sub3'];
        this.state = {
            menuList: [],
            menuList02: [],
            menuList03: [],
            menuList04: [],
            highlight: "",
            openKeys: ['sub1'],
        };
        this.menu = [];
        this.menu02 = [];
        this.menu03 = [];
        this.menu04 = [];
    }

    menuHandle = () => {
        const tempSubMenu = [];
        JSON.parse(sessionStorage.menuListOne).forEach((item, index) => {
            if (item.url === "/index/edu-manage") {               
                if (item.children) {
                    this.menu04 = item.children;
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
       
        // console.log(this.menu04);
        this.menu04.forEach((item, index) => {
            if (item.children) {
                item.children.forEach((subItem, subIndex) => {
                    // console.log(subItem.url);
                    // console.log(this.props.location.pathname);
                    if (subItem.url === this.props.location.pathname) {
                        this.setState({
                            highlight: (subIndex + 1).toString()
                        })
                    }
                })                
            }
        });

        this.setState({
            // 一级菜单下的所有二级三级菜单
            menuList04: tempSubMenu,
        });
        // 设置高亮项
        // console.log(this.props.location.pathname);
        if (this.props.location.pathname === "/index/edu-manage") {
            this.menu04.forEach((item, index) => {
                if (item.children) {
                    item.children.forEach((subItem, subIndex) => {                       
                        // if (subItem.url === this.props.location.pathname) {
                        if (subItem.name === this.menu04[0].children[0].name) {
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

    setMenu = (value) => {
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
        if (nextProps.location.search) {
            this.menuHandle();
            this.setState({
                highlight: "1"
            })
        }
    }
    
    // SubMenu 展开/关闭的回调
    onOpenChange = (openKeys) => {
        // 当前展开的 SubMenu 菜单项 key 数组
        const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1);
        console.log(latestOpenKey)
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
                <div className="information-manage">
                    <Layout>
                        <Sider width={200} style={{background: '#fff'}}>
                            <Menu
                                mode="inline"
                                openKeys={this.state.openKeys}
                                onOpenChange={this.onOpenChange}
                                selectedKeys={[this.state.highlight]}
                                // defaultOpenKeys={['sub1']}
                                style={{height: '100%', borderRight: 0}}
                                onClick={this.setMenu}
                            >
                                {this.state.menuList04}
                            </Menu>
                        </Sider>
                        <Layout style={{padding: '24px'}}>
                            <Content style={{background: '#fff', padding: "24px 24px 0", margin: 0, minHeight: 725}}>
                                <Route path="/index/edu-manage/growth-category-manage" component={GrowthCategoryManage}/>
                                <Route path="/index/edu-manage/growth-manage" component={GrowthManage}/>
                                <Route path="/index/edu-manage/doubtful-answer" component={DoubtfulAnswer}/>
                                <Route path="/index/edu-manage/listening-book-category-manage" component={ListeningBookCategoryManage}/>
                                <Route path="/index/edu-manage/listening-book-manage" component={ListeningBookManage}/>
                                <Route path="/index/edu-manage/news-category-manage" component={NewsCategoryManage}/>
                                <Route path="/index/edu-manage/news-manage" component={NewsManage}/>
                            </Content>
                        </Layout>
                    </Layout>
                </div>
            </Router>
        )
    }
}

export default MdhManage;