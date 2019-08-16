import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    Form,
    Select,
    Upload,
    Tooltip,
    Icon,
    message,
    Row,
    Col,
    InputNumber,
    DatePicker,    
    Cascader,
    Popconfirm
} from 'antd';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import moment from 'moment';
import * as common from '../../config/common';
import * as config from '../../config';

const Search = Input.Search;
const FormItem = Form.Item;
const {TextArea} = Input;
const {Option} = Select;

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

    toggleEdit = () => {
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
                editable ? (
                    <EditableContext.Consumer>
                        {(form) => {
                            this.form = form;
                            return (
                                editing ? 
                                    (
                                        <FormItem style={{ margin: 0 }}>
                                            {form.getFieldDecorator((dataIndex), {
                                                rules: [{
                                                    required: false,
                                                    message: "只能输入数字",
                                                }],
                                                initialValue: record[dataIndex],
                                                })(
                                                <Input style={{ textAlign: "center" }}
                                                    ref={node => (this.input = node)}
                                                    onPressEnter={this.sort.bind(this, record[dataIndex])}
                                                    onBlur={this.sort.bind(this, record[dataIndex])}
                                                    placeholder="双击设置排序"/>
                                            )}
                                        </FormItem>
                                    ) 
                                    : 
                                    (
                                        <div className="editable-cell-value-wrap" onClick={this.toggleEdit}>
                                            <Input 
                                                style={{ textAlign: "center" }}
                                                ref={node => (this.input = node)}
                                                value={record[dataIndex]}
                                                placeholder="双击设置排序"/>
                                        </div>
                                    )
                            );
                        }}
                    </EditableContext.Consumer>
                    ) 
                    : 
                    restProps.children
            }
        </td>
        );
    }
}
// 新增、复制明星表单
const ItemAddForm = Form.create()(
    (props) => {
        const {_this, visible, onCancel, onCreate, form, data, setChildren, childList, provinceList, viewPic, photoLoading, viewPic02, photoLoading02, picList, viewVideo, videoList, editVideo, onChangeCourseName, onChangeSort, videoLoading, confirmLoading} = props;
        const {getFieldDecorator, setFieldsValue} = form;

        // 城市选项生成
        const optionsOfArea = common.pCAName(provinceList, data.areaId).optionsOfArea;
        let currentArea = common.pCAName(provinceList, data.areaId).currentArea;
        
        // 孩子选项生成
        const optionsOfChild = [];
        if (childList.length) {
            childList.forEach((item) => {
                optionsOfChild.push(<Option key={item.id} value={item.id}>{item.name}</Option>)
            })
        }

        const setRelationship = (value) => {
            if (value === 0) {
                setFieldsValue({"relationship": 0});
            } else {
                const fnFilter = (para) => {
                    return para.id === value;
                };
                if (childList.length) {
                    let tempChildList = childList.filter(fnFilter);
                    setFieldsValue({
                        "relationship": tempChildList[0].relationship, 
                        "birthday": moment(tempChildList[0].birthday)
                    });
                }                
            }
        };
       
        const customRequest = (info) => {
            setTimeout(()=>{// 渲染的问题，加个定时器延迟半秒
                common.picUpload(_this, 1, info.file, _this.state.uploadToken);
            }, 500);   
        };       
        
        // 已上传图片列表
        const photoExist = [];
        if (picList.length) {
            console.log(picList)
            picList.forEach((item, index) => {
                photoExist.push(
                    <div className="photoExist-item clearfix" key={index + 1}>
                        <img src={item} alt=""/>
                        <div className="remove">
                            <Button type="dashed" shape="circle" icon="minus" onClick={() => common.deleteFileList(_this, 2, index)}/>
                        </div>
                    </div>
                )
            });
        }
        
        // 生活照
        const customRequest02 = (info) => {           
            setTimeout(()=>{// 渲染的问题，加个定时器延迟半秒
                common.picUpload(_this, 2, info.file, _this.state.uploadToken);
            }, 500);
        };
       
        const customRequest05 = (info) => {
            setTimeout(() => {// 渲染的问题，加个定时器延迟半秒
                common.picUpload(_this, 5, info.file, _this.state.uploadToken);
            }, 500);
        };

        // 已上传视频写入
        const tempVideoList = [];
        if (videoList.length) {
            console.log(videoList);
            videoList.forEach((item, index) => {
                tempVideoList.push(
                    <Col span={8} key={index+1}>
                        <div className="videoCol">
                            <div className="chapter">序号{item.sort || (videoList.length - index)}</div>
                            {/*<div className="videoSize">{item.videoSize} M</div>*/}
                            <video id="video-add" src={item.resource} controls="controls" preload="auto" width="100%"></video>
                            <input className="videoCourseName" disabled={item.readOnly} onChange={(e) => onChangeCourseName(e.target.value, index)} value={item.name} placeholder="请输入作品名称"/>
                            <ul className="video-edit-ul-items">
                                <li className="item-video" onClick={() => editVideo(index)}>
                                    <Icon type="edit" />编辑
                                </li>
                                <li className="item-video">
                                    <input disabled={item.readOnly} type="text" value={item.sort ? item.sort : ''} onChange={(e) => onChangeSort(e.target.value, index)} placeholder="双击排序"/>
                                </li>                            
                                <li className="item-video" onClick={() => common.deleteFileList(_this, 3, index)}>
                                    <Icon type="delete" />删除
                                </li>
                            </ul>
                        </div>                        
                    </Col>)
            });
        }
        
        return (
            <Modal
                visible={visible}
                title="添加"
                width={1000}
                onCancel={onCancel}
                footer={[
                    <Button key="back" onClick={onCancel} disabled={confirmLoading}>取消</Button>,
                    <Button key="submit" type="primary" loading={confirmLoading} onClick={() => onCreate(2)}>确定</Button>
                ]}
                maskClosable={false}
                destroyOnClose={true}>
                <div className="course-add course-form item-form quality-course-form star-manage-form">
                    <Form layout="vertical">
                        <h4 className="add-form-title-h4">基础信息</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="name"  label="姓名：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.name,                                      
                                        rules: [{
                                            required: true,
                                            message: '姓名不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入姓名"/>
                                    )}
                                </FormItem>
                                <div className="tip-help">
                                    <Tooltip title="请输入真实姓名"><Icon type="alert" /> 填写帮助</Tooltip>
                                </div>
                            </Col>
                            <Col span={8}>
                                <FormItem className="gender"  label="性别：">
                                    {getFieldDecorator('gender', {
                                        initialValue: data.gender,                                      
                                        rules: [{
                                            required: true,
                                            message: '性别不能为空',
                                        }],
                                    })(
                                        <Select placeholder="请选择性别">{common.genderOptions}</Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="height"  label="身高：">
                                    {getFieldDecorator('height', {
                                        initialValue: data.height,
                                        rules: [{
                                            required: true,
                                            message: '身高不能为空',
                                        }],
                                    })(
                                        <InputNumber style={{width: "90%"}} step={1} precision={2} placeholder="请填写身高"/>
                                    )} CM
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="weight"  label="体重：">
                                    {getFieldDecorator('weight', {
                                        initialValue: data.weight,                                      
                                        rules: [{
                                            required: true,
                                            message: '体重不能为空',
                                        }],
                                    })(
                                        <InputNumber style={{width: "90%"}} step={0.1} precision={3} placeholder="请填写体重"/>
                                    )} KG
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="area"  label="所在地区：">
                                    {getFieldDecorator('area', {
                                        initialValue: data.areaId === 0 ? ["0"] : currentArea,
                                        rules: [{
                                            required: true,
                                            message: '所在地区不能为空',
                                        }],
                                    })(
                                        <Cascader options={optionsOfArea} placeholder="请选择所在地区"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="phone"  label="联系方式：">
                                    {getFieldDecorator('phone', {
                                        initialValue: data.phone,                                      
                                        rules: [{
                                            required: true,
                                            validator: common.checkTel
                                        }],
                                    })(
                                        <Input onBlur={(e) => setChildren(e.target.value)} placeholder="请输入联系方式"/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="childId"  label="孩子：">
                                    {getFieldDecorator('childId', {
                                        initialValue: data.childId || (childList.length === 0 ? 0 : undefined),
                                        rules: [{
                                            required: true,
                                            message: "孩子不能为空"
                                        }],
                                    })(
                                        <Select allowClear onChange={(value) => setRelationship(value)} placeholder="请选择孩子">{optionsOfChild}</Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="relationship"  label="用户与孩子关系：">
                                    {getFieldDecorator('relationship', {
                                        initialValue: data.relationship,
                                        rules: [{
                                            required: true,
                                            message: "用户与孩子关系不能为空"
                                        }],
                                    })(
                                        <Select allowClear placeholder="请选择用户与孩子关系">{common.childrenOptions}</Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="birthday"  label="生日：">
                                    {getFieldDecorator('birthday', {                                       
                                        initialValue: moment(data.birthday || new Date(), "YYYY-MM-DD"),
                                        rules: [{
                                            required: true,
                                            message: "生日不能为空"
                                        }],
                                    })(
                                        <DatePicker style={{width: "100%"}} placeholder="请选择生日"/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem className="avatar"  label="头像：">
                                    {getFieldDecorator('avatar', {
                                        initialValue: viewPic,
                                        rules: [{
                                            required: true,
                                            message: '头像不能为空',
                                        }],
                                    })(
                                        <Upload
                                            name="file"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            accept="image/*"
                                            showUploadList={false}
                                            beforeUpload={(file) => common.beforeUpload(file, _this)}
                                            customRequest={customRequest}>
                                            {viewPic ? <img src={viewPic} alt=""/> : common.uploadButton(1, photoLoading)}
                                        </Upload>                                        
                                    )}
                                </FormItem>
                            </Col>
                        </Row>                        
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">明星详情</h4>
                        <FormItem className="personalProfile" label="明星简介：">
                            {getFieldDecorator('personalProfile', {
                                initialValue: data.description,
                                rules: [{
                                    required: true,
                                    message: '简介不能为空',
                                }],
                            })(
                                <TextArea                                     
                                    style={{resize: "none"}}                                    
                                    placeholder="请填写明星简介"
                                    autosize={{minRows: 5, maxRows: 30}}/>                                
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">生活照</h4>
                        <FormItem className="photo"  label="">
                            {getFieldDecorator('photo', {
                                initialValue: viewPic02,
                                rules: [{
                                    required: false,
                                    message: '明星图片不能为空',
                                }],
                            })( 
                                <div className="itemBox">
                                    {photoExist}
                                    <Upload
                                        name="file"
                                        multiple                                        
                                        listType="picture-card"
                                        accept="image/*"
                                        showUploadList={false}
                                        beforeUpload={(file) => common.beforeUpload(file, _this)}
                                        customRequest={customRequest02}>
                                        {common.uploadButton(1, photoLoading02)}                                        
                                        <p className="hint">{config.configUrl.uploadTipContent}</p>
                                    </Upload>
                                </div>
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">视频作品</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="'video"  label="">
                                    {getFieldDecorator('video', {
                                        initialValue: viewVideo,
                                        rules: [{
                                            required: false,
                                            message: '课时不能为空',
                                        }],
                                    })(
                                        <Upload
                                            name="file"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            showUploadList={false}
                                            accept="video/*"
                                            beforeUpload={(file) => common.beforeUpload(file, _this, 2)}
                                            customRequest={customRequest05}>
                                            {common.uploadButton(2, videoLoading)}
                                        </Upload>                                        
                                    )}
                                </FormItem> 
                            </Col>
                            {tempVideoList}                           
                        </Row>                        
                        <div className="ant-line"></div>
                    </Form>
                </div>
            </Modal>
        )
    }
);

// 新增、复制明星组件
class ItemAdd extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,            
            data: {},// 明星基本信息
            childList: [],
            // 明星图片相关变量            
            uploadToken: "",// 获取上传图片token
            viewPic: "",
            photoLoading: false,
            viewPic02: "",
            picList: [],
            photoLoading02: false,            
            viewVideo: "",// 视频上传
            videoList: [],
            videoLoading: false,            
            loading: false, // 提交按钮状态变量      
        };
    }

    // 获取明星基本信息
    getData = () => {
        config.NewestStar({id: this.props.id}).then((json) => {
             if (json.data.result === 0) {
                this.setState({
                    visible: true,
                    data: json.data.data,
                    viewPic: json.data.data.photo,
                    viewPic02: json.data.data.picList.length ? json.data.data.picList[0] : '',
                    picList: json.data.data.picList,
                    videoList: json.data.data.videoList
                }, () => {
                    console.log(this.state.data)
                    this.setChildren(json.data.data.phone);
                });           
            } else {               
                common.exceptHandle(this, json.data, "明星");
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    showModal = (props, event) => {
        if (props === 1) {// 复制明星            
            this.getData();
        } else if (props === 2) {                       
            this.setState({
                data: {},
                visible: true
            });
        }
    };

    // 倒计时
    // countDown = () => {
    //     let secondsToGo = 3;
    //     const modal = Modal.success({
    //         title: `温馨提示`,
    //         content: `你还没添加明星，请先添加明星，正在返回，请稍后 ${secondsToGo} s.`,
    //     });
    //     const timer = setInterval(() => {
    //         secondsToGo -= 1;
    //         modal.update({
    //            content: `你还没添加明星，请先添加明星，正在返回，请稍后 ${secondsToGo} s.`,
    //         });
    //     }, 1000);
    //     setTimeout(() => {
    //         clearInterval(timer);
    //         sessionStorage.removeItem("courseData");
    //         modal.destroy();
    //     }, secondsToGo * 1000);
    // };
    
    // 孩子列表
    setChildren = (value) => {
        config.childrenList({phone: value}).then((json) => {
            if(json.data.result === 0) {
                this.setState({
                    childList: json.data.data           
                })
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    // 图片处理    
    // reqwestUploadToken = () => { // 请求上传凭证，需要后端提供接口
    //     config.getToken().then((json) => {
    //         if (json.data.result === 0) {
    //                 this.setState({
    //                     uploadToken: json.data.data,
    //                 })
    //             } else {
    //                 common.exceptHandle(this, json.data);
    //             }
    //     }).catch((err) => common.errorHandle(this, err));
    // };

    // 头像上传
    // picUpload = (para) => {
    //     const _this = this;
    //     this.setState({photoLoading: true});
    //     const file = para;
    //     const key = UUID.create().toString().replace(/-/g, "");
    //     const token = this.state.uploadToken;
    //     const config = {region: qiniu.region.z0};
    //     const observer = {
    //         next (res) {console.log(res)},
    //         error (err) {
    //             console.log(err)
    //             message.error(err.message ? err.message : "图片提交失败");
    //             _this.setState({photoLoading: false})
    //         }, 
    //         complete (res) {
    //             console.log(res);
    //             message.success("图片提交成功");
    //             _this.setState({
    //                 viewPic: config.configUrl.photoUrl + res.key || "",           
    //                 photoLoading: false,
    //             })
    //         }
    //     }
    //     const observable = qiniu.upload(file, key, token, config);
    //     observable.subscribe(observer); // 上传开始        
    // };

    // 图片上传
    // picUpload03 = (para) => {
    //     const _this = this;
    //     this.setState({photoLoading03: true});
    //     const file = para;
    //     const key = UUID.create().toString().replace(/-/g, "");
    //     const token = this.state.uploadToken;
    //     const config = {region: qiniu.region.z0};
    //     const observer = {
    //         next (res) {console.log(res)},
    //         error (err) {
    //             console.log(err)
    //             message.error(err.message ? err.message : "图片提交失败");
    //             _this.setState({photoLoading03: false})
    //         }, 
    //         complete (res) {
    //             console.log(res);
    //             message.success("图片提交成功");
    //             let {picList} = _this.state; // 此行不加只能添加一张
    //             picList.push(config.configUrl.photoUrl + res.key);
    //             _this.setState({
    //                 picList: picList,
    //                 viewPic03: config.configUrl.photoUrl + res.key || "",           
    //                 photoLoading03: false,
    //             })
    //         }
    //     }
    //     const observable = qiniu.upload(file, key, token, config);
    //     observable.subscribe(observer); // 上传开始        
    // };
    
    // 图片删除
    // setPicList = (index) => {
    //     let data = this.state.picList;
    //     data.splice(index, 1);
    //     this.setState({
    //         picList: data
    //     });
    // };
   
    // 视频上传
    // picUpload02 = (para) => {
    //     const _this = this;
    //     const videoSize = (para.size/1024/1024).toFixed(2);
    //     if (this.state.videoList.length >= 25) {
    //         message.error("视频最多上传25个");
    //         return
    //     } else {
    //         this.setState({videoLoading: true});
    //         const file = para;
    //         const key = UUID.create().toString().replace(/-/g,"");
    //         const token = this.state.uploadToken;
    //         const config = {
    //             region: qiniu.region.z0
    //         };
    //         const observer = {
    //             next (res) {
    //                 console.log(res);
    //             },
    //             error (err) {
    //                 console.log(err)
    //                 message.error(err.message ? err.message : "视频提交失败");
    //                 _this.setState({videoLoading: false});
    //             }, 
    //             complete (res) {
    //                 console.log(res);
    //                 message.success("视频提交成功");
    //                 let videoList = _this.state.videoList;
    //                 videoList.unshift({ 
    //                     sort: 0,                      
    //                     resource: config.configUrl.photoUrl + res.key,
    //                     videoSize: videoSize,
    //                     readOnly: true,
    //                 });
    //                 _this.setState({
    //                     videoList: videoList,                       
    //                     viewVideo: "",
    //                     videoLoading: false,
    //                 }, () => {
                        
    //                 });
    //             }
    //         }
    //         const observable = qiniu.upload(file, key, token, config);
    //         observable.subscribe(observer); // 上传开始
    //     }
    // };

    // 视频编辑
    editVideo = (index) => {
        // 视频没有播放完duration是undefined
        // setTimeout(()=> {
            // let ele = document.getElementById('video' + index);
            console.log(document.getElementById('video-add'))
            let duration = document.getElementById('video-add').duration;
            console.log(duration);
            // let duration = 5;
            let {videoList} = this.state;
            this.setState({
                // videoList: videoList.map((item, idx) => idx === index ? {...item, duration: duration, readOnly: false,} : item).sort((a, b) => {return  a.sort - b.sort;})  
                videoList: videoList.map((item, idx) => idx === index ? {...item, readOnly: false,} : item).sort((a, b) => {return  a.sort - b.sort;})  
            },() => {
                console.log(this.state.videoList)
            });
        // }, 500);
    };    
    
    // 视频删除
    // deleteVideo = (index) => {
    //     let data = this.state.videoList;
    //     data.splice(index, 1);
    //     this.setState({
    //         videoList: data
    //     });
    // };

    // 视频明星名称
    onChangeCourseName = (value, index) => {
        let {videoList} = this.state;
        console.log(videoList);
        this.setState({
            videoList: videoList.map((item, idx) => idx === index ? {...item, name: value} : item),
        },()=> {
            console.log(this.state.videoList);
        });
    };
    
    // 视频设置排序
    onChangeSort = (value, index) => {
        let {videoList} = this.state;
        this.setState({
            videoList: videoList.map((item, idx) => idx === index ? {...item, sort: Number(value)} : item).sort((a, b) => {return b.sort - a.sort;})
        },() => {
            console.log(this.state.videoList)
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
                childList: [],             
                viewPic: "",
                photoLoading: false,
                viewPic02: "",
                picList: [],
                photoLoading02: false,
                viewVideo: '',
                videoList: [],
                videoLoading: false,               
                loading: false,
            });
            form.resetFields();
        });
    };

    // 确认处理
    handleCreate = (type) => {
        const form = this.form;        
        form.validateFieldsAndScroll((err, values) => {// 获取表单数据并进行必填项校验
            if (err) {return;}
            let { viewPic, viewPic02, picList, videoList } = this.state; // 模板字符串es6
            // 头像校验与写入
            if (viewPic) {
                values.avatar = viewPic.slice(config.configUrl.photoUrl.length);
            } else {
                message.error("头像未选择");
                return false;
            }
            // 明星图片校验与写入
            if (viewPic02) {
                values.photo = viewPic02.slice(config.configUrl.photoUrl.length);
            } else {
                message.error("生活照未选择");
                return false;
            }            
            // 生活照校验与写入
            let tempPicList = [];
            if (picList.length) {
                picList.forEach((item, index) => {
                    tempPicList.push(item.slice(config.configUrl.photoUrl.length));
                });               
            } else {
                message.error("生活照未选择");
                return false;
            }
            // 省市区名称
            let currentAreaName = common.pCAName(this.props.provinceList, values.area[2]).currentAreaName;
            // 明星视频写入与校验
            const tempVideoList = [];
            console.log(videoList);
            if (videoList.length) {
                videoList.forEach((item, index) => {
                    tempVideoList.push({
                        name: item.name,
                        sort: item.sort,
                        duration: item.duration,
                        resource: item.resource.slice(config.configUrl.photoUrl.length)
                    })
                })
            }
            console.log(tempVideoList);
            const result = {
                name: values.name,
                gender: values.gender,
                height: values.height,
                weight: values.weight,              
                provinceId: values.area[0],
                provinceName: values.area[0] === "0" ? '全国' : currentAreaName[0],
                cityId: values.area[1] || values.area[0],               
                cityName: values.area[0] === "0" ? '全国' : currentAreaName[1],
                areaId: values.area[2] || values.area[1] || values.area[0],
                areaName: values.area[0] === "0" ? '全国' : currentAreaName[2],
                phone: values.phone,
                childId: values.childId,
                relationship: values.relationship,
                birthday: values.birthday.format('YYYY-MM-DD'),
                photo: values.avatar,
                description: values.personalProfile,
                picList: tempPicList,
                videoList: tempVideoList
            };
            this.setState({loading: true});
            config.saveStar(result).then((json) => {
                if (json.data.result === 0) {
                    message.success("添加明星成功");
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
                <Button onClick={() => {this.showModal(1)}}>复制</Button>
                <Button type="primary" onClick={() => {this.showModal(2)}} style={{marginLeft: 10}}>添加</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    _this={this}                 
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}                                        
                    data={this.state.data}
                    setChildren={this.setChildren}
                    childList={this.state.childList}
                    provinceList={this.props.provinceList}                   
                    // reqwestUploadToken={this.reqwestUploadToken}                                        
                    // picUpload={this.picUpload}
                    viewPic={this.state.viewPic}
                    photoLoading={this.state.photoLoading}
                    // picUpload03={this.picUpload03}
                    viewPic02={this.state.viewPic02}
                    picList={this.state.picList}
                    // setPicList={this.setPicList}
                    photoLoading02={this.state.photoLoading02}                 
                    // picUpload02={this.picUpload02}
                    viewVideo={this.state.viewVideo}                  
                    videoList={this.state.videoList}
                    videoLoading={this.state.videoLoading}
                    editVideo={this.editVideo}                   
                    // deleteVideo={this.deleteVideo}
                    onChangeCourseName={this.onChangeCourseName}
                    onChangeSort={this.onChangeSort}               
                    confirmLoading={this.state.loading}/>                
            </div>
        );
    }
}

// 明星信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {_this, visible, onCancel, onCreate, form, data, setChildren, childList, provinceList, viewPic, photoLoading, viewPic02,  photoLoading02, picList,  viewVideo, videoList, editVideo, onChangeCourseName, onChangeSort, videoLoading, confirmLoading} = props;
        const {getFieldDecorator, setFieldsValue} = form;

        // 城市选项生成
        const optionsOfArea = common.pCAName(provinceList, data.areaId).optionsOfArea;
        let currentArea = common.pCAName(provinceList, data.areaId).currentArea;
        
        // 孩子选项生成
        const optionsOfChild = [];
        if (childList.length) {
            childList.forEach((item) => {
                optionsOfChild.push(<Option key={item.id} value={item.id}>{item.name}</Option>)
            })
        }

        const setRelationship = (value) => {
            if (value === 0) {
                setFieldsValue({"relationship": 0});
            } else {
                const fnFilter = (para) => {
                    return para.id === value;
                };
                if (childList.length) {
                    let tempChildList = childList.filter(fnFilter);
                    setFieldsValue({
                        "relationship": tempChildList[0].relationship, 
                        "birthday": moment(tempChildList[0].birthday)
                    });
                }                
            }
        };

        // Avatar 头像
        const customRequest = (info) => {
            setTimeout(() => {// 渲染的问题，加个定时器延迟半秒
                common.picUpload(_this, 1, info.file, _this.state.uploadToken);
            }, 500);
        };
        
        // 已上传图片列表
        const photoExist = [];
        if (picList.length) {
            console.log(picList)
            picList.forEach((item, index) => {
                photoExist.push(
                    <div className="photoExist-item clearfix" key={index + 1}>
                        <img src={item} alt=""/>
                        <div className="remove">
                            <Button type="dashed" shape="circle" icon="minus" onClick={() => common.deleteFileList(_this, 2, index)}/>
                        </div>
                    </div>
                )
            });
        }
        
        //  生活照
        const customRequest02 = (info) => {
            setTimeout(() => {// 渲染的问题，加个定时器延迟半秒
                common.picUpload(_this, 2, info.file, _this.state.uploadToken);
            }, 500);
        };
       
        const customRequest05 = (info) => {
            setTimeout(() => {// 渲染的问题，加个定时器延迟半秒
                common.picUpload(_this, 5, info.file, _this.state.uploadToken);
            }, 500);
        };        

        // 已上传视频写入
        const tempVideoList = [];
        if (videoList.length) {
            console.log(videoList);
            videoList.forEach((item, index) => {
                tempVideoList.push(
                    <Col span={8} key={index+1}>
                        <div className="videoCol">
                            <div className="chapter">序号{item.sort || (videoList.length - index)}</div>
                            {/*<div className="videoSize">{item.videoSize} M</div>*/}
                            <video src={item.resource} id="video-edit" controls="controls" preload="auto" width="100%"></video>
                            <input className="videoCourseName" disabled={item.readOnly} onChange={(e) => onChangeCourseName(e.target.value, index)} value={item.name} placeholder="请输入作品名称"/>
                            <ul className="video-edit-ul-items">
                                <li className="item-video" onClick={() => editVideo(index)}>
                                    <Icon type="edit" />编辑
                                </li>
                                <li className="item-video">
                                    <input disabled={item.readOnly} type="text" value={item.sort ? item.sort : ''} onChange={(e) => onChangeSort(e.target.value, index)} placeholder="双击排序"/>
                                </li>                            
                                <li className="item-video" onClick={() => common.deleteFileList(_this, 3, index)}>
                                    <Icon type="delete" />删除
                                </li>
                            </ul>
                        </div>                        
                    </Col>)
            })
        }
        
        return (
            <Modal
                visible={visible}
                title="编辑"
                width={1000}
                onCancel={onCancel}
                footer={[
                    <Button key="back" onClick={onCancel} disabled={confirmLoading}>取消</Button>,
                    <Button key="submit" type="primary" loading={confirmLoading} onClick={() => onCreate(2)}>确定</Button>
                ]}
                maskClosable={false}
                destroyOnClose={true}>
                <div className="course-add course-form item-form quality-course-form star-manage-form">
                    <Form layout="vertical">
                        <h4 className="add-form-title-h4">基础信息</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="name"  label="姓名：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.name,                                      
                                        rules: [{
                                            required: true,
                                            message: '姓名不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入姓名"/>
                                    )}
                                </FormItem>
                                <div className="tip-help">
                                    <Tooltip title="请输入真实姓名">
                                        <Icon type="alert" /> 填写帮助
                                    </Tooltip>
                                </div>
                            </Col>
                            <Col span={8}>
                                <FormItem className="gender"  label="性别：">
                                    {getFieldDecorator('gender', {
                                        initialValue: data.gender,                                      
                                        rules: [{
                                            required: true,
                                            message: '性别不能为空',
                                        }],
                                    })(
                                        <Select placeholder="请选择性别">{common.genderOptions}</Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="height"  label="身高：">
                                    {getFieldDecorator('height', {
                                        initialValue: data.height,
                                        rules: [{
                                            required: true,
                                            message: '身高不能为空',
                                        }],
                                    })(
                                        <InputNumber style={{width: "90%"}} step={1} precision={2} placeholder="请填写身高"/>
                                    )} CM
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="weight"  label="体重：">
                                    {getFieldDecorator('weight', {
                                        initialValue: data.weight,                                      
                                        rules: [{
                                            required: true,
                                            message: '体重不能为空',
                                        }],
                                    })(
                                        <InputNumber style={{width: "90%"}} step={0.1} precision={3} placeholder="请填写体重"/>
                                    )} KG
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="area"  label="所在地区：">
                                    {getFieldDecorator('area', {
                                        initialValue: data.areaId === 0 ? ["0"] : currentArea,
                                        rules: [{
                                            required: true,
                                            message: '所在地区不能为空',
                                        }],
                                    })(
                                        <Cascader options={optionsOfArea} placeholder="请选择所在地区"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="phone"  label="联系方式：">
                                    {getFieldDecorator('phone', {
                                        initialValue: data.phone,                                      
                                        rules: [{
                                            required: true,
                                            validator: common.checkTel
                                        }],
                                    })(
                                        <Input onBlur={(e) => setChildren(e.target.value)} placeholder="请输入联系方式"/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="childId"  label="孩子：">
                                    {getFieldDecorator('childId', {
                                        initialValue: data.childId || (childList.length === 0 ? 0 : undefined),
                                        rules: [{
                                            required: true,
                                            message: "孩子不能为空"
                                        }],
                                    })(
                                        <Select allowClear onChange={(value) => setRelationship(value)} placeholder="请选择孩子">
                                            {optionsOfChild}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="relationship"  label="用户与孩子关系：">
                                    {getFieldDecorator('relationship', {
                                        initialValue: data.relationship,
                                        rules: [{
                                            required: true,
                                            message: "用户与孩子关系不能为空"
                                        }],
                                    })(
                                        <Select allowClear placeholder="请选择用户与孩子关系">{common.childrenOptions}</Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="birthday"  label="生日：">
                                    {getFieldDecorator('birthday', {
                                        initialValue: moment(data.birthday || new Date(), "YYYY-MM-DD"),
                                        rules: [{
                                            required: true,
                                            message: "生日不能为空"
                                        }],
                                    })(
                                        <DatePicker style={{width: "100%"}} placeholder="请选择生日"/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem className="avatar"  label="头像：">
                                    {getFieldDecorator('avatar', {
                                        initialValue: viewPic,
                                        rules: [{
                                            required: true,
                                            message: '头像不能为空',
                                        }],
                                    })(
                                        <Upload
                                            name="file"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            accept="image/*"
                                            showUploadList={false}
                                            beforeUpload={(file) => common.beforeUpload(file, _this)}
                                            customRequest={customRequest}>
                                            {viewPic ? <img src={viewPic} alt=""/> : common.uploadButton(1, photoLoading)}
                                        </Upload>                                        
                                    )}
                                </FormItem>
                            </Col>
                        </Row>                        
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">明星详情</h4>
                        <FormItem className="personalProfile" label="明星简介：">
                            {getFieldDecorator('personalProfile', {
                                initialValue: data.description,
                                rules: [{
                                    required: true,
                                    message: '简介不能为空',
                                }],
                            })(
                                <TextArea                                     
                                    style={{resize: "none"}}                                    
                                    placeholder="请填写明星简介"
                                    autosize={{minRows: 5, maxRows: 30}}/>                                
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">生活照</h4>
                        <FormItem className="photo"  label="">
                            {getFieldDecorator('photo', {
                                initialValue: viewPic02,
                                rules: [{
                                    required: false,
                                    message: '明星图片不能为空',
                                }],
                            })( 
                                <div className="itemBox">
                                    {photoExist}
                                    <Upload
                                        name="file"
                                        multiple                                        
                                        listType="picture-card"
                                        accept="image/*"
                                        showUploadList={false}
                                        beforeUpload={(file) => common.beforeUpload(file, _this)}
                                        customRequest={customRequest02}>
                                        {common.uploadButton(1, photoLoading02)}
                                        <p className="hint">{config.configUrl.uploadTipContent}</p>
                                    </Upload>
                                </div>                       
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">视频作品</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="'video"  label="">
                                    {getFieldDecorator('video', {
                                        initialValue: viewVideo,
                                        rules: [{
                                            required: false,
                                            message: '课时不能为空',
                                        }],
                                    })(
                                        <Upload
                                            name="file"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            showUploadList={false}
                                            accept="video/*"
                                            beforeUpload={(file) => common.beforeUpload(file, _this, 2)}
                                            customRequest={customRequest05}>
                                            {common.uploadButton(2, videoLoading)}
                                        </Upload>                                        
                                    )}
                                </FormItem> 
                            </Col>
                            {tempVideoList}                           
                        </Row>                        
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
            data: {},// 明星基本信息
            childList: [], // 明星图片相关变量
            uploadToken: "", // 获取上传图片token
            viewPic: "",
            photoLoading: false,
            viewPic02: "",
            picList: [],
            photoLoading02: false,            
            viewVideo: "",// 视频上传
            videoList: [],
            videoLoading: false,            
            loading: false // 提交按钮状态变量               
        };
    }

    // 获取明星基本信息
    getData = () => {
        config.starDetail({id: this.props.id}).then((json) => {
             if (json.data.result === 0) {
                this.setState({// 信息写入
                    data: json.data.data, 
                    viewPic: json.data.data.photo,
                    viewPic02: json.data.data.picList.length ? json.data.data.picList[0] : '',
                    picList: json.data.data.picList,
                    videoList: json.data.data.videoList
                }, () => {
                    this.setChildren(json.data.data.phone);
                });
            } else {
                common.exceptHandle(this, json.data);        
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    showModal = () => {
        this.getData();       
        this.setState({visible: true});
    };

    // 孩子列表
    setChildren = (value) => {
        config.childrenList({phone: value}).then((json) => {
            if(json.data.result === 0) {
                this.setState({
                    childList: json.data.data           
                })
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    // 视频编辑
    editVideo = (index) => {          
        let {videoList} = this.state;
        this.setState({                
            videoList: videoList.map((item, idx) => idx === index ? {...item, readOnly: false} : item).sort((a, b) => {return  a.sort - b.sort;})  
        });
    };

    // 视频明星名称
    onChangeCourseName = (value, index) => {
        let {videoList} = this.state;
        this.setState({
            videoList: videoList.map((item, idx) => idx === index ? {...item, name: value} : item),
        });
    };
    
    // 视频设置排序
    onChangeSort = (value, index) => {
        let {videoList} = this.state;
        this.setState({
            videoList: videoList.map((item, idx) => idx === index ? {...item, sort: Number(value)} : item).sort((a, b) => {return b.sort - a.sort;})
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
                childList: [],
                uploadToken: "",              
                viewPic: "",                
                photoLoading: false,
                viewPic02: "",
                picList: [],                
                photoLoading02: false,
                viewVideo: '',
                videoList: [],
                videoLoading: false,                         
                loading: false,
            });
            form.resetFields();
        });
    };

    // 确认处理
    handleCreate = () => {
        const form = this.form;        
        form.validateFieldsAndScroll((err, values) => {// 获取表单数据并进行必填项校验
            if (err) {return;}            
            let { viewPic, viewPic02, picList, videoList } = this.state; // 模板字符串es6
            // 头像校验与写入
            if (viewPic) {
                values.avatar = viewPic.slice(config.configUrl.photoUrl.length);
            } else {
                message.error("头像未选择");
                return false;
            }
            // 明星图片校验与写入
            if (viewPic02) {
                values.photo = viewPic02.slice(config.configUrl.photoUrl.length);
            } else {
                message.error("生活照未选择");
                return false;
            }            
            // 生活照校验与写入
            let tempPicList = [];
            if (picList.length) {
                picList.forEach((item, index) => {
                    tempPicList.push(item.slice(config.configUrl.photoUrl.length));
                });               
            } else {
                message.error("生活照未选择");
                return false;
            }
            // 省市区名称
            let currentAreaName = common.pCAName(this.props.provinceList, values.area[2]).currentAreaName;
            // 明星视频写入与校验
            const tempVideoList = [];
            console.log(videoList);
            if (videoList.length) {
                videoList.forEach((item, index) => {
                    tempVideoList.push({
                        name: item.name,
                        sort: item.sort,
                        duration: item.duration,
                        resource: item.resource.slice(config.configUrl.photoUrl.length)
                    })
                })
            }
            console.log(tempVideoList);
            const result = {
                id: this.props.id,
                name: values.name,
                gender: values.gender,
                height: values.height,
                weight: values.weight,
                provinceId: values.area[0],
                provinceName: values.area[0] === "0" ? '全国' : currentAreaName[0],
                cityId: values.area[1] || values.area[0],               
                cityName: values.area[0] === "0" ? '全国' : currentAreaName[1],
                areaId: values.area[2] || values.area[1] || values.area[0],
                areaName: values.area[0] === "0" ? '全国' : currentAreaName[2],
                phone: values.phone,
                childId: values.childId,
                relationship: values.relationship,
                birthday: values.birthday.format('YYYY-MM-DD'),
                photo: values.avatar,
                description: values.personalProfile,
                picList: tempPicList,
                videoList: tempVideoList
            };
            this.setState({loading: true});
            config.updateStar(result).then((json) => {
                if (json.data.result === 0) {
                    message.success("编辑明星成功");
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
                    data={this.state.data}
                    setChildren={this.setChildren}
                    childList={this.state.childList}
                    provinceList={this.props.provinceList}                    
                    viewPic={this.state.viewPic}
                    photoLoading={this.state.photoLoading}
                    viewPic02={this.state.viewPic02}
                    picList={this.state.picList}
                    photoLoading02={this.state.photoLoading02}
                    viewVideo={this.state.viewVideo}                  
                    videoList={this.state.videoList}                  
                    videoLoading={this.state.videoLoading}
                    editVideo={this.editVideo}
                    onChangeCourseName={this.onChangeCourseName}
                    onChangeSort={this.onChangeSort}                                       
                    confirmLoading={this.state.loading} />                
            </a>
        );
    }
}

// 明星详情表单
const ItemDetailsForm = Form.create()(
    (props) => {
        const {visible, onCancel, form, data, childList, picList, videoList, confirmLoading} = props;
        const {getFieldDecorator, setFieldsValue} = form;

        const optionsOfChild = [];
        if (childList.length) {
            childList.forEach((item) => {
                optionsOfChild.push(<Option key={item.id} value={item.id}>{item.name}</Option>)
            })
        }

        const setRelationship = (value) => {
            if (value === 0) {
                setFieldsValue({"relationship": 0});
            } else {
                const fnFilter = (para) => {
                    return para.id === value;
                };
                if (childList.length) {
                    let tempChildList = childList.filter(fnFilter);
                    setFieldsValue({
                        "relationship": tempChildList[0].relationship, 
                        "birthday": moment(tempChildList[0].birthday)
                    });
                }                
            }
        }; 

        const tempPicList = [];
        if (picList.length) {
            picList.forEach((item, index) => {
                tempPicList.push(
                    <Col span={6} key={index+1}>
                        <img src={item} style={{width: "100%"}} alt=""/>
                    </Col>
                )
            })
        }

        const tempVideoList = [];
        if (videoList.length) {
            videoList.forEach((item, index) => {
                tempVideoList.push(
                    <Col span={8} key={index+1}>
                        <div className="video">
                            <div className="chapter">序号{item.sort || (videoList.length - index)}</div>
                            <div className="videoSource">
                                <div className="videoSrc">
                                    <video src={item.resource} controls="controls" width="100%"></video>
                                </div>
                            </div>
                            <h3 className="videoCourseName">{item.name}</h3>
                        </div>
                    </Col>)
            })
        }

        return (
            <Modal
                visible={visible}
                title="详情"
                width={1000}
                onCancel={onCancel}
                footer={null}
                maskClosable={false}
                destroyOnClose={true}
                confirmLoading={confirmLoading}>
                <div className="institutionCheck-form">
                    <Form layout="vertical">
                        <h4 className="add-form-title-h4">基础信息</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="courseName"  label="姓名：">
                                    {getFieldDecorator('courseName', {
                                        initialValue: data.name,                                      
                                        rules: [{
                                            required: true,
                                            message: '姓名不能为空',
                                        }],
                                    })(
                                        <Input disabled placeholder="请输入姓名"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="gender"  label="性别：">
                                    {getFieldDecorator('gender', {
                                        initialValue: data.gender,                                      
                                        rules: [{
                                            required: true,
                                            message: '性别不能为空',
                                        }],
                                    })(
                                        <Select disabled placeholder="请选择性别">{common.genderOptions}</Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="height"  label="身高：">
                                    {getFieldDecorator('height', {
                                        initialValue: data.height,
                                        rules: [{
                                            required: true,
                                            message: '身高不能为空',
                                        }],
                                    })(
                                        <InputNumber disabled style={{width: "90%"}} placeholder="请填写身高"/>
                                    )} CM
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="weight"  label="体重：">
                                    {getFieldDecorator('weight', {
                                        initialValue: data.weight,                                      
                                        rules: [{
                                            required: true,
                                            message: '体重不能为空',
                                        }],
                                    })(
                                        <InputNumber disabled style={{width: "90%"}} placeholder="请填写体重"/>
                                    )} KG
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="area"  label="所在地区：">
                                    {getFieldDecorator('area', {
                                        initialValue: data.provinceName+ '/' + data.cityName + '/' + data.areaName,
                                        rules: [{
                                            required: true,
                                            message: '所在地区不能为空',
                                        }],
                                    })(
                                        <Input disabled placeholder="请选择所在地区"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="telephone"  label="联系方式：">
                                    {getFieldDecorator('telephone', {
                                        initialValue: data.phone,                                      
                                        rules: [{
                                            required: true,
                                            message: '联系方式不能为空',
                                        }],
                                    })(
                                        <Input disabled placeholder="请输入联系方式"/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="childId"  label="孩子：">
                                    {getFieldDecorator('childId', {
                                        initialValue: data.childId || (childList.length === 0 ? 0 : undefined),
                                        rules: [{
                                            required: true,
                                            message: "孩子不能为空"
                                        }],
                                    })(
                                        <Select  disabled allowClear onChange={(value) => setRelationship(value)} placeholder="请选择孩子">{optionsOfChild}</Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="relationship"  label="用户与孩子关系：">
                                    {getFieldDecorator('relationship', {
                                        initialValue: data.relationship,
                                        rules: [{
                                            required: true,
                                            message: "用户与孩子关系不能为空"
                                        }],
                                    })(
                                        <Select  disabled allowClear placeholder="请选择用户与孩子关系">{common.childrenOptions}</Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="birthday"  label="生日：">
                                    {getFieldDecorator('birthday', {
                                        initialValue: moment(data.birthday || new Date(), "YYYY-MM-DD"),
                                        rules: [{
                                            required: true,
                                            message: "生日不能为空"
                                        }],
                                    })(
                                        <DatePicker disabled style={{width: "100%"}} placeholder="请选择生日"/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={6}>
                                <FormItem className="avatar"  label="头像：">
                                    {getFieldDecorator('avatar', {
                                        initialValue: data.photo,
                                        rules: [{
                                            required: true,
                                            message: '头像不能为空',
                                        }],
                                    })(
                                        <img src={data.photo} style={{width: "80%"}} alt=""/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>                        
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">明星详情</h4>
                        <FormItem className="personalProfile" label="明星简介：">
                            {getFieldDecorator('personalProfile', {
                                initialValue: data.description,
                                rules: [{
                                    required: true,
                                    message: '简介不能为空',
                                }],
                            })(
                                <TextArea                                     
                                    style={{resize: "none"}}
                                    disabled                                    
                                    placeholder="请填写明星简介"
                                    autosize={{minRows: 5, maxRows: 30}}/>                                
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">生活照</h4>
                        <Row gutter={24}>{tempPicList}</Row>
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">视频作品</h4>
                        <Row gutter={24}>{tempVideoList}</Row>                       
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
        childList: [],
        picList: [],      
        // 明星课时列表
        videoList: [],        
        data: "", // 明星基本信息
    };

    // 获取明星基本信息
    getData = () => {
        config.starDetail({id: this.props.id}).then((json) => {
             if (json.data.result === 0) {                
                this.setState({
                    loading: false,
                    data: json.data.data,
                    picList: json.data.data.picList,
                    videoList: json.data.data.videoList,
                }, () => {
                    this.setChildren(json.data.data.phone);
                });
            } else {
                common.exceptHandle(this, json.data);                          
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    showModal = () => {
        this.getData();
        this.setState({visible: true});
    };

    setChildren = (value) => {
        config.childrenList({phone: value}).then((json) => {
            if(json.data.result === 0) {
                this.setState({
                    childList: json.data.data           
                })
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    handleCancel = () => {
        this.setState({
            visible: false,
            loading: true,
            data: "",
            childList: [],
            picList: [],
            videoList: []
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (           
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>详情</span>
                <ItemDetailsForm 
                    ref={this.saveFormRef}
                    visible={this.state.visible}                                       
                    data={this.state.data}
                    childList={this.state.childList}
                    picList={this.state.picList}                    
                    videoList={this.state.videoList}
                    onCancel={this.handleCancel}/>
            </a>
        );
    }
}

// 明星列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            typeList: [],
            type: null,
            data: [],
            pagination: common.pagination
        };
        this.columns = [// 列配置
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
                title: '姓名',
                dataIndex: 'name',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '昵称',
                dataIndex: 'nickname',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'nickname'),
            },
            {
                title: '性别',
                dataIndex: 'gender',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'gender'),
            },
            {
                title: '创建人',
                dataIndex: 'createUser',
                width: '8%',                
                render: (text, record) => this.renderColumns(text, record, 'createUser'),
            },            
            {
                title: '创建日期',
                dataIndex: 'createTime',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '状态',
                dataIndex: 'status',
                width: '5%',
                render: (text, record) => this.renderColumns(text, record, 'status'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*明星详情*/}
                            <ItemDetails 
                                id={record.id}
                                opStatus={this.props.opObj.select}                                
                                uploadToken={this.props.uploadToken}                                
                                toLoginPage={this.props.toLoginPage}/>
                             {/*明星编辑*/}
                            <ItemEdit 
                                id={record.id} 
                                recapture={this.getData}
                                opStatus={this.props.opObj.modify}
                                uploadToken={this.props.uploadToken}
                                provinceList={this.props.provinceList}                                
                                toLoginPage={this.props.toLoginPage}/>                           
                            {/*明星下架*/}
                            <Popconfirm 
                                title={record.status === "上架" ? "确认下架?" : "确认上架?"}
                                placement="topRight"
                                onConfirm={() => this.itemBan(record.id, record.status)}
                                onCancel=""
                                okType="danger"
                                okText="确认"
                                cancelText="取消">
                                <a style={{display: this.props.opObj.sell ? "inline" : "none"}}>{record.status === "上架" ? "下架" : "上架"}</a>
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

    dataHandle = (data) => {
        const result = [];
        data.forEach((item, index) => {
            result.push({
                key: index.toString(),
                id: item.id,
                index: index + 1,
                sort: item.sort !== 0 ? item.sort : '',
                name: item.name,
                nickname: item.nickname,
                genderCode: item.gender,
                gender: common.genderStatus(item.gender),
                createUser: item.creatorName,
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
        config.starList({
            name: keyword ? keyword.name : this.props.keyword.name,
            gender: keyword ? keyword.gender : this.props.keyword.gender,
            startTime: keyword ? keyword.startTime : this.props.keyword.startTime,
            endTime: keyword ? keyword.endTime : this.props.keyword.endTime,                
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize
        }).then((json) => {
            if (json.data.result === 0) {
                common.handleTableNoDataResponse(this, json.data.data);
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

    // 设置排序
    handleSort = (row) => {
        this.setState({loading: true});
        config.sortStar({
            id: row.id,                
            sort: Number(row.sort)// 排序
        }).then((json) => {
            if (json.data.result === 0) {
                this.setState({loading: false});
                this.getData();
            } else {
                common.exceptHandle(this, json.data);                
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    // 明星上架,下架
    itemBan = (id, status) => {
        this.setState({loading: true});
        config.putAwayStar({
            id: id,
            status: status === "上架" ? 3 : 2 // 2:上架，3:下架
        }).then((json) => {
            if (json.data.result === 0) {
                message.success(status === "上架" ? "明星下架成功" : "明星上架成功");
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
                    scroll={{ x: 1500 }}
                    components={components}
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    columns={columns}
                    onChange={(pagination) => common.handleTableChange(this, pagination)}/>;
    }
}

// 明星
class StarManage extends Component {
    constructor(props) {
        super(props);
        this.state = {            
            opObj: {},// 明星权限            
            keyword: {// 获取明星列表所需关键词
                name: '',
                gender: '',
                startTime: "",
                endTime: ""                
            },
            startValue: null,
            endValue: null,
            flag_add: false,
            mapObj: {},// 地图控件对象
            provinceList: [],// 省市列表
        };                     
    };

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
        this.setState({opObj: common.getPower(this).data});        
    };

    // 搜索及明星姓名，昵称设置
    search = (value) => {
        this.setState({
            keyword: {
                name: value,
                gender:this.state.keyword.gender,               
                startTime: this.state.keyword.startTime,
                endTime: this.state.keyword.endTime,
            }
        });
    };

    // 性别设置
    setGender = (value) => {
        this.setState({
            keyword: {
                name: this.state.keyword.name,
                gender: value,                              
                startTime: this.state.keyword.startTime,
                endTime: this.state.keyword.endTime,
            }
        })
    };
    
    // 设置开始时间
    setStartTime = (date, dateString) => {
        this.setState({
            startValue: date,
            keyword: {
                name: this.state.keyword.name,
                gender: this.state.keyword.gender, 
                startTime: dateString,
                endTime: this.state.keyword.endTime,
            }
        })
    };
    
    // 设置结束时间
    setEndTime = (date, dateString) => {
        this.setState({
            endValue: date,
            keyword: {
                name: this.state.keyword.name,
                gender: this.state.keyword.gender,                              
                startTime: this.state.keyword.startTime,
                endTime: dateString,
            }
        })
    };
    
    // 刷新table页面
    setFlag = () => {
        this.setState({flag_add: !this.state.flag_add});
    };

    componentWillMount() {
        common.getMapDate(this, 'star-mapContainer', 3);// 获取省份城市
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
            <div className="courses star">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                {/*明星名筛选*/}
                                <Search 
                                    className="star-search"
                                    placeholder="请输入明星姓名、昵称"
                                    onSearch={(value) => this.search(value)}
                                    enterButton
                                    allowClear/>
                                {/*性别筛选*/}
                                <Select                                    
                                    className="star-select"
                                    onChange={this.setGender}
                                    placeholder="请选择性别"
                                    allowClear>
                                    {common.genderOptions}
                                </Select>
                                {/*明星创建日期筛选*/}
                                <span>日期筛选： </span>
                                <DatePicker
                                    locale={locale} 
                                    placeholder="请选择开始日期"
                                    style={{width: "150px"}}
                                    disabledDate={(startValue) => common.disabledStartDate(this, startValue)}
                                    onChange={this.setStartTime}/>
                                <span style={{margin: "0 10px"}}>至</span>
                                <DatePicker 
                                    placeholder="请选择结束日期"
                                    style={{width: "150px"}}
                                    disabledDate={(endValue) => common.disabledEndDate(this, endValue)}
                                    onChange={this.setEndTime}/>
                                {/*明星添加按钮*/}
                                <div className="star-add-button">
                                    <ItemAdd
                                        opStatus={this.state.opObj.add}
                                        provinceList={this.state.provinceList}
                                        recapture={this.setFlag}
                                        toLoginPage={() => common.toLoginPage(this)}/>
                                </div>
                            </header>
                            {/*明星列表*/}
                            <div className="table-box">                                
                                <DataTable                                    
                                    opObj={this.state.opObj}
                                    keyword={this.state.keyword}                                    
                                    provinceList={this.state.provinceList}
                                    flag_add={this.state.flag_add}
                                    toLoginPage={() => common.toLoginPage(this)}/>
                            </div>
                            <div id="star-mapContainer"/>
                        </div>
                        :
                        <p>暂无查询权限</p>                        
                }
            </div>
        )
    }
}

export default StarManage;