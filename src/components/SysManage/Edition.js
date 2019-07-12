import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    Form,
    message,
    Radio,
    Tabs,
    Select,
} from 'antd';
import reqwest from 'reqwest';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const {TextArea} = Input;
const RadioGroup = Radio.Group;
const confirm = Modal.confirm;
const {Option} = Select;

//栅格设置
const formItemLayout_14 = {
    labelCol: {span: 4},
    wrapperCol: {span: 14},
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//新增版本表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, type, applicationType, setApplicationType, channelList, confirmLoading} = props;
        const {getFieldDecorator} = form;
        
        const tempChannelList = [];
        channelList.forEach((item, index) => {
            tempChannelList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>)
        })
        
        return (
            <Modal
                visible={visible}
                title="新增版本"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="appEdition-add appEdition-form">
                    <Form layout="vertical">
                        <FormItem className="type" {...formItemLayout_14} label="类型：">
                            {getFieldDecorator('type', {
                                initialValue: type,
                                rules: [{
                                    required: true,
                                    message: '请选择app类型',
                                }],
                            })(
                                <RadioGroup>
                                    <Radio value={1}>IOS</Radio>
                                    <Radio value={2}>安卓</Radio>
                                    <Radio value={0}>后台</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem className="applicationMarket" style={{display: type === 2 ? "block" : "none"}} {...formItemLayout_14} label="当前应用市场：">
                            {getFieldDecorator('applicationType', {
                                initialValue: applicationType,
                                rules: [{
                                    required: true,
                                    message: '应用市场不能为空'
                                }]
                            })(
                                <Select 
                                    // style={{width: "150px", float: "left", marginRight: "20px"}}
                                    onChange={setApplicationType} 
                                    placeholder="请选择类型"
                                    disabled
                                    allowClear>
                                    {tempChannelList}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem className="edition" {...formItemLayout_14} label="版本号：">
                            {getFieldDecorator('code', {
                                rules: [{
                                    required: true,
                                    message: '版本号不能为空'
                                }]
                            })(
                                <Input placeholder="请输入版本号"/>
                            )}
                        </FormItem>                        
                        {/*<FormItem className="code" {...formItemLayout_8} label="Code：">
                            {getFieldDecorator('code', {
                                rules: [{
                                    required: true,
                                    message: 'Code不能为空'
                                }]
                            })(
                                <InputNumber min={0} precision={0} step={1}/>
                            )}
                        </FormItem>*/}
                        <FormItem className="compulsoryUpgradeCode unnecessary" {...formItemLayout_14} label="更新Code：">
                            {getFieldDecorator('compulsoryUpgradeCode', {
                                rules: [{
                                    required: false
                                }]
                            })(
                                // <InputNumber min={1} max={2} precision={0} step={1}/>
                                <RadioGroup>
                                    <Radio value={1}>是</Radio>
                                    <Radio value={2}>否</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem className="description unnecessary longItem" {...formItemLayout_14} label="发版说明：">
                            {getFieldDecorator('description', {
                                rules: [{
                                    required: false,
                                    message: '请按要求填写发版说明',
                                    max: 100
                                }]
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写发版说明（100字以内）"
                                          autosize={{minRows: 3, maxRows: 10}}/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//新增版本组件
class ItemAdd extends Component {
    state = {
        visible: false,
        confirmLoading: false,
        applicationType01: 0,
    };

    showModal = () => {
        this.setState({visible: true});
        console.log(this.props.type);
        console.log(this.props.applicationType);
    };

    setApplicationType = (value) => {
        console.log(value)
        this.setState({
            applicationType01: value
        })
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
                    confirmLoading: false
                });
            })
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
            // let tempChannelName = "";
            // if (values.type === 2) {
            //     this.props.channelList.forEach((item, index) => {
            //         if (item.id === values.channelId) {
            //             tempChannelName = item.name
            //         }
            //     })
            // }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/sys/edition/save',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: values.type === 2 ?
                {
                    type: values.type,
                    channelId: values.applicationType,
                    description: values.description,
                    code: values.code,               
                    forceUpdate: values.compulsoryUpgradeCode,
                }
                : 
                {
                    type: values.type,
                    // iosEdition: values.type === 1 ? values.edition : "",
                    // androidEdition: values.type === 2 ? values.edition : "",
                    description: values.description,
                    code: values.code,               
                    forceUpdate: values.compulsoryUpgradeCode,
                    // compulsoryUpgradeCode: values.compulsoryUpgradeCode,
                    // forceUpdate: values.forceUpdate,
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    });
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("版本发布成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                confirmLoading: false
                            });
                        });
                        this.props.setFlag();
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
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button type="primary" onClick={this.showModal}>版本发布</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    type={this.props.type}
                    applicationType={this.props.applicationType}
                    channelList={this.props.channelList}
                    setApplicationType={this.setApplicationType}
                    confirmLoading={this.state.confirmLoading}
                />
            </div>
        );
    }
}

//修改版本表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, type, applicationType, setApplicationType, channelList, confirmLoading} = props;
        const {getFieldDecorator} = form;
        
        const tempChannelList = [];
        channelList.forEach((item, index) => {
            tempChannelList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>)
        })

        console.log(applicationType)

        return (
            <Modal
                visible={visible}
                title="版本号编辑"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="appEdition-edit appEdition-form">
                    <Form layout="vertical">
                        <FormItem className="type" {...formItemLayout_14} label="类型：">
                            {getFieldDecorator('type', {
                                initialValue: type,
                                rules: [{
                                    required: true,
                                    message: '请选择app类型',
                                }],
                            })(
                                <RadioGroup>
                                    <Radio value={1}>IOS</Radio>
                                    <Radio value={2}>安卓</Radio>
                                    <Radio value={0}>后台</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem className="applicationMarket" style={{display: type === 2 ? "block" : "none"}} {...formItemLayout_14} label="当前应用市场：">
                            {getFieldDecorator('applicationType', {
                                initialValue: data.channelId || '',
                                rules: [{
                                    required: false,
                                    message: '应用市场不能为空'
                                }]
                            })(
                                <Select
                                    onChange={setApplicationType} 
                                    placeholder="请选择类型"
                                    disabled
                                    allowClear>
                                    {tempChannelList}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem className="edition" {...formItemLayout_14} label="版本号：">
                            {getFieldDecorator('code', {
                                initialValue: data.code,
                                rules: [{
                                    required: true,
                                    message: '版本号不能为空'
                                }]
                            })(
                                <Input placeholder="请输入版本号"/>
                            )}
                        </FormItem>
                        <FormItem className="compulsoryUpgradeCode unnecessary" {...formItemLayout_14} label="更新Code：">
                            {getFieldDecorator('compulsoryUpgradeCode', {
                                initialValue: data.forceUpdate,
                                rules: [{
                                    required: false
                                }]
                            })(
                                // <InputNumber min={1} max={2} precision={0} step={1}/>
                                <RadioGroup>
                                    <Radio value={1}>是</Radio>
                                    <Radio value={2}>否</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem className="description unnecessary longItem" {...formItemLayout_14} label="发版说明：">
                            {getFieldDecorator('description', {
                                initialValue: data.description,
                                rules: [{
                                    required: false,
                                    message: '请按要求填写发版说明',
                                    max: 100
                                }]
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写发版说明（100字以内）"
                                          autosize={{minRows: 3, maxRows: 10}}/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//修改版本组件
class ItemEdit extends Component {
    state = {
        visible: false,
        data: {},
        confirmLoading: false
    };

    getData = () => {
        this.setState({
            data: this.props.data || this.state.data
        })
    };

    showModal = () => {
        console.log(this.props.data);
        console.log(this.props.record)
        this.getData();
        this.setState({
            visible: true,
        })
    };

    // 信息比对函数
    dataContrast = (values) => {
        const initValues = this.state.data;
        let itemList = [];
        if (initValues.type === 1) {
            itemList = ["iosEdition", "description", "code", "compulsoryUpgradeCode"]
        }
        if (initValues.type === 2) {
            itemList = ["androidEdition", "description", "code", "compulsoryUpgradeCode"]
        }
        if (initValues.type === 0) {
            itemList = ["managerEdition", "description", "code", "compulsoryUpgradeCode"]
        }
        const result = {};
        itemList.forEach((item) => {
            if (values[item] !== initValues[item]) {
                result[item] = values[item];
            }
        });
        if (JSON.stringify(result) === "{}") {
            return false;
        } else {
            result.id = this.state.data.id;
            return result;
        }
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
                    data: {},
                    confirmLoading: false
                });
            })
        };
        form.validateFields((err, values) => {
            values.iosEdition = this.state.data.type === 1 ? values.edition : "";
            values.androidEdition = this.state.data.type === 2 ? values.edition : "";
            values.managerEdition = this.state.data.type === 0 ? values.edition : "";
            const result = this.dataContrast(values);
            if (result) {
                confirm({
                    title: '已修改信息未保存，确认放弃修改？',
                    content: "",
                    okText: '确认',
                    okType: 'danger',
                    cancelText: '取消',
                    onOk() {
                        cancel();
                    }
                });
            } else {
                cancel();
            }
        })
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            values.iosEdition = this.state.data.type === 1 ? values.edition : "";
            values.androidEdition = this.state.data.type === 2 ? values.edition : "";
            values.managerEdition = this.state.data.type === 0 ? values.edition : "";
            // const result = this.dataContrast(values);
            let result = {};
            if (values.type === 2) {
                result = {
                    id: this.state.data.id,
                    type: values.type,
                    channelId: values.applicationType,
                    description: values.description,
                    code: values.code,               
                    forceUpdate: values.compulsoryUpgradeCode,
                }
            } else {
                result = {
                    id: this.state.data.id,
                    type: values.type,
                    description: values.description,
                    code: values.code,               
                    forceUpdate: values.compulsoryUpgradeCode,
                }
            }
            if (!result) {
                message.error("暂无信息更改，无法提交");
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: 'sys/edition/update',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: result,
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("版本信息修改成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                data: {},
                                confirmLoading: false
                            });
                        });
                        this.props.recapture();
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
                <span onClick={() => this.showModal()}>编辑</span>
                <ItemEditForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    data={this.state.data}
                    type={this.props.type}
                    applicationType={this.props.applicationType}
                    channelList={this.props.channelList}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//版本列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            dataOriginal: [],
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
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '版本号',
                dataIndex: 'edition',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'edition'),
            },
            {
                title: '发版说明',
                dataIndex: 'description',
                width: '25%',
                render: (text, record) => <pre>{this.renderColumns(text, record, 'description')}</pre>,
            },
            {
                title: 'Code',
                dataIndex: 'code',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'code'),
            },
            {
                title: '强制更新Code',
                dataIndex: 'compulsoryUpgradeCode',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'compulsoryUpgradeCode'),
            },
            {
                title: '创建时间',
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
                            <ItemEdit 
                                data={this.state.dataOriginal[record.index - 1]}
                                record={record}
                                type={this.props.type}
                                applicationType={this.props.applicationType}
                                channelList={this.props.channelList}
                                recapture={this.getData}
                                opStatus={this.props.opObj.modify}
                                toLoginPage={this.props.toLoginPage}/>
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
    getData = (type, applicationType) => {
        type = type === undefined ? this.props.type : type;
        applicationType = applicationType === undefined ? this.props.applicationType : applicationType;
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/edition/list',
            type: 'json',
            method: 'get',
            // 后台版本列表不传type参数
            data: type === 2 ?
                {
                    type: type,
                    channelId: applicationType,
                    pageNum: this.state.pagination.current,
                    pageSize: this.state.pagination.pageSize
                }
                :
                {
                    type: type,                    
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
                //         size: 10,
                //         list: [
                //             {
                //                 id: null,
                //                 iosEdition: "",
                //                 androidEdition: "",
                //                 code: null,
                //                 compulsoryUpgradeCode: null,
                //                 description: "\n" + "\n" + "",
                //                 createTime: "",
                //                 type: 0
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
                        let tempForceUpdate = "";
                        if (item.forceUpdate === 1) {
                            tempForceUpdate = "是"
                        }
                        if (item.forceUpdate === 2) {
                            tempForceUpdate = "否"
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            edition: item.code,
                            code: item.code || "暂无",
                            forceUpdate: item.forceUpdate,
                            compulsoryUpgradeCode: tempForceUpdate,
                            createTime: item.createTime,
                            description: item.description || "暂无",
                            channelId: item.channelId,
                            channelName: item.channelName,
                            type: item.type,
                        });
                    });
                    this.setState({
                        loading: false,
                        dataOriginal: json.data.list,
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
        localStorage.appEditionPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.appEditionPageSize);
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
        // console.log(nextProps)
        if (nextProps.type === this.props.type && nextProps.applicationType === this.props.applicationType && nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData(nextProps.type, nextProps.applicationType);
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

class AppEdition extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            // 列表类型 0：后台；1：IOS；2：安卓
            type: "1",
            applicationType: "1",
            channelList: [],
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

    setType = (value) => {
        console.log(value)
        if (value === "2") {
            console.log(7777)
            this.getChannelList();
        }
        this.setState({
            type: value
        })
    };

    getChannelList = () => {
        reqwest({
            url: '/sys/edition/channelList',
            type: 'json',
            method: 'get',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
            },
            success: (json) => {
                // const data = [];
                if (json.result === 0) {
                    console.log(json.data);
                    if (json.data) {
                        this.setState({
                            channelList: json.data
                        });
                    }                    
                } else {
                    if (json.code === 901) {
                        message.error("请先登录");
                        // 返回登陆页
                        this.toLoginPage();
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.toLoginPage();
                    } else {
                        message.error(json.message);
                    }
                }
            }
        });
    };
    
    // 安卓应用市场设置
    setApplicationType = (value) => {
        console.log(value)
        this.setState({
            applicationType: value
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
        // 安卓应用市场tab选项卡选项
        const tempTabPane = [];
        this.state.channelList.forEach((item, index) => {
            tempTabPane.push(
                <TabPane tab={item.name} key={item.id}/>
            )
        })        
        return (
            <div className="appEdition">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                <Tabs defaultActiveKey={this.state.type} onChange={this.setType}>
                                    <TabPane tab="IOS" key="1"/>
                                    <TabPane tab="安卓" key="2"/>
                                    <TabPane tab="后台" key="0"/>
                                </Tabs>
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd
                                        opStatus={this.state.opObj.add} 
                                        type={Number(this.state.type)}
                                        applicationType={Number(this.state.applicationType)}                                        
                                        channelList={this.state.channelList}
                                        setFlag={this.setFlag}
                                        toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            <div className="table-box">
                                <Tabs
                                    defaultActiveKey={this.state.applicationType} 
                                    onChange={this.setApplicationType}
                                    style={{display: this.state.type === "2" ? "block" : "none"}}
                                    >
                                        {tempTabPane}
                                       {/* <TabPane tab="市场1" key="1"/>
                                        <TabPane tab="市场2" key="2"/>
                                        <TabPane tab="市场3" key="3"/>*/}
                                </Tabs>
                                <DataTable 
                                    opObj={this.state.opObj} 
                                    type={Number(this.state.type)}
                                    applicationType={Number(this.state.applicationType)}
                                    channelList={this.state.channelList}
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

export default AppEdition;