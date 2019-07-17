import React, {Component} from 'react';
import {
    Table,
    Input,
    DatePicker,
    Popconfirm,
    message
} from 'antd';
import '../../config/config';
import reqwest from 'reqwest';

const Search = Input.Search;

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);


//评价列表
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
                title: '评价人',
                dataIndex: 'nickname',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'nickname'),
            },            
            {
                title: '评价内容',
                dataIndex: 'content',
                className: 'operating',
                render: (text, record) => this.renderColumns(text, record, 'content'),
            },                 
            {
                title: '评价时间',
                dataIndex: 'createTime',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                width: 150,
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">                                                    
                            {/*评价删除*/}
                            <Popconfirm 
                                title="确认删除?"
                                placement="topRight"
                                onConfirm={() => this.itemDelete(record.id)}
                                onCancel=""
                                okType="danger"
                                okText="立即删除"
                                cancelText="取消">
                                <a>删除</a>
                                {/*<a style={{display: this.props.opObj.delete ? "inline" : "none"}}>删除</a>*/}
                            </Popconfirm>
                        </div>
                    )
                }
            }
        ];        
    }

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    };    

    //获取本页信息
    getData = (keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/comment/list',
            type: 'json',
            method: 'get',
            data: {
                // 评价内容
                content: keyword ? keyword.content : this.props.keyword.content,
                beginDate: keyword ? keyword.startTime : this.props.keyword.startTime,
                endDate: keyword ? keyword.endTime : this.props.keyword.endTime,
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({loading: false});
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
                        let tempCommentType = "";
                        if (item.commentType === 0) {
                            tempCommentType = "课程"
                        }
                        if (item.commentType === 1) {
                            tempCommentType = "机构"
                        }
                        if (item.commentType === 2) {
                            tempCommentType = "育儿"
                        }
                        if (item.commentType === 3) {
                            tempCommentType = "资讯"
                        }
                        
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,                        
                            nickname: item.nickname,
                            star: item.star,
                            content: item.content.length > 18 ? item.content.slice(0, 18) + '...' : item.content,
                            content_detail: item.content,
                            photo: item.resourceList,
                            targetId: item.targetId,                   
                            targetName: item.targetName,
                            createTime: item.createTime,
                            commentTypeCode: item.commentType,
                            commentType: tempCommentType,
                            userId: item.userId,
                        });
                    });
                    this.setState({
                        loading: false,
                        data: data,
                        pagination: {
                            total: json.data.total,
                            current: this.state.pagination.current,
                            pageSize: this.state.pagination.pageSize
                        }
                    });
                } else {
                    if (json.code === 901) {
                        message.error("请先登录");
                        
                        this.props.toLoginPage();// 返回登陆页
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");                        
                        this.props.toLoginPage();// 返回登陆页
                    } else {
                        message.error(json.message);
                        this.setState({loading: false})
                    }
                }
            }
        });
    };

    //评价删除
    itemDelete = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/comment/delete?id=' + id,
            type: 'json',
            method: 'delete',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("删除失败");
                this.setState({loading: false});
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("评价删除成功");
                    this.getData(this.props.keyword);
                } else {
                    if (json.code === 901) {
                        message.error("请先登录");                        
                        this.props.toLoginPage();// 返回登陆页
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");                        
                        this.props.toLoginPage();// 返回登陆页
                    } else {
                        message.error(json.message);
                        this.setState({loading: false});
                    }
                }
            }
        });
    };

    //表格参数变化处理
    handleTableChange = (pagination, filters) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.institutionPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.institutionPageSize);
        this.setState({
            type: filters.type ? filters.type[0] : null,
            status: filters.status ? filters.status[0] : null,
            pagination: pager,
        }, () => {
            this.getData();
        });
    };

    componentWillMount() {
        this.getData();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.keyword === this.props.keyword && nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData(nextProps.keyword);
    }

    render() {
        return <Table 
                    bordered
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    columns={this.columns}
                    scroll={{ x: 1500 }}
                    onChange={this.handleTableChange}/>;
    }
}

class EvaluationManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            // 获取评价列表所需关键词
            keyword: {
                content: "",
                // 初始化开始日期和结束日期
                startTime: null,
                endTime: null,
            },
            flag_add: false,
            // 日期禁选控制
            startValue: null,
            endValue: null,
        };        
    }

    getData = () => {
        this.refs.getDataCopy.getData();
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
        })
    };

    // 名称关键词设置
    setName = (value) => {
        console.log(value);
        if (value !== this.state.keyword.content) {
            this.setState({
                keyword: {
                    content: value,
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
                content: this.state.keyword.content,
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
                content: this.state.keyword.content,
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
            <div className="institutions">
                {
                    // this.state.opObj.select ?
                        <div>
                            <header className="clearfix" style={{height: "50px", lineHeight: "50px", background: "#FFF"}}>                               
                                {/*评价名称筛选*/}
                                <Search
                                    placeholder="请输入评价内容"
                                    onSearch={this.setName}
                                    enterButton
                                    style={{width: "240px", float: "left", margin: "10px 20px 0 0"}}/>
                                {/*评价创建日期筛选*/}
                                <span>日期筛选： </span>
                                <DatePicker 
                                    placeholder="请选择开始日期"
                                    style={{width: "150px"}}
                                    disabledDate={this.disabledStartDate}
                                    onChange={this.setStartTime}/>
                                <span style={{margin: "0 10px"}}>至</span>
                                <DatePicker 
                                    placeholder="请选择结束日期"
                                    style={{width: "150px"}}
                                    disabledDate={this.disabledEndDate}
                                    onChange={this.setEndTime}/>                               
                            </header>
                            {/*评价列表*/}
                            <div className="table-box" style={{background: "#FFF"}}>
                                <DataTable 
                                    ref="getDataCopy"
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

export default EvaluationManage;