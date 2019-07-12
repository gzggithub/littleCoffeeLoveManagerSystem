import React, {Component} from 'react';
import {
    Icon,
    Card,
    Button,
    Modal,
    Input,
    message,
    Form,
} from 'antd';
import reqwest from 'reqwest';

const FormItem = Form.Item;
const confirm = Modal.confirm;

//栅格设置
const formItemLayout_10 = {
    labelCol: {span: 4},
    wrapperCol: {span: 10},
};

//添加银行卡表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, bankcardNum, bank, bankcardType, countDown, codeButtonStatus, getCode, setVerifyCode, form, stage, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 不同步骤设置不同提交按钮描述文字
        let bottomText = "";
        if (stage === 1) {
            bottomText = "下一步";
        }
        if (stage === 2) {
            bottomText = "提交";
        }

        return (
            <Modal
                title={"添加银行卡"}
                visible={visible}
                width={600}
                footer={
                    <Button type="primary" loading={confirmLoading}
                            onClick={() => onCreate(stage)}>{bottomText}</Button>
                }
                onCancel={onCancel}
                destroyOnClose={true}
            >
                <div className="bankcard-add bankcard-form">
                    <Form layout="vertical" style={{display: stage === 1 ? "block" : "none"}}>
                        <FormItem className="number" {...formItemLayout_10} label="卡号：">
                            {getFieldDecorator('number', {
                                rules: [{
                                    required: stage === 1,
                                    message: "银行卡号不能为空",
                                }],
                            })(
                                <Input placeholder="请输入银行卡号"/>
                            )}
                        </FormItem>
                    </Form>
                    <Form layout="vertical" style={{display: stage === 2 ? "block" : "none"}}>
                        <div className="bankcardNum">
                            <span className="item-name">银行卡号：</span>
                            <span className="item-content">{bankcardNum}</span>
                        </div>
                        <div className="card-type">
                            <span className="item-name">卡类型：</span>
                            <span className="item-content">{bank + " " + bankcardType}</span>
                        </div>
                        <div className="verifyCode-input">
                            <p className="input-hint">请输入手机 {sessionStorage.phone} 收到的短信验证码</p>
                            <Input placeholder="短信验证码" style={{float: "left", width: "200px", marginLeft: "80px"}}
                                   onBlur={(event) => setVerifyCode(event.target.value)}/>
                            <Button type="primary" style={{float: "left", marginLeft: "20px"}}
                                    onClick={getCode}>{codeButtonStatus ? countDown + "s后重发" : "获取验证码"}</Button>
                        </div>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//添加银行卡组件
class ItemAdd extends Component {
    state = {
        visible: false,
        // 操作步骤索引
        stage: 1,
        // 银行卡号
        bankcardNum: "",
        // 银行名
        bank: "",
        // 卡类型
        bankcardType: "",
        // 短信验证码相关变量
        countDown: 0,
        codeButtonStatus: false,
        verifyCode: "",
        confirmLoading: false
    };
    fn_countDown = "";

    showModal = () => {
        this.setState({
            visible: true,
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
    // 向当前登录人已绑定手机号发送验证码
    getCode = () => {
        if (this.state.codeButtonStatus) {
            return;
        } else {
            reqwest({
                url: '/mobileCode/sendVerificationCode',
                type: 'json',
                method: 'post',
                data: {
                    phone: sessionStorage.phone
                },
                headers: {
                    Authorization: sessionStorage.token
                },
                error: (XMLHttpRequest) => {
                    message.error("验证码发送失败");
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
                        if (json.code === "901") {
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
    setVerifyCode = (para) => {
        this.setState({
            verifyCode: para
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
                    bankcardNum: "",
                    bank: "",
                    bankcardType: "",
                    countDown: 0,
                    codeButtonStatus: false,
                    verifyCode: "",
                    confirmLoading: false
                });
            })
        };
        const data = form.getFieldsValue();
        if (data.number) {
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
        // 步骤1：输入银行卡号，校验成功则写入银行卡信息，并获取短信验证码
        if (para === 1) {
            const form = this.form;
            form.validateFields((err, values) => {
                if (err) {
                    return;
                }
                this.setState({
                    confirmLoading: true
                });
                reqwest({
                    url: '/finance/bankCardSlik',
                    type: 'json',
                    method: 'post',
                    headers: {
                        Authorization: sessionStorage.token
                    },
                    data: {
                        cardNum: values.number
                    },
                    error: (XMLHttpRequest) => {
                        message.error("查询失败");
                        this.setState({
                            confirmLoading: false
                        })
                        // const json = {
                        //     "result": 0,
                        //     "code": 200,
                        //     "data": {
                        //         "result": {
                        //             "bank": "",
                        //             "logo": "",
                        //             "tel": "",
                        //             "type": ""
                        //         },
                        //         "reason": "success",
                        //         "error_code": 0
                        //     }
                        // };
                    },
                    success: (json) => {
                        if (json.result === 0) {
                            if (json.data.error_code === 0) {
                                // 校验校验，写入银行卡基本信息，进入步骤2
                                this.setState({
                                    stage: 2,
                                    bankcardNum: values.number,
                                    bank: json.data.result.bank,
                                    bankcardType: json.data.result.type,
                                    confirmLoading: false
                                });
                                // 获取短信验证码
                                this.getCode();
                            } else {
                                message.error(json.data.reason);
                                this.setState({
                                    confirmLoading: false
                                });
                            }
                        } else {
                            if (json.code === "901") {
                                message.error("请先登录");
                                // 返回登陆页
                                this.props.toLoginPage();
                            } else if (json.code === 902) {
                                message.error("登录信息已过期，请重新登录");
                                // 返回登陆页
                                this.props.toLoginPage();
                            } else if (json.code === "1120") {
                                message.error("该银行卡已绑定，请勿重复添加");
                                this.setState({
                                    confirmLoading: false
                                })
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
        }
        // 步骤2：输入短信验证码，连同已写入银行卡信息进行提交绑定
        if (para === 2) {
            if (this.state.verifyCode) {
                this.setState({
                    confirmLoading: true
                });
                reqwest({
                    url: '/finance/bindingBankCard',
                    type: 'json',
                    method: 'post',
                    headers: {
                        Authorization: sessionStorage.token
                    },
                    data: {
                        bankcard: this.state.bankcardNum,
                        bank: this.state.bank,
                        code: this.state.verifyCode
                    },
                    error: (XMLHttpRequest) => {
                        message.error("保存失败");
                        this.setState({
                            confirmLoading: false
                        })
                    },
                    success: (json) => {
                        if (json.result === 0) {
                            message.success("银行卡添加成功");
                            this.setState({
                                visible: false,
                            },()=>{
                                this.setState({
                                    stage: 1,
                                    bankcardNum: "",
                                    bank: "",
                                    bankcardType: "",
                                    countDown: 0,
                                    codeButtonStatus: false,
                                    verifyCode: "",
                                    confirmLoading: false
                                })
                            });
                            // 绑定成功，重新拉取银行卡列表
                            this.props.recapture();
                        } else {
                            if (json.code === "901") {
                                message.error("请先登录");
                                // 返回登陆页
                                this.props.toLoginPage();
                            } else if (json.code === 902) {
                                message.error("登录信息已过期，请重新登录");
                                // 返回登陆页
                                this.props.toLoginPage();
                            } else if (json.code === "703") {
                                message.error("短信验证码错误或已过期");
                                this.setState({
                                    confirmLoading: false
                                })
                            } else if (json.code === "1018") {
                                message.error("机构负责人未实名认证，不能绑定银行卡");
                                this.setState({
                                    confirmLoading: false
                                })
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
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <div>
                <Button type="primary" onClick={this.showModal}>添加银行卡</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    loading={false}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    bankcardNum={this.state.bankcardNum}
                    bank={this.state.bank}
                    bankcardType={this.state.bankcardType}
                    countDown={this.state.countDown}
                    codeButtonStatus={this.state.codeButtonStatus}
                    getCode={this.getCode}
                    stage={this.state.stage}
                    setVerifyCode={this.setVerifyCode}
                    confirmLoading={this.state.confirmLoading}
                />
            </div>
        );
    }
}

class BankCards extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            // 空元素，当银行卡列表为空时展示
            empty: [<p key="empty" style={{
                textAlign: "center",
                fontSize: "14px",
                color: "rgba(0,0,0,0.45)",
                padding: 0,
                margin: 0
            }}>暂无银行卡</p>],
            // 银行卡元素列表
            cardsList: []
        };
    }

    // 登陆信息过期或不存在时的返回登陆页操作
    toLoginPage = () => {
        sessionStorage.clear();
        this.props.history.push('/')
    };

    getData = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/finance/getBankCard',
            type: 'json',
            method: 'post',
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
                //     data: [
                //         {
                //             EId: null,
                //             bank: "",
                //             cardNumber: "",
                //             createTime: "",
                //             id: 1,
                //             userId: null
                //         }
                //     ]
                // };
            },
            success: (json) => {
                const data = [];
                if (json.result === 0) {
                    if (json.data.length) {
                        json.data.forEach((item, index) => {
                            // 卡片背景色设置：默认#FF8353，偶数项改为#30AC53
                            let style = {};
                            if (index % 2) {
                                style = {backgroundColor: "#30AC53"};
                            }
                            data.push(
                                <Card.Grid style={style} key={index + 1}>
                                    <div className="part-one clearfix">
                                        <div className="icon"><Icon type="credit-card" style={{fontSize: 26}}/></div>
                                        <div className="bank-type">
                                            <p>{item.bank}</p>
                                            <p>{item.cardType}</p>
                                        </div>
                                    </div>
                                    <div className="part-two">
                                        <span>****</span>
                                        <span>****</span>
                                        <span>****</span>
                                        <span>****</span>
                                        <span>{item.cardNumber.slice(-3)}</span>
                                    </div>
                                </Card.Grid>
                            )
                        });
                    }
                    this.setState({
                        loading: false,
                        cardsList: data
                    })
                } else {
                    if (json.code === "901") {
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
        })
    };

    componentWillMount() {
        this.getData();
        if (this.props.location.search) {
            this.props.history.push(this.props.location.pathname)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location.search) {
            this.props.history.push(nextProps.location.pathname);
            this.getData();
        }
    }

    render() {
        return (
            <div className="bankcards">
                <header className="clearfix">
                    <span>银行卡列表</span>
                    <div className="add-button" style={{float: "right"}}>
                        {/*银行卡添加*/}
                        <ItemAdd recapture={this.getData} toLoginPage={this.toLoginPage}/>
                    </div>
                </header>
                <Card loading={this.state.loading}>
                    {/*银行卡列表为空时，展示空元素*/}
                    {this.state.cardsList.length ? this.state.cardsList : this.state.empty}
                </Card>
            </div>
        )
    }
}

export default BankCards;