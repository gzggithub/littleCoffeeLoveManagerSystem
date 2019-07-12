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
import '../../config/config.js';
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

//新增课程表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, list, setKeyword, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 课程选项生成
        const courseOptions = [];
        list.forEach((item, index) => {
            courseOptions.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
        });

        return (
            <Modal
                visible={visible}
                title="选择课程"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="recommendCourseOne-add recommendCourseOne-form">
                    <Form layout="vertical">
                        <FormItem className="courseName unnecessary" {...formItemLayout_12} label="关键词：">
                            {getFieldDecorator('courseName', {
                                rules: [{
                                    required: false
                                }]
                            })(
                                <Input placeholder="请输入课程名称信息" onBlur={(event) => {
                                    setKeyword(event.target.value)
                                }}/>
                            )}
                        </FormItem>
                        <FormItem className="course longItem" {...formItemLayout_14} label="课程：">
                            {getFieldDecorator('course', {
                                rules: [{
                                    required: true,
                                    message: '请选择课程',
                                }],
                            })(
                                <Select
                                    style={{width: '100%'}}
                                    placeholder="请选择课程"
                                    allowClear={true}
                                    dropdownMatchSelectWidth={false}
                                >
                                    {courseOptions}
                                </Select>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        )
    }
);

//新增课程组件
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
            url: '/mdhCourse/courseList',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                state: 2,
                name: this.state.keyword
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
                    belongId: values.course,
                    type: 4,
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
                        message.success("推荐课程添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                keyword: "",
                                list: [],
                                confirmLoading: false
                            })
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
                <Button type="primary" onClick={this.showModal}>选择</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    loading={false}
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

//课程列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.recommendCourseOnePageSize) || 10,
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
                title: '课程名称',
                dataIndex: 'name',
                width: '25%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '课程类型',
                dataIndex: 'type',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'type'),
            },
            {
                title: '图片',
                dataIndex: 'photo',
                width: '8%',
                render: (text, record) => (<img style={{width: '50px', height: "24px"}} alt="" src={record["photo"]}/>)
            },
            {
                title: '开课日期',
                dataIndex: 'openClassDate',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'openClassDate'),
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

    //日期处理
    dateHandle = (para) => {
        const tempDate = new Date(para.replace("CST", "GMT+0800")),
            oMonthT = (tempDate.getMonth() + 1).toString(),
            oMonth = oMonthT.length <= 1 ? "0" + oMonthT : oMonthT,
            oDayT = tempDate.getDate().toString(),
            oDay = oDayT.length <= 1 ? "0" + oDayT : oDayT,
            oYear = tempDate.getFullYear().toString(),
            oTime = oYear + '-' + oMonth + '-' + oDay;
        return oTime;
    };

    //获取信息
    getData = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/indexRecommend/getRecommendCourseList',
            type: 'json',
            method: 'post',
            data: {
                type: 4
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                });
                // const json = {
                //     result: 0,
                //     data: [
                //         {
                //             id: null,
                //             name: "",
                //             type: null,
                //             photo: "",
                //             openClassDate: "",
                //             openClassPeopleNum: null,
                //             teacherInfo: "",
                //             summary: "",
                //             suitablePeople: "",
                //             courseCollect: "",
                //             originalPrice: "",
                //             price: "",
                //             openClassAddress: "",
                //             state: null
                //         },
                //     ]
                // };
            },
            success: (json) => {
                const data = [];
                if (json.result === 0) {
                    json.data.forEach((item, index) => {
                        let tempType = "";
                        if (item.type === 0) {
                            tempType = "线上课程"
                        }
                        if (item.type === 1) {
                            tempType = "线下课程"
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            name: item.name,
                            typeCode: item.type,
                            type: tempType,
                            photo: "http://" + item.photo,
                            openClassDate: item.openClassDate ? this.dateHandle(item.openClassDate) : "",
                            state: item.state
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

    //排序
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
                    message.success("推荐课程删除成功");
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

    //表格参数变化处理
    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.recommendCourseOnePageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.recommendCourseOnePageSize);
        this.setState({
            pagination: pager,
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

class RecommendCourseOne extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            flag_add: false
        };
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
            <div className="recommendCourseOne">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                <span>课程列表</span>
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd opStatus={this.state.opObj.add} setFlag={this.setFlag}
                                             toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            <div className="table-box">
                                <DataTable opObj={this.state.opObj} flag_add={this.state.flag_add}
                                           toLoginPage={this.toLoginPage}/>
                            </div>
                            <p className="hint">注：为了更好地向用户展示优质课程，建议推荐设置四个及四个以上的课程。</p>
                        </div>
                        :
                        <p>暂无查询权限</p>
                }

            </div>
        )
    }
}

export default RecommendCourseOne;