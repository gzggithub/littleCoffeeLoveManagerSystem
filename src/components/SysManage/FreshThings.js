import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    List,
    Form,
    message,
    DatePicker,
    Popconfirm,
} from 'antd';
import reqwest from 'reqwest';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

const FormItem = Form.Item;
const {TextArea} = Input;
const {RangePicker} = DatePicker;

//栅格设置
const formItemLayout_14 = {
    labelCol: {span: 4},
    wrapperCol: {span: 14},
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//新增新鲜事表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="发布"
                width={750}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="notice-add notice-form fresh-thing-form">
                    <Form>
                        <FormItem className="body" {...formItemLayout_14} label="新鲜事内容：">
                            {getFieldDecorator('content', {
                                rules: [{
                                    required: true,
                                    max: 300,
                                    message: '请按要求填写新鲜事内容'
                                }]
                            })(
                                <TextArea 
                                    style={{resize: "none"}}
                                    placeholder="请填写新鲜事内容（不超过300字）"
                                    autosize={{minRows: 5, maxRows: 10}}/>
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <FormItem className="linkAddress" {...formItemLayout_14} label="链接：">
                            {getFieldDecorator('linkAddress', {
                                rules: [{
                                    required: false,
                                    message: '链接不能为空'
                                }]
                            })(
                                <Input placeholder="请输入链接"/>
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <FormItem className="effectiveTime" {...formItemLayout_14} label="有效期：">
                            {getFieldDecorator('effectiveTime', {
                                rules: [{
                                    type: 'array',
                                    required: true,
                                    message: '请选择有效期'
                                }]
                            })(
                                <RangePicker style={{width: '100%'}} separator='至' showTime format="YYYY-MM-DD HH:mm:ss" />
                            )}
                        </FormItem>
                        <div className="ant-line"></div>                        
                    </Form>
                </div>
            </Modal>
        );
    }
);

//新增新鲜事组件
class ItemAdd extends Component {
    state = {
        visible: false,
        confirmLoading: false,
        // 初始化开始日期和结束日期
        startTime: null,
        endTime: null,
        // 日期禁选控制
        startValue: null,
        endValue: null,
    };

    showModal = () => {
        this.setState({visible: true});
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button type="primary" onClick={this.showModal}>发布</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}                    
                    confirmLoading={this.state.confirmLoading}
                />
            </div>
        );
    }
}

//编辑新鲜事表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, startTime, endTime, confirmLoading} = props;
        const {getFieldDecorator} = form;
        
        console.log(startTime);
        console.log(endTime);
        console.log(typeof(startTime));
        return (
            <Modal
                visible={visible}
                title="编辑"
                width={850}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="notice-add notice-form fresh-thing-form">
                    <Form layout="horizontal">
                        <FormItem className="body" {...formItemLayout_14} label="新鲜事内容：">
                            {getFieldDecorator('content', {
                                initialValue: data.content,
                                rules: [{
                                    required: true,
                                    max: 300,
                                    message: '请按要求填写新鲜事内容'
                                }]
                            })(
                                <TextArea 
                                    style={{resize: "none"}}
                                    placeholder="请填写新鲜事内容（不超过300字）"
                                    autosize={{minRows: 5, maxRows: 10}}/>
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <FormItem className="linkAddress" {...formItemLayout_14} label="链接：">
                            {getFieldDecorator('linkAddress', {
                                initialValue: data.linkAddress,
                                rules: [{
                                    required: false,
                                    message: '链接不能为空'
                                }]
                            })(
                                <Input placeholder="请输入链接"/>
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <FormItem className="effectiveTime" {...formItemLayout_14} label="有效期：">
                            {getFieldDecorator('effectiveTime', {
                                initialValue: [
                                    moment(data.startTime, 'YYYY-MM-DD HH:mm:ss'),
                                    moment(data.endTime, 'YYYY-MM-DD HH:mm:ss')
                                ],
                                rules: [{
                                    type: 'array',
                                    required: true,
                                    message: '请选择有效期'
                                }]
                            })(
                                <RangePicker style={{width: '100%'}} separator='至' showTime format="YYYY-MM-DD HH:mm:ss" />
                            )}
                        </FormItem>
                        <div className="ant-line"></div>                        
                    </Form>
                </div>
            </Modal>
        );
    }
);

//编辑新鲜事组件
class ItemEdit extends Component {
    state = {
        visible: false,
        data: {},
        confirmLoading: false,
        // 初始化开始日期和结束日期
        startTime: null,
        endTime: null,
        // 日期禁选控制
        startValue: null,
        endValue: null,
    };

    showModal = () => {
        this.getData();
        this.setState({visible: true});
    };

    //获取当前记录的信息
    getData = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/somethingNew/getDetail',
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
                });               
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        data: json.data,
                        startTime: json.data.startTime,
                        endTime:  json.data.endTime,
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

    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false
        }, () => {
            this.setState({
                confirmLoading: false
            });
            form.resetFields();
        });
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            console.log(values.startTime);
            console.log(values.endTime);
            console.log(values.effectiveTime02)
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/sys/somethingNew/update',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    id: this.props.id,
                    content: values.content,
                    linkAddress: values.linkAddress,
                    startTime: values.effectiveTime[0].format('YYYY-MM-DD HH:mm:ss'),
                    endTime: values.effectiveTime[1].format('YYYY-MM-DD HH:mm:ss'),                   
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    });
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("新鲜事编辑成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                confirmLoading: false
                            });
                            this.props.recapture();
                        });
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
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>编辑</span>
                <ItemEditForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    data={this.state.data}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    startTime={this.state.startTime}
                    endTime={this.state.endTime}                    
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//新鲜事详情
class ItemDetails extends Component {
    state = {
        visible: false
    };

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        this.setState({visible: false});
    };

    render() {
        let dataSource;
        if(this.props.record){
            dataSource = [
                <div>
                    <span className="item-name">新鲜事内容：</span>
                    <span className="item-content">{this.props.record.contentCopy}</span>
                </div>,
                <div>
                    <span className="item-name">链接：</span>
                    <span className="item-content" style={{float: 'none'}}>{this.props.record.linkAddressCopy}</span>
                </div>,
                <div>
                    <span className="item-name">有效期：</span>
                    <span className="item-content">{this.props.record.effectiveTime}</span>
                </div>,

                <div>
                    <span className="item-name">发布时间：</span>
                    <span
                        className="item-content">{this.props.record.createTime}</span>
                </div>
            ];
        }else{
            dataSource=""
        }

        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>详情</span>
                <Modal
                    title="新鲜事详情"
                    width={600}
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                    destroyOnClose={true}
                >
                    <div className="notice-details fresh-things-details">
                        <div className="notice-baseData">
                            <List
                                size="small"
                                split="false"
                                dataSource={dataSource}
                                renderItem={item => (<List.Item>{item}</List.Item>)}
                            />
                        </div>
                    </div>
                </Modal>
            </a>
        );
    }
}

//新鲜事列表
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
                width: 70,
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '新鲜事内容',
                dataIndex: 'content',
                width: '25%',
                className: 'operating',
                render: (text, record) => this.renderColumns(text, record, 'content'),
            },
            {
                title: '有效时间',
                dataIndex: 'effectiveTime',
                wdith: '20%',
                render: (text, record) => this.renderColumns(text, record, 'effectiveTime')
            },
            {
                title: '链接',
                dataIndex: 'linkAddress',
                wdith: '30%',
                render: (text, record) => this.renderColumns(text, record, 'linkAddress')
            },
            {
                title: '发布时间',
                dataIndex: 'createTime',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*详情*/}
                            <ItemDetails 
                                id={record.id}
                                record={record}
                                opStatus={this.props.opObj.select}
                                toLoginPage={this.props.toLoginPage}/>
                            {/*编辑*/}
                            <ItemEdit 
                                id={record.id}
                                recapture={this.getData}
                                opStatus={this.props.opObj.select}
                                toLoginPage={this.props.toLoginPage}/>
                            {/*删除*/}
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

    //获取本页信息
    getData = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/somethingNew/list',
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
                            index: index + 1,
                            content: item.content.length > 20 ? item.content.slice(0, 20) + "..." : item.content,
                            contentCopy: item.content,
                            effectiveTime: item.startTime + ' 至 ' + item.endTime,
                            linkAddress: item.linkAddress.length > 50 ? item.linkAddress.slice(0, 50) + "..." : item.linkAddress,
                            linkAddressCopy: item.linkAddress,
                            createTime: item.createTime
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

    //页码变化处理
    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.noticePageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.noticePageSize);
        this.setState({
            pagination: pager,
        }, () => {
            this.getData();
        });
    };

    //新鲜事删除
    itemDelete = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/somethingNew/delete?id=' + para,
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
                    message.success("删除成功");
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
        return <Table 
                    bordered
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    columns={this.columns}
                    onChange={this.handleTableChange}/>;
    }
}

class FreshThings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            // 是否刷新列表
            flag_add: false
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
                    })
                    this.setState({
                        opObj: data
                    })
                }
            })
        })
    };
    
    // 刷新列表
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
        }
    }

    render() {
        return (
            <div className="notice">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd 
                                        opStatus={this.state.opObj.add}
                                        setFlag={this.setFlag}
                                        toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            <div className="table-box">
                                <DataTable 
                                    opObj={this.state.opObj}
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

export default FreshThings;