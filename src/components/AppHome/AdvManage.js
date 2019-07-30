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
    Icon,
    message,
    Spin,
    Cascader,
} from 'antd';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';
import { configUrl, getToken, advList, saveAdv, updateAdv, deleteAdv, sortAdv, putAwayAdv } from '../../config';
import { getPower, pCAName, bannerOptions } from '../../config/common';


const Search = Input.Search;
const {Option} = Select;
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
        const {visible, onCancel, onCreate, form, optionsOfCity, reqwestUploadToken, viewPic, picUpload01, photoLoading, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 广告图片相关
        const beforeUpload = (file) => {
            const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isIMG) {
                message.error('文件类型错误');
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('文件不能大于2M');
            }         
            reqwestUploadToken(file);
            return isIMG && isLt2M;
        };
        const picHandleChange = (info) => {
            setTimeout(()=>{
                picUpload01(info.file);
            }, 500);   
        };
        const uploadButton = (
            <div>
                <Icon type={photoLoading ? 'loading' : 'plus'}/>
                <div className="ant-upload-text" style={{display: photoLoading ? "none" : "block"}}>选择图片</div>
            </div>
        );

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
                                        <Select style={{width: '100%'}} placeholder="请选择广告位置">{bannerOptions}</Select>                                       
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
                                            beforeUpload={beforeUpload}
                                            customRequest={picHandleChange}>
                                            {viewPic ? <img src={viewPic} style={{width: "100%"}} alt=""/> : uploadButton}
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
    
    // 广告图片处理-----------------------------------
    // 请求上传凭证，需要后端提供接口
    reqwestUploadToken = () => {
        getToken().then((json) => {
            if (json.data.result === 0) {
                    this.setState({
                        uploadToken: json.data.data,
                    })
                } else {
                    this.exceptHandle(json.data);
                }
        }).catch((err) => {
            message.error("发送失败");
        });
    };

    picUpload01 = (para) => {
        const _this = this;
        this.setState({photoLoading: true,});
        const file = para;
        const key = UUID.create().toString().replace(/-/g,"");
        const token = this.state.uploadToken;
        const config = {
            region: qiniu.region.z0
        };
        const observer = {
            next (res) {console.log(res)},
            error (err) {
                console.log(err)
                message.error(err.message ? err.message : "图片提交失败");                
                _this.setState({photoLoading: false});
            }, 
            complete (res) {
                console.log(res);
                message.success("图片提交成功");
                _this.setState({
                    viewPic: configUrl.photoUrl + res.key || "",                               
                    photoLoading: false,
                })
            }
        }
        const observable = qiniu.upload(file, key, token, config);
        observable.subscribe(observer); // 上传开始     
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
                values.photo = this.state.viewPic.slice(configUrl.photoUrl.length);
            }
            // 广告展示城市校验
            if (!values.cityId.length) {
                message.error("请选择广告展示城市");
                return
            }

            let currentCityName = pCAName(this.props.provinceList, values.cityId[1]).currentCityName;

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
            saveAdv(data).then((json) => {
                if (json.data.result === 0) {
                    message.success("广告添加成功");
                    this.handleCancel();
                    this.props.recapture();
                } else {
                    this.exceptHandle(json.data);
                }
            }).catch((err) => {
                message.error("保存失败");
                this.setState({loading: false});
            })
        });
    };

    // 异常处理
    exceptHandle = (data) => {
        if (data.code === 901) {
            message.error("请先登录");
            this.props.toLoginPage();
        } else if (data.code === 902) {
            message.error("登录信息已过期，请重新登录");
            this.props.toLoginPage();
        } else {
            message.error(data.message);
            this.setState({loading: false});
        }
    }

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button type="primary" onClick={this.showModal}>添加广告</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    reqwestUploadToken={this.reqwestUploadToken}
                    viewPic={this.state.viewPic}
                    picUpload01={this.picUpload01}
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
        const {visible, onCancel, onCreate, form, data, reqwestUploadToken, viewPic,  picUpload01, photoLoading, provinceList, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 图片上传保持原比例
        const beforeUpload = (file) => {
            const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isIMG) {
                message.error('文件类型错误');
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('文件不能大于2M');
            }         
            reqwestUploadToken(file);
            return isIMG && isLt2M;
        };
        const picHandleChange = (info) => {
            setTimeout(()=>{
                picUpload01(info.file);
            }, 500);   
        };
        const uploadButton = (
            <div>
                <Icon type={photoLoading ? 'loading' : 'plus'}/>
                <div className="ant-upload-text" style={{display: photoLoading ? "none" : "block"}}>选择图片</div>
            </div>
        );   
        
        // 城市选项生成
        const optionsOfCity = [{value: "0", label: "全国"}];
        let currentCity = []; 
        if (provinceList.length) {
            provinceList.forEach((item) => {
                let children = [];
                if (item.districtList) {
                    item.districtList.forEach((subItem) => {
                        children.push({value: subItem.adcode, label: subItem.name});
                        if (Number(subItem.adcode) === data.cityId) {                            
                            currentCity = [item.adcode, subItem.adcode];// 当前城市设为选中项
                        }
                    });
                }
                optionsOfCity.push({value: item.adcode, label: item.name, children: children});
            });
        }
        
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
                                                initialValue: data.cityId === 0 ? ["0"] : currentCity,
                                                rules: [{
                                                    required: true,
                                                    message: "展示城市未选择"
                                                }],
                                            })(
                                                <Cascader options={optionsOfCity} placeholder="请选择所属城市"/>
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
                                                <Select style={{width: '100%'}} placeholder="请选择广告位置">{bannerOptions}</Select>
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
                                                    beforeUpload={beforeUpload}
                                                    customRequest={picHandleChange}>
                                                    {viewPic ? <img src={viewPic} style={{width: "100%"}} alt=""/> : uploadButton}
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

    // 请求上传凭证，需要后端提供接口
    reqwestUploadToken = () => {
        getToken().then((json) => {
            if (json.data.result === 0) {
                    this.setState({
                        uploadToken: json.data.data,
                    })
                } else {
                    this.exceptHandle(json.data);
                }
        }).catch((err) => {
            message.error("发送失败");
        });
    };
    
    picUpload01 = (para) => {
        const _this = this;
        this.setState({photoLoading: true});       
        const file = para;
        const key = UUID.create().toString().replace(/-/g,"");
        const token = this.state.uploadToken;
        const config = {
            region: qiniu.region.z0
        };
        const observer = {
            next (res) {console.log(res)},
            error (err) {
                console.log(err)
                message.error(err.message ? err.message : "图片提交失败");                
                _this.setState({photoLoading: false});
            }, 
            complete (res) {
                console.log(res);
                message.success("图片提交成功");
                _this.setState({
                    viewPic: configUrl.photoUrl + res.key || "",                            
                    photoLoading: false,
                });
            }
        }
        const observable = qiniu.upload(file, key, token, config);
        observable.subscribe(observer); // 上传开始    
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

            let currentCityName = pCAName(this.props.provinceList, values.cityId[1]).currentCityName;

            this.setState({loading: true});
            const data = {
                id: this.props.id,
                provinceId: values.cityId[0],
                provinceName: values.cityId[0] === "0" ? "全国" : currentCityName[0],
                cityId: values.cityId[1] || values.cityId[0],
                cityName: values.cityId[0] === "0" ? "全国" : currentCityName[1],
                type: values.type,
                photo: this.state.viewPic.slice(configUrl.photoUrl.length),
                title: values.title,
                linkAddress: values.linkAddress,
            }
            updateAdv(data).then((json) => {
                if (json.data.result === 0) {
                    message.success("广告信息修改成功");
                    this.handleCancel();
                    this.props.recapture();
                } else {
                    this.exceptHandle(json.data);
                }
            }).catch((err) => {
                message.error("保存失败");
                this.setState({loading: false});
            })
        });
    };

     // 异常处理
    exceptHandle = (data) => {
        if (data.code === 901) {
            message.error("请先登录");
            this.props.toLoginPage();
        } else if (data.code === 902) {
            message.error("登录信息已过期，请重新登录");
            this.props.toLoginPage();
        } else {
            message.error(data.message);
            this.setState({loading: false});
        }
    }

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
                    id={this.props.id}
                    data={this.state.data}
                    reqwestUploadToken={this.reqwestUploadToken}
                    viewPic={this.state.viewPic}
                    picUpload01={this.picUpload01}
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
        advList(params).then((json) => {
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
                    let tempStatus = "";
                    if (item.status === 2) {
                        tempStatus = "上架"
                    }
                    if (item.status === 3) {
                        tempStatus = "下架"
                    }                    
                    // 广告位置
                    let tempTypeName = "";                    
                    if (item.type === 1) {
                        tempTypeName = "明星banner"
                    }
                    if (item.type === 2) {
                        tempTypeName = "通告banner"
                    }
                    data.push({
                        key: index.toString(),
                        id: item.id,
                        index: index + 1,
                        sort: item.sort !== 0 ? item.sort : "",                            
                        name: item.title,
                        photo: item.photo,
                        type: item.type,
                        typeName: tempTypeName,
                        cityName: item.cityName,
                        cityId: item.cityId,
                        linkAddress: item.linkAddress,
                        createTime: item.createTime,
                        statusCode: item.status,
                        status: tempStatus
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
                this.expectHandle(json.data);
            }
        }).catch((err) => {
            message.error("获取失败");
            this.setState({loading: false});  
        })
    };

    // 设置排序
    handleSort = (row) => {
        this.setState({loading: true});
        const data = {            
            id: row.id,// 广告Id            
            sort: Number(row.sort),// 排序
        };
        sortAdv(data).then((json) => {
            if (json.data.result === 0) {
                this.setState({loading: false});
                this.getData(); //刷新数据
            } else {
                this.expectHandle(json.data);
            }
        }).catch((err) => {
            message.error("获取失败");
            this.setState({loading: false});
        });
    };

    // 广告删除
    itemDelete = (id) => {
        this.setState({loading: true});
        deleteAdv({id: id}).then((json) => {
            if (json.data.result === 0) {
                message.success("广告删除成功");
                this.getData(this.props.keyword);
            } else {
                this.expectHandle(json.data);
            }
        }).catch((err) => {
            message.error("保存失败");
            this.setState({loading: false});
        })
    };

    // 广告上架,下架
    itemBan = (id, status) => {
        this.setState({loading: true});
        const data = { // 2:上架, 3:下架
            id: id,
            status: status === "上架" ? 3 : 2
        };
        putAwayAdv(data).then((json) => {
             if (json.data.result === 0) {
                message.success(status === "上架" ? "明星下架成功" : "明星上架成功");
                this.getData();
            } else {
                this.expectHandle(json.data);
            }
        }).catch((err) => {
            message.error("保存失败");
            this.setState({loading: false});
        })
    };

    // 异常处理
    expectHandle = (data) => {
        if (data.code === 901) {
            message.error("请先登录");                        
            this.props.toLoginPage();// 返回登陆页
        } else if (data.code === 902) {
            message.error("登录信息已过期，请重新登录");                        
            this.props.toLoginPage();// 返回登陆页
        } else {
            message.error(data.message);
            this.setState({loading: false});
        }
    };

    // 表格参数变化处理
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
                    components={components}
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    columns={columns}
                    scroll={{ x: 1500 }}
                    onChange={this.handleTableChange}/>;
    }
}

class AdvManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {
                add: true,
                delete: true,
                modify: true,
                select: true,
                putAway: true
            },
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
        this.optionsType = [
            <Option key={this.state.keyword.type} value={this.state.keyword.type}>{"全部banner位置"}</Option>,
            <Option key={1} value={1}>明星banner </Option>,
            <Option key={2} value={2}>通告banner</Option>,
        ];
        this.optionsOfCity = [{value: "0", label: "全国"}];       
    }

    // 获取省市列表信息及当前城市地区代码
    getMapDate = () => {
        this.setState({
            mapObj: new window.AMap.Map('adv-mapContainer')
        }, () => {
            // 获取省区列表
            this.state.mapObj.plugin('AMap.DistrictSearch', () => {
                var districtSearch = new window.AMap.DistrictSearch({
                    level: 'country',
                    subdistrict: 2
                });
                districtSearch.search('中国', (status, result) => {                    
                    this.setState({
                        provinceList: result.districtList[0].districtList.sort((a, b) => {return a.adcode - b.adcode})
                    }, () => {                                            
                        this.cityList();
                    });
                })
            });
            // 获取当前城市地区代码
            this.state.mapObj.plugin('AMap.CitySearch', () => {
                var citySearch = new window.AMap.CitySearch();
                citySearch.getLocalCity((status, result) => {
                    if (status === 'complete' && result.info === 'OK') {
                        this.setState({
                            cityCode: result.adcode
                        })
                    }
                })
            })
        })
    };

    // 城市选项生成
    cityList = () => {
        if (this.state.provinceList.length) {
            this.state.provinceList.forEach((item) => {
                let children = [];
                if (item.districtList) {
                    item.districtList.forEach((subItem) => {
                        children.push({value: subItem.adcode, label: subItem.name});                    
                    });
                }
                this.optionsOfCity.push({value: item.adcode, label: item.name, children: children});
            });
        }        
    };

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
       this.setState({opObj: getPower(this).data});
    };

    //广告位置设置
    setType = (value) => {
        console.log("selected:", value);
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

    setFlag = () => { // 刷新table 
        this.setState({flag_add: !this.state.flag_add})
    };

    // 登陆信息过期或不存在时的返回登陆页操作
    toLoginPage = () => {
        sessionStorage.clear();
        this.props.history.push('/')
    };

    componentWillMount() {
        this.getMapDate();// 获取省份城市        
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
                                    style={{
                                        width: "150px",
                                        float: "left",
                                        marginRight: "20px"
                                    }}
                                    onChange={this.setType}
                                    placeholder="请选择banner位置"
                                    allowClear>
                                    {this.optionsType}
                                </Select>
                                {/*城市筛选*/}
                                <Cascader 
                                    options={this.optionsOfCity} 
                                    onChange={this.setCity} 
                                    style={{width: "150px", float: "left", marginRight: "20px"}} 
                                    placeholder="请选择所属城市"
                                    allowClear/>
                                {/*广告名称筛选*/}
                                <Search
                                    placeholder="请输入描述信息"
                                    onSearch={this.setName}
                                    enterButton
                                    style={{width: "240px", float: "left", marginRight: "20px"}}/>
                                {/*广告创建日期筛选*/}
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
                                {/*广告添加*/}
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd 
                                        opStatus={this.state.opObj.add}
                                        optionsOfCity={this.optionsOfCity}
                                        provinceList={this.state.provinceList}
                                        optionsType={this.optionsType}
                                        recapture={this.setFlag}
                                        toLoginPage={this.toLoginPage}/>
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
                                    toLoginPage={this.toLoginPage}/>
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