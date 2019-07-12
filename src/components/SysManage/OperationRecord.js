import React, {Component} from 'react';
import {
    Table,
    Input,
    Select,
    DatePicker,
    message
} from 'antd';
import reqwest from 'reqwest';

const Search = Input.Search;
const {Option} = Select;

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//日志列表
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
                title: '操作内容',
                dataIndex: 'content',
                className: 'operating',
                render: (text, record) => this.renderColumns(text, record, "content"),
            },
            {
                title: '操作类型',
                dataIndex: 'category',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'category'),
            },
            {
                title: '操作人',
                dataIndex: 'username',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'username'),
            },
            /*{
                title: '操作人类型',
                dataIndex: 'type',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'type'),
            },*/
            {
                title: '操作人手机号',
                dataIndex: 'phone',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'phone'),
            },
            {
                title: '操作时间',
                dataIndex: 'createTime',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            }
        ];
    }

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

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
            oTime = oYear + '-' + oMonth + '-' + oDay + " " + oHour + ":" + oMinute;
        return oTime;
    };

    //获取本页信息
    getData = (keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/record/list',
            type: 'json',
            method: 'get',
            data: {
                category: keyword ? keyword.category : this.props.keyword.category,
                startTime: keyword ? keyword.startTime : this.props.keyword.startTime,
                endTime: keyword ? keyword.endTime : this.props.keyword.endTime,
                phone: keyword ? keyword.phone : this.props.keyword.phone,
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
                // const json = {
                //     result: 0,
                //     data: {
                //         size: 100,
                //         list: [
                //             {
                //                 id: 1,
                //                 userId: null,
                //                 username: "",
                //                 phone: "",
                //                 type: null,
                //                 content: "",
                //                 category: null,
                //                 createTime: "",
                //             }
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
                        let category = "";
                        if (item.category === 0) {
                            category = "创建"
                        }
                        if (item.category === 1) {
                            category = "修改"
                        }
                        if (item.category === 2) {
                            category = "删除"
                        }
                        if (item.category === 3) {
                            category = "审核"
                        }
                        if (item.category === 4) {
                            category = "封禁"
                        }
                        if (item.category === 5) {
                            category = "上架"
                        }
                        if (item.category === 6) {
                            category = "下架"
                        }
                        let type = "";
                        if (item.type === 0) {
                            type = "系统管理员"
                        }
                        if (item.type === 1) {
                            type = "机构管理员"
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            username: item.username,
                            type: type,
                            phone: item.phone,
                            content: item.content,
                            category: category,
                            createTime: item.createTime,
                            // createTime: item.createTime ? this.timeHandle(item.createTime) : ""
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
        localStorage.operationRecordPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.operationRecordPageSize);
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
            return
        }
        if (nextProps.flag_add !== this.props.flag_add) {
            this.getData();
            return
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

class OperationRecord extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 操作日志列表所需关键词
            keyword: {
                // 操作类型
                category: null,
                // 开始时间
                startTime: "",
                // 结束时间
                endTime: "",
                // 操作人手机号
                phone: ""
            },
            flag_add: false,
            // 日期禁选控制
            startValue: null,
            endValue: null,
        }
    };

    // 筛选关键词设置
    setCategory = (value) => {
        if (this.state.keyword.category === value) {
            return
        }
        this.setState({
            keyword: {
                category: value,
                startTime: this.state.keyword.startTime,
                endTime: this.state.keyword.endTime,
                phone: this.state.keyword.phone
            }
        })
    };

    // 开始日期设置
    setStartTime = (date, dateString) => {
        if (this.state.keyword.startTime === dateString) {
            return
        }
        this.setState({
            startValue: date,
            keyword: {
                category: this.state.keyword.category,
                startTime: dateString,
                endTime: this.state.keyword.endTime,
                phone: this.state.keyword.phone
            }
        })
    };

    // 结束日期设置
    setEndTime = (date, dateString) => {
        if (this.state.keyword.endTime === dateString) {
            return
        }
        this.setState({
            endValue: date,
            keyword: {
                category: this.state.keyword.category,
                startTime: this.state.keyword.startTime,
                endTime: dateString,
                phone: this.state.keyword.phone
            }
        })
    };

    // 禁用开始日期之前的日期
    disabledStartDate = (startValue) => {
        const endValue = this.state.endValue;
        if (!startValue || !endValue) {
            return false;
        }
        return (startValue.valueOf() + 60*60*24*1000) > endValue.valueOf();
    };

    // 禁用结束日期之后的日期
    disabledEndDate = (endValue) => {
        const startValue = this.state.startValue;
        if (!endValue || !startValue) {
          return false;
        }
        return endValue.valueOf() <= (startValue.valueOf() + 60*60*24*1000);
    };

    // 设置手机号
    setPhone = (value) => {
        if (this.state.keyword.phone === value) {
            return
        }
        this.setState({
            keyword: {
                category: this.state.keyword.category,
                startTime: this.state.keyword.startTime,
                endTime: this.state.keyword.endTime,
                phone: value
            }
        })
    }

    setFlag = () => {
        this.setState({
            flag_add: !this.state.flag_add
        })
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
                    })
                    this.setState({
                        opObj: data
                    })
                }
            })
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
            <div className="notice">
                {
                    this.state.opObj.select ? 
                        <div>
                            <header className="clearfix">
                                {/*类型筛选栏*/}
                                <Select defaultValue={null} style={{width: "120px", float: "left", marginRight: "20px"}}
                                        onChange={this.setCategory}>
                                    <Option key={0} value={null}>{"全部"}</Option>
                                    <Option key={1} value="0">{"创建"}</Option>
                                    <Option key={2} value="1">{"修改"}</Option>
                                    <Option key={3} value="2">{"删除"}</Option>
                                    <Option key={4} value="3">{"审核"}</Option>
                                    <Option key={5} value="4">{"封禁"}</Option>
                                    <Option key={6} value="5">{"上架"}</Option>
                                    <Option key={7} value="6">{"下架"}</Option>
                                </Select>
                                {/*日期筛选栏*/}
                                <span>日期筛选： </span>
                                <DatePicker placeholder="请选择开始日期"
                                            style={{width: "150px"}}
                                            onChange={this.setStartTime}
                                            disabledDate={this.disabledStartDate}/>
                                <span style={{margin: "0 10px"}}>至</span>
                                <DatePicker placeholder="请选择结束日期"
                                            style={{width: "150px"}}
                                            onChange={this.setEndTime}
                                            disabledDate={this.disabledEndDate}/>
                                {/*手机号筛选*/}
                                <Search
                                    placeholder="请输入操作人手机号"
                                    onSearch={this.setPhone}
                                    enterButton
                                    style={{width: "320px", marginLeft: "20px"}}
                                />
                            </header>
                            <div className="table-box">
                                <DataTable keyword={this.state.keyword} flag_add={this.state.flag_add}
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

export default OperationRecord;