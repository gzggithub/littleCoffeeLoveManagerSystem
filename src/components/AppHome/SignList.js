import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    Form,
    Select,
    message,
    Row,
    Col,
    DatePicker,
} from 'antd';
import '../../config/config';
import { signList, signDetail, downloadSignList } from '../../config';
import reqwest from 'reqwest';

const Search = Input.Search;
const FormItem = Form.Item;
//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

// 可编辑的单元格
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends Component {
    state = {
        editing: false,
    }

    toggleEdit = () => {
        const editing = !this.state.editing;
        this.setState({ editing }, () => {
            if (editing) {
                this.input.focus();
            }
        });
    }

    sort = (props1, e) => {
        const { record, handleSort } = this.props;
        this.form.validateFields((error, values) => {
            if (error && error[e.currentTarget.id]) {
                return;
            }
            this.toggleEdit();
            // 判断排序值是否改变，不变就不用排序，只有改变才请求sort接口
            if (props1 !== Number(values.sort)) {
                handleSort({ ...record, ...values });
            } 
        });
    }

    render() {
        const { editing } = this.state;
        const { editable, dataIndex, title, record, index, handleSort, ...restProps } = this.props;
        return (
        <td {...restProps}>
            {editable ? (
            <EditableContext.Consumer>
                {(form) => {
                    this.form = form;
                    return (
                        editing ? (
                        <FormItem style={{ margin: 0 }}>
                            {form.getFieldDecorator((dataIndex), {
                                rules: [{
                                    required: false,
                                    message: "只能输入数字",
                                }],
                                initialValue: record[dataIndex],
                                })(
                                <Input style={{ textAlign: "center" }}
                                    ref={node => (this.input = node)}
                                    onPressEnter={this.sort.bind(this, record[dataIndex])}
                                    onBlur={this.sort.bind(this, record[dataIndex])}
                                    placeholder="双击设置排序"
                                />
                            )}
                        </FormItem>
                        ) : (
                        <div
                            className="editable-cell-value-wrap"
                            onClick={this.toggleEdit}
                        >
                            <Input style={{ textAlign: "center" }}
                                    ref={node => (this.input = node)}
                                    value={record[dataIndex]}
                                    placeholder="双击设置排序"
                                />
                        </div>
                        )
                    );
                }}
            </EditableContext.Consumer>
            ) : restProps.children}
        </td>
        );
    }
}

// 报名名单下载组件
class ItemDownload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            // 报名名单基本信息
            data: {},          
            // 提交按钮状态变量
            loading: false,
        };
    }

    // 获取报名名单基本信息
    getData = () => {
        downloadSignList().then((json) => {
            if (json.result === 0) {                    
                this.setState({
                    data: json.data.data                    
                });
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => this.errorHandle(err));
    };

    showModal = (props, event) => {         
        this.getData();             
        this.setState({visible: true});
    };

    // 取消处理
    handleCancel = () => {
        this.setState({
            visible: false,
            data: {},
            loading: false,
        });
    };

    // 确认处理
    handleCreate = () => {        
        this.setState({loading: true});        
        downloadSignList().then((json) => {
            if (json.data.result === 0) {
                    message.success("链接复制成功");
                    this.handleCancel();                         
                } else {
                    message.error(json.message);                   
                    this.setState({loading: false});
                }
        }).catch((err) => this.errorHandle(err));
    };

    saveFormRef = (form) => {
        this.form = form;
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
                        <div>http：//www.taoerxue.com/tonggao1</div>
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
        const {visible, onCancel, form, data, videoList, confirmLoading} = props;
        const {getFieldDecorator} = form;

        const tempVideoList = [];
        if (videoList.length) {
            videoList.forEach((item, index) => {
                tempVideoList.push(
                    <Col span={8} key={index+1}>
                        <div className="video">
                            {/*<div className="chapter">第{item.sort}节</div>*/}
                            <div className="videoSource">                                
                                <div className="videoSrc">
                                    <video controls="controls" width="100%">
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
                title="详情"
                width={1000}
                onCancel={onCancel}
                footer={null}
                maskClosable={false}
                destroyOnClose={true}
                confirmLoading={confirmLoading}>
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
                                        <Select disabled>
                                            <options key={0}>女</options>
                                            <options key={1}>男</options>                                            
                                        </Select>
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
                                        initialValue: data.address,
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
                                <FormItem className="telephone" label="联系方式：">
                                    {getFieldDecorator('telephone', {
                                        initialValue: data.telephone,
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
                                        initialValue: data.pic,
                                        rules: [{
                                            required: true,
                                            message: '头像不能为空',
                                        }],
                                    })(
                                        <div className="coursePhoto">                                            
                                            <img src={data.pic} alt=""/>
                                        </div>
                                    )}
                                </FormItem> 
                            </Col>
                        </Row>
                        <h4 className="add-form-title-h4">个人简介</h4>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem className="characteristic" label="个人简介：">
                                    {getFieldDecorator('characteristic', {
                                        initialValue: data.characteristic,
                                        rules: [{
                                            required: true,
                                            message: '个人简介不能为空',
                                        }],
                                    })(                                        
                                        <div className="courseDescription" style={{border: "1px solid #e5e3e0",padding: "10px"}} dangerouslySetInnerHTML={{__html: data.characteristic}}></div>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>                        
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">模卡</h4>
                        <Row gutter={24}>
                            <Col span={4}></Col>
                            <Col span={8}>
                                <img src={data.modelCard} style={{width: "100%"}} alt=""/>
                            </Col>                         
                        </Row>
                        <h4 className="add-form-title-h4">自我介绍视频</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <div className="video">                                   
                                    <div className="videoSource">                                
                                        <div className="videoSrc">
                                            <video controls="controls" width="100%">
                                                <source src={data.selfIntroduce} type="video/mp4" />                                                
                                            </video>
                                        </div>
                                    </div>                                    
                                </div>
                            </Col>                         
                        </Row>
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">作品视频</h4>                        
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <div className="video">                                   
                                    <div className="videoSource">                                
                                        <div className="videoSrc">
                                            <video controls="controls" width="100%">
                                                <source src={data.selfIntroduce} type="video/mp4" />                                                
                                            </video>
                                        </div>
                                    </div>                                    
                                </div>
                            </Col>
                            {tempVideoList}                           
                        </Row>                       
                    </Form>
                </div>
            </Modal>
        );
    }
);

// 报名名单详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        data: {},// 报名名单基本信息
        videoList: []
    };

    // 获取报名名单基本信息
    getData = () => {
        this.setState({loading: true});
        signDetail({id: this.props.id}).then((json) => {
            if (json.result === 0) {               
                this.setState({
                    loading: false,
                    data: json.data.data,
                });
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => this.errorHandle(err));
    };

    showModal = () => {        
        this.getData();
        this.setState({visible: true});
    };

    handleCancel = () => {
        this.setState({
            visible: false,          
            data: {},
            videoList: []
        });
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
            pagination: {
                current: 1,
                pageSize: 15,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            },
        };
        // 列配置
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
                                opStatus={this.props.opObj.select}
                                toLoginPage={this.props.toLoginPage}/>                             
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

    dataHandle = (data) => {
        const result = [];
        data.forEach((item, index) => {                        
            let tempGender = "";// 性别 女：0，男： 1
            if (item.gender === 0) {
                tempGender = "女";
            }
            if (item.source  === 1) {
                tempGender = "男";
            }
            result.push({
                key: index.toString(),
                id: item.id,
                index: index + 1,
                sort: item.sort !== 0 ? item.sort : '',
                name: item.name,
                genderCode: item.gender,
                gender: tempGender,
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
        signList({                              
            name: keyword ? keyword.name : this.props.keyword.name,
            startTime: keyword ? keyword.startTime : this.props.keyword.startTime,
            endTime: keyword ? keyword.endTime : this.props.keyword.endTime,                
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize
        }).then((json) => {
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
                })
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => this.errorHandle(err));
    };

    exceptHandle = (json) => {
        if (json.code === 901) {
            message.error("请先登录");                        
            this.props.toLoginPage();// 返回登陆页
        } else if (json.code === 902) {
            message.error("登录信息已过期，请重新登录");                        
            this.props.toLoginPage();// 返回登陆页
        } else {
            message.error(json.message);
            this.setState({loading: false})
        }
    };

    errorHandle = (err) => {
        message.error(err.message);
        this.setState({loading: false});
    };s

    // 表格参数变化处理
    handleTableChange = (pagination, filters) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.coursePageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.coursePageSize);
        this.setState({
            type: filters.type ? filters.type[0] : null,
            pagination: pager,
        }, () => {
            this.getData();
        });
    };

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
        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell,
            },
        };
        const columns = this.columns.map((col) => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSort: this.handleSort,
                }),
            };
        });
        return <Table 
                    bordered
                    scroll={{ x: 1500 }}
                    components={components}
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    columns={columns}
                    onChange={this.handleTableChange}/>;
    }
}

// 报名名单
class SignList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 报名名单权限
            opObj: {
                add: true,
                copy: true,
                select: true,
                modify: true,
                putAway: true,
            },
            // 获取报名名单列表所需关键词
            keyword: {
                name: '',
                startTime: "",
                endTime: "",
            },
            startValue: null,
            endValue: null,
            flag_add: false,
        };            
    };

    getData = () => {
        this.refs.getDataCopy.getData();
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
                subItem.children.forEach((thirdItem) => {
                    if (thirdItem.url === this.props.location.pathname) {
                        let data = {};
                        thirdItem.children.forEach((fourthItem) => {
                            data[fourthItem.url] = true;
                        });
                        this.setState({
                            opObj: data
                        })
                    }
                })
            })
        })
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
    
    // 刷新table页面
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
                    this.state.opObj.select ?
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
                                    disabledDate={this.disabledStartDate}
                                    onChange={this.setStartTime}/>
                                <span style={{margin: "0 10px"}}>至</span>
                                <DatePicker 
                                    placeholder="请选择结束日期"
                                    style={{width: "150px"}}
                                    disabledDate={this.disabledEndDate}
                                    onChange={this.setEndTime}/>
                                {/*报名名单添加按钮*/}
                                <div className="star-add-button">
                                    <ItemDownload
                                        opStatus={this.state.opObj.add}
                                        recapture={this.getData}
                                        toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            {/*报名名单列表*/}
                            <div className="table-box">                                
                                <DataTable
                                    opObj={this.state.opObj}
                                    keyword={this.state.keyword}
                                    ref="getDataCopy"
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

export default SignList;