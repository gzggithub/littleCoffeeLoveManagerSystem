import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    Form,
    message,
    Spin
} from 'antd';
import reqwest from 'reqwest';

const FormItem = Form.Item;
const {TextArea} = Input;
const confirm = Modal.confirm;

//栅格设置
const formItemLayout_12 = {
    labelCol: {span: 4},
    wrapperCol: {span: 12},
};
const formItemLayout_14 = {
    labelCol: {span: 4},
    wrapperCol: {span: 14},
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//新增配置项表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="新增配置项"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="configuration-add configuration-form">
                    <Form layout="vertical">
                        <FormItem className="code" {...formItemLayout_12} label="配置项：">
                            {getFieldDecorator('code', {
                                rules: [{
                                    required: true,
                                    message: '配置项名称不能为空'
                                }]
                            })(
                                <Input placeholder="请输入配置项名称"/>
                            )}
                        </FormItem>
                        <FormItem className="value" {...formItemLayout_12} label="配置内容：">
                            {getFieldDecorator('value', {
                                rules: [{
                                    required: true,
                                    message: '配置内容不能为空'
                                }]
                            })(
                                <Input placeholder="请输入配置内容"/>
                            )}
                        </FormItem>
                        <FormItem className="remark longItem" {...formItemLayout_14} label="备注：">
                            {getFieldDecorator('remark', {
                                rules: [{
                                    required: true,
                                    message: '备注不能为空'
                                }]
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请输入备注信息"
                                          autosize={{minRows: 3, maxRows: 10}}/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//新增配置项组件
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
                url: '/config/saveSysConfig',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: values,
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    });
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("配置项添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
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

    render() {
        return (
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button type="primary" onClick={this.showModal}>新增配置项</Button>
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

//修改配置项表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="配置项编辑"
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
                        <div className="configuration-edit configuration-form">
                            <Form layout="vertical">
                                <FormItem className="code" {...formItemLayout_12} label="配置项：">
                                    {getFieldDecorator('code', {
                                        initialValue: data.code,
                                        rules: [{
                                            required: true,
                                            message: '配置项名称不能为空'
                                        }]
                                    })(
                                        <Input placeholder="请输入配置项名称"/>
                                    )}
                                </FormItem>
                                <FormItem className="value" {...formItemLayout_12} label="配置内容：">
                                    {getFieldDecorator('value', {
                                        initialValue: data.value,
                                        rules: [{
                                            required: true,
                                            message: '配置内容不能为空'
                                        }]
                                    })(
                                        <Input placeholder="请输入配置内容"/>
                                    )}
                                </FormItem>
                                <FormItem className="remark longItem" {...formItemLayout_14} label="备注：">
                                    {getFieldDecorator('remark', {
                                        initialValue: data.remark,
                                        rules: [{
                                            required: true,
                                            message: '备注不能为空'
                                        }]
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请输入备注信息"
                                                  autosize={{minRows: 3, maxRows: 10}}/>
                                    )}
                                </FormItem>
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

//修改配置项组件
class ItemEdit extends Component {
    state = {
        visible: false,
        data: {},
        confirmLoading: false
    };

    getData = () => {
        reqwest({
            url: '/config/getSysConfigDetails',
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
                //         configDetails: {
                //             code: "",
                //             value: "",
                //             remark: ""
                //         }
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        data: json.data.configDetails
                    });
                } else {
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
        const itemList = ["code", "value", "remark"];
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
                    data: {},
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
                this.setState({visible: false}, () => {
                    form.resetFields();
                })
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
                url: '/config/modifySysConfig',
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
                        message.success("配置项修改成功");
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
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//配置列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.configurationPageSize) || 10,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            }
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '配置项',
                dataIndex: 'name',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, "name"),
            },
            {
                title: '配置内容',
                dataIndex: 'value',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'value'),
            },
            {
                title: '备注',
                dataIndex: 'remark',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'remark'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            <ItemEdit id={record.id} recapture={this.getData} opStatus={this.props.opObj.modify} toLoginPage={this.props.toLoginPage}/>
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
            url: '/config/getSysConfigList',
            type: 'json',
            method: 'post',
            data: {
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
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            name: item.code,
                            value: item.value,
                            remark: item.remark || "暂无"
                        });
                    });
                    this.setState({
                        loading: false,
                        data: data,
                        pagination: {
                            total: json.data.size,
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
        localStorage.configurationPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.configurationPageSize);
        this.setState({
            pagination: pager,
        }, () => {
            this.getData(this.props.keyword);
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
                      pagination={this.state.pagination}
                      columns={this.columns}
                      onChange={this.handleTableChange}/>;
    }
}

class Configuration extends Component {
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
            <div className="configuration">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                <span>配置信息列表</span>
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

export default Configuration;