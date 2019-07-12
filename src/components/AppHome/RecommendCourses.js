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

//新增课程表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, list, setKeyword, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 根据列表内容生成option列表
        const children = [];
        list.forEach((item, index) => {
            children.push(<Option key={index + 1} value={item.id}>{item.name + "（" + item.eduName + "）"}</Option>);
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
                <div className="recommendCourse-add recommendCourse-form">
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

//新增课程组件
class ItemAdd extends Component {
    state = {
        visible: false,
        // 筛选关键词
        keyword: "",
        // 键入关键词后的课程列表
        list: [],
        confirmLoading: false
    };

    showModal = () => {
        this.setState(
            {visible: true}
        )
    };

    // 根据keyword获取的课程列表
    getList = () => {
        reqwest({
            url: '/course/getCourseList',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                courseName: this.state.keyword
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

    // 关键词相关操作
    setKeyword = (para) => {
        // keyword为空，清空列表
        if (!para) {
            this.setState({
                list: []
            });
            return
        }
        // keyword无变化，直接return
        if (para === this.state.keyword) {
            return
        }
        // 获取新列表
        this.setState({
            keyword: para
        }, () => {
            this.getList()
        })
    };

    // 取消处理
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

    // 确认处理
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
                    type: 0,
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
                        // 添加成功之后变量初始化
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                keyword: "",
                                list: [],
                                confirmLoading: false
                            });
                        });
                        // 调用setFlag函数拉取最新推荐课程列表
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
            // 校验新增权限，为false则不显示该新增按钮
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
            // 列表内容加载中状态标识变量 true：加载中；false：加载完成
            loading: true,
            // 依据表格列配置生成的表格所需的信息列表
            data: [],
            // 列表分页相关变量
            pagination: {
                // 当前页码
                current: 1,
                // 每页信息条数，读自缓存，没有则默认10条
                pageSize: Number(localStorage.recommendCoursesPageSize) || 10,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            },
        };
        // 表格的列配置
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
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '所属机构',
                dataIndex: 'EName',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'EName'),
            },
            {
                title: '科目',
                dataIndex: 'typeName',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'typeName'),
            },
            {
                title: '类型',
                dataIndex: 'courseTypeWord',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'courseTypeWord'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*操作按钮都需进行权限校验*/}
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

    //获取信息
    getData = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/indexRecommend/getRecommendCourseList',
            // url: '/sys/appUser/list',
            type: 'json',
            method: 'post',
            data: {
                type: 0
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
                    if (json.data) {
                        json.data.forEach((item, index) => {
                            let courseTypeWord = "";
                            if (item.courseType === 0) {
                                courseTypeWord = "线下正式课"
                            }
                            if (item.courseType === 1) {
                                courseTypeWord = "视频课程"
                            }
                            if (item.courseType === 2) {
                                courseTypeWord = "线下体验课"
                            }
                            data.push({
                                key: index.toString(),
                                id: item.id,
                                index: index + 1,
                                name: item.name,
                                typeName: item.parentTypeName + "/" + item.typeName,
                                EName: item.EName,
                                courseType: item.courseType,
                                courseTypeWord: courseTypeWord,
                            })
                        })
                    }
                    this.setState({
                        loading: false,
                        data: data
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

    //排序
    reOrder = (para_id, para_type, para_index) => {
        // 本次操作目标Id
        let targetId = null;
        // type为1，进入上移分支
        if (para_type === 1) {
            // 首项无法上移，直接return
            if (para_index <= 0) {
                message.error("该项无法上移");
                return;
            }
            // 上一项Id设为目标Id
            targetId = this.state.data[para_index - 1].id
        }
        // type为0，进入下移分支
        if (para_type === 0) {
            // 末项无法下移，直接return
            if (para_index >= this.state.data.length - 1) {
                message.error("该项无法下移");
                return;
            }
            // 下一项Id设为目标Id
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
                    // 排序成功，重新获取列表内容
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
                    message.success("推荐课程删除成功");
                    // 删除成功，重新获取列表内容
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
        // 单页信息条数进行缓存
        localStorage.recommendCoursesPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.recommendCoursesPageSize);
        this.setState({
            pagination: pager,
        });
    };

    componentWillMount() {
        this.getData();
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

class RecommendCourses extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 操作权限：增、删、改、查
            opObj: {},
            // 新增成功标识变量，用以触发课程列表组建的componentWillReceiveProps钩子从而获取最新列表内容
            flag_add: false
        };
    };

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
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

    // 新增成功之后调用此函数更改flag_add的值以触发后续操作
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
            <div className="recommendCourse">
                {
                    // 查询权限校验
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                <span>课程列表</span>
                                <div className="add-button" style={{float: "right"}}>
                                    {/*新增组建*/}
                                    <ItemAdd opStatus={this.state.opObj.add} setFlag={this.setFlag} toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            <div className="table-box">
                                {/*列表组建*/}
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

export default RecommendCourses;