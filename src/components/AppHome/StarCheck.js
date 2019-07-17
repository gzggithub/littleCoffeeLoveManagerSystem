import React, {Component} from 'react';
import {
    Tabs,
    Table,
    Input,
    Modal,
    Form,
    Row,
    Col,
    Radio,
    message,
    DatePicker,
    InputNumber,
} from 'antd';
import config from '../../config/config';
import reqwest from 'reqwest';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const {TextArea} = Input;

// 单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

// 明星审核表单
const ItemCheckForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, setFeeType, feeType, setFeeType01, feeType01, videoList, confirmLoading} = props;
        const {getFieldDecorator} = form;

        const tempVideoList = [];
        if (videoList.length) {
            videoList.forEach((item, index) => {
                tempVideoList.push(
                    <Col span={8} key={index+1}>
                        <div className="video">
                            <div className="chapter">第{item.sort}节</div>
                            <div className="videoSource">
                                {/*<div className="videoSize">{item.videoSize}M</div>*/}
                                <div className="videoSrc">
                                    <video controls="controls">
                                        <source src={item.video} type="video/mp4" />                                                
                                    </video>
                                </div>
                            </div>
                            <h3 className="videoCourseName">{item.name}</h3>
                        </div>
                    </Col>)
            })
        }

        return (
            <Modal
                visible={visible}
                title="审核"
                width={1000}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="institutionCheck-form quality-course-check-form">
                    <Form layout="vertical">
                        <h4 className="add-form-title-h4">明星申请信息</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="courseName"  label="课程名称：">
                                    {getFieldDecorator('courseName', {
                                        initialValue: data.name,
                                        rules: [{
                                            required: true,
                                            message: '课程名称不能为空',
                                        }],
                                    })(
                                        <Input disabled placeholder="请输入课程名称"/>
                                    )}
                                </FormItem>                                
                            </Col>
                            <Col span={8}>
                                <FormItem className="typeName"  label="所属分类：">
                                    {getFieldDecorator('typeName', {
                                        initialValue: data.typeIds,
                                        rules: [{
                                            required: true,
                                            message: '分类不能为空',
                                        }],
                                    })(   
                                        <Input disabled placeholder="请输入所属分类"/>
                                    )}
                                </FormItem> 
                            </Col>
                            <Col span={24}>
                                <FormItem className="certification"  label="课程图片：">
                                    {getFieldDecorator('pic', {
                                        initialValue: data.pic,
                                        rules: [{
                                            required: true,
                                            message: '课程图片不能为空',
                                        }],
                                    })(
                                        <div className="coursePhoto">                                            
                                            <img src={data.pic} alt=""/>
                                        </div>
                                    )}
                                </FormItem> 
                            </Col>
                            <Col span={8}>
                                <FormItem className="author"  label="作者：">
                                    {getFieldDecorator('author', {
                                        initialValue: data.author,
                                        rules: [{
                                            required: true,
                                            message: '作者不能为空',
                                        }],
                                    })(
                                        <Input disabled placeholder="请输入作者"/>
                                    )}
                                </FormItem> 
                            </Col>
                            <Col span={8}>
                                <FormItem className="originalPrice" label="课程原价：">
                                    {getFieldDecorator('originalPrice', {
                                        initialValue: data.originalPrice,
                                        rules: [{
                                            required: true,
                                            message: '课程原价不能为空',
                                        }],
                                    })(
                                        <InputNumber disabled min={0} precision={2} step={100} style={{width: "100%"}} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="price"  label="课程现价：">
                                    {getFieldDecorator('price', {
                                        initialValue: data.price,
                                        rules: [{
                                            required: true,
                                            message: '课程现价不能为空',
                                        }],
                                    })(
                                        <InputNumber disabled min={0} precision={2} step={100} style={{width: "100%"}} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={6}>
                                <FormItem className="name" label="付费设置：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.isCharge ? 1 : 2,
                                        rules: [{
                                            required: true,
                                            message: '付费不能为空',
                                        }],
                                    })(
                                        <RadioGroup disabled buttonStyle="solid" onChange={(e) => setFeeType01(e.target.value)}>
                                            <Radio.Button value={1} style={{marginRight: "20px", borderRadius: "4px"}}>收费</Radio.Button>
                                            <Radio.Button value={2} style={{marginRight: "20px", borderRadius: "4px"}}>免费</Radio.Button>
                                        </RadioGroup>                                       
                                    )}
                                </FormItem>                                
                            </Col>
                            <Col span={8}>
                                <FormItem className="chapterChoose" label="">
                                    从 {getFieldDecorator('chapter', {
                                        initialValue: data.isCharge ? data.chargeJointCount : '',
                                        rules: [{
                                            required: feeType01 === 1,
                                            message: '章节不能为空',
                                        }],
                                    })(
                                        <InputNumber disabled min={0} precision={0} step={100} style={{width: "40%"}} placeholder="请输入正整数" />
                                    )} 节开始收费
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">课程详情</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="characteristic" label="课程简介：">
                                    {getFieldDecorator('characteristic', {
                                        initialValue: data.characteristic,
                                        rules: [{
                                            required: true,
                                            message: '课程简介不能为空',
                                        }],
                                    })(
                                        <div style={{bordr: "1px solid #e5e4e3"}} className="courseDescription" dangerouslySetInnerHTML={{__html: data.characteristic}}></div>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        
                        <div className="ant-line"></div>                        

                        <h4 className="add-form-title-h4">购买须知</h4>
                        <FormItem className="tips longItem" label="购买说明：">
                            {getFieldDecorator('tips', {
                                initialValue: data.tips,
                                rules: [{
                                    required: true,
                                    message: '购买须知不能为空',
                                }],
                            })(
                                <TextArea 
                                    disabled
                                    style={{resize: "none"}} 
                                    placeholder="请填写课程购买须知"
                                    autosize={{minRows: 5, maxRows: 10}}/>
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <FormItem className="warmPrompt longItem" label="温馨提示：">
                            {getFieldDecorator('warmPrompt', {
                                rules: [{
                                    required: true,
                                    message: '温馨提示不能为空',
                                }],
                                initialValue: data.warmPrompt || "如需要发票，请您在上课前向机构咨询",
                            })(
                                <TextArea 
                                    disabled
                                    style={{resize: "none"}} 
                                    placeholder="如需要发票，请您在上课前向机构咨询"
                                    autosize={{minRows: 5, maxRows: 5}}/>
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <FormItem className="official longItem" label="官方说明：">
                            {getFieldDecorator('official', {
                                rules: [{
                                    required: true,
                                    message: '官方说明不能为空',
                                }],
                                initialValue: data.official || "为保障您的权益，建议使用淘儿学线上支付，若使用其他支付方式导致纠纷，淘儿学不承担任何责任，感谢您的理解和支持！"
                            })(
                                <TextArea 
                                    disabled
                                    style={{resize: "none"}} 
                                    placeholder="为保障您的权益，建议使用淘儿学线上支付，若使用其他支付方式导致纠纷，淘儿学不承担任何责任，感谢您的理解和支持！"
                                    autosize={{minRows: 5, maxRows: 5}}/>
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">课时安排</h4>
                        <Row gutter={24}>
                            {tempVideoList}                           
                        </Row>
                        <h4 className="add-form-title-h4">审核结果</h4>
                        
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="checkStatus">
                                    {getFieldDecorator('checkStatus', {
                                        initialValue: 4,
                                        rules: [{
                                            required: false,
                                            message: "审核结果不能为空"
                                        }],
                                    })(
                                        <RadioGroup buttonStyle="solid" onChange={(e) => setFeeType(e.target.value)}>
                                            <Radio.Button value={4} style={{marginRight: "20px", borderRadius: "4px"}}>通过</Radio.Button>
                                            <Radio.Button value={3} style={{marginRight: "20px", borderRadius: "4px"}}>驳回</Radio.Button>
                                            <Radio.Button value={5} style={{marginRight: "20px", borderRadius: "4px"}}>不通过</Radio.Button>
                                        </RadioGroup>
                                    )}
                                </FormItem>                            
                            </Col>
                            <Col span={8}>
                                <FormItem className="originalPrice" label="服务费：">
                                    {getFieldDecorator('fee', {
                                        initialValue: data.fee,
                                        rules: [{
                                            required: feeType === 4,
                                            message: '服务费不能为空',
                                        }],
                                    })(
                                        <InputNumber disabled={data.fee} min={0} precision={2} step={0.01} style={{width: "100%"}} placeholder="输入0.15即为服务费15%"/>
                                    )}
                                </FormItem>
                            </Col>
                            <div className="ant-line"></div>
                        </Row>                      
                        <FormItem className="opinion" label="不通过/驳回原因：">
                            {getFieldDecorator('opinion', {
                                rules: [{
                                    required: feeType !== 4,
                                    message: '审核意见不能为空',
                                }],
                            })(
                                <TextArea 
                                    style={{resize: "none"}} 
                                    placeholder="请填写审核意见"
                                    autosize={{minRows: 3, maxRows: 10}}/>
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                    </Form>
                </div>
            </Modal>
        );
    }
);

// 明星审核组件
class ItemCheck extends Component {
    state = {
        data: {},
        videoList: [],        
        feeType: 4,
        feeType01: 2,
        visible: false,       
        confirmLoading: false, 
    };

    showModal = () => {
        this.getData();
        this.setState({visible: true})
    };

    // 获取本页信息
    getData = () => {
        reqwest({
            url: '/sys/excellentCourse/checkDetail',
            type: 'json',
            method: 'get',
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
                });
            },
            success: (json) => {
                if (json.result === 0) {
                    // 已有所属分类写入                    
                    json.data.typeIds = json.data.excellentCourseType.parentTypeName + '/' + json.data.excellentCourseType.typeName;
                    json.data.characteristic = config.removeTAG(json.data.characteristic)
                    this.setState({
                        data: json.data,
                        videoList: json.data.lesson,
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
        });
    };

    setFeeType = (value) => {
        this.setState({
            feeType: Number(value)
        })
    };

    setFeeType01 = (value) => {
        this.setState({
            feeType01: Number(value)
        })
    };

    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false
        }, () => {
            this.setState({
                data: {},
                videoList: [],
                feetype: 4,
                feetype01: 2,
                confirmLoading: false
            });
            form.resetFields();
        });
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            if (values.state === 3 && !values.opinion) {
                message.error("驳回意见不能为空");
                return
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/sys/excellentCourse/check',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    id: this.props.id,
                    fee: values.fee,
                    checkStatus: values.checkStatus,
                    checkOpinion: values.opinion
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    });
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("审核成功");
                        this.handleCancel();
                        this.props.recapture();
                    } else {
                        if (json.code === 901) {
                            message.error("请先登录");
                            this.props.toLoginPage();
                        } else if (json.code === 902) {
                            message.error("登录信息已过期，请重新登录");
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
                    data={this.state.data}
                    videoList={this.state.videoList}                    
                    setFeeType={this.setFeeType}
                    feeType={this.state.feeType}
                    setFeeType01={this.setFeeType01}
                    feeType01={this.state.feeType01}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

// 驳回意见
class ItemOpinion extends Component {
    state = {
        visible: false,
        data: ""
    };

    getData = () => {
        reqwest({
            url: '/sys/excellentCourse/getCheckOpinion',
            type: 'json',
            method: 'get',
            data: {
                id: this.props.id
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {message.error("获取失败");},
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        data: json.data,
                    });
                } else {
                    if (json.code === 901) {
                        message.error("请先登录");                        
                        this.props.toLoginPage();// 返回登陆页
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");                        
                        this.props.toLoginPage();// 返回登陆页
                    } else {
                        message.error(json.message);
                    }
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
        this.setState({visible: false,data: ''});
    };

    render() {
        return (
            <a style={{display: this.props.status ? "inline" : "none"}}>
                <span onClick={this.showModal}>查看原因</span>
                <Modal
                    title="不通过原因"
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                    destroyOnClose={true}>                        
                    <div className="item-opinion" style={{minHeight: "200px"}}>
                        <p>{this.state.data || "暂无"}</p>
                    </div>
                </Modal>
            </a>
        );
    }
}

// 明星列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            pagination: {
                current: 1,
                pageSize: 15,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            },
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: 70,
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '课程名称',
                dataIndex: 'courseName',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'courseName'),
            },
            {
                title: '姓名',
                dataIndex: 'teacherName',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'teacherName'),
            },
            {
                title: '昵称',
                dataIndex: 'nickName',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'nickName'),
            },
            {
                title: '科目',
                dataIndex: 'typeName',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'typeName'),
            },
            {
                title: '申请时间',
                dataIndex: 'createTime',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '状态',
                dataIndex: 'status',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'status'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*驳回意见（副表状态为审核驳回的机构展示此项）*/}
                            <ItemOpinion
                                id={record.id} 
                                toLoginPage={this.props.toLoginPage}                                
                                status={this.props.type === 1 && this.props.opObjDeny.checkOpinion}/>                            
                            {/*审核（副表状态为待审核，当前登录人为超级管理员或运营人员时展示此项）*/}
                            <ItemCheck 
                                id={record.id}                                
                                recapture={this.getData} 
                                toLoginPage={this.props.toLoginPage}                                
                                status={this.props.type === 0 && this.props.opObjReady.checkExcellectCourse}/>                            
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
    }

    //获取本页信息
    getData = (type, keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/excellentCourse/checkList',
            type: 'json',
            method: 'get',
            data: {
                status: type === undefined ? this.props.type : type,
                name: keyword === undefined ? this.props.keyword.courseName : keyword.courseName,
                startTime: keyword === undefined ? this.props.keyword.startTime : keyword.startTime,
                endTime: keyword === undefined ? this.props.keyword.endTime : keyword.endTime,
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
                        let tempStatus = '';
                        if (item.checkStatus === 1) {
                            tempStatus = "未审核";
                        } else if (item.checkStatus === 2) {
                            tempStatus = "需重审";
                        } else if (item.checkStatus === 3) {
                            tempStatus = "已驳回";
                        } else if (item.checkStatus === 4) {
                            tempStatus = "不通过";
                        } else if (item.checkStatus === 5) {
                            tempStatus = '通过'
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,                           
                            index: index + 1,                           
                            courseName: item.name,
                            teacherName: item.teacherName,
                            nickName: item.nickname,
                            telephone: item.appUserPhone,                                                     
                            typeName: item.typeNameStr,                          
                            createTime: item.createTime,
                            photo: item.pic,                           
                            statusCode: item.checkStatus,
                            status: tempStatus,
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

    //页码变化处理
    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.institutionCheckPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.institutionCheckPageSize);
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
        if (nextProps.type === this.props.type && nextProps.keyword === this.props.keyword && nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData(nextProps.type, nextProps.keyword);
    }

    render() {
        return <Table 
                    bordered
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    columns={this.columns}
                    onChange={this.handleTableChange}/>;
    }
}

class StarCheck extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: "0",
            keyword: {
                courseName: '',
                startTime: null,
                endTime: null,
            },
            flag_add: false,
            // 权限            
            opObjCheck: {},
            // 待审核权限
            opObjReady: {},
            //已驳回 
            opObjDeny: {},
            // 日期禁选控制
            startValue: null,
            endValue: null,
        };        
    }

    //tab状态设置
    setType = (value) => {
        this.setState({
            type: value,
        })
    };
    
    // 名字搜索
    search = (value) => {
        this.setState({
            keyword: {
                courseName: value,
                startTime: this.state.keyword.startTime,
                endTime: this.state.keyword.endTime,
            }
        })
    };

    // 开始日期设置
    setStartTime = (date, dateString) => {
        this.setState({
            startValue: date,
            keyword: {
                courseName: this.state.keyword.courseName,
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
                courseName: this.state.keyword.courseName,
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
    
    // 刷新数据
    setFlag = () => {
        this.setState({
            flag_add: !this.state.flag_add
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
                        opObjCheck: data
                    })
                }
            })
        });

        // 待审核权限
        JSON.parse(sessionStorage.menuListOne).forEach((item) => {
            item.children.forEach((subItem) => {                
                subItem.children.forEach((fourthItem) => {
                    if (fourthItem.url === "/index/check-manage/quality-course-check/ready") {
                        let data = {};
                        fourthItem.children.forEach((fifthItem) => {
                            data[fifthItem.url] = true;
                        })
                        this.setState({
                            opObjReady: data
                        })
                    }                    
                })
            })
        })

        // 已驳回权限
        JSON.parse(sessionStorage.menuListOne).forEach((item) => {
            item.children.forEach((subItem) => {                
                subItem.children.forEach((fourthItem) => {
                    if (fourthItem.url === "/index/check-manage/quality-course-check/deny") {
                        let data = {};
                        fourthItem.children.forEach((fifthItem) => {
                            data[fifthItem.url] = true;
                        })
                        this.setState({
                            opObjDeny: data
                        })
                    }                    
                })
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
        return (
            <div className="institution-check">
                <div className="keyWord clearfix">
                    <Search
                        placeholder="请输入姓名"
                        onSearch={this.search}
                        enterButton
                        style={{
                            width: "320px", 
                            float: "left",
                            marginRight: "20px"
                        }} />
                    {/*明星日期筛选*/}
                    <span>日期筛选： </span>
                    <DatePicker 
                        placeholder="请选择开始日期"
                        style={{width: "150px"}}
                        disabledDate={this.disabledStartDate}
                        onChange={this.setStartTime} />
                    <span style={{margin: "0 10px"}}>至</span>
                    <DatePicker
                        placeholder="请选择结束日期"
                        style={{width: "150px"}}
                        disabledDate={this.disabledEndDate}
                        onChange={this.setEndTime} />
                </div>
                <header className="clearfix">
                    <Tabs defaultActiveKey={this.state.type} onChange={this.setType}>
                        <TabPane tab="待审核" key="0"/>
                        <TabPane tab="已驳回" key="1"/>
                    </Tabs>
                </header>                
                <div className="table-box">
                    <DataTable 
                        type={Number(this.state.type)} 
                        keyword={this.state.keyword}
                        opObjReady={this.state.opObjReady}
                        opObjDeny={this.state.opObjDeny}
                        toLoginPage={this.toLoginPage} 
                        flag_add={this.state.flag_add}/>
                </div>
                <p className="hint"/>
            </div>
        )
    }
}

export default StarCheck;