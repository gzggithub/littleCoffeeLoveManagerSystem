import React, {Component} from 'react';
import {
    Input,
    InputNumber,
    Select,
    Table,
    Modal,
    Form,
    Upload,
    Icon,
    Slider,
    Row,
    Col,
    message,
    Popconfirm,
    Button,
    Spin
} from 'antd';
import reqwest from 'reqwest';
import AvatarEditor from 'react-avatar-editor'
import institutionStatus1 from "../../static/images/institutionStatus1.png";
import institutionStatus2 from "../../static/images/institutionStatus2.png";
import institutionStatus3 from "../../static/images/institutionStatus3.png";
import institutionStatus4 from "../../static/images/institutionStatus4.png";

const {Option} = Select;
const FormItem = Form.Item;
const {TextArea} = Input;
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

//机构信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, id, data, typeList, viewPic01, setViewPic01, picUpload01, avatarEditor01, setAvatarEditor01, photoList01, setPhotoList01, photoLoading, viewPic02, setViewPic02, data_pic02, effectPic02, picUpload02, avatarEditor02, setAvatarEditor02, logoLoading, provinceList, cityList, districtList, streetList, markers, setMarkers, area, setArea, mapObj, setXY, setFormattedAddress, formattedAddress, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 机构类型选项生成
        const optionsOfTypeList = [];
        typeList.forEach((item, index) => {
            optionsOfTypeList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
        });

        // 已上传图片列表
        const photoExist01 = [];
        photoList01.forEach((item, index) => {
            photoExist01.push(
                <div className="photoExist-item clearfix" key={index + 1}>
                    <img src={"http://image.taoerxue.com/" + item} alt=""/>
                    <div className="remove">
                        <Button type="dashed"
                                shape="circle" icon="minus" onClick={() => setPhotoList01(index)}/>
                    </div>
                </div>
            )
        });

        // 由图片文件对象获取其base64编码
        const getBase64 = (img, callback) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => callback(reader.result));
            reader.readAsDataURL(img);
        };
        // 由图片地址获取其文件对象
        const dataURLtoFile = (url, filename) => {
            let arr = url.split(','),
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
            }
            return new File([u8arr], filename, {type: "image/jpeg"});
        };

        // 机构图片相关
        const setEditorRef01 = (editor) => this.editor01 = editor;
        const beforeUpload01 = (file) => {
            const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isIMG) {
                message.error('文件类型错误');
                return false
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('文件不能大于2M');
                return false
            }
            getBase64(file, (imageUrl) => {
                setViewPic01(imageUrl);
            });
            return false
        };
        const uploadButton01 = (
            <div>
                <Icon type={'plus'}/>
                <div className="ant-upload-text" style={{display: viewPic01 ? "none" : "block"}}>选择图片</div>
            </div>
        );
        const picHandle01 = () => {
            if (viewPic01) {
                const canvas = this.editor01.getImage();
                const url = canvas.toDataURL("image/jpeg", 0.92);
                const file = dataURLtoFile(url, "effective.jpg");
                picUpload01(file)
            } else {
                message.error("图片未选择");
            }
        };
        const partImg01 = (
            <AvatarEditor
                ref={setEditorRef01}
                image={viewPic01}
                width={180}
                height={100}
                border={0}
                color={[255, 255, 255, 0.6]}
                scale={avatarEditor01.scale}
                position={{x: avatarEditor01.positionX, y: avatarEditor01.positionY}}
                rotate={0}
            />
        );

        // 机构LOGO相关
        const setEditorRef02 = (editor) => this.editor02 = editor;
        const beforeUpload02 = (file) => {
            const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isIMG) {
                message.error('文件类型错误');
                return false
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('文件不能大于2M');
                return false
            }
            getBase64(file, (imageUrl) => {
                setViewPic02(imageUrl);
            });
            return false
        };
        const uploadButton02 = (
            <div>
                <Icon type={'plus'}/>
                <div className="ant-upload-text" style={{display: viewPic02 ? "none" : "block"}}>选择图片</div>
            </div>
        );
        const picHandle02 = () => {
            if (viewPic02 && viewPic02.slice(26) !== data_pic02) {
                const canvas = this.editor02.getImage();
                const url = canvas.toDataURL("png", 0.92);
                if (url === effectPic02) {
                    message.error("图片未改动，无法提交");
                    return
                }
                const file = dataURLtoFile(url, "effective.jpg");
                picUpload02(url, file)
            } else {
                message.error("图片未改动，无法提交");
            }
        };
        const partImg02 = (
            <AvatarEditor
                ref={setEditorRef02}
                image={viewPic02}
                width={80}
                height={80}
                border={0}
                color={[255, 255, 255, 0.6]}
                scale={avatarEditor02.scale}
                position={{x: avatarEditor02.positionX, y: avatarEditor02.positionY}}
                rotate={0}
            />
        );

        // 机构地址相关
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
                title="机构编辑"
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
                        <div className="institution-edit institution-form item-form">
                            <Form layout="vertical">
                                <FormItem className="name" {...formItemLayout_12} label="机构名称：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.name,
                                        rules: [{
                                            required: true,
                                            message: '机构名称不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入机构名称"/>
                                    )}
                                </FormItem>
                                <FormItem className="typeIds" {...formItemLayout_12} label="机构类型：">
                                    {getFieldDecorator('typeIds', {
                                        initialValue: data.typeIds,
                                        rules: [{
                                            required: true,
                                            message: '机构类型不能为空',
                                        }],
                                    })(
                                        <Select
                                            mode="multiple"
                                            style={{width: '100%'}}
                                            placeholder="请选择机构所属类型（最多三项）"
                                        >
                                            {optionsOfTypeList}
                                        </Select>
                                    )}
                                </FormItem>
                                <FormItem className="telephone" {...formItemLayout_8} label="机构电话：">
                                    {getFieldDecorator('telephone', {
                                        initialValue: data.telephone,
                                        rules: [{
                                            required: true,
                                            message: '机构电话不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入机构电话号码"/>
                                    )}
                                </FormItem>
                                <FormItem className="photo" {...formItemLayout_14} label="机构图片：">
                                    {getFieldDecorator('photo', {
                                        initialValue: photoList01[0],
                                        rules: [{
                                            required: true,
                                            message: '机构图片不能为空',
                                        }],
                                    })(
                                        <div className="itemBox">
                                            {photoExist01}
                                            <Upload
                                                name="file"
                                                listType="picture-card"
                                                className="avatar-uploader"
                                                showUploadList={false}
                                                action="/file/upload"
                                                beforeUpload={beforeUpload01}
                                            >
                                                {viewPic01 ? partImg01 : uploadButton01}
                                                <p className="hint">（可上传1-5张图片）</p>
                                            </Upload>
                                            <Row>
                                                <Col span={4}>缩放：</Col>
                                                <Col span={12}>
                                                    <Slider min={1} max={1.5} step={0.01} value={avatarEditor01.scale}
                                                            disabled={!viewPic01}
                                                            onChange={(value) => {
                                                                setAvatarEditor01(1, value)
                                                            }}/>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={4}>X：</Col>
                                                <Col span={12}>
                                                    <Slider min={0} max={1} step={0.01} value={avatarEditor01.positionX}
                                                            disabled={!viewPic01}
                                                            onChange={(value) => {
                                                                setAvatarEditor01(2, value)
                                                            }}/>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={4}>Y：</Col>
                                                <Col span={12}>
                                                    <Slider min={0} max={1} step={0.01} value={avatarEditor01.positionY}
                                                            disabled={!viewPic01}
                                                            onChange={(value) => {
                                                                setAvatarEditor01(3, value)
                                                            }}/>
                                                </Col>
                                            </Row>
                                            <Button type="primary"
                                                    onClick={picHandle01}
                                                    loading={photoLoading}
                                                    style={{
                                                        position: "absolute",
                                                        right: "-20px",
                                                        bottom: "0"
                                                    }}>
                                                图片提交
                                            </Button>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem className="description longItem" {...formItemLayout_14} label="机构简介：">
                                    {getFieldDecorator('description', {
                                        initialValue: data.description,
                                        rules: [{
                                            required: true,
                                            message: '机构简介不能为空',
                                        }],
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写机构简介" rows={10}/>
                                    )}
                                </FormItem>
                                <FormItem className="icon" {...formItemLayout_12} label="机构LOGO：">
                                    {getFieldDecorator('icon', {
                                        initialValue: viewPic02,
                                        rules: [{
                                            required: true,
                                            message: '机构LOGO不能为空',
                                        }],
                                    })(
                                        <div className="itemBox">
                                            <Upload
                                                name="file"
                                                listType="picture-card"
                                                className="avatar-uploader"
                                                showUploadList={false}
                                                action="/file/upload"
                                                beforeUpload={beforeUpload02}
                                            >
                                                {viewPic02 ? partImg02 : uploadButton02}
                                            </Upload>
                                            <Row>
                                                <Col span={4}>缩放：</Col>
                                                <Col span={12}>
                                                    <Slider min={0.5} max={1.5} step={0.01} value={avatarEditor02.scale}
                                                            disabled={!viewPic02}
                                                            onChange={(value) => {
                                                                setAvatarEditor02(1, value)
                                                            }}/>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={4}>X：</Col>
                                                <Col span={12}>
                                                    <Slider min={0} max={1} step={0.01} value={avatarEditor02.positionX}
                                                            disabled={!viewPic02}
                                                            onChange={(value) => {
                                                                setAvatarEditor02(2, value)
                                                            }}/>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={4}>Y：</Col>
                                                <Col span={12}>
                                                    <Slider min={0} max={1} step={0.01} value={avatarEditor02.positionY}
                                                            disabled={!viewPic02}
                                                            onChange={(value) => {
                                                                setAvatarEditor02(3, value)
                                                            }}/>
                                                </Col>
                                            </Row>
                                            <Button type="primary"
                                                    onClick={picHandle02}
                                                    loading={logoLoading}
                                                    style={{
                                                        position: "absolute",
                                                        right: "-20px",
                                                        bottom: "0"
                                                    }}>图片提交</Button>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem className="area longItem" {...formItemLayout_16} label="机构地址：">
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
                                        initialValue: data.detailedAddress,
                                        rules: [{
                                            required: true,
                                            message: '详细地址不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请填写详细地址"
                                               onBlur={(event) => addressChange(event.target.value)}/>
                                    )}
                                </FormItem>
                                <p className="addressSaved">定位点：{formattedAddress || "暂无"}</p>
                                <div id={"edit-institution-container" + id} name="container" tabIndex="0"
                                     style={{
                                         width: "520px",
                                         height: "320px",
                                         marginLeft: "50px",
                                         marginBottom: "10px"
                                     }}/>
                                <FormItem className="companyName" {...formItemLayout_12} label="企业名称：">
                                    {getFieldDecorator('companyName', {
                                        initialValue: data.companyName,
                                        rules: [{
                                            required: true,
                                            message: '企业名称不能为空',
                                        }]
                                    })(
                                        <Input placeholder="请输入企业名称"/>
                                    )}
                                </FormItem>
                                <FormItem className="licenseNumber" {...formItemLayout_12} label="执照号码：">
                                    {getFieldDecorator('licenseNumber', {
                                        initialValue: data.licenseNumber,
                                        rules: [{
                                            required: true,
                                            max: 18,
                                            message: '请填写正确的执照号码',
                                        }],
                                    })(
                                        <Input placeholder="请输入18位执照号码"/>
                                    )}
                                </FormItem>
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

//机构信息编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,
        data: {},
        // 机构类型表
        typeList: [],
        // 机构图片相关变量
        viewPic01: "",
        photoList01: [],
        avatarEditor01: {
            scale: 1,
            positionX: 0.5,
            positionY: 0.5
        },
        photoLoading: false,
        // 机构LOGO相关变量
        viewPic02: "",
        data_pic02: "",
        effectPic02: "",
        avatarEditor02: {
            scale: 1,
            positionX: 0.5,
            positionY: 0.5
        },
        logoLoading: false,
        // 机构地址相关变量
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
    };

    getInstitutionTypeList = () => {
        reqwest({
            url: '/institution/getEducationTypeList',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: [
                //         {id: 1, name: ""},
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        typeList: json.data
                    })
                }
            }
        })
    };

    getData = () => {
        reqwest({
            url: '/institution/getDetail',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         institution: {
                //             address: "",
                //             areaId: null,
                //             areaName: "",
                //             balance: "",
                //             cityId: null,
                //             cityName: "",
                //             companyName: "",
                //             createTime: "",
                //             description: "\n" + "\n" + "",
                //             detailedAddress: "",
                //             id: 1,
                //             lat: "",
                //             licenseNumber: "",
                //             lng: "",
                //             managerName: "",
                //             managerPhone: "",
                //             name: "",
                //             number: null,
                //             photo: "",
                //             photo2: "",
                //             photo3: "",
                //             photo4: "",
                //             photo5: "",
                //             icon: "",
                //             fees: "",
                //             provinceId: null,
                //             provinceName: "",
                //             star: null,
                //             status: null,
                //             street: "",
                //             telephone: "",
                //             typeId: null,
                //             typeName: "",
                //             typeIdTwo: null,
                //             updateTime: ""
                //         }
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    // 已有机构类型写入
                    const typeIds = [];
                    if (json.data.institution.typeId) {
                        typeIds.push(json.data.institution.typeId)
                    }
                    if (json.data.institution.typeIdTwo) {
                        typeIds.push(json.data.institution.typeIdTwo)
                    }
                    if (json.data.institution.typeIdThree) {
                        typeIds.push(json.data.institution.typeIdThree)
                    }
                    json.data.institution.typeIds = typeIds;
                    json.data.institution.typeIdTwo = json.data.institution.typeIdTwo ? json.data.institution.typeIdTwo : 0;
                    json.data.institution.typeIdThree = json.data.institution.typeIdThree ? json.data.institution.typeIdThree : 0;
                    // 已有机构图片写入
                    const photoList01 = [];
                    if (json.data.institution.photo && json.data.institution.photo !== "0") {
                        photoList01.push(json.data.institution.photo)
                    } else {
                        json.data.institution.photo = 0;
                    }
                    if (json.data.institution.photo2 && json.data.institution.photo2 !== "0") {
                        photoList01.push(json.data.institution.photo2)
                    } else {
                        json.data.institution.photo2 = 0;
                    }
                    if (json.data.institution.photo3 && json.data.institution.photo3 !== "0") {
                        photoList01.push(json.data.institution.photo3)
                    } else {
                        json.data.institution.photo3 = 0
                    }
                    if (json.data.institution.photo4 && json.data.institution.photo4 !== "0") {
                        photoList01.push(json.data.institution.photo4)
                    } else {
                        json.data.institution.photo4 = 0
                    }
                    if (json.data.institution.photo5 && json.data.institution.photo5 !== "0") {
                        photoList01.push(json.data.institution.photo5)
                    } else {
                        json.data.institution.photo5 = 0
                    }
                    this.setState({
                        data: json.data.institution,
                        photoList01: photoList01,
                        viewPic02: json.data.institution.icon ? "http://image.taoerxue.com/" + json.data.institution.icon : "",
                        effectPic02: json.data.institution.icon ? "http://image.taoerxue.com/" + json.data.institution.icon : "",
                        data_pic02: json.data.institution.icon,
                        areaId: json.data.institution.areaId,
                        formattedAddress: json.data.institution.address,
                        xy: {
                            x: json.data.institution.lng,
                            y: json.data.institution.lat
                        }
                    }, () => {
                        const mapId = "edit-institution-container" + this.props.id;
                        this.setState({
                            mapObj: new window.AMap.Map(mapId, {
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
                    })
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
        })
    };

    showModal = () => {
        this.getData();
        this.getInstitutionTypeList();
        this.setState({
            visible: true,
        })
    };

    //图片处理
    getBase64Image01 = (url, width, height) => {//width、height调用时传入具体像素值，控制大小 ,不传则默认图像大小
        const image = new Image();
        image.crossOrigin = '';
        image.src = url;
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width ? width : image.width;
            canvas.height = height ? height : image.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL("image/jpeg", 0.92);
            this.setState({
                viewPic01: dataURL,
                effectPic01: dataURL,
            })
        };
    };
    setViewPic01 = (para) => {
        this.setState({
            viewPic01: para
        })
    };
    setAvatarEditor01 = (index, value) => {
        if (this.state.viewPic01.slice(26) === this.state.data_pic01) {
            this.getBase64Image01(this.state.viewPic01)
        }
        if (index === 1) {
            this.setState({
                avatarEditor01: {
                    scale: value,
                    positionX: this.state.avatarEditor01.positionX,
                    positionY: this.state.avatarEditor01.positionY
                }
            })
        }
        if (index === 2) {
            this.setState({
                avatarEditor01: {
                    scale: this.state.avatarEditor01.scale,
                    positionX: value,
                    positionY: this.state.avatarEditor01.positionY
                }
            })
        }
        if (index === 3) {
            this.setState({
                avatarEditor01: {
                    scale: this.state.avatarEditor01.scale,
                    positionX: this.state.avatarEditor01.positionX,
                    positionY: value
                }
            })
        }
    };
    picUpload01 = (para) => {
        if (this.state.photoList01.length >= 5) {
            message.error("图片最多上传5张");
            return
        } else {
            const formData = new FormData();
            formData.append("file", para);
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
                        photoLoading: false,
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("图片提交成功");
                        let photoList01 = this.state.photoList01;
                        photoList01.push(json.data.url);
                        this.setState({
                            photoList01: photoList01,
                            viewPic01: "",
                            avatarEditor01: {
                                scale: 1,
                                positionX: 0.5,
                                positionY: 0.5
                            },
                            photoLoading: false,
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
        }
    };
    //图片删除
    setPhotoList01 = (index) => {
        let data = this.state.photoList01;
        data.splice(index, 1);
        this.setState({
            photoList01: data
        })
    };

    //LOGO处理
    getBase64Image02 = (url, width, height) => {//width、height调用时传入具体像素值，控制大小 ,不传则默认图像大小
        const image = new Image();
        image.crossOrigin = '';
        image.src = url;
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width ? width : image.width;
            canvas.height = height ? height : image.height;
            const ctx = canvas.getContext("2d");
            // ctx.fillStyle = "#fff";
            // ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            // const dataURL = canvas.toDataURL("image/jpeg", 0.92);
            const dataURL = canvas.toDataURL("png", 0.92);
            this.setState({
                viewPic02: dataURL,
                effectPic02: dataURL,
            })
        };
    };
    setViewPic02 = (para) => {
        this.setState({
            viewPic02: para
        })
    };
    setAvatarEditor02 = (index, value) => {
        if (this.state.viewPic02.slice(26) === this.state.data_pic02) {
            this.getBase64Image02(this.state.viewPic02)
        }
        if (index === 1) {
            this.setState({
                avatarEditor02: {
                    scale: value,
                    positionX: this.state.avatarEditor02.positionX,
                    positionY: this.state.avatarEditor02.positionY
                }
            })
        }
        if (index === 2) {
            this.setState({
                avatarEditor02: {
                    scale: this.state.avatarEditor02.scale,
                    positionX: value,
                    positionY: this.state.avatarEditor02.positionY
                }
            })
        }
        if (index === 3) {
            this.setState({
                avatarEditor02: {
                    scale: this.state.avatarEditor02.scale,
                    positionX: this.state.avatarEditor02.positionX,
                    positionY: value
                }
            })
        }
    };
    picUpload02 = (para01, para02) => {
        const formData = new FormData();
        formData.append("file", para02);
        this.setState({
            logoLoading: true
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
                    logoLoading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("图片提交成功");
                    this.setState({
                        effectPic02: para01,
                        data_pic02: json.data.url,
                        logoLoading: false,
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
                            logoLoading: false
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
                    if(this.state.areaId){
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
                        districtSearch.search(String(value.adcode), (status, result) => {
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
                                    addressLoading: false
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

    dataContrast = (values) => {
        const initValues = this.state.data;
        const itemList = ["name", "typeId", "typeIdTwo", "typeIdThree", "telephone", "photo", "photo2", "photo3", "photo4", "photo5", "icon", "description", "provinceName", "cityName", "areaName", "areaId", "street", "address", "detailedAddress", "lng", "lat", "companyName", "licenseNumber"];
        const result = {};
        itemList.forEach((item) => {
            if (values[item] !== initValues[item]) {
                result[item] = values[item];
            }
        });
        console.log(result);
        if (JSON.stringify(result) === "{}") {
            return false;
        } else {
            result.educationKey = this.props.educationKey;
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
                    typeList: [],
                    viewPic01: "",
                    photoList01: [],
                    avatarEditor01: {
                        scale: 1,
                        positionX: 0.5,
                        positionY: 0.5
                    },
                    photoLoading: false,
                    viewPic02: "",
                    data_pic02: "",
                    effectPic02: "",
                    avatarEditor02: {
                        scale: 1,
                        positionX: 0.5,
                        positionY: 0.5
                    },
                    logoLoading: false,
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
        if(this.state.addressLoading){
            message.warning("地图信息加载中，请稍后进行操作");
            return
        }
        form.validateFields((err, values) => {
            values.typeId = values.typeIds ? values.typeIds[0] : 0;
            values.typeIdTwo = values.typeIds ? (values.typeIds[1] || 0) : 0;
            values.typeIdThree = values.typeIds ? (values.typeIds[2] || 0) : 0;
            values.photo = this.state.photoList01[0];
            values.photo2 = this.state.photoList01[1] || 0;
            values.photo3 = this.state.photoList01[2] || 0;
            values.photo4 = this.state.photoList01[3] || 0;
            values.photo5 = this.state.photoList01[4] || 0;
            values.icon = this.state.data_pic02;
            values.provinceName = this.state.area.province;
            values.cityName = this.state.area.city;
            values.areaName = this.state.area.district;
            values.areaId = this.state.areaId;
            values.street = this.state.area.street;
            values.address = this.state.formattedAddress;
            values.lng = this.state.xy.x;
            values.lat = this.state.xy.y;
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
        // data空值处理
        if (JSON.stringify(this.state.data) === "{}") {
            return;
        }
        // 地址信息加载中处理
        if(this.state.addressLoading){
            message.warning("地图信息加载中，请稍后进行操作");
            return
        }
        const form = this.form;
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            // 机构类型写入与校验
            if (values.typeIds.length > 3) {
                message.error("机构类型最多选三项");
                return;
            }
            values.typeId = values.typeIds ? values.typeIds[0] : 0;
            values.typeIdTwo = values.typeIds ? (values.typeIds[1] || 0) : 0;
            values.typeIdThree = values.typeIds ? (values.typeIds[2] || 0) : 0;
            // 机构图片写入与校验
            values.photo = this.state.photoList01[0];
            values.photo2 = this.state.photoList01[1] || 0;
            values.photo3 = this.state.photoList01[2] || 0;
            values.photo4 = this.state.photoList01[3] || 0;
            values.photo5 = this.state.photoList01[4] || 0;
            if (!values.photo) {
                message.error("课程图片未选择或未提交");
                return
            }
            // 机构logo写入
            values.icon = this.state.data_pic02;
            // 机构地址信息写入
            values.provinceName = this.state.area.province;
            values.cityName = this.state.area.city;
            values.areaName = this.state.area.district;
            values.areaId = this.state.areaId;
            values.street = this.state.area.street;
            values.address = this.state.formattedAddress;
            values.lng = this.state.xy.x;
            values.lat = this.state.xy.y;
            // 信息比对
            const result = this.dataContrast(values);
            if (!result) {
                message.error("暂无信息更改");
                return;
            }
            // 修改项提交，状态变为待审核
            result.status = 1;
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: "/cache/modifyEducationCache",
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
                        message.success("机构信息修改成功，已提交审核");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                data: {},
                                typeList: [],
                                viewPic01: "",
                                photoList01: [],
                                avatarEditor01: {
                                    scale: 1,
                                    positionX: 0.5,
                                    positionY: 0.5
                                },
                                photoLoading: false,
                                viewPic02: "",
                                data_pic02: "",
                                effectPic02: "",
                                avatarEditor02: {
                                    scale: 1,
                                    positionX: 0.5,
                                    positionY: 0.5
                                },
                                logoLoading: false,
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
                    } else {
                        if (json.code === "901") {
                            message.error("请先登录");
                            // 返回登陆页
                            this.props.toLoginPage();
                        } else if (json.code === "902") {
                            message.error("登录信息已过期，请重新登录");
                            // 返回登陆页
                            this.props.toLoginPage();
                        } else if (json.code === "1127") {
                            message.error("已修改信息正在审核中，暂不能修改");
                            this.setState({
                                confirmLoading: false
                            })
                        } else {
                            message.error(json.message);
                            this.setState({
                                confirmLoading: false
                            })
                        }
                    }
                }
            });
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <div>
                <Button type="primary" onClick={this.showModal}>编辑</Button>
                <ItemEditForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    id={this.props.id}
                    data={this.state.data}
                    typeList={this.state.typeList}
                    viewPic01={this.state.viewPic01}
                    setViewPic01={this.setViewPic01}
                    picUpload01={this.picUpload01}
                    avatarEditor01={this.state.avatarEditor01}
                    setAvatarEditor01={this.setAvatarEditor01}
                    photoList01={this.state.photoList01}
                    setPhotoList01={this.setPhotoList01}
                    photoLoading={this.state.photoLoading}
                    viewPic02={this.state.viewPic02}
                    data_pic02={this.state.data_pic02}
                    setViewPic02={this.setViewPic02}
                    effectPic02={this.state.effectPic02}
                    picUpload02={this.picUpload02}
                    avatarEditor02={this.state.avatarEditor02}
                    setAvatarEditor02={this.setAvatarEditor02}
                    logoLoading={this.state.logoLoading}
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

//实名认证表单
const IdAuthenticateForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="实名认证"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="idAuthenticate-form">
                    <Form layout="vertical">
                        <FormItem className="realname" {...formItemLayout_8} label="真实姓名：">
                            {getFieldDecorator('realname', {
                                rules: [{
                                    required: true,
                                    message: '真实姓名不能为空'
                                }]
                            })(
                                <Input placeholder="请输入真实姓名"/>
                            )}
                        </FormItem>
                        <FormItem className="idcard" {...formItemLayout_12} label="身份证号：">
                            {getFieldDecorator('idcard', {
                                rules: [{
                                    required: true,
                                    message: "身份证号不能为空"
                                }]
                            })(
                                <Input placeholder="请输入身份证号"/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//实名认证组件
class IdAuthenticate extends Component {
    state = {
        visible: false,
        confirmLoading: false
    };

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false,
            }, () => {
                this.setState({
                    confirmLoading: false
                })
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
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/institution/nameAuthentication',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: values,
                error: (XMLHttpRequest) => {
                    message.error("认证失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("身份认证成功");
                        this.setState({
                            visible: false,
                        }, () => {
                            this.setState({
                                confirmLoading: false
                            })
                        });
                        this.props.recapture();
                    } else {
                        if (json.code === "901") {
                            message.error("请先登录");
                            this.props.toLoginPage();
                        } else if (json.code === "902") {
                            message.error("登录信息已过期，请重新登录");
                            this.props.toLoginPage();
                        } else if (json.code === "1111") {
                            message.error("该机构已实名认证");
                            this.setState({
                                confirmLoading: false
                            })
                        } else if (json.code === "1110") {
                            message.error("身份信息不匹配，认证失败");
                            this.setState({
                                confirmLoading: false
                            })
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
            <div>
                <Button type="primary" onClick={this.showModal}>实名认证</Button>
                <IdAuthenticateForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    confirmLoading={this.state.confirmLoading}
                />
            </div>
        );
    }
}

//优惠券添加表单
const CouponsChoiceForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, couponsList, confirmLoading} = props;
        const {getFieldDecorator} = form;

        const optionsOfCouponsList = [];
        couponsList.forEach((item, index) => {
            optionsOfCouponsList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
        });

        return (
            <Modal
                visible={visible}
                title="优惠券选择"
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="couponsChoice-form">
                    <Form layout="vertical">
                        <FormItem className="couponId" {...formItemLayout_10} label="优惠券：">
                            {getFieldDecorator('couponId', {
                                rules: [{
                                    required: true,
                                    message: '优惠券不能为空',
                                }]
                            })(
                                <Select
                                    style={{width: '100%'}}
                                    placeholder="请选择优惠券"
                                >
                                    {optionsOfCouponsList}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem className="number" {...formItemLayout_8} label="券数量：">
                            {getFieldDecorator('number', {
                                rules: [{
                                    required: true,
                                    message: '优惠券数量不能为空',
                                }],
                            })(
                                <InputNumber min={0} precision={0} step={1}/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//优惠券添加组件
class CouponsChoice extends Component {
    state = {
        visible: false,
        couponsList: [],
        couponsListExist: [],
        confirmLoading: false
    };

    getCouponsList = () => {
        reqwest({
            url: '/coupon/getCouponList',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
//                 const json = {
//                     result: 0,
//                     data: {
//                         list: [
//                             {
//                                 id: 1,
//                                 name: "满100享8.8折",
//                                 type: 0,
//                                 state: 1,
//                             },
//                             {
//                                 id: 2,
//                                 name: "满200享8.8折",
//                                 type: 1,
//                                 state: 1,
//                             },
//                             {
//                                 id: 3,
//                                 name: "满300享8.8折",
//                                 type: 1,
//                                 state: 1,
//                             },
//                             {
//                                 id: 4,
//                                 name: "满400享8.8折",
//                                 type: 1,
//                                 state: 1,
//                             },
//                             {
//                                 id: 5,
//                                 name: "满500享8.8折",
//                                 type: 1,
//                                 state: 1,
//                             }
//                         ]
//                     }
//                 };
            },
            success: (json) => {
                if (json.result === 0) {
                    let data = json.data.list;
                    this.state.couponsListExist.forEach((item) => {
                        const fnFilter = (subItem) => {
                            return subItem.id !== item.couponId
                        };
                        data = data.filter(fnFilter);
                    });
                    this.setState({
                        couponsList: data
                    })
                }
            }
        })
    };

    getCouponsListExist = () => {
        reqwest({
            url: '/institution/getInstitutionCoupon',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
//                 const json = {
//                     result: 0,
//                     data: [
//                         {
//                             id: 1,
//                             couponId: 1,
//                             name: "满100享8.8折",
//                             type: 0,
//                             number: 500
//                         },
//                         {
//                             id: 2,
//                             couponId: 2,
//                             name: "满200享8.8折",
//                             type: 1,
//                             number: 500
//                         },
//                         {
//                             id: 3,
//                             couponId: 3,
//                             name: "满200享8.8折",
//                             type: 1,
//                             number: 500
//                         }
//                     ]
//                 };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        couponsListExist: json.data
                    }, () => {
                        this.getCouponsList()
                    });
                }
            }
        });
    };

    showModal = () => {
        this.getCouponsListExist();
        this.setState({
            visible: true
        });
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false,
                couponsList: [],
                couponsListExist: [],
                confirmLoading: false
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
            this.setState({
                confirmLoading: true
            })
            reqwest({
                url: '/institution/saveInstitutionCouponInfo',
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
                        message.success("优惠券添加成功");
                        this.setState({
                            visible: false,
                            couponsList: [],
                            couponsListExist: [],
                            confirmLoading: false
                        }, () => {
                            form.resetFields();
                        })
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
            <div>
                <Button type="primary" onClick={this.showModal}>优惠券添加</Button>
                <CouponsChoiceForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    couponsList={this.state.couponsList}
                    confirmLoading={this.state.confirmLoading}
                />
            </div>
        )
    }
}

//优惠券列表表格
const CouponsListTable = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, pagination, data, columns, pageChange, loading} = props;

        return (
            <Modal
                width={1000}
                visible={visible}
                title="优惠券列表"
                footer=""
                onCancel={onCancel}
                onOk={onCreate}
            >
                <div className="coupons-list">
                    <Table bordered pagination={pagination} dataSource={data} columns={columns}
                           onChange={pageChange} loading={loading}/>;
                </div>
            </Modal>
        );
    }
);

//优惠券列表组件
class CouponsList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            loading: true,
            data: [{key: 1}],
            pagination: {
                current: 1,
                pageSize: 5
            }
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '券名称',
                dataIndex: 'name',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '券数量',
                dataIndex: 'number',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'number'),
            },
            {
                title: '种类',
                dataIndex: 'type',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'type'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            <Popconfirm title="确认删除?"
                                        placement="topRight"
                                        onConfirm={() => this.itemDelete(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="立即删除"
                                        cancelText="取消">
                                <a>删除</a>
                            </Popconfirm>
                        </div>
                    );
                },
            }
        ];
    }

    //获取本页信息
    getData = () => {
        this.setState({
            loading: true
        })
        reqwest({
            url: '/institution/getInstitutionCoupon',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
//                 const json = {
//                     result: 0,
//                     data: [
//                         {
//                             id: 1,
//                             name: "满100享8.8折",
//                             type: 0,
//                             number: 500
//                         },
//                         {
//                             id: 2,
//                             name: "满100享8.8折",
//                             type: 1,
//                             number: 500
//                         },
//                         {
//                             id: 3,
//                             name: "满100享8.8折",
//                             type: 1,
//                             number: 500
//                         }
//                     ]
//                 };
            },
            success: (json) => {
                const data = [];
                if (json.result === 0) {
                    if (json.data) {
                        json.data.forEach((item, index) => {
                            let tempType = "";
                            if (item.type === 0) {
                                tempType = "满减券"
                            }
                            if (item.type === 1) {
                                tempType = "打折券"
                            }
                            data.push({
                                key: index.toString(),
                                id: item.id,
                                index: index + 1,
                                name: item.name,
                                type: tempType,
                                number: item.number
                            });
                        });
                    }
                    this.setState({
                        loading: false,
                        data: data,
                        pagination: {
                            current: this.state.pagination.current,
                            pageSize: this.state.pagination.pageSize
                        }
                    });
                }
            }
        });
    };

    //删除
    itemDelete = (para) => {
        this.setState({
            loading: true
        })
        reqwest({
            url: '/institution/deleteInstitutionCouponInfo',
            type: 'json',
            method: 'post',
            data: {
                id: para
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("优惠券删除成功");
                    this.getData();
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

    //页码变化处理
    pageChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        })
    };

    handleCancel = () => {
        this.setState({
            visible: false
        }, () => {
            this.setState({
                loading: true,
                data: [{key: 1}],
            });
        })
    };

    render() {
        return (
            <div>
                <Button type="primary" onClick={this.showModal}>优惠券列表</Button>
                <CouponsListTable
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    pagination={this.state.pagination}
                    loading={this.state.loading}
                    data={this.state.data}
                    columns={this.columns}
                    pageChange={this.pageChange}
                />
            </div>
        );
    }
}

class MyInstitution extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: ""
        }
    }

    getData = () => {
        // 非机构管理员直接return
        if (Number(sessionStorage.EId) === 0 || Number(sessionStorage.EId) === 1) {
            this.setState({
                loading: false
            });
            return;
        }
        this.setState({
            loading: true
        });
        reqwest({
            url: '/institution/getDetail',
            type: 'json',
            method: 'post',
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
                //         institution: {
                //             address: "杭州市西湖区黄龙路1号老年活动中心二楼",
                //             areaId: 330106,
                //             areaName: "西湖区",
                //             balance: "0.00",
                //             cityId: 330100,
                //             cityName: "杭州市",
                //             companyName: "浙江黄龙魔方体育文化有限公司",
                //             createTime: "Thu Feb 08 14:11:07 CST 2018",
                //             description: "1.啊啊啊0000\n" + "2.发简历发多少\n" + "3.哥哥吼吼吼",
                //             id: 177,
                //             educationKey: "E071842",
                //             lat: "30.267918",
                //             licenseNumber: "91330000MA27U0AQ7X",
                //             lng: "120.131591",
                //             managerAddress: "杭州市西湖区黄龙路1号老年活动中心二楼",
                //             managerName: "章春燕",
                //             managerPhone: "18368886494",
                //             name: "黄龙魔方学院",
                //             number: 1,
                //             photo: "f590ddffc18d4e6dae51f42c28f7ae75.png",
                //             photo2: "f590ddffc18d4e6dae51f42c28f7ae75.png",
                //             photo3: "f590ddffc18d4e6dae51f42c28f7ae75.png",
                //             photo4: "0",
                //             // photo5: "f590ddffc18d4e6dae51f42c28f7ae75.png",
                //             icon: "cd5aaf757c8a4f999a293881780bbef2.png",
                //             fees: "0.00",
                //             provinceId: 330000,
                //             provinceName: "浙江省",
                //             star: 5,
                //             status: 2,
                //             telephone: "17767146629",
                //             typeId: 5,
                //             updateTime: "Thu Feb 08 14:11:06 CST 2018",
                //             additionalProtocol: "1.啊啊啊0000\n" + "2.发简历发多少\n" + "3.哥哥吼吼吼",
                //             realNameAuthentication: 0
                //         },
                //         typeName: "音乐1",
                //         typeNameTwo: "音乐2",
                //         typeNameThree: "",
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    if (json.data.institution) {
                        json.data.institution.typeName = json.data.typeName ? json.data.typeName : "";
                        json.data.institution.typeNameTwo = json.data.typeNameTwo ? "/" + json.data.typeNameTwo : "";
                        json.data.institution.typeNameThree = json.data.typeNameThree ? "/" + json.data.typeNameThree : "";
                        this.setState({
                            loading: false,
                            data: json.data.institution
                        })
                    }
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

    // 登陆信息过期或不存在时的返回登陆页操作
    toLoginPage = () => {
        sessionStorage.clear();
        this.props.history.push('/')
    };

    componentWillMount() {
        // 获取机构详情
        this.getData();
        if (this.props.location.search) {
            this.props.history.push(this.props.location.pathname)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location.search) {
            this.props.history.push(nextProps.location.pathname);
            this.getData();
        }
    }

    render() {
        let realNameState = "";
        if (this.state.data.realNameAuthentication === 0) {
            realNameState = "未认证";
        }
        if (this.state.data.realNameAuthentication === 1) {
            realNameState = "已认证";
        }
        let statusPic = "";
        if (this.state.data.status === 1) {
            statusPic = <img src={institutionStatus1} alt=""/>
        }
        if (this.state.data.status === 2) {
            statusPic = <img src={institutionStatus2} alt=""/>
        }
        if (this.state.data.status === 3) {
            statusPic = <img src={institutionStatus3} alt=""/>
        }
        if (this.state.data.status === 0) {
            statusPic = <img src={institutionStatus4} alt=""/>
        }
        return (
            <div className="MyInstitution">
                <header className="clearfix">
                    <span>机构信息</span>
                    {/*机构编辑*/}
                    <div className="edit-button" style={{float: "right"}}>
                        <ItemEdit educationKey={this.state.data.educationKey} toLoginPage={this.toLoginPage}/>
                    </div>
                    {/*机构实名认证（机构未认证状态下显示）*/}
                    <div className="idAuthen-button"
                         style={{
                             display: this.state.data.realNameAuthentication === 1 ? "none" : "block",
                             float: "right", marginRight: "20px"
                         }}>
                        <IdAuthenticate recapture={this.getData} toLoginPage={this.toLoginPage}/>
                    </div>
                    {/*优惠券（暂时废弃）*/}
                    <div className="couponsList-button" style={{display: "none", float: "right", marginRight: "20px"}}>
                        <CouponsList/>
                    </div>
                    <div className="couponsChoice-button"
                         style={{display: "none", float: "right", marginRight: "20px"}}>
                        <CouponsChoice/>
                    </div>
                </header>
                {
                    this.state.loading ?
                        <div className="spin-box">
                            <Spin/>
                        </div>
                        :
                        <div className="contentBox">
                            {
                                this.state.data ?
                                    <div className="content item-details">
                                        <div className="item shortItem name">
                                            <span className="item-name">机构名称：</span>
                                            <span className="item-content">{this.state.data.name}</span>
                                        </div>
                                        <div className="item shortItem typeName">
                                            <span className="item-name">机构类型：</span>
                                            <span
                                                className="item-content">{this.state.data.typeName + this.state.data.typeNameTwo + this.state.data.typeNameThree}</span>
                                        </div>
                                        <div className="item shortItem companyName">
                                            <span className="item-name">公司名称：</span>
                                            <span className="item-content">{this.state.data.companyName}</span>
                                        </div>
                                        <div className="item shortItem telephone">
                                            <span className="item-name">机构电话：</span>
                                            <span className="item-content">{this.state.data.telephone}</span>
                                        </div>
                                        <div className="item shortItem managerName">
                                            <span className="item-name">管理员：</span>
                                            <span className="item-content">{this.state.data.managerName}</span>
                                        </div>
                                        <div className="item shortItem managerPhone">
                                            <span className="item-name">手机号码（管理员）：</span>
                                            <span className="item-content">{this.state.data.managerPhone}</span>
                                        </div>
                                        <div className="item shortItem licenseNumber">
                                            <span className="item-name">信用代码：</span>
                                            <span className="item-content">{this.state.data.licenseNumber}</span>
                                        </div>
                                        <div className="item shortItem star">
                                            <span className="item-name">机构星级：</span>
                                            <span className="item-content">{this.state.data.star}</span>
                                        </div>
                                        <div className="item shortItem educationKey">
                                            <span className="item-name">机构码：</span>
                                            <span className="item-content">{this.state.data.educationKey}</span>
                                        </div>
                                        <div className="item shortItem realNameState">
                                            <span className="item-name">实名认证：</span>
                                            <span className="item-content">{realNameState}</span>
                                        </div>
                                        <div className="item longItem address">
                                            <span className="item-name">机构地址：</span>
                                            <span className="item-content">{this.state.data.address}</span>
                                        </div>
                                        <div className="item longItem description">
                                            <span className="item-name">机构描述：</span>
                                            <pre>
									<span className="item-content">{this.state.data.description}</span>
								</pre>
                                        </div>
                                        <div className="item longItem additionalProtocol">
                                            <span className="item-name">附加协议：</span>
                                            <pre>
									<span className="item-content">{this.state.data.additionalProtocol || "暂无"}</span>
                                </pre>
                                        </div>
                                        <div className="item longItem logo">
                                            <span className="item-name">logo：</span>
                                            <div className="item-content">
                                                <img src={"http://image.taoerxue.com/" + this.state.data.icon} alt=""/>
                                            </div>
                                        </div>
                                        <div className="item longItem photo">
                                            <span className="item-name">机构图片：</span>
                                            <div className="item-content">
                                                <img src={"http://image.taoerxue.com/" + this.state.data.photo} alt=""/>
                                                <img
                                                    style={{display: this.state.data.photo2 && this.state.data.photo2 !== "0" ? "inline" : "none"}}
                                                    src={"http://image.taoerxue.com/" + this.state.data.photo2} alt=""/>
                                                <img
                                                    style={{display: this.state.data.photo3 && this.state.data.photo3 !== "0" ? "inline" : "none"}}
                                                    src={"http://image.taoerxue.com/" + this.state.data.photo3} alt=""/>
                                                <img
                                                    style={{display: this.state.data.photo4 && this.state.data.photo4 !== "0" ? "inline" : "none"}}
                                                    src={"http://image.taoerxue.com/" + this.state.data.photo4} alt=""/>
                                                <img
                                                    style={{display: this.state.data.photo5 && this.state.data.photo5 !== "0" ? "inline" : "none"}}
                                                    src={"http://image.taoerxue.com/" + this.state.data.photo5} alt=""/>
                                            </div>
                                        </div>
                                        <div className="status-box">
                                            {statusPic}
                                        </div>
                                    </div>
                                    :
                                    <p className="emptyTips">暂无数据</p>
                            }
                        </div>

                }
            </div>
        )
    }
}

export default MyInstitution;