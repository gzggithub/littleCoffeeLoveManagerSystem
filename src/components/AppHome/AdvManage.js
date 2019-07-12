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
    Row,
    Col,
    Icon,
    message,
    Spin,
    Tree,
    Cascader,
} from 'antd';
import '../../config/config';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';
import reqwest from 'reqwest';

const Search = Input.Search;
const {Option} = Select;
const FormItem = Form.Item;
const { TreeNode } = Tree;

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

//添加广告表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, allTypeList, optionsOfCity, reqwestUploadToken, viewPic, picUpload01, photoList01, setPhotoList01, photoLoading, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 总广告选项生成
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
        // const getBase64 = (img, callback) => {
        //     const reader = new FileReader();
        //     reader.addEventListener('load', () => callback(reader.result));
        //     reader.readAsDataURL(img);
        // };
        // 由图片地址获取其文件对象
        // const dataURLtoFile = (url) => {
        //     let arr = url.split(','),
        //         bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        //     while (n--) {
        //         u8arr[n] = bstr.charCodeAt(n)
        //     }
        //     return new Blob([u8arr], {type: "image/jpeg"});
        // };

        // 广告图片相关
        // 图片上传保持原比例
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

        // 广告地址相关
        // const provinceOptions = provinceList.map(item => <Option key={item.name}>{item.name}</Option>);
        // const cityOptions = cityList.map(item => <Option key={item.name}>{item.name}</Option>);
        // const districtOptions = districtList.map(item => <Option key={item.name}>{item.name}</Option>);
        // const streetOptions = streetList.map(item => <Option key={item.name}>{item.name}</Option>);
        // const addressChange = (value) => {
        //     if (!value) {
        //         return
        //     }
        //     let keyword = "";
        //     keyword = keyword + area.province + area.city + area.district + area.street;
        //     keyword = keyword + value;
        //     // 清除已有标记点
        //     mapObj.remove(markers);
        //     mapObj.plugin('AMap.Geocoder', function () {
        //         const geocoder = new window.AMap.Geocoder({});
        //         const marker = new window.AMap.Marker({
        //             map: mapObj,
        //             bubble: true
        //         });
        //         geocoder.getLocation(keyword, (status_, result_) => {
        //             if (status_ === 'complete' && result_.info === 'OK') {
        //                 geocoder.getAddress([result_.geocodes[0].location.lng, result_.geocodes[0].location.lat], (status, result) => {
        //                     if (status === 'complete' && result.info === 'OK') {
        //                         // 经纬度写入
        //                         setXY({x: result_.geocodes[0].location.lng, y: result_.geocodes[0].location.lat});
        //                         // 生成当前标记点
        //                         marker.setPosition(result_.geocodes[0].location);
        //                         mapObj.setCenter(marker.getPosition());
        //                         setMarkers(marker);
        //                         // address字段写入
        //                         setFormattedAddress(area.street ? keyword : result.regeocode.addressComponent.province + result.regeocode.addressComponent.city + result.regeocode.addressComponent.district + result.regeocode.addressComponent.township + keyword);
        //                         // 其他地址信息写入
        //                         setArea(5, result.regeocode.addressComponent);
        //                     }
        //                 });
        //             }
        //         });
        //     });
        // };

        return (
            <Modal
                visible={visible}
                title="添加广告"
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
                                <FormItem className="area longItem" label="展示城市：">
                                    {getFieldDecorator('cityId', {
                                        rules: [{
                                            required: true,
                                            message: '展示城市未选择'
                                        }],
                                    })(
                                        <Cascader options={optionsOfCity} placeholder="请选择展示城市"/>
                                        /*<div>
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
                                        </div>*/
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="advPosition" label="广告位置：">
                                    {getFieldDecorator('type', {
                                        rules: [
                                            {
                                                required: true,
                                                message: '广告类型不能为空',
                                            }
                                        ],
                                    })(
                                        <Select
                                            style={{width: '100%'}}
                                            placeholder="请选择广告位置"
                                            // onChange={handleFirstChange}
                                        >
                                            {/*{optionsType}*/}
                                            <Option key={3} value={3}>育儿资讯轮播 </Option>
                                            <Option key={4} value={4}>首页轮播</Option>
                                        </Select>                                       
                                    )}
                                </FormItem>
                            </Col>          
                        </Row>
                        <div className="ant-line"></div>
                        <Row>
                            <Col span={10}>
                                <FormItem className="photo" label="广告图片：">
                                    {getFieldDecorator('photo', {
                                        rules: [{
                                            required: true,
                                            message: '请上传广告图片',
                                        }],
                                    })(
                                        <Upload
                                            name="file"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            showUploadList={false}
                                            beforeUpload={beforeUpload}
                                            customRequest={picHandleChange}                                                                     
                                        >
                                            {viewPic ? <img src={viewPic} style={{width: "100%"}} alt=""/> : uploadButton}
                                        </Upload>
                                    )}
                                </FormItem>
                                {/*<FormItem className="icon" label="广告图片：">
                                    {getFieldDecorator('photo', {
                                        rules: [{
                                            required: true,
                                            message: '请上传广告图片',
                                        }],
                                    })(*/}
                                        {/*<div>
                                            <Upload
                                                name="avatar"
                                                listType="picture-card"
                                                className="avatar-uploader"
                                                style={{width: "190", height: "90px"}}
                                                showUploadList={false}
                                                beforeUpload={beforeUpload02}
                                              >
                                                {viewPic02 ? <img src={viewPic02} alt="avatar" /> : uploadButton02}
                                              </Upload>
                                              <Button type="primary"
                                                    onClick={picHandle02}
                                                    loading={logoLoading}
                                                    style={{
                                                        position: "absolute",
                                                        right: "0",
                                                        bottom: "0"
                                                    }}>{data_pic02 ? "重新提交" : "图片提交"}</Button>
                                        </div>*/}
                                        {/*<div className="itemBox">
                                            <Upload
                                                name="file"
                                                listType="picture-card"
                                                className="avatar-uploader"
                                                showUploadList={false}
                                                beforeUpload={beforeUpload02}
                                                customRequest={picHandleChange}
                                            >
                                                {viewPic02 ? partImg02 : uploadButton02}
                                            </Upload>*/}
                                            {/*<Row>
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
                                            </Row>*/}
                                            {/*<Button type="primary"
                                                    onClick={picHandle02}
                                                    loading={logoLoading}
                                                    style={{
                                                        position: "absolute",
                                                        right: "0",
                                                        bottom: "0"
                                                    }}>{data_pic02 ? "重新提交" : "图片提交"}</Button>
                                        </div>
                                    )}
                                </FormItem>*/}
                                {/*<FormItem className="photo photos"  label="广告图片：">
                                    {getFieldDecorator('photos', {
                                        rules: [{
                                            required: true,
                                            message: '广告图片不能为空',
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
                                </FormItem>*/}
                            </Col>
                        </Row>                       
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="companyName" label="图片描述：">
                                    {getFieldDecorator('title', {
                                        rules: [
                                            {
                                                required: true,
                                                message: '图片描述不能为空',
                                            },
                                            {
                                                min: 6,
                                                message: "图片描述至少6个字",
                                            },
                                            {
                                                max: 42,
                                                message: "图片描述不能超过42个字符",
                                            },
                                        ],
                                    })(
                                        <Input placeholder="请填写图片描述(6-42字)"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="licenseNumber" label="跳转链接：">
                                    {getFieldDecorator('linkAddress', {
                                        rules: [{
                                            required: false,
                                            message: '请填写跳转链接',
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
            </Modal>
        );
    }
);

//添加广告组件
class ItemAdd extends Component {
    state = {
        visible: false,
        // 总广告类型表
        allTypeList: [],
        // 广告类型表
        typeList: [],
        // 短信验证码相关变量
        phone: "",
        countDown: 0,
        codeButtonStatus: false,
        // 广告图片相关变量
        // 上传Token
        uploadToken: '',
        fileKey: 0,
        viewPic: "",
        data_pic: "",
        viewPic01: "",
        photoList01: [],
        photoList11: [],
        avatarEditor01: {
            scale: 1,
            positionX: 0.5,
            positionY: 0.5
        },
        photoLoading: false,
        // 广告LOGO相关变量
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
        // 广告地址相关变量
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
    fn_countDown = "";

    showModal = () => {
        this.setState({visible: true}, () => {
            this.getInstitutionTypeList();
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

    // 获取广告类型列表
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

    // 根据输入广告名字模糊查找广告列表
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
    
    // 广告图片处理-----------------------------------
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

    picUpload01 = (para) => {
        console.log(para);
        console.log(typeof(para))
        const _this = this;
        this.setState({
            photoLoading: true,
        });
        // if (para.name && para.type) {
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
                    _this.setState({
                        viewPic: global.config.photoUrl + res.key || "",
                        data_pic: res.key || "",             
                        photoLoading: false,
                    })
                }
            }
            const observable = qiniu.upload(file, key, token, config);
            observable.subscribe(observer); // 上传开始
        // }        
    };

    // 图片上传
    picUpload03 = (para) => {
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

    // 机构LOGO处理-----------------------------------
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

    // 广告地址处理-----------------------------------
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
        this.setState({
            visible: false
        }, () => {
            this.setState({
                typeList: [],
                phone: "",
                countDown: 0,
                codeButtonStatus: false,
                viewPic: "",
                data_pic: "",
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
        });
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            // 广告图片校验
            values.photo = this.state.viewPic;
            if (!values.photo) {
                message.error("广告图片未提交");
                return
            }
            
            if (values.photo && this.state.viewPic) {
                values.photo = this.state.data_pic
            }
            // 广告展示城市校验
            if (!values.cityId.length) {
                message.error("请选择广告展示城市");
                return
            }
            this.setState({
                confirmLoading: true
            });
           
            reqwest({
                url: '/sys/banner/save',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    title: values.title,
                    type: values.type,
                    photo: values.photo,
                    linkAddress: values.linkAddress,
                    provinceName: this.state.area.province,
                    provinceId: values.cityId[0],
                    cityId: values.cityId[1] || values.cityId[0],
                    cityName: this.state.area.city,                   
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("广告添加成功");
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

    // componentDidMount() {
    //     const _this = this;
    //     window.addEventListener('keypress', function(e) {
    //         if (e.which === 13) {
    //             _this.handleCreate();
    //         }
    //     });
    // }

    render() {
        return (
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button type="primary" onClick={this.showModal}>添加广告</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    allTypeList={this.state.allTypeList}
                    typeList={this.state.typeList}
                    handleSearch={this.handleSearch}
                    checkOrgType={this.checkOrgType}

                    viewPic={this.state.viewPic}

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
                    viewPic02={this.state.viewPic02}
                    effectPic02={this.state.effectPic02}
                    data_pic02={this.state.data_pic02}
                    setViewPic02={this.setViewPic02}
                    picUpload02={this.picUpload02}
                    avatarEditor02={this.state.avatarEditor02}
                    setAvatarEditor02={this.setAvatarEditor02}
                    logoLoading={this.state.logoLoading}

                    optionsOfCity={this.props.optionsOfCity}
                    optionsType={this.props.optionsType}
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

//广告信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, allTypeList, reqwestUploadToken, viewPic,  picUpload01, photoList01, setPhotoList01, photoLoading, provinceList, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 总广告选项生成
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
        // const getBase64 = (img, callback) => {
        //     const reader = new FileReader();
        //     reader.addEventListener('load', () => callback(reader.result));
        //     reader.readAsDataURL(img);
        // };
        // 由图片地址获取其文件对象
        // const dataURLtoFile = (url) => {
        //     let arr = url.split(','),
        //         bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        //     while (n--) {
        //         u8arr[n] = bstr.charCodeAt(n)
        //     }
        //     return new Blob([u8arr], {type: "image/jpeg"});
        // };

        // 图片上传保持原比例
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
        
        // 城市选项生成
        const optionsOfCity = [{value: "0", label: "全国"}];
        let currentCity = [];
        provinceList.forEach((item) => {
            let children = [];
            if (item.districtList) {
                item.districtList.forEach((subItem) => {
                    children.push({value: subItem.adcode, label: subItem.name});
                    // if (subItem.adcode === cityCode) {
                    // 数据类型的问题
                    if (Number(subItem.adcode) === data.cityId) {
                        // 当前城市设为选中项
                        currentCity = [item.adcode, subItem.adcode]
                        console.log(currentCity)
                    }
                });
            }
            optionsOfCity.push({value: item.adcode, label: item.name, children: children});
        });
        return (
            <Modal
                visible={visible}
                title="广告编辑"
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
                                            {getFieldDecorator('cityId', {
                                                initialValue: data.cityId === 0 ? ["0"] : currentCity,
                                                rules: [{
                                                    required: true,
                                                    message: "展示城市未选择"
                                                }],
                                            })(
                                                <Cascader options={optionsOfCity} placeholder="请选择所属城市"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="advPositionIds" label="广告位置：">
                                            {getFieldDecorator('type', {
                                                initialValue: data.type,
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '广告位置不能为空',
                                                    }
                                                ],
                                            })(
                                                <Select
                                                    style={{width: '100%'}}
                                                    placeholder="请选择广告位置"
                                                >
                                                    <Option key={3} value={3}>育儿资讯轮播</Option>
                                                    <Option key={4} value={4}>首页轮播</Option>
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>                                   
                                </Row>                             
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={10}>
                                        <FormItem className="photo" label="广告图片：">
                                            {getFieldDecorator('photo', {
                                                initialValue: viewPic,
                                                rules: [{
                                                    required: true,
                                                    message: '请上传广告图片',
                                                }],
                                            })(
                                                <Upload
                                                    name="file"
                                                    listType="picture-card"
                                                    className="avatar-uploader"
                                                    showUploadList={false}
                                                    beforeUpload={beforeUpload}
                                                    customRequest={picHandleChange}                                                                     
                                                >
                                                    {viewPic ? <img src={viewPic} style={{width: "100%"}} alt=""/> : uploadButton}
                                                </Upload>
                                            )}
                                        </FormItem>
                                        {/*<FormItem className="Icon" label="广告图片：">
                                            {getFieldDecorator('photo', {
                                                initialValue: viewPic02,
                                                rules: [{
                                                    required: true,
                                                    message: '请上传广告图片',
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
                                                    {<Row>
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
                                                    </Row>}
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
                                        </FormItem> */}                                   
                                    </Col>
                                </Row>
                                
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="companyName" label="图片描述：">
                                            {getFieldDecorator('title', {
                                                initialValue: data.name,
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '图片描述不能为空',
                                                    },
                                                    {
                                                        min: 6,
                                                        message: '图片描述至少6个字'
                                                    },
                                                    {
                                                        max: 42,
                                                        message: '图片描述不能超过42个字符'
                                                    }
                                                ]
                                            })(
                                                <Input placeholder="请输入图片描述(6-42字)"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="licenseNumber" label="跳转链接：">
                                            {getFieldDecorator('linkAddress', {
                                                initialValue: data.linkAddress,
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

//广告信息编辑组件
class ItemEdit extends Component {
    constructor(props) {
      super(props);
    
      this.state = {
            visible: false,
            // 广告基本信息
            data: {},
            allTypeList: [],
            // 广告类型表
            typeList: [],
            // 广告图片相关变量
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
            // 广告LOGO相关变量
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
            // 广告地址相关变量
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
    }    

    // 获取广告类型列表
    getInstitutionTypeList = () => {
        reqwest({
            url: '/sys/banner/list',        
            type: 'json',
            method: 'get',
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

    onChange = (value) => {
        console.log('onChange ', value);
        this.setState({ 
            tempTypeIds: value
        });
    };

    // 获取广告基本信息
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
            error: (XMLHttpRequest) => {},
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        data: json.data.org,
                        photoList01: json.data.orgResourceList,
                        viewPic02: json.data.orgResourceList[0] ?  json.data.orgResourceList[0].path : "",
                        effectPic02: json.data.orgResourceList[1] ? json.data.orgResourceList[1].path : "",
                        data_pic02: json.data.orgResourceList[2] ? json.data.orgResourceList[2].path : "",
                        areaId: json.data.org.areaId,
                        // area: {
                        //     province: "provinceName",
                        //     city: "cityName",
                        // },
                        // provinceId: "provinceId",
                        // cityId: "cityId",
                        formattedAddress: json.data.org.address,
                        xy: {
                            x: json.data.org.lng,
                            y: json.data.org.lat
                        }
                    }, () => {
                        // 广告地址相关操作
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
        // 获取广告基本信息
        console.log(this.props.record)
        // this.getData();
        this.getMapDate();
        this.setState({
            visible: true,
            data: this.props.record,
            viewPic: this.props.record.photo,
            area: {
                province: this.props.record.provinceName,
                city: this.props.record.cityName,
            },
            provinceId: this.props.record.provinceId,
            cityId: this.props.record.cityId
        })
    };

    // 获取省市列表信息及当前城市地区代码
    getMapDate = () => {
        this.setState({
            mapObj: new window.AMap.Map('information-mapContainer')
        }, () => {
            // 获取省区列表
            this.state.mapObj.plugin('AMap.DistrictSearch', () => {
                var districtSearch = new window.AMap.DistrictSearch({
                    level: 'country',
                    subdistrict: 2
                });
                districtSearch.search('中国', (status, result) => {
                    this.setState({
                        provinceList: result.districtList[0].districtList
                    })
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
    
    picUpload01 = (para) => {
        console.log(para);
        console.log(typeof(para))
        const _this = this;
        this.setState({
            photoLoading: true,
        });
        // if (para.name && para.type) {
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
                    _this.setState({
                        viewPic: global.config.photoUrl + res.key || "",
                        data_pic: res.key || "",             
                        photoLoading: false,
                    })
                }
            }
            const observable = qiniu.upload(file, key, token, config);
            observable.subscribe(observer); // 上传开始
        // }        
    };
    // 暂时舍弃
    picUpload04 = (para) => {
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

    //LOGO处理 暂时舍弃
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
    // 暂时舍弃
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

    // 广告地址处理-----------------------------------
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
        const itemList = ["title", "provinceName", "cityName", "type", "linkAddress"];
        const result = {};
        itemList.forEach((item) => {
            if (values[item] !== initValues[item]) {
                result[item] = values[item];
            }
        });
        // 广告类型
        // if (values.typeIds.sort().toString() !== initValues.toString()) {
        //     result.typeIds = values.typeIds;
        // }
        // 广告图片
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
            return result;
        }
    };

    // 取消操作
    handleCancel = () => {
        this.setState({
            visible: false
        }, () => {
            this.setState({
                data: {},
                typeList: [],
                viewPic: "",
                data_pic: "",
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
        });
    };

    // 确认操作
    handleCreate = () => {
        // data空值处理
        if (JSON.stringify(this.state.data) === "{}") {
            return;
        }
        const form = this.form;
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            // 广告图片写入与校验
            // values.photos = this.state.photoList01;
            console.log(this.state.photoList01);
            console.log(values.photos);
            // values.photo = this.state.photoList01[0];

            // const photoTemp = [];
            // if (this.state.photoList01.length) {
            //     this.state.photoList01.forEach((item, index) => {
            //         let endIndex = item.path.indexOf('cn/');
            //         // let endIndexo = item.path.indexOf('.jpg');
            //         let pathTemp = item.path.slice(endIndex + 3);
            //         photoTemp.push(pathTemp);
            //     })
            // }
            // 编辑修改图片是没有提交，没有提示
            // if (values.photo !== this.state.viewPic02) {
            //     message.error("课程图片未选择或未提交");
            //     return
            // }

            // 如何判断是否修改
            if (!this.state.viewPic) {
                message.error("广告图片未选择提交");
                return
            }
            
            if (this.state.viewPic) {
                // console.log(values.photo)
                // console.log(this.state.data_pic)
                // console.log(this.state.viewPic)
                let pathTemp = this.state.viewPic.slice(global.config.photoUrl.length);
                values.photo = pathTemp;
            }

            // if (this.state.data_pic02) {
            //     values.photo = this.state.data_pic22
            // }           
            // console.log(values.photo);
            // 广告logo写入
            values.icon = this.state.data_pic02;
            // 广告地址信息写入
            // values.provinceName = this.state.area.province;
            // values.provinceId = this.state.provinceId;
            // values.cityName = this.state.area.city;
            // values.cityId = this.state.cityId;
            if (!values.cityId) {
                message.error("请选择展示城市");
                return
            }
            // values.areaName = this.state.area.district;
            // values.areaId = this.state.areaId;
            // values.street = this.state.area.street;
            // values.address = this.state.formattedAddress;
            // values.lng = this.state.xy.x;
            // values.lat = this.state.xy.y;
            // 信息比对
            // const result = this.dataContrast(values);
            const result = {
                id: this.props.id,
                title: values.title,
                type: values.type,
                photo: values.photo,
                linkAddress: values.linkAddress,                
                provinceId: values.cityId[0],
                cityId: values.cityId[1] || values.cityId[0],               
            }
            if (!result) {
                message.error("暂无信息更改");
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/sys/banner/update',
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
                        message.success("广告信息修改成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                data: {},
                                typeList: [],
                                viewPic: "",
                                data_pic: "",
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

    // componentDidMount() {
    //     const _this = this;
    //     window.addEventListener('keypress', function(e) {
    //         if (e.which === 13) {
    //             _this.handleCreate();
    //         }       
    //     });
    // }

    render() {
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
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
                    reqwestUploadToken={this.reqwestUploadToken}
                    viewPic={this.state.viewPic}
                    picUpload01={this.picUpload01}

                    viewPic01={this.state.viewPic01}
                    setViewPic01={this.setViewPic01}                    
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
                    optionsType={this.props.optionsType}

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

//广告列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            // 广告类型表
            typeList: [],
            // 当前广告类型
            type: null,
            // 当前广告状态
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
                width: 20,
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '排序',
                dataIndex: 'sort',
                width: 100,
                editable: true,
            },
            {
                title: '描述',
                dataIndex: 'name',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '图片',
                dataIndex: 'photo',
                width: '6%',
                render: (text, record) => (
                    <div className="hove-photo-scale">
                        <img style={{width: '45px', height: "25px"}} alt="" src={record["photo"]}/>
                    </div>
                )
            },
            {
                title: '广告位置',
                dataIndex: 'typeName',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'typeName'),
            },            
            {
                title: '展示城市',
                dataIndex: 'cityName',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'cityName'),
            },
            {
                title: '跳转链接',
                dataIndex: 'linkAddress',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'linkAddress'),
            },
            {
                title: '创建日期',
                dataIndex: 'createTime',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                width: 100,
                className: 'operating',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*广告编辑*/}
                            <ItemEdit 
                                id={record.id}
                                record={record} 
                                educationKey={record.educationKey}
                                recapture={this.getData}
                                provinceList={this.props.provinceList}
                                optionsType={this.props.optionsType}
                                toLoginPage={this.props.toLoginPage} 
                                opStatus={this.props.opObj.modify}/>                            
                            {/*广告删除*/}
                            <Popconfirm 
                                title="确认删除?"
                                placement="topRight"
                                onConfirm={() => this.itemDelete(record.id)}
                                onCancel=""
                                okType="danger"
                                okText="立即删除"
                                cancelText="取消">
                                {
                                    <a style={{display: this.props.opObj.delete ? "inline" : "none"}}>删除</a>
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
        reqwest({
            url: '/sys/banner/list',
            type: 'json',
            method: 'get',
            data: {
                // 广告位置
                type: keyword ? keyword.type : this.props.keyword.type,
                // 广告描述
                title: keyword ? keyword.educationName : this.props.keyword.educationName,
                // 城市
                cityId: keyword ? keyword.cityCode : this.props.keyword.cityCode,
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
                        // const fnFilter = (para) => {
                        //     return para.id === item.id
                        // };
                        let tempStatus = "";
                        if (item.status === 1) {
                            tempStatus = "审核中"
                        }
                        if (item.status === 2) {
                            tempStatus = "启用"
                        }
                        if (item.status === 3) {
                            tempStatus = "审核失败"
                        }
                        if (item.status === 0) {
                            tempStatus = "禁用"
                        }
                        // 广告位置
                        let tempTypeName = "";
                        // if (item.type === 1) {
                        //     tempTypeName = "育儿资讯轮播"
                        // }
                        if (item.type === 3) {
                            tempTypeName = "育儿资讯轮播"
                        }
                        if (item.type === 4) {
                            tempTypeName = "首页轮播"
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            sort: item.sort !== 0 ? item.sort : "",                            
                            name: item.title,
                            photo: item.photo,
                            type: item.type,
                            typeName: tempTypeName,
                            cityName: item.cityName,
                            cityId: item.cityId,
                            linkAddress: item.linkAddress,
                            createTime: item.createTime,
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

    // 获取广告类型列表
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

    //广告禁用
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
                    message.success("广告禁用成功");
                    this.getData(this.props.keyword);
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

    //广告启用
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
                    message.success("广告启用成功");
                    this.getData(this.props.keyword);
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

    //广告删除
    itemDelete = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/banner/delete?id=' + id,
            type: 'json',
            method: 'delete',
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
                    message.success("广告删除成功");
                    this.getData(this.props.keyword);
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
            url: '/sys/banner/updateSort',
            type: 'json',
            method: 'post',
            data: {
                // 广告Id
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
        return <Table 
                    bordered
                    components={components}
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    columns={columns}
                    scroll={{ x: 1500 }}
                    onChange={this.handleTableChange}/>;
    }
}

class AdvManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            type: 0,
            // 获取广告列表所需关键词
            keyword: {
                type: null,
                cityCode: "",
                educationName: "",
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
            // 地图控件对象
            mapObj: {},
            // 省市列表
            provinceList: [],
            // 当前城市的地区代码
            cityCode: "",
        };
        // this.treeData = [];
        this.optionsType = [
            <Option key={this.state.keyword.type} value={this.state.keyword.type}>{"全部广告位置"}</Option>,
            <Option key={3} value={3}>育儿资讯轮播 </Option>,
            <Option key={4} value={4}>首页轮播</Option>,
        ];
        
        this.optionsOfCity = [{value: "0", label: "全国"}];
        this.optionsCity = [<Option key={this.state.keyword.cityCode} value={this.state.keyword.cityCode}>{"全部"}</Option>];
    }

    getData = () => {
        this.refs.getDataCopy.getData();
    };

    // 获取广告类型列表
    getInstitutionTypeList = () => {
        reqwest({
            url: '/sys/banner/list',
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
                    json.data.list.forEach((item) => {             
                        data.push({
                            key: item.id,
                            value: item.id,
                            title: item.title,
                        })
                        this.optionsType.push(<Option key={item.id} value={item.id}>{item.title}</Option>)
                    });
                    console.log(data);
                    this.setState({
                        typeList: data
                    }, () => {
                        // this.advList();
                    })
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
                    }
                }
            }
        });
    };

    advList = () => {
        // 广告位置选项生成
        console.log(this.state.typeList)
        this.state.typeList.forEach((item) => {
            this.optionsType.push(<Option key={item.id} value={item.id}>{item.title}</Option>);
        });
    };

    //广告位置设置
    setType = (value) => {
        console.log("selected:", value);
        this.setState({
            keyword: {
                type: value,
                cityCode: this.state.keyword.cityCode,
                educationName: this.state.keyword.educationName,
                startTime: this.state.keyword.startTime,
                endTime: this.state.keyword.endTime,
            }
        })
    };

    // 城市列表 暂时不需要
    cityList01 = () => {
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

    //城市选择设置
    setCity = (value) => {
        console.log("selected:", value);
        this.setState({
            keyword: {
                type: this.state.keyword.type,
                cityCode: value[1] || value[0],
                educationName: this.state.keyword.educationName,
                startTime: this.state.keyword.startTime,
                endTime: this.state.keyword.endTime,
            }
        })
    };

    // 获取省市列表信息及当前城市地区代码
    getMapDate = () => {
        console.log(12222)
        this.setState({
            mapObj: new window.AMap.Map('adv-mapContainer')
        }, () => {
            // 获取省区列表
            this.state.mapObj.plugin('AMap.DistrictSearch', () => {
                var districtSearch = new window.AMap.DistrictSearch({
                    level: 'country',
                    subdistrict: 2
                });
                districtSearch.search('中国', (status, result) => {
                    this.setState({
                        provinceList: result.districtList[0].districtList
                    }, () => {
                        console.log(this.state.provinceList);
                        this.cityList();
                    })
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

    cityList = () => {
        // 城市选项生成
        console.log(this.state.provinceList)
        this.state.provinceList.forEach((item) => {
            let children = [];
            if (item.districtList) {
                item.districtList.forEach((subItem) => {
                    children.push({value: subItem.adcode, label: subItem.name});
                    // if (subItem.adcode === cityCode) {
                    //     // 当前城市设为选中项
                    //     currentCity = [item.adcode, subItem.adcode]
                    // }
                });
            }
            this.optionsOfCity.push({value: item.adcode, label: item.name, children: children});
        });
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
                    // console.log(thirdItem.ur);
                    // console.log(this.props.location.pathname);
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

    // 名称关键词设置
    setName = (value) => {
        if (value !== this.state.keyword.educationName) {
            this.setState({
                keyword: {
                    type: this.state.keyword.type,
                    cityCode: this.state.keyword.cityCode,
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
        // 获取广告位置列表(是写死的就两项)
        // this.getInstitutionTypeList();
        // this.cityList();
        // 获取省份城市
        this.getMapDate();
        // 获取权限
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
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                {/*广告位置筛选*/}
                                <Select 
                                    // defaultValue="全部广告位置"
                                    style={{
                                        width: "150px",
                                        float: "left",
                                        marginRight: "20px"
                                    }}
                                    onChange={this.setType}
                                    placeholder="请选择广告位置"
                                    allowClear>
                                    {this.optionsType}
                                </Select>
                                {/*城市筛选*/}
                                <Cascader 
                                    options={this.optionsOfCity} 
                                    onChange={this.setCity} 
                                    style={{width: "150px", float: "left", marginRight: "20px"}} 
                                    placeholder="请选择所属城市"
                                    allowClear/>
                                {/*<Select defaultValue="全部展示城市"
                                        style={{
                                            width: "150px",
                                            float: "left",
                                            marginRight: "20px"
                                        }}
                                        onChange={this.setCity}>
                                    {this.optionsCity}
                                </Select>*/}
                                {/*广告名称筛选*/}
                                <Search
                                    placeholder="请输入描述信息"
                                    onSearch={this.setName}
                                    enterButton
                                    style={{width: "240px", float: "left", marginRight: "20px"}}
                                />
                                {/*广告创建日期筛选*/}
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
                                {/*广告添加*/}
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd 
                                        opStatus={this.state.opObj.add}
                                        optionsOfCity={this.optionsOfCity}
                                        provinceList={this.state.provinceList}
                                        optionsType={this.optionsType}
                                        recapture={this.getData}
                                        toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            {/*广告列表*/}
                            <div className="table-box">
                                <DataTable 
                                        ref="getDataCopy"
                                        opObj={this.state.opObj}
                                        provinceList={this.state.provinceList}
                                        optionsType={this.optionsType}
                                        typeList={this.state.typeList}
                                        keyword={this.state.keyword}
                                        flag_add={this.state.flag_add}
                                        toLoginPage={this.toLoginPage}/>
                            </div>
                            {/*地图组件容器*/}
                            <div id="adv-mapContainer"/>                              
                        </div>
                        :
                        <p>暂无查询权限</p>
                }
            </div>  
        )
    }
}

export default AdvManage;