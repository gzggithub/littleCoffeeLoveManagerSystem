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
    Radio,
    InputNumber,
    DatePicker,    
    Cascader,
    Popconfirm
} from 'antd';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';
import { checkTel, pCAName } from '../../config/common';
import { configUrl, getToken, starList, saveStar, getStarDetail, updateStar, NewestStar, sortStar, putAwayStar, starTypeList, getStarList } from '../../config';

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
            {editable ? (
            <EditableContext.Consumer>
                {(form) => {
                    this.form = form;
                    return (
                        editing ? (
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
                                    placeholder="双击设置排序"
                                />
                            )}
                        </FormItem>
                        ) : (
                        <div
                            className="editable-cell-value-wrap"
                            onClick={this.toggleEdit}
                        >
                            <Input style={{ textAlign: "center" }}
                                    ref={node => (this.input = node)}
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
// 新增、复制明星表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, provinceList, reqwestUploadToken, viewPic, picUpload, photoLoading, viewPic03, picUpload03, photoLoading03 ,picUpload02, picList, setPicList, viewVideo, videoList, editVideo, deleteVideo, onChangeCourseName, onChangeSort, videoLoading, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 城市选项生成
        // const optionsOfCity = [{value: "0", label: "全国"}];
        const optionsOfCity = pCAName(provinceList, data.areaId).optionsOfCity;
        let currentArea = pCAName(provinceList, data.areaId).currentArea;
        // if (provinceList.length) {
        //     provinceList.forEach((item) => {
        //         let children = [];
        //         if (item.districtList) {
        //             item.districtList.forEach((subItem) => {
        //                 let subChildren = [];
        //                 if (subItem.districtList) {
        //                     subItem.districtList.forEach((thirdItem) => {
        //                         subChildren.push({value: thirdItem.adcode, label: thirdItem.name});
        //                         if (Number(thirdItem.adcode) === data.areaId) {                          
        //                             currentArea = [item.adcode, subItem.adcode, thirdItem.adcode];// 当前城市设为选中项
        //                         }
        //                     });
        //                 }
        //                 children.push({value: subItem.adcode, label: subItem.name, children: subChildren});
        //             });
        //         }
        //         optionsOfCity.push({value: item.adcode, label: item.name, children: children});
        //     });
        // }

        // 图片处理
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

        // Avatar 头像
        const picHandleChange = (info) => {
            setTimeout(() => {// 渲染的问题，加个定时器延迟半秒
                picUpload(info.file);
            }, 500);
        };
        const uploadButton = (
            <div>
                <Icon type={photoLoading ? 'loading' : 'plus'}/>
                <div className="ant-upload-text" style={{display: photoLoading ? "none" : "block"}}>选择头像</div>
            </div>
        );

        
        // 已上传图片列表
        const photoExist = [];
        if (picList.length) {
            console.log(picList)
            picList.forEach((item, index) => {
                photoExist.push(
                    <div className="photoExist-item clearfix" key={index + 1}>
                        <img src={item} alt=""/>
                        <div className="remove">
                            <Button type="dashed" shape="circle" icon="minus" onClick={() => setPicList(index)}/>
                        </div>
                    </div>
                )
            });
        }
        
        //  生活照
        const picHandleChange03 = (info) => {
            setTimeout(() => {// 渲染的问题，加个定时器延迟半秒
                picUpload03(info.file);
            }, 500);
        };
        const uploadButton03 = (
            <div>
                <Icon type={photoLoading03 ? 'loading' : 'plus'}/>
                <div className="ant-upload-text" style={{display: photoLoading03 ? "none" : "block"}}>选择图片</div>
            </div>
        );
        

        // 视频上传 处理
        const beforeUpload02 = (file) => {           
            reqwestUploadToken(file);            
        };
        const picHandleChange02 = (info) => {
            setTimeout(() => {// 渲染的问题，加个定时器延迟半秒
                picUpload02(info.file);
            }, 500);
        };
        const uploadButton02 = (
            <div>
                <Icon style={{fontSize: "50px"}} type={videoLoading ? 'loading' : 'video-camera'}/>
                <div className="ant-upload-text" style={{display: videoLoading ? "none" : "block"}}>添加视频</div>
            </div>
        );

        // 已上传视频写入
        const tempVideoList = [];
        if (videoList.length) {
            console.log(videoList);
            videoList.forEach((item, index) => {
                tempVideoList.push(
                    <Col span={8} key={index+1}>
                        <div className="videoCol">
                            <div className="chapter">序号{item.sort || (videoList.length - index)}</div>
                            <div className="videoSize">{item.videoSize} M</div>
                            <video src={item.video} id="video" controls="controls" preload="auto" width="100%"></video>
                            <input className="videoCourseName" disabled={item.readOnly} onChange={(e) => onChangeCourseName(e.target.value, index)} defaultValue={item.name} placeholder="请输入明星名称"/>                       
                            <ul className="video-edit-ul-items">
                                <li className="item-video" onClick={() => editVideo(index)}>
                                    <Icon type="edit" />编辑
                                </li>
                                <li className="item-video">
                                    <input disabled={item.readOnly} type="text" onChange={(e) => onChangeSort(e.target.value, index)} placeholder="双击排序"/>
                                </li>                            
                                <li className="item-video" onClick={() => deleteVideo(index)}>
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
                title="添加"
                width={1000}
                onCancel={onCancel}
                footer={[
                    <Button key="back" onClick={onCancel} disabled={confirmLoading}>取消</Button>,
                    <Button key="submit" type="primary" loading={confirmLoading} onClick={() => onCreate(2)}>确定</Button>
                ]}
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
                                        <Select placeholder="请选择性别">
                                            <Option value={0}>女</Option>
                                            <Option value={1}>男</Option>
                                        </Select>
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
                                        <Cascader options={optionsOfCity} placeholder="请选择所在地区"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="phone"  label="联系方式：">
                                    {getFieldDecorator('phone', {
                                        initialValue: data.phone,                                      
                                        rules: [{
                                            required: true,
                                            validator: checkTel
                                        }],
                                    })(
                                        <Input placeholder="请输入联系方式"/>
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
                                            beforeUpload={beforeUpload}
                                            customRequest={picHandleChange}>
                                            {viewPic ? <img src={viewPic} alt=""/> : uploadButton}
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
                                initialValue: viewPic03,
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
                                        beforeUpload={beforeUpload}
                                        customRequest={picHandleChange03}>
                                        {uploadButton03}
                                        {/*{viewPic03 ? <img src={viewPic03} alt=""/> : uploadButton03}*/}
                                        {/*<p className="hint">（可上传1-5张图片）</p>*/}
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
                                            beforeUpload={beforeUpload02}
                                            customRequest={picHandleChange02}>
                                            {uploadButton02}
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
            // 明星基本信息
            data: {},
            // 明星图片相关变量            
            uploadToken: "",// 获取上传图片token
            viewPic: "",
            photoLoading: false,
            viewPic03: "",
            picList: [],
            photoLoading03: false,
            // 视频上传
            viewVideo: "",
            videoList: [],
            videoLoading: false,
            // 提交按钮状态变量
            loading: false,       
        };
    }

    // 获取明星基本信息
    getData = () => {
        NewestStar({id: this.props.id}).then((json) => {
             if (json.data.result === 0) {
                // 信息写入
                this.setState({
                    data: json.data.data,
                    viewPic: json.data.data.pic,
                    picList: json.data.data.picList,
                    videoList: json.data.data.lesson
                });
            } else {
                this.exceptHandle(json.data);                
            }
        }).catch((err) => {
            message.error("获取失败");
            this.setState({loading: false});
        });
    };

    showModal = (props, event) => {
        if (props === 1) {// 复制明星            
            this.getData();
        } else if (props === 2) {                       
            this.setState({data: {}});
        }        
        this.setState({visible: true}); 
    };

    // 倒计时
    countDown = () => {
        let secondsToGo = 3;
        const modal = Modal.success({
            title: `温馨提示`,
            content: `你还没添加明星，请先添加明星，正在返回，请稍后 ${secondsToGo} s.`,
        });
        const timer = setInterval(() => {
            secondsToGo -= 1;
            modal.update({
               content: `你还没添加明星，请先添加明星，正在返回，请稍后 ${secondsToGo} s.`,
            });
        }, 1000);
        setTimeout(() => {
            clearInterval(timer);
            sessionStorage.removeItem("courseData");
            modal.destroy();
        }, secondsToGo * 1000);
    };

    // 图片处理    
    reqwestUploadToken = () => { // 请求上传凭证，需要后端提供接口
        getToken().then((json) => {
            if (json.data.result === 0) {
                    this.setState({
                        uploadToken: json.data.data,
                    })
                } else {
                    this.props.exceptHandle(json.data);
                }
        }).catch((err) => {
            message.error("发送失败");
        });
    };

    // 头像上传
    picUpload = (para) => {
        const _this = this;
        this.setState({photoLoading: true});
        const file = para;
        const key = UUID.create().toString().replace(/-/g, "");
        const token = this.state.uploadToken;
        const config = {region: qiniu.region.z0};
        const observer = {
            next (res) {console.log(res)},
            error (err) {
                console.log(err)
                message.error(err.message ? err.message : "图片提交失败");
                _this.setState({photoLoading: false})
            }, 
            complete (res) {
                console.log(res);
                message.success("图片提交成功");
                _this.setState({
                    viewPic: global.config.photoUrl + res.key || "",           
                    photoLoading: false,
                })
            }
        }
        const observable = qiniu.upload(file, key, token, config);
        observable.subscribe(observer); // 上传开始        
    };

    // 图片上传
    picUpload03 = (para) => {
        const _this = this;
        this.setState({photoLoading03: true});
        const file = para;
        const key = UUID.create().toString().replace(/-/g, "");
        const token = this.state.uploadToken;
        const config = {region: qiniu.region.z0};
        const observer = {
            next (res) {console.log(res)},
            error (err) {
                console.log(err)
                message.error(err.message ? err.message : "图片提交失败");
                _this.setState({photoLoading03: false})
            }, 
            complete (res) {
                console.log(res);
                message.success("图片提交成功");
                let {picList} = _this.state; // 此行不加只能添加一张
                picList.push(configUrl.photoUrl + res.key);
                _this.setState({
                    picList: picList,
                    viewPic03: configUrl.photoUrl + res.key || "",           
                    photoLoading03: false,
                })
            }
        }
        const observable = qiniu.upload(file, key, token, config);
        observable.subscribe(observer); // 上传开始        
    };

    setPicList = (index) => {
        let data = this.state.picList;
        data.splice(index, 1);
        this.setState({
            picList: data
        });
    };
   
    // 视频上传
    picUpload02 = (para) => {
        const _this = this;
        const videoSize = (para.size/1024/1024).toFixed(2);
        if (this.state.videoList.length >= 25) {
            message.error("视频最多上传25个");
            return
        } else {
            this.setState({videoLoading: true});
            const file = para;
            const key = UUID.create().toString().replace(/-/g,"");
            const token = this.state.uploadToken;
            const config = {
                region: qiniu.region.z0
            };
            const observer = {
                next (res) {
                    console.log(res);
                },
                error (err) {
                    console.log(err)
                    message.error(err.message ? err.message : "视频提交失败");
                    _this.setState({
                        videoLoading: false,
                    })
                }, 
                complete (res) {
                    console.log(res);
                    message.success("视频提交成功");
                    let videoList = _this.state.videoList;
                    videoList.unshift({ 
                        sort: 0,                      
                        video: global.config.photoUrl + res.key,
                        videoSize: videoSize,
                        readOnly: true,
                    });
                    _this.setState({
                        videoList: videoList,                       
                        viewVideo: "",
                        videoLoading: false,
                    }, () => {
                        
                    });
                }
            }
            const observable = qiniu.upload(file, key, token, config);
            observable.subscribe(observer); // 上传开始
        }
    };

    // 视频编辑
    editVideo = (index) => {
        // 视频没有播放完duration是undefined
        setTimeout(()=> {
            // let ele = document.getElementById('video' + index);
            // console.log(document.getElementById('video'))
            // let duration = document.getElementById('video').duration;
            console.log(duration);
            let duration = 5;
            let {videoList} = this.state;
            this.setState({
                videoList: videoList.map((item, idx) => idx === index ? {...item, duration: duration, readOnly: false,} : item).sort((a, b) => {return  a.sort - b.sort;})  
            },() => {
                console.log(this.state.videoList)
            });
        }, 1500);
    };    
    
    // 视频删除
    deleteVideo = (index) => {
        let data = this.state.videoList;
        data.splice(index, 1);
        this.setState({
            videoList: data
        });
    };

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
            videoList: videoList.map((item, idx) => idx === index ? {...item, sort: Number(value)} : item).sort((a, b) => {return  a.sort - b.sort;})
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
                viewPic: "",
                photoLoading: false,
                viewPic03: "",
                picList: [],
                photoLoading03: false,
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
            let { viewPic, viewPic03, picList, videoList } = this.state; // 模板字符串es6
            // 头像校验与写入
            if (viewPic) {
                values.avatar = viewPic.slice(configUrl.photoUrl.length);
            } else {
                message.error("头像未选择");
                return false;
            }
            // 明星图片校验与写入
            if (viewPic03) {
                values.photo = viewPic03.slice(configUrl.photoUrl.length);
            } else {
                message.error("生活照未选择");
                return false;
            }            
            // 生活照校验与写入
            let tempPicList = [];
            if (picList.length) {
                picList.forEach((item, index) => {
                    tempPicList.push(item.slice(configUrl.photoUrl.length));
                });               
            } else {
                message.error("生活照未选择");
                return false;
            }           
            // 省市区名称
            let currentAreaName = pCAName(this.props.provinceList, values.area[2]).currentAreaName;
            // 明星视频写入与校验
            const tempVideoList = [];
            console.log(videoList);
            if (videoList.length) {
                videoList.forEach((item, index) => {
                    tempVideoList.push({
                        name: item.name,
                        sort: item.sort,
                        duration: item.duration,
                        // video: item.video.slice(configUrl.photoUrl.length)
                        resource: item.video.slice(configUrl.photoUrl.length)
                    })
                })
            }
            console.log(tempVideoList);
            const result = {
                name: values.name,
                gender: values.gender,
                height: values.height,
                weight: values.height,
                provinceId: values.area[0],
                provinceName: currentAreaName[0],
                cityId: values.area[1],
                cityName: currentAreaName[1],
                areaId: values.area[2],
                areaName: currentAreaName[2],
                phone: values.phone,
                photo: values.avatar,
                description: values.personalProfile,
                piclist: tempPicList,
                videoList: tempVideoList
            };
            this.setState({loading: true});
            saveStar(result).then((json) => {
                if (json.data.result === 0) {
                    message.success("添加明星成功");
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
        console.log(this.props.provinceList);
        return (
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button onClick={() => {this.showModal(1)}}>复制</Button>
                <Button type="primary" onClick={() => {this.showModal(2)}} style={{marginLeft: 10}}>添加</Button>
                <ItemAddForm
                    ref={this.saveFormRef}                 
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}                                        
                    data={this.state.data}
                    provinceList={this.props.provinceList}                   
                    reqwestUploadToken={this.reqwestUploadToken}                                        
                    picUpload={this.picUpload}
                    viewPic={this.state.viewPic}
                    photoLoading={this.state.photoLoading}
                    picUpload03={this.picUpload03}
                    viewPic03={this.state.viewPic03}
                    picList={this.state.picList}
                    setPicList={this.setPicList}
                    photoLoading03={this.state.photoLoading03}                 
                    picUpload02={this.picUpload02}
                    viewVideo={this.state.viewVideo}                  
                    videoList={this.state.videoList}
                    setVideoList={this.setVideoList}
                    videoLoading={this.state.videoLoading}
                    editVideo={this.editVideo}                   
                    deleteVideo={this.deleteVideo}
                    onChangeCourseName={this.onChangeCourseName}
                    onChangeSort={this.onChangeSort}               
                    confirmLoading={this.state.loading}
                />                
            </div>
        );
    }
}

// 明星信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, editVideo, deleteVideo, onChangeCourseName, onChangeSort, form, data, provinceList, reqwestUploadToken, viewPic, picUpload, photoLoading, viewPic03, picUpload03, photoLoading03, picUpload02, viewVideo, videoList, videoLoading, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 城市选项生成
        const optionsOfCity = [{value: "0", label: "全国"}];
        let currentArea = [];
        if (provinceList.length) {
            provinceList.forEach((item) => {
                let children = [];
                if (item.districtList) {
                    item.districtList.forEach((subItem) => {
                        let subChildren = [];
                        if (subItem.districtList) {
                            subItem.districtList.forEach((thirdItem) => {
                                subChildren.push({value: thirdItem.adcode, label: thirdItem.name});
                                if (Number(thirdItem.adcode) === data.areaId) {                          
                                    currentArea = [item.adcode, subItem.adcode, thirdItem.adcode];// 当前城市设为选中项
                                }
                            });
                        }
                        children.push({value: subItem.adcode, label: subItem.name, children: subChildren});
                    });
                }
                optionsOfCity.push({value: item.adcode, label: item.name, children: children});
            });
        }

        // 图片处理
        const beforeUpload = (file) => {
            console.log("file--1212121")
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
            // 渲染的问题，加个定时器延迟半秒
            setTimeout(()=>{
                picUpload(info.file);
            }, 500);
        };

        const uploadButton = (
            <div>
                <Icon type={photoLoading ? 'loading' : 'plus'}/>
                <div className="ant-upload-text" style={{display: photoLoading ? "none" : "block"}}>选择头像</div>
            </div>
        );

        const picHandleChange03 = (info) => {
            // 渲染的问题，加个定时器延迟半秒
            setTimeout(()=>{
                picUpload03(info.file);
            }, 500);
        };

        const uploadButton03 = (
            <div>
                <Icon type={photoLoading03 ? 'loading' : 'plus'}/>
                <div className="ant-upload-text" style={{display: photoLoading03 ? "none" : "block"}}>选择图片</div>
            </div>
        );

        // 视频上传 处理
        const beforeUpload02 = (file) => {                 
            reqwestUploadToken(file);
        };

        const picHandleChange02 = (info) => {
            setTimeout(() => { // 渲染的问题，加个定时器延迟半秒
                picUpload02(info.file);
            }, 500);
        };

        const uploadButton02 = (
            <div>
                <Icon style={{fontSize: "50px"}} type={videoLoading ? 'loading' : 'video-camera'}/>
                <div className="ant-upload-text" style={{display: videoLoading ? "none" : "block"}}>添加课时</div>
            </div>
        );

        // 已上传视频写入
        const tempVideoList = [];
        if (videoList.length) {
            console.log(videoList);
            videoList.forEach((item, index) => {                
                item.sort = videoList.length - index;
                item.name = "测试" + index;
                console.log(item.sort);
                tempVideoList.push(
                    <Col span={8} key={index+1}>
                        <div className="chapter">第{item.sort}节</div>
                        <div className="videoSize">{item.videoSize} M</div>
                        <video src={item.video} controls="controls" width="100%"></video>
                        <input className="videoCourseName" onChange={(e) => onChangeCourseName(e, index)} defaultValue={item.name} placeholder="请输入明星名称"/>                       
                        <ul className="video-edit-ul-items">
                            <li className="item-video" onClick={() => editVideo(index)}>
                                <Icon type="edit" />编辑
                            </li>
                            <li className="item-video" onClick={() => editVideo(index)}>
                                <input className="item-video" type="text" onChange={(e) => onChangeSort(e, index)} placeholder="双击排序"/>
                            </li>                            
                            <li className="item-video" onClick={() => deleteVideo(index)}>
                                <Icon type="delete" />删除
                            </li>
                        </ul>                        
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
                destroyOnClose={true}>
                <div className="course-add course-form item-form quality-course-form star-manage-form">
                    <Form layout="vertical">
                        <h4 className="add-form-title-h4">基础信息</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="courseName"  label="姓名：">
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
                                        <Select placeholder="请选择性别">
                                            <Option value={0}>女</Option>
                                            <Option value={1}>男</Option>
                                        </Select>
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
                                        <InputNumber style={{width: "90%"}} precision={2} placeholder="请填写身高"/>
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
                                        <InputNumber style={{width: "90%"}} precision={3} placeholder="请填写体重"/>
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
                                        <Cascader options={optionsOfCity} placeholder="请选择所在地区"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="telephone"  label="联系方式：">
                                    {getFieldDecorator('telephone', {
                                        initialValue: data.telephone,                                      
                                        rules: [{
                                            required: true,
                                            message: '联系方式不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入联系方式"/>
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
                                            beforeUpload={beforeUpload}
                                            customRequest={picHandleChange}>
                                            {viewPic ? <img src={viewPic} alt=""/> : uploadButton}
                                        </Upload>                                        
                                    )}
                                </FormItem>
                            </Col>
                        </Row>                        
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">明星详情</h4>
                        <FormItem className="personalProfile" label="明星简介：">
                            {getFieldDecorator('personalProfile', {
                                initialValue: data.personalProfile,
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
                                initialValue: viewPic03,
                                rules: [{
                                    required: false,
                                    message: '明星图片不能为空',
                                }],
                            })(
                                <Upload
                                    name="file"
                                    listType="picture-card"                                    
                                    accept="image/*"
                                    showUploadList={false}
                                    beforeUpload={beforeUpload}
                                    customRequest={picHandleChange03}>
                                    {viewPic03 ? <img src={viewPic03} alt=""/> : uploadButton03}
                                </Upload>                                        
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
                                            beforeUpload={beforeUpload02}
                                            customRequest={picHandleChange02}>
                                            {uploadButton02}
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
            // 明星基本信息
            data: {},         
            // 明星图片相关变量            
            uploadToken: "",// 获取上传图片token
            viewPic: "",
            photoLoading: false,
            viewPic03: "",
            photoLoading03: false,
            // 视频上传
            viewVideo: "",
            videoList: [],
            videoLoading: false,
            // 提交按钮状态变量
            loading: false,                  
        };
        this.editor = ""
    }

    // 获取明星基本信息
    getData = () => {
        getStarDetail({id: this.props.id}).then((json) => {
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
    };

    // 图片处理    
    reqwestUploadToken = () => { // 请求上传凭证，需要后端提供接口
        getToken().then((json) => {
            if (json.data.result === 0) {
                    this.setState({
                        uploadToken: json.data.data,
                    })
                } else {
                    this.props.exceptHandle(json.data);
                }
        }).catch((err) => {
            message.error("发送失败");
        });
    };
    
    // 头像上传
    picUpload = (para) => {
        const _this = this;
        this.setState({photoLoading: true});
        const file = para;
        const key = UUID.create().toString().replace(/-/g, "");
        const token = this.state.uploadToken;
        const config = {region: qiniu.region.z0};
        const observer = {
            next (res) {console.log(res)},
            error (err) {
                console.log(err)
                message.error(err.message ? err.message : "图片提交失败");
                _this.setState({photoLoading: false})
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

    // 图片上传
    picUpload03 = (para) => {
        const _this = this;
        this.setState({photoLoading03: true});
        const file = para;
        const key = UUID.create().toString().replace(/-/g, "");
        const token = this.state.uploadToken;
        const config = {region: qiniu.region.z0};
        const observer = {
            next (res) {console.log(res)},
            error (err) {
                console.log(err)
                message.error(err.message ? err.message : "图片提交失败");
                _this.setState({photoLoading03: false})
            }, 
            complete (res) {
                console.log(res);
                message.success("图片提交成功");
                _this.setState({
                    viewPic03: configUrl.photoUrl + res.key || "",           
                    photoLoading03: false,
                })
            }
        }
        const observable = qiniu.upload(file, key, token, config);
        observable.subscribe(observer); // 上传开始        
    };
    
    // 视频上传
    picUpload02 = (para) => {
        const _this = this;
        const videoSize = (para.size/1024/1024).toFixed(2);
        if (this.state.videoList.length >= 15) {
            message.error("视频最多上传15个");
            return
        } else {
            this.setState({videoLoading: true});
            const file = para;
            const key = UUID.create().toString().replace(/-/g,"");
            const token = this.state.uploadToken;
            const config = {region: qiniu.region.z0};
            const observer = {
                next (res) {console.log(res);},
                error (err) {
                    console.log(err)
                    message.error(err.message ? err.message : "视频提交失败");
                    _this.setState({videoLoading: false});
                }, 
                complete (res) {
                    console.log(res);
                    message.success("视频提交成功");
                    let videoList = _this.state.videoList;
                    videoList.unshift({
                        duration: 10,
                        name: "",
                        sort: 0,
                        video: configUrl.photoUrl + res.key,
                        videoSize: videoSize
                    });
                    _this.setState({
                        videoList: videoList,                       
                        viewVideo: "",
                        videoLoading: false,
                    })
                }
            }
            const observable = qiniu.upload(file, key, token, config);
            observable.subscribe(observer); // 上传开始
        }
    };

     // 视频编辑
    editVideo = (index) => {
        setTimeout(()=> {
            // let ele = document.getElementById('video' + index);
            let duration = document.getElementById('video').duration;
            let {videoList} = this.state;
            this.setState({                
                videoList: videoList.map((item, idx) => idx === index ? {...item, duration: duration, readOnly: false,} : item).sort((a, b) => {return  a.sort - b.sort;})  
            },() => {
                console.log(this.state.videoList)
            });
        });
    };    
    
    // 视频删除
    deleteVideo = (index) => {
        let data = this.state.videoList;
        data.splice(index, 1);
        this.setState({
            videoList: data
        });
    };

    // 视频明星名称
    onChangeCourseName = (value, index) => {
        let {videoList} = this.state;
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
            videoList: videoList.map((item, idx) => idx === index ? {...item, sort: Number(value)} : item).sort((a, b) => {return a.sort - b.sort;})
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
                subjectList: [],
                uploadToken: "",              
                viewPic: "",                
                photoLoading: false,
                viewVideo: '',
                videoList: [],
                videoLoading: false,                
                allAuthorList: [],
                feeType: null,                                
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
            
            // 明星图片校验与写入
            if (this.state.viewPic) {
                values.photo = this.state.viewPic.slice(global.config.photoUrl.length);
            } else {
                message.error("图片未选择");
                return false;
            }

            // 过滤作者
            let tempAuther = this.state.allAuthorList.filter((para) => {return para.id = values.teacherId});            
            
            // 明星视频写入与校验
            let lesson = this.state.videoList;
            let tempVideoList = [];
            if (lesson.length) {
                lesson.forEach((item, index) => {                    
                    tempVideoList.push({
                        name: item.name,
                        sort: item.sort,
                        duration: item.duration,
                        video: item.video.slice(configUrl.photoUrl.length)
                    })
                })
            }
            console.log(tempVideoList);
            // 富文本内容处理
            values.riches = this.editor.getData();
            console.log(values.riches)
            const result = {
                id: this.props.id,
                name: values.courseName,
                typeId: values.typeIds[1],
                pic: values.photo,
                teacherId: tempAuther[0].id,
                teacherName: tempAuther[0].name,                   
                originalPrice: values.originalPrice,
                price: values.price,
                fee: values.fee,
                isFree: values.isFree,
                chargeJointCount: values.chargeJointCount,
                characteristic: values.riches,
                tips: values.tips,
                warmPrompt: values.warmPrompt,
                official: values.official,
                lesson: JSON.stringify(tempVideoList),
            };
            this.setState({loading: true});
            updateStar(result).then((json) => {
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

    // exceptHandle = (json) => {
    //     if (json.code === 901) {
    //         message.error("请先登录");                        
    //         this.props.toLoginPage();// 返回登陆页
    //     } else if (json.code === 902) {
    //         message.error("登录信息已过期，请重新登录");                        
    //         this.props.toLoginPage();// 返回登陆页
    //     } else {
    //         message.error(json.message);
    //         this.setState({loading: false})
    //     }
    // };

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
                    provinceList={this.props.provinceList}
                    reqwestUploadToken={this.reqwestUploadToken}
                    viewPic={this.state.viewPic}
                    picUpload={this.picUpload}
                    photoLoading={this.state.photoLoading}
                    viewPic03={this.state.viewPic03}
                    picUpload03={this.picUpload03}
                    photoLoading03={this.state.photoLoading03}
                    picUpload02={this.picUpload02}
                    viewVideo={this.state.viewVideo}                  
                    videoList={this.state.videoList}                    
                    videoLoading={this.state.videoLoading}
                    editVideo={this.editVideo}
                    deleteVideo={this.deleteVideo}
                    onChangeCourseName={this.onChangeCourseName}
                    onChangeSort={this.onChangeSort}                                       
                    confirmLoading={this.state.loading}
                />                
            </a>
        );
    }
}

// 明星详情表单
const ItemDetailsForm = Form.create()(
    (props) => {
        const {visible, onCancel, form, data, videoList, confirmLoading} = props;
        const {getFieldDecorator} = form;

        const tempVideoList = [];
        if (videoList.length) {
            videoList.forEach((item, index) => {
                tempVideoList.push(
                    <Col span={8} key={index+1}>
                        <div className="video">
                            <div className="chapter">序号{item.sort}</div>
                            <div className="videoSource">                                
                                <div className="videoSrc">
                                    <video controls="controls" width="100%">
                                        <source src={item.video} type="video/mp4" />                                                
                                    </video>
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
                                        <Select disabled placeholder="请选择性别">
                                            <Option value={0}>女</Option>
                                            <Option value={1}>男</Option>
                                        </Select>
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
                                        // initialValue: data.areaId === 0 ? ["0"] : currentArea,
                                        rules: [{
                                            required: true,
                                            message: '所在地区不能为空',
                                        }],
                                    })(
                                        <Cascader disabled  placeholder="请选择所在地区"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="telephone"  label="联系方式：">
                                    {getFieldDecorator('telephone', {
                                        initialValue: data.telephone,                                      
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
                            <Col span={24}>
                                <FormItem className="avatar"  label="头像：">
                                    {getFieldDecorator('avatar', {
                                        initialValue: data.pic,
                                        rules: [{
                                            required: true,
                                            message: '头像不能为空',
                                        }],
                                    })(
                                        <img src="" alt=""/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>                        
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">明星详情</h4>
                        <FormItem className="personalProfile" label="明星简介：">
                            {getFieldDecorator('personalProfile', {
                                initialValue: data.personalProfile,
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
                        <FormItem className="photo"  label="">
                            {getFieldDecorator('photo', {
                                initialValue: data.pic,
                                rules: [{
                                    required: false,
                                    message: '明星图片不能为空',
                                }],
                            })(
                                <img src="" alt=""/>
                            )}
                        </FormItem> 
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">视频作品</h4>
                        <Row gutter={24}>
                            {tempVideoList}                           
                        </Row>                       
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
        // 明星课时列表
        videoList: [],
        // 明星基本信息
        data: "",
    };

    // 获取明星基本信息
    getData = () => {
        getStarDetail({id: this.props.id}).then((json) => {
             if (json.data.result === 0) {
                // 已有所属分类写入
                json.data.typeIds = json.data.excellentCourseType.parentTypeName + '/' + json.data.excellentCourseType.typeName;
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
            pagination: {
                current: 1,
                pageSize: 15,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            },
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
                                exceptHandle={this.props.exceptHandle}
                                toLoginPage={this.props.toLoginPage}/>
                             {/*明星编辑*/}
                            <ItemEdit 
                                id={record.id} 
                                recapture={this.getData}
                                opStatus={this.props.opObj.modify}
                                uploadToken={this.props.uploadToken}
                                provinceList={this.props.provinceList}
                                exceptHandle={this.props.exceptHandle}
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
                                <a style={{display: this.props.opObj.putAway ? "inline" : "none"}}>{record.status === "上架" ? "下架" : "上架"}</a>
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

    // 获取本页信息
    getData = (keyword) => {
        this.setState({loading: true});
        const params = {
            name: keyword ? keyword.courseName : this.props.keyword.courseName,
            gender: keyword ? keyword.gender : this.props.keyword.gender,
            startTime: keyword ? keyword.startTime : this.props.keyword.startTime,
            endTime: keyword ? keyword.endTime : this.props.keyword.endTime,                
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize
        };
        starList(params).then((json) => {
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
                    // 性别 女：0，男： 1
                    let tempGender = "";
                    if (item.gender === 0) {
                        tempGender = "女";
                    }
                    if (item.source  === 1) {
                        tempGender = "男";
                    }                     
                    // 明星状态
                    let tempStatus = "";
                    if (item.status === 2) {
                        tempStatus = "上架";
                    }
                    if (item.status  === 3) {
                        tempStatus = "下架";
                    }
                    data.push({
                        key: index.toString(),
                        id: item.id,
                        index: index + 1,
                        sort: item.sort !== 0 ? item.sort : '',
                        name: item.name,
                        nickname: item.nickname,
                        genderCode: item.gender,
                        gender: tempGender,
                        createTime: item.createTime,
                        statusCode: item.status,
                        status: tempStatus,
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
                this.props.exceptHandle(json.data);
                this.setState({loading: false});
            }
        }).catch((err) => {
            message.error("获取失败");
            this.setState({loading: false});
        });
    };

    // 设置排序
    handleSort = (row) => {
        this.setState({loading: true});
        const data = {
            id: row.id,// 明星Id                
            sort: Number(row.sort),// 排序
        };
        sortStar(data).then((json) => {
            if (json.data.result === 0) {
                this.setState({loading: false});
                this.getData();
            } else {
                this.props.exceptHandle(json.data);
                this.setState({loading: false});
            }
        }).catch((err) => {
            message.error("获取失败");
            this.setState({loading: false});
        });
    };

    // 明星上架,下架
    itemBan = (id, status) => {
        this.setState({loading: true});
        const data = {
            id: id,
            status: status === "上架" ? 3 : 2
        };
        putAwayStar(data).then((json) => {
            if (json.data.result === 0) {
                message.success(status === "上架" ? "明星下架成功" : "明星上架成功");
                this.getData();
            } else {
                this.props.exceptHandle(json.data);
                this.setState({loading: false});
            }
        }).catch((err) => {
            message.error("获取失败");
            this.setState({loading: false});
        });
    };

    // exceptHandle = (json) => {
    //     if (json.code === 901) {
    //         message.error("请先登录");                        
    //         this.props.toLoginPage();// 返回登陆页
    //     } else if (json.code === 902) {
    //         message.error("登录信息已过期，请重新登录");                        
    //         this.props.toLoginPage();// 返回登陆页
    //     } else {
    //         message.error(json.message);
    //     }
    //     this.setState({loading: false});
    // };

    // 表格参数变化处理
    handleTableChange = (pagination, filters) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.coursePageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.coursePageSize);
        this.setState({
            type: filters.type ? filters.type[0] : null,
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
                    scroll={{ x: 1500 }}
                    components={components}
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    columns={columns}
                    onChange={this.handleTableChange}/>;
    }
}

// 明星
class StarManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 明星权限
            opObj: {
                add: true,
                copy: true,
                select: true,
                modify: true,
                putAway: true,
            },
            // 获取明星列表所需关键词
            keyword: {
                courseName: '',
                startTime: "",
                endTime: "",
                gender: 0,
            },
            startValue: null,
            endValue: null,
            flag_add: false,
            mapObj: {},// 地图控件对象
            provinceList: [],// 省市列表
        };
        this.optionsGender = [
            <Option key="全部" value="全部">{"全部"}</Option>,
            <Option key="0" value="0">女</Option>,
            <Option key="1" value="1">男</Option>,
        ];              
    };

    // 获取省市列表信息及当前城市地区代码
    getMapDate = () => {
        this.setState({
            mapObj: new window.AMap.Map('star-mapContainer')
        }, () => {
            // 获取省区列表
            this.state.mapObj.plugin('AMap.DistrictSearch', () => {
                var districtSearch = new window.AMap.DistrictSearch({
                    level: 'country',
                    subdistrict: 3 // 1:省，2:市，3:区，4:街道
                });
                districtSearch.search('中国', (status, result) => {               
                    this.setState({
                        provinceList: result.districtList[0].districtList.sort((a, b) => {return a.adcode - b.adcode})
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
    // cityList = () => {
    //     if (this.state.provinceList.length) {
    //         this.state.provinceList.forEach((item) => {
    //             let children = [];
    //             if (item.districtList) {
    //                 item.districtList.forEach((subItem) => {
    //                     children.push({value: subItem.adcode, label: subItem.name});                    
    //                 });
    //             }
    //             this.optionsOfCity.push({value: item.adcode, label: item.name, children: children});
    //         });
    //     }        
    // };

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
        // 菜单信息为空则直接返回登陆页
        if (!sessionStorage.menuListOne) {
            this.toLoginPage();
            return
        }
        JSON.parse(sessionStorage.menuListOne).forEach((item) => {
            item.children.forEach((subItem) => {                
                subItem.children.forEach((thirdItem) => {
                    if (thirdItem.url === this.props.location.pathname) {
                        let data = {};
                        thirdItem.children.forEach((fourthItem) => {
                            data[fourthItem.url] = true;
                        });
                        this.setState({
                            opObj: data
                        })
                    }
                })
            })
        })
    };

    // 搜索及明星名称，姓名，昵称设置
    search = (type, value) => {
        this.setState({
            keyword: {
                courseName: value,
                startTime: this.state.keyword.startTime,
                endTime: this.state.keyword.endTime,
            }
        });
    };

    // 性别设置
    setGender = (value) => {
        this.setState({
            keyword: {
                gender: value,
                cityCode: this.state.keyword.cityCode,
                educationName: this.state.keyword.educationName,
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
                courseName: this.state.keyword.courseName,
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
                courseName: this.state.keyword.courseName,
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
    
    // 刷新table页面
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

    // uploadToken = () => { // 请求上传凭证，需要后端提供接口
    //     // 如何返回变量
    //     getToken().then((json) => {
    //         if (json.data.result === 0) {                 
    //            uploadToken =  json.data.data;
    //         } else {
    //             this.exceptHandle(json.data);
    //         }
    //         // return uploadToken;
    //     }).catch((err) => {
    //         message.error("发送失败");
    //     });
    // };

    exceptHandle = (json) => {
        if (json.code === 901) {
            message.error("请先登录");                        
            this.toLoginPage();// 返回登陆页
        } else if (json.code === 902) {
            message.error("登录信息已过期，请重新登录");                        
            this.toLoginPage();// 返回登陆页
        } else {
            message.error(json.message);
        }
    };

    componentWillMount() {
        this.getMapDate();// 获取省份城市
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
        console.log(this.state.opObj);
        return (
            <div className="courses star">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                {/*明星名筛选*/}
                                <Search 
                                    className="star-search"
                                    placeholder="请输入明星名称、姓名、昵称"
                                    onSearch={(value) => this.search(value)}
                                    enterButton/>
                                {/*性别筛选*/}
                                <Select                                    
                                    className="star-select"
                                    onChange={this.setGender}
                                    placeholder="请选择性别"
                                    allowClear>
                                    {this.optionsGender}
                                </Select>
                                {/*明星创建日期筛选*/}
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
                                {/*明星添加按钮*/}
                                <div className="star-add-button">
                                    <ItemAdd
                                        opStatus={this.state.opObj.add}
                                        provinceList={this.state.provinceList}
                                        recapture={this.getData}                                        
                                        exceptHandle={this.exceptHandle}
                                        toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            {/*明星列表*/}
                            <div className="table-box">                                
                                <DataTable                                    
                                    opObj={this.state.opObj}
                                    keyword={this.state.keyword}                                    
                                    provinceList={this.state.provinceList}                                   
                                    exceptHandle={this.exceptHandle}
                                    flag_add={this.state.flag_add}
                                    toLoginPage={this.toLoginPage}/>
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