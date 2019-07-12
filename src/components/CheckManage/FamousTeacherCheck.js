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
    List,
    Spin,
    DatePicker,
} from 'antd';
import '../../config/config';
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

// 名师认证审核表单
const ItemCheckForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, confirmLoading} = props;
        const {getFieldDecorator} = form;

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
                <div className="institutionCheck-form famous-teacher-check-form">
                    <Form layout="vertical">
                        <h4 className="add-form-title-h4">名师认证申请信息</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="name"  label="姓名：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.name,
                                        rules: [{
                                            required: true,
                                            message: '机构名称不能为空',
                                        }],
                                    })(
                                        <Input disabled placeholder="请输入姓名"/>
                                    )}
                                </FormItem>                                
                            </Col>
                            <Col span={8}>
                                <FormItem className="title"  label="头衔：">
                                    {getFieldDecorator('title', {
                                        initialValue: data.title,
                                        rules: [{
                                            required: true,
                                            message: '头衔不能为空',
                                        }],
                                    })(
                                        <Input disabled placeholder="请输入头衔"/>
                                    )}
                                </FormItem> 
                            </Col>
                            <Col span={8}>
                                <FormItem className="telephone"  label="手机号：">
                                    {getFieldDecorator('telephone', {
                                        initialValue: data.appUserPhone,
                                        rules: [{
                                            required: true,
                                            message: '手机号不能为空',
                                        }],
                                    })(
                                        <Input disabled placeholder="请输入手机号"/>
                                    )}
                                </FormItem> 
                            </Col>
                            <Col span={24}>
                                <FormItem className="description"  label="个人简介：">
                                    {getFieldDecorator('description', {
                                        initialValue: data.description,
                                        rules: [{
                                            required: true,
                                            message: '个人简介不能为空',
                                        }],
                                    })(
                                        <TextArea 
                                            style={{resize: "none"}} 
                                            disabled
                                            placeholder="请填写个人简介"
                                            autosize={{minRows: 3, maxRows: 10}}/>
                                    )}
                                </FormItem> 
                            </Col>
                            <Col span={24}>
                                <FormItem className="certification"  label="行业认证：">
                                    {getFieldDecorator('certification', {
                                        initialValue: data.pic,
                                        rules: [{
                                            required: true,
                                            message: '行业认证不能为空',
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
                        <h4 className="add-form-title-h4">审核结果</h4>
                        <FormItem className="checkStatus">
                            {getFieldDecorator('checkStatus', {
                                initialValue: 5,
                                rules: [{
                                    required: true,
                                    message: "审核结果不能为空"
                                }],
                            })(
                                <RadioGroup buttonStyle="solid">
                                    <Radio.Button value={5} style={{marginRight: "20px", borderRadius: "4px"}}>通过</Radio.Button>
                                    <Radio.Button value={3} style={{marginRight: "20px", borderRadius: "4px"}}>驳回</Radio.Button>
                                    <Radio.Button value={4} style={{marginRight: "20px", borderRadius: "4px"}}>不通过</Radio.Button>
                                </RadioGroup>
                            )}
                        </FormItem>                        
                        <FormItem className="opinion" label="不通过/驳回原因：">
                            {getFieldDecorator('opinion', {
                                rules: [{
                                    required: false,
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

// 名师认证审核组件
class ItemCheck extends Component {
    state = {
        data: {},
        visible: false,
        confirmLoading: false,
    };

    showModal = () => {
        this.getData();
        this.setState({
            visible: true,
        });
    };

    // 获取本页信息
    getData = () => {
        reqwest({
            url: '/sys/excellentTeacher/checkDetail',
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
                    this.setState({
                        data: json.data
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

    handleCancel = () => {
        const form = this.form;
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

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            if (values.checkStatus === 3 && values.checkStatus === 4 && !values.opinion) {
                message.error("驳回意见不能为空");
                return
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/sys/excellentTeacher/check',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    id: this.props.id,
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
                        message.success("名师认证审核成功");
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
                            this.props.toLoginPage();
                        } else if (json.code === 902) {
                            message.error("登录信息已过期，请重新登录");
                            this.props.toLoginPage();
                        } else {
                            message.error(json.message);
                            this.setState({
                                confirmLoading: false
                            });
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
                    data={this.state.data}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}                    
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

// 名师认证审详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        data: "",
        loading: true
    };

    getData = () => {
        reqwest({
            url: '/sys/excellentTeacher/checkDetail',
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
                    this.setState({
                        loading: false,
                        data: json.data,                       
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

    showModal = () => {
        this.getData();
        this.setState({visible: true})
    };

    handleCancel = () => {
        this.setState({visible: false});
    };

    render() {
        let dataSource;
        if (this.state.data) {
            dataSource = [
                <div className="name">
                    <span className="item-name">机构名称：</span>
                    <span className="item-content">{this.state.data.name}</span>
                </div>,                
                <div className="logo">
                    <span className="item-name">LOGO：</span>
                    {this.state.data.icon ? <img src={this.state.data.icon} alt=""
                                                 className="item-content"/> : "暂无"}
                </div>,
                <div className="typeName">
                    <span className="item-name">机构类型一：</span>
                    <span className="item-content">{this.state.data.typeName}</span>
                </div>,
                <div className="typeName">
                    <span className="item-name">机构类型二：</span>
                    <span className="item-content">{this.state.data.typeNameTwo || "暂无"}</span>
                </div>,
                <div className="typeName">
                    <span className="item-name">机构类型三：</span>
                    <span className="item-content">{this.state.data.typeNameThree || "暂无"}</span>
                </div>,
                <div className="managerName">
                    <span className="item-name">管理员：</span>
                    <span className="item-content">{this.state.data.managerName}</span>
                </div>,
                <div className="managerPhone">
                    <span className="item-name">联系电话：</span>
                    <span className="item-content">{this.state.data.managerPhone}</span>
                </div>,
                <div className="description">
                    <span className="item-name">机构简介：</span>
                    <pre>
                    <span className="item-content">{this.state.data.description || "暂无"}</span>
                </pre>
                </div>,
                <div className="photo">
                    <span className="item-name">图片一：</span>
                    <img src={this.state.data.photo} alt="" className="item-content"/>
                </div>,
                <div className="photo">
                    <span className="item-name">图片二：</span>
                    {
                        this.state.data.photo2 && this.state.data.photo2 !== "0" ?
                            <img src={this.state.data.photo2} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="photo">
                    <span className="item-name">图片三：</span>
                    {
                        this.state.data.photo3 && this.state.data.photo3 !== "0" ?
                            <img src={this.state.data.photo3} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="photo">
                    <span className="item-name">图片四：</span>
                    {
                        this.state.data.photo4 && this.state.data.photo4 !== "0" ?
                            <img src={this.state.data.photo4} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="photo">
                    <span className="item-name">图片五：</span>
                    {
                        this.state.data.photo5 && this.state.data.photo5 !== "0" ?
                            <img src={this.state.data.photo5} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="province">
                    <span className="item-name">所在省：</span>
                    <span className="item-content">{this.state.data.provinceName}</span>
                </div>,
                <div className="city">
                    <span className="item-name">所在市：</span>
                    <span className="item-content">{this.state.data.cityName}</span>
                </div>,
                <div className="district">
                    <span className="item-name">所在地区：</span>
                    <span className="item-content">{this.state.data.areaName}</span>
                </div>,
                <div className="street">
                    <span className="item-name">所在街道：</span>
                    <span className="item-content">{this.state.data.street || "暂无"}</span>
                </div>,
                <div className="address">
                    <span className="item-name">机构地址：</span>
                    <span className="item-content">{this.state.data.address || "暂无"}</span>
                </div>,
                <div className="telephone">
                    <span className="item-name">机构电话：</span>
                    <span className="item-content">{this.state.data.telephone}</span>
                </div>,
                <div className="star">
                    <span className="item-name">机构星级：</span>
                    <span className="item-content">{this.state.data.star || "暂无"}</span>
                </div>,
                <div className="companyName">
                    <span className="item-name">公司名称：</span>
                    <span className="item-content">{this.state.data.companyName || "暂无"}</span>
                </div>,
                <div className="licenseNumber">
                    <span className="item-name">信用代码：</span>
                    <span className="item-content">{this.state.data.licenseNumber || "暂无"}</span>
                </div>,
                <div className="fees">
                    <span className="item-name">手续费：</span>
                    <span className="item-content">{Number(this.state.data.fees) || "暂无"}</span>
                </div>,
                <div className="additionalProtocol">
                    <span className="item-name">附加协议：</span>
                    <pre>
                        <span className="item-content">{this.state.data.additionalProtocol || "暂无"}</span>
                    </pre>
                </div>,
                <div className="mainEducation">
                    <span className="item-name">是否主机构：</span>
                    <span className="item-content">{this.state.data.mainEducation?"否":"是"}</span>
                </div>,
                <div className="createTime">
                    <span className="item-name">创建时间：</span>
                    <span
                        className="item-content">{this.state.data.createTime ? this.timeHandle(this.state.data.createTime) : ""}</span>
                </div>,
                <div className="opinion">
                    <span className="item-name">审核意见：</span>
                    <pre>
                        <span className="item-content">{this.state.data.opinion || "暂无"}</span>
                    </pre>
                </div>,
                <div className="remark">
                    <span className="item-name">备注信息：</span>
                    <pre>
                        <span className="item-content">{this.state.data.remark || "暂无"}</span>
                    </pre>
                </div>
            ];
        } else {
            dataSource = ""
        }
        return (
            <a style={{display: this.props.status ? "inline" : "none"}}>
                <span onClick={this.showModal}>详情</span>
                <Modal
                    title="名师认证详情"
                    width={600}
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                    destroyOnClose={true}
                >
                    <div className="institution-details item-details">
                        <div className="institution-baseData">
                            <List
                                size="small"
                                split="false"
                                dataSource={dataSource}
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

// 驳回意见
class ItemOpinion extends Component {
    state = {
        visible: false,
        loading: true,
        data: ""
    };

    getData = () => {
        reqwest({
            url: '/sys/excellentTeacher/getCheckOpinion',
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
                    this.setState({
                        loading: false,
                        data: json.data,
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

    showModal = () => {
        this.getData();
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
                    destroyOnClose={true}
                >
                    {
                        this.state.loading ?
                            <div className="spin-box">
                                <Spin/>
                            </div>
                            :
                            <div className="item-opinion" style={{minHeight: "200px"}}>
                                <p>{this.state.data || "暂无"}</p>
                            </div>
                    }
                </Modal>
            </a>
        );
    }
}

// 名师认证列表
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
                title: '姓名',
                dataIndex: 'teacherName',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'teacherName'),
            },
            {
                title: '手机号',
                dataIndex: 'telephone',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'telephone'),
            },
            {
                title: '昵称',
                dataIndex: 'nickName',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'nickName'),
            },
            {
                title: '头衔',
                dataIndex: 'title',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'title'),
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
                            {/*详情（副表状态为审核驳回，或正式表状态既非禁用也非审核通过的机构展示此项）*/}
                            <ItemDetails 
                                id={record.id}
                                toLoginPage={this.props.toLoginPage}
                                status={this.props.type === 3 && this.props.opObjDeny.select}/>
                            {/*驳回意见（副表状态为审核驳回的机构展示此项）*/}
                            <ItemOpinion
                                id={record.id} 
                                toLoginPage={this.props.toLoginPage}                                
                                status={this.props.type === 1 && this.props.opObjDeny.checkOpinion}/>                            
                            {/*审核（副表状态为待审核，当前登录人为超级管理员或运营人员时展示此项）*/}
                            <ItemCheck 
                                id={record.id} 
                                record={record}
                                recapture={this.getData} 
                                toLoginPage={this.props.toLoginPage}                               
                                status={this.props.type === 0 && this.props.opObjReady.checkExcellectTeacher}/>                            
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
            url: '/sys/excellentTeacher/checkList',
            type: 'json',
            method: 'get',
            data: {
                status: type === undefined ? this.props.type : type,
                name: keyword === undefined ? this.props.keyword.teacherName : keyword.teacherName,
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
                })
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
                            teacherName: item.name,
                            nickName: item.appUserNickname,
                            title: item.title,
                            telephone: item.appUserPhone,
                            description: item.description,
                            photo: item.pic,
                            createTime: item.createTime,
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
        if (nextProps.type !== this.props.type) {
            this.getData(nextProps.type, this.props.keyword);
        }
        if (nextProps.keyword !== this.props.keyword) {
            this.getData(this.props.type, nextProps.keyword);
        }
        if (nextProps.flag_add !== this.props.flag_add) {
            this.getData();
        }
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

class ExcellectTeacherCheck extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: "0",
            keyword: {
                teacherName: '',
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
        console.log(value)
        this.setState({
            type: value
        })
    };
    
    // 名字搜索
    search = (value) => {
        this.setState({
            keyword: {
                teacherName: value,
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
                teacherName: this.state.keyword.teacherName,
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
                teacherName: this.state.keyword.teacherName,
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
                    if (fourthItem.url === "/index/check-manage/famous-teacher-check/ready") {
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
                    if (fourthItem.url === "/index/check-manage/famous-teacher-check/deny") {
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
        console.log(this.state.opObjReady);
        console.log(this.state.opObjDeny);
        return (
            <div className="institution-check">
                <header className="clearfix">
                    <Tabs defaultActiveKey={this.state.type} onChange={this.setType}>
                        <TabPane tab="待审核" key="0"/>
                        <TabPane tab="已驳回" key="1"/>
                    </Tabs>
                </header>
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
                    {/*名师认证日期筛选*/}
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

export default ExcellectTeacherCheck;