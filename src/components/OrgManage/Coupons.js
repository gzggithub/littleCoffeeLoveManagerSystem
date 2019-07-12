import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    Select,
    Form,
    DatePicker,
    message,
    InputNumber,
    List,
    Radio,
    Popconfirm,
		Spin
} from 'antd';
import moment from 'moment';
import reqwest from 'reqwest';

const FormItem = Form.Item;
const {Option} = Select;
const {TextArea} = Input;
const RadioGroup = Radio.Group;
const confirm = Modal.confirm;

//栅格设置
const formItemLayout_8 = {
    labelCol: {span: 4},
    wrapperCol: {span: 8},
};
const formItemLayout_10 = {
    labelCol: {span: 4},
    wrapperCol: {span: 10},
};
const formItemLayout_14 = {
    labelCol: {span: 4},
    wrapperCol: {span: 14},
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//新增优惠券表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, type, setType, setTime, startTime, endTime, days, confirmLoading} = props;
        const {getFieldDecorator} = form;

        const tempStartTime = startTime ? moment(startTime) : "";
        const tempEndTime = endTime ? moment(endTime) : "";

        //日期选择限制
        function disabledDate01(current) {
            // Can not select days before today and today
            return current && current < moment().endOf('day');
        }

        function disabledDate02(current) {
            // Can not select days before today and today
            return current && current < moment().endOf('day');
        }

        return (
            <Modal
                visible={visible}
                title="新增优惠券"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
								destroyOnClose={true}
								confirmLoading={confirmLoading}
            >
                <div className="coupon-add coupon-form item-form">
                    <Form layout="vertical">
                        <FormItem className="type unnecessary" {...formItemLayout_10} label="类型：">
                            {getFieldDecorator('type', {
                                initialValue: 0,
                                rules: [{
                                    required: false,
                                }],
                            })(
                                <RadioGroup onChange={(event) => {
                                    setType(event.target.value)
                                }}>
                                    <Radio value={0}>满减券</Radio>
                                    <Radio value={1}>折扣券</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem className="name" {...formItemLayout_10} label="券名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '优惠券名称不能为空',
                                }],
                            })(
                                <Input placeholder="请输入优惠券名称"/>
                            )}
                        </FormItem>
                        <FormItem className="effective" {...formItemLayout_14} label="有效期：">
                            {getFieldDecorator('effective', {
                                initialValue: 0,
                                rules: [{
                                    required: true,
                                }],
                            })(
                                <RadioGroup>
                                    <Radio value={0} style={{height:"32px"}}>
                                        <DatePicker style={{width: "120px", marginRight: "5px"}}
                                                    size="small"
                                                    value={tempStartTime}
                                                    disabledDate={disabledDate01}
                                                    placeholder="请选择日期"
                                                    onChange={(data, dataString) => {
                                                        setTime(1, dataString)
                                                    }}/>
                                        至
                                        <DatePicker style={{width: "120px", marginLeft: "5px"}}
                                                    size="small"
                                                    value={tempEndTime}
                                                    disabledDate={disabledDate02}
                                                    placeholder="请选择日期"
                                                    onChange={(data, dataString) => {
                                                        setTime(2, dataString)
                                                    }}/>
                                    </Radio>
                                    <Radio value={1} style={{height:"32px"}}>
                                        <span>领到优惠券后 </span>
                                        <InputNumber min={0}
                                                     size="small"
                                                     value={days || ""}
                                                     onChange={(value) => {
                                                         setTime(3, value)
                                                     }}
                                        />
                                        <span>天内有效</span>
                                    </Radio>
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem className="premiseMoney" {...formItemLayout_8} label="前提金额：">
                            {getFieldDecorator('premiseMoney', {
                                rules: [{
                                    required: true,
                                    message: '前提金额不能为空',
                                }],
                            })(
                                <InputNumber min={0}/>
                            )}
                        </FormItem>
                        <FormItem className="reduction" {...formItemLayout_8} label="减免金额："
                                  style={{display: type === 0 ? "block" : "none"}}>
                            {getFieldDecorator('reduction', {
                                rules: [{
                                    required: type === 0,
                                    message: '减免金额不能为空',
                                }],
                            })(
                                <InputNumber min={0}/>
                            )}
                        </FormItem>
                        <FormItem className="discount" {...formItemLayout_8} label="折扣："
                                  style={{display: type === 1 ? "block" : "none"}}>
                            {getFieldDecorator('discount', {
                                rules: [{
                                    required: type === 1,
                                    message: '折扣不能为空',
                                }],
                            })(
                                <InputNumber min={0}/>
                            )}
                        </FormItem>
                        <FormItem className="range" {...formItemLayout_14} label="适用范围：">
                            {getFieldDecorator('range', {
                                initialValue: 0,
                                rules: [{
                                    required: true,
                                }],
                            })(
                                <RadioGroup>
                                    <Radio disabled={true} value={0}>通用</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem className="category" {...formItemLayout_14} label="适用类别：">
                            {getFieldDecorator('category', {
                                initialValue: 0,
                                rules: [{
                                    required: true,
                                }],
                            })(
                                <RadioGroup>
                                    <Radio disabled={true} value={0}>通用</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem className="explains noInput longItem" {...formItemLayout_14} label="使用规则：">
                            {getFieldDecorator('explains', {
                                rules: [{
                                    required: true,
                                    message: '使用规则不能为空',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写使用规则" rows={6}/>
                            )}
                        </FormItem>
                        <FormItem className="state" {...formItemLayout_8} label="状态：">
                            {getFieldDecorator('state', {
                                rules: [{
                                    required: true,
                                    message: '请设置优惠券状态',
                                }],
                            })(
                                <RadioGroup>
                                    <Radio value={0}>暂存</Radio>
                                    <Radio value={1}>启用</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);
//新增优惠券组件
class ItemAdd extends Component {
    state = {
        visible: false,
        type: 0,
        startTime: "",
        endTime: "",
        days: 0,
				confirmLoading : false
    };

    setType = (para) => {
        this.setState({
            type: para,
            premiseMoney: 0,
            discount: 0,
            reduction: 0
        })
    };

    setTime = (type, value) => {
        if (type === 1) {
            this.setState({
                startTime: value,
                days: 0
            })
        }
        if (type === 2) {
            this.setState({
                endTime: value,
                days: 0
            })
        }
        if (type === 3) {
            this.setState({
                days: value,
                startTime: "",
                endTime: "",
            })
        }
    };

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false,
                type: 0,
            }, () => {
                this.setState({
                    startTime: "",
                    endTime: "",
                    days: 0,
										confirmLoading : false
                });
                form.resetFields();
            })
        };
        let data = form.getFieldsValue();
        data.startTime = this.state.startTime;
        data.endTime = this.state.endTime;
        data.days = this.state.days;
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
            reqwest({
                url: '/coupon/saveCoupon',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    type: this.state.type,
                    name: values.name,
                    receiveTime: this.state.startTime,
                    overdueTime: this.state.endTime,
                    days: this.state.days,
                    premiseMoney: values.premiseMoney || 0,
                    discount: values.discount / 10 || 0,
                    reduction: values.reduction || 0,
                    ranges: 0,
                    category: 0,
                    explains: values.explains,
                    state: values.state
                },
                error: (XMLHttpRequest) => {
										message.error("保存失败");
										this.setState({
												confirmLoading:false
										})
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("优惠券添加成功");
                        this.setState({
                            visible: false,
                            type: 0,
                        }, () => {
                            this.setState({
                                startTime: "",
                                endTime: "",
                                days: 0,
																confirmLoading : false
                            });
														form.resetFields();
                        });
                        this.props.setFlag()
                    }else{
												message.error(json.message);
												this.setState({
														confirmLoading:false
												})
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
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button type="primary" onClick={this.showModal}>新增优惠券</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    type={this.state.type}
                    setType={this.setType}
                    setTime={this.setTime}
                    startTime={this.state.startTime}
                    endTime={this.state.endTime}
                    days={this.state.days}
										confirmLoading={this.state.confirmLoading}
                />
            </div>
        );
    }
}

//优惠券编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, setTime, startTime, endTime, days, confirmLoading} = props;
        const {getFieldDecorator} = form;

        const tempStartTime = startTime ? moment(startTime) : "";
        const tempEndTime = endTime ? moment(endTime) : "";

        //日期选择限制
        function disabledDate01(current) {
            // Can not select days before today and today
            return current && current < moment().endOf('day');
        }

        function disabledDate02(current) {
            // Can not select days before today and today
            return current && current < moment().endOf('day');
        }

        return (
            <Modal
                visible={visible}
                title="优惠券编辑"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
								destroyOnClose={true}
								confirmLoading={confirmLoading}
            >
								{
										JSON.stringify(data)==="{}"?
										<div className="spin-box">
												<Spin/>
										</div>
										:
										<div className="coupon-edit coupon-form">
												<Form layout="vertical">
														<FormItem className="name" {...formItemLayout_10} label="券名称：">
																{getFieldDecorator('name', {
																		initialValue: data.name,
																		rules: [{
																				required: true,
																				message: '优惠券名称不能为空',
																		}],
																})(
																		<Input placeholder="请输入优惠券名称"/>
																)}
														</FormItem>
														<FormItem className="effective" {...formItemLayout_14} label="有效期：">
																{getFieldDecorator('effective', {
																		initialValue: data.days ? 1 : 0,
																		rules: [{
																				required: true,
																		}],
																})(
																		<RadioGroup>
																				<Radio value={0} style={{height:"32px"}}>
																						<DatePicker style={{width: "120px", marginRight: "5px"}}
																												size="small"
																												value={tempStartTime}
																												disabledDate={disabledDate01}
																												placeholder="请选择日期"
																												onChange={(data, dataString) => {
																														setTime(1, dataString)
																												}}/>
																						至
																						<DatePicker style={{width: "120px", marginLeft: "5px"}}
																												size="small"
																												value={tempEndTime}
																												disabledDate={disabledDate02}
																												placeholder="请选择日期"
																												onChange={(data, dataString) => {
																														setTime(2, dataString)
																												}}/>
																				</Radio>
																				<Radio value={1} style={{height:"32px"}}>
																						<span>领到优惠券后 </span>
																						<InputNumber min={0}
																												size="small"
																												value={days || ""}
																												onChange={(value) => {
																														setTime(3, value)
																												}}
																						/>
																						<span>天内有效</span>
																				</Radio>
																		</RadioGroup>
																)}
														</FormItem>
														<FormItem className="premiseMoney" {...formItemLayout_8} label="前提金额：">
																{getFieldDecorator('premiseMoney', {
																		initialValue: data.premiseMoney,
																		rules: [{
																				required: true,
																				message: '前提金额不能为空',
																		}],
																})(
																		<InputNumber min={0}/>
																)}
														</FormItem>
														<FormItem className="reduction" {...formItemLayout_8} label="减免金额："
																			style={{display: data.type === 0 ? "block" : "none"}}>
																{getFieldDecorator('reduction', {
																		initialValue: data.reduction,
																		rules: [{
																				required: data.type === 0,
																				message: '减免金额不能为空',
																		}],
																})(
																		<InputNumber min={0}/>
																)}
														</FormItem>
														<FormItem className="discount" {...formItemLayout_8} label="折扣："
																			style={{display: data.type === 1 ? "block" : "none"}}>
																{getFieldDecorator('discount', {
																		initialValue: data.discount,
																		rules: [{
																				required: data.type === 1,
																				message: '折扣不能为空',
																		}],
																})(
																		<InputNumber min={0}/>
																)}
														</FormItem>
														<FormItem className="explains noInput longItem" {...formItemLayout_14} label="使用规则：">
																{getFieldDecorator('explains', {
																		initialValue: data.explains,
																		rules: [{
																				required: true,
																				message: '使用规则不能为空',
																		}],
																})(
																		<TextArea style={{resize: "none"}} placeholder="请填写使用规则" rows={6}/>
																)}
														</FormItem>
												</Form>
										</div>
								}
            </Modal>
        );
    }
);
//优惠券编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,
        data: {},
        startTime: "",
        endTime: "",
        days: 0,
				confirmLoading : false
    };

    dateHandle = (para) => {
        if (!para) {
            return ""
        }
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
            url: '/coupon/getCouponGrantDetails',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: this.props.id
            },
            error: (XMLHttpRequest) => {
//                 const json = {
//                     result: 0,
//                     data: {
//                         couponGrant: {
//                             id: 1,
//                             name: "",
//                             type: null,
//                             receiveTime: "",
//                             overdueTime: "",
//                             days: null,
//                             premiseMoney: "",
//                             discount: "",
//                             reduction: "",
//                             ranges: null,
//                             category: null,
//                             explains: "",
//                             state: null
//                         }
//                     },
//                 };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        data: json.data.couponGrant,
                        startTime: this.dateHandle(json.data.couponGrant.receiveTime),
                        endTime: this.dateHandle(json.data.couponGrant.overdueTime),
                        days: json.data.couponGrant.days,
                        premiseMoney: json.data.couponGrant.premiseMoney,
                        reduction: json.data.couponGrant.reduction,
                        discount: json.data.couponGrant.discount
                    });
                }else{
										if (json.code === "901") {
												sessionStorage.clear();
												sessionStorage.noMessageHint = "901";
												window.location = "/";
										}
										if (json.code === "902") {
												sessionStorage.clear();
												sessionStorage.noMessageHint = "902";
												window.location = "/";
										}
										message.error(json.message);
								}
            }
        })
    };

    setTime = (type, value) => {
        if (type === 1) {
            this.setState({
                startTime: value,
                days: 0
            })
        }
        if (type === 2) {
            this.setState({
                endTime: value,
                days: 0
            })
        }
        if (type === 3) {
            this.setState({
                days: value,
                startTime: "",
                endTime: "",
            })
        }
    };

    showModal = () => {
        this.getData();
        this.setState({
            visible: true
        })
    };

    submitHandle = (values) => {
        const initValues = this.state.data;
        const itemList = ["name", "premiseMoney", "reduction", "discount", "explains"];
        const result = {};

        itemList.forEach((item) => {
            if (values[item] !== initValues[item]) {
                result[item] = values[item];
            }
        });
        if (this.state.startTime !== this.dateHandle(initValues.receiveTime)) {
            result.receiveTime = this.state.startTime
        }
        if (this.state.endTime !== this.dateHandle(initValues.overdueTime)) {
            result.overdueTime = this.state.endTime
        }
        if (this.state.days !== initValues.days) {
            result.days = this.state.days
        }
        if (JSON.stringify(result) === "{}") {
            return false;
        } else {
            result.id = this.props.id;
            return result;
        }
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
            		visible: false,
            		type: 0,
            }, () => {
            		this.setState({
            				startTime: "",
            				endTime: "",
            				days: 0,
            				confirmLoading : false
            		});
            		form.resetFields();
            })
        };
				if(JSON.stringify(this.state.data)==="{}"){
						cancel();
						return;
				}
        form.validateFields((err, values) => {
            const result = this.submitHandle(values);
            if (result) {
                confirm({
                    title: '已修改信息未保存，确认放弃修改？',
                    content: "",
                    okText: '确认',
                    okType: 'danger',
                    cancelText: '取消',
                    onOk() {
                        cancel();
                    }
                });
            } else {
                cancel()
            }
        })
    };

    handleCreate = () => {
				if(JSON.stringify(this.state.data)==="{}"){
						return;
				}
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            const result = this.submitHandle(values);
            if (!result) {
								message.error("暂无信息更改，无法提交");
                return;
            }
						this.setState({
								confirmLoading:true
						})
            reqwest({
                url: '/coupon/modifyCouponDetails',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: result,
                error: (XMLHttpRequest) => {
										message.error("保存失败");
										this.setState({
												confirmLoading:false
										})
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("优惠券信息修改成功");
                        this.setState({
                        		visible: false,
                        		type: 0,
                        }, () => {
                        		this.setState({
                        				startTime: "",
                        				endTime: "",
                        				days: 0,
                        				confirmLoading: false
                        		});
                        		form.resetFields();
                        });
                        this.props.recapture()
                    } else {
                        message.error(json.message);
												this.setState({
														confirmLoading:false
												})
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
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>编辑</span>
                <ItemEditForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    data={this.state.data}
                    setTime={this.setTime}
                    startTime={this.state.startTime}
                    endTime={this.state.endTime}
                    days={this.state.days}
										confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//优惠券详情
class ItemDetails extends Component {
    state = {
        visible: false,
				loading: true,
        data: {}
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
            url: '/coupon/getCouponGrantDetails',
            type: 'json',
            method: 'post',
            data: {
                id: this.props.id
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
//                 const json = {
//                     result: 0,
//                     data: {
//                         couponGrant: {
//                             id: 1,
//                             name: "",
//                             type: null,
//                             createTime: "",
//                             // receiveTime: "",
//                             // overdueTime: "",
//                             days: null,
//                             premiseMoney: "",
//                             discount: "",
//                             reduction: "",
//                             ranges: null,
//                             category: null,
//                             explains: "\n" + "\n" + "",
//                             state: null
//                         }
//                     },
//                 };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
												loading: false,
                        data: json.data.couponGrant
                    })
                }else{
										if (json.code === "901") {
												sessionStorage.clear();
												sessionStorage.noMessageHint = "901";
												window.location = "/";
										}
										if (json.code === "902") {
												sessionStorage.clear();
												sessionStorage.noMessageHint = "902";
												window.location = "/";
										}
										message.error(json.message);
								}
            }
        });
    };

    showModal = () => {
        this.getData();
        this.setState({
            visible: true,
        })
    };

    handleCancel = () => {
        this.setState({
            visible: false
        });
    };

    render() {
        let tempType = "";
        if (this.state.data.type === 0) {
            tempType = "满减券"
        }
        if (this.state.data.type === 1) {
            tempType = "打折券"
        }
        let tempState = "";
        if (this.state.data.state === 0) {
            tempState = "暂存"
        }
        if (this.state.data.state === 1) {
            tempState = "启用"
        }
        if (this.state.data.state === 2) {
            tempState = "禁用"
        }
        let tempRanges = "";
        if (this.state.data.ranges === 0) {
            tempRanges = "通用"
        }
        let tempCategory = "";
        if (this.state.data.category === 0) {
            tempCategory = "通用"
        }
        const baseData = [
            <div>
                <span className="item-name">券名称：</span>
                <span className="item-content">{this.state.data.name}</span>
            </div>,
            <div>
                <span className="item-name">券类型：</span>
                <span className="item-content">{tempType}</span>
            </div>,
            <div>
                <span className="item-name">创建时间：</span>
                <span
                    className="item-content">{this.state.data.createTime ? this.dateHandle(this.state.data.createTime) : ""}</span>
            </div>,
            <div>
                <span className="item-name">开始时间：</span>
                <span
                    className="item-content">{this.state.data.receiveTime ? this.dateHandle(this.state.data.receiveTime) : "无"}</span>
            </div>,
            <div>
                <span className="item-name">过期时间：</span>
                <span
                    className="item-content">{this.state.data.overdueTime ? this.dateHandle(this.state.data.overdueTime) : "无"}</span>
            </div>,
            <div>
                <span className="item-name">有效天数：</span>
                <span className="item-content">{this.state.data.days || "无"}</span>
            </div>,
            <div>
                <span className="item-name">前提金额：</span>
                <span className="item-content">{this.state.data.premiseMoney}</span>
            </div>,
            <div>
                <span className="item-name">减免金额：</span>
                <span className="item-content">{Number(this.state.data.reduction) || "无"}</span>
            </div>,
            <div>
                <span className="item-name">折扣：</span>
                <span className="item-content">{Number(this.state.data.discount) || "无"}</span>
            </div>,
            <div>
                <span className="item-name">适用范围：</span>
                <span className="item-content">{tempRanges}</span>
            </div>,
            <div>
                <span className="item-name">适用类别：</span>
                <span className="item-content">{tempCategory}</span>
            </div>,
            <div>
                <span className="item-name">使用规则：</span>
								<pre>
										<span className="item-content">{this.state.data.explains}</span>
								</pre>
            </div>,
            <div>
                <span className="item-name">状态：</span>
                <span className="item-content">{tempState}</span>
            </div>
        ];
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>详情</span>
                <Modal
                    title="优惠券详情"
										width={600}
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
										destroyOnClose={true}
                >
                    <div className="coupon-details item-details">
                        <div className="coupon-baseData">
                            <List
                                size="small"
                                split="false"
                                dataSource={this.state.loading?"":baseData}
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

//优惠券核销表单
const CouponsDestroyForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, setPhone, couponsList, confirmLoading} = props;
        const {getFieldDecorator} = form;

        const optionsOfCouponsList = [];
        couponsList.forEach((item, index) => {
            optionsOfCouponsList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
        });

        return (
            <Modal
                visible={visible}
                title="优惠券核销"
								width={600}
                onCancel={onCancel}
                onOk={onCreate}
								destroyOnClose={true}
								confirmLoading={confirmLoading}
            >
                <div className="couponsDestroy-form">
                    <Form layout="vertical">
                        <FormItem className="phone" {...formItemLayout_10} label="手机号：">
                            {getFieldDecorator('phone', {
                                rules: [{
                                    required: true,
                                    message: '手机号不能为空',
                                }],
                            })(
                                <Input placeholder="请输入手机号进行查询" onBlur={(event) => {
                                    setPhone(event.target.value)
                                }}/>
                            )}
                        </FormItem>
                        <FormItem className="couponId" {...formItemLayout_10} label="优惠券：">
                            {getFieldDecorator('couponId', {
                                rules: [{
                                    required: true,
                                    message: "优惠券不能为空"
                                }]
                            })(
                                <Select
                                    style={{width: '100%'}}
                                    placeholder="请选择优惠券"
                                >
                                    {optionsOfCouponsList}
                                </Select>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);
//优惠券核销组件
class CouponsDestroy extends Component {
    state = {
        visible: false,
        phone: "",
        couponsList: [],
				confirmLoading : false
    };

    getCouponsList = () => {
        reqwest({
            url: '/coupon/couponDestroyPhone',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                phone: this.state.phone
            },
            error: (XMLHttpRequest) => {
//                 const json = {
//                     result: 0,
//                     data: [
//                         {
//                             id: 1,
//                             name: "",
//                             type: 0,
//                             state: 1,
//                         },
//                     ]
//                 };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        couponsList: json.data
                    })
                }else{
										message.error(json.message);
								}
            }
        })
    };

    setPhone = (para) => {
				if(para){
						this.setState({
								phone: para
						}, () => {
								this.getCouponsList()
						})
				}
    };

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
								this.setState({
										phone: "",
										couponsList: [],
										confirmLoading : false
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
						this.setState({
								confirmLoading:true
						})
            reqwest({
                url: '/coupon/couponDestroyId',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    id: values.couponId
                },
                error: (XMLHttpRequest) => {
										message.error("保存失败");
										this.setState({
												confirmLoading:false
										})
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("优惠券核销成功");
                        this.setState({
                            visible: false
                        }, () => {
														this.setState({
																phone: "",
																couponsList: [],
																confirmLoading : false
														});
                            form.resetFields()
                        });
                    }else{
												message.error(json.message);
												this.setState({
														confirmLoading:false
												})
										}
                }
            })
        })
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button type="primary" onClick={this.showModal}>优惠券核销</Button>
                <CouponsDestroyForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    setPhone={this.setPhone}
                    couponsList={this.state.couponsList}
										confirmLoading={this.state.confirmLoading}
                />
            </div>
        )
    }
}

//优惠券列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
						loading: true,
            data: [{key: 1}],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.couponsPageSize) || 10,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            }
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '券名称',
                dataIndex: 'name',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '种类',
                dataIndex: 'type',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'type'),
            },
            {
                title: '状态',
                dataIndex: 'state',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'state'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            <ItemDetails id={record.id} opStatus={this.props.opObj.select}/>
                            <ItemEdit id={record.id} state={record.stateCode} recapture={this.getData} opStatus={this.props.opObj.modify&&record.stateCode !== 1}/>
                            <Popconfirm title={record.stateCode === 1 ? "确认禁用?" : "确认启用?"}
                                        placement="topRight"
                                        onConfirm={() => this.itemState(record.id, record.stateCode)}
                                        onCancel=""
                                        okType="danger"
                                        okText="确认"
                                        cancelText="取消">
                                <a style={{display: this.props.opObj.modify ? "inline" : "none"}}>{record.stateCode === 1 ? "禁用" : "启用"}</a>
                            </Popconfirm>
                            <Popconfirm title="确认删除?"
                                        placement="topRight"
                                        onConfirm={() => this.itemDelete(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="立即删除"
                                        cancelText="取消">
                                <a style={{display: this.props.opObj.delete ? "inline" : "none"}}>删除</a>
                            </Popconfirm>
                        </div>
                    );
                },
            }
        ];
    };

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    };

    //获取本页信息
    getData = () => {
				this.setState({
						loading: true
				})
        reqwest({
            url: '/coupon/getCouponList',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize
            },
            error: (XMLHttpRequest) => {
//                 const json = {
//                     result: 0,
//                     data: {
//                         size: 111,
//                         list: [
//                             {
//                                 id: 1,
//                                 name: "",
//                                 type: 0,
//                                 state: 1,
//                             },
//                             {
//                                 id: 2,
//                                 name: "",
//                                 type: 1,
//                                 state: 0,
//                             },
//                             {
//                                 id: 3,
//                                 name: "",
//                                 type: 1,
//                                 state: 2,
//                             }
//                         ]
//                     }
//                 };
            },
            success: (json) => {
                const data = [];
                if (json.result === 0) {
                    if (json.data.list) {
                        json.data.list.forEach((item, index) => {
                            let tempType = "";
                            if (item.type === 0) {
                                tempType = "满减券"
                            }
                            if (item.type === 1) {
                                tempType = "打折券"
                            }
                            let tempState = "";
                            if (item.state === 0) {
                                tempState = "暂存"
                            }
                            if (item.state === 1) {
                                tempState = "启用"
                            }
                            if (item.state === 2) {
                                tempState = "禁用"
                            }
                            data.push({
                                key: index.toString(),
                                id: item.id,
                                index: index + 1,
                                name: item.name,
                                type: tempType,
                                stateCode: item.state,
                                state: tempState
                            });
                        });
                    }
                    this.setState({
												loading: false,
                        data: data,
                        pagination: {
                            total: json.data.size,
                            current: this.state.pagination.current,
                            pageSize: this.state.pagination.pageSize
                        }
                    });
                } else {
                    if (json.code === "901") {
                    		sessionStorage.clear();
                    		sessionStorage.noMessageHint = "901";
                    		window.location = "/";
                    }
                    if (json.code === "902") {
                    		sessionStorage.clear();
                    		sessionStorage.noMessageHint = "902";
                    		window.location = "/";
                    }
                    message.error(json.message);
                    this.setState({
                    		loading: false
                    })
                }
            }
        });
    };

    //状态设置
    itemState = (id, state) => {
        let tempState = 0;
        if (state === 1) {
            tempState = 2
        } else {
            tempState = 1
        }
				this.setState({
						loading: true
				})
        reqwest({
            url: '/coupon/couponShelves',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: id,
                state: tempState
            },
            error: (XMLHttpRequest) => {
								message.error("保存失败");
								this.setState({
										loading: false
								})
            },
            success: (json) => {
                if (json.result === 0) {
                    if (tempState === 1) {
                        message.success("优惠券启用成功");
                    }
                    if (tempState === 2) {
                        message.success("优惠券禁用成功");
                    }
                    this.getData();
                }else{
										if (json.code === "901") {
												sessionStorage.clear();
												sessionStorage.noMessageHint = "901";
												window.location = "/";
										}
										if (json.code === "902") {
												sessionStorage.clear();
												sessionStorage.noMessageHint = "902";
												window.location = "/";
										}
										message.error(json.message);
										this.setState({
												loading: false
										})
								}
            }
        })
    };

    //删除
    itemDelete = (para) => {
				this.setState({
						loading: true
				})
        reqwest({
            url: '/coupon/removeCoupon',
            type: 'json',
            method: 'post',
            data: {
                id: para
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
								message.error("保存失败");
								this.setState({
										loading: false
								})
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("优惠券删除成功");
                    this.getData();
                }else{
										if (json.code === "901") {
												sessionStorage.clear();
												sessionStorage.noMessageHint = "901";
												window.location = "/";
										}
										if (json.code === "902") {
												sessionStorage.clear();
												sessionStorage.noMessageHint = "902";
												window.location = "/";
										}
										message.error(json.message);
										this.setState({
												loading: false
										})
								}
            }
        });
    };

    //页码变化处理
    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
				localStorage.couponsPageSize = pagination.pageSize;
				pager.pageSize = Number(localStorage.couponsPageSize);
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
        if (nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData();
    };

    render() {
        return <Table bordered
											loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={this.state.pagination}
                      columns={this.columns}
                      onChange={this.handleTableChange}/>;
    }
}

class Coupons extends Component {
    constructor(props) {
        super(props);
        this.state = {
						opObj: {},
            flag_add: false
        }
    };

    setFlag = () => {
        this.setState({
            flag_add: !this.state.flag_add
        })
    };

    componentWillMount() {
				JSON.parse(sessionStorage.menuList).forEach((item)=>{
						item.children.forEach((subItem)=>{
								if(subItem.url===this.props.location.pathname){
										let data={};
										subItem.children.forEach((thirdItem)=>{
												data[thirdItem.url]=true;
										})
										this.setState({
												opObj: data
										})
								}
						})
				})
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
            <div className="coupons">
								{
										this.state.opObj.select?
										<div>
												<header className="clearfix">
														<span>优惠券列表</span>
														<div className="add-button" style={{float: "right"}}>
																<ItemAdd opStatus={this.state.opObj.add} setFlag={this.setFlag}/>
														</div>
														<div className="destroy-button" style={{float: "right", marginRight: "20px"}}>
																<CouponsDestroy opStatus={this.state.opObj.modify}/>
														</div>
												</header>
												<div className="table-box">
														<DataTable opObj={this.state.opObj} flag_add={this.state.flag_add}/>
												</div>
										</div>
										:
										<p>暂无查询权限</p>
								}
            </div>
        )
    }
}

export default Coupons;