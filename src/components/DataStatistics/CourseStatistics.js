import React, {Component} from 'react';
import {
    Table,
    DatePicker,
    message
} from 'antd';
import reqwest from 'reqwest';

// 单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

// 统计列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            // 当前排序方式
            sortOrder: null,
            pagination: {
                current: 1,
                pageSize: Number(localStorage.courseStatisticsPageSize) || 10,
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
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '所属机构',
                dataIndex: 'eName',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'eName'),
            },
            {
                title: '科目',
                dataIndex: 'type',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'type'),
            },
            {
                title: '访问量',
                dataIndex: 'queryNum',
                width: '8%',
                sorter: true,
                render: (text, record) => this.renderColumns(text, record, '访问量'),
            },
            {
                title: '创建日期',
                dataIndex: 'createTime',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
        ];
    }

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    // 日期处理函数
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

    //获取本页信息
    getData = (keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/queryPayCourse/getStatisticsCourseList',
            type: 'json',
            method: 'post',
            data: {
                sort: this.state.sortOrder,
                startTime: keyword ? keyword.startTime : this.props.keyword.startTime,
                endTime: keyword ? keyword.endTime : this.props.keyword.endTime,
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
                //                 createTime: "Sat Nov 24 00:00:00 CST 2018",
                //                 eduName: "",
                //                 id: null,
                //                 name: "",
                //                 parentTypeName: "",
                //                 price: "",
                //                 queryNum: 1,
                //                 typeName: "",
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
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            eName: item.EName || item.eduName,
                            index: index + 1,
                            name: item.name,
                            queryNum: item.queryNum,
                            type: item.parentTypeName + "/" + item.typeName,
                            createTime: item.createTime ? this.dateHandle(item.createTime) : "",
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

    //表格参数变化处理
    handleTableChange = (pagination, filters, sorter) => {
        let sortOrder = null;
        if (sorter.order === "ascend") {
            sortOrder = "asc"
        }
        if (sorter.order === "descend") {
            sortOrder = "desc"
        }
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.courseStatisticsPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.courseStatisticsPageSize);
        this.setState({
            sortOrder: sortOrder,
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

class CourseStatistics extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 统计列表所需关键词
            keyword: {
                // 开始时间
                startTime: "",
                // 结束时间
                endTime: "",
            },
            flag_add: false
        }
    };

    // 筛选关键词设置
    setStartTime = (date, dateString) => {
        if (this.state.keyword.startTime === dateString) {
            return
        }
        this.setState({
            keyword: {
                startTime: dateString,
                endTime: this.state.keyword.endTime,
            }
        })
    };
    setEndTime = (date, dateString) => {
        if (this.state.keyword.endTime === dateString) {
            return
        }
        this.setState({
            keyword: {
                startTime: this.state.keyword.startTime,
                endTime: dateString,
            }
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
            <div className="courseStatistics">
                <header className="clearfix">
                    {/*日期筛选栏*/}
                    <DatePicker placeholder="请选择日期"
                                style={{width: "120px"}}
                                onChange={this.setStartTime}/>
                    <span style={{margin: "0 10px"}}>至</span>
                    <DatePicker placeholder="请选择日期"
                                style={{width: "120px"}}
                                onChange={this.setEndTime}/>
                </header>
                <div className="table-box">
                    <DataTable keyword={this.state.keyword} flag_add={this.state.flag_add}
                               toLoginPage={this.toLoginPage}/>
                </div>
            </div>
        )
    }
}

export default CourseStatistics;