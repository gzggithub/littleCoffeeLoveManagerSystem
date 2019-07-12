import React, {Component} from 'react';
import { 
    Route,
    Link,
    Switch,
    withRouter,
} from 'react-router-dom';
import {
    Table,
    Input,
    message,
    Popconfirm,
} from 'antd';
import reqwest from 'reqwest';
import UserDetail from './UserDetail';

const Search = Input.Search;

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//用户列表
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
                title: '昵称',
                dataIndex: 'nickname',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'nickname'),
            },
            {
                title: '头像',
                dataIndex: 'photo',
                width: '5%',
                render: (text, record) => (
                    <div className="hove-photo-scale">
                        <img style={{width: '30px', height: "30px"}} alt="" src={record.photo}/>
                    </div>
                )
            },
            {
                title: '手机号',
                dataIndex: 'phone',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'phone')
            },
            {
                title: '孩子个数',
                dataIndex: 'childrenNum',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'childrenNum')
            },
            {
                title: '所在位置',
                dataIndex: 'address',
                className: 'operating',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'address')
            },
            {
                title: '学生类型',
                dataIndex: 'studentType',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'studentType')
            },
            {
                title: '期望发展方面',
                dataIndex: 'expectation',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'expectation')
            },
            {
                title: '注册时间',
                dataIndex: 'registerTime',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'registerTime')
            },
            {
                title: '状态',
                dataIndex: 'status',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'status')
            },
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*用户详情组件*/}
                            <Link 
                                to={"./user-detail?" + record.id}
                                style={{display: this.props.opObj.select ? "inline" : "none"}}
                                >详情</Link>
                            <Popconfirm title={record.status === "正常" ? "确认禁用？" : "确认启用？"}
                                        placement="topRight"
                                        onConfirm={() => this.itemStatus(record.id, record.status)}
                                        onCancel=""
                                        okType="danger"
                                        okText="确认"
                                        cancelText="取消">
                                <a style={{display: this.props.opObj.ban ? "inline" : "none"}}>{record.status === "正常" ? "禁用" : "启用"}</a>
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
    getData = (keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/appUser/list',
            type: 'json',
            method: 'get',
            data: {
                phone: keyword ? keyword.name : this.props.keyword.name,
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
            },
            success: (json) => {
                const data = [];
                if (json.result === 0) {
                    // 现有用户数量写入
                    this.props.setTotal(json.data.total);
                    // expectation : 期望（1-学业 2-兴趣爱好 4-智力开发)
                    if (json.data.list.length) {
                        json.data.list.forEach((item, index) => {
                            let tempExpectation01 = [];
                            if (item.expectation) {
                                console.log(item.expectation.split(","))
                                let tempExpectation = item.expectation.split(",");
                                
                                tempExpectation.forEach((subItem, subIndex) => {
                                    if(subItem === "1") {
                                        tempExpectation01.push("学业");
                                    }
                                    if (subItem === "2" ) {
                                        tempExpectation01.push("兴趣爱好");
                                    }
                                    if (subItem === "4") {
                                        tempExpectation01.push("智力开发");
                                    }
                                })
                            }                            
                            data.push({
                                key: index.toString(),
                                id: item.id,
                                index: index + 1,
                                photo: item.photo,
                                nickname: item.nickname,
                                phone: item.phone,
                                childrenNum: item.childrenNum || 0,
                                address: item.address,
                                studentType: item.studentType,
                                expectation: tempExpectation01.join('/'),
                                registerTime: item.createTime,
                                // 0-正常 1-禁用
                                status: item.status ? "禁用" : "正常"
                            });
                        });
                    }
                    console.log(data)
                    this.setState({
                        loading: false,
                        data: data,
                        // 数据总量写入分页参数以确定分页数量
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

    //帐号封禁与启用
    itemStatus = (id, status) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/appUser/ban',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: id,
                // 0-正常 1-禁用
                status: status === "正常" ? 1 : 0
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success(status === "正常" ? "帐号禁用成功" : "帐号启用成功");
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
        })
    };

    //表格参数变化处理
    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.userPageSige = pagination.pageSize;
        pager.pageSize = Number(localStorage.userPageSige);
        this.setState({
            pagination: pager,
        }, () => {
            // 信息分页请求时，表格参数有变更需重新拉取列表
            this.getData();
        });
    };

    componentWillMount() {
        this.getData();
    }

    componentWillReceiveProps(nextProps) {
        //keyword, flag_add改变，则重新获取列表内容
        if (nextProps.keyword === this.props.keyword && nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData(nextProps.keyword);
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

class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            // 当前用户数量
            total: 0,
            flag_add: false,
            editStatus: false,
            editFlag: false,
            editId: "",
            // 列表筛选关键词
            keyword: {
                name: "",
            },
        }
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

    // 当前用户数量写入
    setTotal = (value) => {
        this.setState({
            total: value,
        })
    };

    // 名称关键词设置
    setName = (value) => {
        console.log(value);
        if (value !== this.state.keyword.name) {
            this.setState({
                keyword: {
                    name: value,
                }
            })
        }
    };

    // 资讯编辑相关状态变量设置
    setEdit = (type, para, id) => {
        if (type === "status") {
            this.setState({
                editStatus: para,
                editId: id
            })
        }
        if (type === "flag") {
            this.setState({
                editFlag: !this.state.editFlag
            })
        }
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
            <div className="users">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix" style={{background: "#FFF", padding: "24px"}}>
                                {/*用户名称筛选*/}
                                <Search
                                    placeholder="请输入用户名称或手机号"
                                    onSearch={this.setName}
                                    enterButton
                                    style={{width: "320px", float: "left", marginRight: "20px"}}
                                />
                            </header>
                            <div className="clearfix" style={{background: "#FFF", padding: "24px 24px 0"}}>                                  
                                <span>用户列表</span>
                                {/*当前用户数量*/}
                                <span
                                    style={{float: "right"}}>{this.state.total ? ("已有用户：" + this.state.total) : ""}</span>
                            </div>
                            <div className="table-box" style={{background: "#FFF", padding: "24px"}}>
                                <DataTable 
                                    opObj={this.state.opObj} 
                                    setTotal={this.setTotal} 
                                    setEdit={this.setEdit}
                                    editFlag={this.state.editFlag}
                                    keyword={this.state.keyword}
                                    flag_add={this.state.flag_add} 
                                    toLoginPage={this.toLoginPage}/>
                            </div>

                            <Switch>
                                <Route path="./UserDetail" component={UserDetail}></Route>                               
                            </Switch>

                            {/*资讯编辑组件*/}
                            {/*<ItemEdit 
                                      status={this.state.editStatus}
                                      setEdit={this.setEdit}
                                      // channels={this.state.typeList}
                                      // provinceList={this.state.provinceList}
                                      id={this.state.editId}
                                      toLoginPage={this.toLoginPage}/>*/}
                        </div>
                        :
                        <p>暂无查询权限</p>
                }
            </div>
        )
    }
}

export default withRouter(Users);