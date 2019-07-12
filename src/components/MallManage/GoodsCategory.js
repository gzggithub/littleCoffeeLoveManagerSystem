import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    Form,
    message,
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

//新增商品分类表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="新增商品分类"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="goodsCategory-add goodsCategory-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_8} label="分类名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '名称不能为空'
                                }]
                            })(
                                <Input placeholder="请输入分类名称"/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//新增商品分类组件
class ItemAdd extends Component {
    state = {
        visible: false,
        // 确认按钮状态变量
        confirmLoading: false
    };

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
                    confirmLoading: false
                });
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
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/goods/saveGoodsClass',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    name: values.name,
                    parentId: 0,
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("商品分类添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                confirmLoading: false
                            });
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
                <Button type="primary" onClick={this.showModal}>新增分类</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    confirmLoading={this.state.confirmLoading}
                />
            </div>
        );
    }
}

//新增商品子分类表单
const SubItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="新增商品分类"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="goodsCategory-add goodsCategory-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_8} label="分类名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '名称不能为空'
                                }]
                            })(
                                <Input placeholder="请输入分类名称"/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//新增商品子分类组件
class SubItemAdd extends Component {
    state = {
        visible: false,
        // 确认按钮状态变量
        confirmLoading: false
    };

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
                    confirmLoading: false
                });
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
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/goods/saveGoodsClass',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    name: values.name,
                    parentId: this.props.id,
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("商品分类添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                confirmLoading: false
                            });
                        });
                        this.props.recapture();
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
            <a style={{display: this.props.parentId ? "none" : "inline"}}>
                <span onClick={this.showModal}>新增子分类</span>
                <SubItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//修改商品分类表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="商品分类编辑"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="goodsCategory-edit goodsCategory-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_8} label="分类名称：">
                            {getFieldDecorator('name', {
                                initialValue: data.name,
                                rules: [{
                                    required: true,
                                    message: '名称不能为空',
                                }],
                            })(
                                <Input placeholder="请输入分类名称"/>
                            )}
                        </FormItem>
                        <FormItem className="status" {...formItemLayout_8} label="状态：">
                            {getFieldDecorator('status', {
                                initialValue: data.status,
                                rules: [{
                                    required: true,
                                    message: '状态不能为空',
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

//修改商品分类组件
class ItemEdit extends Component {
    state = {
        visible: false,
        data: {},
        confirmLoading: false,
    };

    getData = () => {
        reqwest({
            url: '/goods/getGoodsTypeDetail',
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
                //         goodsType: {
                //             name: "日常用品",
                //             status: 0
                //         }
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        data: json.data.goodsType
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
        console.log(result);
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
                url: '/goods/modifyGoodsClass',
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
                        message.success("商品分类信息修改成功");
                        this.setState({
                            visible: false
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

//商品分类列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: []
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '20%',
            },
            {
                title: '分类名称',
                dataIndex: 'name',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
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
                            {/*新增子分类*/}
                            <SubItemAdd id={record.id} parentId={record.parentId} recapture={this.getData}
                                        toLoginPage={this.props.toLoginPage}/>
                            <a onClick={() => this.reOrder(record.id, 1, record.index - 1, record.parentId)}>上移</a>
                            <a onClick={() => this.reOrder(record.id, 0, record.index - 1, record.parentId)}>下移</a>
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

    // 列表信息处理函数
    dataHandle = (data) => {
        let result = [];
        data.sort((a, b) => {
            return a.sort - b.sort
        });
        data.forEach((item, index) => {
            let children = [];
            if (item.list) {
                const dataItem = item.list.sort((a, b) => {
                    return a.sort - b.sort
                });
                dataItem.forEach((subItem, subIndex) => {
                    let tempStatus = "";
                    if (subItem.status === 0) {
                        tempStatus = "未启用"
                    }
                    if (subItem.status === 1) {
                        tempStatus = "正常"
                    }
                    if (subItem.status === 2) {
                        tempStatus = "无效"
                    }
                    children.push({
                        key: subItem.id,
                        id: subItem.id,
                        parentId: item.id,
                        index: subIndex + 1,
                        name: subItem.name,
                        status: tempStatus
                    });
                })
            }
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
            result.push({
                key: item.id,
                id: item.id,
                parentId: 0,
                index: index + 1,
                name: item.name,
                status: tempStatus,
                children: children
            });
        });
        return result;
    };

    //获取本页信息
    getData = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/goods/getGoodsTypeList',
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
                //             name: "分类1",
                //             status: 0,
                //             sort: 1,
                //             list: [
                //                 {
                //                     id: 11,
                //                     name: "分类11",
                //                     status: 0,
                //                     sort: 11,
                //                 },
                //                 {
                //                     id: 12,
                //                     name: "分类12",
                //                     status: 0,
                //                     sort: 12,
                //                 },
                //                 {
                //                     id: 13,
                //                     name: "分类13",
                //                     status: 0,
                //                     sort: 13,
                //                 },
                //             ]
                //         },
                //         {
                //             id: 2,
                //             name: "分类2",
                //             status: 0,
                //             sort: 2,
                //             list: [
                //
                //             ]
                //         },
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        data: this.dataHandle(json.data)
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
            url: '/goods/updateGoodsClassSort',
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
                    if (json.code === "901") {
                        message.error("请先登录");
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
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

    //分类删除
    itemDelete = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/goods/banGoodsClass',
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
                    message.success("商品分类删除成功");
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

class GoodsCategory extends Component {
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
            <div className="goodsCategory">
                <header className="clearfix">
                    <span>商品分类列表</span>
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

export default GoodsCategory;