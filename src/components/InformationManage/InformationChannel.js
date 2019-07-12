import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    message,
    Form,
    InputNumber,
    Popconfirm
} from 'antd';
import reqwest from 'reqwest';

const FormItem = Form.Item;
const confirm = Modal.confirm;

//栅格设置
const formItemLayout_8 = {
    labelCol: {span: 4},
    wrapperCol: {span: 8},
};
const formItemLayout_12 = {
    labelCol: {span: 4},
    wrapperCol: {span: 12},
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//资讯频道新增表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="频道新增"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="informationChannel-add informationChannel-form">
                    <Form layout="vertical">
                        <FormItem {...formItemLayout_12} label="频道名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    max: 6,
                                    message: '请按要求填写频道名称',
                                }],
                            })(
                                <Input placeholder="请输入频道名称（6字以内）"/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//资讯频道新增组件
class ItemAdd extends Component {
    state = {
        visible: false,
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
                url: '/news/addNewsType',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    name: values.name,
                    parentId: 0
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("资讯频道添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                confirmLoading: false
                            });
                        });
                        this.props.setFlag()
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
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button type="primary" onClick={this.showModal}>频道新增</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    loading={false}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    confirmLoading={this.state.confirmLoading}
                />
            </div>
        );
    }
}

//资讯子频道新增表单
const SubItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="子频道新增"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="informationChannel-add informationChannel-form">
                    <Form layout="vertical">
                        <FormItem {...formItemLayout_12} label="频道名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    max: 6,
                                    message: '请按要求填写频道名称',
                                }],
                            })(
                                <Input placeholder="请输入频道名称（6字以内）"/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//资讯子频道新增组件
class SubItemAdd extends Component {
    state = {
        visible: false,
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
                url: '/news/addNewsType',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    name: values.name,
                    parentId: this.props.id
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("资讯子频道添加成功");
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
            <a style={{display: this.props.parentId === 0 ? "inline" : "none"}}>
                <span onClick={this.showModal}>子频道新增</span>
                <SubItemAddForm
                    ref={this.saveFormRef}
                    loading={false}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//频道编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, name, parentId, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="频道编辑"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="informationChannel-edit informationChannel-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_12} label="频道名称：">
                            {getFieldDecorator('name', {
                                initialValue: name,
                                rules: [{
                                    required: true,
                                    max: 6,
                                    message: '请按要求填写频道名称',
                                }],
                            })(
                                <Input placeholder="请输入频道名称（6字以内）"/>
                            )}
                        </FormItem>
                        <FormItem className="parentId" {...formItemLayout_8} label="父Id：">
                            {getFieldDecorator('parentId', {
                                initialValue: parentId,
                                rules: [{
                                    required: true,
                                    message: '父Id不能为空',
                                }]
                            })(
                                <InputNumber min={0} precision={0} step={1}/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//频道编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,
        confirmLoading: false
    };

    showModal = () => {
        this.setState({visible: true});
    };

    dataContrast = (values) => {
        const initValues = {name: this.props.name, parentId: this.props.parentId};
        const itemList = ["name", "parentId"];
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
                visible: false
            }, () => {
                this.setState({
                    confirmLoading: false
                });
            })
        };
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
                cancel()
            }
        })
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            const result = this.dataContrast(values);
            if (!result) {
                message.error("暂无信息更改，无法提交");
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/news/updateType',
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
                        message.success("资讯频道编辑成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                confirmLoading: false
                            });
                        });
                        this.props.recapture()
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
            <a>
                <span onClick={this.showModal}>编辑</span>
                <ItemEditForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    name={this.props.name}
                    parentId={this.props.parentId}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//资讯频道列表
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
                width: '10%',
            },
            {
                title: '频道名称',
                dataIndex: 'name',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*频道编辑*/}
                            <ItemEdit id={record.id} name={record.name} parentId={record.parentId} recapture={this.getData} toLoginPage={this.props.toLoginPage}/>
                            {/*新增子频道*/}
                            <SubItemAdd id={record.id} parentId={record.parentId} recapture={this.getData} toLoginPage={this.props.toLoginPage}/>
                            {/*频道排序*/}
                            <a onClick={() => this.reOrder(record.id, 1, record.index - 1, record.parentId)}>上移</a>
                            <a onClick={() => this.reOrder(record.id, 0, record.index - 1, record.parentId)}>下移</a>
                            {/*频道删除*/}
                            <Popconfirm title="确认删除?"
                                        placement="topRight"
                                        onConfirm={() => this.deleteItem(record.id)}
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

    dataHandle = (data) => {
        const result = [];
        data.sort((a, b) => {
            return a.sort - b.sort
        });
        data.forEach((item, index) => {
            const temp = {
                key: item.id,
                id: item.id,
                parentId: item.parentId,
                index: index + 1,
                name: item.name,
            };
            if (item.list) {
                const tempChildren = [];
                const dataItem = item.list.sort((a, b) => {
                    return a.sort - b.sort
                });
                dataItem.forEach((subItem, subIndex) => {
                    const temp = {
                        key: subItem.id,
                        id: subItem.id,
                        parentId: subItem.parentId,
                        index: subIndex + 1,
                        name: subItem.name
                    };
                    tempChildren.push(temp)
                });
                temp.children = tempChildren
            }
            result.push(temp)
        });
        return result;
    };

    //获取信息
    getData = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/news/typeList',
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
                //             name: "111",
                //             parentId: 0,
                //             sort: 10,
                //             list: [
                //                 {id: 11, name: "111001", parentId: 1, sort: 5},
                //             ]
                //         }
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        data: this.dataHandle(json.data),
                    })
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
            url: '/news/sortType',
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

    //频道删除
    deleteItem = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/news/deleteType',
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
                    message.success("资讯频道删除成功");
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

class InformationChannel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            flag_add: false
        }
    };

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
        // 菜单信息为空则直接返回登陆页
        if (!sessionStorage.menuList) {
            this.toLoginPage();
            return
        }
        JSON.parse(sessionStorage.menuList).forEach((item) => {
            item.children.forEach((subItem) => {
                if (subItem.url === this.props.location.pathname) {
                    let data = {};
                    subItem.children.forEach((thirdItem) => {
                        data[thirdItem.url] = true;
                    });
                    this.setState({
                        opObj: data
                    })
                }
            })
        })
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
            <div className="information-channel">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                <span>资讯频道列表</span>
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd opStatus={this.state.opObj.add} setFlag={this.setFlag} toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            <div className="table-box">
                                <DataTable opObj={this.state.opObj} flag_add={this.state.flag_add} toLoginPage={this.toLoginPage}/>
                            </div>
                        </div>
                        :
                        <p>暂无查询权限</p>
                }
            </div>
        )
    }
}

export default InformationChannel;