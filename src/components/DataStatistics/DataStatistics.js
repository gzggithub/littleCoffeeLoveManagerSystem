import React, {Component} from 'react';
import {
    HashRouter  as Router,
    Route,
    Link
} from 'react-router-dom';
import CategoryStatistics from './CategoryStatistics';
import InstitutionStatistics from './InstitutionStatistics';
import CourseStatistics from './CourseStatistics';
import Order from './Order';
import EvaluationManage from './EvaluationManage';
import {Layout, Menu, Icon} from 'antd';
const {SubMenu} = Menu;
const {Content, Sider} = Layout;

class InstitutionManage extends Component {
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
        JSON.parse(sessionStorage.menuList).forEach((item) => {
            if (item.url === "/index/data-statistics") {
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
        if (this.props.location.pathname === "/index/data-statistics") {
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
        if (sessionStorage.menuList) {
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
                <div className="data-statistics">
                    <Layout>
                        <Sider width={200} style={{background: '#fff'}}>
                            <Menu
                                mode="inline"
                                selectedKeys={[this.state.highlight]}
                                defaultOpenKeys={['sub1']}
                                style={{height: '100%', borderRight: 0}}
                                onClick={this.setHighlight}
                            >
                                <SubMenu key="sub1" title={<span><Icon type=""/>订单管理</span>}>
                                    {/*{this.state.menuList}*/}
                                    {this.state.menuList}
                                     {/*<Menu.Item key="1" style={{textAlign: "center"}}>
                                        <Link to="/index/data-statistics/order">
                                            订单管理
                                        </Link>
                                    </Menu.Item>
                                    <Menu.Item key="2" style={{textAlign: "center"}}>
                                        <Link to="/index/data-statistics/evaluation-manage">
                                            评价管理
                                        </Link>
                                    </Menu.Item>*/}
                                </SubMenu>
                            </Menu>
                        </Sider>
                        <Layout style={{padding: '24px'}}>
                            <Content style={{background: '#fff', padding: "24px 24px 0", margin: 0, minHeight: 280}}>
                                <Route path="/index/data-statistics/categoryStatistics" component={CategoryStatistics}/>
                                <Route path="/index/data-statistics/institutionStatistics" component={InstitutionStatistics}/>
                                <Route path="/index/data-statistics/courseStatistics" component={CourseStatistics}/>
                                <Route path="/index/data-statistics/order" component={Order}/>
                                <Route path="/index/data-statistics/evaluation-manage" component={EvaluationManage}/>
                            </Content>
                        </Layout>
                    </Layout>
                </div>
            </Router>
        )
    }
}

export default InstitutionManage;