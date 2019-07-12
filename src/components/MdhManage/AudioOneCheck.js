import React, {Component} from 'react';
import {
    Tabs,
    Table,
    Input,
    Modal,
    Form,
    message,
    List,
    Radio,
    Popconfirm
} from 'antd';
import '../../config/config.js';
import reqwest from 'reqwest';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const FormItem = Form.Item;
const {TextArea} = Input;
const RadioGroup = Radio.Group;
const confirm = Modal.confirm;

//栅格设置
const formItemLayout_8 = {
    labelCol: {span: 4},
    wrapperCol: {span: 8},
};
const formItemLayout_14 = {
    labelCol: {span: 4},
    wrapperCol: {span: 14},
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//音频详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        data: "",
        loading: true
    };

    showModal = () => {
        this.getData();
        this.setState({
            visible: true,
        })
    };

    //日期处理
    timeHandle = (para) => {
        const tempDate = new Date(para.replace("CST", "GMT+0800")),
            oMonthT = (tempDate.getMonth() + 1).toString(),
            oMonth = oMonthT.length <= 1 ? "0" + oMonthT : oMonthT,
            oDayT = tempDate.getDate().toString(),
            oDay = oDayT.length <= 1 ? "0" + oDayT : oDayT,
            oYear = tempDate.getFullYear().toString(),
            oHourT = tempDate.getHours().toString(),
            oHour = oHourT.length <= 1 ? "0" + oHourT : oHourT,
            oMinuteT = tempDate.getMinutes().toString(),
            oMinute = oMinuteT.length <= 1 ? "0" + oMinuteT : oMinuteT,
            oSecondT = tempDate.getSeconds().toString(),
            oSecond = oSecondT.length <= 1 ? "0" + oSecondT : oSecondT,
            oTime = oYear + '-' + oMonth + '-' + oDay + " " + oHour + ":" + oMinute + ":" + oSecond;
        return oTime;
    };

    getData = () => {
        reqwest({
            url: '/mdhListenBook/getDetail',
            type: 'json',
            method: 'post',
            data: {
                id: this.props.id
            },
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
                //     data: {
                //         mdhListenBook: {
                //             id: null,
                //             name: "",
                //             photo: "",
                //             type: null,
                //             duration: "",
                //             playbackNum: null,
                //             originalPrice: "",
                //             price: "",
                //             // linkAddress: "566355d55252dhytj25k554f5sdf2n55.mp3",
                //             createUser: "",
                //             createTime: "",
                //             examineUser: "",
                //             examineTime: "",
                //             opinion: "",
                //             state: null
                //         }
                //     },
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        data: json.data.mdhListenBook
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

    handleCancel = () => {
        this.setState({
            visible: false
        });
    };

    render() {
        let dataSource;
        if (this.state.data) {
            let tempType = "";
            if (this.state.data.type === 0) {
                tempType = "孩子听书";
            }
            if (this.state.data.type === 1) {
                tempType = "父母听书";
            }
            let tempState = "";
            if (this.state.data.state === 0) {
                tempState = "暂存";
            }
            if (this.state.data.state === 1) {
                tempState = "审核中";
            }
            if (this.state.data.state === 2) {
                tempState = "审核通过";
            }
            if (this.state.data.state === 3) {
                tempState = "审核驳回";
            }
            if (this.state.data.state === 4) {
                tempState = "已下架";
            }
            dataSource = [
                <div className="name">
                    <span className="item-name">音频名称：</span>
                    <span className="item-content">{this.state.data.name}</span>
                </div>,
                <div className="type">
                    <span className="item-name">音频类型：</span>
                    <span className="item-content">{tempType}</span>
                </div>,
                <div className="photo">
                    <span className="item-name">图片：</span>
                    <img src={"http://image.taoerxue.com/" + this.state.data.photo} alt="" className="item-content"/>
                </div>,
                <div className="duration">
                    <span className="item-name">音频时长：</span>
                    <span className="item-content">{this.state.data.duration}</span>
                </div>,
                <div className="playbackNum">
                    <span className="item-name">播放次数：</span>
                    <span className="item-content">{this.state.data.playbackNum}</span>
                </div>,
                <div className="originalPrice">
                    <span className="item-name">原价：</span>
                    <span className="item-content">￥{this.state.data.originalPrice}</span>
                </div>,
                <div className="price">
                    <span className="item-name">现价：</span>
                    <span className="item-content">￥{this.state.data.price}
                </span>
                </div>,
                <div className="linkAddress">
                    <span className="item-name">音频地址：</span>
                    <span
                        className="item-content">{this.state.data.linkAddress ? ("https://image.taoerxue.com/" + this.state.data.linkAddress) : "音频上传失败"}</span>
                </div>,
                <div className="createTime">
                    <span className="item-name">创建时间：</span>
                    <span
                        className="item-content">{this.state.data.createTime ? this.timeHandle(this.state.data.createTime) : ""}</span>
                </div>,
                <div className="examineTime">
                    <span className="item-name">审核时间：</span>
                    <span
                        className="item-content">{this.state.data.examineTime ? this.timeHandle(this.state.data.examineTime) : "暂无"}</span>
                </div>,
                <div className="opinion">
                    <span className="item-name">审核意见：</span>
                    <pre>
                    <span className="item-content">{this.state.data.opinion || "暂无"}</span>
                </pre>
                </div>,
                <div className="state">
                    <span className="item-name">状态：</span>
                    <span className="item-content">{tempState}</span>
                </div>
            ];
        } else {
            dataSource = ""
        }
        return (
            <a>
                <span onClick={this.showModal}>详情</span>
                <Modal title="音频详情"
                       width={600}
                       visible={this.state.visible}
                       footer={null}
                       onCancel={this.handleCancel}
                       destroyOnClose={true}>
                    <div className="audioOne-details item-details">
                        <div className="audioOne-baseData">
                            <List size="small"
                                  split="false"
                                  dataSource={dataSource}
                                  renderItem={item => (<List.Item>{item}</List.Item>)}
                                  loading={this.state.loading}/>
                        </div>
                    </div>
                </Modal>
            </a>
        );
    }
}

//音频审核表单
const ItemCheckForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, opinionStatus, setOpinionStatus, confirmLoading} = props;
        const {getFieldDecorator} = form;
        let opinionClass = "opinion noInput longItem unnecessary";
        if (opinionStatus) {
            opinionClass = "opinion noInput longItem"
        }

        return (
            <Modal
                visible={visible}
                title="音频审核"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="audioOneCheck-form">
                    <Form layout="vertical">
                        <FormItem className="state" {...formItemLayout_8} label="审核结果：">
                            {getFieldDecorator('state', {
                                rules: [{
                                    required: true,
                                    message: "审核结果不能为空"
                                }],
                            })(
                                <RadioGroup onChange={(event) => {
                                    setOpinionStatus(event.target.value)
                                }}>
                                    <Radio value={2}>通过</Radio>
                                    <Radio value={3}>驳回</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem className={opinionClass} {...formItemLayout_14} label="审核意见：">
                            {getFieldDecorator('opinion', {
                                rules: [{
                                    required: opinionStatus,
                                    message: '审核意见不能为空',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写审核意见"
                                          autosize={{minRows: 3, maxRows: 10}}/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//音频审核组件
class ItemCheck extends Component {
    state = {
        visible: false,
        opinionStatus: false,
        confirmLoading: false
    };

    showModal = () => {
        this.setState({
            visible: true
        })
    };

    setOpinionStatus = (value) => {
        if (value === 2) {
            this.setState({
                opinionStatus: false
            })
        }
        if (value === 3) {
            this.setState({
                opinionStatus: true
            })
        }
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState(
                {
                    visible: false
                }, () => {
                    this.setState({
                        opinionStatus: false,
                        confirmLoading: false
                    });
                }
            );
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
            if (values.state === 3 && !values.opinion) {
                message.error("驳回意见不能为空");
                return
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/mdhListenBook/reviewListenBook',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    id: this.props.id,
                    state: values.state,
                    opinion: values.opinion
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    });
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("音频审核成功");
                        this.setState(
                            {
                                visible: false
                            }, () => {
                                this.setState({
                                    opinionStatus: false,
                                    confirmLoading: false
                                });
                            }
                        );
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
            <a style={{display: this.props.state ? "inline" : "none"}}>
                <span onClick={() => this.showModal()}>审核</span>
                <ItemCheckForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    opinionStatus={this.state.opinionStatus}
                    setOpinionStatus={this.setOpinionStatus}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//音频列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.audioOneCheckSize) || 10,
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
                title: '音频名称',
                dataIndex: 'name',
                width: '25%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '类型',
                dataIndex: 'type',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'type'),
            },
            {
                title: '时长',
                dataIndex: 'duration',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'duration'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            <ItemDetails id={record.id}/>
                            <ItemCheck id={record.id} state={record.state === 1}
                                       recapture={this.getData}/>
                            <Popconfirm title="确认下架?"
                                        placement="topRight"
                                        onConfirm={() => this.itemWithdraw(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="确认"
                                        cancelText="取消">
                                <a style={{display: record.state === 2 ? "inline" : "none"}}>下架</a>
                            </Popconfirm>
                        </div>
                    );
                },
            }
        ]
    }

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    //获取本页信息
    getData = (type, keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/mdhListenBook/list',
            type: 'json',
            method: 'post',
            data: {
                state: type === undefined ? this.props.type : type,
                name: keyword === undefined ? this.props.keyword : keyword,
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
                });
            },
            success: (json) => {
                const data = [];
                if (json.result === 0) {
                    json.data.list.forEach((item, index) => {
                        let type = "";
                        if (item.type === 0) {
                            type = "孩子听书"
                        }
                        if (item.type === 1) {
                            type = "父母听书"
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            courseType: item.courseType,
                            index: index + 1,
                            name: item.name,
                            type: type,
                            duration: item.duration,
                            src: "http://image.taoerxue.com/" + item.linkAddress,
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

    //下架
    itemWithdraw = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/mdhListenBook/shelveListenBook',
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
                    message.success("音频下架成功");
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

    //页码变化处理
    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.audioOneCheckSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.audioOneCheckSize);
        this.setState({
            pagination: pager,
        }, () => {
            this.getData();
        });
    };

    componentWillMount() {
        this.getData();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.type !== this.props.type) {
            this.getData(nextProps.type, this.props.keyword);
        }
        if (nextProps.keyword !== this.props.keyword) {
            this.getData(this.props.type, nextProps.keyword);
        }
        if (nextProps.flag_add !== this.props.flag_add) {
            this.getData();
        }
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

class AudioOneCheck extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: "1",
            keyword: "",
            flag_add: false
        }
    };

    //tab状态设置
    setType = (value) => {
        this.setState({
            type: value
        })
    };

    search = (value) => {
        this.setState({
            keyword: value
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
            <div className="audioOne">
                <header className="clearfix">
                    <Tabs defaultActiveKey={this.state.type} onChange={this.setType}>
                        <TabPane tab="待审核" key="1"/>
                        <TabPane tab="审核通过" key="2"/>
                        <TabPane tab="已驳回" key="3"/>
                    </Tabs>
                </header>
                <div className="keyWord clearfix">
                    <Search
                        placeholder="请输入音频名称信息"
                        onSearch={this.search}
                        enterButton
                        style={{width: "320px", float: "left"}}
                    />
                </div>
                {/*课程列表*/}
                <div className="table-box">
                    <DataTable type={this.state.type} keyword={this.state.keyword} flag_add={this.state.flag_add}
                               toLoginPage={this.toLoginPage}/>
                </div>
            </div>
        )
    }
}

export default AudioOneCheck;