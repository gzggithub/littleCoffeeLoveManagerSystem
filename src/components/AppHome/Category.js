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
import '../../config/config';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';
import reqwest from 'reqwest';

const FormItem = Form.Item;

//栅格设置
const formItemLayout_12 = {
    labelCol: {span: 5},
    wrapperCol: {span: 11}
};

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

//新增一级类型表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, killDefault, reqwestUploadToken, picUpload01, viewPic, photoLoading, confirmLoading} = props;
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
            // 上传的图片路径file不是blod型的
            // 渲染的问题，加个定时器延迟半秒
            setTimeout(()=>{
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
                title="添加类型"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
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
                        <FormItem className="color" {...formItemLayout_12} label="开始渐变色：">
                            {getFieldDecorator('gradientRampStar', {
                                rules: [{
                                    required: true,
                                    message: '颜色不能为空',
                                }],
                            })(
                                <Input type="color" placeholder="请拾取颜色" onPressEnter={killDefault}/>
                            )}
                        </FormItem>
                        <FormItem className="color" {...formItemLayout_12} label="结束渐变色：">
                            {getFieldDecorator('gradientRampEnd', {
                                rules: [{
                                    required: true,
                                    message: '颜色不能为空',
                                }],
                            })(
                                <Input type="color" placeholder="请拾取颜色" onPressEnter={killDefault}/>
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
                                    customRequest={picHandleChange}
                                >
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

//新增一级类型组件
class ItemAdd extends Component {
    constructor(props) {
        super(props);    
          this.state = {
            visible: false,
            viewPic: "",
            data_pic: "",
            // 图片提交按钮状态变量
            photoLoading: false,            
            confirmLoading: false
        };
    }

    showModal = () => {
        this.setState({
            visible: true
        });       
    };

    //图片
    fn_pic = (photoLoading, viewPic, data_pic) => {
        this.setState({
            viewPic: viewPic || "",
            data_pic: data_pic || "",
            photoLoading: photoLoading,
        });
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

    picUpload01 = (para) => {
        console.log(para);
        console.log(typeof(para))
        const _this = this;
        this.setState({
            photoLoading: true,
        });
        // if (para.name && para.type) {
            const file = para;
            const key = UUID.create().toString().replace(/-/g,"");
            const token = this.state.uploadToken;
            const config = {
                region: qiniu.region.z0
            };
            const observer = {
                next (res) {
                    console.log(res)
                },
                error (err) {
                    console.log(err)
                    message.error(err.message ? err.message : "图片提交失败");
                    // message.error("图片提交失败");
                    _this.setState({
                        photoLoading: false,
                    })
                }, 
                complete (res) {
                    console.log(res);
                    message.success("图片提交成功");
                    _this.setState({
                        viewPic: global.config.photoUrl + res.key || "",
                        data_pic: res.key || "",             
                        photoLoading: false,
                    })
                }
            }
            const observable = qiniu.upload(file, key, token, config);
            observable.subscribe(observer); // 上传开始
        // }        
    };

    handleCancel = () => {
        this.setState({
            visible: false
        }, () => {
            this.setState({
                viewPic: "",
                data_pic: "",
                photoLoading: false,
                confirmLoading: false
            });
        });
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/sys/orgType/save',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    name: values.name,
                    parentId: 0,
                    photo: this.state.data_pic,
                    gradientRampStar: values.gradientRampStar,
                    gradientRampEnd: values.gradientRampEnd,
                    sort: 0,
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("类型添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                viewPic: "",
                                data_pic: "",
                                photoLoading: false,
                                confirmLoading: false
                            });
                        });
                        this.props.setFlag();
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

    killDefault = (event) => {
        if (event.which === 13) {
            if(event.preventDefault){
                event.preventDefault();
            } else {
                event.returnValue=false;
            }
        }
        return false;
    };

    // componentDidMount() {
    //     const _this = this;
    //     window.addEventListener('keypress', function(e) {
    //         console.log(e)
    //         if (e.which === 13) {
    //             _this.handleCreate();
    //         }       
    //     })
    // }

    // componentWillUnmount() {
    //     const _this = this;
    //     window.removeEventListener('keypress', function(e) {
    //         if (e.which === 13) {
    //             _this.handleCreate();
    //         }       
    //     })
    // }

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
                    fn_pic={this.fn_pic}
                    killDefault={this.killDefault}
                    confirmLoading={this.state.confirmLoading}
                />
                {/*<div className="item">
                    <textarea id="TextArea2" cols="20" rows="2" className="ckeditor"/>
                </div>*/}
            </div>
        );
    }
}

//新增二级类型表单
const SubItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, reqwestUploadToken, picUpload01, viewPic, photoLoading, confirmLoading} = props;
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
            reqwestUploadToken(file);
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
                title="添加子类型"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="category-add category-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_12} label="子类型名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '子名称不能为空',
                                }],
                            })(
                                <Input placeholder="请输入子类型名称"/>
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
                                    customRequest={picHandleChange}                                                            
                                >
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

//新增二级类型组件
class SubItemAdd extends Component {
    state = {
        visible: false,
        viewPic: "",
        data_pic: "",
        // 图片提交按钮状态变量
        photoLoading: false,
        confirmLoading: false
    };

    showModal = () => {
        this.setState({visible: true});
        // const _this = this;
        // window.addEventListener('keypress', function(e) {
        //     if (e.which === 13) {
        //         _this.handleCreate();
        //     }
        // });
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

    picUpload01 = (para) => {
        console.log(para);
        console.log(typeof(para));
        const _this = this;
        this.setState({
            photoLoading: true,
        });
        const file = para;
        const key = UUID.create().toString().replace(/-/g,"");
        const token = this.state.uploadToken;
        const config = {
            region: qiniu.region.z0
        };
        const observer = {
            next (res) {
                console.log(res)
            },
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
                    viewPic: global.config.photoUrl + res.key || "",
                    data_pic: res.key || "",             
                    photoLoading: false,
                })
            }
        }
        const observable = qiniu.upload(file, key, token, config);
        observable.subscribe(observer); // 上传开始     
    };

    handleCancel = () => {
        this.setState({
            visible: false
        }, () => {
            this.setState({
                viewPic: "",
                data_pic: "",
                photoLoading: false,
                confirmLoading: false
            });
        });
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/sys/orgType/save',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    name: values.name,
                    parentId: this.props.id,
                    photo: this.state.data_pic,
                    sort: 0,
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("机构子类型添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                viewPic: "",
                                data_pic: "",
                                photoLoading: false,
                                confirmLoading: false
                            });
                        });
                        this.props.recapture()
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
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={() => this.showModal()}>添加子类型</span>
                <SubItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    reqwestUploadToken={this.reqwestUploadToken}
                    picUpload01={this.picUpload01}
                    viewPic={this.state.viewPic}
                    photoLoading={this.state.photoLoading}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//修改一级类型表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, killDefault, data, reqwestUploadToken, picUpload01, viewPic, photoLoading, confirmLoading} = props;
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
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
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
                                <FormItem className="color" {...formItemLayout_12} label="开始渐变色：">
                                    {getFieldDecorator('gradientRampStar', {
                                        initialValue: data.gradientRampStar,
                                        rules: [{
                                            required: true,
                                            message: '颜色不能为空',
                                        }],
                                    })(
                                        <Input type="color" placeholder="请拾取颜色" onEnterPress={killDefault}/>
                                    )}
                                </FormItem>
                                <FormItem className="color" {...formItemLayout_12} label="结束渐变色：">
                                    {getFieldDecorator('gradientRampEnd', {
                                        initialValue: data.gradientRampEnd,
                                        rules: [{
                                            required: true,
                                            message: '颜色不能为空',
                                        }],
                                    })(
                                        <Input type="color" placeholder="请拾取颜色" onEnterPress={killDefault}/>
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
                                            customRequest={picHandleChange}
                                        >
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

//修改一级类型组件
class ItemEdit extends Component {
    state = {
        visible: false,
        data: {},
        viewPic: "",
        data_pic: "",
        // 图片提交按钮状态变量
        photoLoading: false,
        confirmLoading: false
    };

    getData = () => {
        reqwest({
            url: '/sys/orgType/getById',
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
                        viewPic: json.data.photo,
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

    showModal = () => {
        this.getData();
        this.setState({visible: true});        
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
    
    picUpload01 = (para) => {
        const _this = this;
        this.setState({
            photoLoading: true,
        });
        const file = para;
        const key = UUID.create().toString().replace(/-/g,"");
        const token = this.state.uploadToken;
        const config = {
            region: qiniu.region.z0
        };
        const observer = {
            next (res) {
                console.log(res)
            },
            error (err) {
                console.log(err)
                // message.error(err.message ? err.message : "图片提交失败");
                // 此处第一次提交提示 split 没有定义
                message.error("图片提交失败");
                _this.setState({
                    photoLoading: false,
                })
            }, 
            complete (res) {
                console.log(res);
                message.success("图片提交成功");
                _this.setState({
                    viewPic: global.config.photoUrl + res.key || "",
                    data_pic: res.key || "",            
                    photoLoading: false,
                })
            }
        }
        const observable = qiniu.upload(file, key, token, config);
        observable.subscribe(observer); // 上传开始        
    };

    // 信息比对函数
    dataContrast = (values) => {
        const initValues = this.state.data;
        const itemList = ["name", "color", "photo"];
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
            return result;
        }
    };

    handleCancel = () => {
        this.setState({
            visible: false,
        }, () => {
            this.setState({
                data: {},
                viewPic: "",
                data_pic: "",
                photoLoading: false,
                confirmLoading: false
            });
        });
    };

    handleCreate = () => {
        if (JSON.stringify(this.state.data) === "{}") {
            return;
        }
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            
            if (this.state.data_pic) {
                values.photo = this.state.data_pic;
            }
            if (this.state.viewPic) {
                let iconTemp = this.state.viewPic.slice(global.config.photoUrl.length);
                values.photo = iconTemp;
            }
            // const result = this.dataContrast(values);
            const result = {
                id: this.props.id,
                parentId: 0,
                name: values.name,
                gradientRampStar: values.gradientRampStar,
                gradientRampEnd: values.gradientRampEnd,
                photo: values.photo,                
            };
            if (!result) {
                message.error("暂无信息更改，无法提交");
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/sys/orgType/update',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: result,
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("类型编辑成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                data: {},
                                viewPic: "",
                                data_pic: "",
                                photoLoading: false,
                                confirmLoading: false
                            });
                        });
                        this.props.recapture()
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

    killDefault = (event) => {
        if (event.which === 13) {
            if(event.preventDefault){
                event.preventDefault();
            } else {
                event.returnValue=false;
            }
        }
        return false;
    };

    // componentDidMount() {
    //     const _this = this;
    //     window.addEventListener('keypress', function(e) {
    //         console.log(e)
    //         if (e.which === 13) {
    //             _this.handleCreate();
    //         }
    //     });
    // }

    // componentWillUnmount() {
    //     const _this = this;
    //     window.removeEventListener('keypress', function(e) {
    //         if (e.which === 13) {
    //             _this.handleCreate();
    //         }
    //     });
    // }


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
                    killDefault={this.killDefault}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//修改二级类型表单
const SubItemEditForm = Form.create()(
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
                title="子类型编辑"
                width={600}
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
                        <div className="category-add category-form">
                            <Form layout="vertical">
                                <FormItem className="name" {...formItemLayout_12} label="子类型名称：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.name,
                                        rules: [{
                                            required: true,
                                            message: '名称不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入子类型名称"/>
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
                                            customRequest={picHandleChange}
                                        >
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

//修改二级类型组件
class SubItemEdit extends Component {
    state = {
        visible: false,
        data: {},
        viewPic: "",
        data_pic: "",
        photoLoading: false,
        confirmLoading: false
    };

    getData = () => {
        reqwest({
            url: '/sys/orgType/getById',
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
                    console.log(json.data)
                    this.setState({
                        data: json.data,
                        viewPic: json.data.photo,
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

    showModal = () => {
        this.getData();
        this.setState({visible: true});
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
    
    picUpload01 = (para) => {
        const _this = this;
        this.setState({
            photoLoading: true,
        });
        const file = para;
        const key = UUID.create().toString().replace(/-/g,"");
        const token = this.state.uploadToken;
        const config = {
            region: qiniu.region.z0
        };
        const observer = {
            next (res) {
                console.log(res)
            },
            error (err) {
                console.log(err)
                // message.error(err.message ? err.message : "图片提交失败");
                // 此处第一次提交提示 split 没有定义
                message.error("图片提交失败");
                _this.setState({
                    photoLoading: false,
                })
            }, 
            complete (res) {
                console.log(res);
                message.success("图片提交成功");
                _this.setState({
                    viewPic: global.config.photoUrl + res.key || "",
                    data_pic: res.key || "",            
                    photoLoading: false,
                })
            }
        }
        const observable = qiniu.upload(file, key, token, config);
        observable.subscribe(observer); // 上传开始        
    };

    // 信息比对函数
    dataContrast = (values) => {
        const initValues = this.state.data;
        const itemList = ["name"];
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
            return result;
        }
    };

    handleCancel = () => {
        this.setState({
            visible: false,
        }, () => {
            this.setState({
                data: {},
                viewPic: "",
                data_pic: "",
                photoLoading: false,
                confirmLoading: false
            });
        });
    };

    handleCreate = () => {
        if (JSON.stringify(this.state.data) === "{}") {
            return;
        }
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }            
            if (this.state.data_pic) {
                values.photo = this.state.data_pic;
            }
            if (this.state.viewPic) {
                let iconTemp = this.state.viewPic.slice(global.config.photoUrl.length);
                values.photo = iconTemp;
            }
            // const result = this.dataContrast(values);
            const result = {
                id: this.props.id,
                name: values.name,
                // gradientRampStar: values.gradientRampStar,
                // gradientRampEnd: values.gradientRampEnd,
                photo: values.photo,                
            };
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/sys/orgType/update',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: result,
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("子类型编辑成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                data: {},
                                viewPic: "",
                                data_pic: "",
                                photoLoading: false,
                                confirmLoading: false
                            });
                        });
                        this.props.recapture()
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

    // componentDidMount() {
    //     const _this = this;
    //     window.addEventListener('keypress', function(e) {
    //         if (e.which === 13) {
    //             _this.handleCreate();
    //         }
    //     })
    // }

    render() {
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>编辑</span>
                <SubItemEditForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    data={this.state.data}
                    reqwestUploadToken={this.reqwestUploadToken}
                    picUpload01={this.picUpload01}
                    viewPic={this.state.viewPic}
                    photoLoading={this.state.photoLoading}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//类型列表
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
                width: "10%",
            },
            {
                title: '排序',
                dataIndex: 'sort',
                width: 150,
                editable: true,
            },
            {
                title: '分类名称',
                dataIndex: 'name',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'name')
            },
            {
                title: 'Icon',
                dataIndex: 'photo',
                width: '10%',
                render: (text, record) => (record.photo ?
                    <img style={{width: '30px', height: "30px"}} src={record["photo"]} alt=""/> : null)
            },
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
                                opStatus={this.props.opObj.modify && record.parentId === 0}
                                toLoginPage={this.props.toLoginPage}
                            />
                            {/*二级类型编辑*/}
                            <SubItemEdit 
                                id={record.id} 
                                parentId={record.parentId} 
                                recapture={this.getData}
                                opStatus={this.props.opObj.modify && record.parentId !== 0}
                                toLoginPage={this.props.toLoginPage}
                            />                   
                            {/*<a onClick={() => this.reOrder(record.id, 1, record.index - 1, record.parentId)}
                               style={{display: this.props.opObj.modify ? "inline" : "none"}}>上移</a>
                            <a onClick={() => this.reOrder(record.id, 0, record.index - 1, record.parentId)}
                               style={{display: this.props.opObj.modify ? "inline" : "none"}}>下移</a>*/}
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

                            {/*二级类型新增*/}
                            <SubItemAdd 
                                id={record.id} 
                                parentId={record.parentId}
                                recapture={this.getData}
                                opStatus={this.props.opObj.add && record.parentId === 0}
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

    // 列表信息处理函数
    dataHandle = (data) => {
        let result = [];
        // data.list.sort((a, b) => {
        //     return b.sort - a.sort
        // });
        data.list.forEach((item, index) => {
            const temp = {
                key: item.id,
                id: item.id,
                parentId: item.parentId,
                sort: item.sort !== 0 ? item.sort : '',
                index: index + 1,
                name: item.name,
                photo: item.photo
            };
            if (item.list) {
                const tempChildren = [];
                const dataItem = item.list
                // .sort((a, b) => {
                //     return a.sort - b.sort
                // });
                dataItem.forEach((subItem, subIndex) => {
                    const temp = {
                        key: subItem.id,
                        id: subItem.id,
                        sort: subItem.sort !== 0 ? subItem.sort : '',
                        parentId: subItem.parentId,
                        index: subIndex + 1,
                        name: subItem.name,
                        photo: subItem.photo,
                    };
                    tempChildren.push(temp)
                });
                temp.children = tempChildren
            }
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
            url: '/sys/orgType/page',
            type: 'json',
            method: 'get',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize,
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
                        data: this.dataHandle(json.data),
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

    //分类排序
    reOrder = (para_id, para_type, para_index, para_parentId) => {
        const fn_filter = (item) => {
            return item.id === para_parentId
        };
        const data = para_parentId === 0 ? this.state.data : this.state.data.filter(fn_filter)[0].children;
        let targetId = "";
        if (para_type === 1) {
            if (para_index <= 0) {
                message.error("该项无法上移");
                return;
            }
            targetId = data[para_index - 1].id
        }
        if (para_type === 0) {
            if (para_index >= data.length - 1) {
                message.error("该项无法下移");
                return;
            }
            targetId = data[para_index + 1].id;
        }
        this.setState({
            loading: true
        });
        reqwest({
            url: '/institution/sortEducationType',
            type: 'json',
            method: 'post',
            data: {
                id: para_id,
                targetId: targetId
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: () => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("排序成功");
                    this.getData();
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
                            loading: false
                        })
                    }
                }
            }
        });
    };

    // 设置排序
    handleSort = (row) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/orgType/updateSort',
            type: 'json',
            method: 'post',
            data: {
                // 机构Id
                id: row.id,
                // 排序
                sort: Number(row.sort),
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
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                    });
                    this.getData(); //刷新数据
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

    //分类删除
    itemDelete = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/orgType/updateStatus?id=' + para,
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("分类删除成功");
                    this.getData();
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
        return <Table bordered
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
            opObj: {},
            flag_add: false
        }
    };

    // 获取当前登录人对此菜单的操作权限 
    // 多了一级循环
    setPower = () => {
        // 菜单信息为空则直接返回登陆页
        if (!sessionStorage.menuListOne) {
            this.toLoginPage();
            return
        }
        JSON.parse(sessionStorage.menuListOne).forEach((item) => {
            // console.log(item.children)
            item.children.forEach((subItem) => {                
                subItem.children.forEach((thirdItem) => {
                    // console.log(thirdItem.url)
                    // console.log(this.props.location.pathname)
                    if (thirdItem.url === this.props.location.pathname) {
                        let data = {};
                        thirdItem.children.forEach((fourthItem) => {
                            // console.log(fourthItem)
                            data[fourthItem.url] = true;
                        });
                        // console.log(data);
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