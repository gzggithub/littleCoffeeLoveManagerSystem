import React, {Component} from 'react';
import {
    Table,
    List,
    message,
    Modal,
    Popconfirm
} from 'antd';
import reqwest from 'reqwest';

const Cell = ({value}) => (
    <div>{value}</div>
);

//反馈详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        data: "",
        loading: true
    };

    getData = () => {
        reqwest({
            url: '/sys/question/getDetail',
            type: 'json',
            method: 'get',
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
                //         questionDetail: {
                //             id: 1,
                //             title: "",
                //             weChat: "",
                //             phone: "",
                //             userId: null,
                //             source: null,
                //             status: null
                //         }
                //     },
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        data: json.data,
                        loading: false
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

    showModal = () => {
        this.getData();
        this.setState({
            visible: true,
        })
    };

    handleCancel = () => {
        this.setState({
            visible: false
        });
    };

    render() {
        let tempSource = "";
        if (this.state.data.source === 0) {
            tempSource = "官网"
        }
        if (this.state.data.source === 1) {
            tempSource = "APP"
        }
        let tempStatus = "";
        if (this.state.data.status === 0) {
            tempStatus = "未处理"
        }
        if (this.state.data.status === 1) {
            tempStatus = "已处理"
        }
        // 列表dataSource生成
        let dataSource;
        if(this.state.data){
            dataSource = [
                <div>
                    <span className="item-name">联系电话：</span>
                    <span className="item-content">{this.state.data.phone || "暂无"}</span>
                </div>,
                <div>
                    <span className="item-name">微信：</span>
                    <span className="item-content">{this.state.data.weChat || "暂无"}</span>
                </div>,
                <div>
                    <span className="item-name">用户ID：</span>
                    <span className="item-content">{this.state.data.userId || "暂无"}</span>
                </div>,
                <div>
                    <span className="item-name">反馈内容：</span>
                    <span className="item-content">{this.state.data.content || "暂无"}</span>
                </div>,
                <div>
                    <span className="item-name">来源：</span>
                    <span className="item-content">{tempSource || "暂无"}</span>
                </div>,
                <div>
                    <span className="item-name">状态：</span>
                    <span className="item-content">{tempStatus}</span>
                </div>
            ];
        }else{
            // 详细信息不存在，则dataSource设为空字符串，列表展示为“暂无数据”
            dataSource=""
        }
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>详情</span>
                <Modal
                    title="用户反馈详情"
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                >
                    <div className="user-feedback-details">
                        <div className="user-feedback-baseData">
                            <List
                                size="small"
                                split="false"
                                dataSource={dataSource}
                                renderItem={item => (<List.Item>{item}</List.Item>)}
                                loading={this.state.loading}
                            />
                        </div>
                    </div>
                </Modal>
            </a>
        );
    }
}

//反馈列表
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
                width: 70,
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '手机号',
                dataIndex: 'phone',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'phone'),
            },
            {
                title: '微信',
                dataIndex: 'weChat',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'weChat'),
            },
            {
                title: '反馈内容',
                dataIndex: 'content',
                width: '40%',
                render: (text, record) => this.renderColumns(text, record, 'content'),
            },
            {
                title: '状态',
                dataIndex: 'status',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'status'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            <ItemDetails id={record.id} opStatus={this.props.opObj.select}/>
                            <Popconfirm title="确认处理?"
                                        placement="topRight"
                                        onConfirm={() => this.itemHandle(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="确认"
                                        cancelText="取消">
                                <a style={{display: this.props.opObj.modify ? "inline" : "none"}}>处理</a>
                            </Popconfirm>
                        </div>
                    );
                },
            }
        ];
    };

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    };

    //获取本页信息
    getData = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url:  '/sys/question/list',
            type: 'json',
            method: 'get',
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
                });
            },
            success: (json) => {
                const data = [];
                if (json.result === 0) {
                    if (json.data.list) {
                        json.data.list.forEach((item, index) => {
                            let tempStatus = "";
                            if (item.status === 0) {
                                tempStatus = "未处理"
                            }
                            if (item.status === 1) {
                                tempStatus = "已处理"
                            }
                            data.push({
                                key: index.toString(),
                                id: item.id,
                                index: index + 1,
                                weChat: item.weChat,
                                phone: item.phone,
                                content: item.content.length > 25 ? item.content.slice(0, 25) + "..." : item.content,
                                status: tempStatus
                            });
                        })
                    }
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

    //反馈处理
    itemHandle = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/question/ban',
            type: 'json',
            method: 'get',
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
                    message.success("用户反馈处理成功");
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

    //页码变化处理
    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.userFeedbackPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.userFeedbackPageSize);
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
        if (nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData();
    };

    render() {
        return <Table bordered
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={this.state.pagination}
                      columns={this.columns}
                      onChange={this.handleTableChange}/>;
    }
}

class UserFeedback extends Component {
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
        if (!sessionStorage.menuListOne) {
            this.toLoginPage();
            return
        }
        JSON.parse(sessionStorage.menuListOne).forEach((item) => {
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
            <div className="user-feedback">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix" style={{background: "#FFF", margin: "0", padding: "24px 24px 0"}}>
                                <span>用户反馈列表</span>
                            </header>
                            <div className="table-box" style={{background: "#FFF", padding: "24px"}}>
                                <DataTable opObj={this.state.opObj} flag_add={this.state.flag_add}
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

export default UserFeedback;