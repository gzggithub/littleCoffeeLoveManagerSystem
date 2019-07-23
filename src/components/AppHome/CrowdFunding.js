import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    Form,
    DatePicker,
    Upload,
    Icon,
    message,
    List,
    Popconfirm
} from 'antd';
import moment from 'moment';
import reqwest from 'reqwest';

const FormItem = Form.Item;
const {TextArea} = Input;
const {MonthPicker} = DatePicker;
const confirm = Modal.confirm;

//栅格设置
const formItemLayout_8 = {
    labelCol: {span: 4},
    wrapperCol: {span: 8},
};

const formItemLayout_12 = {
    labelCol: {span: 4},
    wrapperCol: {span: 12},
};
const formItemLayout_14 = {
    labelCol: {span: 4},
    wrapperCol: {span: 14},
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

let flag = true;
//新增课程表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, loading, viewPic, fn_pic, loading_T, viewPic_T, fn_pic_T, data_seniority, fn_seniority, fn_openTime, fn_closeDate, mapObj, formattedAddress, setXY, setAddressComponent} = props;
        const {getFieldDecorator, setFieldsValue} = form;

        //图片处理
        const getBase64 = (img, callback) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => callback(reader.result));
            reader.readAsDataURL(img);
        };
        const beforeUpload = (file) => {
            const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isIMG) {
                message.error('文件类型错误');
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('文件不能大于2M');
            }
            return isIMG && isLt2M;
        };
        const picHandleChange = (info) => {
            if (info.file.status === 'uploading') {
                fn_pic(true);
                return;
            }
            if (info.file.status === 'done') {
                getBase64(info.file.originFileObj, (imageUrl) => {
                    fn_pic(false, imageUrl, info.file.response.data.url);
                });
            }
            if (info.file.status === 'error') {
                // Get this url from response in real world.
                getBase64(info.file.originFileObj, (imageUrl) => {
                    fn_pic(false, imageUrl, "123456");
                });
            }
        };
        const uploadButton = (
            <div>
                <Icon type={loading ? 'loading' : 'plus'}/>
                <div className="ant-upload-text" style={{display: loading ? "none" : "block"}}>选择图片</div>
            </div>
        );

        //教师头像处理
        const getBase64_T = (img, callback) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => callback(reader.result));
            reader.readAsDataURL(img);
        };
        const beforeUpload_T = (file) => {
            const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isIMG) {
                message.error('文件类型错误');
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('文件不能大于2M');
            }
            return isIMG && isLt2M;
        };
        const picHandleChange_T = (info) => {
            if (info.file.status === 'uploading') {
                fn_pic_T(true);
                return;
            }
            if (info.file.status === 'done') {
                getBase64_T(info.file.originFileObj, (imageUrl) => {
                    fn_pic_T(false, imageUrl, info.file.response.data.url);
                });
            }
            if (info.file.status === 'error') {
                // Get this url from response in real world.
                getBase64_T(info.file.originFileObj, (imageUrl) => {
                    fn_pic_T(false, imageUrl, "654321");
                });
            }
        };
        const uploadButton_T = (
            <div>
                <Icon type={loading_T ? 'loading' : 'plus'}/>
                <div className="ant-upload-text" style={{display: loading_T ? "none" : "block"}}>选择头像</div>
            </div>
        );

        //教龄选择限定
        function disabledDateOfSeniority(current) {
            // Can not select days before today and today
            return current && current > moment().endOf('day');
        }

        //开课日期选择限定
        function disabledDate(current) {
            // Can not select days before today and today
            return current && current < moment().endOf('day');
        }

        //地理编码
        const toXY = (para) => {
            mapObj.plugin('AMap.Geocoder', function () {
                const geocoder = new window.AMap.Geocoder({});
                const marker = new window.AMap.Marker({
                    map: mapObj,
                    bubble: true
                });
                geocoder.getLocation(para, (status, result) => {
                    if (status === 'complete' && result.info === 'OK') {
                        result.geocodes[0].addressComponent.adcode = result.geocodes[0].adcode;
                        console.log(99999999)
                        console.log("lng:" + result.geocodes[0].location.lng)
                        console.log("lng:" + result.geocodes[0].location.lat)
                        setXY({x: result.geocodes[0].location.lng, y: result.geocodes[0].location.lat});
                        // setFieldsValue({"address": result.geocodes[0].formattedAddress});
                        setAddressComponent(result.geocodes[0].addressComponent);
                        marker.setPosition(result.geocodes[0].location);
                        mapObj.setCenter(marker.getPosition())
                    }
                });
            });
        };
        //定位
        const location = () => {
            mapObj.plugin('AMap.Geolocation', function () {
                const geolocation = new window.AMap.Geolocation({});
                mapObj.addControl(geolocation);
                geolocation.getCurrentPosition();
                //获取成功
                window.AMap.event.addListener(geolocation, 'complete', function (data) {
                    const x = data.position.getLng(), //定位成功返回的经度
                        y = data.position.getLat(); //定位成功返回的纬度
                    setXY({x: x, y: y});
                    setFieldsValue({"address": data.formattedAddress});
                    setAddressComponent(data.addressComponent);
                });
                //获取失败
                window.AMap.event.addListener(geolocation, 'error', function (data) {
                    if (data.info === 'FAILED') {
                        console.log('获取当前位置失败！')
                    }
                });
            });
        };

        if (flag) {
            setFieldsValue({"address": formattedAddress});
            flag = false;
        }

        return (
            <Modal
                visible={visible}
                title="添加课程"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
            >
                <div className="crowdFunding-add crowdFunding-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_8} label="课程名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '课程名称不能为空',
                                }],
                            })(
                                <Input placeholder="请输入课程名称"/>
                            )}
                        </FormItem>
                        <FormItem className="photo noInput" {...formItemLayout_8} label="图片：">
                            {getFieldDecorator('photo', {
                                rules: [{
                                    required: true,
                                    message: '请上传课程图片',
                                }],
                            })(
                                <Upload
                                    name="file"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    showUploadList={false}
                                    action="/file/upload"
                                    beforeUpload={beforeUpload}
                                    onChange={picHandleChange}
                                >
                                    {viewPic ? <img src={viewPic} alt=""/> : uploadButton}
                                </Upload>
                            )}
                        </FormItem>
                        <FormItem className="classIntroduce longItem noInput" {...formItemLayout_14} label="课程计划：">
                            {getFieldDecorator('classIntroduce', {
                                rules: [{
                                    required: true,
                                    message: '请填写课程计划',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写简短的课程计划" rows={2}/>
                            )}
                        </FormItem>
                        <FormItem className="teacherName" {...formItemLayout_8} label="教师姓名：">
                            {getFieldDecorator('teacherName', {
                                rules: [{
                                    required: true,
                                    message: '教师姓名不能为空',
                                }],
                            })(
                                <Input placeholder="请输入教师名称"/>
                            )}
                        </FormItem>
                        <FormItem className="teacherPhoto noInput" {...formItemLayout_8} label="教师头像：">
                            {getFieldDecorator('teacherPhoto', {
                                rules: [{
                                    required: true,
                                    message: '请上传教师头像',
                                }],
                            })(
                                <Upload
                                    name="file"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    showUploadList={false}
                                    action="/file/upload"
                                    beforeUpload={beforeUpload_T}
                                    onChange={picHandleChange_T}
                                >
                                    {viewPic_T ? <img src={viewPic_T} alt=""/> : uploadButton_T}
                                </Upload>
                            )}
                        </FormItem>
                        <FormItem className="seniority" {...formItemLayout_8} label="教龄：">
                            {getFieldDecorator('seniority', {
                                rules: [{
                                    required: true,
                                    message: '教龄不能为空',
                                }],
                            })(
                                <MonthPicker disabledDate={disabledDateOfSeniority}
                                             placeholder="请设置教龄"
                                             onChange={fn_seniority}/>
                            )}
                            <div className="numOfSeniority">{data_seniority ? data_seniority + "年" : ""}</div>
                        </FormItem>
                        <FormItem className="teacherBrief longItem noInput" {...formItemLayout_14} label="教师简介：">
                            {getFieldDecorator('teacherBrief', {
                                rules: [{
                                    required: true,
                                    message: '教师简介不能为空',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写教师简介" rows={2}/>
                            )}
                        </FormItem>
                        <FormItem className="teacherDetails longItem noInput" {...formItemLayout_14} label="教师详情：">
                            {getFieldDecorator('teacherDetails', {
                                rules: [{
                                    required: true,
                                    message: '教师详情不能为空',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写教师详情" rows={2}/>
                            )}
                        </FormItem>
                        <FormItem className="time" {...formItemLayout_8} label="开课日期：">
                            {getFieldDecorator('time', {
                                rules: [{
                                    required: true,
                                    message: '请选择预计开课日期',
                                }],
                            })(
                                <DatePicker disabledDate={disabledDate}
                                            placeholder="请选择日期"
                                            onChange={fn_openTime}/>
                            )}
                        </FormItem>
                        <FormItem className="price" {...formItemLayout_8} label="课程单价：">
                            {getFieldDecorator('price', {
                                rules: [{
                                    required: true,
                                    message: '课程单价不能为空',
                                }],
                            })(
                                <Input placeholder="请输入课程单价(￥)"/>
                            )}
                        </FormItem>
                        <FormItem className="targetNumber" {...formItemLayout_8} label="目标人次：">
                            {getFieldDecorator('targetNumber', {
                                rules: [{
                                    required: true,
                                    message: '目标人次不能为空',
                                }],
                            })(
                                <Input placeholder="请输入目标人次"/>
                            )}
                        </FormItem>
                        <FormItem className="closingDate" {...formItemLayout_8} label="截止日期：">
                            {getFieldDecorator('closingDate', {
                                rules: [{
                                    required: true,
                                    message: '请选择众筹截至日期',
                                }],
                            })(
                                <DatePicker disabledDate={disabledDate}
                                            placeholder="请选择日期"
                                            onChange={fn_closeDate}/>
                            )}
                        </FormItem>
                        <FormItem className="closingTime unnecessary" {...formItemLayout_12} label="截止时间：">
                            {getFieldDecorator('closingTime', {
                                rules: [{
                                    required: false
                                }],
                            })(
                                <Input placeholder="众筹截止时间，默认 00:00"/>
                            )}
                        </FormItem>
                        <FormItem className="address longItem" {...formItemLayout_14} label="课程地址：">
                            {getFieldDecorator('address', {
                                rules: [{
                                    required: true,
                                    message: '地址不能为空',
                                }],
                            })(
                                <Input placeholder="请填写上课地点" onBlur={(event) => toXY(event.target.value)}/>
                            )}
                        </FormItem>
                        <p onClick={location}
                           style={{width: "120px", marginLeft: "100px", cursor: "pointer"}}>点击获取当前坐标</p>
                        <div id="add-crowdFunding-container" name="container" tabIndex="0"/>
                    </Form>
                </div>
            </Modal>
        );
    }
);
//新增课程组件
class ItemAdd extends Component {
    state = {
        visible: false,
        loading: false,
        viewPic: "",
        data_pic: "",
        loading_T: false,
        viewPic_T: "",
        data_pic_T: "",
        data_seniority: 0,
        data_openTime: "",
        data_closeDate: "",
        mapObj: {},
        formattedAddress: "",
        xy: {},
        addressComponent: {}
    };

    showModal = () => {
        this.setState({visible: true}, () => {
            setTimeout(() => {
                this.setState({
                    mapObj: new window.AMap.Map('add-crowdFunding-container', {
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
            }, 500)
        })
    };

    //图片处理
    fn_pic = (para01, para02, para03) => {
        this.setState({
            loading: para01,
            viewPic: para02 || "",
            data_pic: para03 || ""
        });
    };

    //教师头像处理
    fn_pic_T = (para01, para02, para03) => {
        this.setState({
            loading_T: para01,
            viewPic_T: para02 || "",
            data_pic_T: para03 || ""
        });
    };

    //教龄字段处理
    fn_seniority = (date, dateString) => {
        if (dateString) {
            const para01 = dateString.split("-"),
                para02 = [moment().format("YYYY"), moment().format("MM")];
            if (Number(para02[1]) - Number(para01[1]) > 6) {
                this.setState({
                    data_seniority: Number(para02[0] - para01[0]) + 1
                });
            }
            if (Number(para02[1]) - Number(para01[1]) < -6) {
                this.setState({
                    data_seniority: Number(para02[0] - para01[0]) - 1
                });
            }
            if (Number(para02[1]) - Number(para01[1]) >= -6 && Number(para02[1]) - Number(para01[1]) <= 6) {
                this.setState({
                    data_seniority: Number(para02[0] - para01[0])
                });
            }
        } else {
            this.setState({
                data_seniority: 0
            });
        }
    };

    //开课日期字段处理
    fn_openTime = (date, dateString) => {
        this.setState({
            data_openTime: dateString
        });
    };

    //截止日期字段处理
    fn_closeDate = (date, dateString) => {
        this.setState({
            data_closeDate: dateString
        });
    };

    //截止日期字段处理
    fn_closeTime = (time) => {
        time = time ? time.replace("：", ":") : "00:00";
        return new Date(this.state.data_closeDate + " " + time)
    };

    setXY = (para) => {
        this.setState({
            xy: para
        })
    };

    setFormattedAddress = (para) => {
        this.setState({
            formattedAddress: para
        }, () => {
            flag = true;
        })
    };

    setAddressComponent = (para) => {
        this.setState({
            addressComponent: {
                provinceName: para.province,
                cityName: para.city,
                areaName: para.district,
                areaId: para.adcode
            }
        })
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false,
                loading: false,
                viewPic: "",
                data_pic: "",
                loading_T: false,
                viewPic_T: "",
                data_pic_T: "",
                data_seniority: 0,
                data_openTime: "",
                data_closeDate: "",
                mapObj: {},
                formattedAddress: "",
                xy: {},
                addressComponent: {}
            }, () => {
                form.resetFields();
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
                }
            });
        } else {
            cancel()
        }
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            values.photo = this.state.data_pic;
            values.teacherPhoto = this.state.data_pic_T;
            values.seniority = this.state.data_seniority;
            values.targetPrice = values.targetNumber * values.price;
            values.time = this.state.data_openTime;
            values.closingDate = this.fn_closeTime(values.closingTime);
            delete values.closingTime;
            reqwest({
                url: global.config.baseUrl + '/raiseTheClass/publish',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: values,
                error: (XMLHttpRequest) => {
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("课程添加成功");
                        form.resetFields();
                        this.setState({
                            visible: false,
                            loading: false,
                            viewPic: "",
                            data_pic: "",
                            loading_T: false,
                            viewPic_T: "",
                            data_pic_T: "",
                            data_seniority: "",
                            data_openTime: "",
                            data_closeDate: ""
                        });
                        this.props.setFlag()
                    }
                }
            })
        });
    };

    saveFormRef = (form) => {
        this.form = form
    };

    render() {
        return (
            <div style={{display: this.props.opStatus ? "inline" : "none"}}>
                <Button type="primary" onClick={this.showModal}>添加课程</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    state_pic={this.state.state_pic}
                    loading={this.state.loading}
                    viewPic={this.state.viewPic}
                    fn_pic={this.fn_pic}
                    loading_T={this.state.loading_T}
                    viewPic_T={this.state.viewPic_T}
                    fn_pic_T={this.fn_pic_T}
                    data_seniority={this.state.data_seniority}
                    fn_seniority={this.fn_seniority}
                    fn_openTime={this.fn_openTime}
                    fn_closeDate={this.fn_closeDate}
                    mapObj={this.state.mapObj}
                    formattedAddress={this.state.formattedAddress}
                    setXY={this.setXY}
                    setAddressComponent={this.setAddressComponent}
                />
            </div>
        )
    }
}

//课程信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, loading, viewPic, fn_pic, loading_T, viewPic_T, fn_pic_T, data_seniority, fn_seniority, fn_openTime, fn_closeDate, mapObj, formattedAddress, setXY, setAddressComponent} = props;
        const {getFieldDecorator, setFieldsValue} = form;

        const tempTime = data.time ? moment(data.time) : "";
        const tempClosingDate = data.closingDate ? moment(data.closingDate) : "";

        //图片处理
        const getBase64 = (img, callback) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => callback(reader.result));
            reader.readAsDataURL(img);
        };
        const beforeUpload = (file) => {
            const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isIMG) {
                message.error('文件类型错误');
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('文件不能大于2M');
            }
            return isIMG && isLt2M;
        };
        const picHandleChange = (info) => {
            if (info.file.status === 'uploading') {
                fn_pic(true);
                return;
            }
            if (info.file.status === 'done') {
                getBase64(info.file.originFileObj, (imageUrl) => {
                    fn_pic(false, imageUrl, info.file.response.data.url);
                });
            }
            if (info.file.status === 'error') {
                // Get this url from response in real world.
                getBase64(info.file.originFileObj, (imageUrl) => {
                    fn_pic(false, imageUrl, "123456");
                });
            }
        };
        const uploadButton = (
            <div>
                <Icon type={loading ? 'loading' : 'plus'}/>
                <div className="ant-upload-text" style={{display: loading ? "none" : "block"}}>选择图片</div>
            </div>
        );

        //教师头像处理
        const getBase64_T = (img, callback) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => callback(reader.result));
            reader.readAsDataURL(img);
        };
        const beforeUpload_T = (file) => {
            const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isIMG) {
                message.error('文件类型错误');
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('文件不能大于2M');
            }
            return isIMG && isLt2M;
        };
        const picHandleChange_T = (info) => {
            if (info.file.status === 'uploading') {
                fn_pic_T(true);
                return;
            }
            if (info.file.status === 'done') {
                getBase64_T(info.file.originFileObj, (imageUrl) => {
                    fn_pic_T(false, imageUrl, info.file.response.data.url);
                });
            }
            if (info.file.status === 'error') {
                // Get this url from response in real world.
                getBase64_T(info.file.originFileObj, (imageUrl) => {
                    fn_pic_T(false, imageUrl, "654321");
                });
            }
        };
        const uploadButton_T = (
            <div>
                <Icon type={loading_T ? 'loading' : 'plus'}/>
                <div className="ant-upload-text" style={{display: loading_T ? "none" : "block"}}>选择头像</div>
            </div>
        );

        //教龄选择限定
        function disabledDateOfSeniority(current) {
            // Can not select days before today and today
            return current && current > moment().endOf('day');
        }

        //开课日期选择限定
        function disabledDate(current) {
            // Can not select days before today and today
            return current && current < moment().endOf('day');
        }

        //地理编码
        const toXY = (para) => {
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
                    }
                });
            });
        };
        //定位
        const location = () => {
            mapObj.plugin('AMap.Geolocation', function () {
                const geolocation = new window.AMap.Geolocation({});
                mapObj.addControl(geolocation);
                geolocation.getCurrentPosition();
                //获取成功
                window.AMap.event.addListener(geolocation, 'complete', function (data) {
                    const x = data.position.getLng(), //定位成功返回的经度
                        y = data.position.getLat(); //定位成功返回的纬度
                    setXY({x: x, y: y});
                    setFieldsValue({"address": data.formattedAddress});
                    setAddressComponent(data.addressComponent);
                });
                //获取失败
                window.AMap.event.addListener(geolocation, 'error', function (data) {
                    if (data.info === 'FAILED') {
                        console.log('获取当前位置失败！')
                    }
                });
            });
        };

        if (flag) {
            setFieldsValue({"address": formattedAddress});
            flag = false;
        }

        return (
            <Modal
                visible={visible}
                title="课程编辑"
                width={600}
                onCancel={onCancel}
                destroyOnClose={true}
                onOk={onCreate}
            >
                <div className="crowdFunding-edit crowdFunding-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_8} label="课程名称：">
                            {getFieldDecorator('name', {
                                initialValue: data.name,
                                rules: [{
                                    required: true,
                                    message: '课程名称不能为空',
                                }],
                            })(
                                <Input placeholder="请输入课程名称"/>
                            )}
                        </FormItem>
                        <FormItem className="photo unnecessary noInput" {...formItemLayout_8} label="图片：">
                            {getFieldDecorator('photo', {
                                rules: [{
                                    required: false
                                }],
                            })(
                                <Upload
                                    name="file"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    showUploadList={false}
                                    action="/file/upload"
                                    beforeUpload={beforeUpload}
                                    onChange={picHandleChange}
                                >
                                    {viewPic ? <img src={viewPic} alt=""/> : uploadButton}
                                </Upload>
                            )}
                        </FormItem>
                        <FormItem className="classIntroduce longItem noInput" {...formItemLayout_14} label="课程计划：">
                            {getFieldDecorator('classIntroduce', {
                                initialValue: data.classIntroduce,
                                rules: [{
                                    required: true,
                                    message: '请填写课程计划',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写简短的课程计划" rows={2}/>
                            )}
                        </FormItem>
                        <FormItem className="teacherName" {...formItemLayout_8} label="教师姓名：">
                            {getFieldDecorator('teacherName', {
                                initialValue: data.teacherName,
                                rules: [{
                                    required: true,
                                    message: '教师姓名不能为空',
                                }],
                            })(
                                <Input placeholder="请输入教师名称"/>
                            )}
                        </FormItem>
                        <FormItem className="teacherPhoto unnecessary noInput" {...formItemLayout_8} label="教师头像：">
                            {getFieldDecorator('teacherPhoto', {
                                rules: [{
                                    required: false
                                }],
                            })(
                                <Upload
                                    name="file"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    showUploadList={false}
                                    action="/file/upload"
                                    beforeUpload={beforeUpload_T}
                                    onChange={picHandleChange_T}
                                >
                                    {viewPic_T ? <img src={viewPic_T} alt=""/> : uploadButton_T}
                                </Upload>
                            )}
                        </FormItem>
                        <FormItem className="seniority unnecessary" {...formItemLayout_8} label="教龄：">
                            {getFieldDecorator('seniority', {
                                rules: [{
                                    required: false
                                }],
                            })(
                                <MonthPicker disabledDate={disabledDateOfSeniority}
                                             placeholder="请设置教龄"
                                             onChange={fn_seniority}/>
                            )}
                            <div className="numOfSeniority">{data_seniority ? data_seniority + "年" : ""}</div>
                        </FormItem>
                        <FormItem className="teacherBrief longItem noInput" {...formItemLayout_14} label="教师简介：">
                            {getFieldDecorator('teacherBrief', {
                                initialValue: data.teacherBrief,
                                rules: [{
                                    required: true,
                                    message: '教师简介不能为空',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写教师简介" rows={2}/>
                            )}
                        </FormItem>
                        <FormItem className="teacherDetails longItem noInput" {...formItemLayout_14} label="教师详情：">
                            {getFieldDecorator('teacherDetails', {
                                initialValue: data.teacherDetails,
                                rules: [{
                                    required: true,
                                    message: '教师详情不能为空',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写教师详情" rows={2}/>
                            )}
                        </FormItem>
                        <FormItem className="time" {...formItemLayout_8} label="开课日期：">
                            {getFieldDecorator('time', {
                                initialValue: tempTime,
                                rules: [{
                                    required: true,
                                    message: '请选择预计开课日期',
                                }],
                            })(
                                <DatePicker disabledDate={disabledDate}
                                            placeholder="请选择日期"
                                            onChange={fn_openTime}/>
                            )}
                        </FormItem>
                        <FormItem className="price" {...formItemLayout_8} label="课程单价：">
                            {getFieldDecorator('price', {
                                initialValue: data.price,
                                rules: [{
                                    required: true,
                                    message: '课程单价不能为空',
                                }],
                            })(
                                <Input placeholder="请输入课程单价(￥)"/>
                            )}
                        </FormItem>
                        <FormItem className="targetNumber" {...formItemLayout_8} label="目标人次：">
                            {getFieldDecorator('targetNumber', {
                                initialValue: data.targetNumber,
                                rules: [{
                                    required: true,
                                    message: '目标人次不能为空',
                                }],
                            })(
                                <Input placeholder="请输入目标人次"/>
                            )}
                        </FormItem>
                        <FormItem className="closingDate" {...formItemLayout_8} label="截止日期：">
                            {getFieldDecorator('closingDate', {
                                initialValue: tempClosingDate,
                                rules: [{
                                    required: true,
                                    message: '请选择众筹截至日期',
                                }],
                            })(
                                <DatePicker disabledDate={disabledDate}
                                            placeholder="请选择日期"
                                            onChange={fn_closeDate}/>
                            )}
                        </FormItem>
                        <FormItem className="closingTime unnecessary" {...formItemLayout_12} label="截止时间：">
                            {getFieldDecorator('closingTime', {
                                initialValue: data.closingTime,
                                rules: [{
                                    required: false
                                }],
                            })(
                                <Input placeholder="众筹截止时间，默认 00:00"/>
                            )}
                        </FormItem>
                        <FormItem className="address longItem" {...formItemLayout_14} label="课程地址：">
                            {getFieldDecorator('address', {
                                initialValue: data.address,
                                rules: [{
                                    required: true,
                                    message: '地址不能为空',
                                }],
                            })(
                                <Input placeholder="请填写上课地点" onBlur={(event) => toXY(event.target.value)}/>
                            )}
                        </FormItem>
                        <p onClick={location}
                           style={{width: "120px", marginLeft: "100px", cursor: "pointer"}}>点击获取当前坐标</p>
                        <div id="edit-crowdFunding-container" name="container" tabIndex="0"/>
                    </Form>
                </div>
            </Modal>
        );
    }
);
//课程信息编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,
        data: {},
        loading: false,
        viewPic: "",
        data_pic: "",
        loading_T: false,
        viewPic_T: "",
        data_pic_T: "",
        data_seniority: 0,
        data_openTime: "",
        data_closeDate: "",
        mapObj: {},
        formattedAddress: "",
        xy: {},
        addressComponent: {}
    };

    closingDateHandle = (para) => {
        const tempDate = new Date(para.replace("CST", "GMT+0800")),
            oMonthT = (tempDate.getMonth() + 1).toString(),
            oMonth = oMonthT.length <= 1 ? "0" + oMonthT : oMonthT,
            oDayT = tempDate.getDate().toString(),
            oDay = oDayT.length <= 1 ? "0" + oDayT : oDayT,
            oYear = tempDate.getFullYear().toString(),
            oTime = oYear + '-' + oMonth + '-' + oDay;
        return oTime;
    };

    closingTimeHandle = (para) => {
        const tempDate = new Date(para.replace("CST", "GMT+0800")),
            oHourT = tempDate.getHours().toString(),
            oHour = oHourT.length <= 1 ? "0" + oHourT : oHourT,
            oMinuteT = tempDate.getMinutes().toString(),
            oMinute = oMinuteT.length <= 1 ? "0" + oMinuteT : oMinuteT,
            oTime = oHour + ":" + oMinute;
        return oTime;
    };

    getData = () => {
        reqwest({
            url: '/raiseTheClass/getDetail',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: this.props.id
            },
            error: (XMLHttpRequest) => {                
            },
            success: (json) => {
                if (json.result === 0) {
                    json.data.raiseTheClassInfo.closingTime = this.closingTimeHandle(json.data.raiseTheClassInfo.closingDate);
                    json.data.raiseTheClassInfo.closingDate = this.closingDateHandle(json.data.raiseTheClassInfo.closingDate);
                    this.setState({
                        data: json.data.raiseTheClassInfo,
                        viewPic: "http://image.taoerxue.com/" + json.data.raiseTheClassInfo.photo,
                        data_pic: json.data.raiseTheClassInfo.photo,
                        viewPic_T: "http://image.taoerxue.com/" + json.data.raiseTheClassInfo.teacherPhoto,
                        data_pic_T: json.data.raiseTheClassInfo.teacherPhoto,
                        data_seniority: json.data.raiseTheClassInfo.seniority,
                        data_openTime: json.data.raiseTheClassInfo.time,
                        data_closeDate: json.data.raiseTheClassInfo.closingDate
                    })
                }
            }
        })
    };

    showModal = () => {
        this.getData();
        this.setState({visible: true}, () => {
            setTimeout(() => {
                this.setState({
                    mapObj: new window.AMap.Map('edit-crowdFunding-container', {
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
            }, 500)
        })
    };

    //图片处理
    fn_pic = (para01, para02, para03) => {
        this.setState({
            loading: para01,
            viewPic: para02 || "",
            data_pic: para03 || ""
        });
    };

    //教师头像处理
    fn_pic_T = (para01, para02, para03) => {
        this.setState({
            loading_T: para01,
            viewPic_T: para02 || "",
            data_pic_T: para03 || ""
        });
    };

    //教龄字段处理
    fn_seniority = (date, dateString) => {
        if (dateString) {
            const para01 = dateString.split("-"),
                para02 = [moment().format("YYYY"), moment().format("MM")];
            if (Number(para02[1]) - Number(para01[1]) > 6) {
                this.setState({
                    data_seniority: Number(para02[0] - para01[0]) + 1
                });
            }
            if (Number(para02[1]) - Number(para01[1]) < -6) {
                this.setState({
                    data_seniority: Number(para02[0] - para01[0]) - 1
                });
            }
            if (Number(para02[1]) - Number(para01[1]) >= -6 && Number(para02[1]) - Number(para01[1]) <= 6) {
                this.setState({
                    data_seniority: Number(para02[0] - para01[0])
                });
            }
        } else {
            this.setState({
                data_seniority: 0
            });
        }
    };

    //开课日期字段处理
    fn_openTime = (date, dateString) => {
        this.setState({
            data_openTime: dateString
        });
    };

    //截止日期字段处理
    fn_closeDate = (date, dateString) => {
        this.setState({
            data_closeDate: dateString
        });
    };

    //截止日期字段处理
    fn_closeTime = (time) => {
        time = time ? time.replace("：", ":") : "00:00";
        return new Date(this.state.data_closeDate + " " + time)
    };

    setXY = (para) => {
        this.setState({
            xy: para
        })
    };

    setFormattedAddress = (para) => {
        this.setState({
            formattedAddress: para
        }, () => {
            flag = true;
        })
    };

    setAddressComponent = (para) => {
        this.setState({
            addressComponent: {
                provinceName: para.province,
                cityName: para.city,
                areaName: para.district,
                areaId: para.adcode
            }
        }, () => {
            console.log(this.state.addressComponent)
        })
    };

    submitHandle = (values) => {
        const initValues = this.state.data;
        const itemList = ["name", "photo", "classIntroduce", "teacherName", "teacherPhoto", "seniority", "teacherBrief", "teacherDetails", "time", "price", "targetNumber", "address"];
        const result = {};
        itemList.forEach((item) => {
            if (values[item] !== initValues[item]) {
                result[item] = values[item];
            }
        });
        if (this.state.data_closeDate !== initValues.closingDate) {
            result.closingDate = this.fn_closeTime(values.closingTime)
        }
        if (values.closingTime !== initValues.closingTime) {
            result.closingDate = this.fn_closeTime(values.closingTime)
        }
        if (JSON.stringify(result) === "{}") {
            return false;
        } else {
            result.id = this.props.id;
            return result;
        }
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({visible: false}, () => {
                form.resetFields();
            })
        };
        form.validateFields((err, values) => {
            values.photo = this.state.data_pic;
            values.teacherPhoto = this.state.data_pic_T;
            values.seniority = this.state.data_seniority;
            values.time = this.state.data_openTime;
            const result = this.submitHandle(values);
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
                this.setState({visible: false}, () => {
                    form.resetFields();
                })
            }
        })
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            values.photo = this.state.data_pic;
            values.teacherPhoto = this.state.data_pic_T;
            values.seniority = this.state.data_seniority;
            values.time = this.state.data_openTime;
            const result = this.submitHandle(values);
            if (!result) {
                return;
            }
            reqwest({
                url: '/raiseTheClass/modify',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: result,
                error: (XMLHttpRequest) => {
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("课程编辑成功");
                        form.resetFields();
                        this.setState({
                            visible: false,
                            loading: false,
                            viewPic: "",
                            data_pic: "",
                            loading_T: false,
                            viewPic_T: "",
                            data_pic_T: "",
                            data_seniority: "",
                            data_openTime: "",
                            data_closeDate: ""
                        }, () => {
                            this.props.recapture();
                        });
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
                <span onClick={() => this.showModal(this.props.id)}>编辑</span>
                <ItemEditForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    data={this.state.data}
                    loading={this.state.loading}
                    viewPic={this.state.viewPic}
                    fn_pic={this.fn_pic}
                    loading_T={this.state.loading_T}
                    viewPic_T={this.state.viewPic_T}
                    fn_pic_T={this.fn_pic_T}
                    data_seniority={this.state.data_seniority}
                    fn_seniority={this.fn_seniority}
                    fn_openTime={this.fn_openTime}
                    fn_closeDate={this.fn_closeDate}
                    mapObj={this.state.mapObj}
                    formattedAddress={this.state.formattedAddress}
                    setXY={this.setXY}
                    setAddressComponent={this.setAddressComponent}
                />
            </a>
        );
    }
}

//课程详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        data: {}
    };

    closingDateHandle = (para) => {
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

    getData = () => {
        reqwest({
            url: '/raiseTheClass/getDetail',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: this.props.id
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         raiseTheClassInfo: {
                //             id: 122,
                //             name: "最好的钢琴课",
                //             photo: "dda203fb72964df880aaaeb15539f5ca.jpg",
                //             classIntroduce: "最好的钢琴课",
                //             teacherName: "王小剑",
                //             teacherPhoto: "cd5aaf757c8a4f999a293881780bbef2.png",
                //             seniority: "3",
                //             teacherBrief: "王小剑",
                //             teacherDetails: "王小剑",
                //             time: "2011-11-11",
                //             price: 500,
                //             targetNumber: 20,
                //             targetPrice: 10000,
                //             closingDate: "Sat Apr 14 2:00:00 CST 2018",
                //             address: "我的刷卡建档立卡岁的克里斯家乐福度释放",
                //             raisedNumber: 10,
                //             raisedMoney: 5000,
                //             status: 1,
                //         }
                //     },
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    json.data.raiseTheClassInfo.closingDate = this.closingDateHandle(json.data.raiseTheClassInfo.closingDate);
                    this.setState({
                        data: json.data.raiseTheClassInfo
                    })
                }
            }
        })
    };

    showModal = () => {
        this.getData();
        this.setState({
            visible: true,
        })
    };

    handleCancel = () => {
        this.setState({visible: false});
    };

    render() {
        var courseStatus = "";
        if (this.state.data.status === 0) {
            courseStatus = "正在进行";
        }
        if (this.state.data.status === 1) {
            courseStatus = "已完成";
        }
        if (this.state.data.status === 2) {
            courseStatus = "筹款失败";
        }
        if (this.state.data.status === 3) {
            courseStatus = "已下架";
        }
        const courseData = [
            <div className="name">
                <span className="item-name">课程名称：</span>
                <span className="item-content">{this.state.data.name}</span>
            </div>,
            <div className="photo">
                <span className="item-name">照片：</span>
                <img src={"http://image.taoerxue.com/" + this.state.data.photo} alt="" className="item-content"/>
            </div>,
            <div className="classIntroduce">
                <span className="item-name">课程计划：</span>
                <span className="item-content">{this.state.data.classIntroduce}</span>
            </div>,
            <div className="teacher">
                <span className="item-name">教师：</span>
                <span className="item-content">{this.state.data.teacherName}</span>
            </div>,
            <div className="teacherPhoto">
                <span className="item-name">教师头像：</span>
                <img src={"http://image.taoerxue.com/" + this.state.data.teacherPhoto} alt="" className="item-content"/>
            </div>,
            <div className="seniority">
                <span className="item-name">教龄：</span>
                <span className="item-content">{this.state.data.seniority}年</span>
            </div>,
            <div className="teacherBrief">
                <span className="item-name">教师简介：</span>
                <span className="item-content">{this.state.data.teacherBrief}</span>
            </div>,
            <div className="teacherDetails">
                <span className="item-name">教师详情：</span>
                <span className="item-content">{this.state.data.teacherDetails}</span>
            </div>,
            <div className="time">
                <span className="item-name">开课日期：</span>
                <span className="item-content">{this.state.data.time}</span>
            </div>,
            <div className="price">
                <span className="item-name">课程单价：</span>
                <span className="item-content">{this.state.data.price}</span>
            </div>,
            <div className="targetNumber">
                <span className="item-name">目标人次：</span>
                <span className="item-content">{this.state.data.targetNumber}</span>
            </div>,
            <div className="targetPrice">
                <span className="item-name">目标金额：</span>
                <span className="item-content">{this.state.data.targetPrice}</span>
            </div>,
            <div className="raisedMoney">
                <span className="item-name">已筹金额：</span>
                <span className="item-content">{this.state.data.raisedMoney}</span>
            </div>,
            <div className="closingDate">
                <span className="item-name">截止时间：</span>
                <span className="item-content">{this.state.data.closingDate}</span>
            </div>,
            <div className="address">
                <span className="item-name">上课地点：</span>
                <span className="item-content">{this.state.data.address}</span>
            </div>,
            <div className="status">
                <span className="item-name">课程状态：</span>
                <span className="item-content">{courseStatus}</span>
            </div>,
        ];
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>详情</span>
                <Modal
                    title="课程详情"
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                    onOk={this.showDeleteConfirm}
                >
                    <div className="crowdFunding-details">
                        <div className="crowdFunding-baseData">
                            <List
                                size="small"
                                split="false"
                                dataSource={courseData}
                                renderItem={item => (<List.Item>{item}</List.Item>)}
                            />
                        </div>
                    </div>
                </Modal>
            </a>
        );
    }
}

//课程列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [{key: 1}],
            pagination: {
                current: 1,
                pageSize: 10
            },
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '课程名称',
                dataIndex: 'name',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '图片',
                dataIndex: 'photo',
                width: '8%',
                render: (text, record) => (<img style={{width: '30px', height: "18px"}} alt="" src={record["photo"]}/>)
            },
            {
                title: "开课日期",
                dataIndex: "time",
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, "time"),
            },
            {
                title: '老师',
                dataIndex: 'teacherName',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'teacherName'),
            },
            {
                title: '状态',
                dataIndex: 'status',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'status'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            <ItemDetails id={record.id} opStatus={this.props.opObj.select}/>
                            <ItemEdit id={record.id} recapture={this.getData} opStatus={this.props.opObj.modify}/>
                            <Popconfirm title="确认删除?"
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

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    //获取本页信息
    getData = () => {
        reqwest({
            url: "/raiseTheClass/getList",
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: [
                //         {
                //             id: 1,
                //             name: "天蓝书法课",
                //             photo: "4fa34d07151c447890a6629683584ce6.jpg",
                //             teacherName: "王大剑",
                //             time: "2017-11-11",
                //             status: 0
                //         }
                //     ]
                // };
            },
            success: (json) => {
                const data = [];
                if (json.result === 0) {
                    json.data.forEach((item, index) => {
                        let tempCourseStatus = "";
                        if (item.status === 0) {
                            tempCourseStatus = "正在进行";
                        }
                        if (item.status === 1) {
                            tempCourseStatus = "已完成";
                        }
                        if (item.status === 2) {
                            tempCourseStatus = "筹款失败";
                        }
                        if (item.status === 3) {
                            tempCourseStatus = "已下架";
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            name: item.name,
                            photo: "http://image.taoerxue.com/" + item.photo,
                            time: item.time,
                            teacherName: item.teacherName,
                            status: tempCourseStatus
                        });
                    });
                    this.setState({
                        data: data,
                    });
                }
            }
        });
    };

    //删除
    itemDelete = (para) => {
        reqwest({
            url: '/raiseTheClass/offShelf',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: para
            },
            error: (XMLHttpRequest) => {

            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("课程删除成功");
                    this.getData();
                }
            }
        });
    };

    //页码变化处理
    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        this.setState({
            pagination: pager,
        })
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
        return <Table bordered
                      dataSource={this.state.data}
                      pagination={this.state.pagination}
                      columns={this.columns}
                      onChange={this.handleTableChange}/>;
    }
}

class CrowdFunding extends Component {
    constructor(props) {
        super(props);
        this.state = {
			opObj: {
                add: true,
                delete: true,
                modify: true,
                select: true,
            },
            flag_add: false
        }
    };

    setFlag = () => {
        this.setState({
            flag_add: !this.state.flag_add
        })
    };

    componentWillMount() {
		// JSON.parse(sessionStorage.menuListOne).forEach((item)=>{
		// 	item.children.forEach((subItem)=>{
		// 		if(subItem.url===this.props.location.pathname){
		// 			let data={};
		// 			subItem.children.forEach((thirdItem)=>{
		// 				data[thirdItem.url]=true;
		// 			})
		// 			this.setState({
		// 				opObj: data
		// 			})
		// 		}
		// 	})
		// })
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
            <div className="crowdFunding">
                <header className="clearfix">
                    <span>课程列表</span>
                    <div className="add-button" style={{float: "right"}}>
                        <ItemAdd setFlag={this.setFlag} opStatus={this.state.opObj.add}/>
                    </div>
                </header>
                <div className="table-box">
                    <DataTable opObj={this.state.opObj} flag_add={this.state.flag_add}/>
                </div>
            </div>
        )
    }
}

export default CrowdFunding;