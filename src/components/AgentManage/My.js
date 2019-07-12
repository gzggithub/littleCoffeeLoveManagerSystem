import React, {Component} from 'react';
import {
    HashRouter as Router,
} from 'react-router-dom';
import {
    Input,
    Select,
    Button,
    Modal,
    Form,
    Upload,
    Slider,
    Row,
    Col,
    Icon,
    message,
    Tooltip,
} from 'antd';
import reqwest from 'reqwest';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';
import '../../config/config';
import AvatarEditor from 'react-avatar-editor'

const {Option} = Select;
const FormItem = Form.Item;
const {TextArea} = Input;
const confirm = Modal.confirm;

//公司信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {opStatus, checkPhone, checkTel, 
            // onChangeFile, fileList, defaultFileList,
            beforeUpload03, editCompany, readlyOnly, onCancel, onCreate, setPhone, form, data, reqwestUploadToken, viewPic02, setViewPic02, data_pic02, effectPic02, picUpload02, avatarEditor02, setAvatarEditor02, logoLoading, provinceList, cityList, districtList, streetList, markers, setMarkers, area, setArea, mapObj, setXY, setFormattedAddress, formattedAddress, detailedAddress} = props;
        const {getFieldDecorator} = form;

        // 由图片文件对象获取其base64编码
        const getBase64 = (img, callback) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => callback(reader.result));
            reader.readAsDataURL(img);
        };
        // 由图片地址获取其文件对象
        const dataURLtoFile = (url) => {
            let arr = url.split(','),
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
            }
            return new Blob([u8arr], {type: "image/jpeg"});
        };

        // 公司LOGO相关
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
            reqwestUploadToken();
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
                const file = dataURLtoFile(url);
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

        // 公司地址相关
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
                                // address字段(定位点地址)写入
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
            <div>
                <header className="clearfix">
                    {/*公司编辑*/}
                    <div className="add-button" style={{float: "right"}}>
                        <Button 
                            type="primary" 
                            onClick={editCompany} 
                            style={{display: opStatus ? "inline" : "none", marginRight: 20}}>编辑</Button>
                    </div>
                </header>
                <div className="institution-add institution-form company-form agent-form item-form" style={{width: "90%"}}>
                    <Form layout="vertical">
                        <h4 className="add-form-title-h4">基础信息</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="name"  label="公司名称：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.name,
                                        rules: [{
                                            required: true,
                                            message: '公司名称不能为空',
                                        }],
                                    })(
                                        <Input disabled={readlyOnly} placeholder="请输入公司名称"/>
                                    )}
                                </FormItem>
                                <div  style={{position: 'absolute', top: 6, right: 20}}>
                                    <Tooltip title="请填写营业执照上完整的名称">
                                        <span>*填写帮助</span>
                                    </Tooltip>
                                </div>
                            </Col>
                            <Col span={8}>
                                <FormItem className="typeIds" label="公司类型：">
                                    {getFieldDecorator('companyIds', {
                                        // initialValue: 1,
                                        initialValue: data.type,
                                        rules: [{
                                            required: true,
                                            message: '公司类型不能为空',
                                        }],
                                    })(
                                        <Select
                                            style={{width: '100%'}}
                                            disabled={readlyOnly}
                                            placeholder="请选择公司类型"
                                        >
                                            <Option key={1} value={1}>分公司</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="licenseNumber" label="执照号码：">
                                    {getFieldDecorator('licenseNumber', {
                                        initialValue: data.licenseNumber || "",
                                        rules: [{
                                            required: false,
                                            max: 18,
                                            message: '请填写正确的执照号码',
                                        }],
                                    })(
                                        <Input disabled={readlyOnly} placeholder="请输入18位执照号码"/>
                                    )}
                                </FormItem>                                
                             </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="managerName ant-form-explain-reset-css" label="管理员：">
                                    {getFieldDecorator('managerName', {
                                        initialValue: data.managerName || "",
                                        rules: [{
                                            required: true,
                                            message: '管理员不能为空',
                                        }],
                                    })(
                                        <Input disabled={readlyOnly} placeholder="请输入公司管理员名字"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="managePhone" label="手机号码：">
                                    {getFieldDecorator('managerPhone', {
                                        initialValue: data.managerPhone || "",
                                        rules: [{
                                            require: true,
                                            validator: checkPhone,
                                        }],
                                    })(
                                        <Input disabled={readlyOnly} placeholder="请输入管理员手机号" onBlur={(event) => setPhone(event.target.value)}/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>

                        <h4 className="add-form-title-h4">公司详情</h4>
                        <Row gutter={24}>
                            <Col span={7}>
                                <FormItem className="icon" label="公司LOGO：">
                                    {getFieldDecorator('icon', {
                                        initialValue: viewPic02,
                                        rules: [{
                                            required: true,
                                            message: '请上传公司LOGO',
                                        }],
                                    })(
                                        <div className="itemBox">
                                            <Upload
                                                name="file"
                                                disabled={readlyOnly}
                                                listType="picture-card"
                                                className="avatar-uploader"
                                                showUploadList={false}
                                                beforeUpload={beforeUpload02}
                                            >
                                                {viewPic02 ? partImg02 : uploadButton02}
                                            </Upload>
                                            <Row>
                                                <Col span={4}>缩放：</Col>
                                                <Col span={12}>
                                                    <Slider 
                                                        min={0.5} 
                                                        max={1.5} 
                                                        step={0.01} 
                                                        value={avatarEditor02.scale}
                                                        disabled={!viewPic02 && readlyOnly}
                                                        onChange={(value) => {
                                                            setAvatarEditor02(1, value)
                                                        }}/>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={4}>X：</Col>
                                                <Col span={12}>
                                                    <Slider 
                                                        min={0} 
                                                        max={1} 
                                                        step={0.01} 
                                                        value={avatarEditor02.positionX}
                                                        disabled={!viewPic02 && readlyOnly}
                                                        onChange={(value) => {
                                                            setAvatarEditor02(2, value)
                                                        }}/>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={4}>Y：</Col>
                                                <Col span={12}>
                                                    <Slider 
                                                        min={0} 
                                                        max={1} 
                                                        step={0.01} 
                                                        value={avatarEditor02.positionY}
                                                        disabled={!viewPic02 && readlyOnly}
                                                        onChange={(value) => {
                                                            setAvatarEditor02(3, value)
                                                        }}/>
                                                </Col>
                                            </Row>
                                            <Button 
                                                type="primary"
                                                disabled={readlyOnly}
                                                onClick={picHandle02}
                                                loading={logoLoading}
                                                style={{
                                                    position: "absolute",
                                                    right: "0",
                                                    bottom: "0"
                                                }}>{data_pic02 ? "重新提交" : "图片提交"}</Button>
                                        </div>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={14}>
                                <Row>
                                    <Col span={24}>
                                        <FormItem className="area longItem" label="公司地址：">
                                            {getFieldDecorator('area', {                                                
                                                rules: [{
                                                    required: false
                                                }],
                                            })(
                                                <div>
                                                    <Select disabled={readlyOnly} placeholder="省" style={{width: "20%", marginRight: 10}}
                                                            value={area.province || undefined} onChange={(value) => {
                                                        setArea(1, value)
                                                    }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                        {provinceOptions}
                                                    </Select>
                                                    <Select disabled={readlyOnly} placeholder="市" style={{width: "20%", marginRight: 10}}
                                                            value={area.city || undefined} onChange={(value) => {
                                                        setArea(2, value)
                                                    }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                        {cityOptions}
                                                    </Select>
                                                    <Select disabled={readlyOnly} placeholder="区" style={{width: "20%", marginRight: 10}}
                                                            value={area.district || undefined} onChange={(value) => {
                                                        setArea(3, value)
                                                    }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                        {districtOptions}
                                                    </Select>
                                                    <Select disabled={readlyOnly} placeholder="街道" style={{width: "20%"}} value={area.street || undefined}
                                                            onChange={(value) => {
                                                                setArea(4, value)
                                                            }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                        {streetOptions}
                                                    </Select>
                                                </div>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <Row gutter={16}>
                                    <Col span={10}>
                                        <FormItem className="detailedAddress" label="详细地址">
                                            {getFieldDecorator('detailedAddress', {
                                                initialValue: detailedAddress,
                                                rules: [{
                                                    required: true,
                                                    message: '详细地址不能为空',
                                                }],
                                            })(
                                                <Input 
                                                    disabled={readlyOnly} 
                                                    placeholder="如道路、门牌号、小区、楼栋号、单元室等"
                                                    onBlur={(event) => addressChange(event.target.value)}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem className="telephone" label="电话">
                                            {getFieldDecorator('telephone', {
                                                initialValue: data.telephone,
                                                rules: [{
                                                    validator: checkTel,
                                                }],
                                            })(
                                                <Input disabled={readlyOnly} placeholder="请输入电话"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <Row>
                                    <Col>
                                        <p className="addressSaved">定位点：{formattedAddress || "暂无"}</p>
                                        <div id="add-institution-container-my-0" className="amap-container" style={{width: '100%', height: '320px', marginBottom: '10px'}} name="container" tabIndex="0"/>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        
                        <FormItem className="description longItem" label="公司简介：">
                            {getFieldDecorator('description', {
                                initialValue: data.description,
                                rules: [{
                                    required: true,
                                    message: '公司简介不能为空',
                                }],
                            })(
                                <TextArea disabled={readlyOnly} style={{resize: "none"}} placeholder="请填写公司简介" rows={10}/>
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">其它信息</h4>
                        <FormItem className="contract" label="合同附件">
                            {getFieldDecorator('contract', {
                                rules: [{
                                    required: false,
                                    message: '请选择文件',
                                }],
                            })(
                                <div>                      
                                    <Upload
                                        name="file"
                                        disabled={readlyOnly}
                                        // showUploadList={false}
                                        // action="/file/upload"
                                        // fileList={defaultFileList}
                                        // fileList={fileList}
                                        beforeUpload={beforeUpload03}
                                        // onChange={onChangeFile}
                                        >
                                        <Button disabled={readlyOnly}>
                                            <Icon type="upload" /> 选择文件
                                        </Button>
                                    </Upload>                                    
                                </div>
                            )}
                        </FormItem>
                        <Row gutter={24}>
                            <Col span={21}>
                                <FormItem className="additionalProtocol unnecessary"
                                          label="附加协议：">
                                    {getFieldDecorator("additionalProtocol", {
                                        initialValue: data.additionalProtocol,
                                        rules: [{
                                            required: false
                                        }],
                                    })(
                                        <TextArea disabled={readlyOnly} style={{resize: "none"}} placeholder="请填写附加协议" rows={10}/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </div>
                <footer className="clearfix" style={{height: 100, marginTop: 20, display: readlyOnly ? "none" : "block"}}>
                    {/*公司编辑*/}
                    <div className="add-button" style={{float: "right"}}>
                        <Button type="primary" onClick={onCreate} style={{marginRight: 20}}>确定</Button>
                        <Button type="primary" onClick={onCancel} style={{marginRight: 20}}>重置</Button>                                                
                    </div>
                </footer>
            </div>
        );
    }
);

//公司信息编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,
        // 控制不能修改
        readlyOnly: true,
        // 公司基本信息
        data: {},
        // 公司类型表
        typeList: [],
        // 短信验证码相关变量
        phone: "",
        countDown: 0,
        codeButtonStatus: false,
        // 获取图片上传Token
        uploadToken: "",
        // 合同文件
        fileList: [],
        // 编辑时合同文件回显已有文件
        defaultFileList: [],
        // 公司LOGO相关变量
        viewPic02: "",
        data_pic02: "",
        effectPic02: "",
        avatarEditor02: {
            scale: 1,
            positionX: 0.5,
            positionY: 0.5
        },
        logoLoading: false,
        // 公司地址相关变量
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
        provinceId: null,
        cityId: null,
        areaId: null,
        detailedAddress: '',
        addressLoading: true,
        // 提交按钮状态变量
        confirmLoading: false
    };

    // 手机号校验
    checkPhone = (rule, value, callback) => {
        if (!value) {
            callback('手机号码不能为空'); // 校验不通过
            return false;
        } else {
            const isMob=/^1[0-9]{10}$/;
            const valuePhone = value.trim();
            if (isMob.test(valuePhone)) { // 正则验证
                callback(); // 校验通过
                return true;
            } else {
                callback('请输入正确手机号'); // 校验不通过
                return false;
            }
        }
    };
    
    // 手机号和座机号校验
    checkTel = (rule, value, callback) => {
        console.log(value);
        if (!value) {
            callback(); // 电话可以为空
            return true;
        } else {
            const isPhone = /^([0-9]{3,4}-)?[0-9]{7,8}$/;
            const isPhone02 = /^\d{3,4}-\d{3,4}-\d{3,4}$/; // 4001-550-520
            const isMob = /^1[0-9]{10}$/;
            const valuePhone = value.trim();
            if (isMob.test(valuePhone) || isPhone.test(valuePhone) || isPhone02.test(valuePhone)) { // 正则验证
                callback(); // 校验通过
                return true;
            } else {
                callback('请输入正确手机号或座机电话'); // 校验不通过
                return false;
            }
        }           
    };

    // 短信验证码相关函数
    // 手机号码写入
    setPhone = (para) => {
        this.setState({
            phone: para
        })
    };

    // 短信验证码倒计时函数
    countDown = () => {
        if (this.state.countDown <= 0) {
            clearInterval(this.fn_countDown);
            this.setState({
                countDown: 0,
                codeButtonStatus: false
            });
            return;
        }
        this.setState({
            countDown: this.state.countDown - 1
        })
    };

    // 获取验证码
    getCode = () => {
        if (this.state.codeButtonStatus) {
            // 倒计时未结束，直接return
            return;
        } else {
            const regPhone = /^1[0-9]{10}$/;
            if (regPhone.test(this.state.phone)) {
                reqwest({
                    url: '/mobileCode/sendVerificationCode',
                    type: 'json',
                    method: 'post',
                    data: {
                        phone: this.state.phone
                    },
                    headers: {
                        Authorization: sessionStorage.token
                    },
                    error: (XMLHttpRequest) => {
                        message.error("发送失败");
                    },
                    success: (json) => {
                        if (json.result === 0) {
                            this.setState({
                                codeButtonStatus: true,
                                countDown: 60
                            }, () => {
                                this.fn_countDown = setInterval(this.countDown, 1000)
                            })
                        } else {
                            if (json.code === 901) {
                                message.error("请先登录");
                                // 返回登陆页
                                this.props.toLoginPage();
                            } else if (json.code === 902) {
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
            } else {
                if (this.state.phone) {
                    message.warning("请填写正确的手机号码")
                } else {
                    message.warning("手机号码不能为空")
                }
            }
        }
    };

    // 获取公司类型列表
    getInstitutionTypeList = () => {
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
                    const data = [];
                    json.data.forEach((item) => {
                        let subData = [];
                        if (item.list) {
                            item.list.forEach((subItem) => {
                                subData.push({
                                    key: subItem.id,
                                    value: String(subItem.id),
                                    label: subItem.name
                                })
                            })
                        }                        
                        data.push({
                            key: item.id,
                            value: String(item.id),
                            label: item.name,
                            children: subData
                        })
                    });
                    this.setState({
                        typeList: data
                    });
                } else {
                    if (json.code === 901) {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === 902) {
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

    // 获取公司基本信息
    getData = () => {
        reqwest({
            url: '/admin/org/getDetails',
            type: 'json',
            method: 'get',
            data: {
                id: sessionStorage.orgId,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {},
            success: (json) => {
                if (json.result === 0) {
                    // 过滤公司logo
                    const fnFilter02 = (para) => {
                        return para.type === 2
                    }
                    // 过滤合同文件
                    // const fnFilter03 = (para) => {
                    //     return para.type === 3
                    // }
                    // 公司logo
                    let logoList = [];
                    // 合同文件
                    // let contractFile = [];
                    if (json.data.orgResourceList) {
                        logoList = json.data.orgResourceList.filter(fnFilter02);
                        // contractFile = json.data.orgResourceList.filter(fnFilter03);
                    }
                    // 定位点地址写入
                    let tempAddress = json.data.org.provinceName + json.data.org.cityName + json.data.org.areaName + json.data.org.street + json.data.org.detailedAddress;
                    console.log(tempAddress);
                    console.log(json.data)
                    this.setState({
                        data: json.data.org,
                        viewPic02: logoList[0] ? logoList[0].path : "",
                        // viewPic02: json.data.orgResourceList[0] ?  json.data.orgResourceList[0].path : "",
                        effectPic02: json.data.orgResourceList[1] ? json.data.orgResourceList[1].path : "",
                        data_pic02: json.data.orgResourceList[2] ? json.data.orgResourceList[2].path : "",
                        provinceId: json.data.org.provinceId,
                        cityId: json.data.org.cityId,
                        areaId: json.data.org.areaId,
                        area: {
                            province: json.data.org.provinceName,            
                            city: json.data.org.cityName,           
                            district: json.data.org.areaName,
                            street: json.data.org.street,
                        },
                        detailedAddress: json.data.org.detailedAddress,
                        formattedAddress: tempAddress,
                        xy: {
                            x: json.data.org.lng,
                            y: json.data.org.lat
                        },
                        // 已有合同写入
                        // fileList: [
                        //     contractFile[0].path                         
                        // ],
                        // defaultFileList: [
                        //     {
                        //         uid: "-1",
                        //         name: contractFile[0].path,
                        //         status: "done",
                        //         url: contractFile[0].path,
                        //     }
                        // ]
                    }, () => {
                        // 公司地址相关操作
                        this.setState({
                            mapObj: new window.AMap.Map("add-institution-container-my-0", {
                                resizeEnable: true,
                                zoom: 16,
                                center: this.state.data.lng ? [this.state.data.lng, this.state.data.lat] : ""
                            })
                        }, () => {
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
                                const geocoder = new window.AMap.Geocoder({
                                    extensions: "all"
                                });
                                this.state.mapObj.on('click', (e) => {
                                    // 清除已有标记点
                                    this.state.mapObj.remove(this.state.markers);
                                    // 经纬度写入
                                    this.setXY({
                                        x: e.lnglat.lng, 
                                        y: e.lnglat.lat
                                    });
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
                                            // address字段（定位点地址）写入
                                            this.setFormattedAddress(result.regeocode.formattedAddress);
                                            // 其他地址信息写入
                                            this.setArea(5, result.regeocode.addressComponent);
                                        }
                                    });
                                });
                            });
                        });
                    });
                } else {
                    if (json.code === 901) {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === 902) {
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
        // 获取公司基本信息
        this.getData();
        // 获取公司类型列表
        this.getInstitutionTypeList();
        this.setState({
            visible: true
        })
    };

    // 点击编辑
    editCompany = () => {
        this.setState({
            readlyOnly: false,
        })
    };

    // 请求上传凭证，需要后端提供接口
    reqwestUploadToken = (file) => {
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
                    sessionStorage.uploadToken = json.data;
                    this.setState({
                        uploadToken: json.data,
                    })
                } else {
                    if (json.code === 901) {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === 902) {
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

    beforeUpload03 = (file) => {
        console.log(file);
        this.reqwestUploadToken();
        setTimeout(()=> {
            this.picUploadFile(file);
        }, 500);       
        return false
    };

    // 文件上传
    picUploadFile = (file01) => {
        const _this = this;
        this.setState({
             logoLoading: true,
        });
        // const file = para02;
        // const file = sessionStorage.file
        const file = file01;
        console.log(file)
        const key = UUID.create().toString().replace(/-/g,"");
        const token = this.state.uploadToken;
        const config = {
            region: qiniu.region.z0
        };
        const observer = {
            next (res) {
                console.log(res)
            },
            error (err) {
                console.log(err)
                message.error(err.message ? err.message : "文件提交失败");
                _this.setState({
                    logoLoading: false,
                })
            }, 
            complete (res) {
                message.success("文件提交成功");
                let fileList = [];
                fileList.push(res.key);
                console.log(fileList);
                _this.setState({
                    // effectPic02: para01,
                    // data_file: global.config.photoUrl + res.key,
                    fileList: fileList,
                    data_file_copy: res.key,
                    defaultFileList: [],
                    logoLoading: false,
                })
            }
        }
        const observable = qiniu.upload(file, key, token, config)
        observable.subscribe(observer) // 上传开始
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
        const _this = this;
        this.setState({
             logoLoading: true,
        });
        const file = para02;
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
                console.log(err);
                message.error(err.message ? err.message : "图片提交失败");
                _this.setState({
                    logoLoading: false,
                })
            }, 
            complete (res) {
                message.success("图片提交成功");
                _this.setState({
                    effectPic02: para01,
                    data_pic02: global.config.photoUrl + res.key,
                    data_pic22: res.key,
                    logoLoading: false,
                })
            }
        }
        const observable = qiniu.upload(file, key, token, config)
        observable.subscribe(observer) // 上传开始
    };

    // 公司地址处理-----------------------------------
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
                    provinceId: this.state.provinceList.filter(fnFilter)[0] ? this.state.provinceList.filter(fnFilter)[0].adcode : null,
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
                    cityId: this.state.cityList.filter(fnFilter)[0] ? this.state.cityList.filter(fnFilter)[0].adcode : null,
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
            // 地区信息字段（用以获取不包含地区信息的详细地址内容）
            let areaString = value.province + value.city + value.district + value.township;
            // 获取城市列表, 省份ID
            const provinceFilter = (item) => {
                return item.name === value.province;
            };
            this.setState({
                cityList: this.state.provinceList.filter(provinceFilter)[0] ? this.state.provinceList.filter(provinceFilter)[0].districtList : [],
                provinceId: this.state.provinceList.filter(provinceFilter)[0] ? this.state.provinceList.filter(provinceFilter)[0].adcode : null,
            }, () => {
                // 获取地区列表,城市ID
                // 城市列表只有一条信息，如直辖市，导致value.city为空，则取城市列表第一条作为有效信息
                if (this.state.cityList.length === 1) {
                    value.city = this.state.cityList[0].name;
                }
                const cityFilter = (item) => {
                    return item.name === value.city;
                };
                this.setState({
                    districtList: this.state.cityList.filter(cityFilter)[0] ? this.state.cityList.filter(cityFilter)[0].districtList : [],
                    cityId: this.state.cityList.filter(cityFilter)[0] ? this.state.cityList.filter(cityFilter)[0].adcode : null,
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
                                // areaId: this.state.districtList.filter(fnFilter)[0] ? this.state.districtList.filter(fnFilter)[0].adcode : null
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
                                    detailedAddress: this.state.formattedAddress.replace(areaString, ""),
                                    addressLoading: false
                                }, () => {
                                    console.log(this.state.area);
                                    console.log(this.state.provinceId)
                                    console.log(this.state.cityId)
                                    console.log(this.state.areaId)
                                    console.log(this.state.detailedAddress)
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

    // 信息比对函数
    dataContrast = (values) => {
        const initValues = this.state.data;
        const itemList = ["name", "typeId", "typeIdTwo", "typeIdThree", "telephone", "photo", "photo2", "photo3", "photo4", "photo5", "icon", "fees", "description", "provinceName", "cityName", "areaName", "areaId", "street", "address", "detailedAddress", "lng", "lat", "companyName", "licenseNumber", "additionalProtocol", "geschaftszeit", "scope", "classNumber", "teacherNumber", "label"];
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

    // 取消操作
    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
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
                provinceId: null,
                cityId: null,
                areaId: null,
                detailedAddress: '',
                addressLoading: true,
                confirmLoading: false
            });
        };
        // data空值处理
        if (JSON.stringify(this.state.data) === "{}") {
            cancel();
            return;
        }
        // 地址信息加载中处理
        // if (this.state.addressLoading) {
        //     message.warning("地图信息加载中，请稍后进行操作");
        //     return
        // }
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

    // 确认操作
    handleCreate = () => {
        // data空值处理
        if (JSON.stringify(this.state.data) === "{}") {
            return;
        }
        // 地址信息加载中处理
        // if (this.state.addressLoading) {
        //     message.warning("地图信息加载中，请稍后进行操作");
        //     return
        // }
        const form = this.form;
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            // 公司logo写入
            // values.icon = this.state.data_pic02;
            if (this.state.data_pic02) {
                values.icon = this.state.data_pic02.slice(global.config.photoUrl.length)
            } else {
                values.icon = this.state.viewPic02.slice(global.config.photoUrl.length)
            }
            // 公司地址信息写入
            values.provinceName = this.state.area.province;
            values.provinceId = Number(this.state.provinceId);
            values.cityName = this.state.area.city;
            values.cityId = Number(this.state.cityId);
            values.areaName = this.state.area.district;
            values.areaId = Number(this.state.areaId);
            values.street = this.state.area.street;
            values.address = this.state.formattedAddress;
            values.lng = this.state.xy.x;
            values.lat = this.state.xy.y;
            // values.companyIds = values.types
            // 信息比对
            // const result = this.dataContrast(values);
            // 合同附件
            // let tempFileList = [];
            // this.state.fileList.forEach((item) => {
            //     tempFileList.push(item.url.slice(global.config.photoUrl.length))
            // })
            const result = {
                id: sessionStorage.orgId,
                name: values.name,
                type: values.companyIds,
                typeIds: [0],
                licenseNumber: values.licenseNumber,
                managerName: values.managerName,
                managerPhone: values.managerPhone,                
                // photos: photoTemp,
                photos: [0],                
                description: values.description,
                businessHours: values.businessHours,
                scope: values.scope, 
                classNumber: values.classNumber, 
                teacherNumber: values.teacherNumber,
                icon: values.icon,
                provinceName:  values.provinceName,
                provinceId: values.provinceId,
                cityName: values.cityName,
                cityId: values.cityId,
                areaName: values.areaName,
                areaId: values.areaId,
                street: values.street,
                address: values.address,
                lng: values.lng,
                lat: values.lat,
                detailedAddress: values.detailedAddress,
                telephone: values.telephone,
                resources: this.state.fileList,
                companyName: values.companyName,                
                additionalProtocol: values.additionalProtocol,
            };

            if (!result) {
                message.error("暂无信息更改");
                return;
            }
            // 修改项提交，状态变为待审核(暂时不需要)
            // result.status = 1;
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/admin/org/update',
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
                        // message.success("公司信息修改成功，已提交审核");
                        this.countDownTip();
                        this.setState({
                            visible: false,
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
                            provinceId: null,
                            cityId: null,
                            areaId: null,
                            detailedAddress: '',
                            addressLoading: true,
                            confirmLoading: false,
                            readlyOnly: true,
                        }, () => {
                            this.getData();                 
                        });
                    } else {
                        if (json.code === 901) {
                            message.error("请先登录");
                            // 返回登陆页
                            this.props.toLoginPage();
                        } else if (json.code === 902) {
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

     // 倒计时
    countDownTip = () => {
        let secondsToGo = 3;
        const modal = Modal.success({
            title: `友情提示`,
            content: `修改公司成功，正在返回，请稍后 ${secondsToGo} s.`,
        });
        const timer = setInterval(() => {
            secondsToGo -= 1;
            modal.update({
               content: `修改公司成功，正在返回，请稍后 ${secondsToGo} s.`,
            });
        }, 1000);
        setTimeout(() => {
            clearInterval(timer);
            modal.destroy();
        }, secondsToGo * 1000);
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    componentWillMount() {
        // 获取公司基本信息
        this.getData();
        // 获取公司类型列表
        this.getInstitutionTypeList();
        this.setState({
            visible: true
        },() => {
            setTimeout(() => {
                // 公司地址相关操作
                const mapId = "add-institution-container";
                this.setState({
                    mapObj: new window.AMap.Map(mapId, {
                        resizeEnable: true,
                        zoom: 16
                    })
                }, () => {
                    // 地图实例（初始化）
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
                            const geocoder = new window.AMap.Geocoder({
                                extensions: "all"
                            });
                            this.state.mapObj.on('click', (e) => {
                                // 清除已有标记点
                                this.state.mapObj.remove(this.state.markers);
                                // 经纬度写入
                                this.setXY({
                                    x: e.lnglat.lng, 
                                    y: e.lnglat.lat
                                });
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
                                        // address字段（定位点地址）写入
                                        this.setFormattedAddress(result.regeocode.formattedAddress);
                                        // 其他地址信息写入
                                        this.setArea(5, result.regeocode.addressComponent);
                                    }
                                });
                            });
                        })
                    });
                })
            }, 500)
        })        
    };

    render() {
        return (
            <ItemEditForm
                style={{width: "100%"}}
                ref={this.saveFormRef}
                opStatus={this.props.opStatus}
                editCompany={this.editCompany}
                readlyOnly={this.state.readlyOnly}
                onCancel={this.handleCancel}
                onCreate={this.handleCreate}
                id={this.props.id}
                data={this.state.data}
                checkPhone={this.checkPhone}
                checkTel={this.checkTel}
                typeList={this.state.typeList}
                setPhone={this.setPhone}
                countDown={this.state.countDown}
                codeButtonStatus={this.state.codeButtonStatus}
                getCode={this.getCode}
                reqwestUploadToken={this.reqwestUploadToken}
                beforeUpload03={this.beforeUpload03}
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
                detailedAddress={this.state.detailedAddress}
                fileList={this.state.fileList}
                defaultFileList={this.state.defaultFileList}
            />
        );
    }
}

class MyCompany extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            type: '1',
            // 获取公司列表所需关键词
            keyword: {
                cityCode: "",
                educationName: "",
                startTime: "",
                endTime: "",
            },
            flag_add: false,
        };
    }

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
            <Router>
                <div className="institutions">
                    {
                        this.state.opObj.select ?
                            <div>                                
                                <div className="companyEdit" style={{width: "100%", maxHeight: "600px", overflowY: "scroll"}}>
                                    <ItemEdit 
                                        opStatus={this.state.opObj.modify} 
                                        toLoginPage={this.toLoginPage}/>
                                </div>              
                            </div>
                            :
                            <p>暂无查询权限</p>
                    }
                </div>
            </Router>   
        )
    }
}

export default MyCompany;