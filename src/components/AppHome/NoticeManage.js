import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {
    Table,
    Input,
    Button,
    Modal,
    Form,
    Select,
    Upload,
    Icon,
    message,
    Row,
    Col,
    Radio,
    InputNumber,
    DatePicker,    
    Cascader,
    Popconfirm,
    Tooltip,
} from 'antd';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';
import '../../config/config';
import { noticeList, addNotice, updateNotice, noticeDetail, NewestNotice, noticeOver, pastReview } from '../../config';
import reqwest from 'reqwest';

const Search = Input.Search;
const FormItem = Form.Item;
const {TextArea} = Input;
const {Option} = Select;
const RadioGroup = Radio.Group;

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

// 新增、复制通告表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, keepAddNotice, provinceList, allTypeList, form, data, setStartTime, setEndTime, disabledStartDate, disabledEndDate, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 城市选项生成
        const optionsOfCity = [{value: "0", label: "全国"}];
        let currentCity = [];
        if (provinceList.length) {
            provinceList.forEach((item) => {
                let children = [];
                if (item.districtList) {
                    item.districtList.forEach((subItem) => {
                        if (Number(subItem.adcode) === data.cityId) {                          
                            currentCity = [item.adcode, subItem.adcode];// 当前城市设为选中项
                        }
                        children.push({value: subItem.adcode, label: subItem.name});
                    });
                }
                optionsOfCity.push({value: item.adcode, label: item.name, children: children});
            });
        }

        const typeList =[
            <Option key={0}>广告片拍摄</Option>,
            <Option key={1}>品牌发布会</Option>,
            <Option key={2}>平面拍摄</Option>,
            <Option key={3}>品牌试衣</Option>,
            <Option key={4}>定货会</Option>,
        ]
        // if (allTypeList.length) {
        //     allTypeList.forEach((item, index) => {
        //         typeList.push(<Option key={item.id}>item.name</Option>)
        //     })
        // }

        return (
            <Modal
                visible={visible}
                title="添加通告"
                width={1000}
                onCancel={onCancel}
                footer={[
                    <Button key="back" onClick={onCancel} disabled={confirmLoading}>取消</Button>,
                    <Button key="submit" type="primary" loading={confirmLoading} onClick={() => onCreate(2)}>确定</Button>
                ]}
                destroyOnClose={true}>
                <div className="course-add course-form item-form quality-course-form notice-form">
                    <Form layout="vertical">
                        <h4 className="add-form-title-h4">基础信息</h4>
                        <Row gutter={24}>
                            <Col span={16}>
                                <FormItem className="courseName"  label="通告名称：">
                                    {getFieldDecorator('courseName', {
                                        initialValue: data.name,                                      
                                        rules: [{
                                            required: true,
                                            message: '通告名称不能为空',
                                            max: 18
                                        }],
                                    })(
                                        <Input placeholder="请填写通告标题（18字以内）"/>
                                    )}
                                </FormItem>                                
                            </Col>
                            <Col span={8}>                                
                                <FormItem className="cityId" label="展示城市：">
                                    {getFieldDecorator('cityId', {
                                        // initialValue: currentCity,
                                        rules: [{
                                            required: true,
                                            message: '展示城市不能为空',
                                        }],
                                    })(
                                        <Cascader options={optionsOfCity} placeholder="请选择展示城市"/>                                        
                                    )}
                                </FormItem>
                            </Col>
                        </Row>                        
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={16}>
                                <FormItem className="time"  label="有效时间：">
                                    {getFieldDecorator('time', {
                                        initialValue: "2019-07-18",                                      
                                        rules: [{
                                            required: true,
                                            message: '通告名称不能为空',                                            
                                        }],
                                    })(
                                        <div className="efficiencyTime">
                                            <DatePicker 
                                                onChange={setStartTime}
                                                showTime
                                                disabledDate={disabledStartDate}
                                                style={{width: "180px"}}
                                                placeholder="请选择开始日期"/>
                                            <span style={{margin: "0 10px"}}>至</span>
                                            <DatePicker
                                                disabledDate={disabledEndDate}
                                                onChange={setEndTime}
                                                style={{width: "180px"}}
                                                placeholder="请选择结束日期"/>
                                            <span style={{margin: "0 10px",fontSize: "12px"}}><Icon type="alert" /> 结束时间不填则表示长期有效</span>
                                        </div>
                                    )}
                                </FormItem>                                
                            </Col>
                            <Col span={8}>
                                <FormItem className="location"  label="类型：">
                                    {getFieldDecorator('location', {
                                        initialValue: data.location,                                      
                                        rules: [{
                                            required: true,
                                            message: '通告名称不能为空',                                            
                                        }],
                                    })(
                                        <Select placeholder="请选择类型">
                                            {typeList}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={16}>
                                <FormItem className="location"  label="地点：">
                                    {getFieldDecorator('location', {
                                        initialValue: data.location,                                      
                                        rules: [{
                                            required: true,
                                            message: '通告地点不能为空',                                            
                                        }],
                                    })(
                                        <Input placeholder="请填写地点"/>
                                    )}
                                </FormItem>
                            </Col>
                            
                        </Row>
                        <div className="ant-line"></div>
                        <FormItem className="claim" label="要求：">
                            {getFieldDecorator('claim', {
                                initialValue: data.claim,
                                rules: [{
                                    required: true,
                                    message: '要求不能为空',
                                }],
                            })(
                                <TextArea 
                                    style={{resize: "none"}}                                    
                                    placeholder="请填写身高、风格、报名需提供材料等要求"
                                    autosize={{minRows: 5, maxRows: 10}}/>                                
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <div>
                            <Button type="primary" onClick={keepAddNotice}>继续添加通告</Button>
                        </div>                       
                    </Form>
                </div>
            </Modal>
        )
    }
);

// 新增、复制通告组件
class ItemAdd extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            // 通告基本信息
            data: {},                     
            // 提交按钮状态变量
            loading: false,
            startValue: null,
            endValue: null,
            startTime: null,
            endTime: null
        };
    }

    // 设置开始时间
    setStartTime = (date, dateString) => {
        console.log(date)
        console.log(dateString)
        this.setState({
            startValue: date,
            startTime: dateString
        });
    };
    
    // 设置结束时间
    setEndTime = (date, dateString) => {
        this.setState({
            endValue: date,
            endTime: dateString,
        });
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

    // 获取通告基本信息
    getData = () => {
        NewestNotice().then((json) => {
            if (json.data.result === 0) {
                // 已有所属分类写入                    
                // json.data.data.typeId = json.data.data.excellentCourseType.typeId;                                      
                // 富文本数据写入入
                // this.editor.setData(json.data.data.characteristic);
                // 信息写入
                this.setState({
                    data: json.data.data,
                    viewPic: json.data.data.pic,
                    videoList: json.data.data.lesson
                });
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {this.errorHandle(err);});
    };


    showModal = (props, event) => {
        if (props === 1) {// 复制通告            
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
            content: `你还没添加通告，请先添加通告，正在返回，请稍后 ${secondsToGo} s.`,
        });
        const timer = setInterval(() => {
            secondsToGo -= 1;
            modal.update({
               content: `你还没添加通告，请先添加通告，正在返回，请稍后 ${secondsToGo} s.`,
            });
        }, 1000);
        setTimeout(() => {
            clearInterval(timer);
            sessionStorage.removeItem("courseData");
            modal.destroy();
        }, secondsToGo * 1000);
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
            form.resetFields();
        });
    };

    keepAddNotice = () => {
        const form = this.form;        
        form.validateFieldsAndScroll((err, values) => {// 获取表单数据并进行必填项校验
            if (err) {return;}
            // let { viewPic, allAuthorList, videoList} = this.state;            
            const result = {
                name: values.name,
            };
            const data = [];
            data.push({
                name: values.name,                
            })
        });
    };

    // 确认处理
    handleCreate = (type) => {
        const form = this.form;        
        form.validateFieldsAndScroll((err, values) => {// 获取表单数据并进行必填项校验
            if (err) {return;}           
            
            const data = {
                name: values.name,
                provinceId: values.cityId[0],
                provinceName: values.provinceName,
                cityId: values.cityId[1] || values.cityId[0],
                cityName: values.cityName,
                beginDate: this.state.startTime,
                endDate: this.state.endTime,
                type: values.type,
                address: values.address,
                lat: values.lat,
                lng: values.lng,
                description: values.description,
            };
            this.setState({loading: true});            
            addNotice(data).then((json) => {
                if (json.data.result === 0) {
                    message.success("添加通告成功");
                    this.handleCancel();
                    this.props.recapture();
                } else {
                    this.exceptHandle(json.data);
                }
            }).catch((err) => {this.errorHandle(err);});
        });
    };

    // 异常处理
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
    
    // 错误处理
    errorHandle = (err) => {
        message.error("保存失败");
        this.setState({loading: false});
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
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    keepAddNotice={this.keepAddNotice}
                    provinceList={this.props.provinceList}
                    allTypeList={this.state.allTypeList}
                    data={this.state.data}
                    setStartTime={this.setStartTime}
                    setEndTime={this.setEndTime}
                    disabledStartDate={this.disabledStartDate}
                    disabledEndDate={this.disabledEndDate}
                    confirmLoading={this.state.loading}/>                
            </div>
        );
    }
}

// 通告编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, allTypeList, provinceList, form, data, confirmLoading} = props;
        const {getFieldDecorator} = form;
       
        return (
            <Modal
                visible={visible}
                title="编辑通告"
                width={1000}
                onCancel={onCancel}
                footer={[
                    <Button key="back" onClick={onCancel} disabled={confirmLoading}>取消</Button>,
                    <Button key="submit" type="primary" loading={confirmLoading} onClick={() => onCreate(2)}>确定</Button>
                ]}
                destroyOnClose={true}>
                <div className="course-add course-form item-form quality-course-form">
                    
                </div>
            </Modal>
        )
    }
);

// 通告编辑组件
class ItemEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            // 通告基本信息
            data: {},                       
            // 提交按钮状态变量
            loading: false,                  
        };        
    }

    // 获取通告基本信息
    getData = () => {
        noticeDetail({id: this.props.id}).then((json) => {
            if (json.data.result === 0) {
                this.setState({data: json.data.data});
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {this.errorHandle(err);});
    };

    showModal = () => {
        this.getData();       
        this.setState({visible: true});
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
            form.resetFields();
        });
    };

    // 确认处理
    handleCreate = () => {
        const form = this.form;        
        form.validateFieldsAndScroll((err, values) => {// 获取表单数据并进行必填项校验
            if (err) {return;}
            const result = {
                id: this.props.id,
                name: values.name,
                provinceId: values.cityId[0],
                provinceName: values.provinceName,
                cityId: values.cityId[1] || values.cityId[0],
                cityName: values.cityName,
                beginDate: this.state.startTime,
                endDate: this.state.endTime,
                type: values.type,
                address: values.address,
                lat: values.lat,
                lng: values.lng,
                description: values.description,
            };

            this.setState({loading: true});
            updateNotice(result).then((json) => {
                if (json.data.result === 0) {
                    message.success("编辑通告成功");
                    this.handleCancel();
                    this.props.recapture();                            
                } else {
                    this.exceptHandle(json.data);
                }
            }).catch((err) => {this.errorHandle(err);});
        });
    };

    // 异常处理
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
    
    // 错误处理
    errorHandle = (err) => {
        message.error("保存失败");
        this.setState({loading: false});
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
                    provinceList={this.props.provinceList}
                    allTypeList={this.state.allTypeList}
                    data={this.state.data}
                    confirmLoading={this.state.loading}/>                
            </a>
        );
    }
}

// 通告往期回顾表单
const ItemPassReviewForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, editVideo, deleteVideo, onChangeCourseName, onChangeSort, handleSearch, allAuthorList, form, data, reqwestUploadToken, viewPic, picUpload, photoLoading, picUpload02, viewVideo, videoList, videoLoading, subjectList, feeType, setFeeType, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 分类选项生成
        const optionsOfSubject = [];
        let currentSubject = [];
        subjectList.forEach((item) => {
            let children = [];
            if (item.list) {
                item.list.forEach((subItem) => {
                    children.push({value: subItem.id, label: subItem.name});
                    if (subItem.id === data.typeId) {// 当前分类设为选中项                        
                        currentSubject = [item.id, subItem.id]
                    }
                });
            }
            optionsOfSubject.push({value: item.id, label: item.name, children: children});
        });

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
                <div className="ant-upload-text" style={{display: photoLoading ? "none" : "block"}}>选择图片</div>
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
                        <input className="videoCourseName" onChange={(e) => onChangeCourseName(e, index)} defaultValue={item.name} placeholder="请输入通告名称"/>                       
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

        // 作者选项生成
        const optionsOfAllAuthorList = [];
        if (allAuthorList.length) {
            allAuthorList.forEach((item, index) => {                
                optionsOfAllAuthorList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
            });
        }
        
        return (
            <Modal
                visible={visible}
                title="编辑通告"
                width={1000}
                onCancel={onCancel}
                footer={[
                    <Button key="back" onClick={onCancel} disabled={confirmLoading}>取消</Button>,
                    <Button key="submit" type="primary" loading={confirmLoading} onClick={() => onCreate(2)}>确定</Button>
                ]}
                destroyOnClose={true}
            >
                <div className="course-add course-form item-form quality-course-form">
                    <Form layout="vertical">
                        <h4 className="add-form-title-h4">基础信息</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="courseName"  label="通告名称：">
                                    {getFieldDecorator('courseName', {
                                        initialValue: data.name,                                      
                                        rules: [{
                                            required: true,
                                            message: '通告名称不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入通告名称"/>
                                    )}
                                </FormItem>                                
                            </Col>
                            <Col span={8}>                                
                                <FormItem className="typeId" label="所属分类：">
                                    {getFieldDecorator('typeIds', {
                                        initialValue: currentSubject,
                                        rules: [{
                                            required: true,
                                            message: '所属分类不能为空'                                           
                                        }],
                                    })(
                                        <Cascader options={optionsOfSubject} placeholder="请选择所属分类"/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem className="certification"  label="通告图片：">
                                    {getFieldDecorator('photo', {
                                        initialValue: viewPic,
                                        rules: [{
                                            required: true,
                                            message: '通告图片不能为空',
                                        }],
                                    })(
                                        <Upload
                                            name="file"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            accept="image/*"
                                            showUploadList={false}
                                            beforeUpload={beforeUpload}
                                            customRequest={picHandleChange}
                                        >
                                            {viewPic ? <img src={viewPic} alt=""/> : uploadButton}
                                        </Upload>                                        
                                    )}
                                </FormItem> 
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="author"  label="作者：">
                                    {getFieldDecorator('teacherId', {
                                        initialValue: data.teacherId,
                                        rules: [{
                                            required: true,
                                            message: '作者不能为空',
                                        }],
                                    })(                                        
                                        <Select
                                            showSearch
                                            allowClear
                                            style={{width: '100%'}}
                                            placeholder="请选择"
                                            onSearch={handleSearch}                                            
                                            filterOption={false}
                                            notFoundContent={null}>
                                            {optionsOfAllAuthorList}
                                        </Select>
                                    )}
                                </FormItem> 
                            </Col>
                            <Col span={8}>
                                <FormItem className="originalPrice" label="通告原价：">
                                    {getFieldDecorator('originalPrice', {
                                        initialValue: data.originalPrice,
                                        rules: [{
                                            required: true,
                                            message: '通告原价不能为空',
                                        }],
                                    })(
                                        <InputNumber min={0} precision={2} step={100} style={{width: "100%"}} placeholder="请输入价格，支持两位小数"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="price"  label="通告现价：">
                                    {getFieldDecorator('price', {
                                        initialValue: data.price,
                                        rules: [{
                                            required: true,
                                            message: '通告现价不能为空',
                                        }],
                                    })(
                                        <InputNumber min={0} precision={2} step={100} style={{width: "100%"}} placeholder="请输入价格，支持两位小数"/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={6}>
                                <FormItem className="name" label="付费设置：">
                                    {getFieldDecorator('isFree', {
                                        initialValue: data.isCharge ? 1 : 2,
                                        rules: [{
                                            required: true,
                                            message: '付费不能为空',
                                        }],
                                    })(
                                        <RadioGroup buttonStyle="solid" onChange={(e) => {setFeeType(e.target.value)}}>
                                            <Radio.Button value={1} style={{marginRight: "20px", borderRadius: "4px"}}>收费</Radio.Button>
                                            <Radio.Button value={2} style={{marginRight: "20px", borderRadius: "4px"}}>免费</Radio.Button>
                                        </RadioGroup>                                       
                                    )}
                                </FormItem>                                
                            </Col>
                            <Col span={8}>
                                <FormItem className="chapterChoose chapterChooseAdd" label="">
                                    从 {getFieldDecorator('chargeJointCount', {
                                        initialValue: data.isCharge ? data.chargeJointCount : '',
                                        rules: [{
                                            required: feeType === 1,
                                            message: '章节不能为空',
                                        }],
                                    })(
                                        <InputNumber min={0} precision={0} step={1} style={{width: "40%"}} placeholder="请输入正整数" />
                                    )} 节开始收费
                                </FormItem>
                            </Col>
                            <Col span={2}></Col>
                            <Col span={8}>
                                <FormItem className="originalPrice" label="服务费：">
                                    {getFieldDecorator('fee', {
                                        initialValue: data.fee,
                                        rules: [{
                                            required: true,
                                            message: '服务费不能为空',
                                        }],
                                    })(
                                        <InputNumber min={0} precision={2} step={0.01} style={{width: "100%"}} placeholder="输入0.15即为服务费15%"/>
                                    )}
                                </FormItem>
                            </Col>
                            <div className="ant-line"></div>
                        </Row>
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">通告详情</h4>
                        <FormItem className="sketch" label="通告简介：">
                            {getFieldDecorator('characteristic', {
                                initialValue: data.characteristic,
                                rules: [{
                                    required: true,
                                    message: '不能为空',
                                }],
                            })(
                                <TextArea 
                                    className="ckeditor"
                                    style={{resize: "none"}}                                    
                                    placeholder="请填写通告简介"
                                    autosize={{minRows: 5, maxRows: 10}}/>                                
                            )}
                        </FormItem>                        
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">购买须知</h4>
                        <FormItem className="tips longItem" label="购买说明：">
                            {getFieldDecorator('tips', {
                                initialValue: data.tips,
                                rules: [{
                                    required: true,
                                    message: '购买须知不能为空',
                                }],
                            })(
                                <TextArea 
                                    style={{resize: "none"}} 
                                    placeholder="请填写通告购买须知"
                                    autosize={{minRows: 5, maxRows: 10}}/>
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <FormItem className="warmPrompt longItem" label="温馨提示：">
                            {getFieldDecorator('warmPrompt', {
                                rules: [{
                                    required: true,
                                    message: '温馨提示不能为空',
                                }],
                                initialValue: data.warmPrompt || "如需要发票，请您在上课前向机构咨询",
                            })(
                                <TextArea 
                                    style={{resize: "none"}} 
                                    placeholder="如需要发票，请您在上课前向机构咨询"
                                    autosize={{minRows: 5, maxRows: 5}}/>
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <FormItem className="official longItem" label="官方说明：">
                            {getFieldDecorator('official', {
                                rules: [{
                                    required: true,
                                    message: '官方说明不能为空',
                                }],
                                initialValue: data.official || "为保障您的权益，建议使用淘儿学线上支付，若使用其他支付方式导致纠纷，淘儿学不承担任何责任，感谢您的理解和支持！"
                            })(
                                <TextArea 
                                    style={{resize: "none"}} 
                                    placeholder="为保障您的权益，建议使用淘儿学线上支付，若使用其他支付方式导致纠纷，淘儿学不承担任何责任，感谢您的理解和支持！"
                                    autosize={{minRows: 5, maxRows: 5}}/>
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">课时安排</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="certification"  label="">
                                    {getFieldDecorator('photo', {
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
                                            customRequest={picHandleChange02}
                                        >
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

// 通告往期回顾组件
class ItemPassReview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            // 通告基本信息
            data: {},
            // 科目列表
            subjectList: [],
            // 通告图片相关变量            
            uploadToken: "",// 获取上传图片token
            viewPic: "",
            photoLoading: false,
            // 视频上传
            viewVideo: "",
            videoList: [],
            videoLoading: false,            
            // 作者
            allAuthorList: [],
            // 付费设置状态
            feeType: null,
            // 提交按钮状态变量
            confirmLoading: false,                  
        };
        this.editor = ""
    }

    // 根据输入作者名字模糊查找作者列表
    handleSearch = (value) => {
        reqwest({
            url: '/sys/excellentCourse/getTeacher',
            type: 'json',
            method: 'get',
            data: {
                searchKey: value,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {},
            success: (json) => {
                if (json.result === 0) {
                    if (json.data.length) {
                        this.setState({
                            allAuthorList: json.data
                        });
                    }
                } else {
                    if (json.code === 901) {
                        message.error("请先登录");                        
                        this.props.toLoginPage();// 返回登陆页
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");                        
                        this.props.toLoginPage();// 返回登陆页
                    } else {
                        message.error(json.message);
                    }
                }
            }
        });
    };

    // 获取通告基本信息
    getData = () => {
        reqwest({
            url: '/sys/excellentCourse/detail',
            type: 'json',
            method: 'get',
            data: {
                id: this.props.id
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {},
            success: (json) => {
                if (json.result === 0) {
                    // 已有所属分类写入                    
                    json.data.typeId = json.data.excellentCourseType.typeId;
                    
                    // 富文本数据写入入
                    this.editor.setData(json.data.characteristic);
                    // 信息写入
                    this.setState({
                        data: json.data,
                        viewPic: json.data.pic,
                        videoList: json.data.lesson
                    });
                } else {
                    if (json.code === 901) {
                        message.error("请先登录");                        
                        this.props.toLoginPage();// 返回登陆页
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");                        
                        this.props.toLoginPage();// 返回登陆页
                    } else if (json.code === 1005) {                        
                        this.countDown();// 判断没有添加数据是，提示信息
                    } else {
                        message.error(json.message);
                    }
                }
            }
        });
    };

    // 获取科目列表
    getSubjectList = () => {
        reqwest({
            url: '/sys/orgType/list',
            type: 'json',
            method: 'get',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {},
            success: (json) => {
                if (json.result === 0) {                    
                    this.setState({
                        subjectList: json.data
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
                    }
                }
            }
        });
    };

    showModal = () => {
        this.getSubjectList();
        this.handleSearch();
        this.getData();       
        this.setState({visible: true});      
        setTimeout(()=> {
           this.editor = window.CKEDITOR.replace(document.getElementById('characteristic'));                      
        });
    };

    // 付费设置
    setFeeType = (value) => {
        this.setState({
            feeType: value
        });
    };

    // 图片处理    
    reqwestUploadToken = (file) => { // 请求上传凭证，需要后端提供接口
        reqwest({
            url: '/sys/upload/getToken',
            type: 'json',
            method: 'get',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("发送失败");
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        uploadToken: json.data,
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
    
    // 图片上传
    picUpload = (para) => {
        const _this = this;
        this.setState({
            photoLoading: true,
        });

        const file = para;
        const key = UUID.create().toString().replace(/-/g, "");
        const token = this.state.uploadToken;
        const config = {
            region: qiniu.region.z0
        };
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
    
    // 视频上传
    picUpload02 = (para) => {
        console.log(para);
        console.log(para.size/1024/1024);
        const _this = this;
        const videoSize = (para.size/1024/1024).toFixed(2);
        if (this.state.videoList.length >= 15) {
            message.error("视频最多上传15个");
            return
        } else {
            this.setState({
                videoLoading: true,
            });
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
                        duration: 10,
                        name: "测试2",
                        sort: 1,
                        video: global.config.photoUrl + res.key,
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

    // 视频通告名称
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
                confirmLoading: false,
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
            
            // 通告图片校验与写入
            if (this.state.viewPic) {
                values.photo = this.state.viewPic.slice(global.config.photoUrl.length);
            } else {
                message.error("图片未选择");
                return false;
            }

            // 过滤作者
            let tempAuther = this.state.allAuthorList.filter((para) => {return para.id = values.teacherId});            
            
            // 通告视频写入与校验
            let lesson = this.state.videoList;
            let tempVideoList = [];
            if (lesson.length) {
                lesson.forEach((item, index) => {                    
                    tempVideoList.push({
                        name: item.name,
                        sort: item.sort,
                        duration: item.duration,
                        video: item.video.slice(global.config.photoUrl.length)
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

            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/sys/excellentCourse/update',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: result,
                error: (XMLHttpRequest) => {
                    message.error("获取失败");
                    this.setState({confirmLoading: false});
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("编辑通告成功");
                        this.handleCancel();
                        this.props.recapture();                            
                    } else {
                        message.error(json.message);                        
                        this.setState({confirmLoading: false});
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
                <span onClick={this.showModal}>往期回顾</span>                
                <ItemPassReviewForm
                    ref={this.saveFormRef}                 
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    handleSearch={this.handleSearch}
                    allAuthorList={this.state.allAuthorList}                    
                    data={this.state.data}                                                    
                    checkSubjectType={this.checkSubjectType}
                    subjectList={this.state.subjectList}
                    reqwestUploadToken={this.reqwestUploadToken}
                    viewPic={this.state.viewPic}                    
                    picUpload={this.picUpload}
                    photoLoading={this.state.photoLoading}                  
                    picUpload02={this.picUpload02}
                    viewVideo={this.state.viewVideo}                  
                    videoList={this.state.videoList}                    
                    videoLoading={this.state.videoLoading}
                    editVideo={this.editVideo}
                    deleteVideo={this.deleteVideo}
                    onChangeCourseName={this.onChangeCourseName}
                    onChangeSort={this.onChangeSort}
                    feeType={this.state.feeType}
                    setFeeType={this.setFeeType}                    
                    confirmLoading={this.state.confirmLoading}
                />                
            </a>
        );
    }
}

// 通告详情表单
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
                            <div className="chapter">第{item.sort}节</div>
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
                        <h4 className="add-form-title-h4">基本信息</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="courseName"  label="通告名称：">
                                    {getFieldDecorator('courseName', {
                                        initialValue: data.name,
                                        rules: [{
                                            required: true,
                                            message: '通告名称不能为空',
                                        }],
                                    })(
                                        <Input disabled placeholder="请输入通告名称"/>
                                    )}
                                </FormItem>                                
                            </Col>
                            <Col span={8}>
                                <FormItem className="typeId" label="所属分类：">
                                    {getFieldDecorator('typeIds', {
                                        initialValue: data.typeIds,
                                        rules: [{
                                            required: true,
                                            message: '所属分类不能为空'
                                        }],
                                    })(
                                        <Input disabled placeholder="请输入所属分类"/>
                                    )}
                                </FormItem> 
                            </Col>
                            <Col span={24}>
                                <FormItem className="certification"  label="通告图片：">
                                    {getFieldDecorator('pic', {
                                        initialValue: data.pic,
                                        rules: [{
                                            required: true,
                                            message: '通告图片不能为空',
                                        }],
                                    })(
                                        <div className="coursePhoto">                                            
                                            <img src={data.pic} alt=""/>
                                        </div>
                                    )}
                                </FormItem> 
                            </Col>
                            <Col span={8}>
                                <FormItem className="author"  label="作者：">
                                    {getFieldDecorator('author', {
                                        initialValue: data.teacherName,
                                        rules: [{
                                            required: true,
                                            message: '作者不能为空',
                                        }],
                                    })(
                                        <Input disabled placeholder="请输入作者"/>
                                    )}
                                </FormItem> 
                            </Col>
                            <Col span={8}>
                                <FormItem className="originalPrice" label="通告原价：">
                                    {getFieldDecorator('originalPrice', {
                                        initialValue: data.originalPrice,
                                        rules: [{
                                            required: true,
                                            message: '通告原价不能为空',
                                        }],
                                    })(
                                        <InputNumber disabled min={0} precision={2} step={100} style={{width: "100%"}} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="price"  label="通告现价：">
                                    {getFieldDecorator('price', {
                                        initialValue: data.price,
                                        rules: [{
                                            required: true,
                                            message: '通告现价不能为空',
                                        }],
                                    })(
                                        <InputNumber disabled min={0} precision={2} step={100} style={{width: "100%"}} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={6}>
                                <FormItem className="name" label="付费设置：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.isCharge ? 1 : 2,
                                        rules: [{
                                            required: true,
                                            message: '付费不能为空',
                                        }],
                                    })(
                                        <RadioGroup disabled buttonStyle="solid">
                                            <Radio.Button value={1} style={{marginRight: "20px", borderRadius: "4px"}}>收费</Radio.Button>
                                            <Radio.Button value={2} style={{marginRight: "20px", borderRadius: "4px"}}>免费</Radio.Button>
                                        </RadioGroup>                                       
                                    )}
                                </FormItem>                                
                            </Col>
                            <Col span={8}>
                                <FormItem className="chapterChoose" label="">
                                    从 {getFieldDecorator('chapter', {
                                        initialValue: data.isCharge ? data.chargeJointCount : '',
                                        rules: [{
                                            required: true,
                                            message: '章节不能为空',
                                        }],
                                    })(
                                        <InputNumber disabled min={0} precision={0} step={100} style={{width: "40%",marginTop: "6px"}} placeholder="请输入正整数" />
                                    )} 节开始收费
                                </FormItem>
                            </Col>
                            <Col span={2}></Col>
                            <Col span={8}>
                                <FormItem className="originalPrice" label="服务费：">
                                    {getFieldDecorator('fee', {
                                        initialValue: data.fee,
                                        rules: [{
                                            required: true,
                                            message: '服务费不能为空',
                                        }],
                                    })(
                                        <InputNumber disabled min={0} precision={2} step={100} style={{width: "100%"}} />
                                    )}
                                </FormItem>
                            </Col>
                            <div className="ant-line"></div>
                        </Row>
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">通告详情</h4>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem className="characteristic" label="通告简介：">
                                    {getFieldDecorator('characteristic', {
                                        initialValue: data.characteristic,
                                        rules: [{
                                            required: true,
                                            message: '通告简介不能为空',
                                        }],
                                    })(                                        
                                        <div className="courseDescription" style={{border: "1px solid #e5e3e0",padding: "10px"}} dangerouslySetInnerHTML={{__html: data.characteristic}}></div>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>                        
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">购买须知</h4>
                        <FormItem className="tips longItem" label="购买说明：">
                            {getFieldDecorator('tips', {
                                initialValue: data.tips,
                                rules: [{
                                    required: true,
                                    message: '购买须知不能为空',
                                }],
                            })(
                                <TextArea 
                                    disabled
                                    style={{resize: "none"}} 
                                    placeholder="请填写通告购买须知"
                                    autosize={{minRows: 5, maxRows: 10}}/>
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <FormItem className="warmPrompt longItem" label="温馨提示：">
                            {getFieldDecorator('warmPrompt', {
                                rules: [{
                                    required: true,
                                    message: '温馨提示不能为空',
                                }],
                                initialValue: data.warmPrompt || "如需要发票，请您在上课前向机构咨询",
                            })(
                                <TextArea 
                                    disabled
                                    style={{resize: "none"}} 
                                    placeholder="如需要发票，请您在上课前向机构咨询"
                                    autosize={{minRows: 5, maxRows: 5}}/>
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <FormItem className="official longItem" label="官方说明：">
                            {getFieldDecorator('official', {
                                rules: [{
                                    required: true,
                                    message: '官方说明不能为空',
                                }],
                                initialValue: data.official || "为保障您的权益，建议使用淘儿学线上支付，若使用其他支付方式导致纠纷，淘儿学不承担任何责任，感谢您的理解和支持！"
                            })(
                                <TextArea 
                                    disabled
                                    style={{resize: "none"}} 
                                    placeholder="为保障您的权益，建议使用淘儿学线上支付，若使用其他支付方式导致纠纷，淘儿学不承担任何责任，感谢您的理解和支持！"
                                    autosize={{minRows: 5, maxRows: 5}}/>
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">课时安排</h4>
                        <Row gutter={24}>
                            {tempVideoList}                           
                        </Row>                       
                    </Form>
                </div>
            </Modal>
        );
    }
);

// 通告详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        loading: true,        
        // 通告课时列表
        videoList: [],
        // 通告基本信息
        data: "",
    };

    // 获取通告基本信息
    getData = () => {
        noticeDetail({id: this.props.id}).then((json) => {
            if (json.data.result === 0) {                   
                this.setState({
                    loading: false,
                    data: json.data.data,
                    videoList: json.data.data.lesson
                });
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {this.errorHandle(err);});
    };

    showModal = () => {        
        this.getData();
        this.setState({visible: true})
    };

    handleCancel = () => {
        this.setState({
            visible: false,
            loading: true,           
            // 通告课时列表
            videoList: [],
            // 通告基本信息
            data: "",
        });
    };

    // 异常处理
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
    
    // 错误处理
    errorHandle = (err) => {
        message.error("保存失败");
        this.setState({loading: false});
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

// 通告列表
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
        // 列配置
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: 70,
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '通告名称',
                dataIndex: 'name',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '通告时间',
                dataIndex: 'nickname',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'nickname'),
            },
            {
                title: '状态',
                dataIndex: 'status',
                width: '5%',
                render: (text, record) => this.renderColumns(text, record, 'status'),
            },
            {
                title: '报名人数',
                dataIndex: 'signNum',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'signNum'),
            },
            {
                title: '展示城市',
                dataIndex: 'city',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'city'),
            },
            {
                title: '创建人',
                dataIndex: 'createUser',
                width: '8%',                
                render: (text, record) => this.renderColumns(text, record, 'createUser'),
            },
            {
                title: '浏览量',
                dataIndex: 'viewNum',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'viewNum'),
            },
            {
                title: '创建日期',
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
                            {/*通告详情*/}
                            <ItemDetails 
                                id={record.id}
                                opStatus={this.props.opObj.select}
                                toLoginPage={this.props.toLoginPage}/>
                            {/*通告编辑*/}
                            <ItemEdit 
                                id={record.id} 
                                recapture={this.getData}
                                opStatus={this.props.opObj.modify}
                                toLoginPage={this.props.toLoginPage}/>
                            {/*往期回顾*/}
                            <ItemPassReview 
                                id={record.id} 
                                recapture={this.getData}
                                opStatus={this.props.opObj.modify}
                                toLoginPage={this.props.toLoginPage}/>
                            {/*通告下架*/}
                            {/*<Popconfirm 
                                title={record.status === "上架" ? "确认下架?" : "确认上架?"}
                                placement="topRight"
                                onConfirm={() => this.itemBan(record.id, record.status)}
                                onCancel=""
                                okType="danger"
                                okText="确认"
                                cancelText="取消">
                                <a style={{display: this.props.opObj.putAway ? "inline" : "none"}}>{record.status === "上架" ? "下架" : "上架"}</a>
                            </Popconfirm>*/}
                            {/*通告结束*/}
                            <Popconfirm 
                                title="结束"
                                placement="topRight"
                                onConfirm={() => this.itemOver(record.id)}
                                onCancel=""
                                okType="danger"
                                okText="确认"
                                cancelText="取消">
                                <a>结束</a>
                            </Popconfirm>
                            {/*教师管理*/}
                            <Link 
                                to={"./sign-list/" + record.id + "/" + record.name}
                                style={{display: this.props.opObj.select ? "inline" : "none"}}>报名名单</Link>
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
            cityId: keyword ? keyword.cityCode : this.props.keyword.cityCode,
            status: keyword ? keyword.status : this.props.keyword.status,
            name: keyword ? keyword.noticeName : this.props.keyword.noticeName,
            startTime: keyword ? keyword.startTime : this.props.keyword.startTime,
            endTime: keyword ? keyword.endTime : this.props.keyword.endTime,                
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize
        };
        noticeList(params).then((json) => {
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
                    // 通告状态
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
                })
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {this.errorHandle(err);});
    };

    // 通告结束
    itemOver = (id) => {
        this.setState({loading: true});        
        noticeOver({id: id}).then((json) => {
            if (json.data.result === 0) {
                message.success("通告结束成功");
                this.getData();
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {this.errorHandle(err);});
    };

    // 异常处理
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

    // 错误处理
    errorHandle = () => {
        message.error("保存失败");
        this.setState({loading: false});
    };

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
        return <Table 
                    bordered
                    scroll={{ x: 1500 }}                    
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    columns={this.columns}
                    onChange={this.handleTableChange}/>;
    }
}

// 通告
class NotificationManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 通告权限
            opObj: {
                add: true,
                copy: true,
                select: true,
                modify: true,
                putAway: true,
            },
            // 获取通告列表所需关键词
            keyword: {
                cityCode: null,
                status: 0,
                noticeName: '',
                startTime: "",
                endTime: "",
            },
            startValue: null,
            endValue: null,
            flag_add: false,
            mapObj: {},// 地图控件对象
            provinceList: [],// 省市列表
        };
        this.optionsOfCity = [{value: "0", label: "全国"}];
        this.optionsStatus = [
            <Option key={0}>全部</Option>,
            <Option key={1}>未开始</Option>,
            <Option key={2}>进行中</Option>,
            <Option key={2}>已结束</Option>,
        ];     
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

    // 获取省市列表信息及当前城市地区代码
    getMapDate = () => {
        this.setState({
            mapObj: new window.AMap.Map('notice-mapContainer')
        }, () => {
            // 获取省区列表
            this.state.mapObj.plugin('AMap.DistrictSearch', () => {
                var districtSearch = new window.AMap.DistrictSearch({
                    level: 'country',
                    subdistrict: 2 // 1:省，2:市，3:区，4:街道
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
    
    // 设置展示城市
    setCity = (value) => {
        this.setState({
            keyword: {
                cityCode: value[1],
                status: this.state.keyword.status,                
                noticeName: this.state.keyword.noticeName,
                startTime: this.state.keyword.startTime,
                endTime: this.state.keyword.endTime,
            }
        });
    };

    // 设置状态
    setStatus = (value) => {
        this.setState({
            keyword: {
                cityCode: this.state.keyword.cityCode,
                status: value,                
                noticeName: this.state.keyword.noticeName,
                startTime: this.state.keyword.startTime,
                endTime: this.state.keyword.endTime,
            }
        })
    };

    // 搜索及通告名称设置
    search = (type, value) => {
        this.setState({
            keyword: {
                cityCode: this.state.keyword.cityCode,
                status: this.state.keyword.status,
                noticeName: value,
                startTime: this.state.keyword.startTime,
                endTime: this.state.keyword.endTime,
            }
        });
    };
    
    
    // 设置开始时间
    setStartTime = (date, dateString) => {
        this.setState({
            startValue: date,
            keyword: {                
                cityCode: this.state.keyword.cityCode,
                status: this.state.keyword.status,
                noticeName: this.state.keyword.noticeName,
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
                cityCode: this.state.keyword.cityCode,
                status: this.state.keyword.status,
                noticeName: this.state.keyword.noticeName,
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

    componentWillMount() {
        this.getMapDate();
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
                                {/*展示城市筛选*/}
                                <Cascader 
                                    className="star-select" 
                                    options={this.optionsOfCity} 
                                    onChange={this.setCity} 
                                    placeholder="请选择展示城市"/>
                                {/*状态筛选*/}
                                <Select 
                                    className="star-select" 
                                    onChange={this.setStatus} 
                                    placeholder="请选择状态" 
                                    allowClear>
                                    {this.optionsStatus}
                                </Select>
                                {/*通告名筛选*/}
                                <Search 
                                    onSearch={(value) => this.search(value)} 
                                    enterButton className="star-search" 
                                    placeholder="请输入通告名称"/>
                                {/*通告创建日期筛选*/}
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
                                {/*通告添加按钮*/}
                                <div className="star-add-button">
                                    <ItemAdd
                                        opStatus={this.state.opObj.add}
                                        provinceList={this.state.provinceList}
                                        disabledStartDate={this.disabledStartDate}
                                        disabledEndDate={this.disabledEndDate}
                                        recapture={this.setFlag}
                                        toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            {/*通告列表*/}
                            <div className="table-box">                                
                                <DataTable                                    
                                    opObj={this.state.opObj}
                                    keyword={this.state.keyword}
                                    flag_add={this.state.flag_add}
                                    toLoginPage={this.toLoginPage}/>
                            </div>
                            <div id="notice-mapContainer"/>
                        </div>
                        :
                        <p>暂无查询权限</p>                        
                }
            </div>
        )
    }
}

export default NotificationManage;