import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    Form,
    message,
    Icon,
    Upload,
    Popconfirm,
    Spin
} from 'antd';
import { configUrl, getOrgTypeList, getToken, addOrgType, deleteOrgType, getOrgTypeDetail, updateOrgType, sortOrgType } from '../../config';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';

const FormItem = Form.Item;

// 栅格设置
const formItemLayout_12 = {
    labelCol: {span: 5},
    wrapperCol: {span: 11}
};

// 单元格
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
                                    onPressEnter={this.sort.bind(this, record[dataIndex])}
                                    onBlur={this.sort.bind(this, record[dataIndex])}
                                    placeholder="双击设置排序"
                                />
                            )}
                        </FormItem>
                        ) : (
                        <div
                            className="editable-cell-value-wrap "
                            onClick={this.toggleEdit}
                        >
                            <Input style={{textAlign: "center"}}
                                // allowClear
                                ref= {node => (this.input = node)}
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

// 新增一级类型表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, reqwestUploadToken, picUpload01, viewPic, photoLoading, confirmLoading} = props;
        const {getFieldDecorator} = form;

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
            setTimeout(()=>{// 渲染的问题，加个定时器延迟
                picUpload01(info.file);
            }, 700);
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
                title="添加类型"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                maskClosable={false}
                destroyOnClose={true}
                confirmLoading={confirmLoading}>
                <div className="category-add category-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_12} label="类型名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '名称不能为空',
                                }],
                            })(
                                <Input placeholder="请输入类型名称"/>
                            )}
                        </FormItem>
                        <FormItem className="background" {...formItemLayout_12} label="背景色：">
                            {getFieldDecorator('background', {
                                rules: [{
                                    required: true,
                                    message: '颜色不能为空',
                                }],
                            })(
                                <Input type="color" placeholder="请拾取颜色"/>
                            )}
                        </FormItem>                        
                        <FormItem className="photo" {...formItemLayout_12} label="图片：">
                            {getFieldDecorator('photo', {
                                rules: [{
                                    required: true,
                                    message: '图片不能为空',
                                }],
                            })(
                                <Upload
                                    name="file"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    showUploadList={false}
                                    beforeUpload={beforeUpload}
                                    customRequest={picHandleChange}>
                                    {viewPic ? <img src={viewPic} alt=""/> : uploadButton}
                                </Upload>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

// 新增一级类型组件
class ItemAdd extends Component {
    constructor(props) {
        super(props);    
          this.state = {
            visible: false,
            viewPic: "",            
            photoLoading: false, // 图片提交状态变量           
            loading: false
        };
    }

    showModal = () => {
        this.setState({
            visible: true
        });       
    };

    // 请求上传凭证，需要后端提供接口
    reqwestUploadToken = () => {
        getToken().then((json) => {
            if (json.data.result === 0) {
                    this.setState({
                        uploadToken: json.data.data,
                    })
                } else {
                    this.exceptHandle(json.data);
                }
        }).catch((err) => {
            message.error("发送失败");
        });
    };

    picUpload01 = (para) => {
        const _this = this;
        this.setState({photoLoading: true});
        const file = para;
        const key = UUID.create().toString().replace(/-/g,"");
        const token = this.state.uploadToken;
        const config = {region: qiniu.region.z0};
        const observer = {
            next (res) {console.log(res)},
            error (err) {
                console.log(err)
                message.error(err.message ? err.message : "图片提交失败");                
                _this.setState({photoLoading: false});
            }, 
            complete (res) {
                console.log(res);
                message.success("图片提交成功");
                _this.setState({
                    viewPic: configUrl.photoUrl + res.key || "",             
                    photoLoading: false,
                });
            }
        }
        const observable = qiniu.upload(file, key, token, config);
        observable.subscribe(observer); // 上传开始
    };

    handleCancel = () => {
        this.setState({
            visible: false,
            viewPic: "",
            photoLoading: false,
            loading: false
        });
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {return;}
            this.setState({loading: true});            
            const data = {
                name: values.name,
                icon: this.state.viewPic.slice(configUrl.photoUrl.length),
                background: values.background
            };
            addOrgType(data).then((json) => {
                if (json.data.result === 0) {
                    message.success("类型添加成功");
                    this.handleCancel();
                    this.props.setFlag();
                } else {
                    this.exceptHandle(json.data);
                }
            }).catch((err) => {
                message.error("保存失败");
                this.setState({loading: false});
            })
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

    saveFormRef = (form) => {
        this.form = form;
    };    

    render() {
        return (
            // 注释也要在一个根标签里，否则报错
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button style={{marginBottom: "10px"}} type="primary" onClick={this.showModal}>添加类型</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    reqwestUploadToken={this.reqwestUploadToken}
                    picUpload01={this.picUpload01}
                    viewPic={this.state.viewPic}
                    photoLoading={this.state.photoLoading}                    
                    confirmLoading={this.state.loading}/>                
            </div>
        );
    }
}

// 修改一级类型表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, reqwestUploadToken, picUpload01, viewPic, photoLoading, confirmLoading} = props;
        const {getFieldDecorator} = form;

        const beforeUpload = (file) => {
            const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isIMG) {
                message.error('文件类型错误');
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('文件不能大于2M');
            }
            reqwestUploadToken();
            return isIMG && isLt2M;
        };
        const picHandleChange = (info) => {
            setTimeout(() => {
                picUpload01(info.file);
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
                title="类型编辑"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                maskClosable={false}
                destroyOnClose={true}
                confirmLoading={confirmLoading}>
                {
                    JSON.stringify(data) === "{}" ?
                        <div className="spin-box">
                            <Spin/>
                        </div>
                        :
                        <div className="category-add category-form">
                            <Form layout="vertical">
                                <FormItem className="name" {...formItemLayout_12} label="类型名称：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.name,
                                        rules: [{
                                            required: true,
                                            message: '名称不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入类型名称"/>
                                    )}
                                </FormItem>
                                <FormItem className="color" {...formItemLayout_12} label="背景色：">
                                    {getFieldDecorator('background', {
                                        initialValue: data.backgroundColor,
                                        rules: [{
                                            required: true,
                                            message: '颜色不能为空',
                                        }],
                                    })(
                                        <Input type="color" placeholder="请拾取颜色"/>
                                    )}
                                </FormItem>                                
                                <FormItem className="photo" {...formItemLayout_12} label="图片：">
                                    {getFieldDecorator('photo', {
                                        initialValue: viewPic,
                                        rules: [{
                                            required: true,
                                            message: "图片不能为空"
                                        }],
                                    })(
                                        <Upload
                                            name="file"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            showUploadList={false}
                                            beforeUpload={beforeUpload}
                                            customRequest={picHandleChange}>
                                            {viewPic ? <img src={viewPic} alt=""/> : uploadButton}
                                        </Upload>
                                    )}
                                </FormItem>
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

// 修改一级类型组件
class ItemEdit extends Component {
    state = {
        visible: false,
        data: {},
        viewPic: "",
        // 图片提交按钮状态变量
        photoLoading: false,
        loading: false
    };

    getData = () => {
        getOrgTypeDetail({id: this.props.id}).then((json) => {
            if (json.data.result === 0) {
                this.setState({
                    data: json.data.data,
                    viewPic: json.data.data.photo,
                });
            }else{
                this.exceptHandle(json.data);
            }
        }).catch((err) => {
            message.error("发送失败");
        });
    };

    showModal = () => {
        this.getData();
        this.setState({visible: true});        
    };

    // 请求上传凭证，需要后端提供接口
    reqwestUploadToken = () => {
        getToken().then((json) => {
            if (json.data.result === 0) {
                this.setState({
                    uploadToken: json.data.data,
                });
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {
            message.error("发送失败");
        });
    };
    
    picUpload01 = (para) => {
        const _this = this;
        this.setState({photoLoading: true,});
        const file = para;
        const key = UUID.create().toString().replace(/-/g,"");
        const token = this.state.uploadToken;
        const config = {region: qiniu.region.z0};
        const observer = {
            next (res) {console.log(res)},
            error (err) {
                console.log(err)
                message.error(err.message ? err.message : "图片提交失败");
                _this.setState({
                    photoLoading: false,
                })
            }, 
            complete (res) {
                console.log(res);
                message.success("图片提交成功");
                _this.setState({
                    viewPic: configUrl.photoUrl + res.key || "",                               
                    photoLoading: false,
                })
            }
        }
        const observable = qiniu.upload(file, key, token, config);
        observable.subscribe(observer); // 上传开始        
    };

    handleCancel = () => {
        this.setState({
            visible: false,
        }, () => {
            this.setState({
                data: {},
                viewPic: "",               
                photoLoading: false,
                loading: false
            });
        });
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }            
            if (this.state.viewPic) {
                values.photo = this.state.viewPic.slice(configUrl.photoUrl.length);
            } else {
                message.error("图片不能为空")
                return;
            }
            const result = {
                id: this.props.id,
                name: values.name,
                background: values.background,
                icon: values.photo,                
            };            
            this.setState({loading: true});
            updateOrgType(result).then((json) => {
                if (json.data.result === 0) {
                    message.success("编辑成功");
                    this.handleCancel();
                    this.props.recapture()
                } else {
                   this.exceptHandle(json.data);
                }
            }).catch((err) => {
                message.error("保存失败");
                this.setState({loading: false});
            });
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
                    picUpload01={this.picUpload01}
                    viewPic={this.state.viewPic}
                    photoLoading={this.state.photoLoading}                    
                    confirmLoading={this.state.loading}
                />
            </a>
        );
    }
}

// 类型列表
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
            }
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: 70,
            },
            {
                title: '排序',
                dataIndex: 'sort',
                width: 130,
                editable: true,
            },
            {
                title: '分类名称',
                dataIndex: 'name',
                width: '40%',
                render: (text, record) => this.renderColumns(text, record, 'name')
            },
            // {
            //     title: '状态',
            //     dataIndex: 'status',
            //     width: '10%',
            //     render: (text, record) => this.renderColumns(text, record, 'name')
            // },
            // {
            //     title: 'Icon',
            //     dataIndex: 'photo',
            //     width: '10%',
            //     render: (text, record) => (record.photo ?
            //         <img style={{width: '30px', height: "30px"}} src={record["photo"]} alt=""/> : null)
            // },
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*一级类型编辑*/}
                            <ItemEdit 
                                id={record.id} 
                                parentId={record.parentId} 
                                recapture={this.getData}                                      
                                opStatus={this.props.opObj.modify}
                                toLoginPage={this.props.toLoginPage}/>                                               
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
                    );
                },
            }
        ];
    }

    // 列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    // 列表信息处理函数
    dataHandle = (data) => {
        let result = [];
        data.list.forEach((item, index) => {
            const temp = {
                index: index + 1,
                key: item.id,
                id: item.id,
                parentId: item.parentId,
                sort: item.sort !== 0 ? item.sort : '',                
                name: item.name,
                photo: item.photo
            };
            // if (item.list) {
            //     const tempChildren = [];
            //     const dataItem = item.list;
            //     dataItem.forEach((subItem, subIndex) => {
            //         const temp = {
            //             index: subIndex + 1,
            //             key: subItem.id,
            //             id: subItem.id,
            //             sort: subItem.sort !== 0 ? subItem.sort : '',
            //             parentId: subItem.parentId,                        
            //             name: subItem.name,
            //             photo: subItem.photo,
            //         };
            //         tempChildren.push(temp)
            //     });
            //     temp.children = tempChildren
            // }
            result.push(temp)
        });
        return result;
    };

    // 获取本页信息
    getData = () => {
        this.setState({
            loading: true
        });
        const params = {
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize,
        };
        getOrgTypeList(params)
        .then((json) => {
            if (json.data.result === 0) {
                this.setState({
                    loading: false,
                    data: this.dataHandle(json.data.data),
                    pagination: {
                        total: json.data.data.total,
                        current: this.state.pagination.current,
                        pageSize: this.state.pagination.pageSize
                    }
                });
            } else {
                this.expectHandle(json.data);
            }
        }).catch((err) => {
            message.error("获取失败");
            this.setState({loading: false});
        });
    };

    // 排序
    handleSort = (row) => {
        this.setState({loading: true});
        const data = {                
            id: row.id,// 机构Id                
            sort: Number(row.sort),// 排序
        };
        sortOrgType(data).then((json) => {
            if (json.data.result === 0) {
                this.setState({loading: false});
                this.getData(); //刷新数据
            } else {
                this.expectHandle(json.data);                
            }
        }).catch((err) => {
            message.error("发送失败");
            this.setState({loading: false});
        })
    };

    // 删除
    itemDelete = (para) => {
        this.setState({loading: true});
        deleteOrgType({id: para}).then((json) => {
            if (json.data.result === 0) {
                message.success("删除成功");
                this.getData();
            } else {
                this.expectHandle(json.data);
            }
        }).catch((err) => {
            message.error("失败");
            this.setState({loading: false});
        });
    };

    // 异常处理
    expectHandle = (data) => {
        if (data.code === 901) {
            message.error("请先登录");                        
            this.props.toLoginPage();// 返回登陆页
        } else if (data.code === 902) {
            message.error("登录信息已过期，请重新登录");                        
            this.props.toLoginPage();// 返回登陆页
        } else {
            message.error(data.message);
            this.setState({loading: false});
        }
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
                    components={components}
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    columns={columns}
                    onChange={this.handleTableChange}/>;
    }
}

class Category extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {
                add: true,                
                delete: true,
                modify: true,
                select: true,
            },
            flag_add: false
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
            <div className="category">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                {/*<span>类型列表</span>*/}
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd 
                                        opStatus={this.state.opObj.add} 
                                        setFlag={this.setFlag}
                                        toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            <div className="table-box">
                                <DataTable 
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

export default Category;