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
    Spin
} from 'antd';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';
import moment from 'moment';
import { configUrl, getToken, noticeList, addNotice, updateNotice, noticeDetail, NewestNotice, noticeOver, pastReviewDetail, saveOrUpdatePastReview, signList, typeList } from '../../config';
import { toLoginPage, noticeOptions, noticeStatus, pCAName, getPower, countdown, picUpload, removeTag, checkRiches, exceptHandle, errorHandle} from '../../config/common';

const Search = Input.Search;
const FormItem = Form.Item;
const {TextArea} = Input;
const {Option} = Select;
const RadioGroup = Radio.Group;

const dateFormat = "YYYY-MM-DD HH:mm:ss";
const riches = '';

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

// 新增、复制通告表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, keepAddNotice, provinceList, allTypeList, form, data, setEndTime, disabledStartDate, disabledEndDate, mapObj, formattedAddress, setXY, setAddressComponent, reqwestUploadToken, viewPic, picUpload01, photoLoading, confirmLoading} = props;
        const {getFieldDecorator, setFieldsValue} = form;

        // 城市选项生成
        const optionsOfCity = pCAName(provinceList, data.cityId).optionsOfCity;
        let currentCity = pCAName(provinceList, data.cityId).currentCity;

        // 分类选项生成
        const optionsOfType =[]
        if (allTypeList.length) {
            allTypeList.forEach((item, index) => {
                optionsOfType.push(<Option key={item.id} value={item.id}>{item.name}</Option>)
            });
        }

        //地理编码
        const toXY = (para) => {
            console.log(para);
            mapObj.plugin('AMap.Geocoder', function () {
                const geocoder = new window.AMap.Geocoder({});
                const marker = new window.AMap.Marker({
                    map: mapObj,
                    bubble: true
                });
                geocoder.getLocation(para, (status, result) => {
                    if (status === 'complete' && result.info === 'OK') {
                        result.geocodes[0].addressComponent.adcode = result.geocodes[0].adcode;                       
                        setXY({x: result.geocodes[0].location.lng, y: result.geocodes[0].location.lat});
                        setFieldsValue({"address": result.geocodes[0].formattedAddress});
                        setAddressComponent(result.geocodes[0].addressComponent);
                        marker.setPosition(result.geocodes[0].location);
                        mapObj.setCenter(marker.getPosition())
                    } else {
                        message.error("经纬度获取失败，请输入详细地点")
                    }
                });
            });
        };

        const setStartTime = (date, dateString) => {           
            setFieldsValue({"time":  dateString});            
        };

        // 图片相关
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
                title="添加通告"
                width={1000}
                onCancel={onCancel}
                footer={[
                    <Button key="back" onClick={onCancel} disabled={confirmLoading}>取消</Button>,
                    <Button key="submit" type="primary" loading={confirmLoading} onClick={() => onCreate()}>确定</Button>
                ]}
                maskClosable={false}
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
                                        <Input allowClear placeholder="请填写通告标题（18字以内）"/>
                                    )}
                                </FormItem>                                
                            </Col>
                            <Col span={8}>                                
                                <FormItem className="cityId" label="展示城市：">
                                    {getFieldDecorator('cityId', {
                                        initialValue: data.cityId ? currentCity : ["0"],
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
                                        initialValue: data.beginDate,
                                        rules: [{
                                            required: true,
                                            message: '开始时间不能为空',                                            
                                        }],
                                    })(
                                        <div className="efficiencyTime">
                                            <DatePicker 
                                                onChange={setStartTime}
                                                defaultValue={data.beginDate ? moment(data.beginDate, dateFormat): null}
                                                format={dateFormat}
                                                disabledDate={disabledStartDate}
                                                showTime
                                                style={{width: "180px"}}
                                                placeholder="请选择开始日期"/>
                                            <span style={{margin: "0 10px"}}>至</span>
                                            <DatePicker
                                                onChange={setEndTime}
                                                defaultValue={data.endDate ? moment(data.endTime, dateFormat): null}
                                                format={dateFormat}
                                                disabledDate={disabledEndDate}
                                                showTime
                                                style={{width: "180px"}}
                                                placeholder="请选择结束日期"/>
                                            <span style={{margin: "0 10px",fontSize: "12px"}}><Icon type="alert" /> 结束时间不填则表示长期有效</span>
                                        </div>
                                    )}
                                </FormItem>                                
                            </Col>
                            <Col span={8}>
                                <FormItem className="type"  label="类型：">
                                    {getFieldDecorator('type', {
                                        initialValue: data.type,                                      
                                        rules: [{
                                            required: true,
                                            message: '类型未选择',
                                        }],
                                    })(
                                        <Select placeholder="请选择类型">
                                            {optionsOfType}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={16}>
                                <FormItem className="location"  label="地点：">
                                    {getFieldDecorator('address', {
                                        initialValue: data.address,                                      
                                        rules: [{
                                            required: true,
                                            message: '通告地点不能为空',                                            
                                        }],
                                    })(
                                        <Input onBlur={(event) => toXY(event.target.value)} allowClear placeholder="请填写地点" />
                                    )}
                                </FormItem>
                            </Col>
                            {/*<p onClick={location}
                               style={{width: "120px", marginLeft: "100px", cursor: "pointer"}}>点击获取当前坐标</p>*/}
                            <div id="add-notice-container" name="container" tabIndex="0"/>
                        </Row>
                        <div className="ant-line"></div>
                        <Row>
                            <Col span={10}>
                                <FormItem className="photo" label="通告图片：">
                                    {getFieldDecorator('photo', {
                                        initialValue: viewPic,
                                        rules: [{
                                            required: true,
                                            message: '请上传通告图片',
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
                        <FormItem className="claim" label="要求：">
                            {getFieldDecorator('claim', {
                                initialValue: data.description,
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
            data: {}, // 通告基本信息
            allTypeList: [],
            startValue: null,
            endValue: null,
            startTime: null,
            endTime: null,
            mapObj: {},
            formattedAddress: "",
            xy: {},
            addressComponent: {},                  
            uploadToken: '',// 上传Token
            viewPic: "",
            photoLoading: false,
            keepData: [],
            loading: false // 提交按钮状态变量
        };
    }

    // 设置开始时间
    setStartTime = (date, dateString) => {
        // console.log(date)
        // console.log(dateString)
        this.setState({
            startValue: date,
            startTime: dateString
        });
        return dateString;
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

    getTypeList = () => {
        typeList({
            pageNum: 1,
            pageSize: 20,
        }).then((json) => {
            if (json.data.result === 0) {
                console.log(json.data.data)
                this.setState({
                    allTypeList: json.data.data.list                   
                });
            } else {
                this.expectHandle(json.data);
            }
        }).catch((err) => this.errorHandle(err));
    };

    // 获取通告基本信息
    getData = () => {
        NewestNotice().then((json) => {
            if (json.data.result === 0) {
                this.setState({// 信息写入
                    visible: true,
                    data: json.data.data,
                    viewPic: json.data.data.photo,
                    xy: {
                        x: json.data.data.lng,
                        y: json.data.data.lat
                    },
                    // keepData: [json.data.data]                 
                }, () => {
                    this.map();
                });
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {this.errorHandle(err);});
    };

    showModal = (props, event) => {
        this.getTypeList(); // 分类选项
        if (props === 1) {// 复制通告           
            this.getData();
        } else if (props === 2) {
            this.setState({
                data: {},
                visible: true
            }, () => {
                this.map();
            });
        }
    };

    map = () => {
        setTimeout(() => {
            this.setState({
                mapObj: new window.AMap.Map('add-notice-container', {
                    resizeEnable: true,
                    zoom: 16,
                    center: [120.00485, 30.292234]
                })
            }, () => {
                window.AMap.service('AMap.Geocoder', () => {
                    const geocoder = new window.AMap.Geocoder({});
                    this.state.mapObj.on('click', (e) => {
                        this.setXY({x: e.lnglat.lng, y: e.lnglat.lat});
                        geocoder.getAddress([e.lnglat.lng, e.lnglat.lat], (status, result) => {
                            if (status === 'complete' && result.info === 'OK') {
                                this.setFormattedAddress(result.regeocode.formattedAddress);
                                this.setAddressComponent(result.regeocode.addressComponent);
                            }
                        });
                    });
                })
            })
        }, 500);
    };

    setXY = (para) => {
        this.setState({xy: para});
    };

    setFormattedAddress = (para) => {
        this.setState({formattedAddress: para});
    };

    setAddressComponent = (para) => {
        this.setState({
            addressComponent: {
                provinceName: para.province,
                cityName: para.city,
                areaName: para.district,
                areaId: para.adcode
            }
        });
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

    // 取消处理
    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false
        }, () => {
            this.setState({
                data: {},
                allTypeList: [],
                startValue: null,
                endValue: null,
                startTime: null,
                endTime: null,
                mapObj: {},
                formattedAddress: "",
                xy: {},
                addressComponent: {},
                uploadToken: '',// 上传Token
                viewPic: "",
                photoLoading: false,
                keepData: [],
                loading: false
            });
            form.resetFields();
        });
    };

    keepAddNotice = () => {
        const form = this.form; 
        const {keepData, viewPic} = this.state;               
        form.validateFieldsAndScroll((err, values) => {// 获取表单数据并进行必填项校验
            if (err) {return;} 
            // 图片校验
            values.photo = viewPic;
            if (!values.photo) {
                message.error("图片未提交");
                return
            }
            if (values.photo && viewPic) {
                values.photo = viewPic.slice(configUrl.photoUrl.length);
            }          
            // 省市区名称
            let currentCityName = pCAName(this.props.provinceList, values.cityId[1]).currentCityName;
            console.log(currentCityName)
            
            keepData.push({
                name: values.courseName,
                provinceId: values.cityId[0],
                provinceName: values.cityId[0] === "0" ? '全国' : currentCityName[0],
                cityId: values.cityId[1] || values.cityId[0],
                cityName: values.cityId[0] === "0" ? '全国'  : (currentCityName[1] || currentCityName[0]),
                beginDate: values.time,
                endDate: this.state.endTime,
                type: values.type,
                address: values.address,
                lat: this.state.xy.lat,
                lng: this.state.xy.lng,
                photo: values.photo,
                description: values.claim,                
            })
            form.resetFields();
            message.info('数据已暂存，请继续添加')

            this.setState({
                keepData: keepData,
                viewPic: '',
                endValue: null,
                endTime: null
            }, () => {
                console.log(this.state.keepData);
            });
            console.log(999999999)
            console.log(keepData)            
        });
        console.log(keepData)
        return keepData;
    };

    // 确认处理
    handleCreate = () => {
        const data = this.keepAddNotice();
        console.log(data)
        if (data.length) {
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
        }        
    };

    // 异常处理
    exceptHandle = (json) => {
        if (json.code === 901) {
            message.error("请先登录");            
            this.props.toLoginPage();// 返回登陆页
        } else if (json.code === 902) {
            message.error("登录信息已过期，请重新登录");            
            this.props.toLoginPage();// 返回登陆页
        } else if (json.code === 1206) {// 判断没有添加数据时，提示信息                    
            this.countDown();
        } else {
            message.error(json.message);
            this.setState({loading: false});
        }
    };
    
    // 错误处理
    errorHandle = (err) => {
        message.error(err.message);
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
                    startTime={this.state.starTime}
                    setStartTime={this.setStartTime}
                    setEndTime={this.setEndTime}
                    disabledStartDate={this.disabledStartDate}
                    disabledEndDate={this.disabledEndDate}
                    mapObj={this.state.mapObj}
                    formattedAddress={this.state.formattedAddress}
                    setXY={this.setXY}
                    setAddressComponent={this.setAddressComponent}
                    reqwestUploadToken={this.reqwestUploadToken}
                    viewPic={this.state.viewPic}
                    picUpload01={this.picUpload01}
                    photoLoading={this.state.photoLoading}
                    confirmLoading={this.state.loading}/>             
            </div>
        );
    }
}

// 通告编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, provinceList, allTypeList, form, data, startTime, setEndTime, disabledStartDate, disabledEndDate, mapObj, formattedAddress, setXY, setAddressComponent, reqwestUploadToken, viewPic, picUpload01, photoLoading, confirmLoading} = props;
        const {getFieldDecorator, setFieldsValue} = form;

        // 城市选项生成
        const optionsOfCity = pCAName(provinceList, data.cityId).optionsOfCity;
        let currentCity = pCAName(provinceList, data.cityId).currentCity;

        // 分类选项生成
        const optionsOfType =[]
        if (allTypeList.length) {
            allTypeList.forEach((item, index) => {
                optionsOfType.push(<Option key={item.id} value={item.id}>{item.name}</Option>)
            });
        }

        //地理编码
        const toXY = (para) => {
            console.log(para);
            mapObj.plugin('AMap.Geocoder', function () {
                const geocoder = new window.AMap.Geocoder({});
                const marker = new window.AMap.Marker({
                    map: mapObj,
                    bubble: true
                });
                geocoder.getLocation(para, (status, result) => {
                    if (status === 'complete' && result.info === 'OK') {
                        result.geocodes[0].addressComponent.adcode = result.geocodes[0].adcode;                        
                        setXY({x: result.geocodes[0].location.lng, y: result.geocodes[0].location.lat});
                        setFieldsValue({"address": result.geocodes[0].formattedAddress});
                        setAddressComponent(result.geocodes[0].addressComponent);
                        marker.setPosition(result.geocodes[0].location);
                        mapObj.setCenter(marker.getPosition())
                    } else {
                        message.error("经纬度获取失败，请输入详细地点")
                    }
                });
            });
        };
        
        const setStartTime = (date, dateString) => {
            setFieldsValue({"time": dateString});            
        };

        // 图片相关
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
                title="编辑通告"
                width={1000}
                onCancel={onCancel}
                footer={[
                    <Button key="back" onClick={onCancel} disabled={confirmLoading}>取消</Button>,
                    <Button key="submit" type="primary" loading={confirmLoading} onClick={() => onCreate()}>确定</Button>
                ]}
                maskClosable={false}
                destroyOnClose={true}>
                {
                    JSON.stringify(data) === '{}' ?
                        <div className="spin-box">
                            <Spin/>
                        </div>
                        :
                        <div className="course-add course-form item-form quality-course-form notice-form">
                            <Form layout="vertical">
                                <h4 className="add-form-title-h4">基础信息</h4>
                                <Row gutter={24}>
                                    <Col span={16}>
                                        <FormItem className="courseName"  label="通告名称：">
                                            {getFieldDecorator('name', {
                                                initialValue: data.name,                                      
                                                rules: [{
                                                    required: true,
                                                    message: '通告名称不能为空',
                                                    max: 18
                                                }],
                                            })(
                                                <Input allowClear placeholder="请填写通告标题（18字以内）"/>
                                            )}
                                        </FormItem>                                
                                    </Col>
                                    <Col span={8}>                                
                                        <FormItem className="cityId" label="展示城市：">
                                            {getFieldDecorator('cityId', {
                                                initialValue: data.cityId === 0 ? ["0"] : currentCity,
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
                                                initialValue: data.beginDate,
                                                rules: [{
                                                    required: true,
                                                    message: '开始时间不能为空',                                            
                                                }],
                                            })(
                                                <div className="efficiencyTime">
                                                    <DatePicker 
                                                        onChange={setStartTime}
                                                        // 时间回显有问题显示不出来(data.beginDate 刚开始undefined，最后才有数据)
                                                        defaultValue={data.beginDate ? moment(data.beginDate, dateFormat) : ''}
                                                        format={dateFormat}                                                
                                                        disabledDate={disabledStartDate}
                                                        showTime
                                                        style={{width: "180px"}}
                                                        placeholder="请选择开始日期"/>
                                                    <span style={{margin: "0 10px"}}>至</span>
                                                    <DatePicker
                                                        onChange={setEndTime}
                                                        defaultValue={data.endDate ? moment(data.endDate, dateFormat) : null}
                                                        format={dateFormat}
                                                        disabledDate={disabledEndDate}
                                                        showTime
                                                        style={{width: "180px"}}
                                                        placeholder="请选择结束日期"/>
                                                    <span style={{margin: "0 10px",fontSize: "12px"}}><Icon type="alert" /> 结束时间不填则表示长期有效</span>
                                                </div>
                                            )}
                                        </FormItem>                                
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="type"  label="类型：">
                                            {getFieldDecorator('type', {
                                                initialValue: data.type,                                      
                                                rules: [{
                                                    required: true,
                                                    message: '类型未选择',
                                                }],
                                            })(
                                                <Select placeholder="请选择类型">
                                                    {optionsOfType}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={16}>
                                        <FormItem className="location"  label="地点：">
                                            {getFieldDecorator('address', {
                                                initialValue: data.address,                                      
                                                rules: [{
                                                    required: true,
                                                    message: '通告地点不能为空',                                            
                                                }],
                                            })(
                                                <Input onBlur={(event) => toXY(event.target.value)} allowClear placeholder="请填写地点" />
                                            )}
                                        </FormItem>
                                    </Col>
                                    {/*<p onClick={location}
                                       style={{width: "120px", marginLeft: "100px", cursor: "pointer"}}>点击获取当前坐标</p>*/}
                                    <div id="add-notice-container" name="container" tabIndex="0"/>
                                </Row>
                                <div className="ant-line"></div>
                                <Row>
                                    <Col span={10}>
                                        <FormItem className="photo" label="通告图片：">
                                            {getFieldDecorator('photo', {
                                                initialValue: viewPic,
                                                rules: [{
                                                    required: true,
                                                    message: '请上传通告图片',
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
                                <FormItem className="claim" label="要求：">
                                    {getFieldDecorator('description', {
                                        initialValue: data.description,
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
                            </Form>
                        </div>
                }
                
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
            data: {}, // 通告基本信息                   
            allTypeList: [],
            startValue: null,
            endValue: null,
            startTime: null,
            endTime: null,
            mapObj: {},
            formattedAddress: "",
            xy: {},
            addressComponent: {},                  
            uploadToken: '',// 上传Token
            viewPic: "",
            photoLoading: false,
            keepData: [],
            loading: false // 提交按钮状态变量                  
        };        
    }
    // 设置开始时间
    setStartTime = (date, dateString) => {
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

    getTypeList = () => {
        typeList({
            pageNum: 1,
            pageSize: 20,
        }).then((json) => {
            if (json.data.result === 0) {
                console.log(json.data.data)
                this.setState({
                    allTypeList: json.data.data.list                   
                });
            } else {
                this.expectHandle(json.data);
            }
        }).catch((err) => this.errorHandle(err));
    };

    // 获取通告基本信息
    getData = () => {
        noticeDetail({id: this.props.id}).then((json) => {
            if (json.data.result === 0) {
                this.setState({
                    data: json.data.data,
                    viewPic: json.data.data.photo,
                    startTime: json.data.data.beginDate,
                    endTime: json.data.data.endDate,                    
                    xy: {
                        x: json.data.data.lng,
                        y: json.data.data.lat
                    },
                    keepData: [json.data.data]
                }, () => {
                    console.log(this.state.keepData)
                });

            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => {this.errorHandle(err);});
    };

    showModal = () => {
        this.getTypeList();
        this.getData();       
        this.setState({visible: true}, () => {
            this.map();
        });
    };

    map = () => {
        setTimeout(() => {
            this.setState({
                mapObj: new window.AMap.Map('add-notice-container', {
                    resizeEnable: true,
                    zoom: 16,
                    center: [120.00485, 30.292234]
                })
            }, () => {
                window.AMap.service('AMap.Geocoder', () => {
                    const geocoder = new window.AMap.Geocoder({});
                    this.state.mapObj.on('click', (e) => {
                        this.setXY({x: e.lnglat.lng, y: e.lnglat.lat});
                        geocoder.getAddress([e.lnglat.lng, e.lnglat.lat], (status, result) => {
                            if (status === 'complete' && result.info === 'OK') {
                                this.setFormattedAddress(result.regeocode.formattedAddress);
                                this.setAddressComponent(result.regeocode.addressComponent);
                            }
                        });
                    });
                })
            })
        }, 500);
    };

    setXY = (para) => {
        this.setState({xy: para});
    };

    setFormattedAddress = (para) => {
        this.setState({formattedAddress: para});
    };

    setAddressComponent = (para) => {
        this.setState({
            addressComponent: {
                provinceName: para.province,
                cityName: para.city,
                areaName: para.district,
                areaId: para.adcode
            }
        });
    };   

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

    // 取消处理
    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false
        }, () => {
            this.setState({
                data: {},
                allTypeList: [],
                startValue: null,
                endValue: null,
                startTime: null,
                endTime: null,
                mapObj: {},
                formattedAddress: "",
                xy: {},
                addressComponent: {},
                uploadToken: '',// 上传Token
                viewPic: "",
                photoLoading: false,
                keepData: [],
                loading: false
            });
            form.resetFields();
        });
    };

    // 确认处理
    handleCreate = () => {
        const form = this.form;        
        form.validateFieldsAndScroll((err, values) => {// 获取表单数据并进行必填项校验
            if (err) {return;}
            // 广告图片校验
            values.photo = this.state.viewPic;
            if (!values.photo) {
                message.error("图片未提交");
                return
            }
            if (values.photo && this.state.viewPic) {
                values.photo = this.state.viewPic.slice(configUrl.photoUrl.length);
            }          
            // 省市区名称
            let currentCityName = pCAName(this.props.provinceList, values.cityId[1]).currentCityName;
            console.log(currentCityName)
            console.log(values.time)
            const result = {
                id: this.props.id,
                name: values.name,
                provinceId: values.cityId[0],
                provinceName: values.cityId[0] === "0" ? '全国' : currentCityName[0],
                cityId: values.cityId[1] || values.cityId[0],
                cityName: values.cityId[0] === "0" ? '全国'  : (currentCityName[1] || currentCityName[0]),
                beginDate: values.time,
                endDate: this.state.endTime,
                type: values.type,
                address: values.address,
                lng: this.state.xy.x,
                lat: this.state.xy.y,
                photo: values.photo,              
                description: values.description,
            };

            this.setState({loading: true});
            updateNotice(result).then((json) => {
                if (json.data.result === 0) {
                    message.success("编辑通告成功");
                    this.handleCancel();
                    this.props.recapture();                            
                } else {
                    exceptHandle(this, json.data);
                }
            }).catch((err) => errorHandle(this, err));
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
        message.error(err.message);
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
                    startTime={this.state.starTime}                    
                    setEndTime={this.setEndTime}
                    disabledStartDate={this.disabledStartDate}
                    disabledEndDate={this.disabledEndDate}
                    mapObj={this.state.mapObj}
                    formattedAddress={this.state.formattedAddress}
                    setXY={this.setXY}
                    setAddressComponent={this.setAddressComponent}
                    reqwestUploadToken={this.reqwestUploadToken}
                    viewPic={this.state.viewPic}
                    picUpload01={this.picUpload01}
                    photoLoading={this.state.photoLoading}
                    confirmLoading={this.state.loading}/>                
            </a>
        );
    }
}

// 通告往期回顾表单
const ItemPassReviewForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data,  confirmLoading} = props;
        const {subVisible, onSubCancel, onSubCreate, showSubModal, columns, subData, selectedRowKeys, selectedRows, setPicList, onSelectChange, pagination, handleTableChange, subConfirmLoading} = props;
        const {getFieldDecorator} = form;

        const rowSelection = {
            selectedRowKeys,
            selectedRows,
            onChange: onSelectChange,
        };

        // 已选择童星列表
        console.log(selectedRows)
        const starExist = [];
        if (selectedRows.length) {
            console.log(selectedRows)
            selectedRows.forEach((item, index) => {
                starExist.push(
                    <Col span={6} key={index + 1}>
                        <div className="photoExist-item clearfix" key={index + 1}>
                            <img src={configUrl.photoUrl+item.photo} alt=""/>
                            <div style={{textAlign: "center"}}>{item.name}</div>
                            <div className="remove">
                                <Button type="dashed" shape="circle" icon="minus" onClick={() => setPicList(index)}/>
                            </div>
                        </div>
                    </Col> 
                )
            });
        }

        return (
            <Modal
                visible={visible}
                title="往期回顾"
                width={1000}
                onCancel={onCancel}
                footer={[
                    <Button key="back" onClick={onCancel} disabled={confirmLoading}>取消</Button>,
                    <Button key="submit" type="primary" loading={confirmLoading} onClick={() => onCreate(2)}>确定</Button>
                ]}
                maskClosable={false}
                destroyOnClose={true}>
                <div className="pass-review-form">
                    <Form layout="vertical">
                        <h4 className="add-form-title-h4">基础信息</h4>
                        <FormItem className="backgroundDesc" label="背景：">
                            {getFieldDecorator('backgroundDesc', {
                                initialValue: data.backgroundDesc,
                                rules: [{
                                    required: true,
                                    message: '填写背景说明不能为空',
                                }],
                            })(
                                <TextArea 
                                    style={{resize: "none"}} 
                                    placeholder="请填写填写背景说明"
                                    autosize={{minRows: 5, maxRows: 10}}/>
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <FormItem className="description" label="详情：">
                            {getFieldDecorator('description', {
                                initialValue: data.description,
                                rules: [{
                                    required: true,
                                    message: '详情不能为空',
                                }]                                
                            })(
                                <TextArea 
                                    style={{resize: "none"}} 
                                    placeholder="请填写填写详细说明"
                                    autosize={{minRows: 5, maxRows: 5}}/>
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <FormItem className="sketch" label="精彩回顾：">
                            {getFieldDecorator('wonderfulReview', {
                                initialValue: data.wonderfulReview,
                                rules: [{
                                    required: true,
                                    // message: '精彩回顾不能为空'
                                    validator: checkRiches                                  
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
                        <h4 className="add-form-title-h4">受邀童星</h4>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem className="certification"  label="童星列表：">
                                    {getFieldDecorator('photo', {
                                        initialValue: selectedRows,
                                        rules: [{
                                            required: true,
                                            message: '请选择童星',
                                        }],
                                    })(
                                        <div className="itemBox">                                            
                                            <Button type="primary" onClick={() => {showSubModal()}} style={{marginLeft: 10}}>选择童模</Button>
                                            <div className="ant-line"></div>
                                            <Modal
                                                visible={subVisible}
                                                title="选择童模"
                                                width={600}
                                                onCancel={onSubCancel}
                                                footer={[
                                                    <Button key="back" onClick={onSubCancel} disabled={subConfirmLoading}>取消</Button>,
                                                    <Button key="submit" type="primary" loading={subConfirmLoading} onClick={() => onSubCreate()}>确定</Button>
                                                ]}
                                                maskClosable={false}
                                                destroyOnClose={true}>
                                                <Table 
                                                    bordered
                                                    rowSelection={rowSelection} 
                                                    columns={columns} 
                                                    dataSource={subData} 
                                                    pagination={pagination}
                                                    onChange={handleTableChange}/>
                                            </Modal>
                                            <Row gutter={24}>
                                                {starExist}                                                
                                            </Row>
                                        </div>
                                    )}
                                </FormItem> 
                            </Col>
                        </Row>
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
            // 提交按钮状态变量
            loading: false, 
            subVisible: false,
            subData: [],
            selectedRowKeys: [],
            selectedRows: [],
            subLoading: false,
            pagination: {
                current: 1,
                pageSize: 15,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            },
            subTabloading: false
        };
        this.editor = ""
        this.columns = [
            {
                title: '姓名',
                dataIndex: 'name',
            },
            {
                title: '图片',
                dataIndex: 'photo',
                render: (text, record) => (
                    <div className="hove-photo-scale">
                        <img src={configUrl.photoUrl + record["photo"]} style={{width: '45px', height: "25px"}} alt=""/>
                    </div>
                )
            },            
        ];
    }

    // 获取基本信息
    getData = () => {
        pastReviewDetail({annunciateId: this.props.id}).then((json) => {
            if (json.data.result === 0) {                    
                this.editor.setData(json.data.data.wonderfulReview);// 富文本数据写入
                this.setState({// 信息写入
                    data: json.data.data,
                    // picList: json.data.data.invitedApplyVOList,
                    // viewPic: json.data.data.invitedApplyVOList.length ? json.data.data.invitedApplyVOList[0] : '',
                });
            } else {
                exceptHandle(this, json.data);
            }
        }).catch((err) => errorHandle(this, err));
    };

    showModal = () => {
        this.getData();       
        this.setState({visible: true});      
        setTimeout(()=> {
           this.editor = window.CKEDITOR.replace(document.getElementById('wonderfulReview'));                      
        });
    };

    dataHandle = (data) => {
        const result = [];
        data.forEach((item, index) => {
            result.push({
                key: index + 1,
                id: item.id,
                index: index + 1,
                name: item.name,
                photo: item.modelCard                
            });
        });
        return result;
    };

    // 获取童星基本信息
    getSubData = (keyword) => {
        this.setState({subTabloading: true});
        signList({
            annunciateId: this.props.id,                              
            name: '',
            startTime: '',
            endTime: '',                
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize
        }).then((json) => {
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
                this.setState({
                    subTabloading: false,
                    subData: this.dataHandle(json.data.data.list),
                    pagination: {
                        total: json.data.data.total,
                        current: this.state.pagination.current,
                        pageSize: this.state.pagination.pageSize
                    }
                })
            } else {
                this.exceptHandle(json.data);
            }
        }).catch((err) => this.errorHandle(err));
    };

    showSubModal = () => {
        this.getSubData();
        this.setState({subVisible: true});
    };

    onSelectChange = (selectedRowKeys, selectedRows) => {
        console.log('selectedRows changed: ', selectedRows);
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys, selectedRows});
    };

    // 童模删除
    setPicList = (index) => {
        let {selectedRows} = this.state;
        selectedRows.splice(index, 1);
        this.setState({
            selectedRows: selectedRows
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
                uploadToken: "",              
                viewPic: "",
                picList: [],
                photoLoading: false,
                loading: false,
            });
            this.editor = ""
            form.resetFields();
        });
    };

    handleSubCancel = () => {
        this.setState({
            subVisible: false, 
            subLoading: false,
            subData:[],
            selectedRowKeys: [],
            selectedRows: [],
            subTabloading: false
        });
    };

    handleSubCreate= () => {
        const {selectedRows} = this.state
        if (selectedRows.length === 0) {
            message.error('请选择童模');
            return
        } else {
            this.setState({
                subVisible: false, 
                subLoading: false,
                subData:[],                
                subTabloading: false
            });
        }        
    };

    // 确认处理
    handleCreate = () => {
        const form = this.form;        
        form.validateFieldsAndScroll((err, values) => {// 获取表单数据并进行必填项校验
            // 富文本内容处理
            values.wonderfulReview = removeTag(this.editor.getData());
            console.log(values.wonderfulReview)
            if (err) {return;}

            if (!values.wonderfulReview) {
                message.error('精彩回顾不能为空');
                return;
            }
            let {selectedRows} = this.state;
            let tempApplyId = [];
            if (selectedRows.length) {
                selectedRows.forEach((item) => {
                    tempApplyId.push(item.id)
                })
            }
            
            const result = {
                annunciateId: this.props.id,
                backgroundDesc: values.backgroundDesc,
                description: values.description,
                wonderfulReview: this.editor.getData(),
                applyId: tempApplyId,
            };
            this.setState({loading: true});            
            saveOrUpdatePastReview(result).then((json) => {
                if (json.data.result === 0) {
                    message.success("往期回顾添加或编辑成功");
                    this.handleCancel();
                    this.props.recapture();                            
                } else {
                    exceptHandle(this, json.data);
                }
            }).catch((err) => errorHandle(this, err));
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
        } else if (json.code === 1005) {
            message.error("无数据，请添加");
            this.setState({loading: false});                     
        } else {
            message.error(json.message);
            this.setState({loading: false});
        }
    };
    
    // 错误处理
    errorHandle = (err) => {
        message.error(err.message);
        this.setState({loading: false});
    };

    saveFormRef = (form) => {
        this.form = form;
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
            this.getSubData();
        });
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
                    subVisible={this.state.subVisible}
                    onSubCancel={this.handleSubCancel}
                    onSubCreate={this.handleSubCreate}
                    showSubModal={this.showSubModal}
                    columns={this.columns}
                    subData={this.state.subData}
                    selectedRowKeys={this.state.selectedRowKeys}
                    selectedRows={this.state.selectedRows}
                    onSelectChange={this.onSelectChange}
                    pagination={this.state.pagination}
                    handleTableChange={this.handleTableChange}
                    subConfirmLoading={this.state.subLoading}
                    data={this.state.data}
                    reqwestUploadToken={this.reqwestUploadToken}
                    viewPic={this.state.viewPic}                    
                    picUpload={this.picUpload}
                    picList={this.state.picList}
                    setPicList={this.setPicList}
                    photoLoading={this.state.photoLoading}
                    confirmLoading={this.state.loading}/>                
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
                maskClosable={false}
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
        videoList: [],// 通告课时列表        
        data: "",// 通告基本信息
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
                exceptHandle(this, json.data);
            }
        }).catch((err) => errorHandle(this, err));
    };

    showModal = () => {        
        this.getData();
        this.setState({visible: true})
    };

    handleCancel = () => {
        this.setState({
            visible: false,
            loading: true,
            videoList: [],            
            data: ""
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
                width: '12%',
                render: (text, record) => {
                    return (
                        <div>
                            {
                                record.endDate ? 
                                    <div>
                                        <div>{record.beginDate}</div>
                                        <div>{record.endDate}</div>
                                    </div>
                                    :
                                    <div>长期有效</div>
                            }
                        </div>
                    );
                },
            },
            {
                title: '状态',
                dataIndex: 'status',
                width: '15%',
                className: 'operating',                
                render: (text, record) => {
                    let time = countdown(record.beginDate, record.endDate);
                    return (
                        <div>
                            {
                                record.status === '进行中' ? 
                                    <div>
                                        <div style={{color: "#008000"}}>{record.status}</div>
                                        <div>
                                            距离结束： 
                                            {
                                                record.endDate ? 
                                                    <span>{time.day}天{time.hours}时{time.minute}分{time.second}秒</span>
                                                    :
                                                    <span>长期有效</span>
                                            }
                                        </div>
                                    </div>
                                    :
                                    this.renderColumns(text, record, 'status')
                            }
                        </div>
                    )
                },
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
                            {/*<ItemDetails 
                                id={record.id}
                                opStatus={this.props.opObj.select}
                                toLoginPage={this.props.toLoginPage}/>*/}
                            {/*通告编辑*/}
                            <ItemEdit 
                                id={record.id} 
                                recapture={this.getData}
                                provinceList={this.props.provinceList}
                                opStatus={this.props.opObj.modify}
                                toLoginPage={this.props.toLoginPage}/>
                            {/*往期回顾*/}
                            <ItemPassReview 
                                id={record.id} 
                                recapture={this.getData}
                                opStatus={this.props.opObj.review && record.status === '已结束'}
                                toLoginPage={this.props.toLoginPage}/>
                            {/*通告结束*/}
                            <Popconfirm 
                                title="结束"
                                placement="topRight"
                                onConfirm={() => this.itemOver(record.id)}
                                onCancel=""
                                okType="danger"
                                okText="确认"
                                cancelText="取消">
                                <a style={{display: record.status === '进行中' ? "inline" : "none"}}>结束</a>
                            </Popconfirm>
                            {/*报名名单*/}
                            <Link 
                                to={"./sign-list/" + record.id + "/" + JSON.stringify({id: record.id, apply: this.props.opObj.apply, applyDetails: this.props.opObj.applyDetails})}
                                style={{display: this.props.opObj.select ? "inline" : "none"}}>报名名单</Link>
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
    
    // 数据处理
    dataHandle = (data) => {
        const result = [];
        data.forEach((item, index) => {
            result.push({
                key: index.toString(),
                id: item.id,
                index: index + 1,
                sort: item.sort !== 0 ? item.sort : '',
                name: item.name,
                beginDate: item.beginDate,
                endDate: item.endDate,
                noticeTime: item.endDate ? (item.beginDate + ' 至 ' + item.endDate) : '长期有效',
                signNum: item.applyNum,
                city: item.cityName,
                createUser: item.creatorName,
                viewNum: item.vistorNum || 0,
                createTime: item.createTime,
                statusCode: item.status,
                status: noticeStatus(item.status)
            });
        });
        return result;
    };

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
                this.setState({
                    loading: false,
                    data: this.dataHandle(json.data.data.list),
                    pagination: {
                        total: json.data.data.total,
                        current: this.state.pagination.current,
                        pageSize: this.state.pagination.pageSize
                    }
                })
            } else {
                exceptHandle(this, json.data);
            }
        }).catch((err) => errorHandle(this, err));
    };

    // 通告结束
    itemOver = (id) => {
        this.setState({loading: true});        
        noticeOver({id: id}).then((json) => {
            if (json.data.result === 0) {
                message.success("通告结束成功");
                this.getData();
            } else {
                exceptHandle(this, json.data);
            }
        }).catch((err) => errorHandle(this, err));
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
            opObj: {},
            // 获取通告列表所需关键词
            keyword: {
                cityCode: null,
                status: null,
                noticeName: '',
                startTime: "",
                endTime: "",
            },
            startValue: null,
            endValue: null,
            flag_add: false,
            mapObj: {}, // 地图控件对象
            provinceList: [], // 省市列表
        };    
    };

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
        this.setState({opObj: getPower(this).data});        
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
    search = (value) => {
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
        this.setState({flag_add: !this.state.flag_add});
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
                                    options={pCAName(this.state.provinceList).optionsOfCity} 
                                    onChange={this.setCity} 
                                    placeholder="请选择展示城市"/>
                                {/*状态筛选*/}
                                <Select 
                                    onChange={this.setStatus}
                                    className="star-select"  
                                    placeholder="请选择状态" 
                                    allowClear>
                                    {noticeOptions}
                                </Select>
                                {/*通告名筛选*/}
                                <Search 
                                    onSearch={(value) => this.search(value)} 
                                    enterButton
                                    allowClear 
                                    className="star-search" 
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
                                        toLoginPage={() => toLoginPage(this)}/>
                                </div>
                            </header>
                            {/*通告列表*/}
                            <div className="table-box">                                
                                <DataTable                                    
                                    opObj={this.state.opObj}
                                    keyword={this.state.keyword}
                                    provinceList={this.state.provinceList}
                                    flag_add={this.state.flag_add}
                                    toLoginPage={() => toLoginPage(this)}/>                                    
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