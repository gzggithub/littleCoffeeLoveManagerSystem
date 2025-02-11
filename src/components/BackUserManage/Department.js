import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    message,
    Form,
    Popconfirm,
    Spin,
} from 'antd';
import * as common from '../../config/common';
import * as config from '../../config';

const FormItem = Form.Item;
const {TextArea} = Input;

const formItemLayout_14 = {
    labelCol: {span: 4},
    wrapperCol: {span: 14},
};

const formItemLayout_16 = {
    labelCol: {span: 6},
    wrapperCol: {span: 12},
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//新增部门表单
const AddItemForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="添加部门"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}>
                <div className="menu-add menu-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_14} label="部门名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '部门名称不能为空',
                                },
                                {
                                    max: 10,
                                    message: '部门名称最长10个字',
                                }],
                            })(
                                <Input placeholder="请输入部门名称"/>
                            )}
                        </FormItem>                        
                        <FormItem className="description" {...formItemLayout_14} label="部门描述：">
                            {getFieldDecorator('description', {
                                rules: [{
                                    required: false,
                                    max: 300,
                                    message: '部门描述最长为300字'
                                }]
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写部门描述" rows={5}/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//新增部门组件
class AddItem extends Component {
    state = {
        visible: false,
        loading: false
    };

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        const form = this.form;
        this.setState({visible: false,loading: false});
        form.resetFields();
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            this.setState({loading: true});
            const data = {
                parentId: 0,
                name: values.name,                
                desc: values.description
            };
            config.addDepartment(data).then((json) => {
                if (json.data.result === 0) {
                    message.success("部门添加成功");
                    this.handleCancel();
                    this.props.setFlag();
                } else {
                    common.exceptHandle(this, json.data);
                }
            }).catch((err) => common.errorHandle(this, err));
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button style={{marginBottom: "10px"}} type="primary" onClick={this.showModal}>添加部门</Button>
                <AddItemForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    confirmLoading={this.state.loading}/>
            </div>
        );
    }
}

//新增子部门表单
const AddSubItemForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="添加子部门"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}>
                <div className="menu-add menu-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_16} label="子部门名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '子部门名称不能为空',
                                },
                                {
                                    max: 10,
                                    message: '子部门名称最长10个字'
                                }],
                            })(
                                <Input placeholder="请输入子部门名称"/>
                            )}
                        </FormItem>                        
                        <FormItem className="description" {...formItemLayout_16} label="部门描述：">
                            {getFieldDecorator('description', {
                                rules: [{
                                    required: false,
                                    max: 300,
                                    message: '部门描述最长300字'
                                }]
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写部门描述" rows={5}/>
                            )}
                        </FormItem>                        
                    </Form>
                </div>
            </Modal>
        );
    }
);

//新增子部门组件
class AddSubItem extends Component {
    state = {
        visible: false,
        loading: false
    };

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false,
            loading: false
        });
        form.resetFields();
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {return;}
            this.setState({loading: true});
            const data = {
                parentId: this.props.id,
                name: values.name,                
                desc: values.description,
            };
            config.addDepartment(data).then((json) => {
                if (json.data.result === 0) {
                    message.success("子部门添加成功");
                    this.handleCancel();
                    this.props.recapture();
                } else {
                    common.exceptHandle(this, json.data);
                }
            }).catch((err) => common.errorHandle(this, err));
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            // 仅一级菜单项展示此按钮
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={() => this.showModal()}>添加子部门</span>
                <AddSubItemForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    confirmLoading={this.state.loading}/>
            </a>
        );
    }
}

//成员名单表单
const NumDetailForm = Form.create()(
    (props) => {
        const {visible, onCancel, confirmLoading, loading, data, columns, _this, pagination} = props;

        return (
            <Modal
                visible={visible}
                title="部门成员"
                width={600}
                onCancel={onCancel}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
                footer={null}>
                <div className="table-box">                    
                    <Table bordered
                      loading={loading}
                      dataSource={data}
                      pagination={pagination}
                      columns={columns}
                      onChange={(pagination) => common.handleTableChange(_this, pagination)}/>
                </div>
            </Modal>
        );
    }
);

//成员名单组件
class NumDetail extends Component {
    state = {
        visible: false,
        loading: false,
        data: [],
        pagination: common.pagination
    };
                     
    columns = [
            {
                title: '姓名',
                dataIndex: 'userName',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'userName'),
            },
            {
                title: '手机号',
                dataIndex: 'phone',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'phone'),
            },
            {
                title: '部门',
                dataIndex: 'departmentName',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'departmentName'),                
            },
        ];

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    showModal = () => {
        this.setState({visible: true});
        this.getDataMemberList();
    };

    getDataMemberList = () => {
        this.setState({loading: true});
        const params = {
            departmentId: this.props.id,
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize
        }
        config.departmentUserList(params).then((json) => {
            if (json.data.result === 0) {
                common.handleTableNoDataResponse(this, json.data.data);
                this.setState({
                    data: json.data.data.list,
                    loading: false,
                    pagination: {
                        total: json.data.data.total,
                        current: this.state.pagination.current,
                        pageSize: this.state.pagination.pageSize
                    }
                })                    
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    handleCancel = () => {
        this.setState({
            visible: false,
            loading: false,
            data: []
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a>
                <span onClick={() => this.showModal()}>{this.props.num}</span>
                <NumDetailForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    loading={this.state.loading}
                    data={this.state.data}
                    columns={this.columns}
                    _this={this}
                    pagination={this.pagination}/>
            </a>
        );
    }
}

//部门信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="部门编辑"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}>
                {
                    JSON.stringify(data) === "{}" ?
                        <div className="spin-box">
                            <Spin/>
                        </div>
                        :
                        <div className="institution-edit institution-form">
                            <Form layout="vertical">
                                <FormItem className="name" {...formItemLayout_14} label="部门名称：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.name,
                                        rules: [
                                        {
                                            required: true,
                                            message: '部门名称不能为空',
                                        },
                                        {
                                            max: 20,
                                            message: '部门名称最长10个字',
                                        }]
                                    })(
                                        <Input placeholder="请输入部门名称"/>
                                    )}
                                </FormItem>                                                      
                                <FormItem className="description" {...formItemLayout_14} label="部门描述：">
                                    {getFieldDecorator('description', {
                                        initialValue: data.description,
                                        rules: [{
                                            required: false,                             
                                            max: 600,
                                            message: '部门名称最长300个字',
                                        }]                                        
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写部门描述" rows={5}/>
                                    )}
                                </FormItem>                                
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

//部门信息编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,
        data: {},
        loading: false
    };

    getData = () => {
        config.departmentDetail({id: this.props.id}).then((json) => {
            if (json.data.result === 0) {
                this.setState({                    
                    data: json.data.data
                });
            } else {
                common.exceptHandle(json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    showModal = () => {
        this.getData();
        this.setState({visible: true});
    };

    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false,
            data: {},
            loading: false
        });
        form.resetFields();
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {return;}
            const data = {
                id: this.props.id,
                name: values.name,
                parentId: this.props.id,
                desc: values.description
            };
            this.setState({loading: true});
            config.updateDepartment(data).then((json) => {
                if (json.data.result === 0) {
                    message.success("部门信息编辑成功");
                    this.handleCancel();
                    this.props.recapture();
                } else {
                    common.exceptHandle(this, json.data);
                }
            }).catch((err) => common.errorHandle(this, err));
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
                    id={this.props.id}
                    data={this.state.data}
                    confirmLoading={this.state.loading}/>
            </a>
        );
    }
}

//部门信息列表
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
                width: 100,
            },
            {
                title: '部门名称',
                dataIndex: 'name',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '部门成员',
                dataIndex: 'num',
                width: '15%',               
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            <NumDetail 
                                id={record.id} 
                                parentId={record.parentId} 
                                num={record.num} 
                                recapture={this.getData}
                                toLoginPage={this.props.toLoginPage}/>
                        </div>
                    )
                }
            },
            {
                title: '部门描述',
                dataIndex: 'description',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'description'),
            },
            {
                title: '更新时间',
                dataIndex: 'updateTime',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'updateTime'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*编辑*/}
                            <ItemEdit 
                                id={record.id} 
                                recapture={this.getData} 
                                opStatus={this.props.opObj.modify}
                                toLoginPage={this.props.toLoginPage}/>
                            {/*删除*/}
                            <Popconfirm 
                                title="确认删除?"
                                placement="topRight"
                                onConfirm={() => this.deleteItem(record.id)}
                                onCancel=""
                                okType="danger"
                                okText="立即删除"
                                cancelText="取消">
                                <a style={{display: this.props.opObj.delete ? "inline" : "none"}}>删除</a>
                            </Popconfirm>
                            {/*添加子部门*/}
                            <AddSubItem 
                                id={record.id}
                                parentId={record.parentId}
                                recapture={this.getData}
                                opStatus={this.props.opObj.add && record.parentId === 0}
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

    // 部门列表处理函数
    dataHandle = (data) => { // 获取一级菜单列表（parentId为0的项）
        const result = [];        
        data.forEach((item, index) => {
            const temp = {
                key: item.id,
                id: item.id,
                index: index + 1,
                parentId: 0,
                name: item.name,
                num: item.num,
                description: item.description,
                updateTime: item.updateTime,
                children: item.children,
                userList: item.userList,               
            };
            result.push(temp)
        });
        result.forEach((item) => {
            if (item.children) {
                item.children.forEach((subItem, subIndex) => {
                    subItem.updateTime = subItem.updateTime;
                    subItem.key = subItem.id;
                    subItem.index = subIndex + 1;
                });
            }            
        });
        return result;
    };

    //获取本页信息
    getData = () => {
        this.setState({loading: true});       
        const params = {
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize,
        };
        config.departmentList(params).then((json) => {
            if (json.data.result === 0) {
                common.handleTableNoDataResponse(this, json.data.data);
                this.setState({
                    loading: false,
                    data: this.dataHandle(json.data.data.list),// 对原始菜单列表进行处理后写入
                    pagination: {
                        total: json.data.data.total,
                        current: this.state.pagination.current,
                        pageSize: this.state.pagination.pageSize
                    }
                })
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    //部门删除
    deleteItem = (para) => {
        this.setState({loading: true});        
        config.deleteDepartment({id: para}).then((json) => {
            if (json.data.result === 0) {
                message.success("部门删除成功");
                this.getData();
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
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
                    onChange={(pagination) => common.handleTableChange(this, pagination)}/>;
    }
}

class DepartmentManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            flag_add: false
        }
    };

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
       this.setState({opObj: common.getPower(this).data});
    };

    setFlag = () => {
        this.setState({flag_add: !this.state.flag_add});
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
            <div className="menus">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                部门列表
                                <div className="add-button" style={{float: "right"}}>
                                    {/*新增部门*/}
                                    <AddItem 
                                        opStatus={this.state.opObj.add} 
                                        setFlag={this.setFlag}
                                        toLoginPage={() => common.toLoginPage(this)}/>
                                </div>
                            </header>
                            {/*部门列表*/}
                            <div className="table-box">
                                <DataTable 
                                    opObj={this.state.opObj} 
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

export default DepartmentManage;