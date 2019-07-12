import React, {Component} from 'react';
import {
    Table,
    Input,
    DatePicker,
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
    Spin,
} from 'antd';
import '../../config/config';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';
import reqwest from 'reqwest';
import AvatarEditor from 'react-avatar-editor'

const Search = Input.Search;
const {Option} = Select;
const FormItem = Form.Item;
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

//订单信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, allTypeList, reqwestUploadToken, photoList01, setPhotoList01, viewPic02, effectPic02, data_pic02, setViewPic02, picUpload02, avatarEditor02, setAvatarEditor02, logoLoading, provinceList, cityList, area, setArea, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 总订单选项生成
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
        
         // 机构LOGO相关
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

        // 订单展示城市地址相关
        const provinceOptions = provinceList.map(item => <Option key={item.name}>{item.name}</Option>);
        const cityOptions = cityList.map(item => <Option key={item.name}>{item.name}</Option>);    

        return (
            <Modal
                visible={visible}
                title="订单编辑"
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
                                        <FormItem className="advPositionIds" label="订单位置：">
                                            {getFieldDecorator('type', {
                                                initialValue: data.type,
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '订单位置不能为空',
                                                    }
                                                ],
                                            })(
                                                <Select
                                                    style={{width: '100%'}}
                                                    placeholder="请选择订单位置"
                                                >
                                                    {/* {optionsOfTypeList}*/}
                                                    <Option key={1} value={1}>首页banner订单</Option>
                                                    <Option key={2} value={2}>育儿栏目banner订单</Option>
                                                    <Option key={3} value={3}>首页banner订单1</Option>
                                                    <Option key={4} value={4}>首页banner订单2</Option>
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
                                                    message: '请选择总订单',
                                                }],
                                            })(
                                                <Select
                                                    showSearch
                                                    style={{width: '100%'}}
                                                    placeholder="请选择总订单"
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
                                        <FormItem className="icon" label="订单图片：">
                                            {getFieldDecorator('photo', {
                                                initialValue: viewPic02,
                                                rules: [{
                                                    required: true,
                                                    message: '请上传机构LOGO',
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

//订单信息编辑组件
class ItemEdit extends Component {
    constructor(props) {
      super(props);
    
      this.state = {
            visible: false,
            // 订单基本信息
            data: {},
            allTypeList: [],
            // 订单类型表
            typeList: [],
            // 订单图片相关变量
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
            // 订单LOGO相关变量
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
            // 订单地址相关变量
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

    // 获取订单类型列表
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

    // 获取订单基本信息
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
                    // const data = [];
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
                        // 订单地址相关操作
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
        // 获取订单基本信息
        console.log(this.props.record)
        // this.getData();
        // 获取订单类型列表
        this.getInstitutionTypeList();
        // 获取上传Token
        // this.reqwestUploadToken();
        this.getMapDate();
        this.setState({
            visible: true,
            data: this.props.record,
            viewPic02: this.props.record.photo,
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

    // 订单地址处理-----------------------------------
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
        // 订单类型
        // if (values.typeIds.sort().toString() !== initValues.toString()) {
        //     result.typeIds = values.typeIds;
        // }
        // 订单图片
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
            // const result = this.dataContrast(values);
            // if (result) {
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
            // } else {
            //     cancel()
            // }
        })
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
            // 订单图片写入与校验
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

            if (!values.photo) {
                message.error("课程图片未选择或未提交");
                return
            }

            if (this.state.data_pic02) {
                values.photo = this.state.data_pic22
            }

            if (values.photo) {
                let endIndex = values.photo.indexOf('cn/');
                let pathTemp = values.photo.slice(endIndex + 1);
                values.photo = pathTemp;
            }            
            console.log(values.photo);
            // 订单logo写入
            values.icon = this.state.data_pic02;
            // 订单地址信息写入
            values.provinceName = this.state.area.province;
            values.provinceId = this.state.provinceId;
            values.cityName = this.state.area.city;
            values.cityId = this.state.cityId;
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
                provinceName: this.state.area.province,
                provinceId: this.state.provinceId,
                cityId: this.state.cityId,
                cityName: this.state.area.city,
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
                        message.success("订单信息修改成功");
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
                        this.props.recapture();
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
                    reqwestUploadToken={this.reqwestUploadToken}
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

//订单列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            // 订单类型表
            typeList: [],
            // 当前订单类型
            type: null,
            // 当前订单状态
            status: null,
            addStatus: false,
            pagination: {
                current: 1,
                pageSize: Number(localStorage.institutionPageSize) || 10,
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
                title: '课程名称',
                dataIndex: 'typeName',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'typeName'),
            },  
            {
                title: '订单编号',
                dataIndex: 'name',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '下单时间',
                dataIndex: 'createTime',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '订单金额',
                dataIndex: 'photo',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },                      
            {
                title: '所属机构',
                dataIndex: 'cityName',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'cityName'),
            },
            {
                title: '支付单号',
                dataIndex: 'linkAddress',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'linkAddress'),
            },            
            {
                title: '支付时间',
                dataIndex: 'createTime',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '已消费课时/总课时',
                dataIndex: 'createTime',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '用户帐号',
                dataIndex: 'createTime',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '支付方式',
                dataIndex: 'createTime',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '订单状态',
                dataIndex: 'createTime',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                width: 200,
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*订单使用*/}
                            <ItemEdit id={record.id}
                                      record={record} 
                                      educationKey={record.educationKey}
                                      recapture={this.getData}
                                      toLoginPage={this.props.toLoginPage} 
                                      opStatus={this.props.opObj.modify}/>
                            {/*订单查看*/}
                            <ItemEdit id={record.id}
                                      record={record} 
                                      educationKey={record.educationKey}
                                      recapture={this.getData}
                                      toLoginPage={this.props.toLoginPage} 
                                      opStatus={this.props.opObj.modify}/>
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
            url: '/sys/banner/list',
            type: 'json',
            method: 'get',
            data: {
                // 订单位置
                type: keyword ? keyword.type : this.props.keyword.type,
                // 订单描述
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
                        // const tempShopStatus = json.data.shopStatus ? json.data.shopStatus.filter(fnFilter)[0].shopStatus : 1;
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
                        // 订单位置
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

    // 获取订单类型列表
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

    //订单禁用
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
                    message.success("订单禁用成功");
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

    //订单启用
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
                    message.success("订单启用成功");
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

    //订单删除
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
                    message.success("订单删除成功");
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
                // 订单Id
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
                      scroll={{ x: 1500 }}
                      onChange={this.handleTableChange}/>;
    }
}

class Order extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            // 获取订单列表所需关键词
            keyword: {
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
        };
        // this.treeData = [];
        this.optionsType = [
            <Option key={this.state.keyword.type} value={this.state.keyword.type}>{"全部"}</Option>,
            <Option key={3} value={3}>育儿资讯轮播 </Option>,
            <Option key={4} value={4}>首页轮播</Option>,
        ];
        this.optionsCity = [<Option key={this.state.keyword.cityCode} value={this.state.keyword.cityCode}>{"全部"}</Option>];
    }

    getData = () => {
        this.refs.getDataCopy.getData();
    };

    //订单位置设置
    setType = (value) => {
        console.log("selected:", value);
        this.setState({
            keyword: {
                type: value,
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
            <div className="institutions">
                {
                    // this.state.opObj.select ?
                        <div>
                            <header className="clearfix">                                
                                {/*订单名称筛选*/}
                                <Search
                                    placeholder="请输入订单编号或机构名称"
                                    onSearch={this.setName}
                                    enterButton
                                    style={{width: "240px", float: "left", marginRight: "20px"}}
                                />
                                {/*订单创建日期筛选*/}
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
                            </header>
                            {/*订单列表*/}
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

export default Order;