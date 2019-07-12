import React, {Component} from 'react';
import {
    HashRouter  as Router,
    Route,
    Link
} from 'react-router-dom';

import Bank from "./Bank";
import Settle from "./Settle";
import OrderDetail from "./OrderDetail";
import BillDetail from "./BillDetail";
import OrgSettle from "./OrgSettle";
import OrgOrderDetail from "./OrgOrderDetail";
import OrgBillDetail from "./OrgBillDetail";

import Orders from './Orders';
import Finance from "./Finance";
import WithdrawCheck from "./WithdrawCheck";
import RefundCheck from "./RefundCheck";
import BankCards from "./BankCards";


import {Layout, Menu} from 'antd';

const {SubMenu} = Menu;
const {Content, Sider} = Layout;

class FinancialManage extends Component {
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
        JSON.parse(sessionStorage.menuListOne).forEach((item) => {
            if (item.url === "/index/financial-manage") {
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
        if (this.props.location.pathname === "/index/financial-manage") {
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

    onOpenChange = (openKeys) => {
        const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1);
        if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
            this.setState({ openKeys });
        } else {
            this.setState({
                openKeys: latestOpenKey ? [latestOpenKey] : [],
            });
        }
    };

    render() {
        return (
            <Router>
                <div className="financial-manage">
                    <Layout>
                        <Sider width={200} style={{background: '#fff'}}>
                            <Menu
                                mode="inline"
                                openKeys={this.state.openKeys}
                                onOpenChange={this.onOpenChange}
                                selectedKeys={[this.state.highlight]}
                                defaultOpenKeys={['sub1']}
                                style={{height: '100%', borderRight: 0}}
                                onClick={this.setHighlight}
                            >
                                <SubMenu key="sub1" title={<span>财务管理</span>}>
                                    {this.state.menuList}                                                                    
                                </SubMenu>                               
                            </Menu>
                        </Sider>
                        <Layout style={{padding: '24px'}}>
                            <Content style={{ margin: 0, minHeight: 400}}>
                                <Route path="/index/financial-manage/orders" component={Orders}/>
                                <Route path="/index/financial-manage/finance" component={Finance}/>
                                <Route path="/index/financial-manage/withdrawCheck" component={WithdrawCheck}/>
                                <Route path="/index/financial-manage/refundCheck" component={RefundCheck}/>
                                <Route path="/index/financial-manage/bankcards" component={BankCards}/>

                                <Route path="/index/financial-manage/bank" component={Bank}/>
                                <Route path="/index/financial-manage/settle" component={Settle}/>
                                <Route path="/index/financial-manage/order-detail" component={OrderDetail}/>
                                <Route path="/index/financial-manage/bill-detail" component={BillDetail}/>
                                <Route path="/index/financial-manage/org-settle" component={OrgSettle}/>
                                <Route path="/index/financial-manage/org-order-detail" component={OrgOrderDetail}/>
                                <Route path="/index/financial-manage/org-bill-detail" component={OrgBillDetail}/>
                            </Content>
                        </Layout>
                    </Layout>
                </div>
            </Router>
        )
    }
}

export default FinancialManage;