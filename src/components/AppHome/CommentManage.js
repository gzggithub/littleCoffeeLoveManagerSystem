import React, {Component} from 'react';
import {
    Table,
    Input,
    DatePicker,
    Popconfirm,
    message
} from 'antd';
// import { commentList, deleteComment } from '../../config';
// import { getPower, toLoginPage, pagination, handleTableChange, exceptHandle, errorHandle } from '../../config/common';
import * as common from '../../config/common';
import * as config from '../../config';

const Search = Input.Search;

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//评论列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            pagination: common.pagination
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: 70,
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '评论人',
                dataIndex: 'nickname',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'nickname'),
            },            
            {
                title: '评论内容',
                dataIndex: 'content',
                className: 'operating',
                render: (text, record) => this.renderColumns(text, record, 'content'),
            },                 
            {
                title: '评论时间',
                dataIndex: 'createTime',
                width: '15%',
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
                            {/*评论删除*/}
                            <Popconfirm 
                                title="确认删除?"
                                placement="topRight"
                                onConfirm={() => this.itemDelete(record.id)}
                                onCancel=""
                                okType="danger"
                                okText="立即删除"
                                cancelText="取消">
                                <a style={{display: this.props.opObj.delete ? "inline" : "none"}}>删除</a>
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

    dataHandle = (data) => {
        const result = [];
        data.forEach((item, index) => {                    
            result.push({
                key: index.toString(),
                id: item.id,
                index: index + 1,                        
                nickname: item.nickname,
                content: item.content.length > 20 ? item.content.slice(0, 20) + '...' : item.content,
                content_detail: item.content,
                createTime: item.createTime                      
            });
        });
        return result;
    };    

    //获取本页信息
    getData = (keyword) => {
        this.setState({loading: true});
        const params = {            
            content: keyword ? keyword.content : this.props.keyword.content,// 评论内容
            beginTime: keyword ? keyword.startTime : this.props.keyword.startTime,
            endTime: keyword ? keyword.endTime : this.props.keyword.endTime,
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize,
        };
        config.commentList(params).then((json) => {
            if (json.data.result === 0) {
                if (json.data.data.list.length === 0 && this.state.pagination.current !== 1) {
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
                this.setState({
                    loading: false,
                    data: this.dataHandle(json.data.data.list),
                    pagination: {
                        total: json.data.data.total,
                        current: this.state.pagination.current,
                        pageSize: this.state.pagination.pageSize
                    }
                });
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    //评论删除
    itemDelete = (id) => {
        this.setState({loading: true});
        config.deleteComment({id: id}).then((json) => {
            if (json.data.result === 0) {
                message.success("删除成功");
                this.getData(this.props.keyword);
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
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
                    // scroll={{ x: 1500 }}
                    onChange={(pagination) => common.handleTableChange(this, pagination)}/>;
    }
}

class EvaluationManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},            
            keyword: {// 获取评论列表所需关键词
                content: "",                
                startTime: null,// 初始化开始日期和结束日期
                endTime: null,
            },
            flag_add: false,            
            startValue: null,// 日期禁选控制
            endValue: null,
        };        
    }

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
        this.setState({opObj: common.getPower(this).data})
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
        this.setState({flag_add: !this.state.flag_add})
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
            <div className="institutions comment">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix" style={{height: "50px", lineHeight: "50px", background: "#FFF"}}>                               
                                {/*筛选*/}
                                <Search
                                    placeholder="请输入评论内容"
                                    onSearch={this.setName}
                                    enterButton
                                    style={{width: "240px", float: "left", margin: "10px 20px 0 0"}}/>
                                {/*日期筛选*/}
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
                            {/*列表*/}
                            <div className="table-box" style={{background: "#FFF"}}>
                                <DataTable 
                                    opObj={this.state.opObj} 
                                    keyword={this.state.keyword}
                                    flag_add={this.state.flag_add}
                                    toLoginPage={() => common.toLoginPage(this)}/>
                            </div>                               
                        </div>
                        :
                        <p>暂无查询权限</p>
                }
            </div>  
        )
    }
}

export default EvaluationManage;