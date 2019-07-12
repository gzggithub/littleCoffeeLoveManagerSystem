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
    Slider,
    Row,
    Col,
    Icon,
    message,
    Spin,
    Tree,
    List,
} from 'antd';
import '../../config/config';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';
import Editor from 'wangeditor';
import reqwest from 'reqwest';
import AvatarEditor from 'react-avatar-editor'

const Search = Input.Search;
const {Option} = Select;
const FormItem = Form.Item;
const { TreeNode } = Tree;
const {TextArea} = Input;
const confirm = Modal.confirm;

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

//添加成长表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, allTypeList, provinceList, cityList, districtList, streetList, markers, setMarkers, area, setArea, mapObj, setXY, setFormattedAddress, formattedAddress, viewPic01, setViewPic01, picUpload01, avatarEditor01, setAvatarEditor01, photoList01, setPhotoList01, photoLoading, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 总成长选项生成
        const optionsOfAllTypeList = [];
        if (allTypeList) {
            allTypeList.forEach((item, index) => {
                optionsOfAllTypeList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
            });
        }        

        // 已上传图片列表
        const photoExist01 = [];
        photoList01.forEach((item, index) => {
            photoExist01.push(
                <div className="photoExist-item clearfix" key={index + 1}>
                    <img src={item.path} alt=""/>
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
        const dataURLtoFile = (url) => {
            let arr = url.split(','),
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
            }
            return new Blob([u8arr], {type: "image/jpeg"});
        };

        // 成长图片相关
        const setEditorRef01 = (editor) => this.editor01 = editor;
        const beforeUpload01 = (file) => {
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
                    setViewPic01(imageUrl);
                });
            }
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
                const file = dataURLtoFile(url);
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

        // 成长地址相关
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
                title="添加成长"
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
                                <FormItem className="companyName" label="资讯标题：">
                                    {getFieldDecorator('title', {
                                        rules: [
                                            {
                                                required: true,
                                                message: '资讯标题不能为空',
                                            },
                                            {
                                                min: 6,
                                                message: "资讯标题至少6个字",
                                            },
                                            {
                                                max: 42,
                                                message: "资讯标题不能超过42个字符",
                                            },
                                        ],
                                    })(
                                        <Input placeholder="请填写资讯标题(6-42字)"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="advPosition" label="资讯分类：">
                                    {getFieldDecorator('type', {
                                        rules: [
                                            {
                                                required: true,
                                                message: '资讯分类不能为空',
                                            }
                                        ],
                                    })(
                                        <Select
                                            style={{width: '100%'}}
                                            placeholder="请选择成长位置"
                                            // onChange={handleFirstChange}
                                        >
                                            {/*{optionsOfTypeList}*/}
                                            <Option key={1} value={1}>首页banner成长</Option>
                                            <Option key={2} value={2}>育儿栏目banner成长</Option>
                                            <Option key={3} value={3}>首页banner成长1</Option>
                                            <Option key={4} value={4}>首页banner成长2</Option>
                                        </Select>
                                       
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="companyName" label="资讯来源：">
                                    {getFieldDecorator('titleOrgin', {
                                        rules: [
                                            {
                                                required: false,
                                                message: '资讯标题不能为空',
                                            },
                                            {
                                                max: 10,
                                                message: "资讯标题不能超过10个字",
                                            },
                                        ],
                                    })(
                                        <Input placeholder="请填写资讯来源(不超过10个字)"/>
                                    )}
                                </FormItem>
                            </Col> 
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="area longItem" label="展示城市：">
                                    {getFieldDecorator('area', {
                                        rules: [{
                                            required: false,
                                            message: '所在区域未选择'
                                        }],
                                    })(
                                        <div>
                                            <Select placeholder="省" style={{width: "45%", marginRight: 10}}
                                                    value={area.province || undefined} onChange={(value) => {
                                                setArea(1, value)
                                            }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                {provinceOptions}
                                            </Select>
                                            <Select placeholder="市" style={{width: "45%", marginRight: 10}}
                                                    value={area.city || undefined} onChange={(value) => {
                                                setArea(2, value)
                                            }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                {cityOptions}
                                            </Select>
                                        </div>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row>
                            <Col span={10}>
                                <FormItem className="photo photos"  label="成长图片：">
                                    {getFieldDecorator('photos', {
                                        rules: [{
                                            required: true,
                                            message: '成长图片不能为空',
                                        }],
                                    })(
                                        <div className="itemBox">
                                            {photoExist01}                                            
                                            <Upload
                                                name="file"                                          
                                                showUploadList={false}
                                                listType="picture-card"
                                                className="avatar-uploader"
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
                            </Col>
                        </Row>                       
                        
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem className="description longItem" label="资讯概述：">
                                    {getFieldDecorator('summary', {
                                        rules: [{
                                            required: true,
                                            message: '资讯概述不能为空',
                                        }],
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写资讯概述" rows={10}/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">资讯详情</h4>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem className="description longItem" label="资讯概述：">
                                    {getFieldDecorator('summary', {
                                        rules: [{
                                            required: true,
                                            message: '资讯概述不能为空',
                                        }],
                                    })(
                                       /* <div className="item">
                                            <textarea id="TextArea2" cols="20" rows="2" className="ckeditor"/>
                                        </div>  */ 
                                        /*<div ref={(ref) => this._div = ref}></div>*/
                                        <TextArea style={{resize: "none"}} placeholder="请填写资讯概述" rows={10}/>
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

//添加成长组件
class ItemAdd extends Component {
    constructor(props) {
      super(props);
    
      this.state = {
            visible: false,
            // 总成长类型表
            allTypeList: [],
            // 成长类型表
            typeList: [],
            // 短信验证码相关变量
            phone: "",
            countDown: 0,
            codeButtonStatus: false,
            // 成长图片相关变量
            // 上传Token
            uploadToken: '',
            fileKey: 0,
            viewPic01: "",
            photoList01: [],
            photoList11: [],
            avatarEditor01: {
                scale: 1,
                positionX: 0.5,
                positionY: 0.5
            },
            photoLoading: false,
            // 成长LOGO相关变量
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
            // 成长地址相关变量
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
            confirmLoading: false
        };
    this.fn_countDown = "";
    this.editor = "";
    }
    

    showModal = () => {
        this.setState({visible: true}, () => {
            this.getInstitutionTypeList();
            this.reqwestUploadToken();
            setTimeout(() => {
                this.setState({
                    mapObj: new window.AMap.Map('add-institution-container', {
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

    // 获取成长类型列表
    getInstitutionTypeList = () => {
        reqwest({
            url: '/sys/orgType/list',
            type: 'json',
            method: 'get',
            data: {
                status: 1,
            },
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
                    // const fnFilter = (para) => {
                    //     return para.parentId = item.id
                    // }
                    json.data.forEach((item) => {
                        let subData = [];
                        if (item.list) {
                            item.list.forEach((subItem) => {
                                subData.push({
                                    key: subItem.parentId + ',' + subItem.id,
                                    value: subItem.parentId + ',' + subItem.id,
                                    title: subItem.name,
                                    parentId: item.id,
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
                    console.log(data);
                    this.setState({
                        typeList: data
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
        });
    };

    // 根据输入成长名字模糊查找成长列表
    handleSearch = (value) => {
        console.log(value);
        reqwest({
            url: '/admin/org/list',
            type: 'json',
            method: 'get',
            data: {
                orgName: value,
                status: 2,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {},
            success: (json) => {
                if (json.result === 0) {
                    console.log(json.data.list)
                    const data = [];
                    if (json.data.list.length) {
                        json.data.list.forEach((item, index) => {
                            data.push({
                                id: item.id,
                                name: item.name,
                            })
                        });
                    }
                    this.setState({
                        allTypeList: data
                    });
                    // if (currentValue === value) {
                    //     const result = d.result;
                    //     const data = [];
                    //     result.forEach(r => {
                    //         data.push({
                    //             value: r[0],
                    //             text: r[0]
                    //         });
                    //     });
                    //     callback(data);
                    // }
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
    
    // 校验成长类型父级最多选三项
    checkOrgType = (rule, value, callback) => {
        console.log(value);
        // 类型校验
        // 此处要判断父Id最多选三项,如何筛选
        const parentIdsTemp = [];
        const typeIdsTemp = [];
        value.forEach((item, index) => {
            let endIndex = item.indexOf(',');
            let parentId = item.slice(0, endIndex);
            let id = item.slice(endIndex + 1);
            parentIdsTemp.push(Number(parentId));
            typeIdsTemp.push(Number(id));
        })
        // 获得选中的所有父id，去重
        let setParentIds = Array.from(new Set(parentIdsTemp));
        console.log(setParentIds);
        console.log(typeIdsTemp);
        // 父id和子id数组合并
        const temp = setParentIds.concat(typeIdsTemp);
        console.log(temp);
        if (setParentIds.length > 3) {
            // message.error("成长类型父级最多选三项");
            callback('成长类型父级最多选三项'); // 校验未通过
            // return;
        }
    };

    // 成长图片处理-----------------------------------
    // 初始图片写入
    setViewPic01 = (para) => {
        this.setState({
            viewPic01: para
        })
    };
    // 设置图片缩放比例及偏移量
    setAvatarEditor01 = (index, value) => {
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
                    // sessionStorage.uploadToken = json.data;
                    this.setState({
                        uploadToken: json.data,
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
                        this.setState({
                            loading: false
                        })
                    }
                }
            }
        });
    };

    // 图片上传
    picUpload01 = (para) => {
        const _this = this;
        if (this.state.photoList01.length >= 5) {
            message.error("图片最多上传5张");
            return
        } else {
            this.setState({
                photoLoading: true,
            });
            const file = para;
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
                    // message.error("图片提交失败");
                    _this.setState({
                        photoLoading: false,
                    })
                }, 
                complete (res) {
                    console.log(res);
                    message.success("图片提交成功");
                    let photoList01 = _this.state.photoList01;   
                    let photoList11 = _this.state.photoList11;                  
                    photoList01.push({
                        path: global.config.photoUrl + res.key
                    });
                    photoList11.push({
                        path: res.key
                    });
                    _this.setState({
                        photoList01: photoList01,
                        photoList11: photoList11,
                        viewPic01: "",
                        avatarEditor01: {
                            scale: 1,
                            positionX: 0.5,
                            positionY: 0.5
                        },
                        photoLoading: false,
                    })
                }
            }
            const observable = qiniu.upload(file, key, token, config);
            observable.subscribe(observer); // 上传开始
        }        
    };
    // 图片删除
    setPhotoList01 = (index) => {
        let data = this.state.photoList01;
        data.splice(index, 1);
        this.setState({
            photoList01: data
        })
    };

    // 成长地址处理-----------------------------------
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
                    provinceId: this.state.provinceList.filter(fnFilter)[0] ? this.state.provinceList.filter(fnFilter)[0].adcode : null,
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
                    cityId: this.state.cityList.filter(fnFilter)[0] ? this.state.cityList.filter(fnFilter)[0].adcode : null,
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
        console.log(para)
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
                    typeList: [],
                    phone: "",
                    countDown: 0,
                    codeButtonStatus: false,
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
        console.log(555)
        const form = this.form;
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            // 类型校验
            // 此处要判断父Id最多选三项,如何筛选
            // console.log(values.typeIds);
            // const typeIdsTemp = [];
            // const typeIdsTem = [];
            // values.typeIds.forEach((item, index) => {
            //     let endIndex = item.indexOf(',');
            //     let parentId = item.slice(0,endIndex);
            //     let id = item.slice(endIndex + 1);
            //     typeIdsTemp.push(Number(parentId));
            //     typeIdsTem.push(Number(id));
            // })
            // let setTypeIds = Array.from(new Set(typeIdsTemp));
            // console.log(setTypeIds);
            // console.log(typeIdsTem);
            // const temp = setTypeIds.concat(typeIdsTem);
            // console.log(temp);
            // if (setTypeIds.length > 3) {
            //     message.error("成长类型最多选三项");
            //     return;
            // }
            // values.typeId = values.typeIds[0];
            // values.typeIdTwo = values.typeIds[1] || 0;
            // values.typeIdThree = values.typeIds[2] || 0;
            // 成长图片校验
            // values.photo = this.state.photoList01[0] || 0;
            // values.photo2 = this.state.photoList01[1] || 0;
            // values.photo3 = this.state.photoList01[2] || 0;
            // values.photo4 = this.state.photoList01[3] || 0;
            // values.photo5 = this.state.photoList01[4] || 0;
            // if (!values.photos) {
            //     message.error("成长图片未提交");
            //     return
            // }
            // 成长logo校验
            // if (!this.state.data_pic02) {
            //     message.error("LOGO未提交");
            //     return
            // }
            // values.icon = this.state.data_pic02;
            // if (!this.state.area.street) {
            //     message.error("请选择成长所在省、市、区及街道");
            //     return
            // }
            // 需要特色标签转成json字符串
            // let labelAll = [];
            // if (values.label_01) {
            //     labelAll.push(values.label_01);
            // }
            // if (values.label_02) {
            //     labelAll.push(values.label_02);
            // }
            // if (values.label_03) {
            //     labelAll.push(values.label_03);
            // }
            // if (values.label_04) {
            //     labelAll.push(values.label_04);
            // }
            // if (values.label_05) {
            //     labelAll.push(values.label_05);
            // }
            // if (values.label_06) {
            //     labelAll.push(values.label_06);
            // }
            this.setState({
                confirmLoading: true
            });
            console.log(this.state.photoList01);
            const photoTemp = [];
            if (this.state.photoList01.length) {
                this.state.photoList11.forEach((item, index) => {
                    photoTemp.push(item.path);
                })
            }
            console.log(values.parentId)
           
            reqwest({
                url: '/sys/growthNews/save',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    title: values.title,
                    type: values.type,
                    provinceName: this.state.area.province,
                    provinceId: this.state.provinceId,
                    cityId: this.state.cityId,
                    cityName: this.state.area.city,
                    photo: photoTemp[0],
                    // photos: photoTemp,
                    summary: values.summary,
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("成长添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                typeList: [],
                                phone: "",
                                countDown: 0,
                                codeButtonStatus: false,
                                viewPic01: "",
                                photoList01: [],
                                avatarEditor01: {
                                    scale: 1,
                                    positionX: 0.5,
                                    positionY: 0.5
                                },
                                photoLoading: false,
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
                                areaId: null,
                                confirmLoading: false
                            });
                            form.resetFields();
                        });
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
            });
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    componentDidMount() {
        // 组件渲染后调用
        /*this.editor = window.CKEDITOR.replace('TextArea2');*/
        /*var editor = new Editor(document.getElementById(this._div));
        editor.create();*/
    }

    render() {
        return (
            <div>
            {/*<div style={{display: this.props.opStatus ? "block" : "none"}}>*/}
                <Button type="primary" onClick={this.showModal}>添加成长</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    allTypeList={this.state.allTypeList}
                    typeList={this.state.typeList}
                    handleSearch={this.handleSearch}
                    checkOrgType={this.checkOrgType}

                    viewPic01={this.state.viewPic01}
                    setViewPic01={this.setViewPic01}
                    picUpload01={this.picUpload01}
                    avatarEditor01={this.state.avatarEditor01}
                    setAvatarEditor01={this.setAvatarEditor01}
                    photoList01={this.state.photoList01}
                    setPhotoList01={this.setPhotoList01}
                    photoLoading={this.state.photoLoading}
                    
                    getUploadToken={this.getUploadToken}
                    reqwestUploadToken={this.reqwestUploadToken}
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
                {/*<div className="item">
                    <textarea id="TextArea2" cols="20" rows="2" className="ckeditor"/>
                </div> */}      
            </div>
        );
    }
}

//成长信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, allTypeList, viewPic01, setViewPic01, picUpload01, avatarEditor01, setAvatarEditor01, photoList01, setPhotoList01, photoLoading, provinceList, cityList, districtList, streetList, markers, setMarkers, area, setArea, mapObj, setXY, setFormattedAddress, formattedAddress, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 总成长选项生成
        const optionsOfAllTypeList = [];
        if (allTypeList) {
            allTypeList.forEach((item, index) => {
                optionsOfAllTypeList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
            });
        }  

        // 已上传图片列表
        const photoExist01 = [];
        photoList01.forEach((item, index) => {
            photoExist01.push(
                <div className="photoExist-item clearfix" key={index + 1}>
                    <img src={item.path} alt=""/>
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
        const dataURLtoFile = (url) => {
            let arr = url.split(','),
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
            }
            return new Blob([u8arr], {type: "image/jpeg"});
        };

        // 成长图片相关
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
                const file = dataURLtoFile(url);
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

        // 成长地址相关
        const provinceOptions = provinceList.map(item => <Option key={item.name}>{item.name}</Option>);
        const cityOptions = cityList.map(item => <Option key={item.name}>{item.name}</Option>);
        /*const districtOptions = districtList.map(item => <Option key={item.name}>{item.name}</Option>);
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
        };*/

        return (
            <Modal
                visible={visible}
                title="成长编辑"
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
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="area longItem" label="展示城市：">
                                            {getFieldDecorator('area', {
                                                rules: [{
                                                    required: false
                                                }],
                                            })(
                                                <div>
                                                    <Select placeholder="省" style={{width: "45%", marginRight: 10}}
                                                            value={area.province || undefined} onChange={(value) => {
                                                        setArea(1, value)
                                                    }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                        {provinceOptions}
                                                    </Select>
                                                    <Select placeholder="市" style={{width: "45%", marginRight: 10}}
                                                            value={area.city || undefined} onChange={(value) => {
                                                        setArea(2, value)
                                                    }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                        {cityOptions}
                                                    </Select>                                                    
                                                </div>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="advPositionIds" label="成长位置：">
                                            {getFieldDecorator('advPositionIds', {
                                                // initialValue: data.advPositionIds,
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '成长位置不能为空',
                                                    }
                                                ],
                                            })(
                                                <Select
                                                    style={{width: '100%'}}
                                                    placeholder="请选择成长位置"
                                                >
                                                    {/* {optionsOfTypeList}*/}
                                                    <Option key={1} value={1}>首页banner成长</Option>
                                                    <Option key={2} value={2}>育儿栏目banner成长</Option>
                                                    <Option key={3} value={3}>首页banner成长1</Option>
                                                    <Option key={4} value={4}>首页banner成长2</Option>
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    {/*<Col span={8}>
                                        <FormItem className="parentId" label="父级：">
                                            {getFieldDecorator('parentId', {
                                                initialValue: data.parentId,
                                                rules: [{
                                                    required: false,
                                                    message: '请选择总成长',
                                                }],
                                            })(
                                                <Select
                                                    showSearch
                                                    style={{width: '100%'}}
                                                    placeholder="请选择总成长"
                                                    onSearch={handleSearch}
                                                    onChange={handleChange}                        
                                                    filterOption={false}
                                                    notFoundContent={null}                                
                                                >
                                                    {optionsOfAllTypeList}
                                                </Select>  
                                            )}
                                        </FormItem>
                                    </Col>*/}
                                </Row>                             
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="photo photos" label="成长图片：">
                                            {getFieldDecorator('photos', {
                                                initialValue: photoList01[0],
                                                rules: [{
                                                    required: true,
                                                    message: '成长图片不能为空',
                                                }],
                                            })(
                                                <div className="itemBox">
                                                    {photoExist01}
                                                    <Upload
                                                        name="file"
                                                        listType="picture-card"
                                                        className="avatar-uploader"
                                                        showUploadList={false}
                                                        // action="/file/upload"
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
                                    </Col>
                                </Row>
                                
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="companyName" label="图片描述：">
                                            {getFieldDecorator('companyName', {
                                                initialValue: data.companyName,
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '图片描述不能为空',
                                                    },
                                                    {
                                                        min: 12,
                                                        message: '图片描述至少6个字'
                                                    },
                                                    {
                                                        max: 84,
                                                        message: '图片描述不能超过84个字符'
                                                    }
                                                ]
                                            })(
                                                <Input placeholder="请输入图片描述(6-42字)"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="licenseNumber" label="跳转链接：">
                                            {getFieldDecorator('licenseNumber', {
                                                initialValue: data.licenseNumber,
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

//成长编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,
        // 成长基本信息
        data: {},
        allTypeList: [],
        // 成长类型表
        typeList: [],
        // 成长图片相关变量
        uploadToken: "",
        viewPic01: "",
        photoList01: [],
        photoList11: [],
        avatarEditor01: {
            scale: 1,
            positionX: 0.5,
            positionY: 0.5
        },
        photoLoading: false,
        // 成长LOGO相关变量
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
        // 成长地址相关变量
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
        addressLoading: true,
        // 提交按钮状态变量
        confirmLoading: false,
        tempTypeIds: [],
    };

    // 获取成长类型列表
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
                                    key: subItem.id,
                                    value: subItem.parentId + ',' + subItem.id,
                                    // value: String(subItem.id),
                                    title: subItem.name,
                                    parentId: item.id,
                                })
                            })
                        }                        
                        data.push({
                            key: item.id,
                            value: String(item.id),
                            title: item.name,
                            children: subData,
                        })
                    });
                    console.log(data)
                    this.setState({
                        typeList: data
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
        })
    };

    onChange = (value) => {
        console.log('onChange ', value);
        this.setState({ 
            tempTypeIds: value
        });
    };

    // 获取成长基本信息
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
                // const json = {
                //     result: 0,
                //     data: {
                //         institution: {
                //             address: "浙江省杭州市余杭区仓前街道余杭四无粮仓陈列馆",
                //             areaId: 330110,
                //             areaName: "余杭区",
                //             balance: "",
                //             cityId: 330100,
                //             cityName: "杭州市",
                //             companyName: "",
                //             createTime: "",
                //             // description: "\n" + "\n" + "",
                //             detailedAddress: "余杭四无粮仓陈列馆",
                //             id: 1,
                //             lat: "30.291940",
                //             licenseNumber: "",
                //             lng: "120.007284",
                //             managerName: "",
                //             managerPhone: "",
                //             name: "",
                //             number: null,
                //             photo: "1",
                //             photo2: "",
                //             photo3: "",
                //             photo4: "",
                //             photo5: "",
                //             icon: "",
                //             fees: "",
                //             provinceId: 330000,
                //             provinceName: "浙江省",
                //             star: null,
                //             status: null,
                //             street: "仓前街道",
                //             telephone: "",
                //             typeId: 2,
                //             typeName: "",
                //             typeIdTwo: 3,
                //             updateTime: ""
                //         }
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    const data = [];
                    json.data.orgTypeList.forEach((item, index) => {
                        data.push(item.parentTypeId + ',' + item.typeId);
                    });
                    console.log(data)
                    json.data.org.typeIds = data;
                    this.setState({
                        data: json.data.org,
                        // typeIds: data,
                        // photoList01: photoList01,
                        photoList01: json.data.orgResourceList,
                        viewPic02: json.data.orgResourceList[0] ?  json.data.orgResourceList[0].path : "",
                        effectPic02: json.data.orgResourceList[1] ? json.data.orgResourceList[1].path : "",
                        data_pic02: json.data.orgResourceList[2] ? json.data.orgResourceList[2].path : "",
                        areaId: json.data.org.areaId,
                        formattedAddress: json.data.org.address,
                        xy: {
                            x: json.data.org.lng,
                            y: json.data.org.lat
                        }
                    }, () => {
                        // 成长地址相关操作
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
        // 获取成长基本信息
        this.getData();
        // 获取成长类型列表
        this.getInstitutionTypeList();
        // 获取上传Token
        this.reqwestUploadToken();
        this.setState({
            visible: true,
        })
    };

    handleSearch = (value) => {
        console.log(value);
        reqwest({
            url: '/admin/org/list',
            type: 'json',
            method: 'get',
            data: {
                orgName: value,
                status: 2,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {},
            success: (json) => {
                if (json.result === 0) {
                    console.log(json.data.list)
                    const data = [];
                    if (json.data.list.length) {
                        json.data.list.forEach((item, index) => {
                            data.push({
                                id: item.id,
                                name: item.name,
                            })
                        });
                    }
                    this.setState({
                        allTypeList: data
                    });
                    // if (currentValue === value) {
                    //     const result = d.result;
                    //     const data = [];
                    //     result.forEach(r => {
                    //         data.push({
                    //             value: r[0],
                    //             text: r[0]
                    //         });
                    //     });
                    //     callback(data);
                    // }
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
    picUpload01 = (para) => {
        const _this = this;
        if (this.state.photoList01.length >= 5) {
            message.error("图片最多上传5张");
            return
        } else {
            this.setState({
                photoLoading: true,
            });
            const file = para;
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
                        photoLoading: false,
                    })
                }, 
                complete (res) {
                    console.log(res);
                    message.success("图片提交成功");
                    let photoList01 = _this.state.photoList01; 
                    let photoList11 = _this.state.photoList11;               
                    photoList01.push({
                        path: global.config.photoUrl + res.key
                    });
                    photoList11.push({
                        path: res.key
                    })
                    _this.setState({
                        photoList01: photoList01,
                        photoList11: photoList11,
                        viewPic01: "",
                        avatarEditor01: {
                            scale: 1,
                            positionX: 0.5,
                            positionY: 0.5
                        },
                        photoLoading: false,
                    })
                }
            }
            const observable = qiniu.upload(file, key, token, config);
            observable.subscribe(observer); // 上传开始
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
        const _this = this;
        this.setState({
            logoLoading: true
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
        };
        const observable = qiniu.upload(file, key, token, config);
        observable.subscribe(observer); // 上传开始
    };

    // 成长地址处理-----------------------------------
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

    // 信息比对函数
    dataContrast = (values) => {
        console.log(values);
        const initValues = this.state.data;
        console.log(initValues);
        const itemList = ["name", "telephone", "fees", "description", "provinceName", "cityName", "areaName", "areaId", "street", "address", "detailedAddress", "lng", "lat", "companyName", "licenseNumber", "additionalProtocol", "businessHours", "scope", "classNumber", "teacherNumber"];
        const result = {};
        itemList.forEach((item) => {
            if (values[item] !== initValues[item]) {
                result[item] = values[item];
            }
        });
        // 成长类型
        if (values.typeIds.sort().toString() !== initValues.toString()) {
            result.typeIds = values.typeIds;
        }
        // 成长图片
        if (values.photos.toString() !== initValues.toString()) {
            const photoTemp = [];
            if (this.state.photoList01.length) {
                this.state.photoList11.forEach((item, index) => {
                    photoTemp.push(item.path);
                })
            }
            result.photos = photoTemp;
            console.log(result.photos);
        }
        if (values.icon.toString() !== initValues.toString()) {
            result.icon = this.state.data_pic22;
        }
        console.log(result);
        if (JSON.stringify(result) === "{}") {
            return false;
        } else {
            result.id = this.props.id;
            // result.educationKey = this.props.educationKey;
            return result;
        }
    };

    // 取消操作
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
                    title: '确认放弃修改？',
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
            // 成长类型写入与校验
            // 成长类型是父级最多选三个
            console.log(values);
            console.log(values.typeIds);
            const typeIdsTemp = [];
            const typeIdsTem = [];
            values.typeIds.forEach((item, index) => {
                let endIndex = item.indexOf(',');
                let parentId = item.slice(0,endIndex);
                let id = item.slice(endIndex + 1);
                typeIdsTemp.push(Number(parentId));
                typeIdsTem.push(Number(id));
            })
            let setTypeIds = Array.from(new Set(typeIdsTemp));
            console.log(setTypeIds);
            console.log(typeIdsTem);
            const temp = setTypeIds.concat(typeIdsTem);
            console.log(temp);
            if (setTypeIds.length > 3) {
                message.error("成长类型最多选三项");
                return;
            }
            values.typeIds = temp;

            // values.typeId = values.typeIds ? values.typeIds[0] : 0;
            // values.typeIdTwo = values.typeIds ? (values.typeIds[1] || 0) : 0;
            // values.typeIdThree = values.typeIds ? (values.typeIds[2] || 0) : 0;
            // 成长图片写入与校验
            // values.photos = this.state.photoList01;
            console.log(this.state.photoList01);
            console.log(values.photos);
            values.photo = this.state.photoList01[0];
            // values.photo2 = this.state.photoList01[1] || 0;
            // values.photo3 = this.state.photoList01[2] || 0;
            // values.photo4 = this.state.photoList01[3] || 0;
            // values.photo5 = this.state.photoList01[4] || 0;

            const photoTemp = [];
            if (this.state.photoList01.length) {
                this.state.photoList01.forEach((item, index) => {
                    let endIndex = item.path.indexOf('cn/');
                    // let endIndexo = item.path.indexOf('.jpg');
                    let pathTemp = item.path.slice(global.config.photoUrl.length);
                    photoTemp.push(pathTemp);
                })
            }

            if (this.state.data_pic02) {
                values.icon = this.state.data_pic22
            }

            if (!values.photo) {
                message.error("课程图片未选择或未提交");
                return
            }
            // 成长logo写入
            values.icon = this.state.data_pic02;
            // 成长地址信息写入
            values.provinceName = this.state.area.province;
            values.provinceId = this.state.provinceId;
            values.cityName = this.state.area.city;
            values.cityId = this.state.cityId;
            values.areaName = this.state.area.district;
            values.areaId = this.state.areaId;
            values.street = this.state.area.street;
            values.address = this.state.formattedAddress;
            values.lng = this.state.xy.x;
            values.lat = this.state.xy.y;
            // 信息比对
            // const result = this.dataContrast(values);
            let labelAll = [];
            if (values.label_01) {
                labelAll.push(values.label_01);
            }
            if (values.label_02) {
                labelAll.push(values.label_02);
            }
            if (values.label_03) {
                labelAll.push(values.label_03);
            }
            if (values.label_04) {
                labelAll.push(values.label_04);
            }
            if (values.label_05) {
                labelAll.push(values.label_05);
            }
            if (values.label_06) {
                labelAll.push(values.label_06);
            }
            const result = {
                id: this.props.id,
                title: values.title,
                type: values.type,
                photo: values.photo,
                photos: photoTemp,
                summary: values.summary,
                provinceName:  values.provinceName,
                provinceId: values.provinceId,
                cityName: values.cityName,
                cityId: values.cityId,
            }
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
                url: '/sys/growthNews/update',
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
                        message.success("成长信息修改成功，已提交审核");
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
            <a>
            {/*<a style={{display: this.props.opStatus ? "inline" : "none"}}>*/}
                <span onClick={this.showModal}>编辑</span>
                <ItemEditForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    onChange={this.onChange}
                    id={this.props.id}
                    data={this.state.data}
                    allTypeList={this.state.allTypeList}
                    handleSearch={this.handleSearch}
                    handleChange={this.handleChange}
                    typeList={this.state.typeList}
                    checkOrgType={this.checkOrgType}
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
            </a>
        );
    }
}

//成长信息详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        data: '',
        orgTypeList: [],
        orgResourceList: [],
        loading: true,
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
            // url: '/institution/getDetail',
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
                })
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
                //             description: "",
                //             detailedAddress: "",
                //             id: 177,
                //             lat: "",
                //             licenseNumber: "",
                //             lng: "",
                //             managerAddress: "",
                //             managerName: "",
                //             managerPhone: "",
                //             name: "",
                //             number: 1,
                //             photo: "",
                //             icon: "",
                //             fees: "",
                //             provinceId: null,
                //             provinceName: "",
                //             star: null,
                //             status: 2,
                //             telephone: "",
                //             typeId: 1,
                //             updateTime: "",
                //             additionalProtocol: "",
                //             realNameAuthentication: 0
                //         },
                //         typeName: "",
                //         typeNameTwo: "",
                //         typeNameThree: "",
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    // json.data.org.typeName = json.data.typeName;
                    // json.data.org.typeNameTwo = json.data.typeNameTwo;
                    // json.data.org.typeNameThree = json.data.typeNameThree;
                    json.data.org.star = (json.data.org.scoreNumber / json.data.org.totalScore).toFixed(2);
                    this.setState({
                        loading: false,
                        data: json.data.org,
                        orgTypeList: json.data.orgTypeList,
                        orgResourceList: json.data.orgResourceList,
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
                        this.setState({
                            loading: false
                        })
                    }
                }
            }
        });
    };

    showModal = () => {
        // this.getData();
        console.log(this.props.record)
        this.setState({
            visible: true,
            data: this.props.record,
            loading: false,
        });
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
        //                 <span className="item-name">成长类型一：</span>
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
            let realNameState = "";
            if (this.state.data.RealNameAuthentication === 0) {
                realNameState = "未认证";
            }
            if (this.state.data.RealNameAuthentication === 1) {
                realNameState = "已认证";
            }
            dataSource = [
                <div className="name">
                    <span className="item-name">成长标题：</span>
                    <span className="item-content">{this.state.data.title}</span>
                </div>,
                <div className="typeName">
                        <span className="item-name">成长类型：</span>
                        <span className="item-content">{this.state.data.typeName}</span>
                </div>,
                <div className="logo">
                    <span className="item-name">图片：</span>
                    {this.state.data.photo ? <img src={this.state.data.photo} alt=""
                                                 className="item-content"/> : "暂无"}
                </div>,
                <div className="sort">
                    <span className="item-name">排序：</span>
                    <span className="item-content">{this.state.data.sort}</span>
                </div>,
                <div className="subscribeNumber">
                    <span className="item-name">浏览量：</span>
                    <span className="item-content">{this.state.data.commentTotal}</span>
                </div>,
                <div className="description">
                    <span className="item-name">资讯概述：</span>
                    <pre>
                        <span className="item-content">{this.state.data.riches}</span>
                    </pre>
                </div>,
                <div className="description">
                    <span className="item-name">资讯概述：</span>
                    <pre>
                        <span className="item-content">{this.state.data.riches}</span>
                    </pre>
                </div>,                
                <div className="province">
                    <span className="item-name">展示城市：</span>
                    <span className="item-content">{this.state.data.cityName}</span>
                </div>,
                <div className="createTime">
                    <span className="item-name">创建时间：</span>
                    <span
                        className="item-content">{this.state.data.createTime}</span>
                </div>,
                <div className="status">
                    <span className="item-name">状态：</span>
                    <span className="item-content">{this.state.data.status}</span>
                </div>
            ];
        } else {
            dataSource = ""
        }
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>详情</span>
                <Modal
                    title="成长详情"
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

//成长列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            // 成长类型表
            typeList: [],
            // 当前成长类型
            type: null,
            // 当前成长状态
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
                width: 100,
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '排序',
                dataIndex: 'sort',
                width: 150,
                editable: true,
            },
            {
                title: '标题',
                dataIndex: 'title',
                className: 'operating',
                render: (text, record) => this.renderColumns(text, record, 'title'),
            },
            {
                title: '图片',
                dataIndex: 'photo',
                width: '6%',
                render: (text, record) => (<img style={{width: '45px', height: "25px"}} alt="" src={record["photo"]}/>)
            },
            {
                title: '类型',
                dataIndex: 'typeName',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'typeName'),
            },            
            {
                title: '展示城市',
                dataIndex: 'cityName',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'cityName'),
            },
            {
                title: '浏览量',
                dataIndex: 'commentTotal',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'commentTotal'),
            },
            {
                title: '创建日期',
                dataIndex: 'createTime',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '状态',
                dataIndex: 'status',
                /*filters: [
                    {text: '启用', value: 2},
                    {text: '禁用', value: 0},
                ],
                filterMultiple: false,*/
                render: (text, record) => this.renderColumns(text, record, 'status'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                width: 200,
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*成长详情*/}
                            <ItemDetails id={record.id} educationKey={record.educationKey} record={record}
                                      toLoginPage={this.props.toLoginPage} opStatus={this.props.opObj.modify}/>
                            {/*成长编辑*/}
                            <ItemEdit id={record.id} educationKey={record.educationKey} recapture={this.getData}
                                      toLoginPage={this.props.toLoginPage} opStatus={this.props.opObj.modify}/>
                            
                            {/*成长删除*/}
                            <Popconfirm title="确认删除?"
                                        placement="topRight"
                                        onConfirm={() => this.itemDelete(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="立即删除"
                                        cancelText="取消">
                                {
                                    /*<a style={{display: this.props.opObj.modify && record.statusCode === 2 ? "inline" : "none"}}>删除</a>*/
                                    <a>删除</a>
                                }
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

    //获取本页信息
    getData = (keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/growthNews/list',
            type: 'json',
            method: 'get',
            data: {
                // 成长类型
                type: keyword ? keyword.typeId : this.props.keyword.typeId,
                // 标题
                title: keyword ? keyword.title : this.props.keyword.title,
                // 省份
                provinceId: keyword ? keyword.provinceId : this.props.keyword.provinceId,
                // 城市
                cityId: keyword ? keyword.cityCode : this.props.keyword.cityCode,
                beginTime: keyword ? keyword.startTime : this.props.keyword.startTime,
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
                        if (item.state === 1) {
                            tempStatus = "审核中"
                        }
                        if (item.state === 2) {
                            tempStatus = "启用"
                        }
                        if (item.state === 3) {
                            tempStatus = "审核失败"
                        }
                        if (item.state === 0) {
                            tempStatus = "禁用"
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            sort: item.sort !== 0 ? item.sort : "",
                            title: item.title || "暂无",
                            photo: item.photo ? ("http://image.taoerxue.cn/" + item.photo) : "暂无",
                            cityName: item.cityName || "暂无",                
                            typeName: item.typeName || "暂无",
                            commentTotal: item.commentTotal,
                            summary: item.summary,
                            riches: item.riches,
                            createTime: item.createTime ? this.dateHandle(item.createTime) : "",
                            statusCode: item.status,
                            status: tempStatus
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

    // 获取成长类型列表
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
                //         {id: 1, name: "001"}
                //     ]
                // };
            },
            success: (json) => {
                const typeList = json.data.map((item) => {
                    return {text: item.name, value: item.id}
                });
                if (json.result === 0) {
                    this.setState({
                        typeList: typeList
                    })
                }
            }
        });
    };

    //成长禁用
    itemBan = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/institution/checkEducation',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                eId: id,
                status: 0
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("成长禁用成功");
                    this.getData(this.props.keyword);
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

    //成长启用
    itemOpen = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/institution/checkEducation',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                eId: id,
                status: 2
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("成长启用成功");
                    this.getData(this.props.keyword);
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
    
    // 成长删除
    itemDelete = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/growthNews/delete?id=' + id,
            type: 'json',
            method: 'delete',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("删除失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("成长删除成功");
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
            url: '/sys/growthNews/updateSort',
            type: 'json',
            method: 'post',
            data: {
                // 成长Id
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
    }

    componentWillMount() {
        this.getData();
        // this.getInstitutionTypeList();
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
        return <Table bordered
                      components={components}
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={this.state.pagination}
                      columns={columns}
                      scroll={{ x: 1800 }}
                      onChange={this.handleTableChange}/>;
    }
}

class GrowthManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            // typeId: 1,
            // 获取成长列表所需关键词
            keyword: {
                // 类型
                typeId: "",
                // 省份
                provinceId: "",
                // 城市
                cityCode: "",
                title: "",
                // 初始化开始日期和结束日期
                startTime: null,
                endTime: null,
            },
            flag_add: false,
            treeData: [],
            // 日期禁选控制
            startValue: null,
            endValue: null,
            endOpen: false,
        };
        // this.treeData = [];
        this.optionsType = [
            <Option key={1} value={1}>{"全部类型"}</Option>,
            <Option key={2} value={2}>{"父母成长"}</Option>,
            <Option key={3} value={3}>{"孩子成长"}</Option>,
            ];
        this.optionsCity = [<Option key={this.state.keyword.cityCode} value={this.state.keyword.cityCode}>{"全部"}</Option>];
    }

    getData = () => {
        this.refs.getDataCopy.getData();
    };

    // 城市列表 暂时不需要
    cityList = () => {
        reqwest({
            url: './city.json',
            type: 'json',
            method: 'get',
            success: (json) => {
                // for (let item in json) {
                //     console.log(item);
                //     this.optionsCity.push(
                //         // <OptGroup label={item}>
                //             {json.item.formEach((item, index)=>{
                //                 <Option key={item.id}>{item.name}</Option>
                //             })}
                //         // </OptGroup>
                //     )
                // }
                Object.keys(json).map((key) => {
                    json[key].forEach((item, index)=>{
                        this.optionsCity.push(
                            <Option key={item.id}>{item.name}</Option>
                        ) 
                    });
                    return false;
                });
            }
        });
    };

    // 类型选择设置
    setType = (value) => {
        console.log("selected:", value);
        this.setState({
            keyword: {
                typeId: value,
            }            
        })
    };

    // 城市选择设置
    setCity = (value) => {
        console.log("selected:", value);
        this.setState({
            keyword: {
                provinceId: value,
                cityCode: value,
            }
        })
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
    
    // 开始日期设置
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

    // 结束日期设置
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
        return startValue.valueOf() > endValue.valueOf();
    };

    // 禁用结束日期之后的日期
    disabledEndDate = (endValue) => {
        const startValue = this.state.startValue;
        if (!endValue || !startValue) {
          return false;
        }
        return endValue.valueOf() <= startValue.valueOf();
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
        this.cityList();
        this.getDataOne();
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
    // 省份数据处理
    handleTree = (data) => {
        const tempResult = [];
        const result = [];
        
        let data01 = data.provinceList;
        let cityLists = data.cityList;
        data01.forEach((item) => {
            const temp = {
                title: item.name,
                key: item.id, 
                id: item.id,             
            };
            tempResult.push(temp)
        });
        tempResult.forEach((item) => {
            const fnFilter02 = (para) => {
                return para.provinceId === item.id
            };
            let data02 = cityLists.filter(fnFilter02);
            if (data02.length) {
                item.children = [];
                data02.forEach((subItem) => {
                    const temp = {
                        key: subItem.id,
                        title: subItem.name,
                        id: subItem.id,
                    };
                    item.children.push(temp)                
                });
                result.push(item)
            }
        });
        console.log(result);
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
                type: 2,       
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
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        treeData: this.handleTree(json.data),
                    });
                    console.log(this.state.treeData);
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
            <div className="institutions">
                {
                    // this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                {/*成长位置筛选*/}
                                <Select defaultValue="全部成长位置"
                                        style={{
                                            width: "150px",
                                            float: "left",
                                            marginRight: "20px"
                                        }}
                                        onChange={this.setType}>
                                    {this.optionsType}
                                </Select>
                                {/*城市筛选*/}
                                <Select defaultValue="全部展示城市"
                                        style={{
                                            width: "150px",
                                            float: "left",
                                            marginRight: "20px"
                                        }}
                                        onChange={this.setCity}>
                                    {this.optionsCity}
                                </Select>
                                {/*成长名称筛选*/}
                                <Search
                                    placeholder="请输入标题信息"
                                    onSearch={this.setName}
                                    enterButton
                                    style={{width: "240px", float: "left", marginRight: "20px"}}
                                />
                                {/*成长创建日期筛选*/}
                                <span>日期筛选： </span>
                                <DatePicker placeholder="请选择开始日期"
                                            style={{width: "150px"}}
                                            disabledDate={this.disabledStartDate}
                                            onChange={this.setStartTime}
                                            />
                                <span style={{margin: "0 10px"}}>至</span>
                                <DatePicker placeholder="请选择结束日期"
                                            style={{width: "150px"}}
                                            disabledDate={this.disabledEndDate}
                                            onChange={this.setEndTime}
                                            />
                                {/*成长添加*/}
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd opStatus={this.state.opObj.add} toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            {/*成长列表*/}
                            <div className="table-box">
                                <DataTable 
                                        ref="getDataCopy"
                                        opObj={this.state.opObj} 
                                        keyword={this.state.keyword}
                                        flag_add={this.state.flag_add}
                                        toLoginPage={this.toLoginPage}/>
                            </div>                               
                        </div>
                        // :
                        // <p>暂无查询权限</p>
                }
            </div>  
        )
    }
}

export default GrowthManage;