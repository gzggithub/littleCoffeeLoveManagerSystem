import React, {Component} from 'react';
import {
    Link,
} from 'react-router-dom';
import {
    Table,
    Input,
    Button,
    Form,
    message,
    Icon,
    Tabs,
    Radio,
    DatePicker,
} from 'antd';
import '../../config/config';
import reqwest from 'reqwest';
import moment from 'moment';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;


// 栅格设置
const formItemLayout_8 = {
    labelCol: {span: 4},
    wrapperCol: {span: 8}
};

// 单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

// 编辑资料表单
const ItemEditForm = Form.create()(
    (props) => {
        const {onCancel, onCreate, form, data} = props;
        const {getFieldDecorator} = form;

        return (
            <div className="category-add category-form user-detail-form">
                <Form layout="vertical" style={{width: "50%",margin: "0 auto"}}>
                    <FormItem className="name" {...formItemLayout_8} label="手机号码：">
                        {getFieldDecorator('phone', {
                            initialValue: data.phone,
                            rules: [{
                                required: true,
                                message: '手机号不能为空',
                            },{
                                len: 11,
                                max: 11,
                                message: '请输入正确手机号',
                            }
                            ],
                        })(
                            <Input placeholder="请输入正确手机号"/>
                        )}
                    </FormItem>
                    <FormItem className="gender" {...formItemLayout_8} label="性别：">
                        {getFieldDecorator('gender', {
                            initialValue: data.gender || 1,
                            rules: [{
                                required: false,
                                message: '请选择性别',
                            }],
                        })(
                            <RadioGroup style={{marginTop: "5px"}} onChange={(e) => {}}>
                                <Radio value={0}>女</Radio>
                                <Radio value={1}>男</Radio>                                
                            </RadioGroup>
                        )}
                    </FormItem>

                    <FormItem className="birthday" {...formItemLayout_8} label="生日：">
                        {getFieldDecorator('birthday', {
                            initialValue: moment(data.birthday || new Date(), "YYYY-MM-DD"),
                            rules: [{
                                required: false,
                                message: '生日不能为空',
                            }],
                        })(
                            <DatePicker placeholder="请选择日期" style={{width: "150px"}} />
                        )}
                    </FormItem>
                    {/*<FormItem className="name" {...formItemLayout_8} label="期待发展方面：">
                        {getFieldDecorator('expectation', {
                            initialValue: data.expectation,
                            rules: [{
                                required: false,
                                message: '期待发展不能为空',
                            }],
                        })(
                            <Select
                                  mode="multiple"
                                  placeholder="请选择（可多选）"
                                  // onChange={handleChange}
                                  style={{ width: '100%' }}
                            >
                                <Option key={1} value={1}>技术</Option>
                                <Option key={2} value={2}>技术</Option>
                                <Option key={3} value={3}>技术3</Option>
                            </Select>
                        )}
                    </FormItem>*/}
                    <FormItem className="nickname" {...formItemLayout_8} label="昵称：">
                        {getFieldDecorator('nickname', {
                            initialValue: data.nickname,
                            rules: [{
                                required: false,
                                message: '昵称不能为空',
                            }],
                        })(
                            <Input placeholder="请输入昵称"/>
                        )}
                    </FormItem>
                    <FormItem className="password" {...formItemLayout_8} label="账号密码：">
                        {getFieldDecorator('password', {
                            // initialValue: data.password,
                            rules: [{
                                required: false,
                                message: '密码不能为空',
                            }],
                        })(
                            <Input placeholder="请输入账号密码"/>
                        )}
                    </FormItem>
                </Form>
                <div className="form-footer">
                    <Button type="primary" onClick={onCreate}>提交</Button>
                    <Button type="primary" onClick={onCancel}>重置</Button>
                </div>
            </div>
        );
    }
);

// 编辑资料组件
class ItemEdit extends Component {
    state = {
        data: {},
        confirmLoading: false,
    };

    // 时间日期处理
    dateHandle02 = (para) => {
        const add0 = (m) => {
            return m < 10 ? '0' + m : m;
        }
        // 时间戳是整数，否则要parseInt转换
        const time = new Date(para),
            y = time.getFullYear(),
            m = time.getMonth()+1,
            d = time.getDate(),
            h = time.getHours(),
            mm = time.getMinutes(),
            s = time.getSeconds();
        return y + '-' + add0(m) + '-' + add0(d) + ' '+ add0(h) + ':' + add0(mm) + ':' + add0(s);
    };
    
    // 获取用户基本信息
    getData = () => {
        reqwest({
            url: '/sys/appUser/details',
            type: 'json',
            method: 'get',
            data: {
                id: Number(this.props.userId) || sessionStorage.userId,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error('获取失败');
                this.setState({
                    loading: false
                });
            },
            success: (json) => {
                if (json.result === 0) {
                    json.data.createTime = this.dateHandle02(json.data.createTime);
                    this.setState({
                        data: json.data,
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

    // 信息比对函数
    dataContrast = (values) => {
        const initValues = this.state.data;
        const itemList = ["name", "photo"];
        const result = {};

        itemList.forEach((item) => {
            if (values[item] !== initValues[item]) {
                result[item] = values[item];
            }
        });
        if (JSON.stringify(result) === "{}") {
            return false;
        } else {
            result.id = this.props.id;
            result.parentId = 0;
            result.sort = 0;
            return result;
        }
    };
    
    // 重置
    handleCancel = () => {
        const form = this.form;
        this.setState({
            data: {}
        }, () => {
            form.resetFields();
        });        
    };
    // 编辑用户资料
    handleCreate = () => {
        if (JSON.stringify(this.state.data) === "{}") {
            return;
        }
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            // const result = this.dataContrast(values);
            const result = {
                id: this.props.userId,
                phone: values.phone,
                gender: values.gender,
                nickname: values.nickname,
                // birthday: values.birthday.format('YYYY-MM-DD'),
                birthday: parseInt(((Date.parse(new Date(values.birthday))) / 1000), 10),
                password: values.password,
            }
            if (!result) {
                message.error("暂无信息更改，无法提交");
                return;
            }
            reqwest({
                url: '/sys/appUser/modify',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: result,
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("编辑资料成功");
                        this.setState({
                            data: {}
                        }, () => {
                            form.resetFields();
                            this.props.recapture("1");
                        });
                    } else {
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
            })
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    componentWillMount() {
        console.log(this.props.userId)
        this.getData();
    }

    render() {
        return (
            <a>   
                <ItemEditForm
                    ref={this.saveFormRef}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    data={this.state.data}
                />
            </a>
        );
    }
}

//基本信息
class DataTableBasic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
        };
    }

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

   // 时间日期处理
    dateHandle02 = (para) => {
        const add0 = (m) => {
            return m < 10 ? '0' + m : m;
        }
        //时间戳是整数，否则要parseInt转换
        const time = new Date(para),
            y = time.getFullYear(),
            m = time.getMonth()+1,
            d = time.getDate();
            // h = time.getHours(),
            // mm = time.getMinutes(),
            // s = time.getSeconds();
        return y + '-' + add0(m) + '-' + add0(d);
    };

    getData = () => {
        reqwest({
            url: '/sys/appUser/details',
            type: 'json',
            method: 'get',
            data: {
                id: Number(this.props.userId) || sessionStorage.userId,
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
                    json.data.birthday = json.data.birthday ? this.dateHandle02(json.data.birthday) : '';
                    // json.data.loginTime = this.dateHandle02(json.data.loginTime);
                    if (json.data.gender === 0) {
                        json.data.gender = "女"
                    }
                    if (json.data.gender === 1) {
                        json.data.gender = "男"
                    }
                   
                    const expectation = json.data.expectation.split(",")
                    // let tempExpectation = "";
                    // expectation.forEach((item) => {
                    //     if (item === 1 ) {
                    //         tempExpectation = "学业"
                    //     }
                    //     if (item === 2) {
                    //         tempExpectation = "兴趣爱好"
                    //     }
                    //     if (item === 4) {
                    //         tempExpectation = "智力开发"
                    //     }
                    // })
                    json.data.expectation = expectation;
                    json.data.key = json.data.id;
                    // json.data
                    this.setState({
                        data: json.data,
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
        // console.log(this.props.data);
        // this.setState({
        //     data: this.props.data,
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
                <div className="user-detail-table-basic">
                    <div className="user-detail-table-basic-td">
                    <div className="advator">
                        <div className="advator-center">
                            <img src={this.state.data.photo} alt=""/>
                            <div >昵称 {this.state.data.nickname}</div>
                        </div>
                    </div>
                        
                    </div>
                    <div className="user-detail-table-basic-td">
                        <div className="user-detail-table-basic-item">
                            <div>孩子个数</div>
                            <div>{this.state.data.childrenNum || "0"}</div>
                        </div>
                        <div className="user-detail-table-basic-item">
                            <div>手机号码</div>
                            <div>{this.state.data.phone}</div>
                        </div>
                        <div className="user-detail-table-basic-item">
                            <div>性别</div>
                            <div>{this.state.data.gender}</div>
                        </div>
                        <div className="user-detail-table-basic-item">
                            <div>生日</div>
                            <div>{this.state.data.birthday}</div>
                        </div>
                        <div className="user-detail-table-basic-item">
                            <div>所在位置</div>
                            <div>{this.state.data.address}</div>
                        </div>
                    </div>
                    <div className="user-detail-table-basic-td">
                        {/*<div className="user-detail-table-basic-item">
                            <div>期望发展方向</div>
                            <div>{this.state.data.expectation}</div>
                        </div>*/}
                        <div className="user-detail-table-basic-item">
                            <div>注册时间</div>
                            <div>{this.state.data.createTime}</div>
                        </div>
                        <div className="user-detail-table-basic-item">
                            <div>最后一次登录时间</div>
                            <div>{this.state.data.loginTime}</div>
                        </div>
                        <div className="user-detail-table-basic-item">
                            <div></div>
                            <div></div>
                        </div>
                        <div className="user-detail-table-basic-item">
                            <div></div>
                            <div></div>
                        </div>
                        <div className="user-detail-table-basic-item">
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                </div>
            </div>
        )        
    }
}

//孩子信息
class DataTableChildren extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
        };
        this.columns = [
            {
                title: '昵称',
                dataIndex: 'name',
                width: "25%",
                render: (text, record) => this.renderColumns(text, record, 'name')
            },
            {
                title: '头像',
                dataIndex: 'photo',
                width: '25%',
                render: (text, record) => (<img style={{width: '45px', height: "25px"}} alt="" src={record["photo"]}/>)
            },
            {
                title: '性别',
                dataIndex: 'gender',
                width: '25%',
                render: (text, record) => this.renderColumns(text, record, 'gender')
            },
            {
                title: '生日',
                dataIndex: 'birthday',
                width: '25%',
                render: (text, record) => this.renderColumns(text, record, 'birthday')
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
        //时间戳是整数，否则要parseInt转换
        const time = new Date(para),
            y = time.getFullYear(),
            m = time.getMonth()+1,
            d = time.getDate();
        return y + '-' + add0(m) + '-' + add0(d);
    };

    getData = () => {
        reqwest({
            url: '/sys/appUser/details',
            type: 'json',
            method: 'get',
            data: {
                id: Number(this.props.userId) || sessionStorage.userId,
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
                    if (json.data.childrenArchivesList) {
                        json.data.childrenArchivesList.forEach((item, index) => {
                            // 0:女 ; 1:男
                            if (item.gender === 0) {
                                item.gender = "女"
                            }
                            if (item.gender === 1) {
                                item.gender = "男"
                            }
                            // 0:可删除 ; 1:不可删除
                            if (item.flag === 0) {
                                item.flag = "可删除"
                            }
                            if (item.flag === 1) {
                                item.flag = "不可删除"
                            }
                            // 0:未删除 ; 1:已删除
                            if (item.isDelete === 0) {
                                item.isDelete = "未删除"
                            }
                            if (item.isDelete === 1) {
                                item.isDelete = "已删除"
                            }
                        })
                    }
                    this.setState({
                        // data: json.data,
                        data: json.data.childrenArchivesList
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
                <h3 className="add-form-title-h4">孩子信息</h3>
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

//统计信息
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
                title: '已消费金额',
                dataIndex: 'consumerAmount',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'consumerAmount')
            },
            {
                title: '订单数量',
                dataIndex: 'orderNum',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'orderNum')
            },
            {
                title: '机构课程数量',
                dataIndex: 'orgCourseNum',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'orgCourseNum')
            },
            {
                title: '待付款订单量',
                dataIndex: 'unPaidOrderNum',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'unPaidOrderNum')
            },
            {
                title: '已付款订单量',
                dataIndex: 'paidOrderNum',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'paidOrderNum')
            },
             {
                title: '已消费订单量',
                dataIndex: 'consumedOrderNum',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'consumedOrderNum')
            },
            {
                title: '已关闭订单量',
                dataIndex: 'closedOrderNum',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'closedOrderNum')
            },
            {
                title: '退款记录',
                dataIndex: 'refundRecord',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'refundRecord')
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
                dataIndex: 'doubtsNum',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'doubtsNum')
            },
             {
                title: '我的回答',
                dataIndex: 'answerNum',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'answerNum')
            },
            {
                title: '意见反馈',
                dataIndex: 'questionNum',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'questionNum')
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
        //时间戳是整数，否则要parseInt转换
        const time = new Date(para),
            y = time.getFullYear(),
            m = time.getMonth()+1,
            d = time.getDate();
        return y + '-' + add0(m) + '-' + add0(d);
    };

    getData = () => {
        reqwest({
            url: '/sys/appUser/details',
            type: 'json',
            method: 'get',
            data: {
                id: Number(this.props.userId) || sessionStorage.userId,
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
                            consumerAmount: json.data.totalPrice,                
                            orderNum: json.data.orderNum,
                            orgCourseNum: json.data.orgCourseNum,                            
                            unPaidOrderNum: json.data.unPaidOrderNum,
                            paidOrderNum: json.data.paidOrderNum,
                            consumedOrderNum: json.data.consumedOrderNum,
                            closedOrderNum: json.data.closedOrderNum,
                            refundRecord: json.data.refundOrderNum,
                        })
                    const data02 = [];
                    data02.push(
                        {
                            id: json.data.id,
                            collectionOrg: json.data.orgCollectionNum,
                            collectionCourse: json.data.courseCollectionNum,
                            collectionTeacher: json.data.teacherCollectionNum,
                            commentNum: json.data.commentNum,
                            doubtsNum: json.data.doubtsNum,                            
                            answerNum: json.data.answerNum,
                            questionNum: json.data.questionNum,
                            loginNum: json.data.loginNum,
                        })
                    this.setState({
                        data: data,
                        data02: data02,
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
                <h3 className="add-form-title-h4">统计信息</h3>
                <Table bordered
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={false}
                      columns={this.columns}
                      />
                <Table bordered
                      loading={this.state.loading}
                      dataSource={this.state.data02}
                      pagination={false}
                      columns={this.columns02}
                      />
            </div>
        )
        
    }
}

//订单记录
class DataTableOrder extends Component {
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
            pagination: {
                current: 1,
                pageSize: Number(localStorage.institutionPageSize) || 10,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            }
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: "5%",
            },
            {
               title: '订单编号',
                dataIndex: 'orderNum',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'orderNum') 
            },
            {
                title: '课程名称',
                dataIndex: 'courseName',
                width: '16%',
                render: (text, record) => this.renderColumns(text, record, 'courseName')
            },
            {
                title: '提交时间',
                dataIndex: 'submitTime',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'submitTime')
            },
            {
                title: '用户账号',
                dataIndex: 'userAccount',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'userAccount')
            },
            {
                title: '订单金额',
                dataIndex: 'orderAmount',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'orderAmount')
            },
            {
                title: '支付方式',
                dataIndex: 'payMethod',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'payMethod')
            },
            // {
            //     title: '订单类型',
            //     dataIndex: 'orderType',
            //     width: '16%',
            //     render: (text, record) => this.renderColumns(text, record, 'orderType')
            // },
            {
                title: '订单状态',
                dataIndex: 'orderStatus',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'orderStatus')
            },
            {
                title: '操作',
                dataIndex: '操作',
                // className: 'operating',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*查看订单*/}
                            <Link to={"./order-detail?" + record.id}>查看订单</Link>
                            {/*交易快照*/}
                            {/*<Link 
                                to={"./snapshot?" + record.orderDetailsId}
                                // sytle={{display: this.props.opObj.selectSnapshot ? "inline" : "none"}}
                                keyword={this.props.keyword}
                                pagination={this.state.pagination}
                                >交易快照</Link>*/}
                            {/*<ItemEdit id={record.id} parentId={record.parentId} recapture={this.getData}
                                      // opStatus={this.props.opObj.modify && record.parentId === 0}
                                      toLoginPage={this.props.toLoginPage}/>*/}
                        </div>
                    );
                },
            }
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
        //时间戳是整数，否则要parseInt转换
        const time = new Date(para),
            y = time.getFullYear(),
            m = time.getMonth()+1,
            d = time.getDate(),
            h = time.getHours(),
            mm = time.getMinutes(),
            s = time.getSeconds();
        return y + '-' + add0(m) + '-' + add0(d) + ' '+ add0(h) + ':' + add0(mm) + ':' + add0(s);
    };

    // 列表信息处理函数
    dataHandle = (data) => {
        let result = [];
        data.list.forEach((item, index) => {
            // 支付状态
            let tempPayState = '';
            // let tempCurrentOrderState = 0;
            // 支付方式
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
            
            // 退款原因
            let tempRefundReason = '';
            if (item.payState === 6) {
                tempPayState = '已退款';
                tempRefundReason = item.refundReason;
            }
            if (item.payState === 7) {
                tempPayState = '已关闭';
            }
            if (item.payState === 8) {
                tempPayState = '退款中'
            }          
            if (item.payState === 9) {
                tempPayState = '退款失败';
                tempRefundReason = item.refundReason;
            }
            // 消费状态
            let tempConsumeState = '';
            if (item.consumeState === 1) {
                tempConsumeState = '待消费';
            }
            if ( item.consumeState === 2) {
                tempConsumeState= '已消费';
            }
            const temp = {
                index: index + 1,
                id: item.id,
                orderDetailsId: item.orderDetailsId,
                orderNum: item.orderSn,
                courseName: item.courseName,
                submitTime: item.orderTime,
                userAccount: item.phone,
                orderAmount: '￥' + item.orderAmount.toFixed(2),
                payMethod: tempPayWay,
                // 订单类型暂时没有，暂时显示机构名称
                orderType: item.orgName,
                orderStatus: tempPayState,
                consumeStateCode: item.consumeState,
                consumeState: tempConsumeState,
                refundReason: tempRefundReason,
            };
            result.push(temp)
        });
        return result;
    };

    //获取本页信息
    getData = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/appUser/OrderList',
            type: 'json',
            method: 'get',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                userId: this.props.userId,
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize,
                // userId: 43,

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
                //             id: 1,
                //             name: "",
                //             photo: "",
                //             parentId: 0,
                //             sort: 1,
                //             list: [
                //                 {id: 11, name: "", parentId: 1, sort: 5},
                //             ]
                //         },
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        data: this.dataHandle(json.data),
                        pagination: {
                            total: json.data.total,
                            current: this.state.pagination.current,
                            pageSize: this.state.pagination.pageSize
                        }
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

    componentWillMount() {
        this.getData();
        console.log(this.props.userId);
        console.log(this.props.data);
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
                <h3 className="add-form-title-h4">订单记录</h3>
                <Table bordered
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={this.state.pagination}
                      columns={this.columns}
                      onChange={this.handleTableChange}/>
            </div>
        )
        
    }
}

//用户详情
class ItemDetail extends Component {
    state = {
        data: {}
    };
    
    // 时间日期处理
    dateHandle02 = (para) => {
        const add0 = (m) => {
            return m < 10 ? '0' + m : m;
        }
        // 时间戳是整数，否则要parseInt转换
        const time = new Date(para),
            y = time.getFullYear(),
            m = time.getMonth()+1,
            d = time.getDate();
        return y + '-' + add0(m) + '-' + add0(d);
    };

    getData = () => {
        reqwest({
            url: '/sys/appUser/details',
            type: 'json',
            method: 'get',
            data: {
                id: Number(this.props.userId),
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error('获取失败');
            },
            success: (json) => {
                if (json.result === 0) {
                    json.data.createTime = this.dateHandle02(json.data.createTime);
                    this.setState({
                        data: json.data,
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
        console.log(this.props.userId)
        // console.log(this.props.data)
        this.getData();
        // this.setState({
        //     data: this.props.data,
        // })
        // console.log(this.state.data);
    }

    render() {
        return (
            <div>
                <div className="basic-table">
                    <DataTableBasic
                        userId={this.props.userId}
                        data={this.state.data}
                        toLoginPage={this.props.toLoginPage}
                    />
                </div>
                <div className="children-table">
                    <DataTableChildren                        
                        userId={this.props.userId}
                        data={this.state.data}
                        toLoginPage={this.props.toLoginPage}
                    />
                </div>
                <div className="statistics-table">
                    <DataTableStatistics
                        userId={this.props.userId}
                        data={this.state.data}
                        toLoginPage={this.props.toLoginPage}
                    />
                </div>
                <div className="order-record-table">
                    <DataTableOrder
                        userId={this.props.userId}
                        data={this.state.data}
                        toLoginPage={this.props.toLoginPage}
                    />
                </div>
            </div>
        );
    }
}

//登录日志
class ItemLoginLog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.institutionPageSize) || 15,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            }
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: "10%",
            },
            {
                title: '时间',
                dataIndex: 'loginTime',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'loginTime')
            },
            {
                title: '地区',
                dataIndex: 'area',
                render: (text, record) => this.renderColumns(text, record, 'area')
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

    dateHandle02 = (para) => {
        const add0 = (m) => {
            return m < 10 ? '0' + m : m;
        }
        //时间戳是整数，否则要parseInt转换
        const time = new Date(para),
            y = time.getFullYear(),
            m = time.getMonth()+1,
            d = time.getDate();
        return y + '-' + add0(m) + '-' + add0(d);
    };

    getData = () => {
        reqwest({
            url: '/sys/appUser/loginLog',
            type: 'json',
            method: 'get',
            data: {
                loginUserId: this.props.userId
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error('获取失败');
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    const data = [];
                    json.data.list.forEach((item, index) => {
                        data.push({
                            id: item.id,
                            index: index + 1,
                            loginTime: item.loginTime,
                            area: item.loginProvince + item.loginCity || "暂无",
                        })
                    })
                    this.setState({
                        data: data,
                        loading: false,
                        pagination: {
                            total: json.data.total,
                            current: this.state.pagination.current,
                            pageSize: this.state.pagination.pageSize
                        }
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
                    this.setState({
                        loading: false,
                    })
                }
            }
        });
    };

    componentWillMount() {
        this.getData();
    }

    render() {
        return (
            <Table 
                bordered
                // components={components}
                loading={this.state.loading}
                dataSource={this.state.data}
                pagination={this.state.pagination}
                columns={this.columns}
                onChange={this.handleTableChange}/>
        )
    }
}

class UserDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            flag_add: false,
            userId: "",
            data: {},
            activeKey: "1",
        }
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
                // if (subItem.url === this.props.location.pathname) {
                if (subItem.url === "/index/user-manage/users") {
                    let data = {};
                    subItem.children.forEach((thirdItem) => {
                        data[thirdItem.url] = true;
                    });
                    this.setState({
                        opObj: data
                    })
                }
            })
        });
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

    // 时间日期处理
    dateHandle02 = (para) => {
        const add0 = (m) => {
            return m < 10 ? '0' + m : m;
        }
        //时间戳是整数，否则要parseInt转换
        const time = new Date(para),
            y = time.getFullYear(),
            m = time.getMonth()+1,
            d = time.getDate();
        return y + '-' + add0(m) + '-' + add0(d);
    };

    getData = (id) => {
        reqwest({
            url: '/sys/appUser/details',
            type: 'json',
            method: 'get',
            data: {
                id: Number(id),
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {},
            success: (json) => {
                if (json.result === 0) {
                    json.data.createTime = this.dateHandle02(json.data.createTime);
                    this.setState({
                        data: json.data,
                        userId: this.props.location.search.substring(1),
                    }, () => {
                        console.log(this.state.data)
                    });
                }else{
                    if (json.code === 901) {
                        message.error("请先登录");
                        this.toLoginPage();
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");
                        this.toLoginPage();
                    } else {
                        message.error(json.message);
                    }
                }
            }
        });
    };

    componentWillMount() {
        this.setPower();
        // this.getData(this.props.location.search.substring(1));
        if (Number(this.props.location.search.substring(1)) && Number(this.props.location.search.substring(1)) !== 0) {
            sessionStorage.userId = Number(this.props.location.search.substring(1));
        }
        
        this.setState({
            userId: sessionStorage.userId,
        }, () =>{
            // this.getData();
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

    callback = (key) => {
        console.log(key);
        this.setState({
            activeKey: key
        })
    };

    // 返回按钮
    handleBack = () => {
        this.props.history.push('/index/user-manage/users');
        // this.props.history.go(-1);
        // this.props.history.goBack();
    };

    render() {
        console.log(this.state.opObj);
        return (
            <div className="category">
                {
                    // this.state.opObj.select ?
                        <div>
                            <header className="clearfix" style={{background: "#FFF", padding: "24px", position: "relative"}}>
                                <Tabs onChange={this.callback}  activeKey={this.state.activeKey} type="card">
                                    <TabPane tab="用户详情" key="1">
                                        <ItemDetail
                                            userId={this.state.userId}
                                            // data={this.state.data}
                                            toLoginPage={this.toLoginPage}
                                            />
                                    </TabPane>
                                    <TabPane tab="编辑资料" key="2">
                                        <ItemEdit
                                            userId={this.state.userId}
                                            recapture={this.callback}
                                            // data={this.state.data}
                                            toLoginPage={this.toLoginPage}
                                            />
                                    </TabPane>
                                    <TabPane tab="登录日志" key="3">
                                        <ItemLoginLog
                                            userId={this.state.userId}
                                            // data={this.state.data}
                                            toLoginPage={this.toLoginPage}
                                            />
                                    </TabPane>
                                </Tabs>
                                <div className="orderBack">
                                    <Button onClick={this.handleBack}><Icon type="left"/>返回</Button>
                                </div>
                            </header>                            
                        </div>
                        // :
                        // <p>暂无查询权限</p>
                }
            </div>
        )
    }
}

export default UserDetail;