import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    Form,
    message,
    Upload,
    Popconfirm,
    Spin
} from 'antd';
import * as common from '../../config/common';
import * as config from '../../config';

message.config({
    top: 50,
    duration: 2,
    maxCount: 3,
});

const FormItem = Form.Item;

// 栅格设置
const formItemLayout_12 = {
    labelCol: {span: 5},
    wrapperCol: {span: 11}
};

// 单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

// 可编辑的单元格
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends Component {
    state = {
        editing: false,
    }

    toggleEdit = (valuess) => {
        console.log(valuess);
        const editing = !this.state.editing;
        this.setState({ editing }, () => {
            if (editing) {
                this.input.focus();
            }
        });
    }

    sort = (props1, e) => {
        const { record, handleSort } = this.props;
        this.form.validateFields((error, values) => {
            if (error && error[e.currentTarget.id]) {
                return;
            }
            this.toggleEdit();
            // 判断排序值是否改变，不变就不用排序，只有改变才请求sort接口
            if (props1 !== Number(values.sort)) {
                handleSort({ ...record, ...values });
            } 
        });
    }

    render() {
        const { editing } = this.state;
        const { editable, dataIndex, title, record, index, handleSort, ...restProps } = this.props;
        return (
            <td {...restProps}>
                {
                    editable ? 
                        (<EditableContext.Consumer>
                            {(form) => {
                                this.form = form;
                                return (
                                    editing ? 
                                        (
                                        <FormItem style={{ margin: 0 }}>
                                            {form.getFieldDecorator(dataIndex, {
                                                rules: [{
                                                    required: false,                                   
                                                    message: "只能输入数字",                                    
                                                }],                               
                                                initialValue: record[dataIndex],
                                                })(
                                                <Input style={{textAlign: "center"}}
                                                    // allowClear
                                                    ref={node => (this.input = node)}
                                                    onPressEnter={this.sort.bind(this, record[dataIndex])}
                                                    onBlur={this.sort.bind(this, record[dataIndex])}
                                                    placeholder="双击设置排序"/>
                                            )}
                                        </FormItem>
                                        )
                                        :
                                        (<div onClick={this.toggleEdit} className="editable-cell-value-wrap">
                                            <Input style={{textAlign: "center"}}
                                                // allowClear
                                                ref= {node => (this.input = node)}
                                                value={record[dataIndex]}
                                                placeholder="双击设置排序"/>
                                        </div>)
                                );
                            }}
                        </EditableContext.Consumer>)
                        : 
                        restProps.children
                }
            </td>
        );
    }
}

// 新增一级类型表单
const ItemAddForm = Form.create()(
    (props) => {
        const {_this, visible, onCancel, onCreate, form, viewPic, photoLoading, confirmLoading} = props;
        const {getFieldDecorator} = form;

        const customRequest = (info) => {           
            setTimeout(()=>{// 渲染的问题，加个定时器延迟
                common.picUpload(_this, 1, info.file, _this.state.uploadToken)
            }, 700);
        };

        return (
            <Modal
                visible={visible}
                title="添加类型"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                maskClosable={false}
                destroyOnClose={true}
                confirmLoading={confirmLoading}>
                <div className="category-add category-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_12} label="类型名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '名称不能为空',
                                }],
                            })(
                                <Input placeholder="请输入类型名称"/>
                            )}
                        </FormItem>
                        <FormItem className="background" {...formItemLayout_12} label="背景色：">
                            {getFieldDecorator('background', {
                                initialValue: "#000000",
                                rules: [{
                                    required: true,
                                    message: '颜色不能为空',
                                }],
                            })(
                                <Input type="color" placeholder="请拾取颜色"/>
                            )}
                        </FormItem>                        
                        <FormItem className="photo" {...formItemLayout_12} label="图片：">
                            {getFieldDecorator('photo', {
                                rules: [{
                                    required: true,
                                    message: '图片不能为空',
                                }],
                            })(
                                <Upload
                                    name="file"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    showUploadList={false}
                                    beforeUpload={(file) => common.beforeUpload(file, _this)}
                                    customRequest={customRequest}>
                                    {viewPic ? <img src={viewPic} alt=""/> : common.uploadButton(1, photoLoading)}
                                </Upload>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

// 新增一级类型组件
class ItemAdd extends Component {
    constructor(props) {
        super(props);    
          this.state = {
            visible: false,
            viewPic: "",            
            photoLoading: false, // 图片提交状态变量           
            loading: false
        };
    }

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        this.setState({
            visible: false,
            viewPic: "",
            photoLoading: false,
            loading: false
        });
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {return;}
            this.setState({loading: true});            
            const data = {
                name: values.name,
                icon: this.state.viewPic.slice(config.configUrl.photoUrl.length),
                background: values.background
            };
            config.addType(data).then((json) => {
                if (json.data.result === 0) {
                    message.success("类型添加成功");
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
                <Button style={{marginBottom: "10px"}} type="primary" onClick={this.showModal}>添加类型</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    _this={this}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}                    
                    viewPic={this.state.viewPic}
                    photoLoading={this.state.photoLoading}                    
                    confirmLoading={this.state.loading}/>                
            </div>
        );
    }
}

// 修改一级类型表单
const ItemEditForm = Form.create()(
    (props) => {
        const {_this, visible, onCancel, onCreate, form, data, viewPic, photoLoading, confirmLoading} = props;
        const {getFieldDecorator} = form;
        
        const customRequest = (info) => {
            setTimeout(() => {
                common.picUpload(_this, 1, info.file, _this.state.uploadToken);
            }, 500);
        };

        return (
            <Modal
                visible={visible}
                title="类型编辑"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                maskClosable={false}
                destroyOnClose={true}
                confirmLoading={confirmLoading}>
                {
                    JSON.stringify(data) === "{}" ?
                        <div className="spin-box">
                            <Spin/>
                        </div>
                        :
                        <div className="category-add category-form">
                            <Form layout="vertical">
                                <FormItem className="name" {...formItemLayout_12} label="类型名称：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.name,
                                        rules: [{
                                            required: true,
                                            message: '名称不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入类型名称"/>
                                    )}
                                </FormItem>
                                <FormItem className="color" {...formItemLayout_12} label="背景色：">
                                    {getFieldDecorator('background', {
                                        initialValue: data.backgroundColor|| "#00000",
                                        rules: [{
                                            required: true,
                                            message: '颜色不能为空',
                                        }],
                                    })(
                                        <Input type="color" placeholder="请拾取颜色"/>
                                    )}
                                </FormItem>                                
                                <FormItem className="photo" {...formItemLayout_12} label="图片：">
                                    {getFieldDecorator('photo', {
                                        initialValue: viewPic,
                                        rules: [{
                                            required: true,
                                            message: "图片不能为空"
                                        }],
                                    })(
                                        <Upload
                                            name="file"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            showUploadList={false}
                                            beforeUpload={(file) => common.beforeUpload(file, _this)}
                                            customRequest={customRequest}>
                                            {viewPic ? <img src={viewPic} alt=""/> : common.uploadButton(1, photoLoading)}
                                        </Upload>
                                    )}
                                </FormItem>
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

// 修改一级类型组件
class ItemEdit extends Component {
    state = {
        visible: false,
        data: {},
        viewPic: "",        
        photoLoading: false,// 图片提交按钮状态变量
        loading: false
    };

    getData = () => {
        config.typeDetail({id: this.props.id}).then((json) => {
            if (json.data.result === 0) {
                this.setState({
                    data: json.data.data,
                    viewPic: json.data.data.photo,
                });
            }else{
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    showModal = () => {
        this.getData();
        this.setState({visible: true});        
    };

    handleCancel = () => {
        this.setState({
            visible: false,
        }, () => {
            this.setState({
                data: {},
                viewPic: "",               
                photoLoading: false,
                loading: false
            });
        });
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {return;}            
            if (this.state.viewPic) {
                values.photo = this.state.viewPic.slice(config.configUrl.photoUrl.length);
            } else {
                message.error("图片不能为空")
                return;
            }
            const result = {
                id: this.props.id,
                name: values.name,
                background: values.background,
                icon: values.photo,                
            };            
            this.setState({loading: true});
            config.updateType(result).then((json) => {
                if (json.data.result === 0) {
                    message.success("编辑成功");
                    this.handleCancel();
                    this.props.recapture()
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
                <span onClick={this.showModal}>编辑</span>
                <ItemEditForm
                    ref={this.saveFormRef}
                    _this={this}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    data={this.state.data}                                        
                    viewPic={this.state.viewPic}
                    photoLoading={this.state.photoLoading}                    
                    confirmLoading={this.state.loading}/>
            </a>
        );
    }
}

// 类型列表
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
            },
            {
                title: '排序',
                dataIndex: 'sort',
                width: 130,
                editable: true,
            },
            {
                title: '分类名称',
                dataIndex: 'name',
                width: '40%',
                render: (text, record) => this.renderColumns(text, record, 'name')
            },            
            // {
            //     title: 'Icon',
            //     dataIndex: 'photo',
            //     width: '10%',
            //     render: (text, record) => (record.photo ?
            //         <img style={{width: '30px', height: "30px"}} src={record["photo"]} alt=""/> : null)
            // },
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*一级类型编辑*/}
                            <ItemEdit 
                                id={record.id} 
                                parentId={record.parentId} 
                                recapture={this.getData}                                      
                                opStatus={this.props.opObj.modify}
                                toLoginPage={this.props.toLoginPage}/>                                               
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

    // 列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    // 列表信息处理函数
    dataHandle = (data) => {
        let result = [];
        data.list.forEach((item, index) => {
            const temp = {
                index: index + 1,
                key: item.id,
                id: item.id,
                parentId: item.parentId,
                sort: item.sort !== 0 ? item.sort : '',                
                name: item.name,
                photo: item.photo
            };            
            result.push(temp)
        });
        return result;
    };

    // 获取本页信息
    getData = () => {
        this.setState({loading: true});
        config.typeList({
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize,
        }).then((json) => {
            if (json.data.result === 0) {
                common.handleTableNoDataResponse(this, json.data.data);
                this.setState({
                    loading: false,
                    data: this.dataHandle(json.data.data),
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

    // 排序
    handleSort = (row) => {
        this.setState({loading: true});
        config.sortType({                
            id: row.id,
            sort: Number(row.sort)
        }).then((json) => {
            if (json.data.result === 0) {
                this.setState({loading: false});
                this.getData(); //刷新数据
            } else {
                common.exceptHandle(this, json.data);                
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    // 删除
    itemDelete = (para) => {
        this.setState({loading: true});
        config.deleteType({id: para}).then((json) => {
            if (json.data.result === 0) {
                message.success("删除成功");
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
        if (nextProps.keyword === this.props.keyword && nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData(nextProps.keyword);
    }

    render() {
        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell,
            }
        };
        const columns = this.columns.map((col) => {
            if (!col.editable) {return col;}
            return {
                ...col,
                onCell: record => ({
                    record,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSort: this.handleSort,
                }),
            };
        });
        return <Table 
                    bordered
                    components={components}
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    columns={columns}
                    onChange={(pagination) => common.handleTableChange(this, pagination)}/>;
    }
}

class Category extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            flag_add: false
        }
    };
     
    setPower = () => {// 获取当前登录人对此菜单的操作权限
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
            <div className="category">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">                               
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd 
                                        opStatus={this.state.opObj.add} 
                                        setFlag={this.setFlag}
                                        toLoginPage={() => common.toLoginPage(this)}/>
                                </div>
                            </header>
                            {/*类型列表*/}
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

export default Category;