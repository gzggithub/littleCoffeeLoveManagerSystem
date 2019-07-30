import React, {Component} from 'react';
import {
    Table,
    Input,
    DatePicker,
    Popconfirm,
    message,
    Form,
    Row,
    Col,
    Modal,
    Button,
    Icon,
    Upload
} from 'antd';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';
import { configUrl, getToken, coffeeList, deleteCoffee, updateCoffee, coffeeDetail, sortCoffee, viewNum } from '../../config';
import { getPower, pagination } from '../../config/common';

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

    toggleEdit = (valuess) => {
        console.log(valuess);
        const editing = !this.state.editing;
        this.setState({ editing }, () => {
            if (editing) {
                this.input.focus();
            }
        });
    }

    sort = (props1, e, dataIndex) => {
        const { record, handleSort, setViewNum } = this.props;
        this.form.validateFields((error, values) => {
            if (error && error[e.currentTarget.id]) {
                return;
            }
            this.toggleEdit();
            // 判断排序值是否改变，不变就不用排序，只有改变才请求sort接口
            
            if (dataIndex === 'sort') {
                if (props1 !== Number(values.sort)) {
                    handleSort({ ...record, ...values });
                }
            } else {
                if (props1 !== Number(values.operateNum)) {
                    setViewNum({ ...record, ...values });
                }
            }
        });
    }

    render() {
        const { editing } = this.state;
        const { editable, dataIndex, title, record, index, handleSort, setViewNum, ...restProps } = this.props;
        return (
        <td {...restProps}>
            {editable ? (
            <EditableContext.Consumer>
                {(form) => {
                    this.form = form;
                    return (
                        editing ? (
                        <FormItem style={{ margin: 0 }}>
                            {form.getFieldDecorator(dataIndex, {
                                rules: [{
                                    required: false,                                   
                                    message: "只能输入数字",                                    
                                }],                               
                                initialValue: record[dataIndex],
                                })(
                                <Input style={{textAlign: "center"}}
                                    // allowClear
                                    ref={node => (this.input = node)}                                    
                                    onPressEnter={() => this.sort(this, record[dataIndex], dataIndex)}
                                    onBlur={() => this.sort(this, record[dataIndex], dataIndex)}
                                    placeholder={dataIndex === 'sort' ? "双击设置排序" : "双击设置浏览数"}/>
                            )}
                        </FormItem>
                        ) : (
                        <div className="editable-cell-value-wrap" onClick={this.toggleEdit}>
                            <Input style={{textAlign: "center"}}
                                // allowClear
                                ref= {node => (this.input = node)}
                                value={record[dataIndex]}
                                placeholder={dataIndex === 'sort' ? "双击设置排序" : "双击设置浏览数"}
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

// 编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, reqwestUploadToken, picList, viewPic, picUpload, setPicList, photoLoading, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 已上传图片列表
        const photoExist = [];
        if (picList.length) {
            console.log(picList)
            picList.forEach((item, index) => {
                photoExist.push(
                    <div className="photoExist-item clearfix" key={index + 1}>
                        <img src={item.resource} alt=""/>
                        <div className="remove">
                            <Button type="dashed" shape="circle" icon="minus" onClick={() => setPicList(index)}/>
                        </div>
                    </div>
                )
            });
        }

        // 图片处理
        const beforeUpload = (file) => {
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

        //  生活照
        const picHandleChange = (info) => {
            setTimeout(() => {// 渲染的问题，加个定时器延迟半秒
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
                title="编辑"
                width={1000}
                onCancel={onCancel}
                footer={[
                    <Button key="back" onClick={onCancel} disabled={confirmLoading}>取消</Button>,
                    <Button key="submit" type="primary" loading={confirmLoading} onClick={() => onCreate(2)}>确定</Button>
                ]}
                maskClosable={false}
                destroyOnClose={true}>
                <div className="course-add course-form item-form quality-course-form star-manage-form coffee-form">
                    <Form layout="vertical">
                        <h4 className="add-form-title-h4">基础信息</h4>
                        <FormItem className="content" label="内容：">
                            {getFieldDecorator('content', {
                                initialValue: data.content,
                                rules: [{
                                    required: true,
                                    message: '不能为空',
                                }],
                            })(
                                <TextArea
                                    style={{resize: "none"}}                                    
                                    placeholder="请填写内容"
                                    autosize={{minRows: 5, maxRows: 10}}/>                                
                            )}
                        </FormItem>                        
                        <div className="ant-line"></div>
                        <FormItem className="photo"  label="图片">
                            {getFieldDecorator('photo', {
                                initialValue: viewPic,
                                rules: [{
                                    required: true,
                                    message: '明星图片不能为空',
                                }],
                            })( 
                                <div className="itemBox">
                                    {photoExist}
                                    <Upload
                                        name="file"
                                        multiple                                        
                                        listType="picture-card"
                                        accept="image/*"
                                        showUploadList={false}
                                        beforeUpload={beforeUpload}
                                        customRequest={picHandleChange}>
                                        {uploadButton}
                                        {/*<p className="hint">（可上传1-9张图片）</p>*/}
                                    </Upload>
                                </div>                       
                            )}
                        </FormItem>                     
                    </Form>
                </div>
            </Modal>
        )
    }
);

// 编辑组件
class ItemEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            // 明星基本信息
            data: {},
            uploadToken: '',
            viewPic: '',
            picList: [],
            photoLoading: false,
            // 提交按钮状态变量
            loading: false,                  
        };
        // this.editor = ""
    }

    // 获取明星基本信息
    getData = () => {
        coffeeDetail({id: this.props.id}).then((json) => {
             if (json.data.result === 0) {
                // 已有所属分类写入                    
                // json.data.data.typeId = json.data.data.excellentCourseType.typeId;                
                // 富文本数据写入
                // this.editor.setData(json.data.data.characteristic);
                // 信息写入
                console.log(json.data.data.resourceList)
                this.setState({
                    data: json.data.data,
                    viewPic: json.data.data.resourceList[0].resource,
                    picList: json.data.data.resourceList
                });
            } else {
                this.props.exceptHandle(json.data);
                this.setState({loading: false});              
            }
        }).catch((err) => {this.errorHandle(err);});
    };

    showModal = () => {
        this.getData();       
        this.setState({visible: true});      
        // setTimeout(()=> {
        //    this.editor = window.CKEDITOR.replace(document.getElementById('content'));                      
        // });
    };

    // 图片处理    
    reqwestUploadToken = () => { // 请求上传凭证，需要后端提供接口
        getToken().then((json) => {
            if (json.data.result === 0) {
                    this.setState({
                        uploadToken: json.data.data,
                    })
                } else {
                    this.props.exceptHandle(json.data);
                }
        }).catch((err) => {
            message.error("发送失败");
        });
    };

    // 图片上传
    picUpload = (para) => {
        const _this = this;
        this.setState({photoLoading: true});
        const file = para;
        const key = UUID.create().toString().replace(/-/g, "");
        const token = this.state.uploadToken;
        const config = {region: qiniu.region.z0};
        const observer = {
            next (res) {console.log(res)},
            error (err) {
                console.log(err)
                message.error(err.message ? err.message : "图片提交失败");
                _this.setState({photoLoading03: false})
            }, 
            complete (res) {
                console.log(res);
                message.success("图片提交成功");
                let {picList} = _this.state; // 此行不加只能添加一张
                picList.push({resource: configUrl.photoUrl + res.key, type: 0});
                _this.setState({
                    picList: picList,
                    viewPic: configUrl.photoUrl + res.key || "",           
                    photoLoading: false,
                })
            }
        }
        const observable = qiniu.upload(file, key, token, config);
        observable.subscribe(observer); // 上传开始        
    };

    setPicList = (index) => {
        let data = this.state.picList;
        data.splice(index, 1);
        this.setState({
            picList: data
        });
    };

    // 取消处理
    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false
        }, () => {
            this.setState({
                data: {},
                uploadToken: '',
                viewPic: '',
                picList: [],
                photoLoading: false,                                   
                loading: false,
            });
            this.editor = ""
            form.resetFields();
        });
    };

    // 确认处理
    handleCreate = () => {
        const form = this.form;        
        form.validateFieldsAndScroll((err, values) => {// 获取表单数据并进行必填项校验
            if (err) {return;}
            let { picList } = this.state;
            let tempPicList = [];// 生活照校验与写入
            if (picList.length) {
                picList.forEach((item, index) => {
                    tempPicList.push({
                        resource: item.resource.slice(configUrl.photoUrl.length)
                    });
                });               
            } else {
                message.error("生活照未选择");
                return false;
            }
            const result = {
                id: this.props.id,                
                content: values.content,
                resourceList: tempPicList
            };
            this.setState({loading: true});
            updateCoffee(result).then((json) => {
                if (json.data.result === 0) {
                    message.success("编辑成功");
                    this.handleCancel();
                    this.props.recapture();                            
                } else {
                    this.exceptHandle(json.data);
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
    errorHandle = (err) => {
        message.error(err.message);
        this.setState({loading: false});
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
                    reqwestUploadToken={this.reqwestUploadToken}
                    viewPic={this.state.viewPic}
                    picList={this.state.picList}
                    picUpload={this.picUpload}
                    setPicList={this.setPicList}
                    photoLoading={this.state.photoLoading}                    
                    confirmLoading={this.state.loading}/>                
            </a>
        );
    }
}

// 详情表单
const ItemDetailsForm = Form.create()(
    (props) => {
        const {visible, onCancel, form, data, resourceList, confirmLoading} = props;
        const {getFieldDecorator} = form;

        let imgList = [];
        if (resourceList.length) {
            resourceList.forEach((item, index) => {
                imgList.push(
                    <Col span={6} key={index + 1}>
                        <img src={item.resource} style={{width: "100%"}} alt=""/>
                        {/*<div className="photoExist-item clearfix" key={index + 1}>
                            <img src={item} alt=""/>                            
                        </div>*/}
                    </Col>
                )
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
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem className="characteristic" label="内容：">
                                    {getFieldDecorator('characteristic', {
                                        initialValue: data.content,
                                        rules: [{
                                            required: true,
                                            message: '内容不能为空',
                                        }],
                                    })(                                        
                                        <div className="courseDescription" style={{border: "1px solid #e5e3e0",padding: "10px"}} dangerouslySetInnerHTML={{__html: data.content}}></div>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>                        
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">图片</h4>
                        <Row gutter={24}>
                            {imgList}
                        </Row>
                        <div className="ant-line"></div>
                        <div className="ant-line"></div>
                    </Form>
                </div>
            </Modal>
        );
    }
);

// 详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        loading: true,
        data: "",
        resourceList: []
    };

    // 获取基本信息
    getData = () => {
        coffeeDetail({id: this.props.id}).then((json) => {
             if (json.data.result === 0) {
                this.setState({
                    loading: false,
                    data: json.data.data,
                    resourceList: json.data.data.resourceList
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
            loading: true,           
            data: "",
            resourceList: []
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
    errorHandle = (err) => {
        message.error(err.message);
        this.setState({loading: false});
    };

    render() {
        return (           
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>详情</span>
                <ItemDetailsForm 
                    ref={this.saveFormRef}
                    visible={this.state.visible}                                       
                    data={this.state.data}
                    resourceList={this.state.resourceList}
                    onCancel={this.handleCancel}/>
            </a>
        );
    }
}

//评价列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            pagination: pagination
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: 70,
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '排序',
                dataIndex: 'sort',
                width: 130,
                editable: true,
            },
            {
                title: '发帖人',
                dataIndex: 'nickname',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'nickname'),
            },         
            {
                title: '内容',
                dataIndex: 'content',
                className: 'operating',
                render: (text, record) => this.renderColumns(text, record, 'content'),
            },
            {
                title: '用户浏览数',
                dataIndex: 'viewNum',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'viewNum'),
            },
            {
                title: '运营浏览数',
                dataIndex: 'operateNum',
                width: 150,
                editable: true,
            },
            {
                title: '发帖时间',
                dataIndex: 'createTime',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                width: 200,
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
                            {/*删除*/}
                            <Popconfirm 
                                title="确认删除?"
                                placement="topRight"
                                onConfirm={() => this.itemDelete(record.id)}
                                onCancel=""
                                okType="danger"
                                okText="立即删除"
                                cancelText="取消">
                                <a style={{display: this.props.opObj.delete ? "inline" : "none"}}>删除</a>
                            </Popconfirm>
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

    dataHandle = (data) => {
        const result = [];
        data.forEach((item, index) => {                   
            result.push({
                key: index.toString(),
                id: item.id,
                index: index + 1,
                sort: item.sort ? item.sort : '',
                nickname: item.appUserId,
                content: item.content ? (item.content.length > 20 ? item.content.slice(0, 20) + '...' : item.content) : '',
                viewNum: item.visitorNum,
                operateNum: item.fakeVisitorNum ? item.fakeVisitorNum : '',
                createTime: item.createTime                        
            });
        });
        return result;
    };

    //获取本页信息
    getData = (keyword) => {
        this.setState({loading: true});
        const params = {            
            content: keyword ? keyword.content : this.props.keyword.content,// 评价内容
            beginTime: keyword ? keyword.startTime : this.props.keyword.startTime,
            endTime: keyword ? keyword.endTime : this.props.keyword.endTime,
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize,
        };
        coffeeList(params).then((json) => {
            if (json.data.result === 0) {
                console.log(555);
                if (json.data.data.list.length === 0 && this.state.pagination.current !== 1) {
                    console.log(6666);
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
                this.exceptHandle(json.data);
            }
        }).catch((err) => {this.errorHandle(err);});
    };

    // 设置排序
    handleSort = (row) => {
        this.setState({loading: true});
        sortCoffee({
            id: row.id,// 广告Id
            sort: Number(row.sort),// 排序
        }).then((json) => {
            if (json.data.result === 0) {
                this.setState({loading: false});
                this.getData(); //刷新数据
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {this.errorHandle(err);});
    };

    // 设置浏览数
    setViewNum = (row) => {
        this.setState({loading: true});
        viewNum({
            id: row.id,
            num: Number(row.operateNum),// 浏览数
        }).then((json) => {
            if (json.data.result === 0) {
                this.setState({loading: false});
                this.getData(); //刷新数据
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {this.errorHandle(err);});
    };

    //删除
    itemDelete = (id) => {
        this.setState({loading: true});
        deleteCoffee({id: id}).then((json) => {
            if (json.data.result === 0) {
                message.success("删除成功");
                this.getData(this.props.keyword);
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {this.errorHandle(err);});
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
            this.setState({loading: false});
        }
    };

    errorHandle = (err) => {
        message.error(err.message);
        this.setState({loading: false});
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
                cell: EditableCell
            }
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
                    setViewNum: this.setViewNum
                })
            };
        });
        return <Table 
                    bordered
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    components={components}
                    columns={columns}
                    scroll={{ x: 1500 }}
                    onChange={this.handleTableChange}/>;
    }
}

class CoffeeCircle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},            
            keyword: {// 获取评价列表所需关键词
                content: "",                
                startTime: null,// 初始化开始日期和结束日期
                endTime: null,
            },
            flag_add: false,            
            startValue: null,// 日期禁选控制
            endValue: null,
        };        
    }

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
        this.setState({opObj: getPower(this).data});
    };

    // 名称关键词设置
    setName = (value) => {
        this.setState({
            keyword: {
                content: value,
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
                content: this.state.keyword.content,
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
                content: this.state.keyword.content,
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
        this.setState({flag_add: !this.state.flag_add});
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
        console.log(this.state.opObj)
        return (
            <div className="institutions coffee-circle">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix" style={{height: "50px", lineHeight: "50px", background: "#FFF"}}>                               
                                {/*筛选*/}
                                <Search
                                    placeholder="请输入内容"
                                    onSearch={this.setName}
                                    enterButton
                                    style={{width: "240px", float: "left", margin: "10px 20px 0 0"}}/>
                                {/*日期筛选*/}
                                <span>日期筛选： </span>
                                <DatePicker 
                                    onChange={this.setStartTime}
                                    disabledDate={this.disabledStartDate}
                                    style={{width: "150px"}}
                                    placeholder="请选择开始日期"/>
                                <span style={{margin: "0 10px"}}>至</span>
                                <DatePicker 
                                    onChange={this.setEndTime}
                                    disabledDate={this.disabledEndDate}                                    
                                    style={{width: "150px"}}                                    
                                    placeholder="请选择结束日期"/>                               
                            </header>
                            {/*列表*/}
                            <div className="table-box" style={{background: "#FFF"}}>
                                <DataTable
                                    keyword={this.state.keyword}
                                    opObj={this.state.opObj}                                   
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

export default CoffeeCircle;