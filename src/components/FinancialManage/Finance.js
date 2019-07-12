import React, {Component} from 'react';
import {
    Table,
    Button,
    Tabs,
    Modal,
    Input,
    InputNumber,
    Icon,
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
const formItemLayout_12 = {
    labelCol: {span: 4},
    wrapperCol: {span: 12},
};
const formItemLayout_14 = {
    labelCol: {span: 4},
    wrapperCol: {span: 14},
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//提现申请表单
const WithDrawForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, stage, amount, cardsList, countDown, codeButtonStatus, getCode, setVerifyCode, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 不同步骤设置不同的对话框title和提交按钮描述文字
        let title = "";
        let bottomText = "";
        if (stage === 1) {
            title = "申请提现";
            bottomText = "下一步";
        }
        if (stage === 2) {
            title = "短信验证";
            bottomText = "提交";
        }
        if (stage === 3) {
            title = "申请成功";
            bottomText = "完成";
        }

        // 待选银行卡元素列表生成
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };
        const listOfBankcard = [];
        cardsList.forEach((item, index) => {
            const tempNumber = item.cardNumber.toString().slice(0, 4) + " **** **** " + item.cardNumber.toString().slice(-4);
            listOfBankcard.push(
                <Radio key={index + 1}
                       style={radioStyle}
                       value={item.id}>
                    <span>{item.bank}</span>
                    <span style={{marginLeft: "20px"}}>{tempNumber}</span>
                </Radio>
            )
        });

        return (
            <Modal
                title={title}
                visible={visible}
                width={600}
                footer={
                    <Button type="primary"
                            onClick={() => onCreate(stage)} loading={confirmLoading}>{bottomText}</Button>
                }
                onCancel={onCancel}
                destroyOnClose={true}
            >
                <div className="withdraw-form">
                    {/*步骤1页面*/}
                    <Form layout="vertical" style={{display: stage === 1 ? "block" : "none"}}>
                        <div className="account-amount">
                            <span className="item-name">可提现金额：</span>
                            <span className="item-content">￥{amount}</span>
                        </div>
                        <FormItem className="amount" {...formItemLayout_8} label="提现金额：">
                            {getFieldDecorator('amount', {
                                rules: [{
                                    required: true,
                                    message: "提现金额不能为空",
                                }],
                            })(
                                <InputNumber min={0} precision={2} step={100}/>
                            )}
                        </FormItem>
                        <FormItem className="bankcard" {...formItemLayout_12} label="提现至：">
                            {getFieldDecorator('bankcard', {
                                // 默认选中第一张银行卡
                                initialValue: cardsList.length ? cardsList[0].id : "",
                                rules: [{
                                    required: true,
                                    message: '银行卡不能为空',
                                }],
                            })(
                                <RadioGroup onChange={this.onChange}>
                                    {listOfBankcard.length ? listOfBankcard :
                                        <p style={{lineHeight: "32px", padding: "0", margin: "0"}}>暂未绑定银行卡</p>}
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem className="remark longItem" {...formItemLayout_14} label="备注：">
                            {getFieldDecorator('remark', {
                                rules: [{
                                    required: true,
                                    message: "提现备注不能为空",
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写提现备注"
                                          autosize={{minRows: 3, maxRows: 10}}/>
                            )}
                        </FormItem>
                    </Form>
                    {/*步骤2页面*/}
                    <div className="verifyCode-input" style={{display: stage === 2 ? "block" : "none"}}>
                        <p className="input-hint">请输入手机 {sessionStorage.phone} 收到的短信验证码</p>
                        <Input placeholder="短信验证码" style={{width: "200px"}} onBlur={setVerifyCode}/>
                        <Button type="primary" style={{float: "right"}}
                                onClick={getCode}>{codeButtonStatus ? countDown + "s后重发" : "获取验证码"}</Button>
                    </div>
                    {/*步骤3页面*/}
                    <div className="withdraw-success" style={{display: stage === 3 ? "block" : "none"}}>
                        <div className="icon-box">
                            <Icon type="check-circle-o" style={{fontSize: 50, color: "#398BC5"}}/>
                        </div>
                        <p className="success">申请提现成功</p>
                        <p className="success-hint">申请提现通过后，预计七个工作日之内打款到您的账户，请注意查收。</p>
                    </div>
                </div>
            </Modal>
        );
    }
);

//提现申请组件
class WithDraw extends Component {
    state = {
        visible: false,
        // 操作步骤索引
        stage: 1,
        // 已绑定银行卡列表
        cardsList: [],
        // 当前登录人已绑定手机号码
        phone: "",
        // 待提交的提现相关变量，步骤1结束时写入
        withDrawData: {},
        // 短信验证码相关变量
        countDown: 0,
        codeButtonStatus: false,
        verifyCode: "",
        confirmLoading: false
    };
    fn_countDown = "";

    // 获取银行卡列表
    getCardsList = () => {
        reqwest({
            url: '/finance/getBankCard',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("银行卡列表获取失败");
                // const json = {
                //     result: 0,
                //     data: [
                //         {
                //             EId: null,
                //             bank: "",
                //             cardNumber: "",
                //             createTime: "",
                //             id: 1,
                //             userId: null
                //         },
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        cardsList: json.data
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
                    }
                }
            }
        })
    };

    showModal = () => {
        // 获取银行卡列表
        this.getCardsList();
        this.setState({
            visible: true,
            // 当前登录人已绑定手机号码写入
            phone: sessionStorage.phone
        });
    };

    // 短信验证码相关函数
    // 倒计时监听
    countDown = () => {
        if (this.state.countDown <= 0) {
            clearInterval(this.fn_countDown);
            this.setState({
                countDown: 0,
                codeButtonStatus: false
            });
            return;
        }
        this.setState({
            countDown: this.state.countDown - 1
        })
    };
    // 获取验证码
    getCode = () => {
        if (this.state.codeButtonStatus) {
            return;
        } else {
            reqwest({
                url: '/mobileCode/sendVerificationCode',
                type: 'json',
                method: 'post',
                data: {
                    phone: this.state.phone
                },
                headers: {
                    Authorization: sessionStorage.token
                },
                error: (XMLHttpRequest) => {
                    message.error("发送失败");
                },
                success: (json) => {
                    if (json.result === 0) {
                        this.setState({
                            codeButtonStatus: true,
                            countDown: 60
                        }, () => {
                            this.fn_countDown = setInterval(this.countDown, 1000)
                        })
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
                        }
                    }
                }
            });
        }
    };
    // 已输入验证码写入
    setVerifyCode = (event) => {
        this.setState({
            verifyCode: event.target.value
        })
    };

    // 取消操作函数
    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false,
            }, () => {
                this.setState({
                    stage: 1,
                    cardsList: [],
                    phone: "",
                    countDown: 0,
                    codeButtonStatus: false,
                    verifyCode: "",
                    confirmLoading: false
                });
            })
        };
        // stage为3，直接执行取消操作
        if (this.state.stage === 3) {
            cancel();
            return
        }
        // 已输入信息校验，不为空则进行取消操作的二次确认
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

    // 确认操作函数
    handleCreate = (para) => {
        // 步骤1：输入提现基本信息，获取短信验证码
        if (para === 1) {
            const form = this.form;
            form.validateFields((err, values) => {
                if (err) {
                    return;
                }
                // 提现金额校验
                if (Number(values.amount) === 0) {
                    message.error("提现金额不能为0");
                    return
                }
                if (Number(values.amount) > Number(this.props.availableAmount)) {
                    message.error("提现金额不能大于可提现金额");
                    return
                }
                // 进入步骤2，发送短信验证码
                this.setState({
                    stage: 2,
                    withDrawData: values
                }, () => {
                    this.getCode();
                });
            })
        }
        // 步骤2：填写短信验证码
        if (para === 2) {
            // 校验短信验证码是否为空
            if (this.state.verifyCode) {
                this.setState({
                    confirmLoading: true
                });
                // 信息完全，提交提现申请
                reqwest({
                    url: '/finance/withdrawals',
                    type: 'json',
                    method: 'post',
                    headers: {
                        Authorization: sessionStorage.token
                    },
                    data: {
                        bankCardId: this.state.withDrawData.bankcard,
                        moneyStr: this.state.withDrawData.amount,
                        remark: this.state.withDrawData.remark,
                        code: this.state.verifyCode
                    },
                    error: (XMLHttpRequest) => {
                        message.error("保存失败");
                        this.setState({
                            confirmLoading: false
                        })
                    },
                    success: (json) => {
                        // 提现申请成功，进入步骤3
                        if (json.result === 0) {
                            this.setState({
                                stage: 3,
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
                                    confirmLoading: false
                                })
                            }
                        }
                    }
                })
            } else {
                message.error("短信验证码不能为空")
            }
        }
        // 步骤3：提现申请成功
        if (para === 3) {
            // 成功页面，确认与取消为相同操作
            this.handleCancel();
        }
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <div style={{display: "inline"}}>
                <Button style={{height: "28px", marginLeft: "50px"}} onClick={this.showModal}>立即提现</Button>
                <WithDrawForm
                    ref={this.saveFormRef}
                    loading={false}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    stage={this.state.stage}
                    amount={this.props.amount}
                    cardsList={this.state.cardsList}
                    countDown={this.state.countDown}
                    codeButtonStatus={this.state.codeButtonStatus}
                    getCode={this.getCode}
                    setVerifyCode={this.setVerifyCode}
                    confirmLoading={this.state.confirmLoading}
                />
            </div>
        );
    }
}

//提现详情组件
class WithDrawDetails extends Component {
    state = {
        visible: false
    };

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
                status = "提现失败"
            }
        }
        const dataSource = [
            <div className="amount">
                <span className="item-name">提现金额：</span>
                <span className="item-content">￥{data.money}</span>
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
                <span className="item-name">驳回意见：</span>
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

//收支详情组件
class FlowDetails extends Component {
    state = {
        visible: false
    };

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
        let financeType = "", journalType = "";
        if (this.props.data) {
            if (this.props.data.financeType === 1000) {
                financeType = "课程购买"
            }
            if (this.props.data.financeType === 2000) {
                financeType = "商城商品购买"
            }
            if (this.props.data.financeType === 3000) {
                financeType = "提现"
            }
            if (this.props.data.financeType === 4000) {
                financeType = "退款"
            }
            if (this.props.data.financeType === 4001) {
                financeType = "退款手续费"
            }
            if (this.props.data.financeType === 5000) {
                financeType = "可用余额转移"
            }
            if (this.props.data.journalType === 0) {
                journalType = "收入"
            }
            if (this.props.data.journalType === 1) {
                journalType = "支出"
            }
        }
        const dataSource = [
            <div className="amount">
                <span className="item-name">金额：</span>
                <span className="item-content">￥{data.amount}</span>
            </div>,
            <div className="createTime">
                <span className="item-name">创建时间：</span>
                <span className="item-content">{data.createTime ? this.timeHandle(data.createTime) : ""}</span>
            </div>,
            <div className="financeType">
                <span className="item-name">财务类型：</span>
                <span className="item-content">{financeType}</span>
            </div>,
            <div className="journalType">
                <span className="item-name">流水类型：</span>
                <span className="item-content">{journalType}</span>
            </div>,
            <div className="journalSerialNo">
                <span className="item-name">流水编号：</span>
                <span className="item-content">{data.journalSerialNo}</span>
            </div>,
            <div className="outSerialNo">
                <span className="item-name">外部单号：</span>
                <span className="item-content">{data.outSerialNo}</span>
            </div>,
            <div className="oldBalance">
                <span className="item-name">前余额：</span>
                <span className="item-content">￥{data.oldBalance}</span>
            </div>,
            <div className="newBalance">
                <span className="item-name">后余额：</span>
                <span className="item-content">￥{data.newBalance}</span>
            </div>
        ];
        return (
            <a>
                <span onClick={this.showModal}>详情</span>
                <Modal
                    title="收支详情"
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                    destroyOnClose={true}
                >
                    <div className="flow-details">
                        <div className="flow-baseData">
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

//收支提现列表
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
                pageSize: Number(localStorage.flowPageSige) || 10,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            },
        };
        this.columns = [];
        // 收入支出表格的列配置
        this.columns01 = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '金额',
                dataIndex: 'amount',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'amount'),
            },
            {
                title: "创建时间",
                dataIndex: "time",
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, "time"),
            },
            {
                title: '编号',
                dataIndex: 'number',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'number'),
            },
            {
                title: '财务类型',
                dataIndex: 'financeType',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'financeType'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            <FlowDetails data={this.state.originalData[record.index - 1]}/>
                        </div>
                    );
                },
            }
        ];
        // 提现表格的列配置
        this.columns02 = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '提现金额',
                dataIndex: 'amount',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'amount'),
            },
            {
                title: "提现单号",
                dataIndex: "number",
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, "number"),
            },
            {
                title: '状态',
                dataIndex: 'status',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'status'),
            },
            {
                title: '备注',
                dataIndex: 'remark',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'remark'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            <WithDrawDetails data={this.state.originalData[record.index - 1]}/>
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

    // 获取收入支出明细信息：type为0获取收入明细，type为1获取支出明细
    getData01 = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/finance/flowInformation',
            type: 'json',
            method: 'post',
            data: {
                type: Number(this.props.type),
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
                //                 id: 1,
                //                 EId: null,
                //                 amount: "",
                //                 createTime: "",
                //                 financeType: null,
                //                 journalSerialNo: "",
                //                 journalType: null,
                //                 newBalance: "",
                //                 oldBalance: "",
                //                 outSerialNo: "",
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
                            this.getData01();
                        });
                        return
                    }
                    json.data.list.forEach((item, index) => {
                        let financeType = "";
                        if (item.financeType === 1000) {
                            financeType = "课程购买"
                        }
                        if (item.financeType === 2000) {
                            financeType = "商城商品购买"
                        }
                        if (item.financeType === 3000) {
                            financeType = "提现"
                        }
                        if (item.financeType === 4000) {
                            financeType = "退款"
                        }
                        if (item.financeType === 4001) {
                            financeType = "退款手续费"
                        }
                        if (item.financeType === 5000) {
                            financeType = "可用余额转移"
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            amount: item.amount,
                            time: item.createTime ? this.timeHandle(item.createTime) : "",
                            number: item.journalSerialNo,
                            financeType: financeType
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
    // 获取提现明细信息
    getData02 = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/finance/withdrawalsRecord',
            type: 'json',
            method: 'post',
            data: {
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
                //                 EId: null,
                //                 auditTime: "",
                //                 auditor: null,
                //                 bankCard: "",
                //                 createTime: "",
                //                 id: 1,
                //                 money: "",
                //                 opinion: "",
                //                 remark: "",
                //                 status: null,
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
                            this.getData02();
                        });
                        return
                    }
                    json.data.list.forEach((item, index) => {
                        let status = "";
                        if (item.status === 0) {
                            status = "待审核"
                        }
                        if (item.status === 1) {
                            status = "审核通过"
                        }
                        if (item.status === 2) {
                            status = "提现失败"
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            amount: item.money,
                            number: item.withdrawalsSn,
                            status: status,
                            remark: item.remark
                        })
                    });
                    this.setState({
                        loading: false,
                        originalData: json.data.list,
                        data: data,
                        pagination: {
                            total: json.data.size,
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
        localStorage.flowPageSige = pagination.pageSize;
        pager.pageSize = Number(localStorage.flowPageSige);
        this.setState({
            pagination: pager,
        }, () => {
            // 信息分页请求时，表格参数有变更需重新拉取列表
            if (this.props.type === "0") {
                this.getData01()
            }
            if (this.props.type === "1") {
                this.getData01()
            }
            if (this.props.type === "2") {
                this.getData02()
            }
        });
    };

    componentWillMount() {
        // 根据当前type获取相应数据
        if (this.props.type === "0") {
            // 获取收入明细信息
            this.getData01()
        }
        if (this.props.type === "1") {
            // 获取支出明细信息
            this.getData01()
        }
        if (this.props.type === "2") {
            // 获取提现明细信息
            this.getData02()
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.type === this.props.type && nextProps.flag_add === this.props.flag_add) {
            // type及flag_add均无变化时，直接return
            return;
        }
        // 根据type获取相应数据
        if (nextProps.type === "0") {
            // 不同type表格的列配置可能不同，需先清空数据
            this.setState({
                originalData: [],
                data: [],
            }, () => {
                this.getData01()
            })
        }
        if (nextProps.type === "1") {
            this.setState({
                originalData: [],
                data: [],
            }, () => {
                this.getData01()
            })
        }
        if (nextProps.type === "2") {
            this.setState({
                originalData: [],
                data: [],
            }, () => {
                this.getData02()
            })
        }
    }

    render() {
        // 根据type设置相应的表格列配置
        if (this.props.type === "0") {
            this.columns = this.columns01
        }
        if (this.props.type === "1") {
            this.columns = this.columns01
        }
        if (this.props.type === "2") {
            this.columns = this.columns02;
        }
        return <Table bordered
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={this.state.pagination}
                      columns={this.columns}
                      onChange={this.handleTableChange}/>;
    }
}

class Finance extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 选项卡列表
            tabs: [],
            // 当前选项卡key值
            type: "0",
            // 机构收益余额
            amount: "",
            // 机构可提现金额
            availableAmount: "",
            flag_add: false
        }
    }

    // 当前登录人可见选项卡列表设置
    setTabs = () => {
        if (Number(sessionStorage.EId)) {
            // EId不为0，当前登录人为机构管理员
            // 获取该机构当前收益金额与可提现金额
            this.getBalance();
            this.setState({
                tabs: [
                    <TabPane tab="收入明细" key="0"/>,
                    <TabPane tab="支出明细" key="1"/>,
                    <TabPane tab="提现明细" key="2"/>
                ]
            })
        } else if (Number(sessionStorage.EId) === 0) {
            // EId为0，当前登录人为系统管理员
            this.setState({
                tabs: [
                    <TabPane tab="收入明细" key="0"/>,
                    <TabPane tab="支出明细" key="1"/>
                ]
            })
        }
    };

    // 当前选项卡key值设置
    setType = (key) => {
        this.setState({
            type: key
        })
    };

    setFlag = () => {
        this.setState({
            flag_add: !this.state.flag_add
        })
    };

    // 获取机构当前收益金额与可提现金额
    getBalance = () => {
        reqwest({
            url: '/institution/getBalance',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {

            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        amount: json.data.balance,
                        availableAmount: json.data.availableBalance
                    })
                } else {
                    message.error(json.message);
                }
            }
        });
    };

    // 登陆信息过期或不存在时的返回登陆页操作
    toLoginPage = () => {
        sessionStorage.clear();
        this.props.history.push('/')
    };

    componentWillMount() {
        // 根据缓存的EId设置当前登录人可见选项卡列表及其他一些后续操作
        this.setTabs();
        if (this.props.location.search) {
            this.props.history.push(this.props.location.pathname)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location.search) {
            this.props.history.push(nextProps.location.pathname);
            if (Number(sessionStorage.EId)) {
                this.getData();
                this.setState({
                    tabs: [
                        <TabPane tab="收入明细" key="0"/>,
                        <TabPane tab="支出明细" key="1"/>,
                        <TabPane tab="提现明细" key="2"/>
                    ]
                })
            } else {
                this.setState({
                    tabs: [
                        <TabPane tab="收入明细" key="0"/>,
                        <TabPane tab="支出明细" key="1"/>
                    ]
                })
            }
            this.setFlag();
        }
    }

    render() {
        return (
            <div className="finance">
                {/*顶部余额及提现申请模块，仅机构管理员可见*/}
                <header style={{display: Number(sessionStorage.EId) !== 0 ? "block" : "none"}}>
                    <div className="finance-now">
                        <div className="part-one item">
                            <span>收益余额：</span>
                            <span>￥{this.state.amount}</span>
                            <span style={{marginLeft: "20px"}}>可提现金额：</span>
                            <span>￥{this.state.availableAmount}</span>
                            <WithDraw availableAmount={this.state.availableAmount} getBalance={this.getBalance}/>
                        </div>
                    </div>
                </header>
                {/*tab栏*/}
                <Tabs defaultActiveKey={this.state.type} onChange={this.setType}>
                    {this.state.tabs}
                </Tabs>
                {/*列表*/}
                <div className="table-box">
                    <DataTable type={this.state.type} flag_add={this.state.flag_add} toLoginPage={this.toLoginPage}/>
                </div>
            </div>
        )
    }
}

export default Finance;