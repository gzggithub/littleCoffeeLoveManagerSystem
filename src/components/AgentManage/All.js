import React, {Component} from 'react';
import {
    HashRouter as Router,
} from 'react-router-dom';
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
    Slider,
    Row,
    Col,
    Icon,
    message,
    List,
    Spin,
    Tooltip,
    Tree,
    Layout,
} from 'antd';
import reqwest from 'reqwest';
import '../../config/config';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';
import AvatarEditor from 'react-avatar-editor'

const {Sider, Content,} = Layout;
const Search = Input.Search;
const {Option} = Select;
const FormItem = Form.Item;
const {TextArea} = Input;
const { TreeNode } = Tree;
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
        console.log(valuess);
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

//添加公司表单
const ItemAddForm = Form.create()(
    (props) => {
        const {checkPhone, checkTel, beforeUpload03, reqwestUploadToken, visible, onCancel, onCreate, form, provinceList, cityList, districtList, streetList, markers, setMarkers, area, setArea, mapObj, setXY, setFormattedAddress, formattedAddress, detailedAddress, setPhone, viewPic02, effectPic02, data_pic02, setViewPic02, picUpload02, avatarEditor02, setAvatarEditor02, logoLoading, confirmLoading} = props;
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
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('文件不能大于2M');
            }
            if (isIMG && isLt2M) {
                getBase64(file, (imageUrl) => {
                    setViewPic02(imageUrl);
                });
                reqwestUploadToken();
            }
            return false
        };
        const uploadButton02 = (
            <div>
                <Icon type={'plus'}/>
                <div className="ant-upload-text" style={{display: viewPic02 ? "none" : "block"}}>选择图片</div>
            </div>
        );
        const picHandle02 = () => {
            if (viewPic02) {
                const canvas = this.editor02.getImage();
                const url = canvas.toDataURL("image/jpeg", 0.92);
                if (url === effectPic02) {
                    message.error("图片未改动，无法提交");
                    return
                }
                const file = dataURLtoFile(url);
                picUpload02(url, file)
            } else {
                message.error("图片未选择");
            }
        };        
        const partImg02 = (
            <AvatarEditor
                ref={setEditorRef02}
                image={viewPic02}
                width={80}
                height={80}
                border={0}
                color={[0, 0, 0, 1]}
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
            <Modal
                visible={visible}
                title="添加公司"
                width={1000}
                onCancel={onCancel}
                onOk={onCreate}
                confirmLoading={confirmLoading}
            >
                <div className="institution-add institution-form item-form">
                    <Form layout="vertical">
                        <h4 className="add-form-title-h4">基础信息</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="name"  label="公司名称：">
                                    {getFieldDecorator('name', {
                                        rules: [{
                                            required: true,
                                            message: '公司名称不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入公司名称"/>
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
                                        // type=1是代理分公司，type=2是机构
                                        initialValue: 1,
                                        rules: [{
                                            required: true,
                                            message: '公司类型不能为空',
                                        }],
                                    })(
                                        <Select
                                            style={{width: '100%'}}
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
                                        rules: [{
                                            required: false,
                                            max: 18,
                                            message: '请填写18位的执照号码',
                                        }],
                                        
                                    })(
                                        <Input placeholder="请输入18位执照号码"/>
                                    )}
                                </FormItem>
                             </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="managerName ant-form-explain-reset-css" label="管理员：">
                                    {getFieldDecorator('managerName', {
                                        rules: [{
                                            required: true,
                                            message: '管理员不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入公司管理员名字"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="managerPhone" label="手机号码：">
                                    {getFieldDecorator('managerPhone', {
                                        rules: [{
                                            required: true,
                                            validator: checkPhone,
                                        }],
                                    })(
                                        <Input placeholder="请输入管理员手机号" onBlur={(event) => setPhone(event.target.value)}/>
                                    )}
                                </FormItem>
                            </Col>
                            {/*<Col span={8}>
                                <FormItem className="verifyCode" label="验证码：">
                                    {getFieldDecorator('verifyCode', {
                                        rules: [{
                                            required: true,
                                            message: '验证码不能为空',
                                        }],
                                    })(
                                        <div>
                                            <Input style={{width: "60%"}} placeholder="请输入手机验证码"/>
                                            <Button style={{float: "right", width: "100px"}}
                                                    type="primary"
                                                    onClick={getCode}
                                            >
                                                {codeButtonStatus ? countDown + "s后重发" : "获取验证码"}
                                            </Button>
                                        </div>
                                    )}
                                </FormItem>
                            </Col>*/}
                        </Row>
                       
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">公司详情</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="icon" label="公司LOGO：">
                                    {getFieldDecorator('icon', {
                                        rules: [{
                                            required: true,
                                            message: '请上传公司LOGO',
                                        }],
                                    })(
                                        <div className="itemBox">
                                            <Upload
                                                name="file"
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
                                                        right: "0",
                                                        bottom: "0"
                                                    }}>{data_pic02 ? "重新提交" : "图片提交"}</Button>
                                        </div>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={16}>
                                <Row>
                                    <Col span={24}>
                                        <FormItem className="area longItem" label="公司地址：">
                                            {getFieldDecorator('area', {
                                                rules: [{
                                                    required: false
                                                }],
                                            })(
                                                <div>
                                                    <Select placeholder="省" style={{width: "20%", marginRight: 10}}
                                                            value={area.province || undefined} onChange={(value) => {
                                                        setArea(1, value)
                                                    }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                        {provinceOptions}
                                                    </Select>
                                                    <Select placeholder="市" style={{width: "20%", marginRight: 10}}
                                                            value={area.city || undefined} onChange={(value) => {
                                                        setArea(2, value)
                                                    }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                        {cityOptions}
                                                    </Select>
                                                    <Select placeholder="区" style={{width: "20%", marginRight: 10}}
                                                            value={area.district || undefined} onChange={(value) => {
                                                        setArea(3, value)
                                                    }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                        {districtOptions}
                                                    </Select>
                                                    <Select placeholder="街道" style={{width: "20%"}} value={area.street || undefined}
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
                                    <Col span={12}>
                                        <FormItem className="detailedAddress" label="详细地址">
                                            {getFieldDecorator('detailedAddress', {
                                                initialValue: detailedAddress,
                                                rules: [{
                                                    required: true,
                                                    message: '详细地址不能为空',
                                                }],
                                            })(
                                                <Input 
                                                    placeholder="如道路、门牌号、小区、楼栋号、单元室等"
                                                    onBlur={(event) => addressChange(event.target.value)}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem className="telephone" label="电话">
                                            {getFieldDecorator('telephone', {
                                                rules: [
                                                    {
                                                        required: false,
                                                        message: '电话不能为空',
                                                    },
                                                    {
                                                        validator: checkTel                                                        
                                                    },
                                                ]                                                
                                            })(
                                                <Input placeholder="请输入电话"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <Row>
                                    <Col>
                                        <p className="addressSaved">定位点：{formattedAddress || "暂无"}</p>
                                        <div id="add-institution-container" name="container" tabIndex="0"/>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        
                        <FormItem className="description longItem" label="公司介绍：">
                            {getFieldDecorator('description', {
                                rules: [{
                                    required: false,
                                    message: '公司简介不能为空',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写公司简介" rows={5}/>
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
                                        // showUploadList={false}
                                        beforeUpload={beforeUpload03}
                                        >
                                        <Button>
                                            <Icon type="upload" /> 选择文件
                                        </Button>
                                    </Upload>                                                              
                                </div>
                            )}
                        </FormItem>
                        <div className="ant-line"></div>
                        <Row>
                            <Col span={24}>
                                <FormItem className="additionalProtocol unnecessary" label="附加协议：">
                                    {getFieldDecorator("additionalProtocol", {
                                        rules: [{
                                            required: false
                                        }],
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写附加协议" rows={10}/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//添加公司组件
class ItemAdd extends Component {
    state = {
        visible: false,
        // 公司类型表
        typeList: [],
        // 短信验证码相关变量
        phone: "",
        countDown: 0,
        codeButtonStatus: false,
        // 获取图片上传Token
        uploadToken: "",
        // 公司LOGO相关变量
        viewPic02: "",
        effectPic02: "",
        data_pic02: "",
        data_pic22: "",
        fileList: [],
        data_file: "",
        data_file_copy: "",
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
        confirmLoading: false,
        empTypeIds: [],
    };
    fn_countDown = "";

    showModal = () => {
        this.setState({visible: true}, () => {
            this.getInstitutionTypeList();
            // this.reqwestUploadToken();
            setTimeout(() => {
                this.setState({
                    mapObj: new window.AMap.Map('add-institution-container', {
                        resizeEnable: true,
                        zoom: 16
                    })
                }, () => {
                    // 获取省份列表
                    this.getProvinceList();
                    // 地图实例
                    window.AMap.service('AMap.Geocoder', () => {
                        const geocoder = new window.AMap.Geocoder({
                            extensions: "all"
                        });
                        // 地图点击事件
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
                                    // address字段(定位点地址)写入
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

    // 获取公司类型列表
    getInstitutionTypeList = () => {
        reqwest({
            url: '/sys/orgType/list',
            type: 'json',
            method: 'get',
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
                    const data = [];
                    json.data.forEach((item) => {
                        let subData = [];
                        if (item.list) {
                            item.list.forEach((subItem) => {
                                subData.push({
                                    // key: subItem.id,
                                    // value: String(subItem.id),
                                    key: subItem.parentId + ',' + subItem.id,
                                    value: subItem.parentId + ',' + subItem.id,
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
                    }
                }
            }
        });
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
        setTimeout(()=>{
            this.picUploadFile(file);
        }, 500);        
        
        // const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
        // if (!isIMG) {
        //     message.error('文件类型错误');
        // }
        // const isLt2M = file.size / 1024 / 1024 < 2;
        // if (!isLt2M) {
        //     message.error('文件不能大于2M');
        // }
        // if (isIMG && isLt2M) {
            // getBase64(file, (imageUrl) => {
            //     setViewPic02(imageUrl);
            // });
        // }
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
                    logoLoading: false,
                })
            }
        }
        const observable = qiniu.upload(file, key, token, config)
        observable.subscribe(observer) // 上传开始
    };

    // 公司LOGO处理-----------------------------------
    setViewPic02 = (para) => {
        this.setState({
            viewPic02: para
        })
    };
    setAvatarEditor02 = (index, value) => {
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
                console.log(res)
            },
            error (err) {
                console.log(err)
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
            // 获取城市列表,省份ID
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
                        districtSearch.search(value.adcode, (status, result) => {
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
                                },() => {
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
        this.setState({
            visible: false
        }, () => {
            this.setState({
                typeList: [],
                phone: "",
                countDown: 0,
                codeButtonStatus: false,
                viewPic02: "",
                effectPic02: "",
                data_pic02: "",
                data_pic22: "",
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
                confirmLoading: false
            });
            form.resetFields();
        });
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            // 公司logo校验
            if (!this.state.data_pic02) {
                message.error("LOGO未提交");
                return
            }
            values.icon = this.state.data_pic02;
            if (!this.state.area.street) {
                message.error("请选择公司所在省、市、区及街道");
                return
            }
            this.setState({
                confirmLoading: true
            });

            console.log(this.state.photoList01);
            // const typeIds = [];

            if (this.state.data_pic02) {
                values.icon = this.state.data_pic22
            }
            console.log(this.state.empTypeIds)
            reqwest({
                url: '/admin/org/register',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    name: values.name,
                    typeIds: [0],
                    type: values.companyIds,
                    parentId: 0,                    
                    licenseNumber: values.licenseNumber,
                    managerName: values.managerName,                    
                    managerPhone: values.managerPhone,
                    photos: [0],
                    resources: this.state.fileList,
                    icon: values.icon,
                    lng: this.state.xy.x,
                    lat: this.state.xy.y,
                    provinceName: this.state.area.province,
                    provinceId:  Number(this.state.provinceId),
                    cityName: this.state.area.city,
                    cityId:  Number(this.state.cityId),
                    areaName: this.state.area.district,
                    areaId: Number(this.state.areaId),
                    street: this.state.area.street,
                    address: this.state.formattedAddress,
                    detailedAddress: values.detailedAddress,
                    telephone: values.telephone,
                    managerAddress: values.managerAddress,
                    description: values.description,                                     
                    additionalProtocol: values.additionalProtocol,
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("公司添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                typeList: [],
                                phone: "",
                                countDown: 0,
                                codeButtonStatus: false,
                                viewPic02: "",
                                effectPic02: "",
                                data_pic02: "",
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
                                confirmLoading: false
                            });
                            form.resetFields();
                            this.props.recapture();
                        });
                    } else {
                        if (json.code === 901) {
                            message.error("请先登录");
                            this.props.toLoginPage();
                        } else if (json.code === 902) {
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
            });
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button type="primary" onClick={this.showModal}>添加公司</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    checkPhone={this.checkPhone}
                    checkTel={this.checkTel}
                    typeList={this.state.typeList}
                    setPhone={this.setPhone}
                    countDown={this.state.countDown}
                    codeButtonStatus={this.state.codeButtonStatus}
                    getCode={this.getCode}
                    reqwestUploadToken={this.reqwestUploadToken}
                    viewPic02={this.state.viewPic02}
                    effectPic02={this.state.effectPic02}
                    data_pic02={this.state.data_pic02}                    
                    data_file={this.state.data_file}
                    beforeUpload03={this.beforeUpload03}
                    picUploadFile={this.picUploadFile}
                    setViewPic02={this.setViewPic02}
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
                    confirmLoading={this.state.confirmLoading}
                />
            </div>
        );
    }
}

//公司信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {beforeUpload03, visible, onCancel, onCreate, form, id, data, checkPhone, checkTel, reqwestUploadToken, viewPic02, setViewPic02, data_pic02, effectPic02, picUpload02, avatarEditor02, setAvatarEditor02, logoLoading, provinceList, cityList, districtList, streetList, markers, setMarkers, area, setArea, mapObj, setXY, setFormattedAddress, formattedAddress, detailedAddress, confirmLoading} = props;
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
                title="公司编辑"
                width={1000}
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
                                <h4 className="add-form-title-h4">基础信息</h4>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="name" label="公司名称：">
                                            {getFieldDecorator('name', {
                                                initialValue: data.name,
                                                rules: [{
                                                    required: true,
                                                    message: '公司名称不能为空',
                                                }],
                                            })(
                                                <Input placeholder="请输入公司名称"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="typeIds" label="公司类型：">
                                            {getFieldDecorator('companyIds', {
                                                initialValue: data.type,
                                                rules: [{
                                                    required: true,
                                                    message: '公司类型不能为空',
                                                }],
                                            })(
                                                <Select
                                                    style={{width: '100%'}}
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
                                                initialValue: data.licenseNumber,
                                                rules: [{
                                                    required: false,
                                                    max: 18,
                                                    message: '请填写正确的执照号码',
                                                }],
                                            })(
                                                <Input placeholder="请输入18位执照号码"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={8}>
                                             <FormItem className="managerName" label="管理员：">
                                                {getFieldDecorator('managerName', {
                                                    initialValue: data.managerName,
                                                    rules: [{
                                                        required: true,
                                                        message: "管理员不能为空"
                                                    }],
                                                })(
                                                    <Input placeholder="请输入管理员姓名"/>
                                                )}
                                            </FormItem>
                                        </Col>
                                    <Col span={8}>
                                         <FormItem className="managerPhone" label="手机号码：">
                                            {getFieldDecorator('managerPhone', {
                                                initialValue: data.managerPhone,
                                                rules: [{
                                                    required: true,
                                                    validator: checkPhone,
                                                }],
                                            })(
                                                <Input placeholder="请输入公司电话号码"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                
                                <div className="ant-line"></div>
                                <h4 className="add-form-title-h4">公司详情</h4>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="icon" label="公司LOGO：">
                                            {getFieldDecorator('icon', {
                                                initialValue: viewPic02,
                                                // initialValue: data.icon,
                                                rules: [{
                                                    required: true,
                                                    message: '公司LOGO不能为空',
                                                }],
                                            })(
                                                <div className="itemBox">
                                                    <Upload
                                                        name="file"
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
                                    </Col>
                                    <Col span={16}>
                                        <Row>
                                            <Col>
                                                 <FormItem className="area longItem" label="公司地址：">
                                                    {getFieldDecorator('area', {
                                                        rules: [{
                                                            required: false
                                                        }],
                                                    })(
                                                        <div>
                                                            <Select placeholder="省" style={{width: "20%", marginRight: 10}}
                                                                    value={area.province || undefined} onChange={(value) => {
                                                                setArea(1, value)
                                                            }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                                {provinceOptions}
                                                            </Select>
                                                            <Select placeholder="市" style={{width: "20%", marginRight: 10}}
                                                                    value={area.city || undefined} onChange={(value) => {
                                                                setArea(2, value)
                                                            }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                                {cityOptions}
                                                            </Select>
                                                            <Select placeholder="区" style={{width: "20%", marginRight: 10}}
                                                                    value={area.district || undefined} onChange={(value) => {
                                                                setArea(3, value)
                                                            }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                                {districtOptions}
                                                            </Select>
                                                            <Select placeholder="街道" style={{width: "20%"}}
                                                                    value={area.street || undefined}
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
                                        <Row gutter={8}>
                                            <Col span={10}>
                                                <FormItem className="detailedAddress longItem" label="详细地址：">
                                                    {getFieldDecorator('detailedAddress', {
                                                        initialValue: detailedAddress,
                                                        rules: [{
                                                            required: true,
                                                            message: '详细地址不能为空',
                                                        }],
                                                    })(
                                                        <Input placeholder="请填写详细地址"
                                                               onBlur={(event) => addressChange(event.target.value)}/>
                                                    )}
                                                </FormItem>                                   
                                            </Col>
                                            <Col span={12}>
                                                <FormItem className="telephone" label="公司电话">
                                                    {getFieldDecorator('telephone', {
                                                        initialValue: data.telephone,
                                                        rules: [{
                                                            validator: checkTel,
                                                        }],
                                                    })(
                                                        <Input placeholder="请输入电话"/>
                                                    )}
                                                </FormItem>
                                            </Col>
                                        </Row>
                                        <div className="ant-line"></div>
                                        <p className="addressSaved">定位点：{formattedAddress || "暂无"}</p>
                                        <div id={"edit-institution-container" + id} name="container" tabIndex="0"
                                             style={{
                                                 width: "520px",
                                                 height: "320px",
                                                 marginLeft: "50px",
                                                 marginBottom: "10px"
                                             }}/>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <FormItem className="description longItem" label="公司介绍：">
                                            {getFieldDecorator('description', {
                                                initialValue: data.description,
                                                rules: [{
                                                    required: false,
                                                    message: '公司简介不能为空',
                                                }],
                                            })(
                                                <TextArea style={{resize: "none"}} placeholder="请填写公司简介" rows={10}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <h4 className="add-form-title-h4">其它信息</h4>
                                <Row>
                                    <Col>
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
                                                    // showUploadList={false}
                                                    beforeUpload={beforeUpload03}
                                                    >
                                                    <Button>
                                                        <Icon type="upload" /> 选择文件
                                                    </Button>
                                                </Upload>                                    
                                            </div>
                                        )}
                                    </FormItem>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <Row>
                                    <Col>
                                        <FormItem className="additionalProtocol unnecessary" label="附加协议：">
                                            {getFieldDecorator("additionalProtocol", {
                                                initialValue: data.additionalProtocol,
                                                rules: [{
                                                    required: false
                                                }],
                                            })(
                                                <TextArea style={{resize: "none"}} placeholder="请填写附加协议" rows={10}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

//公司信息编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,
        // 公司基本信息
        data: {},
        // 公司类型表
        typeList: [],
        // 公司图片相关变量
        // 获取图片上传Token
        uploadToken: "",
        // 公司LOGO相关变量
        viewPic02: "",
        data_pic02: "",
        data_pic22: "",
        effectPic02: "",
        avatarEditor02: {
            scale: 1,
            positionX: 0.5,
            positionY: 0.5
        },
        logoLoading: false,
        // 合同附件相关变量
        fileList: [],
        data_file: "",
        data_file_copy: "",
        // 公司地址相关变量
        provinceList: [],
        cityList: [],
        districtList: [],
        streetList: [],
        markers: [],
        area: {
            province: "",
            provinceId: "",
            city: "",
            cityId: "",
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

    // 获取公司类型列表
    getInstitutionTypeList = () => {
        reqwest({
            url: '/sys/orgType/list',
            type: 'json',
            method: 'get',
            data: {
                status: 1
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: [
                //         {id: 1, name: "01"},
                //         {id: 2, name: "02"},
                //         {id: 3, name: "03"},
                //         {id: 4, name: "04"},
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    const data = [];
                    json.data.forEach((item) => {
                        let subData = [];
                        if (item.list) {
                            item.list.forEach((subItem) => {
                                subData.push({
                                    // key: subItem.id,
                                    // value: String(subItem.id),
                                    key: subItem.parentId + ',' + subItem.id,
                                    value: subItem.parentId + ',' + subItem.id,
                                    title: subItem.name
                                })
                            })
                        }                        
                        data.push({
                            key: item.id,
                            value: String(item.id),
                            title: item.name,
                            children: subData
                        })
                    });
                    console.log(data)
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
                id: this.props.id,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error('获取失败');
                this.setState({
                    loading: false
                });
            },
            success: (json) => {
                if (json.result === 0) {
                    // 已有公司LOGO写入
                    // 过滤机构logo
                    const fnFilter02 = (para) => {
                        return para.type === 2;
                    }
                    // 过滤合同文件
                    // const fnFilter03 = (para) => {
                    //     return para.type === 3;
                    // }
                    // 机构logo
                    let logoList = [];
                    // 合同文件
                    // let contractFile = [];
                    if (json.data.orgResourceList) {
                        logoList = json.data.orgResourceList.filter(fnFilter02);
                        // contractFile = json.data.orgResourceList.filter(fnFilter03);                        
                    }                    
                    json.data.org.icon = logoList[0] ? logoList[0].path : "";
                    // 定位点地址写入
                    let tempAddress = json.data.org.provinceName + json.data.org.cityName + json.data.org.areaName + json.data.org.street + json.data.org.detailedAddress;
                    console.log(tempAddress);
                    this.setState({
                        data: json.data.org,
                        viewPic02: logoList[0] ? logoList[0].path : "",
                        effectPic02: json.data.orgResourceList[1] ? json.data.orgResourceList[1].path : "",
                        data_pic02: json.data.orgResourceList[2] ? json.data.orgResourceList[2].path : "",
                        // viewFile02: json.data.
                        // data_file: json.data
                        provinceId: json.data.org.provinceId,
                        cityId: json.data.org.cityId,
                        areaId: json.data.org.areaId,
                        formattedAddress: tempAddress,
                        xy: {
                            x: json.data.org.lng,
                            y: json.data.org.lat
                        }
                    }, () => {
                        // 公司地址相关操作
                        const mapId = "edit-institution-container" + this.props.id;
                        this.setState({
                            mapObj: new window.AMap.Map(mapId, {
                                resizeEnable: true,
                                zoom: 16,
                                center: this.state.data.lng ? [this.state.data.lng, this.state.data.lat] : ""
                            })
                        }, () => {
                            // 地图实例
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
                                    // 地图点击事件
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
                                                // address字段(定位点地址)写入
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
            visible: true,
        })
    };

    // 手机号校验
    checkPhone = (rule, value, callback) => {
        console.log(value);
        if (!value) {
            callback("手机号不能为空"); // 校验通过
            return false;
        } else {           
            const isMob = /^1[0-9]{10}$/;
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
        setTimeout(()=>{
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
                console.log(res)
            },
            error (err) {
                console.log(err)
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
                    cityId: this.state.cityList.filter(cityFilter)[0] ? this.state.cityList.filter(cityFilter)[0].adcode : null,
                }, () => {
                    // 有使会报错 _this6.state.mapObj.plugin is not a function
                    // 地图加载需要时间，点取消过快会报错
                    // 根据区ID获取街道列表
                    console.log(this.state.mapObj);
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
        this.setState({
            visible: false
        }, () => {
            this.setState({
                data: {},
                typeList: [],
                viewPic01: "",
                photoList01: [],
                photoList11: [],
                avatarEditor01: {
                    scale: 1,
                    positionX: 0.5,
                    positionY: 0.5
                },
                photoLoading: false,
                viewPic02: "",
                data_pic02: "",
                data_pic22: "",
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
            form.resetFields();
        });
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
            console.log(values.icon);
            if (this.state.data_pic02) {
                values.icon = this.state.data_pic02
            }
            console.log(values.icon)
            let iconTemp = values.icon.slice(global.config.photoUrl.length);
            console.log(iconTemp);            
            // values.icon = this.state.data_pic02;
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
            // 信息比对
            // const result = this.dataContrast(values);

            const result = {
                id: this.props.id,
                name: values.name,
                type: values.companyIds,
                typeIds: [0],
                licenseNumber: values.licenseNumber,
                managerPhone: values.managerPhone,
                managerName: values.managerName, 
                adminUserPhone: values.adminUserPhone,
                photos: [0],
                resources: this.state.fileList,
                description: values.description,
                icon: iconTemp,
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
                additionalProtocol: values.additionalProtocol,
            }
            if (!result) {
                message.error("暂无信息更改");
                return;
            }
            // 修改项提交，状态变为待审核 暂时不需要
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
                        message.success("公司信息修改成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                data: {},
                                typeList: [],                                
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
                        });
                        // 暂时不需要审核，不用刷新数据
                        this.props.recapture();
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
                    checkPhone={this.checkPhone}
                    checkTel={this.checkTel}
                    typeList={this.state.typeList}
                    viewPic02={this.state.viewPic02}
                    data_pic02={this.state.data_pic02}
                    reqwestUploadToken={this.reqwestUploadToken}
                    viewFile02={this.state.viewFile02}
                    beforeUpload03={this.beforeUpload03}
                    data_file={this.state.data_file}
                    picUploadFile={this.picUploadFile}

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
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//开通店铺表单
const ShopSaveForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, loading, viewPic, fn_pic, confirmLoading} = props;
        const {getFieldDecorator} = form;

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

        return (
            <Modal
                visible={visible}
                title="添加店铺"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="shop-add shop-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_12} label="店铺名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '店铺名称不能为空',
                                }],
                            })(
                                <Input placeholder="请输入店铺名称"/>
                            )}
                        </FormItem>
                        <FormItem className="photo noInput" {...formItemLayout_8} label="图片：">
                            {getFieldDecorator('photo', {
                                rules: [{
                                    required: true,
                                    message: '请上传店铺图片'
                                }]
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
                        <FormItem className="details noInput longItem" {...formItemLayout_14} label="店铺简介：">
                            {getFieldDecorator('details', {
                                rules: [{
                                    required: true,
                                    max: 300,
                                    message: '请按要求填写店铺简介',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写店铺简介（300字以内）" rows={6}/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//开通店铺组件
class ShopSave extends Component {
    state = {
        visible: false,
        loading: false,
        viewPic: "",
        data_pic: "",
        confirmLoading: false
    };

    showModal = () => {
        this.setState({visible: true});
    };

    //图片处理
    fn_pic = (para01, para02, para03) => {
        this.setState({
            loading: para01,
            viewPic: para02 || "",
            data_pic: para03 || ""
        });
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
                    loading: false,
                    viewPic: "",
                    data_pic: "",
                    confirmLoading: false
                });
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
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            values.photo = this.state.data_pic;
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/shop/saveShop',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    eId: this.props.id,
                    name: values.name,
                    photo: values.photo,
                    details: values.details
                },
                error: (XMLHttpRequest) => {

                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("店铺添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                loading: false,
                                viewPic: "",
                                data_pic: "",
                                confirmLoading: false
                            });
                            form.resetFields();
                        });
                        this.props.recapture();
                    } else {
                        message.error(json.message);
                        this.setState({
                            confirmLoading: false
                        })
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
            <a style={{display: "none"}}>
                <span onClick={this.showModal}>开通店铺</span>
                <ShopSaveForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    loading={this.state.loading}
                    viewPic={this.state.viewPic}
                    fn_pic={this.fn_pic}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//公司详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        data: '',
        orgTypeList: [],
        orgResourceList: [],
        loading: true
    };

    timeHandle = (para) => {
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
            url: '/admin/org/getDetails',
            type: 'json',
            method: 'get',
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
                });
            },
            success: (json) => {
                if (json.result === 0) {
                    // 过滤公司logo
                    const fnFilter = (para) => {
                        return para.type === 2;
                    }
                    const tempOrgResourceList = json.data.orgResourceList.filter(fnFilter);
                    json.data.org.icon = tempOrgResourceList[0] ? tempOrgResourceList[0].path : "";              
                    json.data.org.star = Math.ceil(json.data.org.scoreNumber / json.data.org.totalScore) || 0;
                    this.setState({
                        loading: false,
                        data: json.data.org,
                        orgTypeList: json.data.orgTypeList,
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
        let dataSource;
        // const orgTypeLists = () => {
        //     const orgTypeLists = [];
        //     console.log(this.state.orgTypeList);
        //     this.state.orgTypeList.forEach((item, index)=>{
        //         orgTypeLists.push(
        //             <div className="typeName">
        //                 <span className="item-name">公司类型一：</span>
        //                 <span className="item-content">{item.typeName}</span>
        //             </div>
        //         );
        //     })
        //     console.log(orgTypeLists)
        // }
        if (this.state.data) {
            let tempStatus = "";
            if (this.state.data.status === 1) {
                tempStatus = "审核中";
            }
            if (this.state.data.status === 2) {
                tempStatus = "审核通过";
            }
            if (this.state.data.status === 3) {
                tempStatus = "审核驳回";
            }
            if (this.state.data.status === 0) {
                tempStatus = "禁用";
            }
            // let realNameState = "";
            // if (this.state.data.RealNameAuthentication === 0) {
            //     realNameState = "未认证";
            // }
            // if (this.state.data.RealNameAuthentication === 1) {
            //     realNameState = "已认证";
            // }
            dataSource = [
                <div className="name">
                    <span className="item-name">公司名称：</span>
                    <span className="item-content">{this.state.data.name}</span>
                </div>,
                <div className="logo">
                    <span className="item-name">LOGO：</span>
                    {this.state.data.icon ? <img src={this.state.data.icon} alt=""
                                                 className="item-content"/> : "暂无"}
                </div>,
                <div className="typeName">
                        <span className="item-name">公司类型：</span>
                        <span className="item-content">分公司</span>
                </div>,
                <div className="managerName">
                    <span className="item-name">管理员：</span>
                    <span className="item-content">{this.state.data.managerName}</span>
                </div>, 
                <div className="managerPhone">
                    <span className="item-name">手机号码：</span>
                    <span className="item-content">{this.state.data.managerPhone}</span>
                </div>,
                <div className="province">
                    <span className="item-name">所在省：</span>
                    <span className="item-content">{this.state.data.provinceName}</span>
                </div>,
                <div className="city">
                    <span className="item-name">所在市：</span>
                    <span className="item-content">{this.state.data.cityName}</span>
                </div>,
                <div className="district">
                    <span className="item-name">所在地区：</span>
                    <span className="item-content">{this.state.data.areaName}</span>
                </div>,
                <div className="street">
                    <span className="item-name">所在街道：</span>
                    <span className="item-content">{this.state.data.street || "暂无"}</span>
                </div>,
                <div className="address">
                    <span className="item-name">公司地址：</span>
                    <span className="item-content">{this.state.data.detailedAddress || "暂无"}</span>
                </div>,
                <div className="telephone">
                    <span className="item-name">公司电话：</span>
                    <span className="item-content">{this.state.data.telephone || "暂无"}</span>
                </div>,
                <div className="description">
                    <span className="item-name">公司介绍：</span>
                    <pre>
                        <span className="item-content">{this.state.data.description || "暂无"}</span>
                    </pre>
                </div>,
                <div className="star">
                    <span className="item-name">公司星级：</span>
                    <span className="item-content">{this.state.data.star}</span>
                </div>,
                <div className="licenseNumber">
                    <span className="item-name">执照号码：</span>
                    <span className="item-content">{this.state.data.licenseNumber || "暂无"}</span>
                </div>,
                <div className="additionalProtocol">
                    <span className="item-name">附加协议：</span>
                    <pre>
                        <span className="item-content">{this.state.data.additionalProtocol || "暂无"}</span>
                    </pre>
                </div>,
                <div className="sort">
                    <span className="item-name">排序：</span>
                    <span className="item-content">{this.state.data.sort  || "暂无"}</span>
                </div>,                               
                <div className="createTime">
                    <span className="item-name">创建时间：</span>
                    <span
                        className="item-content">{this.state.data.createTime}</span>
                </div>,
                <div className="status">
                    <span className="item-name">状态：</span>
                    <span className="item-content">{tempStatus}</span>
                </div>
            ];
        } else {
            dataSource = ""
        }
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>详情</span>
                <Modal
                    title="公司详情"
                    width={600}
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                    destroyOnClose={true}
                >
                    <div className="institution-details item-details">
                        <div className="institution-baseData">
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

//公司列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            // 公司类型表
            typeList: [],
            // 当前公司类型
            type: null,
            // 当前公司状态
            status: null,
            addStatus: false,
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
                fixed: 'left',
                width: 70,
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '排序',
                dataIndex: 'sort',
                fixed: 'left',
                width: 130,
                editable: true,
            },
            {
                title: '公司名称',
                dataIndex: 'name',
                className: 'companyName',
                // fixed: 'left',
                width: "16%",
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '所在地区',
                dataIndex: 'address',
                className: 'address',
                width: '18%',
                render: (text, record) => this.renderColumns(text, record, 'address'),
            },            
            {
                title: '管理员',
                dataIndex: 'managerName',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'managerName'),
            },
            {
                title: '联系电话',
                dataIndex: 'telephone',
                width: '7%',
                render: (text, record) => this.renderColumns(text, record, 'telephone'),
            },
            {
                title: '创建人',
                dataIndex: 'createUserName',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'createUserName'),
            },
            {
                title: '创建日期',
                dataIndex: 'createTime',
                width: '7%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
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
                className: 'operating',
                width: 200,
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*公司详情*/}
                            <ItemDetails 
                                id={record.id} 
                                opStatus={this.props.opObj.select}
                                toLoginPage={this.props.toLoginPage}/>
                            {/*公司编辑*/}
                            <ItemEdit 
                                id={record.id} 
                                educationKey={record.educationKey} 
                                recapture={this.getData}
                                toLoginPage={this.props.toLoginPage} 
                                opStatus={this.props.opObj.modify}/>
                            {/*公司禁用/启用*/}
                            <Popconfirm title={record.isDisabled === "启用" ? "确认禁用？" : "确认启用？"}
                                        placement="topRight"
                                        onConfirm={() => this.itemBan(record.id, record.isDisabled)}
                                        onCancel=""
                                        okType="danger"
                                        okText="确认"
                                        cancelText="取消">
                                <a style={{display: this.props.opObj.banOrg ? "inline" : "none"}}>{record.isDisabled === "启用" ? "禁用" : "启用"}</a>
                            </Popconfirm>                            
                            <ShopSave 
                                id={record.id} 
                                recapture={this.getData}
                                shopStatus={this.props.opObj.modify && record.status === "启用" && record.shopStatus === 0 ? 1 : 0}/>
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

    setAdd = (type, para) => {
        if (type === "status") {
            this.setState({
                addStatus: para
            })
        }
        if (type === "flag") {
            this.setState({
                addFlag: !this.state.addFlag
            })
        }
    };

    // 日期处理函数
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

    dateHandle02 = (para) => {
        const add0 = (m) => {
            return m < 10 ? '0' + m : m;
        }
        //shijianchuo是整数，否则要parseInt转换
        const time = new Date(para),
            y = time.getFullYear(),
            m = time.getMonth()+1,
            d = time.getDate();
        return y + '-' + add0(m) + '-' + add0(d);
    };

    //获取本页信息
    getData = (keyword) => {
        this.setState({
            loading: true
        });
        console.log(5555);
        reqwest({
            url: '/admin/org/list',
            type: 'json',
            method: 'get',
            data: {
                // 公司
                type: 1,
                // 公司类型
                typeId: this.state.type,
                // 公司状态
                status: this.state.status,
                // 公司名称
                orgName: keyword ? keyword.educationName : this.props.keyword.educationName,
                // 城市
                cityCode: keyword ? keyword.cityCode : this.props.keyword.cityCode,
                startTime: keyword ? keyword.startTime : this.props.keyword.startTime,
                endTime: keyword ? keyword.endTime : this.props.keyword.endTime,
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize,
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
                //         size: 100,
                //         list: [
                //             {id: 1, status: 2},
                //             {id: 2, status: 2},
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
                        const fnFilter = (para) => {
                            return para.id === item.id
                        };
                        const tempShopStatus = json.data.shopStatus ? json.data.shopStatus.filter(fnFilter)[0].shopStatus : 1;
                        let tempStatus = "";
                        if (item.status === 1) {
                            tempStatus = "审核中"
                        }
                        if (item.status === 2) {
                            tempStatus = "审核通过"
                        }
                        if (item.status === 3) {
                            tempStatus = "驳回"
                        }

                        let tempDisabled = ""
                        if (item.isDisabled === 1) {
                            tempDisabled = "启用"
                        }
                        if (item.isDisabled === 2) {
                            tempDisabled = "禁用"
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            educationKey: item.educationKey,
                            index: index + 1,
                            sort: item.sort !== 0 ? item.sort : "",
                            photo: item.orgPath,
                            name: item.name,                            
                            address: item.provinceName + item.cityName + item.areaName + item.street,                            
                            typeName: item.typeNameStr || "暂无",
                            managerName: item.managerName,
                            telephone: item.telephone,
                            subscribeNumber: item.subscribeNumber || 10,
                            managerPhone: item.managerPhone,
                            createUserName: item.createUserName,
                            shopStatus: tempShopStatus,
                            createTime: item.createTime ? this.dateHandle02(item.createTime) : "",
                            statusCode: item.status,
                            status: tempStatus,
                            isDisabledCode: item.isDisabled,
                            isDisabled: tempDisabled,
                        });
                    });
                    this.setState({
                        loading: false,
                        data: data,
                        pagination: {
                            total: json.data.total,
                            current: this.state.pagination.current,
                            pageSize: this.state.pagination.pageSize
                        }
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
                        this.setState({
                            loading: false
                        })
                    }
                }
            }
        });
    };

    //公司禁用/启用
    itemBan = (id, isDisabled) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/admin/org/banOrg',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: id,
                // type: 1,
                disabled: isDisabled === "启用" ? 2 : 1, 
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success(isDisabled === "启用" ? "机构禁用成功" : "机构启用成功");
                    this.getData();
                } else {
                    if (json.code === 901) {
                        message.error("请先登录");
                        this.props.toLoginPage();
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");
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

    //表格参数变化处理
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

    // 设置排序
    handleSort = (row) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/admin/org/updateSort',
            type: 'json',
            method: 'post',
            data: {
                // 公司Id
                id: row.id,
                // 排序
                sort: Number(row.sort),
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                    });
                    this.getData(); //刷新数据
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
    }

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
                    scroll={{ x: 1400 }}
                    onChange={this.handleTableChange}/>;
    }
}

class Agent extends Component {
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
            startValue: null,
            endValue: null,
            flag_add: false,
            treeData: [],
        };
    }
    // 刷新table列表
    getData = () => {
        this.refs.getDataCopy.getData();
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

    // 名称关键词设置
    setName = (value) => {
        if (value !== this.state.keyword.educationName) {
            this.setState({
                keyword: {
                    educationName: value,
                    startTime: this.state.keyword.startTime,
                    endTime: this.state.keyword.endTime,
                }
            })
        }
    };

    setStartTime = (date, dateString) => {
        this.setState({
            startValue: date,
            keyword: {
                educationName: this.state.keyword.educationName,
                startTime: dateString,
                endTime: this.state.keyword.endTime,
            }
        })
    };

    setEndTime = (date, dateString) => {
        this.setState({
            endValue: date,
            keyword: {
                educationName: this.state.keyword.educationName,
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
        this.getDataOne();
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

    handleTree = (data) => {
        const tempResult = [];
        const result = [];
        
        let data01 = data.provinceList;
        let cityLists = data.cityList;
        data01.forEach((item) => {
            const temp = {
                title: item.name + "（" + item.orgNum + "）",
                key: item.id,
                id: item.id,
                orgNum: item.orgNum,
            };
            tempResult.push(temp);
        });
        tempResult.forEach((item) => {
            const fnFilter02 = (para) => {
                return para.provinceId === item.id;
            };
            let data02 = cityLists.filter(fnFilter02);
            if (data02.length) {
                item.children = [];
                data02.forEach((subItem) => {
                    const temp = {
                        key: subItem.id,
                        title: subItem.name + "（" + subItem.orgNum + "）",
                        id: subItem.id,
                        orgNum: subItem.orgNum,
                    };
                    item.children.push(temp);     
                });
                result.push(item);
            }
        });
        return result;
    };

    //获取省份树信息
    getDataOne = (keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/admin/org/getArea',
            type: 'json',
            method: 'get',
            data: {
                type: 1,    
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        treeData: this.handleTree(json.data),
                    });
                } else {
                    if (json.code === 901) {
                        message.error("请先登录");
                        // 返回登陆页
                        this.toLoginPage();
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.toLoginPage();
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

     // 省份，市级选择
    onSelect = (selectedKeys, info) => {
        console.log("selected", selectedKeys);
        console.log(Number(selectedKeys));
        this.setState({
            keyword:{
                cityCode: Number(selectedKeys),
            }
        }) 
    };

    renderTreeNodes = data => data.map((item) => {
        if (item.children) {
          return (
            <TreeNode title={item.title} key={item.key} dataRef={item}>
              {this.renderTreeNodes(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode {...item} />;
    });

    render() {
        return (
            <Router>
                <div className="institutions">
                    {
                        this.state.opObj.select ?
                            <div>
                                <header className="clearfix">
                                    {/*公司名称筛选*/}
                                    <Search
                                        placeholder="请输入公司名称信息"
                                        onSearch={this.setName}
                                        enterButton
                                        style={{width: "320px", float: "left", marginRight: "20px"}}
                                    />
                                    {/*公司创建日期筛选*/}
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
                                    {/*公司添加*/}
                                    <div className="add-button" style={{float: "right"}}>
                                        <ItemAdd
                                            recapture={this.getData} 
                                            opStatus={this.state.opObj.add} 
                                            toLoginPage={this.toLoginPage}/>
                                    </div>
                                </header>
                                <Layout>
                                    <Sider>
                                        <div className="tree-box">
                                            <div className="chooseDivision">选择行政区划</div>
                                            <div>
                                                <Tree 
                                                    showLine
                                                    defaultExpandedKeys={["0"]} 
                                                    onSelect={this.onSelect}>
                                                    <TreeNode title="全部" key="0">
                                                        {this.renderTreeNodes(this.state.treeData)}
                                                    </TreeNode>
                                                </Tree>
                                            </div>
                                            {/*<ProvinceTree 
                                                    flag_add={this.state.flag_add}
                                                    toLoginPage={this.toLoginPage}/>*/}
                                        </div>
                                    </Sider>                                  
                                    <Content>
                                        {/*公司列表*/}
                                        <div className="table-box">
                                            <DataTable
                                                ref="getDataCopy"
                                                opObj={this.state.opObj} 
                                                keyword={this.state.keyword}
                                                flag_add={this.state.flag_add}
                                                toLoginPage={this.toLoginPage}/>
                                        </div>
                                    </Content>                                    
                                </Layout>                      
                            </div>
                            :
                            <p>暂无查询权限</p>
                    }
                </div>
            </Router>   
        )
    }
}

export default Agent;