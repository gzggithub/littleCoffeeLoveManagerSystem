import React, {Component} from 'react';
import {
    Table,
    Tabs,
    Modal,
    Input,
    message,
    Form,
    List,
    Radio
} from 'antd';
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

//提现审核表单
const ItemCheckForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, opinionStatus, setOpinionStatus, confirmLoading} = props;
        const {getFieldDecorator} = form;
        // 审核意见项类名，初始设为非必填
        let opinionClass = "opinion longItem unnecessary";
        if (opinionStatus) {
            // opinionStatus变量为true时，审核意见项设为必填
            opinionClass = "opinion longItem"
        }

        return (
            <Modal
                visible={visible}
                title="提现审核"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="withdrawCheck-form item-form">
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

//提现审核组件
class ItemCheck extends Component {
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
                url: '/finance/withdrawalsExamine',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    id: this.props.id,
                    status: values.status,
                    opinion: values.opinion
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
                        // 审核成功，重新拉取列表
                        this.props.recapture();
                    } else {
                        if (json.code === 901) {
                            message.error("请先登录");
                            // 返回登陆页
                            this.props.toLoginPage();
                        } else if (json.code === 902) {
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
                <ItemCheckForm
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

//提现申请详情组件
class WithDrawDetails extends Component {
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
        let status = "";
        if (this.props.data) {
            if (this.props.data.status === 0) {
                status = "待审核"
            }
            if (this.props.data.status === 1) {
                status = "审核通过"
            }
            if (this.props.data.status === 2) {
                status = "驳回"
            }
        }
        const dataSource = [
            <div className="amount">
                <span className="item-name">提现金额：</span>
                <span className="item-content">￥{data.money}</span>
            </div>,
            <div className="userName">
                <span className="item-name">提现人：</span>
                <span className="item-content">{data.userName}</span>
            </div>,
            <div className="eName">
                <span className="item-name">所属机构：</span>
                <span className="item-content">{data.eduName}</span>
            </div>,
            <div className="time">
                <span className="item-name">提现时间：</span>
                <span className="item-content">{data.createTime ? this.timeHandle(data.createTime) : ""}</span>
            </div>,
            <div className="bankcard">
                <span className="item-name">提现卡号：</span>
                <span className="item-content">{data.bankCard}</span>
            </div>,
            <div className="withdrawalsSn">
                <span className="item-name">提现单号：</span>
                <span className="item-content">{data.withdrawalsSn}</span>
            </div>,
            <div className="remark">
                <span className="item-name">备注：</span>
                <span className="item-content">{data.remark}</span>
            </div>,
            <div className="opinion">
                <span className="item-name">审核意见：</span>
                <span className="item-content">{data.opinion || "无"}</span>
            </div>,
            <div className="status">
                <span className="item-name">订单状态：</span>
                <span className="item-content">{status}</span>
            </div>
        ];
        return (
            <a>
                <span onClick={this.showModal}>详情</span>
                <Modal
                    title="提现详情"
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                    destroyOnClose={true}
                >
                    <div className="withDraw-details">
                        <div className="withDraw-baseData">
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

//提现审核列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            // 原始信息列表：用于在不请求详情接口的情况下进行信息详情展示
            originalData: [],
            // 依据表格列配置生成的表格所需的信息列表
            data: [],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.withdrawCheckPageSize) || 10,
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
                title: '提现金额',
                dataIndex: 'amount',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'amount'),
            },
            {
                title: "提现人",
                dataIndex: "userName",
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, "userName"),
            },
            {
                title: "所属机构",
                dataIndex: "eName",
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, "eName"),
            },
            {
                title: '申请时间',
                dataIndex: 'time',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'time'),
            },
            {
                title: '备注',
                dataIndex: 'remark',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'remark'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            <WithDrawDetails data={this.state.originalData[record.index - 1]}/>
                            {/*status为0，及状态为待审核的提现申请项展示此操作按钮*/}
                            <ItemCheck id={record.id} recapture={this.getData} toLoginPage={this.props.toLoginPage} status={record.status===0}/>
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

    // 时间处理函数
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
    getData = (type) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/finance/withdrawalsList',
            type: 'json',
            method: 'post',
            data: {
                status: type || this.props.type,
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
                //                 eduId: null,
                //                 eduName: "",
                //                 auditTime: "",
                //                 auditor: null,
                //                 bankCard: "",
                //                 createTime: "",
                //                 id: 1,
                //                 money: "",
                //                 opinion: "",
                //                 remark: "",
                //                 status: 1,
                //                 userId: null,
                //                 userName: "",
                //                 withdrawalsSn: "",
                //             }
                //         ]
                //     }
                // };
            },
            success: (json) => {
                const data = [];
                if (json.result === 0) {
                    // 服务器返回list为空，且当前页码不是1时，重置页码为1，再次请求数据
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
                            amount: item.money,
                            userName: item.userName,
                            eName: item.eduName,
                            time: item.createTime ? this.timeHandle(item.createTime) : "",
                            remark: item.remark,
                            status: item.status
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
                    if (json.code === 901) {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === 902) {
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

    //页码变化处理
    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.withdrawCheckPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.withdrawCheckPageSize);
        this.setState({
            pagination: pager
        }, () => {
            // 信息分页请求时，表格参数有变更需重新拉取列表
            this.getData()
        })
    };

    componentWillMount() {
        this.getData()
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.type === this.props.type && nextProps.flag_add === this.props.flag_add) {
            // type及flag_add均无变化时，直接return
            return;
        }
        // type有变化时，需传入nextProps.type作为status参数的值
        this.getData(nextProps.type)
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

class WithdrawCheck extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 当前选项卡的key值，同时作为提现审核列表的status参数值
            type: "0",
            flag_add: false
        }
    }

    // type设置
    setType = (key) => {
        this.setState({
            type: key,
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
            <div className="withdrawCheck">
                <Tabs defaultActiveKey={this.state.type} onChange={this.setType}>
                    <TabPane tab="待审核" key="0"/>
                    <TabPane tab="已通过" key="1"/>
                    <TabPane tab="已驳回" key="2"/>
                </Tabs>
                <div className="table-box">
                    <DataTable type={this.state.type} flag_add={this.state.flag_add} toLoginPage={this.toLoginPage}/>
                </div>
            </div>
        )
    }
}

export default WithdrawCheck;