import React, {Component} from 'react';
import {
    Button,
    Row,
    Col,
    Icon,
    message,
    Rate,
    Tabs,
} from 'antd';
import '../../config/config';
import reqwest from 'reqwest';

const TabPane = Tabs.TabPane;

class Snapshot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            flag_add: false,
            data: {},
            courseInfo: {},
            photo: [],
            rate: 0, 
        };    
    }

    getData = () => {
        this.refs.getDataCopy.getData();
    };

    //订单位置设置
    setType = (value) => {
        console.log("selected:", value);
        this.setState({
            keyword: {
                type: value,
            }
        })
    };

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
        // 菜单信息为空则直接返回登陆页
        if (!sessionStorage.menuList) {
            this.toLoginPage();
            return
        }
        JSON.parse(sessionStorage.menuList).forEach((item) => {
            item.children.forEach((subItem) => {
                if (subItem.url === this.props.location.pathname) {
                    let data = {};
                    subItem.children.forEach((thirdItem) => {
                        data[thirdItem.url] = true;
                    });
                    this.setState({
                        opObj: data
                    })
                }
            })
        })
    };

    setFlag = () => {
        this.setState({
            flag_add: !this.state.flag_add
        })
    };

    // 登陆信息过期或不存在时的返回登陆页操作
    toLoginPage = () => {
        sessionStorage.clear();
        this.props.history.push('/')
    };

    //获取本页信息
    getData = (orderDetailsId) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/order/snapshot',
            type: 'json',
            method: 'get',
            data: {
                orderDetailsId: orderDetailsId,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                const tempRate = Math.ceil(json.data.totalScore / json.data.scoreNumber) || 0;
                if (json.result === 0) {
                    console.log(json.data);
                    this.setState({
                        loading: false,
                        data: json.data,
                        rate: tempRate,
                        courseInfo: json.data.courseInfo,
                        photo: json.data.courseResourceList,                        
                    });
                    console.log(this.state.photo);
                    console.log(this.state.rate)
                } else {
                    if (json.code === 901) {
                        message.error("请先登录");
                        // 返回登陆页
                        this.toLoginPage();
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.toLoginPage();
                    } else {
                        message.error(json.message);
                        this.setState({
                            loading: false
                        })
                    }
                }
            }
        });
    };

    componentWillMount() {
        // this.setPower();

        console.log(this.props);
        if (Number(this.props.location.search.substring(1)) && Number(this.props.location.search.substring(1)) !== 0) {
            sessionStorage.orderDetailsId = Number(this.props.location.search.substring(1));
        }        
        this.getData(sessionStorage.orderDetailsId);

        if (this.props.location.search) {
            this.props.history.push(this.props.location.pathname)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location.search) {
            this.props.history.push(nextProps.location.pathname);
            this.setFlag();
        }
    }

    // 返回按钮
    handleBack = () => {
        this.props.history.push('/index/user-manage/order');
        // this.props.history.go(-1);
        this.props.history.goBack();
    };

    render() {

        return (
            <div className="institutions snapshot">
                {
                    <div>
                        <header style={{marginBottom: "10px", background: "#FFF", minHeight: "60px", position: "relative"}}>
                            <div className="billBack">
                                <Button onClick={this.handleBack}><Icon type="left"/>返回</Button>
                            </div>
                        </header>
                        <div style={{padding: "0 24px", marginBottom: "10px", background: "#F8E9DA", minHeight: "60px", lineHeight: "60px"}}>                   
                            当前页面内容为<span style={{color: "#0079FE"}}>订单快照</span>，包含订单创建时商品描述，买卖双方和平台发生争议时，该页面作为判定依据。                                
                        </div>
                        <div style={{background: "#FFF"}}>
                            <Row gutter={24}>
                                <Col span={8}>
                                    <div style={{padding: "20px"}}>
                                        <img style={{width: "100%"}} src={"http://image.taoerxue.cn/" + (this.state.photo.length === 1 ? this.state.photo[0].path : "")} alt=""/>
                                    </div>
                                    <div style={{padding: "20px"}}>
                                        <img style={{width: "25%", marginRight: "20px"}} src={"http://image.taoerxue.cn/" + (this.state.photo.length === 1 ? this.state.photo[0].path : "")} alt=""/>
                                        <img style={{width: "25%", marginRight: "20px"}} src={"http://image.taoerxue.cn/" + (this.state.photo.length === 1 ? this.state.photo[0].path : "")} alt=""/>
                                    </div>
                                </Col>
                                <Col span={16}>
                                    <h3 style={{minHeight: "100px", lineHeight: "100px", fontSize: "20px"}}>
                                        {this.state.courseInfo.name}
                                    </h3>
                                    <div style={{background: "#F2F2F2",minHeight: "100px", lineHeight: "100px", paddingLeft: "5px"}}>
                                        <span style={{color: "#FF0000", fontSize: "32px", marginRight: "10px"}}>￥{this.state.courseInfo.price}</span>
                                        <span style={{color: "#7D667D", fontSize: "12px"}}>￥{this.state.courseInfo.originalPrice}</span>
                                    </div>
                                    <div style={{padding: "20px"}}>
                                        <Row gutter={24}>
                                            <Col span={6}>
                                                <div style={{width: "50px", height: "50px", borderRadius: "100%", background: "#CCCCCC"}}></div>
                                                <div style={{color: "#999999"}}>适合年龄</div>
                                                <div style={{fontWeight: "bold"}}>{this.state.courseInfo.schoolAgeBegin}-{this.state.courseInfo.schoolAgeEnd}周岁</div>
                                            </Col>
                                            <Col span={6}>
                                                <div style={{width: "50px", height: "50px", borderRadius: "100%", background: "#CCCCCC"}}></div>
                                                <div style={{color: "#999999"}}>适合基础</div>
                                                <div style={{fontWeight: "bold"}}>{this.state.courseInfo.studentLevelName }</div>
                                            </Col>
                                            <Col span={6}>
                                                <div style={{width: "50px", height: "50px", borderRadius: "100%", background: "#CCCCCC"}}></div>
                                                <div style={{color: "#999999"}}>开班人数</div>
                                                <div style={{fontWeight: "bold"}}>满{this.state.courseInfo.number}人开班</div>
                                            </Col>
                                            <Col span={6}>
                                                <div style={{width: "50px", height: "50px", borderRadius: "100%", background: "#CCCCCC"}}></div>
                                                <div style={{color: "#999999"}}>课程课时</div>
                                                <div style={{fontWeight: "bold"}}>{this.state.courseInfo.count}课时</div>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div>
                                        <h4>课程特色</h4>
                                        <ul>
                                            {/*<li style={{listStyle: "disc"}}>侵入式学习  小班制授课</li>*/}
                                            <li style={{listStyle: "disc"}}>{this.state.courseInfo.sketch}</li>
                                        </ul>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        <div className="card-container">
                            <Tabs type="card">
                                <TabPane tab="课程详情" key="1">
                                    <h4 className="h4-liear-gradient"><span></span>课程介绍</h4>
                                    <ul>
                                        <li style={{listStyle: "disc"}}>{this.state.courseInfo.characteristic}</li>
                                    </ul>
                                    <h4 className="h4-liear-gradient"><span></span>学习目标</h4>
                                    <ul>
                                        <li style={{listStyle: "disc"}}>{this.state.courseInfo.target}</li>
                                    </ul>
                                    <h3>购买须知</h3>
                                    <Row gutter={24}>
                                        <Col span={2}>
                                            <div style={{color: "#9999B3"}}>购买说明</div>
                                        </Col>
                                        <Col span={6}>
                                            <div>{this.state.courseInfo.tips}</div>
                                        </Col>
                                    </Row>
                                    <Row gutter={24}>
                                        <Col span={2}>
                                            <div style={{color: "#9999B3"}}>温馨提示</div>
                                        </Col>
                                        <Col span={6}>
                                            <div>{this.state.courseInfo.warmPrompt }</div>
                                        </Col>
                                    </Row>
                                    <Row gutter={24}>
                                        <Col span={2}>
                                            <div style={{color: "#9999B3"}}>官方说明</div>
                                        </Col>
                                        <Col span={6}>
                                            <div>{this.state.courseInfo.official}</div>
                                        </Col>
                                    </Row>
                                </TabPane>
                            </Tabs>
                          </div>
                        <footer style={{background: "#F2F2F2", border: "1px solid #e8e8e8"}}>
                            <Row gutter={24}>
                                <Col span={16} >
                                    <div style={{height: "50px", lineHeight: "50px", fontSize: "16px", paddingLeft: "20px"}}>{this.state.courseInfo.orgName}</div>
                                    <div style={{height: "50px", paddingLeft: "20px"}}>
                                        {/*<Rate disabled defaultValue={Math.ceil(this.state.data.totalScore / this.state.data.scoreNumber)} /> {(Math.ceil(this.state.data.totalScore / this.state.data.scoreNumber)) === 0 ? "暂无星级" : ""}*/}
                                        <Rate disabled defaultValue={0} value={this.state.rate} count={5}/> {this.state.rate === 0 ? "暂无星级" : ""}
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div style={{borderLeft: "1px solid #CCCCCC", fontSize: "18px", color: "#FF9900", minHeight: "80px", lineHeight: "80px", paddingLeft: "20px", margin: "20px 0"}}>{this.state.data.orgPhone}</div>
                                </Col>
                            </Row>
                        </footer>                       
                    </div>
                }
            </div>  
        )
    }
}

export default Snapshot;