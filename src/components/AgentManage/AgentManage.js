import React, {Component} from 'react';
import {
    HashRouter  as Router,
    Route,
    Link
} from 'react-router-dom';
import All from './All';
import My from './My';
import {Layout, Menu} from 'antd';
const {SubMenu} = Menu;
const {Content, Sider} = Layout;

class AgentManage extends Component {
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
            if (item.url === "/index/agent-manage") {
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
        if (this.props.location.pathname === "/index/agent-manage") {
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
                <div className="agent-manage">
                    <Layout>
                        <Sider width={200} style={{background: '#fff'}}>
                            <Menu
                                mode="inline"
                                selectedKeys={[this.state.highlight]}
                                defaultOpenKeys={['sub1']}
                                style={{height: '100%', borderRight: 0}}
                                onClick={this.setHighlight}
                            >
                                <SubMenu key="sub1" title={<span>代理管理</span>}>
                                    {this.state.menuList}
                                </SubMenu>
                            </Menu>
                        </Sider>
                        <Layout style={{padding: '24px'}}>
                            <Content style={{background: '#fff', padding: "24px 24px 0", margin: 0, minHeight: 280}}>
                                <Route path="/index/agent-manage/all" component={All}/>
                                <Route path="/index/agent-manage/my" component={My}/>
                            </Content>
                        </Layout>
                    </Layout>
                </div>
            </Router>
        )
    }
}

export default AgentManage;