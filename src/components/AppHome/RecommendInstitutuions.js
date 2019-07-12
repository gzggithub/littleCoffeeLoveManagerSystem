import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    Form,
    message,
    Select,
    Popconfirm
} from 'antd';
import reqwest from 'reqwest';

const FormItem = Form.Item;
const {Option} = Select;
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

//新增推荐机构表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, list, setKeyword, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 根据列表内容生成option列表
        const children = [];
        list.forEach((item, index) => {
            children.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
        });

        return (
            <Modal
                visible={visible}
                title="选择机构"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="recommendInstitutions-add recommendInstitutions-form">
                    <Form layout="vertical">
                        <FormItem className="educationName unnecessary" {...formItemLayout_12} label="关键词：">
                            {getFieldDecorator('educationName', {
                                rules: [{
                                    required: false
                                }]
                            })(
                                <Input placeholder="请输入机构名称信息" onBlur={(event) => {
                                    setKeyword(event.target.value)
                                }}/>
                            )}
                        </FormItem>
                        <FormItem className="institution longItem" {...formItemLayout_14} label="机构：">
                            {getFieldDecorator('institution', {
                                rules: [{
                                    required: true,
                                    message: '请选择机构',
                                }],
                            })(
                                <Select
                                    style={{width: '100%'}}
                                    placeholder="请选择机构"
                                    allowClear={true}
                                    dropdownMatchSelectWidth={false}
                                >
                                    {children}
                                </Select>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        )
    }
);

//新增推荐机构组件
class ItemAdd extends Component {
    state = {
        visible: false,
        keyword: "",
        list: [],
        confirmLoading: false
    };

    showModal = () => {
        this.setState(
            {visible: true}
        )
    };

    getList = () => {
        reqwest({
            url: '/institution/getEducationList',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                educationName: this.state.keyword
            },
            error: (XMLHttpRequest) => {

            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        list: json.data.list
                    })
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                    }
                }
            }
        })
    };

    setKeyword = (para) => {
        if (!para) {
            this.setState({
                list: []
            });
            return
        }
        if (para === this.state.keyword) {
            return
        }
        this.setState({
            keyword: para
        }, () => {
            this.getList()
        })
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
                    keyword: "",
                    list: [],
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
                url: '/indexRecommend/saveRecommendInfo',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    belongId: values.institution,
                    type: 3,
                    sort: 0
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("推荐机构添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                keyword: "",
                                list: [],
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
            <div style={{display: this.props.opStatus ? "inline" : "none"}}>
                <Button type="primary" onClick={this.showModal}>选择</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    list={this.state.list}
                    setKeyword={this.setKeyword}
                    confirmLoading={this.state.confirmLoading}
                />
            </div>
        );
    }
}

//推荐机构列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.recommendInstitutionsPageSize) || 10,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            },
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '机构名称',
                dataIndex: 'name',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '照片',
                dataIndex: 'photo',
                width: '8%',
                render: (text, record) => (<img style={{width: '30px', height: "18px"}} alt="" src={record["photo"]}/>)
            },
            {
                title: '机构类型',
                dataIndex: 'type',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'type'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            <a onClick={() => this.reOrder(record.id, 1, record.index - 1)}
                               style={{display: this.props.opObj.modify ? "inline" : "none"}}>上移</a>
                            <a onClick={() => this.reOrder(record.id, 0, record.index - 1)}
                               style={{display: this.props.opObj.modify ? "inline" : "none"}}>下移</a>
                            <Popconfirm title="确认删除?"
                                        placement="topRight"
                                        onConfirm={() => this.deleteItem(record.id)}
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

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    //获取列表内容
    getData = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/indexRecommend/getRecommendCourseList',
            type: 'json',
            method: 'post',
            data: {
                type: 3
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
                    json.data.forEach((item, index) => {
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            photo: "http://" + item.photo,
                            name: item.name,
                            type: item.typeName
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

    //分类排序
    reOrder = (para_id, para_type, para_index) => {
        let targetId = "";
        if (para_type === 1) {
            if (para_index <= 0) {
                message.error("该项无法上移");
                return;
            }
            targetId = this.state.data[para_index - 1].id
        }
        if (para_type === 0) {
            if (para_index >= this.state.data.length - 1) {
                message.error("该项无法下移");
                return;
            }
            targetId = this.state.data[para_index + 1].id;
        }
        this.setState({
            loading: true
        });
        reqwest({
            url: '/indexRecommend/sortRecommend',
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

    //删除
    deleteItem = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/indexRecommend/removeRecommendInfo',
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
                    message.success("推荐机构删除成功");
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

    //表格参数变化处理
    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.recommendInstitutionsPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.recommendInstitutionsPageSize);
        this.setState({
            pagination: pager,
        });
    };

    componentWillMount() {
        // this.getData();
    }

    componentWillReceiveProps(nextProps) {
        // flag_add改变，则重新获取列表内容
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

class RecommendInstitutions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 操作权限
            opObj: {},
            flag_add: false
        };
    };

    // 获取当前登录人对此菜单的操作权限
    setPower=()=>{
        // 菜单信息为空则直接返回登陆页
        if(!sessionStorage.menuList){
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
        // 获取此菜单的操作权限
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
            <div className="recommendInstitutions">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                <span>机构列表</span>
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd setFlag={this.setFlag} opStatus={this.state.opObj.add} toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            <div className="table-box">
                                <DataTable flag_add={this.state.flag_add} opObj={this.state.opObj} toLoginPage={this.toLoginPage}/>
                            </div>
                        </div>
                        :
                        <p>暂无查询权限</p>
                }

            </div>
        )
    }
}

export default RecommendInstitutions;