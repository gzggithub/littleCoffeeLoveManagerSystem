import React, {Component} from 'react';
import {
    Table,
    Input,
    DatePicker,
    Select,
    Button,
    Modal,
    Form,
    Popconfirm,
    Upload,
    Row,
    Col,
    message,
    Spin,
    Cascader,
} from 'antd';
import * as common from '../../config/common';
import * as config from '../../config';
import moment from 'moment';

const Search = Input.Search;
const FormItem = Form.Item;

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
        // console.log(valuess);
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
                            onClick={this.toggleEdit}
                        >
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

// 添加广告表单
const ItemAddForm = Form.create()(
    (props) => {
        const {_this, visible, onCancel, onCreate, form, optionsOfCity, viewPic, photoLoading, confirmLoading} = props;
        const {getFieldDecorator} = form;

        const customRequest = (info) => {
            setTimeout(()=>{
                common.picUpload(_this, 1, info.file, _this.state.uploadToken);
            }, 500);   
        };

        return (
            <Modal
                visible={visible}
                title="添加广告"
                width={1000}
                onCancel={onCancel}
                onOk={onCreate}
                maskClosable={false}
                confirmLoading={confirmLoading}>
                <div className="institution-add institution-form item-form">
                    <Form layout="vertical">
                        <h4 className="add-form-title-h4">基础信息</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="area longItem" label="展示城市：">
                                    {getFieldDecorator('cityId', {
                                        rules: [{
                                            required: true,
                                            message: '展示城市未选择'
                                        }],
                                    })(
                                        <Cascader options={optionsOfCity} placeholder="请选择展示城市"/>                                        
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="advPosition" label="广告位置：">
                                    {getFieldDecorator('type', {
                                        rules: [
                                            {
                                                required: true,
                                                message: '广告类型不能为空',
                                            }
                                        ],
                                    })(
                                        <Select style={{width: '100%'}} placeholder="请选择广告位置">{common.bannerOptions}</Select>                                       
                                    )}
                                </FormItem>
                            </Col>          
                        </Row>
                        <div className="ant-line"></div>
                        <Row>
                            <Col span={10}>
                                <FormItem className="photo" label="广告图片：">
                                    {getFieldDecorator('photo', {
                                        rules: [{
                                            required: true,
                                            message: '请上传广告图片',
                                        }],
                                    })(
                                        <Upload
                                            name="file"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            showUploadList={false}
                                            beforeUpload={(file) => common.beforeUpload(file, _this)}
                                            customRequest={customRequest}>
                                            {viewPic ? <img src={viewPic} style={{width: "100%"}} alt=""/> : common.uploadButton(1, photoLoading)}
                                        </Upload>
                                    )}
                                </FormItem>                                
                            </Col>
                        </Row>                       
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="companyName" label="图片描述：">
                                    {getFieldDecorator('title', {
                                        rules: [
                                            {
                                                required: true,
                                                message: '图片描述不能为空',
                                            },
                                            {
                                                min: 6,
                                                message: "图片描述至少6个字",
                                            },
                                            {
                                                max: 42,
                                                message: "图片描述不能超过42个字符",
                                            },
                                        ],
                                    })(
                                        <Input placeholder="请填写图片描述(6-42字)"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="licenseNumber" label="跳转链接：">
                                    {getFieldDecorator('linkAddress', {
                                        rules: [{
                                            required: false,
                                            message: '请填写跳转链接',
                                        }],
                                    })(
                                        <Input placeholder="请输入图片跳转链接"/>
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

// 添加广告组件
class ItemAdd extends Component {
    state = {
        visible: false,      
        // 广告图片相关变量       
        uploadToken: '',// 上传Token
        viewPic: "",
        photoLoading: false,      
        loading: false
    };

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false
        }, () => {
            this.setState({
                uploadToken: '',
                viewPic: "",                      
                photoLoading: false,      
                loading: false
            });
            form.resetFields();
        });
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFieldsAndScroll((err, values) => {
            if (err) {return;}
            // 广告图片校验
            values.photo = this.state.viewPic;
            if (!values.photo) {
                message.error("广告图片未提交");
                return
            }
            
            if (values.photo && this.state.viewPic) {
                values.photo = this.state.viewPic.slice(config.configUrl.photoUrl.length);
            }
            // 广告展示城市校验
            if (!values.cityId.length) {
                message.error("请选择广告展示城市");
                return
            }

            let currentCityName = common.pCAName(this.props.provinceList, values.cityId[1]).currentCityName;

            this.setState({loading: true});
            const data = {
                provinceId: values.cityId[0],
                provinceName: values.cityId[0] === "0" ? "全国" : currentCityName[0],
                cityId: values.cityId[1] || values.cityId[0],
                cityName: values.cityId[0] === "0" ? "全国" : currentCityName[1],                  
                type: values.type,
                photo: values.photo,
                title: values.title,
                linkAddress: values.linkAddress,
            };
            config.saveAdv(data).then((json) => {
                if (json.data.result === 0) {
                    message.success("广告添加成功");
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
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button type="primary" onClick={this.showModal}>添加广告</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    _this={this}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    viewPic={this.state.viewPic}
                    photoLoading={this.state.photoLoading}
                    optionsOfCity={this.props.optionsOfCity}                                     
                    confirmLoading={this.state.loading}/>
            </div>
        );
    }
}

// 广告信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {_this, visible, onCancel, onCreate, form, data, viewPic, photoLoading, provinceList, confirmLoading} = props;
        const {getFieldDecorator} = form;

        const customRequest = (info) => {
            setTimeout(() => {
                common.picUpload(_this, 1, info.file, _this.state.uploadToken);
            }, 500);
        };  
        
        return (
            <Modal
                visible={visible}
                title="广告编辑"
                width={1000}
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
                        <div className="institution-edit institution-form item-form">
                            <Form layout="vertical">
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="area longItem" label="展示城市：">
                                            {getFieldDecorator('cityId', {
                                                initialValue: data.cityId === 0 ? ["0"] : common.pCAName(provinceList, data.cityId).currentCity,
                                                rules: [{
                                                    required: true,
                                                    message: "展示城市未选择"
                                                }],
                                            })(
                                                <Cascader options={common.pCAName(provinceList).optionsOfCity} placeholder="请选择所属城市"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="advPositionIds" label="广告位置：">
                                            {getFieldDecorator('type', {
                                                initialValue: data.type,
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '广告位置不能为空',
                                                    }
                                                ],
                                            })(
                                                <Select style={{width: '100%'}} placeholder="请选择广告位置">{common.bannerOptions}</Select>
                                            )}
                                        </FormItem>
                                    </Col>                                   
                                </Row>                             
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={10}>
                                        <FormItem className="photo" label="广告图片：">
                                            {getFieldDecorator('photo', {
                                                initialValue: viewPic,
                                                rules: [{
                                                    required: true,
                                                    message: '请上传广告图片',
                                                }],
                                            })(
                                                <Upload
                                                    name="file"
                                                    listType="picture-card"
                                                    className="avatar-uploader"
                                                    showUploadList={false}
                                                    beforeUpload={(file) => common.beforeUpload(file, _this)}
                                                    customRequest={customRequest}>
                                                    {viewPic ? <img src={viewPic} style={{width: "100%"}} alt=""/> : common.uploadButton(photoLoading)}
                                                </Upload>
                                            )}
                                        </FormItem>                                                                      
                                    </Col>
                                </Row>                                
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="companyName" label="图片描述：">
                                            {getFieldDecorator('title', {
                                                initialValue: data.name,
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '图片描述不能为空',
                                                    },
                                                    {
                                                        min: 6,
                                                        message: '图片描述至少6个字'
                                                    },
                                                    {
                                                        max: 42,
                                                        message: '图片描述不能超过42个字符'
                                                    }
                                                ]
                                            })(
                                                <Input placeholder="请输入图片描述(6-42字)"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="licenseNumber" label="跳转链接：">
                                            {getFieldDecorator('linkAddress', {
                                                initialValue: data.linkAddress,
                                                rules: [{
                                                    required: false,
                                                }],
                                            })(
                                                <Input placeholder="请输入图片跳转链接"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>             
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

// 广告信息编辑组件
class ItemEdit extends Component {
    constructor(props) {
      super(props);    
      this.state = {
            visible: false,
            data: {}, // 广告基本信息
            uploadToken: "",// 广告图片相关变量
            viewPic: "",
            photoLoading: false,            
            loading: false, // 提交按钮状态变量          
        };
    }

    showModal = () => {        
        this.setState({// 获取广告基本信息
            visible: true,
            data: this.props.record,
            viewPic: this.props.record.photo
        });
    };
    
    // 取消操作
    handleCancel = () => {
        this.setState({
            visible: false
        }, () => {
            this.setState({                
                data: {},                            
                uploadToken: "",
                viewPic: "",
                photoLoading: false,                
                loading: false,
            });
        });
    };

    // 确认操作
    handleCreate = () => {
        // data空值处理
        if (JSON.stringify(this.state.data) === "{}") {
            return;
        }
        const form = this.form;
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            // 广告图片写入与校验 // 如何判断是否修改            
            if (!this.state.viewPic) {
                message.error("广告图片未选择提交");
                return
            }        
            
            if (!values.cityId) {
                message.error("请选择展示城市");
                return
            }

            let currentCityName = common.pCAName(this.props.provinceList, values.cityId[1]).currentCityName;

            this.setState({loading: true});
            const data = {
                id: this.props.id,
                provinceId: values.cityId[0],
                provinceName: values.cityId[0] === "0" ? "全国" : currentCityName[0],
                cityId: values.cityId[1] || values.cityId[0],
                cityName: values.cityId[0] === "0" ? "全国" : currentCityName[1],
                type: values.type,
                photo: this.state.viewPic.slice(config.configUrl.photoUrl.length),
                title: values.title,
                linkAddress: values.linkAddress,
            }
            config.updateAdv(data).then((json) => {
                if (json.data.result === 0) {
                    message.success("广告信息修改成功");
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
                <span onClick={this.showModal}>编辑</span>
                <ItemEditForm
                    ref={this.saveFormRef}
                    _this={this}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    id={this.props.id}
                    data={this.state.data}
                    viewPic={this.state.viewPic}
                    photoLoading={this.state.photoLoading}
                    provinceList={this.props.provinceList}                    
                    confirmLoading={this.state.loading}/>
            </a>
        );
    }
}

// 广告列表
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
                title: '排序',
                dataIndex: 'sort',
                width: 130,
                editable: true,
            },
            {
                title: '描述',
                dataIndex: 'name',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '图片',
                dataIndex: 'photo',
                width: '6%',
                render: (text, record) => (
                    <div className="hove-photo-scale">
                        <img style={{width: '45px', height: "25px"}} alt="" src={record["photo"]}/>
                    </div>
                )
            },
            {
                title: '广告位置',
                dataIndex: 'typeName',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'typeName'),
            },            
            {
                title: '展示城市',
                dataIndex: 'cityName',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'cityName'),
            },
            {
                title: '跳转链接',
                dataIndex: 'linkAddress',
                width: '15%',
                className: 'operating',
                render: (text, record) => this.renderColumns(text, record, 'linkAddress'),
            },
            {
                title: '创建日期',
                dataIndex: 'createTime',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*广告编辑*/}
                            <ItemEdit 
                                id={record.id}
                                record={record} 
                                educationKey={record.educationKey}
                                recapture={this.getData}
                                provinceList={this.props.provinceList}
                                optionsType={this.props.optionsType}
                                toLoginPage={this.props.toLoginPage} 
                                opStatus={this.props.opObj.modify}/>                            
                            {/*广告删除*/}
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
                            {/*广告下架*/}
                            <Popconfirm 
                                title={record.status === "上架" ? "确认下架?" : "确认上架?"}
                                placement="topRight"
                                onConfirm={() => this.itemBan(record.id, record.status)}
                                onCancel=""
                                okType="danger"
                                okText="确认"
                                cancelText="取消">
                                <a>{record.status === "上架" ? "下架" : "上架"}</a>
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

    dateHandle = (data) => {
        const result = [];
        data.forEach((item, index) => {
            result.push({
                key: index.toString(),
                id: item.id,
                index: index + 1,
                sort: item.sort !== 0 ? item.sort : "",
                name: item.title,
                photo: item.photo,
                type: item.type,
                typeName: common.bannerStatus(item.type),
                cityName: item.cityName,
                cityId: item.cityId,
                linkAddress: item.linkAddress,
                createTime: item.createTime,
                statusCode: item.status,
                status: common.putAwayStatus(item.status)
            });
        });
        return result;
    };
    
    // 获取本页信息
    getData = (keyword) => {
        this.setState({loading: true});        
        const params = {            
            type: keyword ? keyword.type : this.props.keyword.type,// 广告位置            
            title: keyword ? keyword.title : this.props.keyword.title,// 广告描述            
            cityId: keyword ? keyword.cityCode : this.props.keyword.cityCode,// 城市
            startTime: keyword ? keyword.startTime : this.props.keyword.startTime,
            endTime: keyword ? keyword.endTime : this.props.keyword.endTime,
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize,
        };
        config.advList(params).then((json) => {
            if (json.data.result === 0) {
                common.handleTableNoDataResponse(this, json.data.data);
                this.setState({
                    loading: false,
                    data: this.dateHandle(json.data.data.list),
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

    // 设置排序
    handleSort = (row) => {
        this.setState({loading: true});
        config.sortAdv({            
            id: row.id,// 广告Id            
            sort: Number(row.sort),// 排序
        }).then((json) => {
            if (json.data.result === 0) {
                this.setState({loading: false});
                this.getData(); //刷新数据
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    // 广告删除
    itemDelete = (id) => {
        this.setState({loading: true});
        config.deleteAdv({id: id}).then((json) => {
            if (json.data.result === 0) {
                message.success("广告删除成功");
                this.getData(this.props.keyword);
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    // 广告上架,下架
    itemBan = (id, status) => {
        this.setState({loading: true});
        config.putAwayAdv({ // 2:上架, 3:下架
            id: id,
            status: status === "上架" ? 3 : 2
        }).then((json) => {
             if (json.data.result === 0) {
                message.success(status === "上架" ? "明星下架成功" : "明星上架成功");
                this.getData();
            } else {
                common.exceptHandle(this, json.data);;
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
                    components={components}
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    columns={columns}
                    scroll={{ x: 1500 }}
                    onChange={(pagination) => common.handleTableChange(this, pagination)}/>;
    }
}

class AdvManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            keyword: {// 获取广告列表所需关键词
                type: null,
                cityCode: "",
                title: "",
                startTime: null,// 初始化开始日期和结束日期
                endTime: null,
            },
            flag_add: false,
            startValue: null,// 日期禁选控制
            endValue: null,
            endOpen: false,
            mapObj: {},// 地图控件对象
            provinceList: [],// 省市列表
        };              
    }  

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
       this.setState({opObj: common.getPower(this).data});
    };

    //广告位置设置
    setType = (value) => {
        this.setState({
            keyword: {
                type: value,
                cityCode: this.state.keyword.cityCode,
                educationName: this.state.keyword.educationName,
                startTime: this.state.keyword.startTime,
                endTime: this.state.keyword.endTime,
            }
        })
    };

    //城市选择设置
    setCity = (value) => {
        this.setState({
            keyword: {
                type: this.state.keyword.type,
                cityCode: value[1] || value[0],
                title: this.state.keyword.title,
                startTime: this.state.keyword.startTime,
                endTime: this.state.keyword.endTime,
            }
        })
    };

    // 描述关键词设置
    setName = (value) => {
        if (value !== this.state.keyword.educationName) {
            this.setState({
                keyword: {
                    type: this.state.keyword.type,
                    cityCode: this.state.keyword.cityCode,
                    title: value,
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
                type: this.state.keyword.type,
                cityCode: this.state.keyword.cityCode,
                title: this.state.keyword.title,
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
                type: this.state.keyword.type,
                cityCode: this.state.keyword.cityCode,
                title: this.state.keyword.title,
                startTime: this.state.keyword.startTime,
                endTime: dateString,
            }
        })
    };

    setFlag = () => { // 刷新table 
        this.setState({flag_add: !this.state.flag_add})
    };

    componentWillMount() {
        let girlFriend = new Object({name: '苍老师'});
        console.log("女友：" + girlFriend.name);
        common.getMapDate(this, 'adv-mapContainer', 2);// 获取省份城市
        this.setPower();// 获取权限
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
                            <header className="clearfix">
                                {/*广告位置筛选*/}
                                <Select
                                    onChange={this.setType}
                                    className="adv-select"
                                    placeholder="请选择banner位置"
                                    allowClear>
                                    {common.bannerOptions}
                                </Select>
                                {/*城市筛选*/}
                                <Cascader 
                                    options={common.pCAName(this.state.provinceList).optionsOfCity} 
                                    onChange={this.setCity} 
                                    className="adv-select" 
                                    placeholder="请选择所属城市"
                                    allowClear/>
                                {/*广告名称筛选*/}
                                <Search
                                    placeholder="请输入描述信息"
                                    onSearch={this.setName}
                                    enterButton allowClear
                                    className="adv-search"/>
                                {/*广告创建日期筛选*/}
                                <span>日期筛选： </span>
                                <DatePicker
                                    disabledDate={(startValue) => common.disabledStartDate(this, startValue)}
                                    onChange={this.setStartTime}
                                    placeholder="请选择开始日期"
                                    className="datePick"/>
                                <span style={{margin: "0 10px"}}>至</span>
                                <DatePicker
                                    disabledDate={(endValue) => common.disabledStartDate(this, endValue)}
                                    onChange={this.setEndTime}
                                    placeholder="请选择结束日期"
                                    className="datePick"/>
                                {/*广告添加*/}
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd 
                                        opStatus={this.state.opObj.add}
                                        optionsOfCity={common.pCAName(this.state.provinceList).optionsOfCity}
                                        provinceList={this.state.provinceList}
                                        optionsType={this.optionsType}
                                        recapture={this.setFlag}
                                        toLoginPage={() => common.toLoginPage(this)}/>
                                </div>
                            </header>
                            {/*广告列表*/}
                            <div className="table-box">
                                <DataTable 
                                    ref="getDataCopy"
                                    opObj={this.state.opObj}
                                    provinceList={this.state.provinceList}
                                    optionsType={this.optionsType}
                                    typeList={this.state.typeList}
                                    keyword={this.state.keyword}
                                    flag_add={this.state.flag_add}
                                    toLoginPage={() => common.toLoginPage(this)}/>
                            </div>
                            {/*地图组件容器*/}
                            <div id="adv-mapContainer"/>                              
                        </div>
                        :
                        <p>暂无查询权限</p>
                }
            </div>  
        )
    }
}

export default AdvManage;