import React, {Component} from 'react';
import {
    Table,
    Input,
    DatePicker,
    Popconfirm,
    message,
    Form,
    Row,
    Col,
    Modal,
    Button,
} from 'antd';
import { coffeeList, deleteCoffee, updateCoffee, coffeeDetail, sortCoffee, viewNum } from '../../config';

const Search = Input.Search;
const FormItem = Form.Item;
const {TextArea} = Input;

//单元格
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
            {editable ? (
            <EditableContext.Consumer>
                {(form) => {
                    this.form = form;
                    return (
                        editing ? (
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
                                    placeholder="双击设置排序"
                                />
                            )}
                        </FormItem>
                        ) : (
                        <div
                            className="editable-cell-value-wrap "
                            onClick={this.toggleEdit}>
                            <Input style={{textAlign: "center"}}
                                // allowClear
                                ref= {node => (this.input = node)}
                                value={record[dataIndex]}
                                placeholder="双击设置排序"
                            />
                        </div>
                        )
                    );
                }}
            </EditableContext.Consumer>
            ) : restProps.children}
        </td>
        );
    }
}

// 明星信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, confirmLoading} = props;
        const {getFieldDecorator} = form;
        
        return (
            <Modal
                visible={visible}
                title="编辑明星"
                width={1000}
                onCancel={onCancel}
                footer={[
                    <Button key="back" onClick={onCancel} disabled={confirmLoading}>取消</Button>,
                    <Button key="submit" type="primary" loading={confirmLoading} onClick={() => onCreate(2)}>确定</Button>
                ]}
                destroyOnClose={true}>
                <div className="course-add course-form item-form quality-course-form">
                    <Form layout="vertical">
                        <h4 className="add-form-title-h4">基础信息</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="name"  label="发帖人：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.name,                                      
                                        rules: [{
                                            required: true,
                                            message: '发帖人不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入发帖人"/>
                                    )}
                                </FormItem>                                
                            </Col>                            
                        </Row>
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">明星详情</h4>
                        <FormItem className="content" label="明星简介：">
                            {getFieldDecorator('content', {
                                initialValue: data.content,
                                rules: [{
                                    required: true,
                                    message: '不能为空',
                                }],
                            })(
                                <TextArea 
                                    className="ckeditor"
                                    style={{resize: "none"}}                                    
                                    placeholder="请填写明星简介"
                                    autosize={{minRows: 5, maxRows: 10}}/>                                
                            )}
                        </FormItem>                        
                        <div className="ant-line"></div>                     
                    </Form>
                </div>
            </Modal>
        )
    }
);

// 明星信息编辑明星组件
class ItemEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            // 明星基本信息
            data: {},
            // 提交按钮状态变量
            loading: false,                  
        };
        this.editor = ""
    }

    // 获取明星基本信息
    getData = () => {
        coffeeDetail({id: this.props.id}).then((json) => {
             if (json.data.result === 0) {
                // 已有所属分类写入                    
                json.data.data.typeId = json.data.data.excellentCourseType.typeId;                
                // 富文本数据写入
                this.editor.setData(json.data.data.characteristic);
                // 信息写入
                this.setState({
                    data: json.data.data,
                    viewPic: json.data.data.pic,
                    videoList: json.data.data.lesson
                });
            } else {
                this.props.exceptHandle(json.data);
                this.setState({loading: false});              
            }
        }).catch((err) => {
            message.error("获取失败");
            this.setState({loading: false});
        });
    };

    showModal = () => {
        this.getData();       
        this.setState({visible: true});      
        setTimeout(()=> {
           this.editor = window.CKEDITOR.replace(document.getElementById('content'));                      
        });
    };

    // 取消处理
    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false
        }, () => {
            this.setState({
                data: {},                                      
                loading: false,
            });
            this.editor = ""
            form.resetFields();
        });
    };

    // 确认处理
    handleCreate = () => {
        const form = this.form;        
        form.validateFieldsAndScroll((err, values) => {// 获取表单数据并进行必填项校验
            if (err) {return;}
            
            // 富文本内容处理
            values.content = this.editor.getData();
            console.log(values.riches)
            const result = {
                id: this.props.id,
                name: values.name,                
                content: values.content,               
            };
            this.setState({loading: true});
            updateCoffee(result).then((json) => {
                if (json.data.result === 0) {
                    message.success("编辑明星成功");
                    this.handleCancel();
                    this.props.recapture();                            
                } else {
                    message.error(json.message);                        
                    this.setState({loading: false});
                }
            }).catch((err) => {
                message.error("获取失败");
                this.setState({loading: false});
            });
        });
    };

    exceptHandle = (json) => {
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
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}                                   
                    data={this.state.data}                        
                    confirmLoading={this.state.loading}
                />                
            </a>
        );
    }
}

// 明星详情表单
const ItemDetailsForm = Form.create()(
    (props) => {
        const {visible, onCancel, form, data, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="详情"
                width={1000}
                onCancel={onCancel}
                footer={null}
                destroyOnClose={true}
                confirmLoading={confirmLoading}>
                <div className="institutionCheck-form">
                    <Form layout="vertical">
                        <h4 className="add-form-title-h4">基本信息</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="courseName"  label="发帖人：">
                                    {getFieldDecorator('courseName', {
                                        initialValue: data.name,
                                        rules: [{
                                            required: true,
                                            message: '发帖人不能为空',
                                        }],
                                    })(
                                        <Input disabled placeholder="请输入发帖人"/>
                                    )}
                                </FormItem>                                
                            </Col>                            
                            <div className="ant-line"></div>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem className="characteristic" label="内容：">
                                    {getFieldDecorator('characteristic', {
                                        initialValue: data.characteristic,
                                        rules: [{
                                            required: true,
                                            message: '内容不能为空',
                                        }],
                                    })(                                        
                                        <div className="courseDescription" style={{border: "1px solid #e5e3e0",padding: "10px"}} dangerouslySetInnerHTML={{__html: data.characteristic}}></div>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>                        
                        <div className="ant-line"></div>                                        
                    </Form>
                </div>
            </Modal>
        );
    }
);

// 明星详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        loading: true,
        // 明星基本信息
        data: "",
    };

    // 获取明星基本信息
    getData = () => {
        coffeeDetail({id: this.props.id}).then((json) => {
             if (json.data.result === 0) {
                this.setState({
                    loading: false,
                    data: json.data,
                    videoList: json.data.lesson,
                });
            } else {
                this.props.exceptHandle(json.data);
                this.setState({loading: false});            
            }
        }).catch((err) => {
            message.error("获取失败");
            this.setState({loading: false});
        });
    };

    showModal = () => {        
        this.getData();
        this.setState({visible: true});
    };

    handleCancel = () => {
        this.setState({
            visible: false,
            loading: true,
            videoList: [],            
            data: "",
        });
    };

    render() {
        return (           
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>详情</span>
                <ItemDetailsForm 
                    ref={this.saveFormRef}
                    visible={this.state.visible}                                       
                    data={this.state.data}
                    onCancel={this.handleCancel}/>
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
                title: '排序',
                dataIndex: 'sort',
                width: 130,
                editable: true,
            },
            {
                title: '发帖人',
                dataIndex: 'nickname',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'nickname'),
            },         
            {
                title: '内容',
                dataIndex: 'content',
                className: 'operating',
                render: (text, record) => this.renderColumns(text, record, 'content'),
            },
            {
                title: '用户浏览数',
                dataIndex: 'viewNum',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'viewNum'),
            },
            {
                title: '运营浏览数',
                dataIndex: 'operateNum',
                width: 130,
                editable: true,
            },
            {
                title: '发帖时间',
                dataIndex: 'createTime',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                width: 200,
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*详情*/}
                            <ItemDetails
                                id={record.id}
                                opStatus={this.props.opObj.select}
                                toLoginPage={this.props.toLoginPage}/>
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
        this.setState({loading: true});
        const params = {            
            content: keyword ? keyword.content : this.props.keyword.content,// 评价内容
            beginTime: keyword ? keyword.startTime : this.props.keyword.startTime,
            endTime: keyword ? keyword.endTime : this.props.keyword.endTime,
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize,
        };
        coffeeList(params).then((json) => {
            const data = [];
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
                json.data.data.list.forEach((item, index) => {
                    data.push({
                        key: index.toString(),
                        id: item.id,
                        index: index + 1,
                        sort: item.sort ? item.sort : '',
                        nickname: item.nickname,
                        content: item.content.length > 18 ? item.content.slice(0, 18) + '...' : item.content,
                        content_detail: item.content,
                        viewNum: item.viewNum,
                        operateNum: item.num ? item.num : '',
                        createTime: item.createTime,                        
                    });
                });
                this.setState({
                    loading: false,
                    data: data,
                    pagination: {
                        total: json.data.data.total,
                        current: this.state.pagination.current,
                        pageSize: this.state.pagination.pageSize
                    }
                });
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {
            message.error("获取失败");
            this.setState({loading: false});
        });
    };

    // 设置排序
    handleSort = (row) => {
        this.setState({loading: true});
        sortCoffee({
            id: row.id,// 广告Id
            sort: Number(row.sort),// 排序
        }).then((json) => {
            if (json.result === 0) {
                this.setState({loading: false});
                this.getData(); //刷新数据
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {
            message.error("获取失败");
            this.setState({loading: false});
        });
    };

    // 设置浏览数
    setViewNum = (row) => {
        this.setState({loading: true});
        viewNum({
            id: row.id,
            sort: Number(row.sort),// 浏览数
        }).then((json) => {
            if (json.result === 0) {
                this.setState({loading: false});
                this.getData(); //刷新数据
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {
            message.error("获取失败");
            this.setState({loading: false});
        });
    };

    //评价删除
    itemDelete = (id) => {
        this.setState({loading: true});
        deleteCoffee({id: id}).then((json) => {
            if (json.data.result === 0) {
                message.success("评价删除成功");
                this.getData(this.props.keyword);
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {
            message.error("删除失败");
            this.setState({loading: false});
        });
    };

    exceptHandle = (json) => {
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
        const components = {
            body: {
              row: EditableFormRow,
              cell: EditableCell,
            },
        };
        const columns = this.columns.map((col) => {
            if (!col.editable) {
              return col;
            }
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
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    // columns={this.columns}
                    components={components}
                    columns={columns}
                    scroll={{ x: 1500 }}
                    onChange={this.handleTableChange}/>;
    }
}

class CoffeeCircle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {
                select: true,
                add: true,
                modify: true,
                delete: true,
            },
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
            <div className="institutions coffee-circle">
                {
                    this.state.opObj.select ?
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
                        :
                        <p>暂无查询权限</p>
                }
            </div>  
        )
    }
}

export default CoffeeCircle;