import React, {Component} from 'react';
import {
    Table,
    Tabs,
    Input,
    Button,
    Modal,
    Form,
    DatePicker,
    TimePicker,
    Select,
    Upload,
    Icon,
    message,
    Slider,
    Row,
    Col,
    List,
    Radio,
    InputNumber,
    Popconfirm,
    Spin,
} from 'antd';
import moment from 'moment';
import '../../config/config.js';
import reqwest from 'reqwest';
import AvatarEditor from 'react-avatar-editor';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const {Option} = Select;
const FormItem = Form.Item;
const {TextArea} = Input;
const RadioGroup = Radio.Group;
const confirm = Modal.confirm;

//栅格设置
const formItemLayout_8 = {
    labelCol: {span: 4},
    wrapperCol: {span: 8},
};
const formItemLayout_10 = {
    labelCol: {span: 4},
    wrapperCol: {span: 10},
};
const formItemLayout_12 = {
    labelCol: {span: 4},
    wrapperCol: {span: 12},
};
const formItemLayout_14 = {
    labelCol: {span: 4},
    wrapperCol: {span: 14},
};
const formItemLayout_16 = {
    labelCol: {span: 4},
    wrapperCol: {span: 16},
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);
//可编辑单元格
const EditableCell = ({editable, value, onChange}) => (
    <div>
        {editable
            ? <Input style={{margin: '-5px 0'}} value={value} onChange={e => onChange(e.target.value)}/>
            : value
        }
    </div>
);

//课程新增表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, type, setType, viewPic, effectPic, data_pic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoLoading, provinceList, cityList, districtList, streetList, markers, setMarkers, area, setArea, mapObj, setXY, setFormattedAddress, formattedAddress, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 图片处理
        // 由图片文件对象获取其base64编码
        const getBase64 = (img, callback) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => callback(reader.result));
            reader.readAsDataURL(img);
        };
        const setEditorRef = (editor) => this.editor = editor;
        // 由图片地址获取其文件对象
        const dataURLtoFile = (url) => {
            let arr = url.split(','),
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
            }
            return new Blob([u8arr], {type: "image/jpeg"});
        };
        // 图片选择之后的相关操作
        const beforeUpload = (file) => {
            // 文件类型校验
            const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isIMG) {
                message.error('文件类型错误');
            }
            // 文件大小校验
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('文件不能大于2M');
            }
            // 校验通过，将初始图片写入
            if (isIMG && isLt2M) {
                getBase64(file, (imageUrl) => {
                    setViewPic(imageUrl);
                });
            }
            // 阻止选择文件后的默认上传操作
            return false
        };
        // 点击图片提交按钮的相关操作
        const picHandle = () => {
            if (viewPic) {
                // 初始图片已经写入的分支操作
                // 由绘制出的canvas元素获取有效图片的base64编码并与已有的有效图片编码进行比对
                const canvas = this.editor.getImage();
                const url = canvas.toDataURL("image/jpeg", 0.92);
                if (url === effectPic) {
                    // 比对结果一致，即图片没有更改，直接return
                    message.error("图片未改动，无法提交");
                    return
                }
                // 获取有效图片文件对象
                const file = dataURLtoFile(url);
                // 图片上传
                picUpload(url, file)
            } else {
                // 初始图片未写入的分支操作
                message.error("图片未选择");
            }
        };
        // 图片选择框：图片文件未选择时展示
        const uploadButton = (
            <div>
                <Icon type={'plus'}/>
                <div className="ant-upload-text">选择图片</div>
            </div>
        );
        // 展示有效图片的canvas元素：图片文件已选择时展示
        const partImg = (
            <AvatarEditor
                ref={setEditorRef}
                image={viewPic}
                width={295}
                height={165}
                border={0}
                color={[255, 255, 255, 0.6]}
                scale={avatarEditor.scale}
                position={{x: avatarEditor.positionX, y: avatarEditor.positionY}}
                rotate={0}
            />
        );

        //开课日期选择限制
        function disabledDate(current) {
            return current && current < moment().endOf('day');
        }

        // 课程地址相关
        const provinceOptions = provinceList.map(item => <Option key={item.name}>{item.name}</Option>);
        const cityOptions = cityList.map(item => <Option key={item.name}>{item.name}</Option>);
        const districtOptions = districtList.map(item => <Option key={item.name}>{item.name}</Option>);
        const streetOptions = streetList.map(item => <Option key={item.name}>{item.name}</Option>);
        const addressChange = (value) => {
            if (!value) {
                return
            }
            let keyword = "";
            keyword = keyword + area.province + area.city + area.district + area.street;
            keyword = keyword + value;
            // 清除已有标记点
            mapObj.remove(markers);
            mapObj.plugin('AMap.Geocoder', function () {
                const geocoder = new window.AMap.Geocoder({});
                const marker = new window.AMap.Marker({
                    map: mapObj,
                    bubble: true
                });
                geocoder.getLocation(keyword, (status_, result_) => {
                    if (status_ === 'complete' && result_.info === 'OK') {
                        geocoder.getAddress([result_.geocodes[0].location.lng, result_.geocodes[0].location.lat], (status, result) => {
                            if (status === 'complete' && result.info === 'OK') {
                                // 经纬度写入
                                setXY({x: result_.geocodes[0].location.lng, y: result_.geocodes[0].location.lat});
                                // 生成当前标记点
                                marker.setPosition(result_.geocodes[0].location);
                                mapObj.setCenter(marker.getPosition());
                                setMarkers(marker);
                                // address字段写入
                                setFormattedAddress(area.street ? keyword : result.regeocode.addressComponent.province + result.regeocode.addressComponent.city + result.regeocode.addressComponent.district + result.regeocode.addressComponent.township + keyword);
                                // 其他地址信息写入
                                setArea(5, result.regeocode.addressComponent);
                            }
                        });
                    }
                });
            });
        };

        return (
            <Modal
                visible={visible}
                title="课程新增"
                width={750}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="courseOne-add courseOne-form item-form">
                    <Form layout="vertical">
                        <FormItem className="name longItem" {...formItemLayout_14} label="课程名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    max: 30,
                                    message: '请按要求填写课程名称',
                                }],
                            })(
                                <Input placeholder="请输入课程名称（30字以内）"/>
                            )}
                        </FormItem>
                        <FormItem className="type" {...formItemLayout_10} label="类型：">
                            {getFieldDecorator('type', {
                                rules: [{
                                    required: true,
                                    message: '请选择课程类型',
                                }],
                            })(
                                <RadioGroup onChange={(e) => {
                                    setType(e.target.value)
                                }}>
                                    <Radio value={0}>线上</Radio>
                                    <Radio value={1}>线下</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem className="photo" {...formItemLayout_12} label="图片：">
                            {getFieldDecorator('photo', {
                                rules: [{
                                    required: true,
                                    message: '请上传课程图片',
                                }],
                            })(
                                <div className="itemBox">
                                    <Upload
                                        name="file"
                                        listType="picture-card"
                                        className="avatar-uploader"
                                        showUploadList={false}
                                        action="/file/upload"
                                        beforeUpload={beforeUpload}
                                    >
                                        {viewPic ? partImg : uploadButton}
                                    </Upload>
                                    <Row>
                                        <Col span={4}>缩放：</Col>
                                        <Col span={12}>
                                            <Slider min={1} max={1.5} step={0.01} value={avatarEditor.scale}
                                                    disabled={!viewPic}
                                                    onChange={(value) => {
                                                        setAvatarEditor(1, value)
                                                    }}/>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={4}>X：</Col>
                                        <Col span={12}>
                                            <Slider min={0} max={1} step={0.01} value={avatarEditor.positionX}
                                                    disabled={!viewPic}
                                                    onChange={(value) => {
                                                        setAvatarEditor(2, value)
                                                    }}/>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={4}>Y：</Col>
                                        <Col span={12}>
                                            <Slider min={0} max={1} step={0.01} value={avatarEditor.positionY}
                                                    disabled={!viewPic}
                                                    onChange={(value) => {
                                                        setAvatarEditor(3, value)
                                                    }}/>
                                        </Col>
                                    </Row>
                                    <Button type="primary"
                                            onClick={picHandle}
                                            loading={photoLoading}
                                            style={{
                                                position: "absolute",
                                                right: "-20px",
                                                bottom: "0"
                                            }}>{data_pic ? "重新提交" : "图片提交"}</Button>
                                </div>
                            )}
                        </FormItem>
                        <FormItem className="teacherInfo" {...formItemLayout_12} label="教师信息：">
                            {getFieldDecorator('teacherInfo', {
                                rules: [{
                                    required: true,
                                    message: '教师信息'
                                }]
                            })(
                                <Input placeholder="请输入教师信息"/>
                            )}
                        </FormItem>
                        <FormItem className="openClassPeopleNum" {...formItemLayout_8} label="课程人数：">
                            {getFieldDecorator('openClassPeopleNum', {
                                rules: [{
                                    required: true,
                                    message: '课程人数不能为空',
                                }]
                            })(
                                <InputNumber min={0} precision={0} step={1}/>
                            )}
                        </FormItem>
                        <FormItem className="openClassDate" {...formItemLayout_8} label="开课时间：">
                            {getFieldDecorator('openClassDate', {
                                rules: [{
                                    required: true,
                                    message: '开课时间不能为空',
                                }]
                            })(
                                <DatePicker disabledDate={disabledDate}
                                            placeholder="请选择日期"/>
                            )}
                        </FormItem>
                        <FormItem className="summary longItem" {...formItemLayout_14} label="课程概述：">
                            {getFieldDecorator('summary', {
                                rules: [{
                                    required: true,
                                    message: '课程概述不能为空',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写课程概述"
                                          autosize={{minRows: 3, maxRows: 10}}/>
                            )}
                        </FormItem>
                        <FormItem className="suitablePeople longItem" {...formItemLayout_14} label="适宜人群：">
                            {getFieldDecorator('suitablePeople', {
                                rules: [{
                                    required: true,
                                    message: '适宜人群不能为空',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写该课程适宜人群" rows={2}/>
                            )}
                        </FormItem>
                        <FormItem className="courseCollect longItem" {...formItemLayout_14} label="课程收获：">
                            {getFieldDecorator('courseCollect', {
                                rules: [{
                                    required: true,
                                    message: '课程收获不能为空',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写该课程收获"
                                          autosize={{minRows: 5, maxRows: 10}}/>
                            )}
                        </FormItem>
                        <FormItem className="originalPrice" {...formItemLayout_8} label="原价(￥)：">
                            {getFieldDecorator('originalPrice', {
                                rules: [{
                                    required: true,
                                    message: '课程原价不能为空',
                                }]
                            })(
                                <InputNumber min={0} precision={2} step={100}/>
                            )}
                        </FormItem>
                        <FormItem className="price" {...formItemLayout_8} label="现价(￥)：">
                            {getFieldDecorator('price', {
                                rules: [{
                                    required: true,
                                    message: '课程现价不能为空',
                                }]
                            })(
                                <InputNumber min={0} precision={2} step={100}/>
                            )}
                        </FormItem>
                        <FormItem className="area longItem" {...formItemLayout_16} label="课程地址：">
                            {getFieldDecorator('area', {
                                rules: [{
                                    required: false
                                }],
                            })(
                                <div>
                                    <Select placeholder="省" style={{width: 100, marginRight: 10}}
                                            value={area.province || undefined} onChange={(value) => {
                                        setArea(1, value)
                                    }} dropdownMatchSelectWidth={false} allowClear={true}>
                                        {provinceOptions}
                                    </Select>
                                    <Select placeholder="市" style={{width: 100, marginRight: 10}}
                                            value={area.city || undefined} onChange={(value) => {
                                        setArea(2, value)
                                    }} dropdownMatchSelectWidth={false} allowClear={true}>
                                        {cityOptions}
                                    </Select>
                                    <Select placeholder="区" style={{width: 100, marginRight: 10}}
                                            value={area.district || undefined} onChange={(value) => {
                                        setArea(3, value)
                                    }} dropdownMatchSelectWidth={false} allowClear={true}>
                                        {districtOptions}
                                    </Select>
                                    <Select placeholder="街道" style={{width: 100}} value={area.street || undefined}
                                            onChange={(value) => {
                                                setArea(4, value)
                                            }} dropdownMatchSelectWidth={false} allowClear={true}>
                                        {streetOptions}
                                    </Select>
                                </div>
                            )}
                        </FormItem>
                        <FormItem className="detailedAddress longItem" {...formItemLayout_16} label="">
                            {getFieldDecorator('detailedAddress', {
                                rules: [{
                                    required: true,
                                    message: '详细地址不能为空',
                                }],
                            })(
                                <Input placeholder="请输入详细地址信息，如道路、门牌号、小区、楼栋号、单元室等"
                                       onBlur={(event) => addressChange(event.target.value)}/>
                            )}
                        </FormItem>
                        <p className="addressSaved"
                           style={{display: type === 0 ? "none" : "block"}}>定位点：{formattedAddress || "暂无"}</p>
                        <div id="add-courseOne-container" name="container" tabIndex="0"
                             style={{display: type === 0 ? "none" : "block"}}/>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//课程新增组件
class ItemAdd extends Component {
    state = {
        visible: false,
        type: null,
        // 图片相关变量--------------------------------------
        viewPic: "",
        effectPic: "",
        data_pic: "",
        avatarEditor: {
            scale: 1,
            positionX: 0.5,
            positionY: 0.5
        },
        photoLoading: false,
        // 课程地址相关变量
        provinceList: [],
        cityList: [],
        districtList: [],
        streetList: [],
        markers: [],
        area: {
            province: "",
            city: "",
            district: "",
            street: ""
        },
        mapObj: {},
        formattedAddress: "",
        xy: {},
        areaId: null,
        confirmLoading: false
    };

    showModal = () => {
        this.setState({visible: true}, () => {
            setTimeout(() => {
                this.setState({
                    mapObj: new window.AMap.Map('add-courseOne-container', {
                        resizeEnable: true,
                        zoom: 16
                    })
                }, () => {
                    this.getProvinceList();
                    window.AMap.service('AMap.Geocoder', () => {
                        const geocoder = new window.AMap.Geocoder({extensions: "all"});
                        this.state.mapObj.on('click', (e) => {
                            // 清除已有标记点
                            this.state.mapObj.remove(this.state.markers);
                            // 经纬度写入
                            this.setXY({x: e.lnglat.lng, y: e.lnglat.lat});
                            // 生成当前标记点
                            const marker = new window.AMap.Marker({
                                map: this.state.mapObj,
                                bubble: true
                            });
                            marker.setPosition(e.lnglat);
                            this.state.mapObj.setCenter(marker.getPosition());
                            this.state.markers.push(marker);
                            geocoder.getAddress([e.lnglat.lng, e.lnglat.lat], (status, result) => {
                                if (status === 'complete' && result.info === 'OK') {
                                    this.setFormattedAddress(result.regeocode.formattedAddress);
                                    // 其他地址信息写入
                                    this.setArea(5, result.regeocode.addressComponent);
                                }
                            });
                        });
                    })
                })
            }, 500)
        });
    };

    setType = (value) => {
        this.setState({
            type: value
        })
    };

    // 图片处理-----------------------------------
    // 初始图片写入
    setViewPic = (para) => {
        this.setState({
            viewPic: para
        })
    };
    // 设置图片缩放比例及偏移量
    setAvatarEditor = (index, value) => {
        // 设置缩放比例
        if (index === 1) {
            this.setState({
                avatarEditor: {
                    scale: value,
                    positionX: this.state.avatarEditor.positionX,
                    positionY: this.state.avatarEditor.positionY
                }
            })
        }
        // 设置X轴的偏移量
        if (index === 2) {
            this.setState({
                avatarEditor: {
                    scale: this.state.avatarEditor.scale,
                    positionX: value,
                    positionY: this.state.avatarEditor.positionY
                }
            })
        }
        // 设置Y轴的偏移量
        if (index === 3) {
            this.setState({
                avatarEditor: {
                    scale: this.state.avatarEditor.scale,
                    positionX: this.state.avatarEditor.positionX,
                    positionY: value
                }
            })
        }
    };
    // 图片上传
    picUpload = (para01, para02) => {
        // 文件对象写入formData
        const formData = new FormData();
        formData.append("file", para02);
        this.setState({
            photoLoading: true
        });
        reqwest({
            url: '/file/upload',
            type: 'json',
            method: 'post',
            processData: false,
            data: formData,
            error: (XMLHttpRequest) => {
                message.error("图片提交失败");
                this.setState({
                    photoLoading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("图片提交成功");
                    // 图片上传成功，effectPic与data_pic写入
                    this.setState({
                        effectPic: para01,
                        data_pic: json.data.url,
                        photoLoading: false
                    })
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                        this.setState({
                            photoLoading: false
                        })
                    }
                }
            }
        });
    };

    // 机构地址处理-----------------------------------
    setArea = (type, value) => {
        if (type === 1) {
            const fnFilter = (item) => {
                return item.name === value
            };
            this.setState({
                area: {
                    province: value,
                    city: "",
                    district: "",
                    street: ""
                }
            }, () => {
                this.setState({
                    cityList: this.state.provinceList.filter(fnFilter)[0] ? this.state.provinceList.filter(fnFilter)[0].districtList : [],
                    districtList: [],
                    streetList: []
                })
            })
        }
        if (type === 2) {
            const fnFilter = (item) => {
                return item.name === value
            };
            this.setState({
                area: {
                    province: this.state.area.province,
                    city: value,
                    district: "",
                    street: ""
                },
            }, () => {
                this.setState({
                    districtList: this.state.cityList.filter(fnFilter)[0] ? this.state.cityList.filter(fnFilter)[0].districtList : [],
                    streetList: []
                })
            })
        }
        if (type === 3) {
            const fnFilter = (item) => {
                return item.name === value
            };
            this.setState({
                area: {
                    province: this.state.area.province,
                    city: this.state.area.city,
                    district: value,
                    street: ""
                },
            }, () => {
                this.setState({
                    streetList: [],
                    areaId: this.state.districtList.filter(fnFilter)[0] ? this.state.districtList.filter(fnFilter)[0].adcode : null
                }, () => {
                    if (this.state.areaId) {
                        this.getStreetList();
                    }
                })
            })
        }
        if (type === 4) {
            this.setState({
                area: {
                    province: this.state.area.province,
                    city: this.state.area.city,
                    district: this.state.area.district,
                    street: value
                },
            })
        }
        if (type === 5) {
            // 获取城市列表
            const provinceFilter = (item) => {
                return item.name === value.province;
            };
            this.setState({
                cityList: this.state.provinceList.filter(provinceFilter)[0] ? this.state.provinceList.filter(provinceFilter)[0].districtList : [],
            }, () => {
                // 获取地区列表
                // 城市列表只有一条信息，如直辖市，导致value.city为空，则取城市列表第一条作为有效信息
                if (this.state.cityList.length === 1) {
                    value.city = this.state.cityList[0].name;
                }
                const cityFilter = (item) => {
                    return item.name === value.city;
                };
                this.setState({
                    districtList: this.state.cityList.filter(cityFilter)[0] ? this.state.cityList.filter(cityFilter)[0].districtList : [],
                }, () => {
                    // 根据区ID获取街道列表
                    this.state.mapObj.plugin('AMap.DistrictSearch', () => {
                        let districtSearch = new window.AMap.DistrictSearch({
                            level: 'district',
                            subdistrict: 1
                        });
                        districtSearch.search(value.adcode, (status, result) => {
                            this.setState({
                                streetList: result.districtList[0].districtList || [],
                            }, () => {
                                // 地址信息获取完全之后进行写入
                                this.setState({
                                    areaId: value.adcode,
                                    area: {
                                        province: value.province,
                                        city: value.city,
                                        district: value.district,
                                        street: value.township
                                    },
                                })
                            })
                        })
                    })
                })
            });
        }
    };
    getProvinceList = () => {
        this.state.mapObj.plugin('AMap.DistrictSearch', () => {
            var districtSearch = new window.AMap.DistrictSearch({
                level: 'country',
                subdistrict: 3
            });

            districtSearch.search('中国', (status, result) => {
                this.setState({
                    provinceList: result.districtList[0].districtList
                })
            })
        })
    };
    getStreetList = () => {
        this.state.mapObj.plugin('AMap.DistrictSearch', () => {
            var districtSearch = new window.AMap.DistrictSearch({
                level: 'district',
                subdistrict: 1
            });
            districtSearch.search(this.state.areaId, (status, result) => {
                this.setState({
                    streetList: result.districtList[0].districtList || [],
                })
            })
        })
    };
    setXY = (para) => {
        this.setState({
            xy: para
        })
    };
    setFormattedAddress = (para) => {
        this.setState({
            formattedAddress: para
        })
    };
    setMarkers = (marker) => {
        const arr = [];
        arr.push(marker);
        this.setState({
            markers: arr
        })
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
                    type: null,
                    viewPic: "",
                    effectPic: "",
                    data_pic: "",
                    avatarEditor: {
                        scale: 1,
                        positionX: 0.5,
                        positionY: 0.5
                    },
                    photoLoading: false,
                    provinceList: [],
                    cityList: [],
                    districtList: [],
                    streetList: [],
                    markers: [],
                    area: {
                        province: "",
                        city: "",
                        district: "",
                        street: ""
                    },
                    mapObj: {},
                    formattedAddress: "",
                    xy: {},
                    areaId: null,
                    confirmLoading: false
                });
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
                },
                onCancel() {
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
            if (!this.state.data_pic) {
                message.error("图片未提交");
                return
            }
            values.photo = this.state.data_pic;
            values.xy = this.state.xy;
            if (!this.state.area.street) {
                if (this.state.type === 1) {
                    message.error("请选择机构所在省、市、区及街道");
                    return
                }
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/mdhCourse/addCourse',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    name: values.name,
                    type: values.type,
                    photo: values.photo,
                    openClassDate: moment(values.openClassDate).format("YYYY-MM-DD"),
                    openClassPeopleNum: values.openClassPeopleNum,
                    teacherInfo: values.teacherInfo,
                    summary: values.summary,
                    suitablePeople: values.suitablePeople,
                    courseCollect: values.courseCollect,
                    originalPrice: values.originalPrice,
                    price: values.price,
                    lng: values.xy.x,
                    lat: values.xy.y,
                    provinceName: this.state.area.province,
                    cityName: this.state.area.city,
                    areaName: this.state.area.district,
                    areaId: this.state.areaId,
                    street: this.state.area.street,
                    openClassAddress: values.detailedAddress
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("课程添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                type: null,
                                viewPic: "",
                                effectPic: "",
                                data_pic: "",
                                avatarEditor: {
                                    scale: 1,
                                    positionX: 0.5,
                                    positionY: 0.5
                                },
                                photoLoading: false,
                                provinceList: [],
                                cityList: [],
                                districtList: [],
                                streetList: [],
                                markers: [],
                                area: {
                                    province: "",
                                    city: "",
                                    district: "",
                                    street: ""
                                },
                                mapObj: {},
                                formattedAddress: "",
                                xy: {},
                                areaId: null,
                                confirmLoading: false
                            });
                        });
                        this.props.setFlag()
                    } else {
                        if (json.code === "901") {
                            message.error("请先登录");
                            this.props.toLoginPage();
                        } else if (json.code === "902") {
                            message.error("登录信息已过期，请重新登录");
                            this.props.toLoginPage();
                        } else {
                            message.error(json.message);
                            this.setState({
                                confirmLoading: false
                            })
                        }
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
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button type="primary" onClick={this.showModal}>课程新增</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    type={this.state.type}
                    setType={this.setType}
                    viewPic={this.state.viewPic}
                    effectPic={this.state.effectPic}
                    data_pic={this.state.data_pic}
                    setViewPic={this.setViewPic}
                    avatarEditor={this.state.avatarEditor}
                    setAvatarEditor={this.setAvatarEditor}
                    picUpload={this.picUpload}
                    photoLoading={this.state.photoLoading}
                    provinceList={this.state.provinceList}
                    cityList={this.state.cityList}
                    districtList={this.state.districtList}
                    streetList={this.state.streetList}
                    markers={this.state.markers}
                    setMarkers={this.setMarkers}
                    area={this.state.area}
                    setArea={this.setArea}
                    mapObj={this.state.mapObj}
                    formattedAddress={this.state.formattedAddress}
                    setFormattedAddress={this.setFormattedAddress}
                    setXY={this.setXY}
                    confirmLoading={this.state.confirmLoading}
                />
            </div>
        );
    }
}

//课程编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, type, viewPic, effectPic, data_pic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoLoading, provinceList, cityList, districtList, streetList, markers, setMarkers, area, setArea, mapObj, setXY, setFormattedAddress, formattedAddress, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 图片处理
        const getBase64 = (img, callback) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => callback(reader.result));
            reader.readAsDataURL(img);
        };
        const setEditorRef = (editor) => this.editor = editor;
        const dataURLtoFile = (url) => {
            let arr = url.split(','),
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
            }
            return new Blob([u8arr], {type: "image/jpeg"});
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
            if (isIMG && isLt2M) {
                getBase64(file, (imageUrl) => {
                    setViewPic(imageUrl);
                });
            }
            return false
        };
        const uploadButton = (
            <div>
                <Icon type={'plus'}/>
                <div className="ant-upload-text" style={{display: viewPic ? "none" : "block"}}>选择图片</div>
            </div>
        );
        const picHandle = () => {
            if (viewPic && viewPic.slice(26) !== data_pic) {
                const canvas = this.editor.getImage();
                const url = canvas.toDataURL("image/jpeg", 0.92);
                if (url === effectPic) {
                    message.error("图片未改动，无法提交");
                    return
                }
                const file = dataURLtoFile(url);
                picUpload(url, file)
            } else {
                message.error("图片未改动，无法提交");
            }
        };
        const partImg = (
            <AvatarEditor
                ref={setEditorRef}
                image={viewPic}
                width={250}
                height={120}
                border={0}
                color={[255, 255, 255, 0.6]}
                scale={avatarEditor.scale}
                position={{x: avatarEditor.positionX, y: avatarEditor.positionY}}
                rotate={0}
            />
        );

        //开课日期选择限制
        function disabledDate(current) {
            return current && current < moment().endOf('day');
        }

        // 课程地址相关
        const provinceOptions = provinceList.map(item => <Option key={item.name}>{item.name}</Option>);
        const cityOptions = cityList.map(item => <Option key={item.name}>{item.name}</Option>);
        const districtOptions = districtList.map(item => <Option key={item.name}>{item.name}</Option>);
        const streetOptions = streetList.map(item => <Option key={item.name}>{item.name}</Option>);
        const addressChange = (value) => {
            if (!value) {
                return
            }
            let keyword = "";
            keyword = keyword + area.province + area.city + area.district + area.street;
            keyword = keyword + value;
            // 清除已有标记点
            mapObj.remove(markers);
            mapObj.plugin('AMap.Geocoder', function () {
                const geocoder = new window.AMap.Geocoder({});
                const marker = new window.AMap.Marker({
                    map: mapObj,
                    bubble: true
                });
                geocoder.getLocation(keyword, (status_, result_) => {
                    if (status_ === 'complete' && result_.info === 'OK') {
                        geocoder.getAddress([result_.geocodes[0].location.lng, result_.geocodes[0].location.lat], (status, result) => {
                            if (status === 'complete' && result.info === 'OK') {
                                // 经纬度写入
                                setXY({x: result_.geocodes[0].location.lng, y: result_.geocodes[0].location.lat});
                                // 生成当前标记点
                                marker.setPosition(result_.geocodes[0].location);
                                mapObj.setCenter(marker.getPosition());
                                setMarkers(marker);
                                // address字段写入
                                setFormattedAddress(area.street ? keyword : result.regeocode.addressComponent.province + result.regeocode.addressComponent.city + result.regeocode.addressComponent.district + result.regeocode.addressComponent.township + keyword);
                                // 其他地址信息写入
                                setArea(5, result.regeocode.addressComponent);
                            }
                        });
                    }
                });
            });
        };

        return (
            <Modal
                visible={visible}
                title="课程编辑"
                width={750}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                {
                    JSON.stringify(data) === "{}" ?
                        <div className="spin-box">
                            <Spin/>
                        </div>
                        :
                        <div className="courseOne-edit courseOne-form item-form">
                            <Form layout="vertical">
                                <FormItem className="name longItem" {...formItemLayout_14} label="课程名称：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.name,
                                        rules: [{
                                            required: true,
                                            max: 30,
                                            message: '请按要求填写课程名称',
                                        }],
                                    })(
                                        <Input placeholder="请输入课程名称（30字以内）"/>
                                    )}
                                </FormItem>
                                <FormItem className="photo" {...formItemLayout_12} label="图片：">
                                    {getFieldDecorator('photo', {
                                        initialValue: viewPic,
                                        rules: [{
                                            required: true,
                                            message: '课程图片不能为空',
                                        }],
                                    })(
                                        <div className="itemBox">
                                            <Upload
                                                name="file"
                                                listType="picture-card"
                                                className="avatar-uploader"
                                                showUploadList={false}
                                                action="/file/upload"
                                                beforeUpload={beforeUpload}
                                            >
                                                {viewPic ? partImg : uploadButton}
                                            </Upload>
                                            <Row>
                                                <Col span={4}>缩放：</Col>
                                                <Col span={12}>
                                                    <Slider min={1} max={1.5} step={0.01} value={avatarEditor.scale}
                                                            disabled={!viewPic}
                                                            onChange={(value) => {
                                                                setAvatarEditor(1, value)
                                                            }}/>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={4}>X：</Col>
                                                <Col span={12}>
                                                    <Slider min={0} max={1} step={0.01} value={avatarEditor.positionX}
                                                            disabled={!viewPic}
                                                            onChange={(value) => {
                                                                setAvatarEditor(2, value)
                                                            }}/>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={4}>Y：</Col>
                                                <Col span={12}>
                                                    <Slider min={0} max={1} step={0.01} value={avatarEditor.positionY}
                                                            disabled={!viewPic}
                                                            onChange={(value) => {
                                                                setAvatarEditor(3, value)
                                                            }}/>
                                                </Col>
                                            </Row>
                                            <Button type="primary"
                                                    onClick={picHandle}
                                                    loading={photoLoading}
                                                    style={{
                                                        position: "absolute",
                                                        right: "-20px",
                                                        bottom: "0"
                                                    }}>图片提交</Button>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem className="teacherInfo" {...formItemLayout_12} label="教师信息：">
                                    {getFieldDecorator('teacherInfo', {
                                        initialValue: data.teacherInfo,
                                        rules: [{
                                            required: true,
                                            message: '教师信息'
                                        }]
                                    })(
                                        <Input placeholder="请输入教师信息"/>
                                    )}
                                </FormItem>
                                <FormItem className="openClassPeopleNum" {...formItemLayout_8} label="课程人数：">
                                    {getFieldDecorator('openClassPeopleNum', {
                                        initialValue: data.openClassPeopleNum,
                                        rules: [{
                                            required: true,
                                            message: '课程人数不能为空',
                                        }]
                                    })(
                                        <InputNumber min={0} precision={0} step={1}/>
                                    )}
                                </FormItem>
                                <FormItem className="openClassDate" {...formItemLayout_8} label="开课时间：">
                                    {getFieldDecorator('openClassDate', {
                                        initialValue: data.openClassDate ? moment(data.openClassDate) : null,
                                        rules: [{
                                            required: true,
                                            message: '开课时间不能为空',
                                        }]
                                    })(
                                        <DatePicker disabledDate={disabledDate}
                                                    placeholder="请选择日期"/>
                                    )}
                                </FormItem>
                                <FormItem className="summary longItem" {...formItemLayout_14} label="课程概述：">
                                    {getFieldDecorator('summary', {
                                        initialValue: data.summary,
                                        rules: [{
                                            required: true,
                                            message: '课程概述不能为空',
                                        }],
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写课程概述"
                                                  autosize={{minRows: 3, maxRows: 10}}/>
                                    )}
                                </FormItem>
                                <FormItem className="suitablePeople longItem" {...formItemLayout_14} label="适宜人群：">
                                    {getFieldDecorator('suitablePeople', {
                                        initialValue: data.suitablePeople,
                                        rules: [{
                                            required: true,
                                            message: '适宜人群不能为空',
                                        }],
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写该课程适宜人群" rows={2}/>
                                    )}
                                </FormItem>
                                <FormItem className="courseCollect longItem" {...formItemLayout_14} label="课程收获：">
                                    {getFieldDecorator('courseCollect', {
                                        initialValue: data.courseCollect,
                                        rules: [{
                                            required: true,
                                            message: '课程收获不能为空',
                                        }],
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写该课程收获"
                                                  autosize={{minRows: 3, maxRows: 10}}/>
                                    )}
                                </FormItem>
                                <FormItem className="originalPrice" {...formItemLayout_8} label="课程原价：">
                                    {getFieldDecorator('originalPrice', {
                                        initialValue: data.originalPrice,
                                        rules: [{
                                            required: true,
                                            message: '课程原价不能为空',
                                        }]
                                    })(
                                        <InputNumber min={0} precision={2} step={100}/>
                                    )}
                                </FormItem>
                                <FormItem className="price" {...formItemLayout_8} label="课程现价：">
                                    {getFieldDecorator('price', {
                                        initialValue: data.price,
                                        rules: [{
                                            required: true,
                                            message: '课程现价不能为空',
                                        }]
                                    })(
                                        <InputNumber min={0} precision={2} step={100}/>
                                    )}
                                </FormItem>
                                <FormItem className="area longItem" {...formItemLayout_16} label="课程地址：">
                                    {getFieldDecorator('area', {
                                        rules: [{
                                            required: false
                                        }],
                                    })(
                                        <div>
                                            <Select placeholder="省" style={{width: 100, marginRight: 10}}
                                                    value={area.province || undefined} onChange={(value) => {
                                                setArea(1, value)
                                            }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                {provinceOptions}
                                            </Select>
                                            <Select placeholder="市" style={{width: 100, marginRight: 10}}
                                                    value={area.city || undefined} onChange={(value) => {
                                                setArea(2, value)
                                            }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                {cityOptions}
                                            </Select>
                                            <Select placeholder="区" style={{width: 100, marginRight: 10}}
                                                    value={area.district || undefined} onChange={(value) => {
                                                setArea(3, value)
                                            }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                {districtOptions}
                                            </Select>
                                            <Select placeholder="街道" style={{width: 100}}
                                                    value={area.street || undefined}
                                                    onChange={(value) => {
                                                        setArea(4, value)
                                                    }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                {streetOptions}
                                            </Select>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem className="detailedAddress longItem" {...formItemLayout_16} label="">
                                    {getFieldDecorator('detailedAddress', {
                                        initialValue: data.openClassAddress,
                                        rules: [{
                                            required: true,
                                            message: '详细地址不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请填写详细地址"
                                               onBlur={(event) => addressChange(event.target.value)}/>
                                    )}
                                </FormItem>
                                <p className="addressSaved"
                                   style={{display: type === 0 ? "none" : "block"}}>定位点：{formattedAddress || "暂无"}</p>
                                <div id="edit-courseOne-container" name="container" tabIndex="0"
                                     style={{display: type === 0 ? "none" : "block"}}/>
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

//课程编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,
        // 课程基本信息
        data: {},
        // 课程图片相关变量
        viewPic: "",
        effectPic: "",
        data_pic: "",
        avatarEditor: {
            scale: 1,
            positionX: 0.5,
            positionY: 0.5
        },
        photoLoading: false,
        // 课程地址相关变量
        provinceList: [],
        cityList: [],
        districtList: [],
        streetList: [],
        markers: [],
        area: {
            province: "",
            city: "",
            district: "",
            street: ""
        },
        mapObj: {},
        formattedAddress: "",
        xy: {},
        areaId: null,
        addressLoading: true,
        // 提交按钮状态变量
        confirmLoading: false
    };

    dateHandle = (para) => {
        const tempDate = new Date(para.replace("CST", "GMT+0800")),
            oMonthT = (tempDate.getMonth() + 1).toString(),
            oMonth = oMonthT.length <= 1 ? "0" + oMonthT : oMonthT,
            oDayT = tempDate.getDate().toString(),
            oDay = oDayT.length <= 1 ? "0" + oDayT : oDayT,
            oYear = tempDate.getFullYear().toString(),
            oTime = oYear + '-' + oMonth + '-' + oDay;
        return oTime;
    };

    getData = () => {
        reqwest({
            url: '/mdhCourse/getCourse',
            type: 'json',
            method: 'post',
            data: {
                id: this.props.id
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         mdhCourse: {
                //             name: "",
                //             photo: "",
                //             openClassDate: "",
                //             openClassPeopleNum: null,
                //             teacherInfo: "",
                //             summary: "",
                //             suitablePeople: "",
                //             courseCollect: "",
                //             originalPrice: "",
                //             price: "",
                //             lat: "30.29194",
                //             lng: "120.007284",
                //             provinceId: 330000,
                //             provinceName: "浙江省",
                //             areaId: 330110,
                //             areaName: "余杭区",
                //             cityId: 330100,
                //             cityName: "杭州市",
                //             street: "仓前街道",
                //             openClassAddress: "",
                //             type: null,
                //             state: null
                //         }
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    // 开课时间处理与写入
                    json.data.mdhCourse.openClassDate = json.data.mdhCourse.openClassDate ? this.dateHandle(json.data.mdhCourse.openClassDate) : "";
                    this.setState({
                        data: json.data.mdhCourse,
                        viewPic: "http://image.taoerxue.com/" + json.data.mdhCourse.photo,
                        effectPic: "http://image.taoerxue.com/" + json.data.mdhCourse.photo,
                        data_pic: json.data.mdhCourse.photo,
                        area: {
                            province: json.data.mdhCourse.provinceName,
                            city: json.data.mdhCourse.cityName,
                            district: json.data.mdhCourse.areaName,
                            street: json.data.mdhCourse.street
                        },
                        formattedAddress: json.data.mdhCourse.provinceName + json.data.mdhCourse.cityName + json.data.mdhCourse.areaName + json.data.mdhCourse.street + json.data.mdhCourse.openClassAddress,
                        xy: {
                            x: json.data.mdhCourse.lng,
                            y: json.data.mdhCourse.lat
                        },
                        areaId: json.data.mdhCourse.areaId
                    }, () => {
                        // 课程地址相关操作
                        this.setState({
                            mapObj: new window.AMap.Map("edit-courseOne-container", {
                                resizeEnable: true,
                                zoom: 16,
                                center: this.state.data.lng ? [this.state.data.lng, this.state.data.lat] : ""
                            })
                        }, () => {
                            this.state.mapObj.on('complete', () => {
                                // 获取省份列表
                                this.getProvinceList();
                                // 生成当前标记点
                                const marker = new window.AMap.Marker({
                                    map: this.state.mapObj,
                                    bubble: true
                                });
                                marker.setPosition(this.state.mapObj.G.center);
                                this.state.mapObj.setCenter(marker.getPosition());
                                this.state.markers.push(marker);
                                // 地图点击事件
                                window.AMap.service('AMap.Geocoder', () => {
                                    const geocoder = new window.AMap.Geocoder({extensions: "all"});
                                    this.state.mapObj.on('click', (e) => {
                                        // 清除已有标记点
                                        this.state.mapObj.remove(this.state.markers);
                                        // 经纬度写入
                                        this.setXY({x: e.lnglat.lng, y: e.lnglat.lat});
                                        // 生成当前标记点
                                        const marker = new window.AMap.Marker({
                                            map: this.state.mapObj,
                                            bubble: true
                                        });
                                        marker.setPosition(e.lnglat);
                                        this.state.mapObj.setCenter(marker.getPosition());
                                        this.state.markers.push(marker);
                                        geocoder.getAddress([e.lnglat.lng, e.lnglat.lat], (status, result) => {
                                            if (status === 'complete' && result.info === 'OK') {
                                                this.setFormattedAddress(result.regeocode.formattedAddress);
                                                // 其他地址信息写入
                                                this.setArea(5, result.regeocode.addressComponent);
                                            }
                                        });
                                    });
                                })
                            });
                        })
                    });
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                    }
                }
            }
        });
    };

    showModal = () => {
        this.getData();
        this.setState({visible: true});
    };

    //图片处理
    //由图片网络url获取其base64编码
    getBase64Image = (url, width, height) => {//width、height调用时传入具体像素值，控制大小 ,不传则默认图像大小
        const image = new Image();
        image.crossOrigin = '';
        image.src = url;
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width ? width : image.width;
            canvas.height = height ? height : image.height;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL("image/jpeg", 0.92);
            this.setState({
                viewPic: dataURL,
                effectPic: dataURL,
            })
        };
    };
    // 初始图片写入
    setViewPic = (para) => {
        this.setState({
            viewPic: para
        })
    };
    // 设置图片缩放比例及偏移量
    setAvatarEditor = (index, value) => {
        if (this.state.viewPic.slice(26) === this.state.data_pic) {
            // 图片有比例和偏移量的改动时，判断viewPic路径是否为网络路径，是则表明当前改动为第一次改动，此时需将viewPic,effectPic路径转为base64编码存入
            this.getBase64Image(this.state.viewPic)
        }
        if (index === 1) {
            this.setState({
                avatarEditor: {
                    scale: value,
                    positionX: this.state.avatarEditor.positionX,
                    positionY: this.state.avatarEditor.positionY
                }
            })
        }
        if (index === 2) {
            this.setState({
                avatarEditor: {
                    scale: this.state.avatarEditor.scale,
                    positionX: value,
                    positionY: this.state.avatarEditor.positionY
                }
            })
        }
        if (index === 3) {
            this.setState({
                avatarEditor: {
                    scale: this.state.avatarEditor.scale,
                    positionX: this.state.avatarEditor.positionX,
                    positionY: value
                }
            })
        }
    };
    // 图片上传
    picUpload = (para01, para02) => {
        const formData = new FormData();
        formData.append("file", para02);
        this.setState({
            photoLoading: true
        });
        reqwest({
            url: '/file/upload',
            type: 'json',
            method: 'post',
            processData: false,
            data: formData,
            error: (XMLHttpRequest) => {
                message.error("图片提交失败");
                this.setState({
                    photoLoading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("图片提交成功");
                    this.setState({
                        effectPic: para01,
                        data_pic: json.data.url,
                        photoLoading: false
                    })
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                        this.setState({
                            photoLoading: false
                        })
                    }
                }
            }
        });
    };

    // 机构地址处理-----------------------------------
    setArea = (type, value) => {
        // 省份信息变更
        if (type === 1) {
            const fnFilter = (item) => {
                return item.name === value
            };
            this.setState({
                area: {
                    province: value,
                    city: "",
                    district: "",
                    street: ""
                }
            }, () => {
                this.setState({
                    cityList: this.state.provinceList.filter(fnFilter)[0] ? this.state.provinceList.filter(fnFilter)[0].districtList : [],
                    districtList: [],
                    streetList: []
                })
            })
        }
        // 城市信息变更
        if (type === 2) {
            const fnFilter = (item) => {
                return item.name === value
            };
            this.setState({
                area: {
                    province: this.state.area.province,
                    city: value,
                    district: "",
                    street: ""
                },
            }, () => {
                this.setState({
                    districtList: this.state.cityList.filter(fnFilter)[0] ? this.state.cityList.filter(fnFilter)[0].districtList : [],
                    streetList: []
                })
            })
        }
        // 区信息变更
        if (type === 3) {
            const fnFilter = (item) => {
                return item.name === value
            };
            this.setState({
                area: {
                    province: this.state.area.province,
                    city: this.state.area.city,
                    district: value,
                    street: ""
                },
            }, () => {
                this.setState({
                    streetList: [],
                    areaId: this.state.districtList.filter(fnFilter)[0] ? this.state.districtList.filter(fnFilter)[0].adcode : null
                }, () => {
                    if (this.state.areaId) {
                        this.getStreetList();
                    }
                })
            })
        }
        // 街道信息变更
        if (type === 4) {
            this.setState({
                area: {
                    province: this.state.area.province,
                    city: this.state.area.city,
                    district: this.state.area.district,
                    street: value
                },
            })
        }
        // 地址信息整体写入
        if (type === 5) {
            // 获取城市列表
            const provinceFilter = (item) => {
                return item.name === value.province;
            };
            this.setState({
                cityList: this.state.provinceList.filter(provinceFilter)[0] ? this.state.provinceList.filter(provinceFilter)[0].districtList : [],
            }, () => {
                // 获取地区列表
                // 城市列表只有一条信息，如直辖市，导致value.city为空，则取城市列表第一条作为有效信息
                if (this.state.cityList.length === 1) {
                    value.city = this.state.cityList[0].name;
                }
                const cityFilter = (item) => {
                    return item.name === value.city;
                };
                this.setState({
                    districtList: this.state.cityList.filter(cityFilter)[0] ? this.state.cityList.filter(cityFilter)[0].districtList : [],
                }, () => {
                    // 根据区ID获取街道列表
                    this.state.mapObj.plugin('AMap.DistrictSearch', () => {
                        let districtSearch = new window.AMap.DistrictSearch({
                            level: 'district',
                            subdistrict: 1
                        });
                        districtSearch.search(String(value.adcode), (status, result) => {
                            this.setState({
                                streetList: result.districtList ? result.districtList[0].districtList : [],
                            }, () => {
                                // 地址信息获取完全之后进行写入
                                this.setState({
                                    areaId: value.adcode,
                                    area: {
                                        province: value.province,
                                        city: value.city,
                                        district: value.district,
                                        street: value.township
                                    },
                                    addressLoading: false
                                })
                            })
                        })
                    })
                })
            });
        }
    };
    // 获取省列表（包含市区信息）
    getProvinceList = () => {
        this.state.mapObj.plugin('AMap.DistrictSearch', () => {
            const districtSearch = new window.AMap.DistrictSearch({
                level: 'country',
                subdistrict: 3
            });
            districtSearch.search('中国', (status, result) => {
                this.setState({
                    provinceList: result.districtList[0].districtList
                }, () => {
                    const addressComponent = {
                        province: this.state.data.provinceName,
                        city: this.state.data.cityName,
                        district: this.state.data.areaName,
                        township: this.state.data.street,
                        adcode: this.state.data.areaId
                    };
                    this.setArea(5, addressComponent)
                })
            })
        })
    };
    // 根据区Id获取街道列表
    getStreetList = () => {
        this.state.mapObj.plugin('AMap.DistrictSearch', () => {
            let districtSearch = new window.AMap.DistrictSearch({
                level: 'district',
                subdistrict: 1
            });
            districtSearch.search(this.state.areaId, (status, result) => {
                this.setState({
                    streetList: result.districtList[0].districtList || [],
                })
            })
        })
    };
    // 经纬度写入
    setXY = (para) => {
        this.setState({
            xy: para
        })
    };
    // 定位地址写入
    setFormattedAddress = (para) => {
        this.setState({
            formattedAddress: para
        })
    };
    // 地图标记点信息记录
    setMarkers = (marker) => {
        const arr = [];
        arr.push(marker);
        this.setState({
            markers: arr
        })
    };

    dataContrast = (values) => {
        const initValues = this.state.data;
        const itemList = ["name", "photo", "teacherInfo", "openClassDate", "openClassPeopleNum", "summary", "suitablePeople", "courseCollect", "originalPrice", "price", "provinceName", "cityName", "areaName", "areaId", "street", "openClassAddress"];
        const result = {};

        itemList.forEach((item) => {
            if (values[item] !== initValues[item]) {
                result[item] = values[item];
            }
        });
        if (JSON.stringify(result) === "{}") {
            return false;
        } else {
            result.id = this.props.id;
            result.lng = values.lng;
            result.lat = values.lat;
            return result;
        }
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
                    data: {},
                    viewPic: "",
                    effectPic: "",
                    data_pic: "",
                    avatarEditor: {
                        scale: 1,
                        positionX: 0.5,
                        positionY: 0.5
                    },
                    photoLoading: false,
                    provinceList: [],
                    cityList: [],
                    districtList: [],
                    streetList: [],
                    markers: [],
                    area: {
                        province: "",
                        city: "",
                        district: "",
                        street: ""
                    },
                    mapObj: {},
                    formattedAddress: "",
                    xy: {},
                    areaId: null,
                    addressLoading: true,
                    confirmLoading: false
                });
            })
        };
        // data空值处理
        if (JSON.stringify(this.state.data) === "{}") {
            cancel();
            return;
        }
        // 地址信息加载中处理
        if (this.state.addressLoading) {
            message.warning("地图信息加载中，请稍后进行操作");
            return
        }
        form.validateFields((err, values) => {
            values.photo = this.state.data_pic;
            values.openClassDate = moment(values.openClassDate).format("YYYY-MM-DD");
            values.lng = this.state.xy.x;
            values.lat = this.state.xy.y;
            values.provinceName = this.state.area.province;
            values.cityName = this.state.area.city;
            values.areaName = this.state.area.district;
            values.areaId = Number(this.state.areaId);
            values.street = this.state.area.street;
            values.openClassAddress = values.detailedAddress;
            const result = this.dataContrast(values);
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
                cancel()
            }
        })
    };

    handleCreate = () => {
        if (JSON.stringify(this.state.data) === "{}") {
            return;
        }
        const form = this.form;
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            if (!this.state.data_pic) {
                message.error("图片未提交");
                return
            }
            values.photo = this.state.data_pic;
            values.openClassDate = moment(values.openClassDate).format("YYYY-MM-DD");
            values.lng = this.state.xy.x;
            values.lat = this.state.xy.y;
            values.provinceName = this.state.area.province;
            values.cityName = this.state.area.city;
            values.areaName = this.state.area.district;
            values.areaId = Number(this.state.areaId);
            values.street = this.state.area.street;
            values.openClassAddress = values.detailedAddress;
            if (!this.state.area.street) {
                message.error("请选择机构所在省、市、区及街道");
                return
            }
            const result = this.dataContrast(values);
            if (!result) {
                message.error("暂无信息更改");
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/mdhCourse/updateCourse',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: result,
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("课程编辑成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                data: {},
                                viewPic: "",
                                effectPic: "",
                                data_pic: "",
                                avatarEditor: {
                                    scale: 1,
                                    positionX: 0.5,
                                    positionY: 0.5
                                },
                                photoLoading: false,
                                provinceList: [],
                                cityList: [],
                                districtList: [],
                                streetList: [],
                                markers: [],
                                area: {
                                    province: "",
                                    city: "",
                                    district: "",
                                    street: ""
                                },
                                mapObj: {},
                                formattedAddress: "",
                                xy: {},
                                areaId: null,
                                addressLoading: true,
                                confirmLoading: false
                            });
                        });
                        this.props.recapture()
                    } else {
                        if (json.code === "901") {
                            message.error("请先登录");
                            this.props.toLoginPage();
                        } else if (json.code === "902") {
                            message.error("登录信息已过期，请重新登录");
                            this.props.toLoginPage();
                        } else {
                            message.error(json.message);
                            this.setState({
                                confirmLoading: false
                            })
                        }
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
                <span onClick={this.showModal}>编辑</span>
                <ItemEditForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    data={this.state.data}
                    type={this.state.data.type}
                    viewPic={this.state.viewPic}
                    effectPic={this.state.effectPic}
                    data_pic={this.state.data_pic}
                    setViewPic={this.setViewPic}
                    avatarEditor={this.state.avatarEditor}
                    setAvatarEditor={this.setAvatarEditor}
                    picUpload={this.picUpload}
                    photoLoading={this.state.photoLoading}
                    provinceList={this.state.provinceList}
                    cityList={this.state.cityList}
                    districtList={this.state.districtList}
                    streetList={this.state.streetList}
                    markers={this.state.markers}
                    setMarkers={this.setMarkers}
                    area={this.state.area}
                    setArea={this.setArea}
                    mapObj={this.state.mapObj}
                    formattedAddress={this.state.formattedAddress}
                    setFormattedAddress={this.setFormattedAddress}
                    setXY={this.setXY}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//课程详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        data: "",
        loading: true
    };

    showModal = () => {
        this.getData();
        this.setState({
            visible: true,
        })
    };

    dateHandle = (para) => {
        const tempDate = new Date(para.replace("CST", "GMT+0800")),
            oMonthT = (tempDate.getMonth() + 1).toString(),
            oMonth = oMonthT.length <= 1 ? "0" + oMonthT : oMonthT,
            oDayT = tempDate.getDate().toString(),
            oDay = oDayT.length <= 1 ? "0" + oDayT : oDayT,
            oYear = tempDate.getFullYear().toString(),
            oTime = oYear + '-' + oMonth + '-' + oDay;
        return oTime;
    };

    getData = () => {
        reqwest({
            url: '/mdhCourse/getCourse',
            type: 'json',
            method: 'post',
            data: {
                id: this.props.id
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                })
                // const json = {
                //     result: 0,
                //     data: {
                //         mdhCourse: {
                //             type: 1,
                //             name: "",
                //             photo: "",
                //             openClassDate: "",
                //             openClassPeopleNum: null,
                //             teacherInfo: "",
                //             summary: "",
                //             suitablePeople: "",
                //             courseCollect: "",
                //             originalPrice: "",
                //             price: "",
                //             openClassAddress: "",
                //             opinion: "",
                //             state: null
                //         }
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        data: json.data.mdhCourse
                    });
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                        this.setState({
                            loading: false
                        })
                    }
                }
            }
        });
    };

    handleCancel = () => {
        this.setState({visible: false});
    };

    render() {
        let dataSource;
        if (this.state.data) {
            let tempType = "";
            if (this.state.data.type === 0) {
                tempType = "线上课程"
            }
            if (this.state.data.type === 1) {
                tempType = "线下课程"
            }
            let tempState = "";
            if (this.state.data.state === 0) {
                tempState = "暂存";
            }
            if (this.state.data.state === 1) {
                tempState = "审核中";
            }
            if (this.state.data.state === 2) {
                tempState = "审核通过";
            }
            if (this.state.data.state === 3) {
                tempState = "审核驳回";
            }
            if (this.state.data.state === 4) {
                tempState = "已下架";
            }
            dataSource = [
                <div className="name">
                    <span className="item-name">课程名称：</span>
                    <span className="item-content">{this.state.data.name}</span>
                </div>,
                <div className="type">
                    <span className="item-name">课程类型：</span>
                    <span className="item-content">{tempType}</span>
                </div>,
                <div className="photo">
                    <span className="item-name">图片：</span>
                    <img src={"http://image.taoerxue.com/" + this.state.data.photo} alt="" className="item-content"/>
                </div>,
                <div className="openClassDate">
                    <span className="item-name">开课时间：</span>
                    <span
                        className="item-content">{this.state.data.openClassDate ? this.dateHandle(this.state.data.openClassDate) : ""}</span>
                </div>,
                <div className="openClassPeopleNum">
                    <span className="item-name">课程人数：</span>
                    <span className="item-content">{this.state.data.openClassPeopleNum}</span>
                </div>,
                <div className="openClassAddress">
                    <span className="item-name">开课地点：</span>
                    <span className="item-content">{this.state.data.openClassAddress}</span>
                </div>,
                <div className="summary">
                    <span className="item-name">课程概述：</span>
                    <span className="item-content">{this.state.data.summary}</span>
                </div>,
                <div className="teacherInfo">
                    <span className="item-name">教师信息：</span>
                    <span className="item-content">{this.state.data.teacherInfo}</span>
                </div>,
                <div className="suitablePeople">
                    <span className="item-name">适宜人群：</span>
                    <span className="item-content">{this.state.data.suitablePeople}</span>
                </div>,
                <div className="courseCollect">
                    <span className="item-name">课程收获：</span>
                    <span className="item-content">{this.state.data.courseCollect}</span>
                </div>,
                <div className="originalPrice">
                    <span className="item-name">原价：</span>
                    <span className="item-content">￥{this.state.data.originalPrice}</span>
                </div>,
                <div className="price">
                    <span className="item-name">现价：</span>
                    <span className="item-content">￥{this.state.data.price}</span>
                </div>,
                <div className="opinion">
                    <span className="item-name">审核意见：</span>
                    <span className="item-content">{this.state.data.opinion || "暂无"}</span>
                </div>,
                <div className="state">
                    <span className="item-name">课程状态：</span>
                    <span className="item-content">{tempState}</span>
                </div>
            ];
        } else {
            dataSource = ""
        }
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>详情</span>
                <Modal
                    title="课程详情"
                    width={600}
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                    destroyOnClose={true}
                >
                    <div className="courseOne-details">
                        <div className="courseOne-baseData">
                            <List
                                size="small"
                                split="false"
                                dataSource={dataSource}
                                renderItem={item => (<List.Item>{item}</List.Item>)}
                                loading={this.state.loading}
                            />
                        </div>
                    </div>
                </Modal>
            </a>
        );
    }
}

//课时添加表单
const LessonAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, viewPic, effectPic, data_pic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoLoading, audioLoading, fn_audio, data_audio, type, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 图片处理
        // 由图片文件对象获取其base64编码
        const getBase64 = (img, callback) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => callback(reader.result));
            reader.readAsDataURL(img);
        };
        const setEditorRef = (editor) => this.editor = editor;
        // 由图片地址获取其文件对象
        const dataURLtoFile = (url) => {
            let arr = url.split(','),
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
            }
            return new Blob([u8arr], {type: "image/jpeg"});
        };
        // 图片选择之后的相关操作
        const beforeUpload = (file) => {
            // 文件类型校验
            const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isIMG) {
                message.error('文件类型错误');
            }
            // 文件大小校验
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('文件不能大于2M');
            }
            // 校验通过，将初始图片写入
            if (isIMG && isLt2M) {
                getBase64(file, (imageUrl) => {
                    setViewPic(imageUrl);
                });
            }
            // 阻止选择文件后的默认上传操作
            return false
        };
        // 点击图片提交按钮的相关操作
        const picHandle = () => {
            if (viewPic) {
                // 初始图片已经写入的分支操作
                // 由绘制出的canvas元素获取有效图片的base64编码并与已有的有效图片编码进行比对
                const canvas = this.editor.getImage();
                const url = canvas.toDataURL("image/jpeg", 0.92);
                if (url === effectPic) {
                    // 比对结果一致，即图片没有更改，直接return
                    message.error("图片未改动，无法提交");
                    return
                }
                // 获取有效图片文件对象
                const file = dataURLtoFile(url);
                // 图片上传
                picUpload(url, file)
            } else {
                // 初始图片未写入的分支操作
                message.error("图片未选择");
            }
        };
        // 图片选择框：图片文件未选择时展示
        const uploadButton = (
            <div>
                <Icon type={'plus'}/>
                <div className="ant-upload-text">选择图片</div>
            </div>
        );
        // 展示有效图片的canvas元素：图片文件已选择时展示
        const partImg = (
            <AvatarEditor
                ref={setEditorRef}
                image={viewPic}
                width={150}
                height={100}
                border={0}
                color={[255, 255, 255, 0.6]}
                scale={avatarEditor.scale}
                position={{x: avatarEditor.positionX, y: avatarEditor.positionY}}
                rotate={0}
            />
        );

        //音频
        const beforeAudioUpload = (file) => {
            const isMP3 = file.type === 'audio/mp3';
            if (!isMP3) {
                message.error('文件类型错误');
                return false;
            }
            const isLt100M = file.size / 1024 / 1024 < 100;
            if (!isLt100M) {
                message.error('文件不能大于100M');
                return false;
            }
            if (isMP3 && isLt100M) {
                fn_audio(true, file.name, file);
            }
            return false;
        };
        const audioUploadButton = (
            <div>
                <Icon type={audioLoading ? 'loading' : 'plus'}/>
                <div className="ant-upload-text" style={{display: audioLoading ? "none" : "block"}}>添加文件</div>
            </div>
        );

        //日期选择限制
        function disabledDate(current) {
            return current && current < moment().endOf('day');
        }

        return (
            <Modal
                visible={visible}
                title="课时添加"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="lessonOne-add lessonOne-form item-form">
                    <Form layout="vertical">
                        <FormItem className="title longItem" {...formItemLayout_14} label="标题：">
                            {getFieldDecorator('title', {
                                rules: [{
                                    required: true,
                                    max: 18,
                                    message: '请按要求填写课时标题',
                                }]
                            })(
                                <Input placeholder="请输入课时标题（18字以内）"/>
                            )}
                        </FormItem>
                        <FormItem className="photo" {...formItemLayout_12} label="图片：">
                            {getFieldDecorator('photo', {
                                rules: [{
                                    required: true,
                                    message: '请上传课时图片',
                                }],
                            })(
                                <div className="itemBox">
                                    <Upload
                                        name="file"
                                        listType="picture-card"
                                        className="avatar-uploader"
                                        showUploadList={false}
                                        action="/file/upload"
                                        beforeUpload={beforeUpload}
                                    >
                                        {viewPic ? partImg : uploadButton}
                                    </Upload>
                                    <Row>
                                        <Col span={4}>缩放：</Col>
                                        <Col span={12}>
                                            <Slider min={1} max={1.5} step={0.01} value={avatarEditor.scale}
                                                    disabled={!viewPic}
                                                    onChange={(value) => {
                                                        setAvatarEditor(1, value)
                                                    }}/>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={4}>X：</Col>
                                        <Col span={12}>
                                            <Slider min={0} max={1} step={0.01} value={avatarEditor.positionX}
                                                    disabled={!viewPic}
                                                    onChange={(value) => {
                                                        setAvatarEditor(2, value)
                                                    }}/>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={4}>Y：</Col>
                                        <Col span={12}>
                                            <Slider min={0} max={1} step={0.01} value={avatarEditor.positionY}
                                                    disabled={!viewPic}
                                                    onChange={(value) => {
                                                        setAvatarEditor(3, value)
                                                    }}/>
                                        </Col>
                                    </Row>
                                    <Button type="primary"
                                            onClick={picHandle}
                                            loading={photoLoading}
                                            style={{
                                                position: "absolute",
                                                right: "-20px",
                                                bottom: "0"
                                            }}>{data_pic ? "重新提交" : "图片提交"}</Button>
                                </div>
                            )}
                        </FormItem>
                        <FormItem className="startDate" {...formItemLayout_8} label="开课日期：">
                            {getFieldDecorator('startDate', {
                                rules: [{
                                    required: true,
                                    message: '开课日期不能为空',
                                }]
                            })(
                                <DatePicker disabledDate={disabledDate}
                                            placeholder="请选择日期"/>
                            )}
                        </FormItem>
                        <FormItem className="startTime" {...formItemLayout_8} label="开课时间：">
                            {getFieldDecorator('startTime', {
                                rules: [{
                                    required: true,
                                    message: '开课日期不能为空',
                                }]
                            })(
                                <TimePicker placeholder="请选择时间"
                                            format={'HH:mm'}/>
                            )}
                        </FormItem>
                        <FormItem className="summary longItem" {...formItemLayout_14} label="简介：">
                            {getFieldDecorator('summary', {
                                rules: [{
                                    required: true,
                                    message: '课时简介不能为空'
                                }]
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写课时简介" rows={10}/>
                            )}
                        </FormItem>
                        <FormItem className="audio" {...formItemLayout_8}
                                  style={{display: type === 0 ? "block" : "none"}}
                                  label="音频文件：">
                            {getFieldDecorator('audio', {
                                rules: [{
                                    required: type === 0,
                                    message: '请上传音频文件',
                                }],
                            })(
                                <Upload
                                    name="file"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    showUploadList={false}
                                    beforeUpload={beforeAudioUpload}
                                >
                                    {data_audio ? <p>{data_audio}</p> : audioUploadButton}
                                </Upload>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        )
    }
);

//课时添加组件
class LessonAdd extends Component {
    state = {
        visible: false,
        // 图片相关变量--------------------------------------
        viewPic: "",
        effectPic: "",
        data_pic: "",
        avatarEditor: {
            scale: 1,
            positionX: 0.5,
            positionY: 0.5
        },
        photoLoading: false,
        // 音频相关变量
        data_audio: "",
        file: "",
        fileList: [],
        audioLoading: false,
        confirmLoading: false
    };

    showModal = () => {
        this.setState({visible: true});
    };

    // 图片处理-----------------------------------
    // 初始图片写入
    setViewPic = (para) => {
        this.setState({
            viewPic: para
        })
    };
    // 设置图片缩放比例及偏移量
    setAvatarEditor = (index, value) => {
        // 设置缩放比例
        if (index === 1) {
            this.setState({
                avatarEditor: {
                    scale: value,
                    positionX: this.state.avatarEditor.positionX,
                    positionY: this.state.avatarEditor.positionY
                }
            })
        }
        // 设置X轴的偏移量
        if (index === 2) {
            this.setState({
                avatarEditor: {
                    scale: this.state.avatarEditor.scale,
                    positionX: value,
                    positionY: this.state.avatarEditor.positionY
                }
            })
        }
        // 设置Y轴的偏移量
        if (index === 3) {
            this.setState({
                avatarEditor: {
                    scale: this.state.avatarEditor.scale,
                    positionX: this.state.avatarEditor.positionX,
                    positionY: value
                }
            })
        }
    };
    // 图片上传
    picUpload = (para01, para02) => {
        // 文件对象写入formData
        const formData = new FormData();
        formData.append("file", para02);
        this.setState({
            photoLoading: true
        });
        reqwest({
            url: '/file/upload',
            type: 'json',
            method: 'post',
            processData: false,
            data: formData,
            error: (XMLHttpRequest) => {
                message.error("图片提交失败");
                this.setState({
                    photoLoading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("图片提交成功");
                    // 图片上传成功，effectPic与data_pic写入
                    this.setState({
                        effectPic: para01,
                        data_pic: json.data.url,
                        photoLoading: false
                    })
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                        this.setState({
                            photoLoading: false
                        })
                    }
                }
            }
        });
    };

    //音频处理
    fn_audio = (audioLoading, fileName, file) => {
        this.setState({
            audioLoading: audioLoading,
            data_audio: fileName || "",
            file: file
        });
        this.setState(({fileList}) => ({
            fileList: [...fileList, file],
        }));
    };
    audioUpload = (para) => {
        const formData = new FormData();
        formData.append("file", this.state.file);
        reqwest({
            url: '/file/uploadAudio',
            type: 'json',
            method: 'post',
            processData: false,
            headers: {
                ClassId: para,
                type: 1
            },
            data: formData,
            error: () => {
                message.error("音频提交失败");
                this.props.setNewCourseOne(0, this.props.id);
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("音频上传成功");
                    this.props.setNewCourseOne(0, this.props.id);
                } else {
                    this.props.setNewCourseOne(0, this.props.id);
                    if (json.code === "901") {
                        message.error("请先登录");
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                        this.setState({
                            photoLoading: false
                        })
                    }
                }
            }
        });
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false,
            }, () => {
                this.setState({
                    viewPic: "",
                    effectPic: "",
                    data_pic: "",
                    avatarEditor: {
                        scale: 1,
                        positionX: 0.5,
                        positionY: 0.5
                    },
                    photoLoading: false,
                    data_audio: "",
                    file: "",
                    fileList: [],
                    audioLoading: false,
                    confirmLoading: false
                });
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
                },
                onCancel() {
                }
            });
        } else {
            cancel()
        }
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            if (!this.state.data_pic) {
                message.error("图片未提交");
                return
            }
            values.photo = this.state.data_pic;
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/mdhClass/addClass',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    courseId: this.props.id,
                    title: values.title,
                    photo: values.photo,
                    openClassTime: moment(values.startDate).format("YYYY-MM-DD") + " " + moment(values.startTime).format("HH:MM"),
                    summary: values.summary
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        if (this.props.type === 0) {
                            this.props.setNewCourseOne(1, this.props.id);
                            message.success("添加成功、正在上传，请耐心等待");
                            this.audioUpload(json.data);
                            this.setState({
                                visible: false
                            }, () => {
                                this.setState({
                                    viewPic: "",
                                    effectPic: "",
                                    data_pic: "",
                                    avatarEditor: {
                                        scale: 1,
                                        positionX: 0.5,
                                        positionY: 0.5
                                    },
                                    photoLoading: false,
                                    data_audio: "",
                                    file: "",
                                    fileList: [],
                                    audioLoading: false,
                                    confirmLoading: false
                                });
                            })
                        }
                        if (this.props.type === 1) {
                            message.success("课时添加成功");
                            this.setState({
                                visible: false
                            }, () => {
                                this.setState({
                                    viewPic: "",
                                    effectPic: "",
                                    data_pic: "",
                                    avatarEditor: {
                                        scale: 1,
                                        positionX: 0.5,
                                        positionY: 0.5
                                    },
                                    photoLoading: false,
                                    data_audio: "",
                                    file: "",
                                    fileList: [],
                                    audioLoading: false,
                                    confirmLoading: false
                                });
                            })
                        }
                    } else {
                        if (json.code === "901") {
                            message.error("请先登录");
                            this.props.toLoginPage();
                        } else if (json.code === "902") {
                            message.error("登录信息已过期，请重新登录");
                            this.props.toLoginPage();
                        } else {
                            message.error(json.message);
                            this.setState({
                                confirmLoading: false
                            })
                        }
                    }
                }
            })
        })
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={() => this.showModal(this.props.id)}>课时添加</span>
                <LessonAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    viewPic={this.state.viewPic}
                    effectPic={this.state.effectPic}
                    data_pic={this.state.data_pic}
                    setViewPic={this.setViewPic}
                    avatarEditor={this.state.avatarEditor}
                    setAvatarEditor={this.setAvatarEditor}
                    picUpload={this.picUpload}
                    photoLoading={this.state.photoLoading}
                    audioLoading={this.state.audioLoading}
                    fn_audio={this.fn_audio}
                    data_audio={this.state.data_audio}
                    type={this.props.type}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//课时列表表格
const LessonListTable = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, pagination, data, columns, pageChange, loading} = props;

        return (
            <Modal
                width={1100}
                visible={visible}
                title="课时列表"
                footer={null}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
            >
                <div className="lessonOne-list">
                    <Table bordered pagination={pagination} dataSource={data} columns={columns}
                           onChange={pageChange} loading={loading}/>
                </div>
            </Modal>
        );
    }
);

//课时列表组件
class LessonList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            loading: true,
            data: [],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.lessonOneSize) || 10,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            },
        };
        this.columns = this.props.type === 0 ?
            [
                {
                    title: '序号',
                    dataIndex: 'index',
                    width: '6%',
                },
                {
                    title: '课时标题',
                    dataIndex: 'title',
                    width: '30%',
                    render: (text, record) => this.renderEditableColumns(text, record, 'title'),
                },
                {
                    title: '开课日期',
                    dataIndex: 'startDate',
                    width: '15%',
                    render: (text, record) => this.renderEditableColumns(text, record, 'startDate'),
                },
                {
                    title: '开课时间',
                    dataIndex: 'startTime',
                    width: '10%',
                    render: (text, record) => this.renderEditableColumns(text, record, 'startTime'),
                },
                {
                    title: '音频地址',
                    dataIndex: 'linkAddress',
                    width: '25%',
                    render: (text, record) => this.renderColumns(text, record, 'linkAddress'),
                },
                {
                    title: '操作',
                    dataIndex: '操作',
                    render: (text, record) => {
                        const {editable} = record;
                        return (
                            <div className="editable-row-operations"
                                 style={{display: this.props.opStatus ? "block" : "none"}}>
                                {
                                    editable ?
                                        <span>
											<a onClick={() => this.save(record.key, record.parentKey)}>保存</a>
											<Popconfirm title="确认取消?"
                                                        onConfirm={() => this.cancel(record.key, record.parentKey)}>
												<a>取消</a>
											</Popconfirm>
                                        </span>
                                        :
                                        <a style={{display: Number(sessionStorage.EId) === 0 ? "none" : "display"}}
                                           onClick={() => this.edit(record.key, record.parentKey)}>编辑</a>
                                }
                                <Popconfirm title="确认删除?"
                                            placement="topRight"
                                            onConfirm={() => this.itemDelete(record.id)}
                                            onCancel=""
                                            okType="danger"
                                            okText="立即删除"
                                            cancelText="取消">
                                    {
                                        editable ?
                                            null :
                                            <a>删除</a>
                                    }
                                </Popconfirm>
                            </div>
                        )
                    }
                }
            ]
            :
            [
                {
                    title: '序号',
                    dataIndex: 'index',
                    width: '6%',
                },
                {
                    title: '课时标题',
                    dataIndex: 'title',
                    width: '30%',
                    render: (text, record) => this.renderEditableColumns(text, record, 'title'),
                },
                {
                    title: '开课日期',
                    dataIndex: 'startDate',
                    width: '15%',
                    render: (text, record) => this.renderEditableColumns(text, record, 'startDate'),
                },
                {
                    title: '开课时间',
                    dataIndex: 'startTime',
                    width: '10%',
                    render: (text, record) => this.renderEditableColumns(text, record, 'startTime'),
                },
                {
                    title: '操作',
                    dataIndex: '操作',
                    render: (text, record) => {
                        const {editable} = record;
                        return (
                            <div className="editable-row-operations"
                                 style={{display: this.props.opStatus ? "block" : "none"}}>
                                {
                                    editable ?
                                        <span>
										    <a onClick={() => this.save(record.key, record.parentKey)}>保存</a>
												<Popconfirm title="确认取消?"
                                                            onConfirm={() => this.cancel(record.key, record.parentKey)}>
												    <a>取消</a>
												</Popconfirm>
										</span>
                                        :
                                        <a style={{display: Number(sessionStorage.EId) === 0 ? "none" : "display"}}
                                           onClick={() => this.edit(record.key, record.parentKey)}>编辑</a>
                                }
                                <Popconfirm title="确认删除?"
                                            placement="topRight"
                                            onConfirm={() => this.itemDelete(record.id)}
                                            onCancel=""
                                            okType="danger"
                                            okText="立即删除"
                                            cancelText="取消">
                                    {
                                        editable ?
                                            null :
                                            <a>删除</a>
                                    }
                                </Popconfirm>
                            </div>
                        )
                    }
                }
            ];
        this.cacheData = [];
    }

    dateHandle = (para) => {
        const tempDate = new Date(para.replace("CST", "GMT+0800")),
            oMonthT = (tempDate.getMonth() + 1).toString(),
            oMonth = oMonthT.length <= 1 ? "0" + oMonthT : oMonthT,
            oDayT = tempDate.getDate().toString(),
            oDay = oDayT.length <= 1 ? "0" + oDayT : oDayT,
            oYear = tempDate.getFullYear().toString(),
            oTime = oYear + '-' + oMonth + '-' + oDay;
        return oTime;
    };

    timeHandle = (para) => {
        const tempDate = new Date(para.replace("CST", "GMT+0800")),
            oHourT = tempDate.getHours().toString(),
            oHour = oHourT.length <= 1 ? "0" + oHourT : oHourT,
            oMinuteT = tempDate.getMinutes().toString(),
            oMinute = oMinuteT.length <= 1 ? "0" + oMinuteT : oMinuteT,
            oTime = oHour + ":" + oMinute;
        return oTime;
    };

    //获取课时列表
    getData = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/mdhClass/getClassList',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                courseId: this.props.id
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                });
                // const json = {
                //     result: 0,
                //     data: {
                //         list: [
                //             {
                //                 id: 1,
                //                 title: "测试001",
                //                 openClassTime: "Wed Nov 07 11:28:58 CST 2018",
                //                 linkAddress: "",
                //             }
                //         ],
                //         size: 10
                //     },
                // };
            },
            success: (json) => {
                const data = [];
                if (json.result === 0) {
                    json.data.list.forEach((item, index) => {
                        data.push({
                            key: item.id,
                            id: item.id,
                            index: index + 1,
                            title: item.title,
                            startDate: item.openClassTime ? this.dateHandle(item.openClassTime) : "",
                            startTime: item.openClassTime ? this.timeHandle(item.openClassTime) : "",
                            linkAddress: item.linkAddress ? "http://image.taoerxue.com/" + item.linkAddress : "无"
                        });
                    });
                    this.cacheData = data.map(item => ({...item}));
                    this.setState({
                        loading: false,
                        data: data,
                        pagination: {
                            total: json.data.size,
                            current: this.state.pagination.current,
                            pageSize: this.state.pagination.pageSize,
                            pageSizeOptions: ["5", "10", "15", "20"],
                            showQuickJumper: true,
                            showSizeChanger: true
                        }
                    });
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                        this.setState({
                            loading: false
                        })
                    }
                }
            }
        })
    };

    //课时删除
    itemDelete = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/mdhClass/deleteClass',
            type: 'json',
            method: 'post',
            data: {
                id: para
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("课时删除成功");
                    this.getData();
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                        this.setState({
                            loading: false
                        })
                    }
                }
            }
        });
    };

    showModal = () => {
        this.getData();
        this.setState({visible: true});
    };

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    renderEditableColumns(text, record, column) {
        return (
            <EditableCell
                editable={record.editable}
                value={text}
                onChange={value => this.handleChange(value, record.key, column)}
            />
        );
    }

    handleChange(value, key, column) {
        const newData = [...this.state.data];
        const target = newData.filter(item => key === item.key)[0];
        if (target) {
            target[column] = value;
            this.setState({data: newData});
        }
    }

    edit(key) {
        const newData = [...this.state.data];
        const target = newData.filter(item => key === item.key)[0];
        if (target) {
            target.editable = true;
            this.setState({data: newData});
        }
    }

    dataContrast = (value, initValue, id) => {
        const itemList = ["title"];
        const result = {};
        itemList.forEach((item) => {
            if (value[item] !== initValue[item]) {
                result[item] = value[item];
            }
        });
        if (value.startDate !== initValue.startDate) {
            result.openClassTime = value.startDate + " " + initValue.startTime;
        }
        if (value.startTime !== initValue.startTime) {
            result.openClassTime = initValue.startDate + " " + value.startTime
        }
        if (JSON.stringify(result) === "{}") {
            return false;
        } else {
            result.id = id;
            return result;
        }
    };

    save(key) {
        const newData = [...this.state.data];
        const target = newData.filter(item => key === item.key)[0];
        if (target) {
            const result = this.dataContrast(target, this.cacheData.filter(item => key === item.key)[0], target.id);
            if (!result) {
                return;
            }
            this.setState({
                loading: true
            });
            reqwest({
                url: '/mdhClass/modifyClass',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: result,
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    Object.assign(target, this.cacheData.filter(item => key === item.key)[0]);
                    delete target.editable;
                    this.setState({
                        loading: false,
                        data: newData
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("课时信息编辑成功");
                        this.getData();
                    } else {
                        if (json.code === "901") {
                            message.error("请先登录");
                            // 返回登陆页
                            this.props.toLoginPage();
                        } else if (json.code === "902") {
                            message.error("登录信息已过期，请重新登录");
                            // 返回登陆页
                            this.props.toLoginPage();
                        } else {
                            message.error(json.message);
                            Object.assign(target, this.cacheData.filter(item => key === item.key)[0]);
                            delete target.editable;
                            this.setState({
                                loading: false,
                                data: newData
                            })
                        }
                    }
                }
            })
        }
    }

    cancel(key) {
        const newData = [...this.state.data];
        const target = newData.filter(item => key === item.key)[0];
        if (target) {
            Object.assign(target, this.cacheData.filter(item => key === item.key)[0]);
            delete target.editable;
            this.setState({data: newData});
        }
    }

    //页码变化处理
    pageChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.lessonOneSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.lessonOneSize);
        this.setState({
            pagination: pager
        })
    };

    //开课日期字段处理
    fn_openTime = (date, dateString) => {
        this.setState({
            data_openDate: dateString
        });
    };

    handleCancel = () => {
        this.setState({
            visible: false
        }, () => {
            this.setState({
                loading: true,
                data: [],
            })
        })
    };

    render() {
        return (
            <a>
                <span onClick={() => this.showModal(this.props.id)}>课时列表</span>
                <LessonListTable
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    pagination={this.state.pagination}
                    loading={this.state.loading}
                    data={this.state.data}
                    columns={this.columns}
                    pageChange={this.pageChange}
                />
            </a>
        );
    }
}

//课程列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.courseOneSize) || 10,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            },
            newCourseOne: {}
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '课程名称',
                dataIndex: 'name',
                width: '25%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '课程类型',
                dataIndex: 'type',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'type'),
            },
            {
                title: '图片',
                dataIndex: 'photo',
                width: '8%',
                render: (text, record) => (<img style={{width: '50px', height: "24px"}} alt="" src={record["photo"]}/>)
            },
            {
                title: '开课日期',
                dataIndex: 'openClassDate',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'openClassDate'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*课程详情*/}
                            <ItemDetails id={record.id} toLoginPage={this.props.toLoginPage}
                                         opStatus={this.props.opObj.select}/>
                            {/*课程编辑*/}
                            <ItemEdit id={record.id} recapture={this.getData} toLoginPage={this.props.toLoginPage}
                                      opStatus={(record.state === 0 || record.state === 3 || record.state === 4) && this.props.opObj.modify}/>
                            {/*课时添加*/}
                            <LessonAdd id={record.id} type={record.typeCode} setNewCourseOne={this.setNewCourseOne}
                                       toLoginPage={this.props.toLoginPage}
                                       opStatus={(record.state === 0 || record.state === 3 || record.state === 4) && this.props.opObj.modify}/>
                            {/*课时列表*/}
                            <LessonList id={record.id} type={record.typeCode} toLoginPage={this.props.toLoginPage}
                                        opStatus={(record.state === 0 || record.state === 3 || record.state === 4) && this.props.opObj.modify}/>
                            <Popconfirm title="确认提交?"
                                        placement="topRight"
                                        onConfirm={() => this.itemSubmit(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="确认"
                                        cancelText="取消">
                                <a style={{display: (record.state === 0 || record.state === 3 || record.state === 4) && this.props.opObj.modify ? "inline" : "none"}}>提交审核</a>
                            </Popconfirm>
                            <Popconfirm title="确认取消审核?"
                                        placement="topRight"
                                        onConfirm={() => this.itemSubmitCancel(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="确认"
                                        cancelText="取消">
                                <a style={{display: record.state === 1 && this.props.opObj.modify ? "inline" : "none"}}>取消审核</a>
                            </Popconfirm>
                            <Popconfirm title="确认下架?"
                                        placement="topRight"
                                        onConfirm={() => this.itemWithdraw(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="确认"
                                        cancelText="取消">
                                <a style={{display: record.state === 2 && this.props.opObj.modify ? "inline" : "none"}}>下架</a>
                            </Popconfirm>
                            <Popconfirm title="确认删除?"
                                        placement="topRight"
                                        onConfirm={() => this.itemDelete(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="立即删除"
                                        cancelText="取消">
                                <a style={{display: (record.state === 0 || record.state === 3 || record.state === 4) && this.props.opObj.delete ? "inline" : "none"}}>删除</a>
                            </Popconfirm>
                            <Icon
                                style={{display: this.state.newCourseOne[record.id] >= 1 ? "inline" : "none"}}
                                type="loading"/>
                        </div>
                    );
                },
            }
        ]
    }

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    //日期处理
    dateHandle = (para) => {
        const tempDate = new Date(para.replace("CST", "GMT+0800")),
            oMonthT = (tempDate.getMonth() + 1).toString(),
            oMonth = oMonthT.length <= 1 ? "0" + oMonthT : oMonthT,
            oDayT = tempDate.getDate().toString(),
            oDay = oDayT.length <= 1 ? "0" + oDayT : oDayT,
            oYear = tempDate.getFullYear().toString(),
            oTime = oYear + '-' + oMonth + '-' + oDay;
        return oTime;
    };

    //获取本页信息
    getData = (type, keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/mdhCourse/courseList',
            type: 'json',
            method: 'post',
            data: {
                state: type === undefined ? this.props.type : type,
                name: keyword === undefined ? this.props.keyword : keyword,
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                });
                // const json = {
                //     result: 0,
                //     data: {
                //         size: 100,
                //         list: [
                //             {
                //                 id: 1,
                //                 name: "",
                //                 type: 1,
                //                 photo: "",
                //                 openClassDate: "",
                //                 openClassPeopleNum: null,
                //                 teacherInfo: "",
                //                 summary: "",
                //                 suitablePeople: "",
                //                 courseCollect: "",
                //                 originalPrice: "",
                //                 price: "",
                //                 openClassAddress: "",
                //                 state: 0
                //             },
                //             {
                //                 id: 2,
                //                 name: "",
                //                 type: 0,
                //                 photo: "",
                //                 openClassDate: "",
                //                 openClassPeopleNum: null,
                //                 teacherInfo: "",
                //                 summary: "",
                //                 suitablePeople: "",
                //                 courseCollect: "",
                //                 originalPrice: "",
                //                 price: "",
                //                 openClassAddress: "",
                //                 state: 0
                //             }
                //         ]
                //     }
                // };
            },
            success: (json) => {
                const data = [];
                if (json.result === 0) {
                    if (json.data.list.length === 0 && this.state.pagination.current !== 1) {
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
                    json.data.list.forEach((item, index) => {
                        let tempType = "";
                        if (item.type === 0) {
                            tempType = "线上课程"
                        }
                        if (item.type === 1) {
                            tempType = "线下课程"
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            name: item.name,
                            typeCode: item.type,
                            type: tempType,
                            photo: "http://image.taoerxue.com/" + item.photo,
                            openClassDate: item.openClassDate ? this.dateHandle(item.openClassDate) : "",
                            state: item.state
                        });
                    });
                    this.setState({
                        loading: false,
                        data: data,
                        pagination: {
                            total: json.data.size,
                            current: this.state.pagination.current,
                            pageSize: this.state.pagination.pageSize
                        }
                    });
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                        this.setState({
                            loading: false
                        })
                    }
                }
            }
        });
    };

    setNewCourseOne = (type, id) => {
        let data = this.state.newCourseOne;
        if (type === 0) {
            data[id] = data[id] - 1
        }
        if (type === 1) {
            data[id] = data[id] === undefined ? 1 : data[id] + 1
        }
        this.setState({
            newCourseOne: data
        })
    };

    //提交审核
    itemSubmit = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/mdhCourse/submitCourse',
            type: 'json',
            method: 'post',
            data: {
                id: para
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("提交审核成功");
                    this.getData();
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                        this.setState({
                            loading: false
                        })
                    }
                }
            }
        });
    };

    //取消审核
    itemSubmitCancel = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/mdhCourse/cancelCourse',
            type: 'json',
            method: 'post',
            data: {
                id: para
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("取消审核成功");
                    this.getData();
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                        this.setState({
                            loading: false
                        })
                    }
                }
            }
        });
    };

    //下架
    itemWithdraw = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/mdhCourse/dropCourse',
            type: 'json',
            method: 'post',
            data: {
                id: para
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("课程下架成功");
                    this.getData();
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                        this.setState({
                            loading: false
                        })
                    }
                }
            }
        });
    };

    //删除
    itemDelete = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/mdhCourse/deleteCourse',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: para
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("课程删除成功");
                    this.getData();
                } else {
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === "902") {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else {
                        message.error(json.message);
                        this.setState({
                            loading: false
                        })
                    }
                }
            }
        });
    };

    //页码变化处理
    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.courseOneSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.courseOneSize);
        this.setState({
            pagination: pager,
        }, () => {
            this.getData();
        });
    };

    componentWillMount() {
        this.getData();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.type !== this.props.type) {
            this.getData(nextProps.type, this.props.keyword);
        }
        if (nextProps.keyword !== this.props.keyword) {
            this.getData(this.props.type, nextProps.keyword);
        }
        if (nextProps.flag_add !== this.props.flag_add) {
            this.getData();
        }
    }

    render() {
        return <Table bordered
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={this.state.pagination}
                      columns={this.columns}
                      onChange={this.handleTableChange}/>;
    }
}

class CourseOne extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            type: "0",
            keyword: "",
            flag_add: false
        }
    };

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
        // 菜单信息为空则直接返回登陆页
        if (!sessionStorage.menuList) {
            this.toLoginPage();
            return
        }
        JSON.parse(sessionStorage.menuList).forEach((item) => {
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

    //tab状态设置
    setType = (value) => {
        this.setState({
            type: value
        })
    };

    search = (value) => {
        this.setState({
            keyword: value
        })
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
            this.setFlag()
        }
    }

    render() {
        return (
            <div className="courseOne">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                <Tabs defaultActiveKey={this.state.type} onChange={this.setType}>
                                    <TabPane tab="暂存" key="0"/>
                                    <TabPane tab="审核中" key="1"/>
                                    <TabPane tab="审核通过" key="2"/>
                                    <TabPane tab="已驳回" key="3"/>
                                    <TabPane tab="已下架" key="4"/>
                                </Tabs>
                                {/*课程新增*/}
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd opStatus={this.state.opObj.add} setFlag={this.setFlag}
                                             toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            <div className="keyWord clearfix">
                                <Search
                                    placeholder="请输入课程名称信息"
                                    onSearch={this.search}
                                    enterButton
                                    style={{width: "320px", float: "left"}}
                                />
                            </div>
                            {/*课程列表*/}
                            <div className="table-box">
                                <DataTable
                                    opObj={this.state.opObj}
                                    type={this.state.type}
                                    keyword={this.state.keyword}
                                    flag_add={this.state.flag_add}
                                    toLoginPage={this.toLoginPage}/>
                            </div>
                            <p className="hint">注：体验课无需添加课时，非体验课必须添加课时。</p>
                        </div>
                        :
                        <p>暂无查询权限</p>
                }
            </div>
        )
    }
}

export default CourseOne;