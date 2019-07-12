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

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//新增课程表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, courseList, getCourseList} = props;
        const {getFieldDecorator} = form;

        const children = [];
        courseList.forEach((item, index) => {
            children.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
        });

        return (
            <Modal
                visible={visible}
                title="选择课程"
                onCancel={onCancel}
                onOk={onCreate}
            >
                <div className="videoCourses-add videoCourses-form">
                    <Form layout="vertical">
                        <FormItem className="courseName unnecessary" {...formItemLayout_12} label="关键词：">
                            {getFieldDecorator('courseName', {
                                rules: [{
                                    required: false
                                }]
                            })(
                                <Input placeholder="请输入课程名称信息" onBlur={(event) => {
                                    getCourseList(event.target.value)
                                }}/>
                            )}
                        </FormItem>
                        <FormItem className="course" {...formItemLayout_12} label="课程：">
                            {getFieldDecorator('course', {
                                rules: [{
                                    required: true,
                                    message: '请选择课程',
                                }],
                            })(
                                <Select
                                    style={{width: '100%'}}
                                    placeholder="请选择课程"
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
        courseList: []
    };

    showModal = () => {
        this.setState(
            {visible: true}
        )
    };

    getCourseList = (para) => {
        if (para) {
            reqwest({
                url: '/course/getCourseList',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    courseName: para,
                    pageNum: 1,
                    pageSize: 100
                },
                error: (XMLHttpRequest) => {
                    // const json = {
                    //     result: 0,
                    //     data: {
                    //         size: 20,
                    //         list: [
                    //             {id: 1, name: "最好的钢琴课"},
                    //             {id: 2, name: "最好的钢琴课"},
                    //             {id: 3, name: "最好的钢琴课"}
                    //         ]
                    //     }
                    // };
                },
                success: (json) => {
                    if (json.result === 0) {
                        this.setState({
                            courseList: json.data.list
                        })
                    }
                }
            })
        }
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false,
                courseList: []
            }, () => {
                form.resetFields();
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
            reqwest({
                url: '/indexRecommend/saveRecommendInfo',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    belongId: values.course,
                    type: 1,
                    sort: 0
                },
                error: (XMLHttpRequest) => {
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("视频课程添加成功");
                        form.resetFields();
                        this.setState({
                            visible: false,
                        });
                    }
                    this.props.setFlag()
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
                <Button type="primary" onClick={this.showModal}>选择</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    loading={false}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    courseList={this.state.courseList}
                    getCourseList={this.getCourseList}
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
            data: [{key: 1}],
            pagination: {
                current: 1,
                pageSize: 10
            },
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '课程名称',
                dataIndex: 'name',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '科目',
                dataIndex: 'typeName',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'typeName'),
            },
            {
                title: '所在机构',
                dataIndex: 'EName',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'EName'),
            },
            {
                title: '类型',
                dataIndex: 'courseType',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'courseType'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
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

    //获取信息
    getData = () => {
        reqwest({
            url: '/indexRecommend/getRecommendCourseList',
            type: 'json',
            method: 'post',
            data: {
                type: 1
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: [
                //         {
                //             id: 1,
                //             name: "天蓝书法课",
                //             typeName: "书法",
                //             courseType: 1,
                //             EName: "宁波新东方培训机构"
                //         }
                //     ]
                // };
            },
            success: (json) => {
                const data = [];
                if (json.result === 0) {
                    if (json.data) {
                        json.data.forEach((item, index) => {
                            let tempType = "";
                            if (item.courseType === 0) {
                                tempType = "线下课程"
                            }
                            if (item.courseType === 1) {
                                tempType = "视频课程"
                            }
                            data.push({
                                key: index.toString(),
                                id: item.id,
                                index: index + 1,
                                name: item.name + Math.round(Math.random() * 100),
                                typeName: item.typeName,
                                EName: item.EName,
                                courseType: tempType
                            });
                        });
                    }
                    this.setState({
                        data: data
                    })
                }
            }
        });
    };

    //页码变化处理
    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        })
    };

    //删除
    deleteItem = (para) => {
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
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("视频课程删除成功");
                    this.getData();
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
                      dataSource={this.state.data}
                      pagination={this.state.pagination}
                      columns={this.columns}
                      onChange={this.handleTableChange}/>;
    }
}

class VideoCourses extends Component {
    constructor(props) {
        super(props);
        this.state = {
            flag_add: false
        };
    };

    setFlag = () => {
        this.setState({
            flag_add: !this.state.flag_add
        })
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
            <div className="videoCourses">
                <header className="clearfix">
                    <span>课程列表</span>
                    <div className="add-button" style={{float: "right"}}>
                        <ItemAdd setFlag={this.setFlag}/>
                    </div>
                </header>
                <div className="table-box">
                    <DataTable flag_add={this.state.flag_add}/>
                </div>
            </div>
        )
    }
}

export default VideoCourses;