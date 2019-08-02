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
} from 'antd';
// import { checkList, checkDetail, check} from '../../config';
// import { toLoginPage, getPower, genderOptions, checkOptions, checkStatus, pagination, handleTableChange, exceptHandle, errorHandle } from '../../config/common';
import * as common from '../../config/common';
import * as config from '../../config';

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
        const {visible, onCancel, onCreate, form, data, setFeeType, feeType, confirmLoading} = props;
        const {getFieldDecorator} = form;

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
                                        initialValue: data.name || '暂无',                                      
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
                                        initialValue: data.gender || 0,                                      
                                        rules: [{
                                            required: true,
                                            message: '性别不能为空',
                                        }],
                                    })(
                                        <Select disabled placeholder="请选择性别">{common.genderOptions}</Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="height"  label="身高：">
                                    {getFieldDecorator('height', {
                                        initialValue: data.height || '暂无',
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
                                        initialValue: data.weight || '暂无',                                      
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
                                        initialValue: data.areaId === 0 ? "全国" : (data.provinceName + '/'+ data.cityName+'/'+data.areaName),
                                        rules: [{
                                            required: true,
                                            message: '所在地区不能为空',
                                        }],
                                    })(
                                        <Input disabled  placeholder="请选择所在地区"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="telephone"  label="联系方式：">
                                    {getFieldDecorator('phone', {
                                        initialValue: data.phone || '暂无',                                      
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
                                        initialValue: data.photo || '暂无',
                                        rules: [{
                                            required: true,
                                            message: '头像不能为空',
                                        }],
                                    })(                                        
                                        <Row gutter={24}>
                                            <Col span={6}>
                                                <div className="professionCertification">                                            
                                                    <img src={data.photo} alt=""/>
                                                </div>
                                            </Col>
                                        </Row>
                                    )}
                                </FormItem>                                
                            </Col>
                        </Row>                        
                        <div className="ant-line"></div>
                        <FormItem className="personalProfile" label="明星简介：">
                            {getFieldDecorator('personalProfile', {
                                initialValue: data.description || '暂无',
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
                        </FormItem>
                        <div className="ant-line"></div>                      
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
                                        <RadioGroup buttonStyle="solid" onChange={(e) => setFeeType(e.target.value)}>{common.checkOptions}</RadioGroup>
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
        feeType: 4,        
        visible: false,       
        loading: false, 
    };

    showModal = () => {
        this.getData();
        this.setState({visible: true})
    };

    // 获取本页信息
    getData = () => {
        config.checkDetail({id: this.props.id}).then((json) => {
            if (json.data.result === 0) {                
                this.setState({data: json.data.data});
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    setFeeType = (value) => {
        this.setState({feeType: Number(value)});
    };

    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false
        }, () => {
            this.setState({
                data: {},
                feetype: 4,
                loading: false
            });
            form.resetFields();
        });
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) { return;}            
            this.setState({loading: true});
            config.check({
                id: this.props.id,               
                checkStatus: values.checkStatus,
                checkOpinion: values.opinion
            }).then((json) => {
                if (json.data.result === 0) {
                    message.success("审核成功");
                    this.handleCancel();
                    this.props.recapture();
                } else {
                    common.exceptHandle(this, json.data);
                }
            }).catch((err) => common.errorHandle(this, err));
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
                    confirmLoading={this.state.loading}/>
            </a>
        );
    }
}

// 驳回意见/原因
class ItemOpinion extends Component {
    state = {visible: false};

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        this.setState({visible: false});
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
                        <p>{this.props.record.checkOpinion || "暂无"}</p>
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
            pagination: common.pagination
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: 70,
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },            
            {
                title: '姓名',
                dataIndex: 'name',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '手机号',
                dataIndex: 'phone',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'phone'),
            },            
            {
                title: '所在地区',
                dataIndex: 'cityName',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'cityName'),
            },
            {
                title: '申请时间',
                dataIndex: 'createTime',
                width: '15%',
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
                            {/*驳回意见（副表状态为审核驳回的展示此项）*/}
                            <ItemOpinion
                                record={record}
                                exceptHandle={this.exceptHandle}
                                toLoginPage={this.props.toLoginPage}
                                status={this.props.type === 2 && this.props.opObjDeny.select}/>
                            {/*审核（副表状态为待审核）*/}
                            <ItemCheck 
                                id={record.id}
                                recapture={this.getData}
                                exceptHandle={this.exceptHandle}
                                toLoginPage={this.props.toLoginPage}
                                status={this.props.type === 1 && this.props.opObjReady.check}/>
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

    dataHandle = (data) => {
        const result = [];
        data.forEach((item, index) => {            
            result.push({
                key: index.toString(),
                id: item.id,                           
                index: index + 1,                           
                name: item.name,
                phone: item.phone,                                                     
                cityName: item.cityName,
                createTime: item.createTime,
                photo: item.photo,                           
                statusCode: item.checkStatus,
                status: common.checkStatus(item.checkStatus),
                checkOpinion: item.checkOpinion
            });
        });
        return result;
    };

    //获取本页信息
    getData = (type, keyword) => {
        this.setState({loading: true});
        const params = {
            checkStatus: type === undefined ? this.props.type : type,
            name: keyword === undefined ? this.props.keyword.name : keyword.name,
            beginTime: keyword === undefined ? this.props.keyword.startTime : keyword.startTime,
            endTime: keyword === undefined ? this.props.keyword.endTime : keyword.endTime,
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize
        };
        config.checkList(params).then((json) => {
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
                this.setState({
                    loading: false,
                    data: this.dataHandle(json.data.data.list),
                    pagination: {
                        total: json.data.data.total,
                        current: this.state.pagination.current,
                        pageSize: this.state.pagination.pageSize
                    }
                });
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
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
                    onChange={(pagination) => common.handleTableChange(this, pagination)}/>;
    }
}

class StarCheck extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: "1",
            keyword: {
                name: '',
                startTime: null,
                endTime: null,
            },
            flag_add: false,
            opObjReady: {}, // 待审核权限
            opObjDeny: {}, // 已驳回
            startValue: null, // 日期禁选控制
            endValue: null,
        };        
    }

    //tab状态设置
    setType = (value) => {
        this.setState({type: value});
    };
    
    // 名字搜索
    search = (value) => {
        this.setState({
            keyword: {
                name: value,
                startTime: this.state.keyword.startTime,
                endTime: this.state.keyword.endTime
            }
        })
    };

    // 开始日期设置
    setStartTime = (date, dateString) => {
        this.setState({
            startValue: date,
            keyword: {
                name: this.state.keyword.name,
                startTime: dateString,
                endTime: this.state.keyword.endTime
            }
        })
    };    

    // 结束日期设置
    setEndTime = (date, dateString) => {
        this.setState({
            endValue: date,
            keyword: {
                name: this.state.keyword.name,
                startTime: this.state.keyword.startTime,
                endTime: dateString
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
    
    // 刷新table数据
    setFlag = () => {
        this.setState({flag_add: !this.state.flag_add});
    };

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
        this.setState({           
            opObjReady: common.getPower(this, "/index/app-home/star-check/ready").dataTabs, // 待审核权限
            opObjDeny: common.getPower(this, "/index/app-home/star-check/deny").dataTabs // 已驳回权限
        });
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
                        style={{width: "320px", float: "left", marginRight: "20px"}}/>
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
                        <TabPane tab="待审核" key="1"/>
                        <TabPane tab="已驳回" key="2"/>
                    </Tabs>
                </header>                
                <div className="table-box">
                    <DataTable 
                        type={Number(this.state.type)} 
                        keyword={this.state.keyword}
                        opObjReady={this.state.opObjReady}
                        opObjDeny={this.state.opObjDeny}
                        toLoginPage={() => common.toLoginPage(this)}
                        flag_add={this.state.flag_add}/>
                </div>
                <p className="hint"/>
            </div>
        )
    }
}

export default StarCheck;