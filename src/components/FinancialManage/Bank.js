import React, {Component} from 'react';
import {
    HashRouter as Router,
} from 'react-router-dom';
import {
    Input,
    Button,
    Modal,
    Form,
    Row,
    Col,
    message,
} from 'antd';
import reqwest from 'reqwest';
import '../../config/config';

const FormItem = Form.Item;
const confirm = Modal.confirm;

//信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {readlyOnly, onCancel, onCreate, form, data} = props;
        const {getFieldDecorator} = form;

        return (
            <div>
                <div className="institution-add institution-form receive-bank-card-form company-form item-form" style={{width: "25%", margin: "0 auto"}}>
                    <Form layout="vertical">
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem className="name" label="银行开户名：">
                                    {getFieldDecorator('accountName', {
                                        initialValue: data.accountName,
                                        rules: [{
                                            required: true,
                                            message: '银行开户名不能为空',
                                        }],
                                    })(
                                        <Input disabled={readlyOnly} placeholder="请输入银行开户名"/>
                                    )}
                                </FormItem>                               
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>                                             
                             <Col span={24}>
                                <FormItem className="licenseNumber" label="银行卡号：">
                                    {getFieldDecorator('cardNum', {
                                        initialValue: data.cardNum,
                                        rules: [{
                                            required: true,
                                            message: '请填写正确的银行卡号',
                                            len: 18,
                                        }],
                                    })(
                                        <Input disabled={readlyOnly} placeholder="请输入18位银行卡号"/>
                                    )}
                                </FormItem>                                
                             </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem className="adminUserPhone" label="开户行名称：">
                                    {getFieldDecorator('bankName', {
                                        initialValue: data.bankName,
                                        rules: [{
                                            required: true,
                                            message: '开户行名称不能为空',
                                        }],
                                    })(
                                        <Input disabled={readlyOnly} placeholder="请输入开户行名称"/>
                                    )}
                                </FormItem>
                            </Col>                       
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem className="adminUserName ant-form-explain-reset-css" label="开户行所在地：">
                                    {getFieldDecorator('bankAddress', {
                                        initialValue: data.bankAddress,
                                        rules: [{
                                            required: true,
                                            message: '开户行所在地不能为空',
                                        }],
                                    })(
                                        <Input disabled={readlyOnly} placeholder="请输入开户行所在地"/>
                                    )}
                                </FormItem>
                            </Col>                            
                        </Row>
                        <div className="ant-line"></div>
                        <div className="ant-line"></div>
                    </Form>
                </div>
                <footer className="clearfix" style={{height: 100, marginTop: 20, display: readlyOnly ? "none" : "block"}}>
                    {/*银行卡编辑*/}
                    <div className="add-button" style={{float: "right"}}>
                        <Button type="primary" onClick={onCreate} style={{marginRight: 20}}>确定</Button>
                        <Button type="primary" onClick={onCancel} style={{marginRight: 20}}>重置</Button>                                                
                    </div>
                </footer>
            </div>           
           
        );
    }
);

//银行卡信息编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,
        // 控制不能修改
        readlyOnly: true,
        // 银行卡基本信息
        data: {},       
        // 提交按钮状态变量
        confirmLoading: false
    };

    // 获取银行卡基本信息
    getData = () => {
        reqwest({
            url: '/sys/orgBank/details',
            type: 'json',
            method: 'get',
            data: {
                // id: this.props.id,
                orgId: sessionStorage.orgId,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
               
            },
            success: (json) => {
                if (json.result === 0) {
                    if (json.data) {
                        this.setState({
                            data: json.data,
                        }) 
                    }                    
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
        // 获取银行卡基本信息
        this.getData();
        // 获取上传Token
        this.setState({
            visible: true,
        })
    };

    // 点击编辑
    editCompany = () => {
        this.setState({
            readlyOnly: false,
        })
    };

    // 信息比对函数
    dataContrast = (values) => {
        const initValues = this.state.data;
        const itemList = ["accountName", "cardNum", "bankName", "bankAddress"];
        const result = {};
        itemList.forEach((item) => {
            if (values[item] !== initValues[item]) {
                result[item] = values[item];
            }
        });
        console.log(result);
        if (JSON.stringify(result) === "{}") {
            return false;
        } else {
            result.educationKey = this.props.educationKey;
            return result;
        }
    };

    // 取消操作
    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
                    data: {},           
                    confirmLoading: false,
                    // readlyOnly: true,
                });
                form.resetFields();
            });
        };
           
        confirm({
            title: '已有信息会被清空，确认重置？',
            content: "",
            okText: '确认',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                cancel();
            }
        });
    };

    // 确认操作
    handleCreate = () => {
        const form = this.form;
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            // 信息比对
            // const result = this.dataContrast(values);
            const result = {
                id: sessionStorage.orgId,  
                accountName: values.accountName,
                cardNum: values.cardNum,
                bankName: values.bankName,
                bankAddress: values.bankAddress,    
            };

            if (!result) {
                message.error("暂无信息更改");
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/sys/orgBank/update',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: result,
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        this.countDownTip();
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                data: {},                                
                                confirmLoading: false,
                                readlyOnly: true,
                            });
                            form.resetFields();
                            this.getData();                          
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
            });
        });
    };

     // 倒计时
    countDownTip = () => {
        let secondsToGo = 3;
        const modal = Modal.success({
            title: `友情提示`,
            content: `修改银行卡成功，正在返回，请稍后 ${secondsToGo} s.`,
        });
        const timer = setInterval(() => {
            secondsToGo -= 1;
            modal.update({
               content: `修改银行卡成功，正在返回，请稍后 ${secondsToGo} s.`,
            });
        }, 1000);
        setTimeout(() => {
            clearInterval(timer);
            modal.destroy();
        }, secondsToGo * 1000);
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    componentWillMount() {
        // 获取银行卡基本信息
        this.getData();
        this.setState({
            visible: true
        })        
    };

    render() {
        // opStatus
        return (
            <div>
                <header className="clearfix">
                    {/*银行卡编辑*/}
                    <div className="add-button" style={{float: "right"}}>
                        <Button type="primary" onClick={this.editCompany} style={{margin: "20px 20px 0 0", display: this.props.opStatus ? "inline" : "none"}}>编辑</Button>
                    </div>
                </header>
                <ItemEditForm
                    style={{width: "100%"}}
                    ref={this.saveFormRef}
                    readlyOnly={this.state.readlyOnly}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    id={this.props.id}
                    data={this.state.data}
                />
            </div>
            
        );
    }
}

class ReceiveBankCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            type: '1',
            // 获取银行卡列表所需关键词
            keyword: {
                cityCode: "",
                educationName: "",
                startTime: "",
                endTime: "",
            },
            flag_add: false,
        };
    }

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
        // 菜单信息为空则直接返回登陆页
        if (!sessionStorage.menuListOne) {
            this.toLoginPage();
            return
        }
        JSON.parse(sessionStorage.menuListOne).forEach((item) => {
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
        console.log(this.state.opObj);
        return (
            <Router>
                <div className="institutions">
                    {
                        this.state.opObj.viewBank ?
                            <div >                       
                                <div className="companyEdit" style={{width: "100%", mixHeight: "600px", marginBottom: "15px", background: "#FFF", overflowY: "scroll"}}>
                                    <ItemEdit opStatus={this.state.opObj.modifyBank} toLoginPage={this.toLoginPage}/>
                                </div>              
                            </div>
                            :
                            <p>暂无查询权限</p>
                    }
                </div>
            </Router>   
        )
    }
}

export default ReceiveBankCard;