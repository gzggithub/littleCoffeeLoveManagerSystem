import React, {Component} from 'react';
import {
    Table,
    Input,
    DatePicker,
    Select,
    Button,
    Modal,
    Form,
    Popconfirm,
    Upload,
    Slider,
    Row,
    Col,
    Icon,
    message,
    Spin,
    Tree,
    Steps,
} from 'antd';
import '../../config/config';
import reqwest from 'reqwest';

const Search = Input.Search;
const {Option} = Select;
const FormItem = Form.Item;
const { TreeNode } = Tree;
const confirm = Modal.confirm;
const Step = Steps.Step;

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//基本信息
class DataTableBasic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
        };
        this.columns = [
            {
                title: '订单编号',
                dataIndex: 'orderNum',
                width: "20%",
                render: (text, record) => this.renderColumns(text, record, 'orderNum')
            },
            {
                title: '支付方式',
                dataIndex: 'payWay',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'payWay')
            },
            {
                title: '支付单号',
                dataIndex: 'payNum',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'payNum')
            },
            {
                title: '机构信息',
                dataIndex: 'orgName',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'orgName')
            }, 
            {
                title: '机构联系电话',
                dataIndex: 'phone',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'phone')
            },            
        ];
    }

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    // 日期处理函数
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

    // 时间日期处理
    dateHandle02 = (para) => {
        const add0 = (m) => {
            return m < 10 ? '0' + m : m;
        }
        //shijianchuo是整数，否则要parseInt转换
        const time = new Date(para),
            y = time.getFullYear(),
            m = time.getMonth()+1,
            d = time.getDate(),
            h = time.getHours(),
            mm = time.getMinutes(),
            s = time.getSeconds();
        // return y + '-' + add0(m) + '-' + add0(d) + ' '+ add0(h) + ':' + add0(mm) + ':' + add0(s);
        return y + '-' + add0(m) + '-' + add0(d);
    };

    getData = () => {
        reqwest({
            url: '/sys/order/details',
            type: 'json',
            method: 'get',
            data: {
                id: Number(this.props.orderDetailId) || sessionStorage.orderDetailId,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         typeDetails: {
                //             id: 1,
                //             name: "123"
                //         }
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    json.data.createTime = this.dateHandle02(json.data.createTime);
                    let data = [];
                    console.log(typeof(data));
                    let tempPayWay = '';
                    if (json.data.order.payWay === 0) {
                        tempPayWay = '微信支付'
                    } 
                    if (json.data.order.payWay === 1) {
                        tempPayWay = '支付宝'
                    }
                    data.push({
                        id: json.data.order.id,
                        orderNum: json.data.order.orderSn,
                        payWay: tempPayWay,
                        payNum: json.data.order.tradeNo,
                        orgName: json.data.order.orgName,
                        telephone: json.data.order.telephone,
                    })
                    console.log(typeof(data))
                    this.setState({
                        // data: json.data,
                        data: data
                    }, () => {
                        console.log(this.state.data)
                    });

                }else{
                    if (json.code === 901) {
                        message.error("请先登录");
                        this.props.toLoginPage();
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                    }
                }
            }
        });
    };

    componentWillMount() {
        this.getData();
        // console.log(this.props.data.childrenArchivesList);
        // this.setState({
        //     data: this.props.data.childrenArchivesList
        // })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.keyword === this.props.keyword && nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData(nextProps.keyword);
    }

    render() {
        return (
            <div>
                <h3 className="add-form-title-h4">基本信息</h3>
                <Table bordered
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={false}
                      columns={this.columns}
                      onChange={this.handleTableChange}/>
            </div>
        )        
    }
}

//课程信息
class DataTableChildren extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
        };
        this.columns = [
            {
                title: '课程图片',
                dataIndex: 'photo',
                width: "10%",
                render: (text, record) => (<img style={{width: '45px', height: "25px"}} alt="" src={record["photo"]}/>)                
            },
            {
                title: '课程名称',
                dataIndex: 'coursename',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'coursename')
            },
            {
                title: '价格',
                dataIndex: 'price',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'price')
            },
            {
                title: '课时',
                dataIndex: 'lessonNum',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'lessonNum')
            }, 
            {
                title: '数量',
                dataIndex: 'num',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'num')
            },
            {
                title: '应付佣金',
                dataIndex: 'commissionPayable',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'commissionPayable')
            },
            {
                title: '应付金额',
                dataIndex: 'commissionAmount',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'commissionAmount')
            },       
        ];
    }

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    //table底部渲染
    renderFooter(text) {
        return (
            <div>应付合计：<span style={{color: "red"}}>￥{text}</span></div>
        );
    }

    // 日期处理函数
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

    // 时间日期处理
    dateHandle02 = (para) => {
        const add0 = (m) => {
            return m < 10 ? '0' + m : m;
        }
        //shijianchuo是整数，否则要parseInt转换
        const time = new Date(para),
            y = time.getFullYear(),
            m = time.getMonth()+1,
            d = time.getDate(),
            h = time.getHours(),
            mm = time.getMinutes(),
            s = time.getSeconds();
        // return y + '-' + add0(m) + '-' + add0(d) + ' '+ add0(h) + ':' + add0(mm) + ':' + add0(s);
        return y + '-' + add0(m) + '-' + add0(d);
    };

     // 列表信息处理函数
    dataHandle = (data) => {
        let result = [];
        data.orderDetailsVOList.forEach((item, index) => {
            const temp = {
                id: item.id,
                photo: item.photo,
                coursename: item.coursename,
                num: item.num,
                lessonNum: item.lessonNum,
                price: item.price,
                commissionPayable: item.price,
                commissionAmount: item.price,
            };
            result.push(temp)
        });
        return result;
    };

    getData = () => {
        reqwest({
            url: '/sys/order/details',
            type: 'json',
            method: 'get',
            data: {
                id: Number(this.props.orderDetailId) || sessionStorage.orderDetailId,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         typeDetails: {
                //             id: 1,
                //             name: "123"
                //         }
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    console.log(typeof(json.data.orderDetailsVOList));
                    // json.data.createTime = this.dateHandle02(json.data.createTime);
                    const data = [];
                    // json.data.orderDetailsVOList.forEach((item, index) => {
                    //     console.log(item)
                    //     data.push({
                    //         id: item.id,
                    //         photo: item.photo,
                    //         coursename: item.coursename,
                    //         num: item.num,
                    //         lessonNum: item.lessonNum,
                    //         price: item.price,
                    //         commissionPayable: item.price,
                    //         commissionAmount: item.price,
                    //     })
                    // })
                    console.log(data);
                    this.setState({
                        // data: this.dataHandle(json.data),
                    }, () => {
                        console.log(this.state.data)
                    });
                }else{
                    if (json.code === 901) {
                        message.error("请先登录");
                        this.props.toLoginPage();
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                    }
                }
            }
        });
    };

    componentWillMount() {
        this.getData();
        // console.log(this.props.data.childrenArchivesList);
        // this.setState({
        //     data: this.props.data.childrenArchivesList
        // })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.keyword === this.props.keyword && nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData(nextProps.keyword);
    }

    render() {
        return (
            <div>
                <h3 className="add-form-title-h4">课程信息</h3>
                <Table bordered
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={false}
                      columns={this.columns}
                      onChange={this.handleTableChange}
                      footer={this.renderFooter}/>
            </div>
        )        
    }
}

//消费时间
class DataTableStatistics extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [
                // {
                //     index: 1,
                //     id: 1,
                //     orderNum: 201707196398345,
                //     submitTime: "2017-07-19 14:48:38",
                //     userAccount: 18000000000,
                //     orderAmount: "¥200.00",
                //     payMethod: "未支付",
                //     orderType: "机构课程",
                //     orderStatus: "待付款",
                // },
            ],
        };
       
        this.columns = [
            {
                title: '消费时间1',
                dataIndex: 'consumerTime01',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'consumerTime01')
            },
            {
                title: '消费时间2',
                dataIndex: 'consumerTime02',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'consumerTime02')
            },
            {
                title: '消费时间3',
                dataIndex: 'consumerTime03',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'consumerTime03')
            },
            {
                title: '消费时间4',
                dataIndex: 'consumerTime04',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'consumerTime04')
            },
            {
                title: '消费时间5',
                dataIndex: 'consumerTime05',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'consumerTime05')
            },            
        ];
        this.columns02 = [
            {
                title: '收藏机构',
                dataIndex: 'collectionOrg',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'collectionOrg')
            },
            {
                title: '收藏课程',
                dataIndex: 'collectionCourse',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'collectionCourse')
            },
            {
                title: '收藏老师',
                dataIndex: 'collectionTeacher',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'collectionTeacher')
            },
            {
                title: '评价',
                dataIndex: 'commentNum',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'commentNum')
            },
            {
                title: '我的提问',
                dataIndex: 'questionNum',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'questionNum')
            },
             {
                title: '我的回答',
                dataIndex: 'answerNum',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'answerNum')
            },
            {
                title: '意见反馈',
                dataIndex: 'doubtsNum',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'doubtsNum')
            },
            {
                title: '登录次数',
                dataIndex: 'loginNum',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'loginNum')
            },
        ];
    }

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    //table底部渲染
    renderFooter(text) {
        return (
            <div>合计：<span style={{color: "red"}}>{text}/5</span></div>
        );
    }

    // 日期处理函数
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

    // 时间日期处理
    dateHandle02 = (para) => {
        const add0 = (m) => {
            return m < 10 ? '0' + m : m;
        }
        //shijianchuo是整数，否则要parseInt转换
        const time = new Date(para),
            y = time.getFullYear(),
            m = time.getMonth()+1,
            d = time.getDate(),
            h = time.getHours(),
            mm = time.getMinutes(),
            s = time.getSeconds();
        // return y + '-' + add0(m) + '-' + add0(d) + ' '+ add0(h) + ':' + add0(mm) + ':' + add0(s);
        return y + '-' + add0(m) + '-' + add0(d);
    };

    getData = () => {
        reqwest({
            url: '/sys/order/details',
            type: 'json',
            method: 'get',
            data: {
                id: Number(this.props.orderDetailId) || sessionStorage.orderDetailId,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         typeDetails: {
                //             id: 1,
                //             name: "123"
                //         }
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    // json.data.createTime = this.dateHandle02(json.data.createTime);
                    let data = [];
                    // console.log(typeof(data));
                    // let consumerTime01 = '';
                    // let consumerTime02 = '';
                    // let consumerTime03 = '';
                    // let consumerTime04 = '';
                    // let consumerTime05 = '';
                    // if (json.data.orderDetailsVOList) {
                    //     consumerTime01 = json.data.orderDetailsVOList[0] ? json.data.orderDetailsVOList[0].consumeTime : '';
                    //     consumerTime02 = json.data.orderDetailsVOList[1] ? json.data.orderDetailsVOList[1].consumeTime : '';
                    //     consumerTime03 = json.data.orderDetailsVOList[2] ? json.data.orderDetailsVOList[2].consumeTime : '';
                    //     consumerTime04 = json.data.orderDetailsVOList[3] ? json.data.orderDetailsVOList[3].consumeTime : '';
                    //     consumerTime05 = json.data.orderDetailsVOList[4] ? json.data.orderDetailsVOList[4].consumeTime : '';
                    // }
                    // data.push({
                    //     consumerTime01: consumerTime01,
                    //     consumerTime02: consumerTime02,
                    //     consumerTime03: consumerTime03,
                    //     consumerTime04: consumerTime04,
                    //     consumerTime05: consumerTime05, 
                    // });                   
                    // console.log(typeof(data));
                    // console.log(data)                   
                    this.setState({
                        data: data
                    }, () => {
                        console.log(this.state.data)
                    });

                }else{
                    if (json.code === 901) {
                        message.error("请先登录");
                        this.props.toLoginPage();
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                    }
                }
            }
        });
    };

    componentWillMount() {
        this.getData();
        // console.log(this.props.data)
        // const data = [];
        // data.push(
        //     {
        //         id: this.props.data.id,
        //         consumerAmount: this.props.data.totalPrice,                
        //         orderNum: this.props.data.orderNum,
        //         orgCourseNum: this.props.data.orgCourseNum,
        //         consumedOrderNum: this.props.data.consumedOrderNum,
        //         unPaidOrderNum: this.props.data.unPaidOrderNum,
        //         paidOrderNum: this.props.data.paidOrderNum,
        //         closedOrderNum: this.props.data.closedOrderNum,
        //         refundRecord: this.props.data.refundOrderNum,
        //     })
        // const data02 = [];
        // data02.push(
        //     {
        //         id: this.props.data.id,
        //         collectionOrg: this.props.data.collectionOrg,
        //         collectionCourse: this.props.data.collectionCourse,
        //         collectionTeacher: this.props.data.collectionTeacher,
        //         commentNum: this.props.data.commentNum,
        //         questionNum: this.props.data.questionNum,
        //         answerNum: this.props.data.answerNum,
        //         doubtsNum: this.props.data.doubtsNum,
        //         loginNum: this.props.data.loginNum,
        //     })
        // this.setState({
        //     data: data,
        //     data02: data02,
        // })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.keyword === this.props.keyword && nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData(nextProps.keyword);
    }

    render() {
        return (
            <div>
                <h3 className="add-form-title-h4">消费信息</h3>
                <Table bordered
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={false}
                      columns={this.columns}
                      // footer={() => 'Footer'}
                      footer={this.renderFooter}
                      />
                {/*<Table bordered
                      loading={this.state.loading}
                      dataSource={this.state.data02}
                      pagination={false}
                      columns={this.columns02}
                      />*/}
            </div>
        )
        
    }
}

//费用信息
class DataTableFee extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [
                // {
                //     index: 1,
                //     id: 1,
                //     orderNum: 201707196398345,
                //     submitTime: "2017-07-19 14:48:38",
                //     userAccount: 18000000000,
                //     orderAmount: "¥200.00",
                //     payMethod: "未支付",
                //     orderType: "机构课程",
                //     orderStatus: "待付款",
                // },
            ],
            data02: [
                // {
                //     index: 2,
                //     id: 2,
                //     orderNum: 201707196398345,
                //     submitTime: "2017-07-19 14:48:38",
                //     userAccount: 18000000000,
                //     orderAmount: "¥200.00",
                //     payMethod: "未支付",
                //     orderType: "机构课程",
                //     orderStatus: "待付款",
                // },
            ],
        };
       
        this.columns = [
            {
                title: '订单总金额',
                dataIndex: 'orderAllAmount',
                width: '25%',
                render: (text, record) => this.renderColumns(text, record, 'orderAllAmount')
            },
            {
                title: '活动优惠',
                dataIndex: 'activityCoupon',
                width: '25%',
                render: (text, record) => this.renderColumns(text, record, 'activityCoupon')
            },
            {
                title: '折扣金额',
                dataIndex: 'discountAmount',
                width: '25%',
                render: (text, record) => this.renderColumns(text, record, 'discountAmount')
            },
            {
                title: '应付款金额',
                dataIndex: 'payableAmount',
                width: '25%',
                render: (text, record) => this.renderColumns(text, record, 'payableAmount')
            },          
        ];
    }

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    // 日期处理函数
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

    // 时间日期处理
    dateHandle02 = (para) => {
        const add0 = (m) => {
            return m < 10 ? '0' + m : m;
        }
        //shijianchuo是整数，否则要parseInt转换
        const time = new Date(para),
            y = time.getFullYear(),
            m = time.getMonth()+1,
            d = time.getDate(),
            h = time.getHours(),
            mm = time.getMinutes(),
            s = time.getSeconds();
        // return y + '-' + add0(m) + '-' + add0(d) + ' '+ add0(h) + ':' + add0(mm) + ':' + add0(s);
        return y + '-' + add0(m) + '-' + add0(d);
    };

    getData = () => {
        reqwest({
            url: '/sys/order/details',
            type: 'json',
            method: 'get',
            data: {
                id: Number(this.props.orderDetailId) || sessionStorage.orderDetailId,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         typeDetails: {
                //             id: 1,
                //             name: "123"
                //         }
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    json.data.createTime = this.dateHandle02(json.data.createTime);
                    const data = [];
                    data.push(
                        {
                            id: json.data.id,
                            orderAllAmount: "￥" + json.data.order.fee,
                            activityCoupon: json.data.order.activityCoupon,
                            discountAmount: json.data.order.discountAmount,
                            payableAmount: "￥" + json.data.order.orderAmount
                        })
                    this.setState({
                        data: data,
                    }, () => {
                        console.log(this.state.data)
                    });

                }else{
                    if (json.code === 901) {
                        message.error("请先登录");
                        this.props.toLoginPage();
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                    }
                }
            }
        });
    };

    componentWillMount() {
        this.getData();
        // console.log(this.props.data)
        // const data = [];
        // data.push(
        //     {
        //         id: this.props.data.id,
        //         consumerAmount: this.props.data.totalPrice,                
        //         orderNum: this.props.data.orderNum,
        //         orgCourseNum: this.props.data.orgCourseNum,
        //         consumedOrderNum: this.props.data.consumedOrderNum,
        //         unPaidOrderNum: this.props.data.unPaidOrderNum,
        //         paidOrderNum: this.props.data.paidOrderNum,
        //         closedOrderNum: this.props.data.closedOrderNum,
        //         refundRecord: this.props.data.refundOrderNum,
        //     })
        // const data02 = [];
        // data02.push(
        //     {
        //         id: this.props.data.id,
        //         collectionOrg: this.props.data.collectionOrg,
        //         collectionCourse: this.props.data.collectionCourse,
        //         collectionTeacher: this.props.data.collectionTeacher,
        //         commentNum: this.props.data.commentNum,
        //         questionNum: this.props.data.questionNum,
        //         answerNum: this.props.data.answerNum,
        //         doubtsNum: this.props.data.doubtsNum,
        //         loginNum: this.props.data.loginNum,
        //     })
        // this.setState({
        //     data: data,
        //     data02: data02,
        // })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.keyword === this.props.keyword && nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData(nextProps.keyword);
    }

    render() {
        return (
            <div>
                <h3 className="add-form-title-h4">费用信息</h3>
                <Table bordered
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={false}
                      columns={this.columns}
                      footer={() => 'Footer'}
                      />
            </div>
        )
        
    }
}

class OrderDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},           
            flag_add: false,
            orderDetailId: '',
            payState: '',
            currentOrderState: 0,
            createTime: '',
            refundReason: '',      
        };
        this.orderStatusList02 = [
            {
                id: 1,
                name: "提交订单",
                num: 2000,
                time: "2017-07-19 15:43:23",
                reason: "原因",
                class: "disc blueDisc",
                background: "#FFF"
            },
            {
                id: 2,
                name: "支付订单",
                num: 2000,
                time: "2017-07-19 15:43:23",
                reason: "原因",
                class: "disc yellowDisc",
                background: "#FFF"
            },
            {
                id: 3,
                name: "待消费",
                num: 2000,
                time: "2017-07-19 15:43:23",
                reason: "原因",
                class: "disc brownDisc",
                background: "#FFF"
            },
            {
                id: 4,
                name: "完成消费",
                num: 2000,
                time: "2017-07-19 15:43:23",
                reason: "原因",

                class: "disc purpleDisc",
                background: "#FFF"
            },
            {
                id: 5,
                name: "完成评价",
                num: 2000,
                time: "2017-07-19 15:43:23",
                reason: "原因",
                class: "disc greenDisc",
                background: "#FFF"
            }
        ]     
    }

    getData = () => {
        this.refs.getDataCopy.getData();
    };

    // 时间日期处理
    dateHandle02 = (para) => {
        const add0 = (m) => {
            return m < 10 ? '0' + m : m;
        }
        //shijianchuo是整数，否则要parseInt转换
        const time = new Date(para),
            y = time.getFullYear(),
            m = time.getMonth()+1,
            d = time.getDate(),
            h = time.getHours(),
            mm = time.getMinutes(),
            s = time.getSeconds();
        // return y + '-' + add0(m) + '-' + add0(d) + ' '+ add0(h) + ':' + add0(mm) + ':' + add0(s);
        return y + '-' + add0(m) + '-' + add0(d);
    };

    getData = () => {
        reqwest({
            url: '/sys/order/details',
            type: 'json',
            method: 'get',
            data: {
                id: Number(this.props.orderDetailId) || sessionStorage.orderDetailId,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         typeDetails: {
                //             id: 1,
                //             name: "123"
                //         }
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    json.data.createTime = this.dateHandle02(json.data.createTime);
                    const data = [];
                    let tempPayState = '';
                    let tempCurrentOrderState = 0;
                    let temprefundReason = ''
                    if (json.data.order.payState === 1) {
                        tempPayState = '待付款';
                        // tempPayState02 = 1
                    }
                    if (json.data.order.payState === 3 && json.data.orderDetailsVOList[0].consumeState == 1) {
                        tempPayState = '已付款';
                        tempCurrentOrderState = 2;
                        // tempPayState02 = 1
                    }
                    if (json.data.order.payState === 3 && json.data.orderDetailsVOList[0].consumeState == 2) {
                        tempPayState = '已付款';
                        tempCurrentOrderState = 3;
                        // tempPayState02 = 1
                    }
                    if (json.data.order.payState === 6) {
                        tempPayState = '已退款';
                        temprefundReason = json.data.order.refundReason;
                    }
                    if (json.data.order.payState === 7) {
                        tempPayState = '已关闭';
                        tempCurrentOrderState = 4;
                    }
                    if (json.data.order.payState === 8) {
                        tempPayState = '退款中'
                    }
                    if (json.data.order.payState === 9) {
                        tempPayState = '退款失败'
                    }
                    data.push(
                        {
                            id: json.data.id,
                            consumerAmount: json.data.totalPrice,                
                            orderNum: json.data.orderNum,
                            orgCourseNum: json.data.orgCourseNum,
                            consumedOrderNum: json.data.consumedOrderNum,
                            unPaidOrderNum: json.data.unPaidOrderNum,
                            paidOrderNum: json.data.paidOrderNum,
                            closedOrderNum: json.data.closedOrderNum,
                            refundRecord: json.data.refundOrderNum,
                            payState: tempPayState,
                        })
                    const data02 = [];
                   
                    this.setState({
                        data: data,
                        payState: tempPayState,
                        currentOrderState: tempCurrentOrderState,
                        createTime: json.data.order.createTime,
                        refundReason: temprefundReason,
                    }, () => {
                        console.log(this.state.data)
                        console.log(this.state.data02)
                    });

                }else{
                    if (json.code === 901) {
                        message.error("请先登录");
                        this.props.toLoginPage();
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                    }
                }
            }
        });
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

    componentWillMount() {
        this.setPower();
         // record.orderDetailsId
        console.log(this.props);
        if (Number(this.props.location.search.substring(1)) && Number(this.props.location.search.substring(1)) != 0) {
            sessionStorage.orderDetailId = Number(this.props.location.search.substring(1));
        }        
        
        this.setState({
            orderDetailId: sessionStorage.orderDetailId,
        }, () =>{
            this.getData();
        })
        if (this.props.location.search) {
            this.props.history.push(this.props.location.pathname)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location.search) {
            console.log(nextProps);
            this.props.history.push(nextProps.location.pathname);
            this.setFlag();
        }
    }

    render() {
        const renderDescription01 = (
            <div>
                <div>{this.state.createTime}</div>
            </div>
        );
        const renderDescription02 = (
            <div>
                <div>{this.state.payState}</div>
                <div>{this.state.refundReason }</div>
            </div>
        );      
        // 详情订单流程列表
        // const allOrderStatus02 = [];
        // this.orderStatusList02.forEach((item, index) => {
        //     allOrderStatus02.push(
        //         <Step title={item.name} description={renderDescription} />
        //     )
        // });        

        return (
            <div className="institutions">
                {
                    // this.state.opObj.select ?
                        <div>
                            <header style={{marginBottom: "10px", background: "#FFF", padding: "24px"}}>
                                <Row gutter={12}>                                    
                                    <Steps current={this.state.currentOrderState} labelPlacement="vertical">
                                        {/*{allOrderStatus02}*/}
                                        <Step 
                                            title="提交订单" 
                                            description={renderDescription01} />
                                        <Step title="支付订单" description={renderDescription02} />
                                        <Step title="待消费" />
                                        <Step title="完成消费"/>
                                        <Step title="完成评价" />
                                    </Steps>                                  
                                </Row>
                            </header>
                            <div style={{background: "#FFF", padding: "0 24px 24px"}}>
                                <div className="current-order-status">当前订单状态：{this.state.payState}</div>
                                <div className="basic-table">
                                    <DataTableBasic
                                        orderDetailId={this.state.orderDetailId}
                                        data={this.state.data}
                                        toLoginPage={this.toLoginPage}
                                    />
                                </div>
                                <div className="children-table">
                                    <DataTableChildren                        
                                        orderDetailId={this.state.orderDetailId}
                                        data={this.state.data}
                                        toLoginPage={this.toLoginPage}
                                    />
                                </div>
                                <div className="statistics-table">
                                    <DataTableStatistics
                                        orderDetailId={this.state.orderDetailId}
                                        data={this.state.data}
                                        toLoginPage={this.toLoginPage}
                                    />
                                </div>
                                {<div className="order-record-table">
                                    <DataTableFee
                                        orderDetailId={this.state.orderDetailId}
                                        data={this.state.data}
                                        toLoginPage={this.toLoginPage}
                                    />
                                </div>}
                            </div>           
                        </div>
                        // :
                        // <p>暂无查询权限</p>
                }
            </div>  
        )
    }
}

export default OrderDetail;