import React, {Component} from 'react';
import {
    Table,
    Modal,
    DatePicker,
    List,
    message,
    Tabs
} from 'antd';
import '../../config/config.js';
import reqwest from 'reqwest';

const TabPane = Tabs.TabPane;

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//订单详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        data: "",
        loading: true
    };

    timeHandle = (para) => {
        const tempDate = new Date(para.replace("CST", "GMT+0800")),
            oMonthT = (tempDate.getMonth() + 1).toString(),
            oMonth = oMonthT.length <= 1 ? "0" + oMonthT : oMonthT,
            oDayT = tempDate.getDate().toString(),
            oDay = oDayT.length <= 1 ? "0" + oDayT : oDayT,
            oYear = tempDate.getFullYear().toString(),
            oHourT = tempDate.getHours().toString(),
            oHour = oHourT.length <= 1 ? "0" + oHourT : oHourT,
            oMinuteT = tempDate.getMinutes().toString(),
            oMinute = oMinuteT.length <= 1 ? "0" + oMinuteT : oMinuteT,
            oTime = oYear + '-' + oMonth + '-' + oDay + " " + oHour + ":" + oMinute;
        return oTime;
    };

    getData = () => {
        reqwest({
            url: '/mdhOrder/getOrderDetail',
            type: 'json',
            method: 'post',
            data: {
                id: this.props.id
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                })
                // const json = {
                //     result: 0,
                //     data: {
                //         mdhOrder: {
                //             id: null,
                //             type: null,
                //             orderSn: "",
                //             tradeNo: "",
                //             belongId: null,
                //             userId: null,
                //             nickname: "",
                //             phone: "",
                //             payWay: null,
                //             totalPrice: "",
                //             orderAmount: "",
                //             remark: "",
                //             createTime: "",
                //             paidTime: "",
                //             state: null,
                //         }
                //     },
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        data: json.data.mdhOrder
                    });
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.props.toLoginPage();
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

    showModal = () => {
        this.getData();
        this.setState({
            visible: true
        })
    };

    handleCancel = () => {
        this.setState({visible: false});
    };

    render() {
        let dataSource;
        if (this.state.data) {
            let tempPayWay = "";
            if (this.state.data.payWay === 0) {
                tempPayWay = "微信支付";
            }
            if (this.state.data.payWay === 1) {
                tempPayWay = "支付宝支付";
            }
            if (this.state.data.payWay === 2) {
                tempPayWay = "免费";
            }
            dataSource = [
                <div className="orderSn">
                    <span className="item-name">订单编号：</span>
                    <span className="item-content">{this.state.data.orderSn}</span>
                </div>,
                <div className="tradeNo">
                    <span className="item-name">外部单号：</span>
                    <span className="item-content">{this.state.data.tradeNo}</span>
                </div>,
                <div className="name">
                    <span className="item-name">联系人：</span>
                    <span className="item-content">{this.state.data.nickname}</span></div>,
                <div className="phone">
                    <span className="item-name">手机号码：</span>
                    <span className="item-content">{this.state.data.phone}</span>
                </div>,
                <div className="payWay">
                    <span className="item-name">付款方式：</span>
                    <span className="item-content">{tempPayWay}</span>
                </div>,
                <div className="totalPrice">
                    <span className="item-name">商品原价：</span>
                    <span className="item-content">{this.state.data.totalPrice}</span>
                </div>,
                <div className="orderAmount">
                    <span className="item-name">实际付款：</span>
                    <span className="item-content">{this.state.data.orderAmount}</span>
                </div>,
                <div className="createTime">
                    <span className="item-name">下单时间：</span>
                    <span className="item-content">
                    {this.state.data.createTime ? this.timeHandle(this.state.data.createTime) : ""}
                </span>
                </div>,
                <div className="paidTime">
                    <span className="item-name">付款时间：</span>
                    <span className="item-content">
                    {this.state.data.createTime ? this.timeHandle(this.state.data.paidTime) : ""}
                </span>
                </div>,
                <div className="remark">
                    <span className="item-name">备注：</span>
                    <span className="item-content">{this.state.data.remark || "暂无"}</span>
                </div>
            ];
        } else {
            dataSource = ""
        }
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={() => this.showModal(this.props.id)}>详情</span>
                <Modal
                    title="订单详情"
                    width={600}
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                    destroyOnClose={true}
                >
                    <div className="orderOne-details">
                        <div className="orderOne-baseData">
                            <List
                                size="small"
                                split="false"
                                dataSource={dataSource}
                                renderItem={item => (<List.Item>{item}</List.Item>)}
                                loading={this.state.loading}
                            />
                        </div>
                    </div>
                </Modal>
            </a>
        );
    }
}

//音频详情组件
class AudioDetails extends Component {
    state = {
        visible: false,
        data: "",
        loading: true
    };

    showModal = () => {
        this.getData();
        this.setState({
            visible: true,
        })
    };

    //日期处理
    timeHandle = (para) => {
        const tempDate = new Date(para.replace("CST", "GMT+0800")),
            oMonthT = (tempDate.getMonth() + 1).toString(),
            oMonth = oMonthT.length <= 1 ? "0" + oMonthT : oMonthT,
            oDayT = tempDate.getDate().toString(),
            oDay = oDayT.length <= 1 ? "0" + oDayT : oDayT,
            oYear = tempDate.getFullYear().toString(),
            oHourT = tempDate.getHours().toString(),
            oHour = oHourT.length <= 1 ? "0" + oHourT : oHourT,
            oMinuteT = tempDate.getMinutes().toString(),
            oMinute = oMinuteT.length <= 1 ? "0" + oMinuteT : oMinuteT,
            oSecondT = tempDate.getSeconds().toString(),
            oSecond = oSecondT.length <= 1 ? "0" + oSecondT : oSecondT,
            oTime = oYear + '-' + oMonth + '-' + oDay + " " + oHour + ":" + oMinute + ":" + oSecond;
        return oTime;
    };

    getData = () => {
        reqwest({
            url: '/mdhOrder/getOrderInformation',
            type: 'json',
            method: 'post',
            data: {
                belongId: this.props.id,
                type: 0
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                })
                // const json = {
                //     result: 0,
                //     data: {
                //         mdhListenBook: {
                //             id: null,
                //             name: "",
                //             photo: "",
                //             type: null,
                //             duration: "",
                //             playbackNum: null,
                //             originalPrice: "",
                //             price: "",
                //             linkAddress: "",
                //             createUser: "",
                //             createTime: "",
                //             examineUser: "",
                //             examineTime: "",
                //             opinion: "",
                //             state: null
                //         }
                //     },
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        data: json.data.mdhListenBook
                    });
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.props.toLoginPage();
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

    handleCancel = () => {
        this.setState({visible: false});
    };

    render() {
        let dataSource;
        if (this.state.data) {
            let tempType = "";
            if (this.state.data.type === 0) {
                tempType = "孩子听书";
            }
            if (this.state.data.type === 1) {
                tempType = "父母听书";
            }
            dataSource = [
                <div className="name">
                    <span className="item-name">音频名称：</span>
                    <span className="item-content">{this.state.data.name}</span>
                </div>,
                <div className="type">
                    <span className="item-name">音频类型：</span>
                    <span className="item-content">{tempType}</span>
                </div>,
                <div className="photo">
                    <span className="item-name">图片：</span>
                    <img src={"http://image.taoerxue.com/" + this.state.data.photo} alt="" className="item-content"/>
                </div>,
                <div className="duration">
                    <span className="item-name">音频时长：</span>
                    <span className="item-content">{this.state.data.duration}</span>
                </div>,
                <div className="playbackNum">
                    <span className="item-name">播放次数：</span>
                    <span className="item-content">{this.state.data.playbackNum}</span>
                </div>,
                <div className="originalPrice">
                    <span className="item-name">原价：</span>
                    <span className="item-content">￥{this.state.data.originalPrice}</span>
                </div>,
                <div className="price">
                    <span className="item-name">现价：</span>
                    <span className="item-content">￥{this.state.data.price}</span>
                </div>,
                <div className="linkAddress">
                    <span className="item-name">音频地址：</span>
                    <span
                        className="item-content">{this.state.data.linkAddress ? ("http://image.taoerxue.com/" + this.state.data.linkAddress) : ""}</span>
                </div>,
                <div className="createTime">
                    <span className="item-name">创建时间：</span>
                    <span
                        className="item-content">{this.state.data.createTime ? this.timeHandle(this.state.data.createTime) : ""}</span>
                </div>
            ];
        } else {
            dataSource = ""
        }
        return (
            <a style={{display: this.props.type === 0 ? "inline" : "none"}}>
                <span onClick={this.showModal}>商品详情</span>
                <Modal
                    title="音频详情"
                    width={600}
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                    destroyOnClose={true}
                >
                    <div className="audioOne-details">
                        <div className="audioOne-baseData">
                            <List
                                size="small"
                                split="false"
                                dataSource={dataSource}
                                renderItem={item => (<List.Item>{item}</List.Item>)}
                                loading={this.state.loading}
                            />
                        </div>
                    </div>
                </Modal>
            </a>
        );
    }
}

//线下课程详情组件
class Course01Details extends Component {
    state = {
        visible: false,
        data: "",
        loading: true
    };

    showModal = () => {
        this.getData();
        this.setState({
            visible: true,
        })
    };

    dateHandle = (para) => {
        const tempDate = new Date(para.replace("CST", "GMT+0800")),
            oMonthT = (tempDate.getMonth() + 1).toString(),
            oMonth = oMonthT.length <= 1 ? "0" + oMonthT : oMonthT,
            oDayT = tempDate.getDate().toString(),
            oDay = oDayT.length <= 1 ? "0" + oDayT : oDayT,
            oYear = tempDate.getFullYear().toString(),
            oTime = oYear + '-' + oMonth + '-' + oDay;
        return oTime;
    };

    getData = () => {
        reqwest({
            url: '/mdhOrder/getOrderInformation',
            type: 'json',
            method: 'post',
            data: {
                belongId: this.props.id,
                type: 1
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                })
                // const json = {
                //     result: 0,
                //     data: {
                //         mdhCourse: {
                //             name: "",
                //             photo: "",
                //             openClassDate: "",
                //             openClassPeopleNum: null,
                //             teacherInfo: "",
                //             summary: "",
                //             suitablePeople: "",
                //             courseCollect: "",
                //             originalPrice: "",
                //             price: "",
                //             openClassAddress: "",
                //             opinion: "",
                //             state: null
                //         }
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        data: json.data.mdhCourse
                    });
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.props.toLoginPage();
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

    handleCancel = () => {
        this.setState({visible: false});
    };

    render() {
        let dataSource;
        if (this.state.data) {
            dataSource = [
                <div className="name">
                    <span className="item-name">课程名称：</span>
                    <span className="item-content">{this.state.data.name}</span>
                </div>,
                <div className="photo">
                    <span className="item-name">图片：</span>
                    <img src={"http://image.taoerxue.com/" + this.state.data.photo} alt="" className="item-content"/>
                </div>,
                <div className="openClassDate">
                    <span className="item-name">开课时间：</span>
                    <span
                        className="item-content">{this.state.data.openClassDate ? this.dateHandle(this.state.data.openClassDate) : ""}</span>
                </div>,
                <div className="openClassPeopleNum">
                    <span className="item-name">课程人数：</span>
                    <span className="item-content">{this.state.data.openClassPeopleNum}</span>
                </div>,
                <div className="openClassAddress">
                    <span className="item-name">开课地点：</span>
                    <span className="item-content">{this.state.data.openClassAddress}</span>
                </div>,
                <div className="summary">
                    <span className="item-name">课程概述：</span>
                    <span className="item-content">{this.state.data.summary}</span>
                </div>,
                <div className="teacherInfo">
                    <span className="item-name">教师信息：</span>
                    <span className="item-content">{this.state.data.teacherInfo}</span>
                </div>,
                <div className="suitablePeople">
                    <span className="item-name">适宜人群：</span>
                    <span className="item-content">{this.state.data.suitablePeople}</span>
                </div>,
                <div className="courseCollect">
                    <span className="item-name">课程收获：</span>
                    <span className="item-content">{this.state.data.courseCollect}</span>
                </div>,
                <div className="originalPrice">
                    <span className="item-name">原价：</span>
                    <span className="item-content">￥{this.state.data.originalPrice}</span>
                </div>,
                <div className="price">
                    <span className="item-name">现价：</span>
                    <span className="item-content">￥{this.state.data.price}</span>
                </div>
            ];
        } else {
            dataSource = ""
        }
        return (
            <a style={{display: this.props.type === 1 ? "inline" : "none"}}>
                <span onClick={this.showModal}>商品详情</span>
                <Modal
                    title="课程详情"
                    width={600}
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                    destroyOnClose={true}
                >
                    <div className="courseOne-details">
                        <div className="courseOne-baseData">
                            <List
                                size="small"
                                split="false"
                                dataSource={dataSource}
                                renderItem={item => (<List.Item>{item}</List.Item>)}
                                loading={this.state.loading}
                            />
                        </div>
                    </div>
                </Modal>
            </a>
        );
    }
}

//线上课程详情组件
class Course02Details extends Component {
    state = {
        visible: false,
        data: "",
        loading: true
    };

    showModal = () => {
        this.getData();
        this.setState({
            visible: true,
        })
    };

    dateHandle = (para) => {
        const tempDate = new Date(para.replace("CST", "GMT+0800")),
            oMonthT = (tempDate.getMonth() + 1).toString(),
            oMonth = oMonthT.length <= 1 ? "0" + oMonthT : oMonthT,
            oDayT = tempDate.getDate().toString(),
            oDay = oDayT.length <= 1 ? "0" + oDayT : oDayT,
            oYear = tempDate.getFullYear().toString(),
            oTime = oYear + '-' + oMonth + '-' + oDay;
        return oTime;
    };

    getData = () => {
        reqwest({
            url: '/mdhOrder/getOrderInformation',
            type: 'json',
            method: 'post',
            data: {
                belongId: this.props.id,
                type: 2
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                })
                // const json = {
                //     result: 0,
                //     data: {
                //         mdhCourse: {
                //             name: "",
                //             photo: "",
                //             openClassDate: "",
                //             openClassPeopleNum: null,
                //             teacherInfo: "",
                //             summary: "",
                //             suitablePeople: "",
                //             courseCollect: "",
                //             linkAddress: "",
                //             originalPrice: "",
                //             price: "",
                //             openClassAddress: "",
                //             opinion: "",
                //             state: null
                //         }
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        data: json.data.mdhCourse
                    });
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.props.toLoginPage();
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

    handleCancel = () => {
        this.setState({visible: false});
    };

    render() {
        let dataSource;
        if (this.state.data) {
            dataSource = [
                <div className="name">
                    <span className="item-name">课程名称：</span>
                    <span className="item-content">{this.state.data.name}</span>
                </div>,
                <div className="photo">
                    <span className="item-name">图片：</span>
                    <img src={"http://image.taoerxue.com/" + this.state.data.photo} alt="" className="item-content"/>
                </div>,
                <div className="openClassDate">
                    <span className="item-name">开课时间：</span>
                    <span
                        className="item-content">{this.state.data.openClassDate ? this.dateHandle(this.state.data.openClassDate) : ""}</span>
                </div>,
                <div className="openClassPeopleNum">
                    <span className="item-name">课程人数：</span>
                    <span className="item-content">{this.state.data.openClassPeopleNum}</span>
                </div>,
                <div className="openClassAddress">
                    <span className="item-name">开课地点：</span>
                    <span className="item-content">{this.state.data.openClassAddress}</span>
                </div>,
                <div className="summary">
                    <span className="item-name">课程概述：</span>
                    <span className="item-content">{this.state.data.summary}</span>
                </div>,
                <div className="linkAddress">
                    <span className="item-name">音频地址：</span>
                    <span
                        className="item-content">{this.state.data.linkAddress ? ("http://image.taoerxue.com/" + this.state.data.linkAddress) : ""}</span>
                </div>,
                <div className="teacherInfo">
                    <span className="item-name">教师信息：</span>
                    <span className="item-content">{this.state.data.teacherInfo}</span>
                </div>,
                <div className="suitablePeople">
                    <span className="item-name">适宜人群：</span>
                    <span className="item-content">{this.state.data.suitablePeople}</span>
                </div>,
                <div className="courseCollect">
                    <span className="item-name">课程收获：</span>
                    <span className="item-content">{this.state.data.courseCollect}</span>
                </div>,
                <div className="originalPrice">
                    <span className="item-name">原价：</span>
                    <span className="item-content">￥{this.state.data.originalPrice}</span>
                </div>,
                <div className="price">
                    <span className="item-name">现价：</span>
                    <span className="item-content">￥{this.state.data.price}</span>
                </div>
            ];
        } else {
            dataSource = ""
        }
        return (
            <a style={{display: this.props.type === 2 ? "inline" : "none"}}>
                <span onClick={this.showModal}>商品详情</span>
                <Modal
                    title="课程详情"
                    visible={this.state.visible}
                    width={600}
                    footer={null}
                    onCancel={this.handleCancel}
                    destroyOnClose={true}
                >
                    <div className="courseOne-details">
                        <div className="courseOne-baseData">
                            <List
                                size="small"
                                split="false"
                                dataSource={dataSource}
                                renderItem={item => (<List.Item>{item}</List.Item>)}
                                loading={this.state.loading}
                            />
                        </div>
                    </div>
                </Modal>
            </a>
        );
    }
}

//订单列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            originalData: [],
            data: [],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.orderOneSize) || 10,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            },
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '订单编号',
                dataIndex: 'orderSn',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'orderSn'),
            },
            {
                title: "联系人",
                dataIndex: "linkman",
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, "linkman"),
            },
            {
                title: "联系电话",
                dataIndex: "phone",
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, "phone"),
            },
            {
                title: '创建时间',
                dataIndex: 'createTime',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*订单详情*/}
                            <ItemDetails id={record.id} toLoginPage={this.props.toLoginPage} opStatus={this.props.opObj.select}/>
                            {/*音频详情*/}
                            <AudioDetails id={record.belongId} type={record.type} toLoginPage={this.props.toLoginPage}/>
                            {/*线下课程详情*/}
                            <Course01Details id={record.belongId} type={record.type} toLoginPage={this.props.toLoginPage}/>
                            {/*线上课程详情*/}
                            <Course02Details id={record.belongId} type={record.type} toLoginPage={this.props.toLoginPage}/>
                        </div>
                    );
                },
            }
        ];
    }

    timeHandle = (para) => {
        const tempDate = new Date(para.replace("CST", "GMT+0800")),
            oMonthT = (tempDate.getMonth() + 1).toString(),
            oMonth = oMonthT.length <= 1 ? "0" + oMonthT : oMonthT,
            oDayT = tempDate.getDate().toString(),
            oDay = oDayT.length <= 1 ? "0" + oDayT : oDayT,
            oYear = tempDate.getFullYear().toString(),
            oHourT = tempDate.getHours().toString(),
            oHour = oHourT.length <= 1 ? "0" + oHourT : oHourT,
            oMinuteT = tempDate.getMinutes().toString(),
            oMinute = oMinuteT.length <= 1 ? "0" + oMinuteT : oMinuteT,
            oTime = oYear + '-' + oMonth + '-' + oDay + " " + oHour + ":" + oMinute;
        return oTime;
    };

    //获取本页信息
    getData = (keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/mdhOrder/getOrderList',
            type: 'json',
            method: 'post',
            data: {
                type: keyword ? keyword.type : this.props.keyword.type,
                startTime: keyword ? keyword.startTime : this.props.keyword.startTime,
                endTime: keyword ? keyword.endTime : this.props.keyword.endTime,
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                })
                // const json = {
                //     result: 0,
                //     data: {
                //         size: 100,
                //         list: [
                //             {
                //                 id: null,
                //                 type: 2,
                //                 orderSn: "",
                //                 tradeNo: "",
                //                 belongId: null,
                //                 userId: null,
                //                 nickname: "",
                //                 phone: "",
                //                 payWay: null,
                //                 totalPrice: "",
                //                 orderAmount: "",
                //                 remark: "",
                //                 createTime: "",
                //                 paidTime: "",
                //                 state: null,
                //             },
                //         ]
                //     }
                // };
            },
            success: (json) => {
                const data = [];
                if (json.result === 0) {
                    if (json.data.list.length === 0 && this.state.pagination.current !== 1) {
                        this.setState({
                            pagination: {
                                current: 1,
                                pageSize: this.state.pagination.pageSize
                            }
                        }, () => {
                            this.getData();
                        });
                        return
                    }
                    json.data.list.forEach((item, index) => {
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            type: item.type,
                            belongId: item.belongId,
                            orderSn: item.orderSn,
                            linkman: item.nickname,
                            phone: item.phone,
                            createTime: item.createTime ? this.timeHandle(item.createTime) : ""
                        });
                    });
                    this.setState({
                        loading: false,
                        originalData: json.data.list,
                        data: data,
                        pagination: {
                            total: json.data.size,
                            current: this.state.pagination.current,
                            pageSize: this.state.pagination.pageSize
                        }
                    });
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.props.toLoginPage();
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

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    //页码变化处理
    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.orderOneSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.orderOneSize);
        this.setState({
            pagination: pager,
        }, () => {
            this.getData();
        });
    };

    componentWillMount() {
        this.getData();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.keyword !== this.props.keyword) {
            this.getData(nextProps.keyword);
        }
        if (nextProps.flag_add !== this.props.flag_add) {
            this.getData();
        }
    }

    render() {
        return <Table bordered
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={this.state.pagination}
                      columns={this.columns}
                      onChange={this.handleTableChange}/>;
    }
}

class OrderOne extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            keyword: {
                type: "0",
                startTime: "",
                endTime: "",
            },
            flag_add: false
        }
    }

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

    setType = (value) => {
        this.setState({
            keyword: {
                type: value,
                startTime: this.state.keyword.startTime,
                endTime: this.state.keyword.endTime,
            }
        })
    };

    setStartTime = (date, dateString) => {
        this.setState({
            keyword: {
                type: this.state.keyword.type,
                startTime: dateString,
                endTime: this.state.keyword.endTime,
            }
        })
    };

    setEndTime = (date, dateString) => {
        this.setState({
            keyword: {
                type: this.state.keyword.type,
                startTime: this.state.keyword.startTime,
                endTime: dateString,
            }
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

    componentWillMount() {
        this.setPower();
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

    render() {
        return (
            <div className="orderOne">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                <Tabs defaultActiveKey={this.state.type} onChange={this.setType}>
                                    <TabPane tab="听书订单" key="0"/>
                                    <TabPane tab="线下课程订单" key="1"/>
                                    <TabPane tab="线上课程订单" key="2"/>
                                </Tabs>
                            </header>
                            <div className="keyWord clearfix">
                                <span>日期筛选： </span>
                                <DatePicker placeholder="请选择日期"
                                            style={{width: "120px"}}
                                            onChange={this.setStartTime}/>
                                <span style={{margin: "0 10px"}}>至</span>
                                <DatePicker placeholder="请选择日期"
                                            style={{width: "120px"}}
                                            onChange={this.setEndTime}/>
                            </div>
                            <div className="table-box">
                                <DataTable
                                    opObj={this.state.opObj}
                                    keyword={this.state.keyword}
                                    flag_add={this.state.flag_add}
                                    toLoginPage={this.toLoginPage}/>
                            </div>
                        </div>
                        :
                        <p>暂无查询权限</p>
                }
            </div>
        )
    }
}

export default OrderOne;