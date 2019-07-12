import React, {Component} from 'react';
import {
    Table,
    Input,
    DatePicker,
    Popconfirm,
    message,
    List,
    Modal,
    Rate,
} from 'antd';
import '../../config/config';
import reqwest from 'reqwest';

const Search = Input.Search;

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

// 评价详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        data: "",
        loading: true
    };

    showModal = () => {
        console.log(this.props.record);
        this.setState({
            visible: true,
            data: this.props.record,
            loading: false
        });
    };

    handleCancel = () => {
        this.setState({
            visible: false
        });
    };

    render() {
        const tempPhoto = [];
        // const photo = [
        //     {'path':'http://image.taoerxue.cn/e07a160986e04112b16818cc9e620feb'},
        //     {'path':'http://image.taoerxue.cn/4896789ea82745b8b59c1c49ee6133f8'},
        //     {'path':'http://image.taoerxue.cn/e07a160986e04112b16818cc9e620feb'}
        // ]
        // if (photo) {
        //     photo.forEach((item, index) => {
        if (this.props.record.photo) {
            this.props.record.photo.forEach((item, index) => {
                tempPhoto.push(
                    <div style={{margin: "0 0 10px 50px"}}>
                        <img key={index} style={{width: '50%'}} alt="" 
                        src={item.path}/>
                    </div>
                    
                )
            })
        }
        // 列表dataSource生成
        let dataSource;
        if(this.state.data){
            dataSource = [
                <div>
                    <span className="item-name">评价人：</span>
                    <span className="item-content">{this.state.data.nickname}</span>
                </div>,
                <div>
                    <span className="item-name" style={{marginTop: "10px"}}>评分：</span>
                    <Rate disabled value={this.state.data.star} count={5} />
                </div>,
                <div>
                    <span className="item-name">评价内容：</span>
                    <span className="item-content">{this.state.data.content_detail}</span>
                </div>,
                <div>
                    <span className="item-name">图片：</span>
                </div>,
                <div>
                    {tempPhoto}
                </div>,
                <div>
                    <span className="item-name" style={{width: '140px'}}>被评机构/课程/资讯：</span>
                    <span className="item-content">{this.state.data.targetName}</span>
                </div>,
                <div>
                    <span className="item-name">评论类型：</span>
                    <span className="item-content">{this.state.data.commentType}</span>
                </div>,
                 <div>
                    <span className="item-name">评论时间：</span>
                    <span className="item-content">{this.state.data.createTime}</span>
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

//评价列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            // 评价类型表
            typeList: [],
            // 当前评价类型
            type: null,
            // 当前评价状态
            status: null,
            addStatus: false,
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
                title: '评分',
                dataIndex: 'star',
                width: '11%',
                render: (text, record) => {
                    return (
                        <Rate disabled value={record.star} count={5} />
                    )
                }
            }, 
            {
                title: '评价内容',
                dataIndex: 'content',
                className: 'operating',
                render: (text, record) => this.renderColumns(text, record, 'content'),
            },
            {
                title: '图片',
                dataIndex: 'photo',
                width: '16%',
                render: (text, record) => {
                    const tempPhoto = [];
                    if (record.photo) {
                        record.photo.forEach((item, index) => {
                            tempPhoto.push(
                                <img key={index} style={{width: '45px', height: "25px"}} alt="" 
                                    src={item.path}/>
                            )
                        })
                    }
                    return (
                        <div 
                            className="hove-photo-scale" 
                            style={{display: "flex", justifyContent: "space-around", alignItems: "center"}}>
                            {tempPhoto}                            
                        </div>
                    )
                }
            },          
            {
                title: '被评机构/课程/资讯',
                dataIndex: 'targetName',
                className: 'operating',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'targetName'),
            },
            {
                title: '评论类型',
                dataIndex: 'commentType',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'commentType'),
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
                            <ItemDetails 
                                record={record} 
                                opStatus={this.props.opObj.select}/>                         
                            {/*评价删除*/}
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

    setAdd = (type, para) => {
        if (type === "status") {
            this.setState({
                addStatus: para
            })
        }
        if (type === "flag") {
            this.setState({
                addFlag: !this.state.addFlag
            })
        }
    };

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

    dateHandle02 = (para) => {
        const add0 = (m) => {
            return m < 10 ? '0' + m : m;
        }
        //shijianchuo是整数，否则要parseInt转换
        const time = new Date(para),
            y = time.getFullYear(),
            m = time.getMonth()+1,
            d = time.getDate();       
        return y + '-' + add0(m) + '-' + add0(d);
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
                this.setState({
                    loading: false
                })
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
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("评价删除成功");
                    this.getData(this.props.keyword);
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
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix" style={{ height: "50px", lineHeight: "50px", background: "#FFF"}}>                               
                                {/*评价名称筛选*/}
                                <Search
                                    placeholder="请输入评价内容"
                                    onSearch={this.setName}
                                    enterButton
                                    style={{width: "240px", float: "left", margin: "10px 20px 0"}}
                                />
                                {/*评价创建日期筛选*/}
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
                            {/*评价列表*/}
                            <div className="table-box" style={{background: "#FFF",padding: "24px 24px 0"}}>
                                <DataTable 
                                        ref="getDataCopy"
                                        opObj={this.state.opObj} 
                                        keyword={this.state.keyword}
                                        flag_add={this.state.flag_add}
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

export default EvaluationManage;