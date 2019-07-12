import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    Form,
    Upload,
    message,
    Icon,
    Radio,
    Popconfirm
} from 'antd';
import '../../config/config.js';
import reqwest from 'reqwest';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const confirm = Modal.confirm;

//栅格设置
const formItemLayout_8 = {
    labelCol: {span: 4},
    wrapperCol: {span: 8},
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//新增商品标签表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, viewPic, fn_pic, photoLoading, confirmLoading} = props;
        const {getFieldDecorator} = form;

        //图片处理
        const getBase64 = (img, callback) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => callback(reader.result));
            reader.readAsDataURL(img);
        };
        const beforeUpload = (file) => {
            const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isIMG) {
                message.error('文件类型错误');
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('文件不能大于2M');
            }
            return isIMG && isLt2M;
        };
        const picHandleChange = (info) => {
            if (info.file.status === 'uploading') {
                fn_pic(true);
                return;
            }
            // 上传成功
            if (info.file.status === 'done') {
                getBase64(info.file.originFileObj, (imageUrl) => {
                    fn_pic(false, imageUrl, info.file.response.data.url);
                });
            }
            // 上传失败
            if (info.file.status === 'error') {
                message.error("图片上传失败");
                fn_pic(false, "", "");
            }
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
                title="新增商品标签"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="goodsLabel-add goodsLabel-form">
                    <Form layout="vertical">
                        <FormItem {...formItemLayout_8} label="标签名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '名称不能为空',
                                }],
                            })(
                                <Input placeholder="请输入标签名称"/>
                            )}
                        </FormItem>
                        <FormItem className="photo noInput" {...formItemLayout_8} label="Icon：">
                            {getFieldDecorator('photo', {
                                rules: [{
                                    required: true,
                                    message: '请上传标签Icon',
                                }],
                            })(
                                <Upload
                                    name="file"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    showUploadList={false}
                                    action="/file/upload"
                                    beforeUpload={beforeUpload}
                                    onChange={picHandleChange}
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

//新增商品标签组件
class ItemAdd extends Component {
    state = {
        visible: false,
        viewPic: "",
        data_pic: "",
        // 图片提交按钮状态变量
        photoLoading: false,
        confirmLoading: false
    };

    showModal = () => {
        this.setState({visible: true}, () => {
            const form = this.form;
            form.resetFields();
        });
    };

    //图片处理
    fn_pic = (para01, para02, para03) => {
        this.setState({
            viewPic: para02 || "",
            data_pic: para03 || "",
            photoLoading: para01,
        });
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false,
            }, () => {
                this.setState({
                    viewPic: "",
                    data_pic: "",
                    photoLoading: false,
                    confirmLoading: false
                })
            })
        };
        const data = form.getFieldsValue();
        let flag = false;
        for (let x in data) {
            if (data[x]) {
                flag = true
            }
        }
        if (flag) {
            confirm({
                title: '已添加信息未保存，确认放弃添加？',
                content: "",
                okText: '确认',
                okType: 'danger',
                cancelText: '取消',
                onOk() {
                    cancel();
                },
                onCancel() {
                }
            });
        } else {
            cancel()
        }
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            values.photo = this.state.data_pic;
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/goodsLabels/saveGoodsLabels',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    name: values.name,
                    photo: values.photo
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("商品标签添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                viewPic: "",
                                data_pic: "",
                                photoLoading: false,
                                confirmLoading: false
                            })
                        });
                        this.props.setFlag();
                    } else {
                        if (json.code === "901") {
                            message.error("请先登录");
                            this.props.toLoginPage();
                        } else if (json.code === "902") {
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
            <div>
                <Button type="primary" onClick={this.showModal}>新增标签</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    viewPic={this.state.viewPic}
                    photoLoading={this.state.photoLoading}
                    fn_pic={this.fn_pic}
                    confirmLoading={this.state.confirmLoading}
                />
            </div>
        );
    }
}

//修改商品标签表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="商品标签编辑"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="goodsLabel-edit goodsLabel-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_8} label="标签名称：">
                            {getFieldDecorator('name', {
                                initialValue: data.name,
                                rules: [{
                                    required: true,
                                    message: '标签名称不能为空',
                                }],
                            })(
                                <Input placeholder="请输入标签名称"/>
                            )}
                        </FormItem>
                        <FormItem className="status" {...formItemLayout_8} label="状态：">
                            {getFieldDecorator('status', {
                                initialValue: data.status,
                                rules: [{
                                    required: true,
                                    message: '名称不能为空',
                                }],
                            })(
                                <RadioGroup>
                                    <Radio value={0}>禁用</Radio>
                                    <Radio value={1}>启用</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//修改商品标签组件
class ItemEdit extends Component {
    state = {
        visible: false,
        data: {},
        confirmLoading: false,
    };

    getData = () => {
        reqwest({
            url: '/goodsLabels/getGoodsTypeDetail',
            type: 'json',
            method: 'post',
            data: {
                id: this.props.id
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         goodsTypeDetail: {
                //             name: "日常用品",
                //             status: 0
                //         }
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        data: json.data.goodsTypeDetail
                    });
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
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
        this.setState({
            visible: true,
        })
    };

    dataContrast = (values) => {
        const initValues = this.state.data;
        const itemList = ["name", "status"];
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
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false,
            }, () => {
                this.setState({
                    data: {},
                    confirmLoading: false,
                })
            })
        };
        // data空值处理
        if (JSON.stringify(this.state.data) === "{}") {
            cancel();
            return;
        }
        form.validateFields((err, values) => {
            const result = this.dataContrast(values);
            if (result) {
                confirm({
                    title: '已修改信息未保存，确认放弃修改？',
                    content: "",
                    okText: '确认',
                    okType: 'danger',
                    cancelText: '取消',
                    onOk() {
                        cancel();
                    }
                });
            } else {
                cancel();
            }
        })
    };

    handleCreate = () => {
        // data空值处理
        if (JSON.stringify(this.state.data) === "{}") {
            return;
        }
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            const result = this.dataContrast(values);
            if (!result) {
                message.error("暂无信息更改");
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/goodsLabels/modifyGoodsClass',
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
                        message.success("商品标签信息修改成功");
                        this.setState({
                            visible: false,
                        }, () => {
                            this.setState({
                                data: {},
                                confirmLoading: false,
                            })
                        });
                        this.props.recapture();
                    } else {
                        if (json.code === "901") {
                            message.error("请先登录");
                            // 返回登陆页
                            this.props.toLoginPage();
                        } else if (json.code === "902") {
                            message.error("登录信息已过期，请重新登录");
                            // 返回登陆页
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
            <a>
                <span onClick={() => this.showModal()}>编辑</span>
                <ItemEditForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    data={this.state.data}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//商品标签列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '标签名称',
                dataIndex: 'name',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: 'Icon',
                dataIndex: 'photo',
                width: '10%',
                render: (text, record) => (<img style={{width: '30px', height: "30px"}} src={record["photo"]} alt=""/>)
            },
            {
                title: '状态',
                dataIndex: 'status',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'status'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*编辑*/}
                            <ItemEdit id={record.id} recapture={this.getData} toLoginPage={this.props.toLoginPage}/>
                            <Popconfirm title="确认删除?"
                                        placement="topRight"
                                        onConfirm={() => this.itemDelete(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="立即删除"
                                        cancelText="取消">
                                <a>删除</a>
                            </Popconfirm>
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

    //获取本页信息
    getData = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/goodsLabels/getGoodsLabelsList',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                })
                // const json = {
                //     result: 0,
                //     data: [
                //         {
                //             id: 1,
                //             name: "升学辅助",
                //             photo: "d4979f2b5eb0462ebe6a1856c3aff895.jpg",
                //             status: 0
                //         },
                //         {
                //             id: 2,
                //             name: "音乐乐器",
                //             photo: "d4979f2b5eb0462ebe6a1856c3aff895.jpg",
                //             status: 1
                //         },
                //         {
                //             id: 3,
                //             name: "舞蹈培训",
                //             photo: "d4979f2b5eb0462ebe6a1856c3aff895.jpg",
                //             status: 2
                //         }
                //     ]
                // };
            },
            success: (json) => {
                const data = [];
                if (json.result === 0) {
                    json.data.forEach((item, index) => {
                        let tempStatus = "";
                        if (item.status === 0) {
                            tempStatus = "未启用"
                        }
                        if (item.status === 1) {
                            tempStatus = "正常"
                        }
                        if (item.status === 2) {
                            tempStatus = "无效"
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            name: item.name,
                            photo: "http://image.taoerxue.com/" + item.photo,
                            status: tempStatus
                        });
                    });
                    this.setState({
                        loading: false,
                        data: data
                    });
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
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

    //商品标签删除
    itemDelete = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/goodsLabels/banGoodsClass',
            type: 'json',
            method: 'post',
            data: {
                id: para
            },
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
                    message.success("商品标签删除成功");
                    this.getData();
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
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

    componentWillMount() {
        this.getData();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData();
    }

    render() {
        return <Table bordered
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={false}
                      columns={this.columns}/>;
    }
}

class GoodsLabel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            flag_add: false
        }
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
            <div className="goodsLabel">
                <header className="clearfix">
                    <span>商品标签列表</span>
                    <div className="add-button" style={{float: "right"}}>
                        <ItemAdd setFlag={this.setFlag} toLoginPage={this.toLoginPage}/>
                    </div>
                </header>
                <div className="table-box">
                    <DataTable flag_add={this.state.flag_add} toLoginPage={this.toLoginPage}/>
                </div>
            </div>
        )
    }
}

export default GoodsLabel;