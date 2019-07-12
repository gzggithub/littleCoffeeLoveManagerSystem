import React, {Component} from 'react';
import {
    Table,
    Tabs,
    Modal,
    Input,
    message,
    Form,
    List,
    Radio,
} from 'antd';
import '../../config/config.js';
import reqwest from 'reqwest';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const {TextArea} = Input;
const confirm = Modal.confirm;

//栅格设置
const formItemLayout_8 = {
    labelCol: {span: 4},
    wrapperCol: {span: 8},
};
const formItemLayout_14 = {
    labelCol: {span: 4},
    wrapperCol: {span: 14},
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//退款机构审核表单
const ItemCheck01Form = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, opinionStatus, setOpinionStatus, confirmLoading} = props;
        const {getFieldDecorator} = form;
        // 审核意见项类名，初始设为非必填
        let opinionClass = "opinion longItem unnecessary";
        if (opinionStatus) {
            opinionClass = "opinion longItem"
        }

        return (
            <Modal
                visible={visible}
                title="退款审核"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="refundCheck-form item-form">
                    <Form layout="vertical">
                        <FormItem className="status" {...formItemLayout_8} label="审核结果：">
                            {getFieldDecorator('status', {
                                rules: [{
                                    required: true,
                                    message: "审核结果不能为空"
                                }],
                            })(
                                <RadioGroup onChange={(event) => {
                                    setOpinionStatus(event.target.value)
                                }}>
                                    <Radio value={1}>通过</Radio>
                                    <Radio value={2}>驳回</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem className={opinionClass} {...formItemLayout_14} label="审核意见：">
                            {getFieldDecorator('opinion', {
                                rules: [{
                                    required: opinionStatus,
                                    message: '审核意见不能为空',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写审核意见"
                                          autosize={{minRows: 3, maxRows: 10}}/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//退款机构审核组件
class ItemCheck01 extends Component {
    state = {
        visible: false,
        // 状态变量，标识审核意见项是否必填，审核结果项为驳回时，设为true，即必填
        opinionStatus: false,
        confirmLoading: false
    };

    showModal = () => {
        this.setState({
            visible: true
        })
    };

    // opinionStatus设置
    setOpinionStatus = (value) => {
        if (value === 1) {
            this.setState({
                opinionStatus: false
            })
        }
        if (value === 2) {
            this.setState({
                opinionStatus: true
            })
        }
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
                    opinionStatus: false,
                    confirmLoading: false
                });
                form.resetFields();
            })
        };
        const data = form.getFieldsValue();
        let flag = false;
        for (let x in data) {
            if (data[x]) {
                flag = true
            }
        }
        if (flag) {
            confirm({
                title: '已添加信息未保存，确认放弃添加？',
                content: "",
                okText: '确认',
                okType: 'danger',
                cancelText: '取消',
                onOk() {
                    cancel();
                },
                onCancel() {
                }
            });
        } else {
            cancel()
        }
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            // status为2，即申请驳回时，校验审核意见是否已填写
            if (values.status === 2 && !values.opinion) {
                message.error("驳回意见不能为空");
                return
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/order/shopOrderRefundsExamine',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    id: this.props.id,
                    state: values.status,
                    reason: values.opinion
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("审核成功");
                        this.setState(
                            {
                                visible: false
                            }, () => {
                                this.setState({
                                    opinionStatus: false,
                                    confirmLoading: false
                                });
                            }
                        );
                        this.props.recapture();
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
                                confirmLoading: false
                            })
                        }
                    }
                }
            })
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a style={{display: this.props.status ? "inline" : "none"}}>
                <span onClick={() => this.showModal()}>审核</span>
                <ItemCheck01Form
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    opinionStatus={this.state.opinionStatus}
                    setOpinionStatus={this.setOpinionStatus}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//退款申请详情组件
class ItemDetails extends Component {
    state = {
        visible: false
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

    showModal = () => {
        this.setState({
            visible: true
        })
    };

    handleCancel = () => {
        this.setState({visible: false});
    };

    render() {
        const data = this.props.data || {};
        let type = "";
        if (this.props.data) {
            if (this.props.data.type === 0) {
                type = "自营课程订单";
            }
            if (this.props.data.type === 1) {
                type = "妈董会课程订单";
            }
            if (this.props.data.type === 2) {
                type = "商城订单";
            }
        }
        let status = "";
        if (this.props.data) {
            if (this.props.data.state === 1) {
                status = Number(sessionStorage.EId) === 0 ? "待审核" : "审核通过"
            }
            if (this.props.data.state === 2) {
                status = "审核通过"
            }
            if (this.props.data.state === 0) {
                status = "待审核"
            }
            if (this.props.data.state === 3) {
                status = "审核驳回"
            }
        }
        const dataSource = [
            <div className="orderSn item">
                <span className="item-name">订单号：</span>
                <span className="item-content">{data.orderSn}</span>
            </div>,
            <div className="type item">
                <span className="item-name">订单类型：</span>
                <span className="item-content">{type}</span>
            </div>,
            <div className="totalAmount item">
                <span className="item-name">订单总额：</span>
                <span className="item-content">￥{data.totalAmount}</span>
            </div>,
            <div className="institutionAmount item">
                <span className="item-name">机构应付：</span>
                <span className="item-content">￥{data.institutionAmount}</span>
            </div>,
            <div className="institutionActualAmount item"
                 style={{display: this.props.data.state === 0 ? "none" : "block"}}>
                <span className="item-name">机构实付：</span>
                <span
                    className="item-content">￥{Number(data.institutionActualAmount) ? data.institutionActualAmount : data.institutionAmount}</span>
            </div>,
            <div className="platformAmount item">
                <span className="item-name">平台应付：</span>
                <span className="item-content">￥{data.platformAmount}</span>
            </div>,
            <div className="shouldAmount item" style={{display: Number(sessionStorage.EId) ? "none" : "block"}}>
                <span className="item-name">用户实收：</span>
                <span className="item-content">￥{data.shouldAmount}</span>
            </div>,
            <div className="platformAmount item">
                <span className="item-name">用户名：</span>
                <span className="item-content">{data.userName}</span>
            </div>,
            <div className="platformAmount item">
                <span className="item-name">用户电话：</span>
                <span className="item-content">{data.userPhone}</span>
            </div>,
            <div className="time item">
                <span className="item-name">申请时间：</span>
                <span className="item-content">{data.createTime ? this.timeHandle(data.createTime) : ""}</span>
            </div>,
            <div className="opinion">
                <span className="item-name">审核意见：</span>
                <pre>
                    <span className="item-content">{data.remarkOne || "暂无"}</span>
                </pre>
            </div>,
            <div className="status item">
                <span className="item-name">订单状态：</span>
                <span className="item-content">{status}</span>
            </div>
        ];
        return (
            <a>
                <span onClick={this.showModal}>详情</span>
                <Modal
                    title="退款申请详情"
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                >
                    <div className="refundCheck-details item-details">
                        <div className="refundCheck-baseData">
                            <List
                                size="small"
                                split="false"
                                dataSource={dataSource}
                                renderItem={item => (<List.Item>{item}</List.Item>)}
                            />
                        </div>
                    </div>
                </Modal>
            </a>
        );
    }
}

//退款审核列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            originalData: [],
            data: [],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.goodsRefundCheckPageSize) || 10,
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
                title: "订单号",
                dataIndex: "orderSn",
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, "orderSn"),
            },
            {
                title: "用户名",
                dataIndex: "userName",
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, "userName"),
            },
            {
                title: "用户电话",
                dataIndex: "userPhone",
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, "userPhone"),
            },
            {
                title: "应退金额",
                dataIndex: "institutionAmount",
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, "institutionAmount"),
            },
            {
                title: '申请时间',
                dataIndex: 'time',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'time'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            <ItemDetails data={this.state.originalData[record.index - 1]}/>
                            {/*state为0的项显示审核按钮*/}
                            <ItemCheck01 id={record.id} recapture={this.getData}
                                         status={record.state === 0} toLoginPage={this.props.toLoginPage}/>
                        </div>
                    )
                }
            }
        ]
    }

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
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
    getData = (status) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/order/getRefundsApplyList',
            type: 'json',
            method: 'post',
            data: {
                state: status === undefined ? this.props.status : status,
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
                //         size: 80,
                //         list: [
                //             {
                //                 id: 1,
                //                 orderSn: "",
                //                 refundNum: null,
                //                 totalAmount: "",
                //                 institutionAmount: "",
                //                 platformAmount: "",
                //                 userName: "",
                //                 userPhone: "",
                //                 institutionName: "",
                //                 createTime: "",
                //                 signIn: true,
                //                 type: 0,
                //                 remarkOne: "",
                //                 state: 1,
                //             },
                //             {
                //                 id: 2,
                //                 orderSn: "",
                //                 refundNum: null,
                //                 totalAmount: "",
                //                 institutionAmount: "",
                //                 platformAmount: "",
                //                 userName: "",
                //                 userPhone: "",
                //                 institutionName: "",
                //                 createTime: "",
                //                 signIn: true,
                //                 type: 1,
                //                 state: 0,
                //             }
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
                            orderSn: item.orderSn,
                            userName: item.userName,
                            userPhone: item.userPhone,
                            institutionAmount: item.institutionAmount,
                            time: item.createTime ? this.timeHandle(item.createTime) : "",
                            state: item.state,
                        })
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

    //获取退款页面链接
    getUrl = (id) => {
        reqwest({
            url: '/order/auditMoney',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: id
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: "",
                //     code: 200
                // };
                // if (json.result === 0) {
                //     window.open(json.data)
                // } else {
                //     if (json.code === "1025") {
                //         message.error("未找到该订单")
                //     }
                //     if (json.code === "1122") {
                //         message.error("退款信息不存在")
                //     }
                //     if (json.code === "1102") {
                //         message.error("查询失败")
                //     }
                // }
            },
            success: (json) => {
                if (json.result === 0) {
                    window.open(json.data)
                } else {
                    message.error(json.message);
                }
            }
        });
    };

    //页码变化处理
    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.goodsRefundCheckPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.goodsRefundCheckPageSize);
        this.setState({
            pagination: pager
        }, () => {
            this.getData()
        })
    };

    componentWillMount() {
        this.getData()
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.status === this.props.status && nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData(nextProps.status)
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

class GoodsRefundCheck extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 退款申请状态变量  0：退款申请等待机构审核；1：机构审核通过等待系统管理员审核；2：系统管理员审核通过即退款成功；3：驳回
            // 系统管理员初始值为1，机构管理员初始值为0
            status: 0,
            flag_add: false
        }
    }


    // 状态变量设置
    setStatus = (key) => {
        this.setState({
            status: key,
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
            <div className="refundCheck">
                <Tabs onChange={this.setStatus}>
                    <TabPane tab="待审核" key="0"/>
                    <TabPane tab="审核通过" key="1"/>
                    <TabPane tab="审核驳回" key="3"/>
                    <TabPane tab="退款成功" key="2"/>
                </Tabs>
                <div className="table-box">
                    <DataTable status={this.state.status} flag_add={this.state.flag_add}
                               toLoginPage={this.toLoginPage}/>
                </div>
            </div>
        )
    }
}

export default GoodsRefundCheck;