import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    Form,
    Select,
    Row,
    Col,
    DatePicker,
    Spin
} from 'antd';
import * as common from '../../config/common';
import * as config from '../../config';

const Search = Input.Search;
const FormItem = Form.Item;

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

// 报名名单下载组件
class ItemDownload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            loading: false,// 提交按钮状态变量
        };
    }

    showModal = (props, event) => {
        this.setState({visible: true});
    };

    // 取消处理
    handleCancel = () => {
        this.setState({visible: false, loading: false});
    };

    // 确认处理
    handleCreate = () => {
        this.setState({loading: true});
        common.copyToClipboard(this, config.configUrl.copyUrl + this.props.id);        
    };

    render() {
        return (
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button type="primary" onClick={this.showModal}>下载</Button>
                <Modal
                    visible={this.state.visible}
                    title="提示"
                    width={600}
                    className="sign-list-download"
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key="submit" type="primary" loading={this.state.loading} onClick={this.handleCreate}>复制链接</Button>,
                        <Button key="back" onClick={this.handleCancel} disabled={this.state.loading}>取消</Button>                        
                    ]}
                    maskClosable={false}
                    destroyOnClose={true}>
                    <div className="sign-link-address">
                        <div>{config.configUrl.copyUrl + this.props.id}</div>
                        <p>已为您生成在线访问地址，可在线查看报名名单的信息</p>
                    </div>
                </Modal>                
            </div>
        );
    }
}

// 报名名单详情表单
const ItemDetailsForm = Form.create()(
    (props) => {
        const {visible, onCancel, form, data, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="详情"
                width={1000}
                onCancel={onCancel}
                footer={null}
                maskClosable={false}
                destroyOnClose={true}
                confirmLoading={confirmLoading}>
                {
                    JSON.stringify(data) === '{}' ? 
                        <div className="spin-box">
                            <Spin/>
                        </div>
                        :
                        <div className="institutionCheck-form">
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
                                        <FormItem className="gender" label="性别：">
                                            {getFieldDecorator('gender', {
                                                initialValue: data.gender || "0",
                                                rules: [{
                                                    required: true,
                                                    message: '所属分类不能为空'
                                                }],
                                            })(
                                                <Select disabled>{common.genderOptions}</Select>
                                            )}
                                        </FormItem> 
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="height" label="身高：">
                                            {getFieldDecorator('height', {
                                                initialValue: data.height || 0,
                                                rules: [{
                                                    required: true,
                                                    message: '身高不能为空'
                                                }],
                                            })(
                                                <Input disabled placeholder="请输入身高"/>
                                            )}
                                        </FormItem> 
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="weight" label="体重：">
                                            {getFieldDecorator('weight', {
                                                initialValue: data.weight || 0,
                                                rules: [{
                                                    required: true,
                                                    message: '体重不能为空'
                                                }],
                                            })(
                                                <Input disabled placeholder="请输入体重"/>
                                            )}
                                        </FormItem> 
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="address" label="所在地区：">
                                            {getFieldDecorator('address', {
                                                initialValue: data.cityId === 0 ? '全国' : data.provinceName + '/' + data.cityName,
                                                rules: [{
                                                    required: true,
                                                    message: '地区不能为空'
                                                }],
                                            })(
                                                <Input disabled placeholder="请选择所在地区"/>
                                            )}
                                        </FormItem> 
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="telephone" label="联系方式：">
                                            {getFieldDecorator('phone', {
                                                initialValue: data.phone,
                                                rules: [{
                                                    required: true,
                                                    message: '联系方式不能为空'
                                                }],
                                            })(
                                                <Input disabled placeholder="请输入联系方式"/>
                                            )}
                                        </FormItem> 
                                    </Col>                            
                                    <Col span={24}>
                                        <FormItem className="certification"  label="头像：">
                                            {getFieldDecorator('pic', {
                                                initialValue: data.photo,
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
                                    <Col span={24}>
                                        <FormItem className="characteristic" label="个人简介：">
                                            {getFieldDecorator('characteristic', {
                                                initialValue: data.description,
                                                rules: [{
                                                    required: true,
                                                    message: '个人简介不能为空',
                                                }],
                                            })(                                        
                                                <div className="courseDescription" style={{border: "1px solid #e5e3e0",padding: "10px"}} dangerouslySetInnerHTML={{__html: data.description}}></div>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>                
                                <div className="ant-line"></div>
                                <h4 className="add-form-title-h4">模卡</h4>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <div className="professionCertification">                                            
                                            <img src={data.modelCard} alt=""/>
                                        </div> 
                                    </Col>
                                </Row>
                                <h4 className="add-form-title-h4">自我介绍视频</h4>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <video controls="controls" width="100%">
                                            <source src={data.selfIntroduce} type="video/*"/>
                                        </video>
                                    </Col>                         
                                </Row>
                                <div className="ant-line"></div>
                                <h4 className="add-form-title-h4">作品视频</h4>                        
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <video controls="controls" width="100%">
                                            <source src={data.productVideo} type="video/*"/>
                                        </video>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                }
                
            </Modal>
        );
    }
);

// 报名名单详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        data: {}// 报名名单基本信息
    };

    // 获取报名名单基本信息
    getData = () => {
        this.setState({loading: true});
        config.signDetail({id: this.props.id}).then((json) => {
            if (json.data.result === 0) {               
                this.setState({
                    loading: false,
                    data: json.data.data,
                });
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    showModal = () => {
        this.getData();
        this.setState({visible: true});
    };

    handleCancel = () => {
        this.setState({visible: false, data: {}});
    };

    render() {
        return (           
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>详情</span>
                <ItemDetailsForm 
                    ref={this.saveFormRef}
                    visible={this.state.visible}                                       
                    data={this.state.data}                    
                    videoList={this.state.videoList}
                    onCancel={this.handleCancel}/>
            </a>
        );
    }
}

// 报名名单列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            typeList: [],
            type: null,
            data: [],
            pagination: common.pagination
        };        
        this.columns = [// 列配置
            {
                title: '序号',
                dataIndex: 'index',
                width: 70,
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },            
            {
                title: '姓名',
                dataIndex: 'name',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '性别',
                dataIndex: 'gender',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'gender'),
            },
            {
                title: '身高',
                dataIndex: 'height',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'height'),
            },
            {
                title: '体重',
                dataIndex: 'weight',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'weight'),
            },
            {
                title: '所在地区',
                dataIndex: 'area',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'arear'),
            },            
            {
                title: '报名时间',
                dataIndex: 'signTime',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'signTime'),
            },            
            {
                title: '联系方式',
                dataIndex: 'phone',
                width: '12%',                
                render: (text, record) => this.renderColumns(text, record, 'phone'),
            },         
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*报名名单详情*/}
                            <ItemDetails 
                                id={record.id}
                                opStatus={this.props.opObj.applyDetails}
                                toLoginPage={this.props.toLoginPage}/>                             
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

    dataHandle = (data) => {
        const result = [];
        data.forEach((item, index) => {
            result.push({
                key: index.toString(),
                id: item.id,
                index: index + 1,
                sort: item.sort !== 0 ? item.sort : '',
                name: item.name,
                genderCode: item.gender,
                gender: common.genderStatus(item.gender),
                height: (item.height ? item.height : 0) + 'cm' ,
                weight: (item.weigth ? item.weight : 0) + 'kg',
                area: item.provinceName + '/' + item.cityName,
                signTime: item.createTime,
                phone: item.phone,
            });
        });
        return result;
    };

    // 获取本页信息
    getData = (keyword) => {
        this.setState({loading: true});
        config.signList({
            annunciateId: this.props.opObj.id,                              
            name: keyword ? keyword.name : this.props.keyword.name,
            startTime: keyword ? keyword.startTime : this.props.keyword.startTime,
            endTime: keyword ? keyword.endTime : this.props.keyword.endTime,                
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize
        }).then((json) => {
            if (json.data.result === 0) {
                common.handleTableNoDataResponse(this, json.data.data);
                this.setState({
                    loading: false,
                    data: this.dataHandle(json.data.data.list),
                    pagination: {
                        total: json.data.data.total,
                        current: this.state.pagination.current,
                        pageSize: this.state.pagination.pageSize
                    }
                })
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    componentWillMount() {
        this.getData();
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.keyword === this.props.keyword && nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData(nextProps.keyword);
    };

    render() {
        return <Table 
                    bordered
                    scroll={{ x: 1500 }}                   
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    columns={this.columns}
                    onChange={(pagination) => common.handleTableChange(this, pagination)}/>;
    }
}

// 报名名单
class SignList extends Component {
    constructor(props) {
        super(props);
        this.state = {            
            opObj: {},// 报名名单权限            
            keyword: {// 获取报名名单列表所需关键词
                name: '',
                startTime: "",
                endTime: "",
            },
            startValue: null,
            endValue: null,
            flag_add: false
        };            
    };

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
        this.setState({opObj: JSON.parse(this.props.match.params.opObj)});
    };

    // 搜索姓名设置
    search = (type, value) => {
        this.setState({
            keyword: {
                name: value,
                startTime: this.state.keyword.startTime,
                endTime: this.state.keyword.endTime,
            }
        });
    };  
    
    // 设置开始时间
    setStartTime = (date, dateString) => {
        this.setState({
            startValue: date,
            keyword: {
                name: this.state.keyword.name,
                startTime: dateString,
                endTime: this.state.keyword.endTime,
            }
        })
    };
    
    // 设置结束时间
    setEndTime = (date, dateString) => {
        this.setState({
            endValue: date,
            keyword: {
                name: this.state.keyword.name,
                startTime: this.state.keyword.startTime,
                endTime: dateString,
            }
        })
    };
    
    // 刷新table页面
    setFlag = () => {
        this.setState({flag_add: !this.state.flag_add});
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
            <div className="courses star">
                {
                    this.state.opObj.apply ?
                        <div>
                            <header className="clearfix">
                                {/*姓名筛选*/}
                                <Search 
                                    className="star-search"
                                    placeholder="请输入姓名"
                                    onSearch={(value) => this.search(value)}
                                    enterButton/>                                
                                {/*报名名单创建日期筛选*/}
                                <span>日期筛选： </span>
                                <DatePicker 
                                    placeholder="请选择开始日期"
                                    style={{width: "150px"}}
                                    disabledDate={(startValue) => common.disabledStartDate(this, startValue)}
                                    onChange={this.setStartTime}/>
                                <span style={{margin: "0 10px"}}>至</span>
                                <DatePicker 
                                    placeholder="请选择结束日期"
                                    style={{width: "150px"}}
                                    disabledDate={(endValue) => common.disabledEndDate(this, endValue)}
                                    onChange={this.setEndTime}/>
                                {/*报名名单添加按钮*/}
                                <div className="star-add-button">
                                    <ItemDownload
                                        opStatus={this.state.opObj.apply}
                                        id={this.state.opObj.id}
                                        recapture={this.setFlag}
                                        toLoginPage={() => common.toLoginPage(this)}/>
                                </div>
                            </header>
                            {/*报名名单列表*/}
                            <div className="table-box">                                
                                <DataTable
                                    opObj={this.state.opObj}
                                    keyword={this.state.keyword}                                   
                                    flag_add={this.state.flag_add}
                                    toLoginPage={() => common.toLoginPage(this)}/>
                            </div>
                        </div>
                        :
                        <p>暂无查询权限</p>                        
                }
            </div>
        )
    }
}

export default SignList;