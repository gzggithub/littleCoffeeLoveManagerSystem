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
import NewsCategoryManage from './NewsCategoryManage';
import NewsManage from './NewsManage';

import NewsOne from './NewsOne';
import CourseOne from './CourseOne';
import AudioOne from './AudioOne';
import AdvOne from './AdvOne';
import NewsOneCheck from './NewsOneCheck';
import CourseOneCheck from './CourseOneCheck';
import AudioOneCheck from './AudioOneCheck';
import AdvOneCheck from './AdvOneCheck';
import OrderOne from './OrderOne';
import AnswerOne from './AnswerOne';
import BannerOne from './BannerOne';
import RecommendCourseOne from './RecommendCourseOne';
import {Layout, Menu, Icon} from 'antd';
const {SubMenu} = Menu;
const {Content, Sider} = Layout;

class MdhManage extends Component {
    constructor(props) {
        super(props);
        this.rootSubmenuKeys = ['sub1', 'sub2', 'sub3'];
        this.state = {
            menuList: [],
            highlight: "",
            openKeys: ['sub1'],
        };
        this.menu = []
    }

    menuHandle = () => {
        const tempMenuList = [];
        JSON.parse(sessionStorage.menuList).forEach((item, index) => {
            if (item.url === "/index/mdh-manage") {
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
        if (this.props.location.pathname === "/index/mdh-manage") {
            this.setState({
                highlight: "1"
            });
            this.props.history.push(this.menu[0].url);
        }
    };

    setMenu = (value) => {
        this.setState({
            highlight: value.key
        })
    };

    componentWillMount() {
        if (sessionStorage.menuList) {
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
                                {/*<SubMenu key="sub1" title={<span><Icon type=""/>育儿管理</span>}>
                                    {this.state.menuList}
                                </SubMenu>*/}
                                <SubMenu key="sub1" title={<span><Icon type=""/>成长管理</span>}>
                                     <Menu.Item key="1" style={{textAlign: "center"}}>
                                        <Link to="/index/mdh-manage/growth-category-manage">
                                            成长分类管理
                                        </Link>
                                    </Menu.Item>
                                    <Menu.Item key="2" style={{textAlign: "center"}}>
                                        <Link to="/index/mdh-manage/growth-manage">
                                            成长管理
                                        </Link>
                                    </Menu.Item>
                                    <Menu.Item key="3" style={{textAlign: "center"}}>
                                        <Link to="/index/mdh-manage/doubtful-answer">
                                            疑惑解答
                                        </Link>
                                    </Menu.Item>                                    
                                </SubMenu>
                                <SubMenu key="sub2" title={<span><Icon type=""/>听书管理</span>}>
                                    <Menu.Item key="4" style={{textAlign: "center"}}>
                                        <Link to="/index/mdh-manage/listening-book-category-manage">
                                            听书分类管理
                                        </Link>
                                    </Menu.Item>
                                </SubMenu>
                                <SubMenu key="sub3" title={<span><Icon type=""/>资讯管理</span>}>
                                    <Menu.Item key="6" style={{textAlign: "center"}}>
                                        <Link to="/index/mdh-manage/news-category-manage">
                                            资讯分类管理
                                        </Link>
                                    </Menu.Item>
                                    <Menu.Item key="7" style={{textAlign: "center"}}>
                                        <Link to="/index/mdh-manage/news-manage">
                                            资讯管理
                                        </Link>
                                    </Menu.Item>
                                </SubMenu>
                            </Menu>
                        </Sider>
                        <Layout style={{padding: '24px'}}>
                            <Content style={{background: '#fff', padding: "24px 24px 0", margin: 0, minHeight: 725}}>
                                <Route path="/index/mdh-manage/growth-category-manage" component={GrowthCategoryManage}/>
                                <Route path="/index/mdh-manage/growth-manage" component={GrowthManage}/>
                                <Route path="/index/mdh-manage/doubtful-answer" component={DoubtfulAnswer}/>
                                <Route path="/index/mdh-manage/listening-book-category-manage" component={ListeningBookCategoryManage}/>
                                <Route path="/index/mdh-manage/news-category-manage" component={NewsCategoryManage}/>
                                <Route path="/index/mdh-manage/news-manage" component={NewsManage}/>

                                <Route path="/index/mdh-manage/newsOne" component={NewsOne}/>
                                <Route path="/index/mdh-manage/courseOne" component={CourseOne}/>
                                <Route path="/index/mdh-manage/audioOne" component={AudioOne}/>
                                <Route path="/index/mdh-manage/advOne" component={AdvOne}/>
                                <Route path="/index/mdh-manage/newsOneCheck" component={NewsOneCheck}/>
                                <Route path="/index/mdh-manage/courseOneCheck" component={CourseOneCheck}/>
                                <Route path="/index/mdh-manage/audioOneCheck" component={AudioOneCheck}/>
                                <Route path="/index/mdh-manage/advOneCheck" component={AdvOneCheck}/>
                                <Route path="/index/mdh-manage/orderOne" component={OrderOne}/>
                                <Route path="/index/mdh-manage/answerOne" component={AnswerOne}/>
                                <Route path="/index/mdh-manage/bannerOne" component={BannerOne}/>
								<Route path="/index/mdh-manage/recommendCourseOne" component={RecommendCourseOne}/>
                            </Content>
                        </Layout>
                    </Layout>
                </div>
            </Router>
        )
    }
}

export default MdhManage;