import React, {Component} from 'react';
import {
    HashRouter  as Router,
    Route,
    Link
} from 'react-router-dom';
import GoodsCategory from './GoodsCategory';
import GoodsLabel from './GoodsLabel';
import Goods from './Goods';
import GoodsRefundCheck from './GoodsRefundCheck';
import Agent from './Agent';
import MyCompany from './MyCompany';
import {Layout, Menu, Icon} from 'antd';
const {SubMenu} = Menu;
const {Content, Sider} = Layout;

class MallManage extends Component {
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
            if (item.url === "/index/mall-manage") {
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
        if (this.props.location.pathname === "/index/mall-manage") {
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
                <div className="mall-manage">
                    <Layout>
                        <Sider width={200} style={{background: '#fff'}}>
                            <Menu
                                mode="inline"
                                selectedKeys={[this.state.highlight]}
                                defaultOpenKeys={['sub1']}
                                style={{height: '100%', borderRight: 0}}
                                onClick={this.setHighlight}
                            >
                                <SubMenu key="sub1" title={<span><Icon type=""/>代理管理</span>}>
                                    {this.state.menuList}
                                </SubMenu>
                            </Menu>
                        </Sider>
                        <Layout style={{padding: '24px'}}>
                            <Content style={{background: '#fff', padding: "24px 24px 0", margin: 0, minHeight: 400}}>
                                <Route path="/index/mall-manage/goodsCategory" component={GoodsCategory}/>
                                <Route path="/index/mall-manage/goodsLabel" component={GoodsLabel}/>
                                <Route path="/index/mall-manage/goods" component={Goods}/>
                                <Route path="/index/mall-manage/goodsRefundCheck" component={GoodsRefundCheck}/>
                                <Route path="/index/mall-manage/agent" component={Agent}/>
                                <Route path="/index/mall-manage/myCompany" component={MyCompany}/>
                            </Content>
                        </Layout>
                    </Layout>
                </div>
            </Router>
        )
    }
}

export default MallManage;