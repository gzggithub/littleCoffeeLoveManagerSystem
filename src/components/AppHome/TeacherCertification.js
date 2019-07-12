import React, {Component} from 'react';
import {
    Table,
    Input,
    DatePicker,
    Modal,
    Form,
    Upload,
    Row,
    Col,
    Icon,
    message,
    Spin,
} from 'antd';
import '../../config/config';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';
import reqwest from 'reqwest';

const Search = Input.Search;
const FormItem = Form.Item;
const {TextArea} = Input;

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
            if (props1 !== Number(values.sort)){
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
                            {form.getFieldDecorator((dataIndex === 0 ? '' : dataIndex), {
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

// 教师信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, reqwestUploadToken, viewPic, picUpload, photoLoading, checkTel, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 图片处理
        const beforeUpload = (file) => {
            console.log("file--1212121")
            const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isIMG) {
                message.error('文件类型错误');
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('文件不能大于2M');
            }         
            reqwestUploadToken(file);
            return isIMG && isLt2M;
        };
        const picHandleChange = (info) => {
            // 渲染的问题，加个定时器延迟半秒
            setTimeout(()=>{
                picUpload(info.file);
            }, 500);   
        };
        const uploadButton = (
            <div>
                <Icon type={photoLoading ? 'loading' : 'plus'}/>
                <div className="ant-upload-text" style={{display: photoLoading ? "none" : "block"}}>选择图片</div>
            </div>
        );

        return (
            <Modal
                visible={visible}
                title="教师编辑"
                width={1000}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                {
                    JSON.stringify(data) === "{}" ?
                        <div className="spin-box">
                            <Spin/>
                        </div>
                        :
                        <div className="teacher-edit teacher-form item-form teacher-certification-form">
                            <Form layout="vertical">
                                <h4 className="add-form-title-h4">基础信息</h4>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="name"  label="姓名：">
                                            {getFieldDecorator('name', {
                                                initialValue: data.name,
                                                rules: [{
                                                    required: true,
                                                    message: '姓名不能为空',
                                                }],
                                            })(
                                                <Input placeholder="请输入姓名"/>
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
                                                <Input placeholder="请输入头衔"/>
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
                                                    validator: checkTel,
                                                }],
                                            })(
                                                <Input placeholder="请输入手机号"/>
                                            )}
                                        </FormItem> 
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
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
                                            placeholder="请填写个人简介"
                                            autosize={{minRows: 3, maxRows: 10}}/>
                                    )}
                                </FormItem>                                
                                <div className="ant-line"></div>
                                <FormItem className="certification"  label="行业认证：">
                                    {getFieldDecorator('photo', {
                                        initialValue: viewPic,
                                        rules: [{
                                            required: true,
                                            message: '行业认证不能为空',
                                        }],
                                    })(
                                        <Upload
                                            name="file"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            showUploadList={false}
                                            beforeUpload={beforeUpload}
                                            customRequest={picHandleChange}
                                        >
                                            {viewPic ? <img src={viewPic} alt=""/> : uploadButton}
                                        </Upload>
                                    )}
                                </FormItem>                                
                                <div className="ant-line"></div>
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

// 教师信息编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,
        // 初始数据
        data: {},
        // 图片相关变量
        uploadToken: "",
        // 初始图片
        viewPic: "",
        photoLoading: false,       
        confirmLoading: false,        
    };

    getData = () => {
        reqwest({
            url: '/sys/excellentTeacher/detail',
            type: 'json',
            method: 'get',
            data: {
                id: this.props.id
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {},
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        data: json.data,
                        viewPic: json.data.pic,
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
        })
    };

    showModal = () => {
        this.getData();
        this.setState({visible: true});
    };

    // 手机号和座机号校验
    checkTel = (rule, value, callback) => {
        const isPhone = /^([0-9]{3,4}-)?[0-9]{7,8}$/;
        const isPhone02 = /^\d{3,4}-\d{3,4}-\d{3,4}$/; // 4001-550-520
        const isMob = /^1[0-9]{10}$/;
        const valuePhone = value.trim();
        if (isMob.test(valuePhone) || isPhone.test(valuePhone) || isPhone02.test(valuePhone)) { // 正则验证
            callback(); // 校验通过
            return true;
        } else if (valuePhone === ""){
            callback();
            return true;
        } else {
            callback('请输入正确手机号或座机电话'); // 校验不通过
            return false;
        }
    };
    
    // 请求上传凭证，需要后端提供接口
    reqwestUploadToken = (file) => {
        reqwest({
            url: '/sys/upload/getToken',
            type: 'json',
            method: 'get',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("发送失败");
            },
            success: (json) => {
                if (json.result === 0) {
                    sessionStorage.uploadToken = json.data;
                    this.setState({
                        uploadToken: json.data,
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
    
    // 图片上传
    picUpload = (para) => {
        const _this = this;
        this.setState({
            photoLoading: true,
        });

        const file = para;
        const key = UUID.create().toString().replace(/-/g, "");
        const token = this.state.uploadToken;
        const config = {
            region: qiniu.region.z0
        };
        const observer = {
            next (res) {console.log(res)},
            error (err) {
                console.log(err)
                message.error(err.message ? err.message : "图片提交失败");
                _this.setState({photoLoading: false})
            }, 
            complete (res) {
                console.log(res);
                message.success("图片提交成功");
                _this.setState({
                    viewPic: global.config.photoUrl + res.key || "",           
                    photoLoading: false,
                })
            }
        }
        const observable = qiniu.upload(file, key, token, config);
        observable.subscribe(observer); // 上传开始        
    };

    // 取消
    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false
        }, () => {
            this.setState({
                data: {},
                viewPic: "",                
                photoLoading: false,               
                confirmLoading: false
            });
            form.resetFields();
        });
    };
    
    // 修改
    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            // 行业认证图片写入
            if (this.state.viewPic) {
                values.photo = this.state.viewPic.slice(global.config.photoUrl.length);
            } else {
                message.error("图片未选择");
                return false;
            }
            const result = {
                id: this.props.id,
                name: values.name,
                title: values.title,
                appUserPhone: values.telephone,
                description: values.description,
                pic: values.photo,
            };
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/sys/excellentTeacher/update',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: result,
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({confirmLoading: false});
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("教师信息修改成功");
                        this.handleCancel();                        
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
            })
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={() => this.showModal()}>编辑</span>
                <ItemEditForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    data={this.state.data}
                    checkTel={this.checkTel}
                    reqwestUploadToken={this.reqwestUploadToken}
                    viewPic={this.state.viewPic}
                    picUpload={this.picUpload}
                    photoLoading={this.state.photoLoading}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

// 教师详情表单组件
const ItemDetailsForm = Form.create()(
    (props) => {
        const {visible, onCancel, form, data} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="教师详情"
                width={1000}
                onCancel={onCancel}
                footer={null}
                destroyOnClose={true}>
                <div className="institutionCheck-form famous-teacher-check-form">
                    <Form layout="vertical">
                        <h4 className="add-form-title-h4">基础信息</h4>
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
                        <div className="ant-line"></div>
                        <div className="ant-line"></div>
                    </Form>
                </div>
            </Modal>
        );
    }
);

// 教师详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        data: "",
    };
    
    // 获取基本信息
    getData = () => {
        reqwest({
            url: '/sys/excellentTeacher/detail',
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
                this.setState({loading: false});
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
                        this.setState({loading: false});
                    }
                }
            }
        });
    };

    showModal = () => {
        this.getData();
        this.setState({visible: true});
    };
    
    // 取消
    handleCancel = () => {
        this.setState({
            visible: false,
            data: ""
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>详情</span>
                <ItemDetailsForm 
                    ref={this.saveFormRef}
                    visible={this.state.visible}                                       
                    data={this.state.data}
                    onCancel={this.handleCancel}/>
            </a>
        );
    }
}

// 教师列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            ghost: false,
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
                title: "序号",
                dataIndex: "index",
                width: 70,
                render: (text, record) => this.renderColumns(text, record, "index"),
            },
            {
                title: "排序",
                dataIndex: "sort",
                width: '10%',
                editable: true,                    
            },
            {
                title: '姓名',
                dataIndex: 'teacherName',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'teacherName'),
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
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'title'),
            },
            {
                title: '个人作品数',
                dataIndex: 'personalWorksNums',
                width: '10%',                    
                filterMultiple: false,
                render: (text, record) => this.renderColumns(text, record, 'personalWorksNums'),
            },
            {
                title: '手机号',
                dataIndex: 'telephone',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'telephone'),
            },
            {
                title: '申请日期',
                dataIndex: 'createTime',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*详情*/}
                            <ItemDetails 
                                id={record.id}
                                opStatus={this.props.opObj.select}
                                toLoginPage={this.props.toLoginPage}/>
                            {/*编辑*/}
                            <ItemEdit 
                                id={record.id} 
                                recapture={this.getData}
                                opStatus={this.props.opObj.modify}
                                toLoginPage={this.props.toLoginPage}/>                                
                        </div>
                    );
                },
            }
        ]
    }    

    //列渲染
    renderColumns(text) {return (<Cell value={text}/>);}

    //获取本页信息
    getData = (keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/excellentTeacher/list',
            type: 'json',
            method: 'get',
            data: {     
                name: keyword ? keyword.teacherName : this.props.keyword.teacherName,
                startTime: keyword ? keyword.startTime : this.props.keyword.startTime,
                endTime: keyword ? keyword.endTime : this.props.keyword.endTime,
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
                    if (json.data.length === 0 && this.state.pagination.current !== 1) {
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
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            sort: item.sort === 0 ? '' : item.sort,
                            teacherName: item.name,
                            nickName: item.appUserNickname,
                            title: item.title,
                            personalWorksNums: item.personalWorksNums,
                            telephone: item.appUserPhone,
                            createTime: item.createTime,
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
        if (filters.status) {
            this.props.keyword.status = filters.status[0];
        }
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.teacherPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.teacherPageSize);
        this.setState({
            pagination: pager,
        }, () => {
            this.getData();
        });
    };

    // 设置排序
    handleSort = (row) => {
        this.setState({loading: true});
        reqwest({
            url: '/sys/excellentTeacher/updateSort',
            type: 'json',
            method: 'post',
            data: {                
                id: row.id,// 教师Id                
                sort: Number(row.sort),// 排序
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({loading: false});
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({loading: false});
                    this.getData();
                } else {
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
                }
            }
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

// 名师认证
class TeacherCertification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 权限
            opObj: {},
            // 获取教师列表所需关键词
            keyword: {
                teacherName: "",
                startTime: "",
                endTime: "",
            },
            startValue: null,
            endValue: null,
            flag_add: false,
        };
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
    
    // 设置教师姓名
    search = (type, value) => {
        this.setState({
            keyword: {
                teacherName: value,
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
                teacherName: this.state.keyword.teacherName,
                startTime: dateString,
                endTime: this.state.keyword.endTime,
            }
        });
    };

    // 设置结束时间
    setEndTime = (date, dateString) => {
        this.setState({
            endValue: date,
            keyword: {
                teacherName: this.state.keyword.teacherName,
                startTime: this.state.keyword.startTime,
                endTime: dateString,
            }
        });
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
        });
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
        console.log(nextProps)
        if (nextProps.location.search) {
            console.log(nextProps.location.pathname);
            this.props.history.push(nextProps.location.pathname);
            this.setFlag();
        }
    }

    render() {
        return (
            <div className="teachers">
                {
                    // this.state.opObj.select ?
                        <div>
                            <header className="clearfix" style={{position: "relative",marginBottom: "20px"}}>
                                <div>                                        
                                    <Search 
                                        placeholder="请输入教师姓名"
                                        onSearch={(value) => this.search(1, value)}
                                        enterButton
                                        style={{
                                            display: "block",
                                            width: "200px",
                                            float: "left",
                                            marginRight: "20px"
                                        }}
                                    />
                                    {/*教师创建日期筛选*/}
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
                                </div>
                            </header>
                            <div className="table-box">
                                <DataTable 
                                    opObj={this.state.opObj}
                                    keyword={this.state.keyword}
                                    orgId={this.state.eId}
                                    flag_add={this.state.flag_add} 
                                    toLoginPage={this.toLoginPage}
                                    />
                            </div>
                        </div>  
                        // :
                        // <p>暂无查询权限</p>
                }
            </div>
        )
    }
}

export default TeacherCertification;