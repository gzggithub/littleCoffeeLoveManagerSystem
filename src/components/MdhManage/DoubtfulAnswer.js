import React, {Component} from 'react';
import {
    Table,
    Input,
    Form,
    List,
    Modal,
    message,
    Popconfirm,
    DatePicker,
    Select,
} from 'antd';
import '../../config/config.js';
import reqwest from 'reqwest';

const Search = Input.Search;
const {Option} = Select;

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//问题详情组件
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

    //时间处理
    dateHandle = (para) => {
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
            oTime = oYear + '-' + oMonth + '-' + oDay + " " + oHour + ":" + oMinute;
        return oTime;
    };

    getData = () => {
        reqwest({
            url: '/sys/doubts/getById',
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
                //         mdhDoubt: {
                //             id: 1,
                //             questions: "",
                //             userId: 1,
                //             photo1: "",
                //             photo2: "",
                //             photo3: "",
                //             createTime: "",
                //             state: null,
                //         }
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    json.data.doubts.createTime = json.data.doubts.createTime ? this.dateHandle(json.data.doubts.createTime) : "";
                    this.setState({
                        loading: false,
                        data: json.data.doubts
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
        this.setState({visible: false});
    };

    render() {
        let dataSource;
        if (this.state.data) {
            dataSource = [
                <div className="questions">
                    <span className="item-name">问题：</span>
                    <span className="item-content">{this.state.data.questions}</span>
                </div>,
                <div className="photo">
                    <span className="item-name">图片：</span>
                    <span style={{display: this.state.data.photo1 ? "none" : "inline"}}
                          className="item-content">无</span>
                    <img src={"http://image.taoerxue.com/" + this.state.data.photo1} alt="" className="item-content"/>
                    <img style={{marginLeft: "10px"}} src={"http://image.taoerxue.com/" + this.state.data.photo2} alt=""
                         className="item-content"/>
                    <img style={{marginLeft: "10px"}} src={"http://image.taoerxue.com/" + this.state.data.photo3} alt=""
                         className="item-content"/>
                </div>,
                <div className="createTime">
                    <span className="item-name">提问时间：</span>
                    <span className="item-content">{this.state.data.createTime}</span>
                </div>,
            ];
        } else {
            dataSource = ""
        }
        return (
            <a>
            {/*<a style={{display: this.props.opStatus ? "inline" : "none"}}>*/}
                <span onClick={this.showModal}>详情</span>
                <Modal
                    title="问题详情"
                    width={600}
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                    destroyOnClose={true}
                >
                    <div className="answerOne-details">
                        <div className="answerOne-baseData">
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

//答复列表表格
const ReplyListTable = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, pagination, data, columns, pageChange, loading} = props;

        return (
            <Modal
                width={1100}
                visible={visible}
                title="答复列表"
                footer={null}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
            >
                <div className="replyOne-list">
                    <Table bordered pagination={pagination} dataSource={data} columns={columns}
                           onChange={pageChange} loading={loading}/>
                </div>
            </Modal>
        );
    }
);

//答复列表组件
class ReplyList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            loading: true,
            data: [],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.replyOneSize) || 10,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            },
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '8%',
            },
             {
                title: '答复人',
                dataIndex: 'userId',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'userId'),
            },
            {
                title: '答复内容',
                dataIndex: 'value',
                width: '70%',
                render: (text, record) => this.renderColumns(text, record, 'value'),
            },
            {
                title: '答复时间',
                dataIndex: 'createTime',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            <Popconfirm title="确认删除?"
                                        placement="topRight"
                                        onConfirm={() => this.itemDelete(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="立即删除"
                                        cancelText="取消">
                                {<a>删除</a>}
                            </Popconfirm>
                        </div>
                    )
                }
            }
        ];
    }

    //时间处理
    dateHandle = (para) => {
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
            oTime = oYear + '-' + oMonth + '-' + oDay + " " + oHour + ":" + oMinute;
        return oTime;
    };

    //获取课时列表
    getData = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/doubtsAnswer/list',
            type: 'json',
            method: 'get',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                doubtsId: this.props.id
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                })
                // const json = {
                //     result: 0,
                //     data: {
                //         list: [
                //             {
                //                 id: 1,
                //                 userId: null,
                //                 answerDoubtsId: null,
                //                 answer: "",
                //                 createTime: "",
                //             },
                //             {
                //                 id: 2,
                //                 userId: null,
                //                 answerDoubtsId: null,
                //                 answer: "",
                //                 createTime: "",
                //             }
                //         ],
                //         size: 12
                //     }
                // };
            },
            success: (json) => {
                const data = [];
                if (json.result === 0) {
                    json.data.list.forEach((item, index) => {
                        data.push({
                            key: item.id,
                            id: item.id,
                            index: index + 1,
                            value: item.answer,
                            createTime: item.createTime ? this.dateHandle(item.createTime) : "",
                        });
                    });
                    this.setState({
                        loading: false,
                        data: data,
                        pagination: {
                            total: json.data.size,
                            current: this.state.pagination.current,
                            pageSize: this.state.pagination.pageSize,
                            pageSizeOptions: ["5", "10", "15", "20"],
                            showQuickJumper: true,
                            showSizeChanger: true
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
        })
    };

    //答复删除
    itemDelete = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/doubtsAnswer/delete?id=' + id,
            type: 'json',
            method: 'delete',
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
                    message.success("答复删除成功");
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

    showModal = () => {
        this.getData();
        this.setState({visible: true});
    };

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    //页码变化处理
    pageChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.replyOneSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.replyOneSize);
        this.setState({
            pagination: pager
        })
    };

    handleCancel = () => {
        this.setState({
            visible: false
        })
    };

    render() {
        return (
            <a>
                <span onClick={() => this.showModal(this.props.id)}>答复列表</span>
                <ReplyListTable
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    pagination={this.state.pagination}
                    loading={this.state.loading}
                    data={this.state.data}
                    columns={this.columns}
                    pageChange={this.pageChange}
                />
            </a>
        );
    }
}

//问题列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.answerOneSize) || 10,
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
                title: '问题',
                dataIndex: 'questions',
                // width: '40%',
                className: 'operating',
                render: (text, record) => this.renderColumns(text, record, 'questions'),
            },
            {
                title: '图片',
                dataIndex: 'photo',
                width: '8%',
                render: (text, record) => (record.photo ?
                    <img style={{width: '30px', height: "18px"}} alt="" src={record.photo}/> : <span>暂无</span>)
            },
            {
                title: '提问时间',
                dataIndex: 'createTime',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '状态',
                dataIndex: 'state',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'state'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                width: 300,
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*问题详情*/}
                            <ItemDetails id={record.id} toLoginPage={this.props.toLoginPage}
                                         opStatus={this.props.opObj.select}/>
                            {/*问题编辑*/}
                            {/*<ItemDetails id={record.id} toLoginPage={this.props.toLoginPage}
                                         opStatus={this.props.opObj.select}/>*/}
                            {/*问题删除*/}
                            <Popconfirm title="确认删除?"
                                        placement="topRight"
                                        onConfirm={() => this.itemDelete(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="立即删除"
                                        cancelText="取消">
                                <a>删除</a>
                                {/*<a style={{display: this.props.opObj.delete ? "inline" : "none"}}>删除</a>*/}
                            </Popconfirm>
                            {/*答复列表*/}
                            <ReplyList id={record.id} toLoginPage={this.props.toLoginPage}/>
                            <Popconfirm title="确认下架?"
                                        placement="topRight"
                                        onConfirm={() => this.itemBan(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="立即下架"
                                        cancelText="取消">
                                <a style={{display: record.stateCode === 0 && this.props.opObj.modify ? "inline" : "none"}}>下架</a>
                            </Popconfirm>
                            <Popconfirm title="确认上架?"
                                        placement="topRight"
                                        onConfirm={() => this.itemEnable(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="立即上架"
                                        cancelText="取消">
                                <a style={{display: record.stateCode === 2 && this.props.opObj.modify ? "inline" : "none"}}>上架</a>
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

    //时间处理
    dateHandle = (para) => {
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
            oTime = oYear + '-' + oMonth + '-' + oDay + " " + oHour + ":" + oMinute;
        return oTime;
    };

    dateHandle02 = (para) => {
        const add0 = (m) => {
            return m < 10 ? '0' + m : m;
        }
        //shijianchuo是整数，否则要parseInt转换
        const time = new Date(para),
            y = time.getFullYear(),
            m = time.getMonth()+1,
            d = time.getDate(),
            h = time.getHours(),
            mm = time.getMinutes(),
            s = time.getSeconds();
        return y + '-' + add0(m) + '-' + add0(d) + ' '+ add0(h) + ':' + add0(mm) + ':' + add0(s);
        // return y + '-' + add0(m) + '-' + add0(d);
    };

    //获取本页信息
    getData = (keyword) => {
        keyword = keyword === undefined ? this.props.keyword : keyword;
        let data = keyword ?
            {
                // question: keyword === undefined ? this.props.keyword : keyword,
                cityId: keyword ? keyword.cityCode : this.props.keyword.cityCode,
                question: keyword ? keyword.educationName : this.props.keyword.educationName,
                startTime: keyword ? keyword.startTime : this.props.keyword.startTime,
                endTime: keyword ? keyword.endTime : this.props.keyword.endTime,
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize
            }
            :
            {
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize
            };
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/doubts/list',
            type: 'json',
            method: 'get',
            data: data,
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
                //     data: {
                //         size: 100,
                //         list: [
                //             {
                //                 id: null,
                //                 questions: "",
                //                 userId: null,
                //                 photo1: "",
                //                 photo2: "",
                //                 photo3: "",
                //                 createTime: "",
                //                 state: null,
                //             },
                //         ]
                //     }
                // };
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
                        let tempState = "";
                        if (item.doubts.state === 0) {
                            tempState = "正常"
                        }
                        if (item.doubts.state === 2) {
                            tempState = "下架"
                        }
                        data.push({
                            key: index.toString(),
                            id: item.doubts.id,
                            index: index + 1,
                            questions: item.doubts.questions,
                            // photo: item.photoList ? (item.photoList[0].path) : "",
                            createTime: item.doubts.createTime ? this.dateHandle02(item.doubts.createTime) : "",
                            stateCode: item.doubts.state,
                            state: tempState
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
    itemBan = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/mdhAnswer/shelvesDoubt',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: id,
                state: 2
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("问题下架成功");
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

    //上架
    itemEnable = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/mdhAnswer/shelvesDoubt',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: id,
                state: 0
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("问题上架成功");
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
    itemDelete = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/doubts/delete?id=' + id,
            type: 'json',
            method: 'delete',
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
                    message.success("问题删除成功");
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
        localStorage.answerOneSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.answerOneSize);
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
        if (nextProps.keyword !== this.props.keyword) {
            this.getData(nextProps.keyword);
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

class DoubtfulAnswer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            type: 1,
            // 获取成长列表所需关键词
            keyword: {
                cityCode: "",
                educationName: "",
                // 初始化开始日期和结束日期
                startTime: null,
                endTime: null,
            },
            flag_add: false,
            treeData: [],
            // 日期禁选控制
            startValue: null,
            endValue: null,
            endOpen: false,
        };
        this.optionsType = [
            <Option key={1} value={1}>{"全部类型"}</Option>,
            <Option key={2} value={2}>{"父母成长"}</Option>,
            <Option key={3} value={3}>{"孩子成长"}</Option>,
            ];
        this.optionsCity = [<Option key={this.state.keyword.cityCode} value={this.state.keyword.cityCode}>{"全部"}</Option>];
    };

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
        console.log(1010101)
        // 菜单信息为空则直接返回登陆页
        if (!sessionStorage.menuListOne) {
            this.toLoginPage();
            return
        }
        JSON.parse(sessionStorage.menuListOne).forEach((item) => {
            item.children.forEach((subItem) => {                
                subItem.children.forEach((thirdItem) => {
                    if (thirdItem.url === this.props.location.pathname) {
                        let data = {};
                        thirdItem.children.forEach((fourthItem) => {
                            data[fourthItem.url] = true;
                        });
                        this.setState({
                            opObj: data
                        })
                    }
                })
                
            })
        });        
    };

    search = (value) => {
        this.setState({
            keyword: value
        })
    };

    // 城市列表 暂时不需要
    cityList = () => {
        reqwest({
            url: './city.json',
            type: 'json',
            method: 'get',
            success: (json) => {
                // for (let item in json) {
                //     console.log(item);
                //     this.optionsCity.push(
                //         // <OptGroup label={item}>
                //             {json.item.formEach((item, index)=>{
                //                 <Option key={item.id}>{item.name}</Option>
                //             })}
                //         // </OptGroup>
                //     )
                // }
                Object.keys(json).map((key) => {
                    json[key].forEach((item, index)=>{
                        this.optionsCity.push(
                            <Option key={item.id}>{item.name}</Option>
                        ) 
                    });
                    return false;
                });
            }
        });
    };

    //城市选择设置
    setCity = (value) => {
        console.log("selected:", value);
        this.setState({
            keyword: {
                cityCode: value,
                educationName: this.state.keyword.educationName,
                startTime: this.state.keyword.startTime,
                endTime: this.state.keyword.endTime,
            }
        })
    };

    // 名称关键词设置
    setName = (value) => {
        if (value !== this.state.keyword.educationName) {
            this.setState({
                keyword: {
                    cityCode: this.state.keyword.cityCode,
                    educationName: value,
                    startTime: this.state.keyword.startTime,
                    endTime: this.state.keyword.endTime,
                }
            })
        }
    };
    
    // 开始日期设置
    setStartTime = (date, dateString) => {
        this.setState({
            startValue: date,
            keyword: {
                cityCode: this.state.keyword.cityCode,
                educationName: this.state.keyword.educationName,
                startTime: dateString,
                endTime: this.state.keyword.endTime,
            }
        })
    };    

    // 结束日期设置
    setEndTime = (date, dateString) => {
        this.setState({
            endValue: date,
            keyword: {
                cityCode: this.state.keyword.cityCode,
                educationName: this.state.keyword.educationName,
                startTime: this.state.keyword.startTime,
                endTime: dateString,
            }
        })
    };

    // 禁用开始日期之前的日期
    disabledStartDate = (startValue) => {
        const endValue = this.state.endValue;
        if (!startValue || !endValue) {
            return false;
        }
        return startValue.valueOf() > endValue.valueOf();
    };

    // 禁用结束日期之后的日期
    disabledEndDate = (endValue) => {
        const startValue = this.state.startValue;
        if (!endValue || !startValue) {
          return false;
        }
        return endValue.valueOf() <= startValue.valueOf();
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
        console.log(9999);
        this.setPower();
        this.cityList();
        if (this.props.location.search) {
            this.props.history.push(this.props.location.pathname)
        }
    }

    componentWillReceiveProps(nextProps) {
        console.log(1212);
        if (nextProps.location.search) {
            this.props.history.push(nextProps.location.pathname);
            this.setFlag()
        }
    }

    render() {
        console.log(333333)
        console.log(this.state.opObj)
        return (
            <div className="answerOne">
                {
                    // this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                {/*城市筛选*/}
                                <Select defaultValue="全部展示城市"
                                        style={{
                                            width: "150px",
                                            float: "left",
                                            marginRight: "20px"
                                        }}
                                        onChange={this.setCity}>
                                    {this.optionsCity}
                                </Select>
                                {/*成长名称筛选*/}
                                <Search
                                    placeholder="请输入描述信息"
                                    onSearch={this.setName}
                                    enterButton
                                    style={{width: "240px", float: "left", marginRight: "20px"}}
                                />
                                {/*成长创建日期筛选*/}
                                <span>日期筛选： </span>
                                <DatePicker placeholder="请选择开始日期"
                                            style={{width: "150px"}}
                                            disabledDate={this.disabledStartDate}
                                            onChange={this.setStartTime}
                                            />
                                <span style={{margin: "0 10px"}}>至</span>
                                <DatePicker placeholder="请选择结束日期"
                                            style={{width: "150px"}}
                                            disabledDate={this.disabledEndDate}
                                            onChange={this.setEndTime}
                                            />
                                
                            </header>
                            <div className="table-box">
                                <DataTable
                                    opObj={this.state.opObj}
                                    keyword={this.state.keyword}
                                    flag_add={this.state.flag_add}
                                    toLoginPage={this.toLoginPage}/>
                            </div>
                        </div>
                        // :
                        // <p>暂无查询权限</p>
                }
            </div>
        )
    }
}

export default DoubtfulAnswer;