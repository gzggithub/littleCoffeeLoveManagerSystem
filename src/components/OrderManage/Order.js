import React, {Component} from 'react';
import {
    Link,
} from 'react-router-dom';
import {
    Table,
    Input,
    DatePicker,
    Select,
    Modal,
    Form,
    Row,
    Col,
    message,
    Spin,
    Button,
} from 'antd';
import '../../config/config';
import reqwest from 'reqwest';

const Search = Input.Search;
const {Option} = Select;
const FormItem = Form.Item;
const confirm = Modal.confirm;

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//订单信息使用表单
const ItemUseForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, dataToSign, consumeTime, allTypeList, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 总订单选项生成
        const optionsOfAllTypeList = [];
        if (allTypeList) {
            allTypeList.forEach((item, index) => {
                optionsOfAllTypeList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
            });
        }

        const tempConsumeTimeList = [];
        // 使用次数小于等于0时当前时间不显示
        if (data.remainConsumeTimes > 0) {
            tempConsumeTimeList.push(
                <Col span={8}>
                    <FormItem className="licenseNumber" label="消费时间：">
                        {getFieldDecorator('consumeTime', {
                            initialValue: consumeTime,
                            rules: [{
                                required: true,
                                message: '消费时间不能为空',
                            }],
                        })(
                            <Input disabled placeholder="请输入消费时间"/>
                        )}
                    </FormItem>
                </Col>);
        }
        if (dataToSign.signList) {
            dataToSign.signList.forEach((item, index) => {
                tempConsumeTimeList.push(
                    <Col span={8} key={index + 1}>
                        <FormItem className="licenseNumber" label="消费时间：">
                            {getFieldDecorator('createTime' + (index + 1), {
                                initialValue: item.createTime,
                                rules: [{
                                    required: true,
                                    message: '消费时间不能为空',
                                }],
                            })(
                                <Input disabled placeholder="请输入消费时间"/>
                            )}
                        </FormItem>
                    </Col>
                )
            })
        }

        return (
            <Modal
                visible={visible}
                title="使用"
                width={1000}
                onCancel={onCancel}
                // onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
                footer={[
                    <Button style={{width: "150px", height: "50px"}} key="back" onClick={onCancel}>取消</Button>,
                    <Button style={{width: "150px", height: "50px", marginRight: "20px", verticalAlign: "middle"}} key="submit" type="primary" onClick={onCreate}>使用<div>(剩余{data.remainConsumeTimes}次)</div></Button>,
                  ]}
            >
                {
                    JSON.stringify(data) === "{}" ?
                        <div className="spin-box">
                            <Spin/>
                        </div>
                        :
                        <div className="institution-edit institution-form item-form">
                            <Form layout="vertical">
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="companyName" label="订单编号：">
                                            {getFieldDecorator('orderNum', {
                                                initialValue: data.orderNum,
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '订单编号不能为空',
                                                    },
                                                ]
                                            })(
                                                <Input disabled placeholder="请输入订单编号"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="licenseNumber" label="支付单号：">
                                            {getFieldDecorator('payNum', {
                                                initialValue: data.payNum || 2,
                                                rules: [{
                                                    required: true,
                                                    message: '订单单号不能为空',
                                                }],
                                            })(
                                                <Input disabled placeholder="请输入支付单号"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="licenseNumber" label="订单总金额：">
                                            {getFieldDecorator('orderAmount', {
                                                initialValue: data.orderAmount,
                                                rules: [{
                                                    required: true,
                                                    message: '订单总金额不能为空',
                                                }],
                                            })(
                                                <Input disabled placeholder="请输入订单总金额"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="consumeCode" label="券号：">
                                            {getFieldDecorator('consumeCode', {
                                                initialValue: dataToSign.consumeCode || "",
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '券号不能为空',
                                                    }
                                                ]
                                            })(
                                                <Input disabled={dataToSign.consumeCode ? true : false} placeholder="请输入券号"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    {tempConsumeTimeList}
                                </Row>
                                <div className="ant-line"></div>          
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

//订单信息使用组件
class ItemUse extends Component {
    constructor(props) {
      super(props);
    
      this.state = {
            visible: false,
            // 订单基本信息
            data: {},
            // 提交按钮状态变量
            confirmLoading: false,
            // 消费签到
            dataToSign: {},
            consumeTime: "", 
        };
    } 

    onChange = (value) => {
        console.log('onChange ', value);
        this.setState({ 
            tempTypeIds: value
        });
    };

    // 获取订单消费签到信息
    getData = () => {
        reqwest({
            url: '/sys/order/toSign',
            type: 'json',
            method: 'get',
            data: {
                orderDetailsId: this.props.orderDetailsId,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                
            },
            success: (json) => {
                if (json.result === 0) {        
                    this.setState({
                        dataToSign: json.data,
                        consumeTime: json.data.consumeTime                     
                    }, () => {
                        console.log(this.state.dataToSign);
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
        })
    };

    showModal = () => {
        // 获取订单基本信息
        console.log(this.props.record)
        this.getData();
        this.setState({
            visible: true,
            data: this.props.record,
        })
    };

    // 信息比对函数
    dataContrast = (values) => {
        const initValues = this.state.data;
        const itemList = ["orderNum:", "payNum", "orderAmount", "couponNum", "consumTime"];
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
            result.id = this.props.id;
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
                    confirmLoading: false
                });
                form.resetFields();
            });
        };
        // data空值处理
        // if (JSON.stringify(this.state.data) === "{}") {
        //     cancel();
        //     return;
        // }

        confirm({
            title: '确认放弃使用？',
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
        // data空值处理
        if (JSON.stringify(this.state.data) === "{}") {
            return;
        }
        const form = this.form;
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            // 信息比对
            // const result = this.dataContrast(values);
            const result = {
                orderDetailsId: this.props.orderDetailsId,
                consumeCode: values.consumeCode,
                consumeTime: values.consumeTime,
                // orderNum: values.orderNum,
                // payNum: values.payNum,
                // orderAmount: values.orderAmount,
                // couponNum: values.couponNum,
                // consumTime: values.consumTime,
            }
            if (!result) {
                message.error("暂无信息更改");
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/sys/order/sign',
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
                        message.success("订单使用成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                data: {},                                
                                confirmLoading: false
                            });
                        });
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
                        } else if (json.code === "1127") {
                            message.error("已修改信息正在审核中，暂不能修改");
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
            });
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>使用</span>
                <ItemUseForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    onChange={this.onChange}
                    id={this.props.id}
                    data={this.state.data}
                    dataToSign={this.state.dataToSign}
                    consumeTime={this.state.consumeTime}
                    allTypeList={this.state.allTypeList}
                    handleSearch={this.handleSearch}
                    handleChange={this.handleChange}
                    typeList={this.state.typeList}
                    confirmLoading={this.state.confirmLoading}
                />
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
            data: [],
            // 订单类型表
            typeList: [],
            // 当前订单类型
            type: null,
            // 当前订单状态
            status: null,
            addStatus: false,
            pagination: {
                current: 1,
                pageSize: 15,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            }
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: 70,
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '订单编号',
                dataIndex: 'orderNum',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'orderNum'),
            },
            {
                title: '课程名称',
                dataIndex: 'courseName',
                className: 'operating',
                width: '18%',
                render: (text, record) => this.renderColumns(text, record, 'courseName'),
            },
            {
                title: '下单时间',
                dataIndex: 'createTime',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },            
            {
                title: '实际付款',
                dataIndex: 'orderAmount',
                width: '7%',
                render: (text, record) => this.renderColumns(text, record, 'orderAmount'),
            },                     
            {
                title: '所属机构',
                dataIndex: 'orgName',
                className: 'operating',
                width: '16%',
                render: (text, record) => this.renderColumns(text, record, 'orgName'),
            },            
            {
                title: '已消费课时/总课时',
                dataIndex: 'consumeLesson',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'consumeLesson'),
            },           
            {
                title: '订单状态',
                dataIndex: 'orderStatus',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'orderStatus'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                width: 200,
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*订单使用*/}
                            <ItemUse 
                                id={record.id}
                                record={record}
                                orderDetailsId={record.orderDetailsId}
                                recapture={this.getData}
                                toLoginPage={this.props.toLoginPage} 
                                // 设置权限为真且是已付款状态
                                opStatus={this.props.opObj.use && record.payState === 3}/>
                            {/*订单查看*/}
                            <Link 
                                to={"./order-detail?" + JSON.stringify(record)}
                                sytle={{display: this.props.opObj.select ? "inline" : "none"}}
                                keyword={this.props.keyword}
                                pagination={this.state.pagination}
                                >查看</Link>
                            <Link 
                                to={"./snapshot?" + record.orderDetailsId}
                                sytle={{display: this.props.opObj.selectSnapshot ? "inline" : "none"}}
                                keyword={this.props.keyword}
                                pagination={this.state.pagination}
                                >交易快照</Link>
                            {/*<ItemView id={record.id}
                                      record={record} 
                                      educationKey={record.educationKey}
                                      recapture={this.getData}
                                      toLoginPage={this.props.toLoginPage} 
                                      opStatus={this.props.opObj.modify}/>*/}
                        </div>
                    )
                }
            }
        ];        
    }

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    };

    setAdd = (type, para) => {
        if (type === "status") {
            this.setState({
                addStatus: para
            })
        }
        if (type === "flag") {
            this.setState({
                addFlag: !this.state.addFlag
            })
        }
    };

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

    //获取本页信息
    getData = (keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/order/list',
            type: 'json',
            method: 'get',
            data: {
                // 订单描述
                snOrName: keyword ? keyword.educationName : this.props.keyword.educationName,
                beginDate: keyword ? keyword.startTime : this.props.keyword.startTime,
                endDate: keyword ? keyword.endTime : this.props.keyword.endTime,
                userId: this.state.userId,
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                });
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
                        let tempPayState = '';
                        let tempRefundReason = '';
                        let tempConsumeState = '';
                        let tempPayWay = '';
                        if (item.payWay === 0) {
                            tempPayWay = '微信支付'
                        } 
                        if (item.payWay === 1) {
                            tempPayWay = '支付宝'
                        }
                        if (item.payState === 1) {
                            tempPayState = '待付款';
                        }
                        if (item.payState === 3) {
                            tempPayState = '已付款';
                        }
                        if (item.payState === 6) {
                            tempPayState = '已退款';
                        }
                        if (item.payState === 7) {
                            tempPayState = '已关闭';
                        }
                        if (item.payState === 8) {
                            tempPayState = '退款中'
                        }
                        if (item.payState === 9) {
                            tempPayState = '退款失败'
                        }
                        if (item.consumeState === 1) {
                            tempConsumeState = '待消费';
                        }
                        if ( item.consumeState === 2) {
                            tempConsumeState= '已消费';
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            orderDetailsId: item.orderDetailsId,
                            orderNum: item.orderSn,
                            courseName: item.courseName,
                            createTime: item.orderTime,
                            totalPrice: "￥" + item.totalPrice.toFixed(2),
                            orderAmount: "￥" + item.orderAmount.toFixed(2),
                            fundFee:  "￥" + (item.totalPrice - item.orderAmount).toFixed(2),
                            orgName: item.orgName,
                            orgId: item.orgId,
                            payNum: item.tradeNo,
                            payTime: item.payTime,
                            userAccount: item.phone,
                            consumeLesson: item.consumeLessonNum + '/' + item.lessonNum,
                            remainConsumeTimes: (item.lessonNum - item.consumeLessonNum),
                            consumeLessonNum: item.consumeLessonNum,
                            lessonNum: item.lessonNum,
                            consumeTime: item.consumeTime,
                            consumeState: tempConsumeState,
                            consumeStateCode: item.consumeState,
                            payWay: tempPayWay,
                            payState: item.payState,
                            orderStatus: tempPayState,
                            refundReason: tempRefundReason,
                        });
                    });
                    this.setState({
                        loading: false,
                        data: data,
                        pagination: {
                            total: json.data.total,
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

    //表格参数变化处理
    handleTableChange = (pagination, filters) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.institutionPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.institutionPageSize);
        this.setState({
            type: filters.type ? filters.type[0] : null,
            status: filters.status ? filters.status[0] : null,
            pagination: pager,
        }, () => {
            this.getData();
        });
    };

    // 设置排序
    handleSort = (row) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/admin/org/updateSort',
            type: 'json',
            method: 'post',
            data: {
                // 订单Id
                id: row.id,
                // 排序
                sort: Number(row.sort),
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
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                    });
                    this.getData(); //刷新数据
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
    }

    componentWillMount() {
        this.getData();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.keyword === this.props.keyword && nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData(nextProps.keyword);
    }

    render() {
        return <Table 
                    bordered
                    loading={this.state.loading}
                    expandedRowRender={(record) => {
                        return (
                            <div>
                                <p style={{ margin: 0, textAlign: "left" }}>订单总金额：{record.totalPrice}</p>
                                <p style={{ margin: 0, textAlign: "left" }}>手续费：{record.fundFee}</p>
                                <p style={{ margin: 0, textAlign: "left" }}>支付单号：{record.payNum}</p>
                                <p style={{ margin: 0, textAlign: "left" }}>支付时间：{record.payTime}</p>
                                <p style={{ margin: 0, textAlign: "left" }}>用户账号：{record.userAccount}</p>
                                <p style={{ margin: 0, textAlign: "left" }}>支付方式：{record.payWay}</p>
                            </div>                            
                        )
                    }}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    columns={this.columns}
                    scroll={{ x: 1500 }}
                    onChange={this.handleTableChange}/>;
    }
}

class Order extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            // 获取订单列表所需关键词
            keyword: {
                educationName: "",
                // 初始化开始日期和结束日期
                startTime: null,
                endTime: null,
            },
            flag_add: false,
            // 日期禁选控制
            startValue: null,
            endValue: null,
            // 统计数据
            totalNum: 0,
            consumeNum: 0,
            closeNum: 0,
            refundNum: 0,
            unConsumeNum: 0,
            unPaidNum: 0,
        };
        this.orderStatusList = [];   
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

    // 名称关键词设置
    setName = (value) => {
        if (value !== this.state.keyword.educationName) {
            this.setState({
                keyword: {
                    educationName: value,
                    startTime: this.state.keyword.startTime,
                    endTime: this.state.keyword.endTime,
                }
            })
        }
    };
    
    // 开始日期设置
    setStartTime = (date, dateString) => {
        this.setState({
            startValue: date,
            keyword: {
                educationName: this.state.keyword.educationName,
                startTime: dateString,
                endTime: this.state.keyword.endTime,
            }
        })
    };    

    // 结束日期设置
    setEndTime = (date, dateString) => {
        this.setState({
            endValue: date,
            keyword: {
                educationName: this.state.keyword.educationName,
                startTime: this.state.keyword.startTime,
                endTime: dateString,
            }
        })
    };

    // 禁用开始日期之前的日期
    disabledStartDate = (startValue) => {
        const endValue = this.state.endValue;
        if (!startValue || !endValue) {
            return false;
        }
        return (startValue.valueOf() + 60*60*24*1000) > endValue.valueOf();
    };

    // 禁用结束日期之后的日期
    disabledEndDate = (endValue) => {
        const startValue = this.state.startValue;
        if (!endValue || !startValue) {
          return false;
        }
        return endValue.valueOf() <= (startValue.valueOf() + 60*60*24*1000);
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
    getData = (keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/order/statistics',
            type: 'json',
            method: 'get',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                });
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        totalNum: json.data.totalNum,
                        consumeNum: json.data.consumeNum,
                        closeNum: json.data.closeNum,
                        refundNum: json.data.refundNum,
                        unConsumeNum: json.data.unConsumeNum,
                        unPaidNum: json.data.unPaidNum,
                    });
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
        this.setPower();
        this.getData();
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
            <div className="institutions finace-order">
                {
                    this.state.opObj.select ?
                        <div>
                            {/*<header>
                                <Row gutter={12}>                                    
                                    <Steps current={0} labelPlacement="vertical">
                                        {allOrderStatus02}
                                    </Steps>                                  
                                </Row>
                            </header>*/}
                            <header className="clearfix order">
                                <Row gutter={12}>
                                   {/* {allOrderStatus}*/}
                                    <Col span={4}>
                                        <div style={{background: "#FFF", padding: "20px 0"}}>
                                            <div><span className="disc blueDisc"></span>全部订单</div>
                                            <div style={{fontSize: "32px"}}>{this.state.totalNum || 0}</div>
                                        </div>                                        
                                    </Col>
                                    <Col span={4}>
                                        <div style={{background: "#FFF", padding: "20px 0"}}>
                                            <div><span className="disc yellowDisc"></span>待付款</div>
                                            <div style={{fontSize: "32px"}}>{this.state.unPaidNum || 0}</div>
                                        </div>                                        
                                    </Col>
                                    <Col span={4}>
                                        <div style={{background: "#FFF", padding: "20px 0"}}>
                                            <div><span className="disc brownDisc"></span>待消费</div>
                                            <div style={{fontSize: "32px"}}>{this.state.unConsumeNum || 0}</div>
                                        </div>                                        
                                    </Col>
                                    <Col span={4}>
                                        <div style={{background: "#FFF", padding: "20px 0"}}>
                                            <div><span className="disc purpleDisc"></span>已使用</div>
                                            <div style={{fontSize: "32px"}}>{this.state.consumeNum || 0}</div>
                                        </div>                                        
                                    </Col>
                                    <Col span={4}>
                                        <div style={{background: "#FFF", padding: "20px 0"}}>
                                            <div><span className="disc greenDisc"></span>已退款</div>
                                            <div style={{fontSize: "32px"}}>{this.state.refundNum || 0}</div>
                                        </div>                                        
                                    </Col>
                                    <Col span={4}>
                                        <div style={{background: "#FFF", padding: "20px 0"}}>
                                            <div><span className="disc redDisc"></span>已取消</div>
                                            <div style={{fontSize: "32px"}}>{this.state.closeNum || 0}</div>
                                        </div>                                        
                                    </Col>                             
                                </Row>
                            </header>
                            <header className="clearfix" style={{ height: "50px", lineHeight: "50px", background: "#FFF", padding: "0 24px"}}>                                
                                {/*订单名称筛选*/}
                                <Search
                                    placeholder="请输入订单编号或机构名称"
                                    onSearch={this.setName}
                                    enterButton
                                    style={{width: "240px", float: "left", marginRight: "20px", marginTop: "10px"}}
                                />
                                {/*订单创建日期筛选*/}
                                <span>日期筛选： </span>
                                <DatePicker placeholder="请选择开始日期"
                                            style={{width: "150px"}}
                                            disabledDate={this.disabledStartDate}
                                            onChange={this.setStartTime}
                                            />
                                <span style={{margin: "0 10px"}}>至</span>
                                <DatePicker placeholder="请选择结束日期"
                                            style={{width: "150px"}}
                                            disabledDate={this.disabledEndDate}
                                            onChange={this.setEndTime}
                                            />
                            </header>
                            {/*订单列表*/}
                            <div className="table-box order-list" style={{background: "#FFF", padding: "24px 24px 0"}}>
                                <div className="order-operation-tip"> 
                                    <h2>操作提示</h2>
                                    <ul>
                                        <li style={{listStyle: "disc"}}>如果用户确认消费，可以点击使用操作，并填写相关信息后即更改订单状态。</li>
                                    </ul>
                                </div>
                                <DataTable 
                                        ref="getDataCopy"
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

export default Order;