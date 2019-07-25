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
    Select,
    Cascader,
} from 'antd';
import { checkList, checkDetail, check, checkOpinion } from '../../config';
import common from '../../config/config';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const {TextArea} = Input;
const {Option} = Select;

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
                maskClosable={false}
                destroyOnClose={true}
                confirmLoading={confirmLoading}>
                <div className="institutionCheck-form quality-course-check-form">
                    <Form layout="vertical">
                        <h4 className="add-form-title-h4">明星申请信息</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="courseName"  label="姓名：">
                                    {getFieldDecorator('courseName', {
                                        initialValue: data.name,                                      
                                        rules: [{
                                            required: true,
                                            message: '姓名不能为空',
                                        }],
                                    })(
                                        <Input disabled placeholder="请输入姓名"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="gender"  label="性别：">
                                    {getFieldDecorator('gender', {
                                        initialValue: data.gender,                                      
                                        rules: [{
                                            required: true,
                                            message: '性别不能为空',
                                        }],
                                    })(
                                        <Select disabled placeholder="请选择性别">
                                            <Option value={0}>女</Option>
                                            <Option value={1}>男</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="height"  label="身高：">
                                    {getFieldDecorator('height', {
                                        initialValue: data.height,
                                        rules: [{
                                            required: true,
                                            message: '身高不能为空',
                                        }],
                                    })(
                                        <InputNumber disabled style={{width: "90%"}} placeholder="请填写身高"/>
                                    )} CM
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="weight"  label="体重：">
                                    {getFieldDecorator('weight', {
                                        initialValue: data.weight,                                      
                                        rules: [{
                                            required: true,
                                            message: '体重不能为空',
                                        }],
                                    })(
                                        <InputNumber disabled style={{width: "90%"}} placeholder="请填写体重"/>
                                    )} KG
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="area"  label="所在地区：">
                                    {getFieldDecorator('area', {
                                        // initialValue: data.areaId === 0 ? ["0"] : currentArea,
                                        rules: [{
                                            required: true,
                                            message: '所在地区不能为空',
                                        }],
                                    })(
                                        <Cascader disabled  placeholder="请选择所在地区"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="telephone"  label="联系方式：">
                                    {getFieldDecorator('telephone', {
                                        initialValue: data.telephone,                                      
                                        rules: [{
                                            required: true,
                                            message: '联系方式不能为空',
                                        }],
                                    })(
                                        <Input disabled placeholder="请输入联系方式"/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem className="avatar"  label="头像：">
                                    {getFieldDecorator('avatar', {
                                        initialValue: data.pic,
                                        rules: [{
                                            required: true,
                                            message: '头像不能为空',
                                        }],
                                    })(
                                        <div className="professionCertification">                                            
                                            <img src={data.pic} alt=""/>
                                        </div>
                                    )}
                                </FormItem>                                
                            </Col>
                        </Row>                        
                        <div className="ant-line"></div>
                        {/*<FormItem className="personalProfile" label="明星简介：">
                            {getFieldDecorator('personalProfile', {
                                initialValue: data.personalProfile,
                                rules: [{
                                    required: true,
                                    message: '简介不能为空',
                                }],
                            })(
                                <TextArea                                     
                                    style={{resize: "none"}}
                                    disabled                                    
                                    placeholder="请填写明星简介"
                                    autosize={{minRows: 5, maxRows: 30}}/>                                
                            )}
                        </FormItem>*/}
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="characteristic" label="个人简介：">
                                    {getFieldDecorator('characteristic', {
                                        initialValue: data.characteristic,
                                        rules: [{
                                            required: true,
                                            message: '个人简介不能为空',
                                        }],
                                    })(
                                        <div style={{bordr: "1px solid #e5e4e3"}} className="courseDescription" dangerouslySetInnerHTML={{__html: data.characteristic}}></div>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        
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
                        </Row>  
                        <div className="ant-line"></div>                    
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
        loading: false, 
    };

    showModal = () => {
        this.getData();
        this.setState({visible: true})
    };

    // 获取本页信息
    getData = () => {
        checkDetail({id: this.props.id}).then((json) => {
            if (json.data.result === 0) {
                json.data.data.characteristic = common.removeTag(json.data.data.characteristic)
                this.setState({
                    data: json.data.data,
                    videoList: json.data.data.lesson,
                });
            } else {
                this.props.exceptHandle(json.data);
            }
        }).catch((err) => {
            message.error("获取失败");
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
                loading: false
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
            this.setState({loading: true});            
            const data = {
                id: this.props.id,               
                checkStatus: values.checkStatus,
                checkOpinion: values.opinion
            };
            check(data).then((json) => {
                if (json.data.result === 0) {
                    message.success("审核成功");
                    this.handleCancel();
                    this.props.recapture();
                } else {
                    this.props.exceptHandle(json.data);
                }
            }).catch((err) => {this.errorHandle(err);});
        });
    };

     // 异常处理
    exceptHandle = (json) => {
        if (json.code === 901) {
            message.error("请先登录");            
            this.props.toLoginPage();// 返回登陆页
        } else if (json.code === 902) {
            message.error("登录信息已过期，请重新登录");            
            this.props.toLoginPage();// 返回登陆页
        } else {
            message.error(json.message);
            this.setState({loading: false});
        }
    };
    
    // 错误处理
    errorHandle = () => {
        message.error("保存失败");
        this.setState({loading: false});
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
                    confirmLoading={this.state.loading}
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
        checkOpinion({id: this.props.id}).then((json) => {
            if (json.data.result === 0) {
                this.setState({
                    data: json.data.data,
                });
            } else {
                this.props.exceptHandle(json.data);                
            }
        }).catch((err) => {
            message.error("获取失败");
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
                    maskClosable={false}
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
                                exceptHandle={this.exceptHandle}
                                toLoginPage={this.props.toLoginPage}                                
                                status={this.props.type === 1 && this.props.opObjDeny.checkOpinion}/>                            
                            {/*审核（副表状态为待审核，当前登录人为超级管理员或运营人员时展示此项）*/}
                            <ItemCheck 
                                id={record.id}                                
                                recapture={this.getData}
                                exceptHandle={this.exceptHandle}
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
        this.setState({loading: true});
        const params = {
            status: type === undefined ? this.props.type : type,
            name: keyword === undefined ? this.props.keyword.courseName : keyword.courseName,
            startTime: keyword === undefined ? this.props.keyword.startTime : keyword.startTime,
            endTime: keyword === undefined ? this.props.keyword.endTime : keyword.endTime,
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize
        };
        checkList(params).then((json) => {
            const data = [];
            if (json.data.result === 0) {
                if (json.data.data.list.length === 0 && this.state.pagination.current !== 1) {
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
                json.data.data.list.forEach((item, index) => {
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
                        total: json.data.data.total,
                        current: this.state.pagination.current,
                        pageSize: this.state.pagination.pageSize
                    }
                });
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {
            message.error("获取失败");
            this.setState({loading: false});
        });
    };

    exceptHandle = (json) => {
        if (json.code === 901) {
            message.error("请先登录");
            this.props.toLoginPage();
        } else if (json.code === 902) {
            message.error("登录信息已过期，请重新登录");
            this.props.toLoginPage();
        } else {
            message.error(json.message);
            this.setState({loading: false});
        }
    }

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