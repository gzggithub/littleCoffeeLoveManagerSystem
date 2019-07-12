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
    List,
    InputNumber,
    Cascader,
} from 'antd';
import '../../config/config';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';
import reqwest from 'reqwest';
import AvatarEditor from 'react-avatar-editor';
import ReactAudioPlayer from 'react-audio-player';

const Search = Input.Search;
const {Option} = Select;
const FormItem = Form.Item;
const {TextArea} = Input;

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

//添加听书表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, optionsOfType, typeList, optionsOfCity, reqwestUploadToken, viewPic, effectPic, data_pic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoLoading, picUpload02, confirmLoading} = props;
        const {getFieldDecorator} = form;
        
        // 听书类别选项生成
        const optionsOfTypeList = [];
        if (typeList) {
            typeList.forEach((item, index) => {
                optionsOfTypeList.push(<Option key={index + 1} value={item.listenBookType.id}>{item.listenBookType.name}</Option>);
            });
        }        

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
                reqwestUploadToken();
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

        // 听书音频选择之后相关操作
        const beforeUpload02 = (file) => {            
            // 文件大小校验
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('文件不能大于5M');
            }         
            reqwestUploadToken();           
            return isLt5M;
        };
        // 点击提交按钮的相关操作
        const picHandleChange02 = (info) => {
            setTimeout(()=>{
                picUpload02(info.file);
            }, 500);
            
        };        

        return (
            <Modal
                visible={visible}
                title="添加听书"
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
                                <FormItem className="companyName" label="听书标题：">
                                    {getFieldDecorator('title', {
                                        rules: [
                                            {
                                                required: true,
                                                message: '听书标题不能为空',
                                            },
                                            {
                                                min: 6,
                                                message: "听书标题至少6个字",
                                            },
                                            {
                                                max: 42,
                                                message: "听书标题不能超过42个字符",
                                            },
                                        ],
                                    })(
                                        <Input placeholder="请填写听书标题(6-42字)"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="advPosition" label="听书分类：">
                                    {getFieldDecorator('type', {
                                        rules: [
                                            {
                                                required: true,
                                                message: '听书分类不能为空',
                                            }
                                        ],
                                    })(
                                        <Cascader options={optionsOfType} placeholder="请选择分类"/>                                       
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="companyName" label="听书来源：">
                                    {getFieldDecorator('source', {
                                        rules: [
                                            {
                                                required: false,
                                                message: '听书标题不能为空',
                                            },
                                            {
                                                max: 10,
                                                message: "听书标题不能超过10个字",
                                            },
                                        ],
                                    })(
                                        <Input placeholder="请填写听书来源(不超过10个字)"/>
                                    )}
                                </FormItem>
                            </Col> 
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="originalPrice" label="原价（￥）：">
                                    {getFieldDecorator('originalPrice', {
                                        rules: [{
                                            required: true,
                                            message: '原价不能为空',
                                        }],
                                    })(
                                        <InputNumber min={0} precision={2} step={100} style={{width: "100%"}} placeholder="请输入价格，支持两位小数"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="price"  label="现价（￥）：">
                                    {getFieldDecorator('price', {
                                        rules: [{
                                            required: true,
                                            message: '现价不能为空',
                                        }],
                                    })(
                                        <InputNumber min={0} precision={2} step={100} style={{width: "100%"}} placeholder="请输入价格，支持两位小数"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="area" label="展示城市：">
                                    {getFieldDecorator('cityId', {
                                        rules: [{
                                            required: true,
                                            message: '展示城市未选择'
                                        }],
                                    })(
                                        <Cascader options={optionsOfCity} placeholder="请选择展示城市"/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
                        <Row>
                            <Col span={10}>
                                <FormItem className="photo" label="听书图片：">
                                    {getFieldDecorator('photo', {
                                        rules: [{
                                            required: true,
                                            message: '听书图片不能为空',
                                        }],
                                    })(
                                        <div className="itemBox">
                                            <Upload
                                                name="file"
                                                listType="picture-card"
                                                className="avatar-uploader"
                                                showUploadList={false}
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
                            </Col>
                        </Row>                       
                        
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem className="companyName listenBookSummary" label="简介：">
                                    {getFieldDecorator('summary', {
                                        rules: [
                                            {
                                                required: true,
                                                message: '简介不能为空',
                                            },
                                            {
                                                max: 300,
                                                message: "简介不能超过300个字",
                                            },
                                        ],
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写简介" rows={10}/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row> 
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">音频文件</h4>
                        <Row>
                            <Col span={10}>
                                <FormItem className="photoes photos">
                                    {getFieldDecorator('video', {
                                        rules: [{
                                            required: false,
                                            message: '音频不能为空',
                                        }],
                                    })(
                                        <div className="itemBox">                                          
                                            <Upload
                                                name="file"                                          
                                                // showUploadList={false}
                                                listType="picture-card"
                                                className="avatar-uploader"
                                                accept="audio/*"
                                                beforeUpload={beforeUpload02}
                                                customRequest={picHandleChange02}
                                            >
                                                <div>
                                                    <Icon type={'plus'}/>
                                                    <div className="ant-upload-text">选择文件</div>
                                                </div>
                                            </Upload>
                                        </div>
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

//添加听书组件
class ItemAdd extends Component {
    state = {
        visible: false,
        // 总听书类型表
        allTypeList: [],
        // 听书类型表
        typeList: [],
        // 听书图片相关变量
        // 上传Token
        uploadToken: '',
        // 初始图片
        viewPic: "",
        // 有效图片：图片提交成功时写入，用以与提交时canvas生成的图片编码进行比对，已确定图片是否有改动
        effectPic: "",
        // 保存待提交的图片
        data_pic: "",
        data_pic22: "",
        // 图片缩放比例及偏移量变量
        avatarEditor: {
            scale: 1,
            positionX: 0.5,
            positionY: 0.5
        },
        // 图片提交按钮状态变量
        photoLoading: false,
        fileKey: 0,
        viewPic01: "",
        photoList01: [],
        photoList11: [],
        avatarEditor01: {
            scale: 1,
            positionX: 0.5,
            positionY: 0.5
        },        
        // 听书地址相关变量
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
        confirmLoading: false,        
        site: {},
    };
    fn_countDown = "";

    showModal = () => {
        this.getListenBooktypeList();
        this.setState({visible: true});
    };

    // 获取听书类型列表
    getListenBooktypeList = () => {
        reqwest({
            url: '/sys/listenBookType/list',
            type: 'json',
            method: 'get',
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
                    this.setState({
                        loading: false,
                        typeList: json.data.list,
                    });
                } else {
                    if (json.code === 902) {
                        message.error("请先登录");                        
                        this.toLoginPage();// 返回登陆页
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");
                        
                        this.toLoginPage();// 返回登陆页
                    } else {
                        message.error(json.message);
                        this.setState({loading: false});
                    }
                }
            }
        });
    };

    // 根据输入听书名字模糊查找听书列表
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
                } else {
                    if (json.code === 902) {
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

    // 听书图片处理-----------------------------------
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
                    this.setState({
                        uploadToken: json.data,
                    })
                } else {
                    if (json.code === 902) {
                        message.error("请先登录");                        
                        this.props.toLoginPage();// 返回登陆页
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");                        
                        this.props.toLoginPage();// 返回登陆页
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
    picUpload = (para01, para02) => {
        const _this = this;
        this.setState({
             photoLoading: true,
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
                    photoLoading: false,
                })
            }, 
            complete (res) {
                message.success("图片提交成功");
                console.log(22)
                _this.setState({
                    effectPic: para01,
                    data_pic: global.config.photoUrl + res.key,
                    data_pic22: res.key,
                    photoLoading: false,
                })
            }
        }
        const observable = qiniu.upload(file, key, token, config)
        observable.subscribe(observer) // 上传开始
    };

    // 音频文件上传
    picUpload02 = (para) => {
        const _this = this;
        if (this.state.photoList01.length >= 1) {
            message.error("音频最多上传1条");
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
                    message.error(err.message ? err.message : "音频提交失败");                    
                    _this.setState({
                        photoLoading: false,
                    })
                }, 
                complete (res) {
                    console.log(res);
                    message.success("音频提交成功");
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
                        site: {
                            ..._this.state.site,
                            enAudio: global.config.photoUrl + res.key,
                            enAudio_copy: res.key,
                        },
                        viewPic01: "",
                        photoLoading: false,
                    })
                    console.log(_this.state.site)
                }
            }
            const observable = qiniu.upload(file, key, token, config);
            observable.subscribe(observer); // 上传开始
        }        
    };

    onCanPlay = () => {      
        let duration = this.state.duration;        
        let enDuration = duration ? Math.round(duration.audioEl.duration) : null;
        this.setState({
            site: {
                ...this.state.site,
                enDuration: enDuration
            }
        })
    };

    // 将 duration 设为 00:00 的格式
    setDuration = (sec) => {
        let min = 0;
        sec = sec <= 10 ? '0' + sec : sec;
        if (sec >= 60) {
            min = (sec / 60).toFixed();
            sec = sec % 60 >= 10 ? sec % 60 : '0' + sec % 60;
        }
        min = min >= 10 ? min : '0' + min;
        let time = min + ':' + sec;
        return time;
    };
    // 音频时长为 this.state.site.enDuration

    // 听书地址处理-----------------------------------
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
                // 总听书类型表
                allTypeList: [],
                // 听书类型表
                typeList: [],
                // 听书图片相关变量
                // 上传Token
                uploadToken: '',
                // 初始图片
                viewPic: "",
                // 有效图片：图片提交成功时写入，用以与提交时canvas生成的图片编码进行比对，已确定图片是否有改动
                effectPic: "",
                // 保存待提交的图片
                data_pic: "",
                data_pic22: "",
                // 图片缩放比例及偏移量变量
                avatarEditor: {
                    scale: 1,
                    positionX: 0.5,
                    positionY: 0.5
                },
                // 图片提交按钮状态变量
                photoLoading: false,
                fileKey: 0,
                viewPic01: "",
                photoList01: [],
                photoList11: [],
                avatarEditor01: {
                    scale: 1,
                    positionX: 0.5,
                    positionY: 0.5
                },        
                // 听书地址相关变量
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
                confirmLoading: false,                
                site: {},
                logoLoading: false,
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
            // 展示城市校验
            // if (!values.photos) {
            //     message.error("听书图片未提交");
            //     return
            // }
            // 听书logo校验
            if (!this.state.data_pic) {
                message.error("听书图片未提交");
                return
            }
            if (this.state.data_pic) {
                values.photo = this.state.data_pic22;
            }                    

            // 如何获取上传音频的时长
            console.log(this.state.site)
            const result = {
                name: values.title,
                type: values.type[1] || values.type[0],
                source: values.source,            
                originalPrice: values.originalPrice,
                price: values.price,
                cityId: values.cityId[1] || values.cityId[0],                
                photo: values.photo,
                summary: values.summary,
                duration: this.state.site.enDuration,//音频时间
                linkAddress: this.state.site.enAudio_copy,//音频地址
            }
            this.setState({
                confirmLoading: true
            });           
            reqwest({
                url: '/sys/listenBook/save',
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
                        message.success("听书添加成功");
                        this.handleCancel();
                        this.props.recapture();
                    } else {
                        if (json.code === 902) {
                            message.error("请先登录");
                            this.props.toLoginPage();
                        } else if (json.code === 902) {
                            message.error("登录信息已过期，请重新登录");
                            this.props.toLoginPage();
                        } else {
                            message.error(json.message);
                            this.setState({
                                confirmLoading: false
                            });
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
                <Button type="primary" onClick={this.showModal}>添加听书</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    typeList={this.state.typeList}
                    handleSearch={this.handleSearch}
                    picUpload02={this.picUpload02}
                    photoLoading={this.state.photoLoading}                    
                    getUploadToken={this.getUploadToken}
                    reqwestUploadToken={this.reqwestUploadToken}
                    viewPic={this.state.viewPic}
                    effectPic={this.state.effectPic}
                    data_pic={this.state.data_pic}
                    setViewPic={this.setViewPic}
                    avatarEditor={this.state.avatarEditor}
                    setAvatarEditor={this.setAvatarEditor}
                    picUpload={this.picUpload}
                    logoLoading={this.state.logoLoading}                    
                    optionsOfType={this.props.optionsOfType}                    
                    optionsOfCity={this.props.optionsOfCity}
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
                <div>
                    {/*判断是否已有音频 url*/}
                    { this.state.site.enAudio ? (
                            <ReactAudioPlayer 
                                // ref={(element) => { this.state.duration.enDuration = element }}
                                ref={(element) => { this.setState({duration: element})}}
                                // ref={(element) => { this.state.duration = element }}
                                src={this.state.site.enAudio}
                                onCanPlay={this.onCanPlay}
                            />
                        ) : null
                    }
                </div>
            </div>
        );
    }
}

//听书信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, typeList, provinceList, reqwestUploadToken, viewPic, effectPic, data_pic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoLoading, picUpload02, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 听书类别选项生成
        const optionsOfTypeList = [];
        if (typeList) {
            typeList.forEach((item, index) => {
                optionsOfTypeList.push(<Option key={index + 1} value={item.listenBookType.id}>{item.listenBookType.name}</Option>);
            });
        }

        // 听书分类选项生成
        const optionsOfType = [{value: "", label: "全部分类"}];
        let currentType = [];
        typeList.forEach((item) => {
            let children = [];
            if (item.children.length) {
                item.children.forEach((subItem) => {
                    children.push({value: subItem.id, label: subItem.name});
                    // 数据类型的问题
                    if (Number(subItem.id) === data.typeId) {
                        // 当前城市设为选中项
                        currentType = [item.listenBookType.id, subItem.id];
                    }
                });
            }
            optionsOfType.push({value: item.listenBookType.id, label: item.listenBookType.name, children: children});
        });

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
                    }
                });
            }
            optionsOfCity.push({value: item.adcode, label: item.name, children: children});
        });

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
                reqwestUploadToken();
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
                // scale={avatarEditor.scale}
                position={{x: avatarEditor.positionX, y: avatarEditor.positionY}}
                rotate={0}
            />
        );

        // 听书音频选择之后相关操作
        const beforeUpload02 = (file) => {            
            // 文件大小校验
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('文件不能大于5M');
            }            
            reqwestUploadToken();            
            return isLt5M;
        };
        // 点击图片提交按钮的相关操作
        const picHandleChange02 = (info) => {
            picUpload02(info.file);
        };

        return (
            <Modal
                visible={visible}
                title="听书编辑"
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
                        <div className="institution-add institution-form item-form">
                            <Form layout="vertical">
                                <h4 className="add-form-title-h4">基础信息</h4>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="companyName" label="听书标题：">
                                            {getFieldDecorator('title', {
                                                initialValue: data.name,
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '听书标题不能为空',
                                                    },
                                                    {
                                                        min: 6,
                                                        message: "听书标题至少6个字",
                                                    },
                                                    {
                                                        max: 42,
                                                        message: "听书标题不能超过42个字符",
                                                    },
                                                ],
                                            })(
                                                <Input placeholder="请填写听书标题(6-42字)"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="advPosition" label="听书分类：">
                                            {getFieldDecorator('type', {                                                
                                                initialValue: data.typeId === 0 ? [""] : currentType,
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '听书分类不能为空',
                                                    }
                                                ],
                                            })(
                                                <Cascader options={optionsOfType} placeholder="请选择类型"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="companyName" label="听书来源：">
                                            {getFieldDecorator('source', {
                                                initialValue: data.source,
                                                rules: [
                                                    {
                                                        required: false,
                                                        message: '听书标题不能为空',
                                                    },
                                                    {
                                                        max: 10,
                                                        message: "听书标题不能超过10个字",
                                                    },
                                                ],
                                            })(
                                                <Input placeholder="请填写听书来源(不超过10个字)"/>
                                            )}
                                        </FormItem>
                                    </Col> 
                                </Row>
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="originalPrice" label="原价（￥）：">
                                            {getFieldDecorator('originalPrice', {
                                                initialValue: data.originalPrice,
                                                rules: [{
                                                    required: true,
                                                    message: '原价不能为空',
                                                }],
                                            })(
                                                <InputNumber min={0} precision={2} step={100} style={{width: "100%"}} placeholder="请输入价格，支持两位小数"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="price"  label="现价（￥）：">
                                            {getFieldDecorator('price', {
                                                initialValue: data.price,
                                                rules: [{
                                                    required: true,
                                                    message: '现价不能为空',
                                                }],
                                            })(
                                                <InputNumber min={0} precision={2} step={100} style={{width: "100%"}} placeholder="请输入价格，支持两位小数"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="area" label="展示城市：">
                                            {getFieldDecorator('cityId', {
                                                initialValue: data.cityId === 0 ? ["0"] : currentCity,
                                                rules: [{
                                                    required: true,
                                                    message: '所属城市不能为空'
                                                }],
                                            })(                                                
                                                <Cascader options={optionsOfCity} placeholder="请选择所属城市"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <Row>
                                    <Col span={10}>
                                        <FormItem className="photo" label="听书图片：">
                                            {getFieldDecorator('photo', {
                                                initialValue: viewPic,
                                                rules: [{
                                                    required: true,
                                                    message: '听书图片不能为空',
                                                }],
                                            })(
                                                <div className="itemBox">
                                                    <Upload
                                                        name="file"
                                                        listType="picture-card"
                                                        className="avatar-uploader"
                                                        showUploadList={false}
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
                                    </Col>
                                </Row>                       
                                
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <FormItem className="companyName listenBookSummary" label="简介：">
                                            {getFieldDecorator('summary', {
                                                initialValue: data.summary,
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '简介不能为空',
                                                    },
                                                    {
                                                        max: 300,
                                                        message: "简介不能超过300个字",
                                                    },
                                                ],
                                            })(
                                                <TextArea style={{resize: "none"}} placeholder="请填写简介" rows={10}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row> 
                                <div className="ant-line"></div>
                                <h4 className="add-form-title-h4">音频文件</h4>
                                <Row>
                                    <Col span={10}>
                                        <FormItem className="photoes photos">
                                            {getFieldDecorator('video', {
                                                initialValue: data.linkAddress,
                                                rules: [{
                                                    required: false,
                                                    message: '音频不能为空',
                                                }],
                                            })(
                                                <div className="itemBox">                                          
                                                    <Upload
                                                        name="file"                                          
                                                        // showUploadList={false}
                                                        listType="picture-card"
                                                        className="avatar-uploader"
                                                        accept="audio/*"
                                                        // fileList={photoList01}
                                                        beforeUpload={beforeUpload02}
                                                        customRequest={picHandleChange02}
                                                        // onChange={handleAudioChange}
                                                    >
                                                        <div>
                                                            <Icon type={'plus'}/>
                                                            <div className="ant-upload-text">选择文件</div>
                                                        </div>
                                                    </Upload>
                                                </div>
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

//听书编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,
        // 听书基本信息
        data: {},
        // 听书类型表
        typeList: [],
        // 听书图片相关变量
        uploadToken: "",
        photoLoading: false,
        // 听书LOGO相关变量
        viewPic: "",
        data_pic: "",
        data_pic_copy: "",
        effectPic: "",
        avatarEditor: {
            scale: 1,
            positionX: 0.5,
            positionY: 0.5
        },
        logoLoading: false,
        // 听书地址相关变量
        provinceList: [],
        cityList: [],
        districtList: [],
        streetList: [],
        markers: [],
        area: {
            province: "",
            city: "",
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
        photoList01: [],
        photoList11: [],
        site: {},
    };

    // 获取听书类型列表
    getListenBooktypeList = () => {
        reqwest({
            url: '/sys/listenBookType/list',
            type: 'json',
            method: 'get',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({loading: false});
            },
            success: (json) => {
                if (json.result === 0) {                    
                    this.setState({
                        loading: false,
                        typeList: json.data.list,
                    });
                } else {
                    if (json.code === 902) {
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

    onChange = (value) => {
        console.log('onChange ', value);
        this.setState({ 
            tempTypeIds: value
        });
    };

    // 获取听书基本信息
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
                    const data = [];
                    json.data.orgTypeList.forEach((item, index) => {                        
                        data.push(item.parentTypeId + ',' + item.typeId);                       
                    });
                    console.log(data)
                    json.data.org.typeIds = data;                    
                    this.setState({
                        data: json.data.org,                       
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
                        // 听书地址相关操作
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
                    if (json.code === 902) {
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
        })
    };

    showModal = () => {
        // 获取听书基本信息       
        // this.getData();
        // 获取听书类型列表
        this.getListenBooktypeList();       
        this.setState({
            visible: true,
            data: this.props.record,
            viewPic: this.props.record.photo,
            data_pic: this.props.record.photo,
            // 记得城市id数据类型转换
            viewVideo: this.props.record.linkAddress,
        });       
    };

    // 听书图片处理-----------------------------------
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
                    this.setState({
                        uploadToken: json.data,
                    })
                } else {
                    if (json.code === 902) {
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
    picUpload = (para01, para02) => {
        const _this = this;
        this.setState({
             photoLoading: true,
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
                    photoLoading: false,
                })
            }, 
            complete (res) {
                message.success("图片提交成功");
                console.log(22)
                _this.setState({
                    effectPic: para01,
                    data_pic: global.config.photoUrl + res.key,
                    data_pic22: res.key,
                    photoLoading: false,
                })
            }
        }
        const observable = qiniu.upload(file, key, token, config)
        observable.subscribe(observer) // 上传开始
    };

    // 音频文件上传
    picUpload02 = (para) => {
        const _this = this;
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
                message.error(err.message ? err.message : "音频提交失败");                    
                _this.setState({
                    photoLoading: false,
                })
            }, 
            complete (res) {
                console.log(res);
                message.success("音频提交成功");
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
                    site: {
                        ..._this.state.site,
                        enAudio: global.config.photoUrl + res.key,
                        enAudio_copy: res.key,
                    },
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
    };

    // 音频播放
    onCanPlay = () => {
        let duration = this.state.duration;
        // duration.enDuration.audioEl.duration 返回的是一个带小数的数字，因此用 Math.round 做了下处
        let enDuration = duration ? Math.round(duration.audioEl.duration) : null;
        // enDuration = enDuration ? this.setDuration(enDuration) : null;
        this.setState({
            site: {
                // 这个不能删
                ...this.state.site,
                enDuration: enDuration
            }
        })
    };

    // 将 duration 设为 00:00 的格式
    setDuration = (sec) => {
        let min = 0;
        sec = sec <= 10 ? '0' + sec : sec;
        if (sec >= 60) {
            min = (sec / 60).toFixed();
            sec = sec % 60 >= 10 ? sec % 60 : '0' + sec % 60;
        }
        min = min >= 10 ? min : '0' + min;
        let time = min + ':' + sec;
        return time;
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
                photoLoading: false,
                viewPic: "",
                data_pic: "",
                data_pic_copy: "",
                effectPic: "",
                avatarEditor: {
                    scale: 1,
                    positionX: 0.5,
                    positionY: 0.5
                },
                logoLoading: false,
                photoList01: [],
                photoList11: [],
                site: {},
                provinceList: [],
                cityList: [],
                mapObj: {},
                formattedAddress: "",
                xy: {},
                provinceId: null,
                cityId: null,
                areaId: null,
                addressLoading: true,
                confirmLoading: false
            });
            form.resetFields();
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
            // 听书图片写入与校验
            if (!this.state.data_pic) {
                message.error("听书图片未提交");
                return
            }
            if (this.state.data_pic) {
                let pathTemp = this.state.data_pic.slice(global.config.photoUrl.length);
                values.photo = pathTemp;
            }
            const result = {
                id: this.props.id,
                name: values.title,
                type: values.type[1] || values.type[0],
                author: values.author,
                originalPrice: values.originalPrice,
                price: values.price,
                provinceId: values.cityId[0],                
                cityId: values.cityId[1] || values.cityId[0],
                photo: values.photo,
                summary: values.summary,                  
                duration: this.state.site.enDuration || this.props.record.duration_copy,
                linkAddress: this.state.site.enAudio_copy || this.state.viewVideo.slice(25),//音频地址
            }
            if (!result) {
                message.error("暂无信息更改");
                return;
            }
            // 修改项提交，状态变为待审核
            // result.status = 1;
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/sys/listenBook/update',
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
                        message.success("听书信息修改成功");
                        this.handleCancel();
                        this.props.recapture();
                    } else {
                        if (json.code === 902) {
                            message.error("请先登录");                            
                            this.props.toLoginPage();// 返回登陆页
                        } else if (json.code === 902) {
                            message.error("登录信息已过期，请重新登录");                            
                            this.props.toLoginPage();// 返回登陆页
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
                    onChange={this.onChange}
                    id={this.props.id}
                    data={this.state.data}
                    handleSearch={this.handleSearch}
                    handleChange={this.handleChange}
                    reqwestUploadToken={this.reqwestUploadToken}
                    viewPic={this.state.viewPic}
                    effectPic={this.state.effectPic}
                    data_pic={this.state.data_pic}
                    setViewPic={this.setViewPic}
                    avatarEditor={this.state.avatarEditor}
                    setAvatarEditor={this.setAvatarEditor}
                    picUpload={this.picUpload}
                    picUpload02={this.picUpload02}                   
                    photoLoading={this.state.photoLoading}
                    logoLoading={this.state.logoLoading}
                    optionsOfType={this.props.optionsOfType}
                    typeList={this.props.typeList}
                    optionsOfCity={this.props.optionsOfCity}
                    provinceList={this.props.provinceList}
                    confirmLoading={this.state.confirmLoading}
                />
                <div style={{display: "none"}}>
                    {/*判断是否已有音频 url*/}
                    {
                        this.state.site.enAudio ? (
                            <ReactAudioPlayer
                                // ref={(element) => { this.setState({duration: element})}}
                                // ref={(element) => { this.state.duration = element}}
                                ref={(element) => { 
                                    this.setState({
                                        duration: element
                                    })
                                }}
                                src={this.state.site.enAudio}
                                onCanPlay={this.onCanPlay}
                            />
                        ) : null
                    }
                </div>
            </a>
        );
    }
}

//听书信息详情组件
class ItemDetail extends Component {
    state = {
        visible: false,
        data: {}
    };
    
    // 去除富文本的标签只获得文本内容
    removeTAG = (str, len) => {
        return str.replace(/<[^>]+>/g, "");
    };

    showModal = () => {
        console.log(this.props.record);
        this.setState({
            visible: true,
            data: this.props.record,
            // riches: this.removeTAG(this.props.record.riches)
        },)
    };

    handleCancel = () => {
        this.setState({visible: false});
    };

    render() {
        let dataSource;
        if (this.state.data) {
            dataSource = [
                <div className="name">
                    <span className="item-name">标题：</span>
                    <span className="item-content">{this.state.data.name}</span>
                </div>,
                
                <div className="typeName">
                        <span className="item-name">听书类型：</span>
                        <span className="item-content">{this.state.data.typeName || "暂无"}</span>
                </div>,
                <div className="managerName">
                    <span className="item-name">展示城市：</span>
                    <span className="item-content">{this.state.data.cityName}</span>
                </div>,
                <div className="sort">
                    <span className="item-name">浏览量：</span>
                    <span className="item-content">{this.state.data.commentTotal || "暂无"}</span>
                </div>,
                <div className="managerPhone">
                    <span className="item-name">来源：</span>
                    <span className="item-content">{this.state.data.author || "暂无"}</span>
                </div>,                
                <div className="logo">
                    <span className="item-name">照片：</span>
                    {this.state.data.photo ? <img src={this.state.data.photo} alt=""
                                                 className="item-content"/> : "暂无"}
                </div>,
                <div className="label">
                    <span className="item-name">跳转链接：</span>
                    <span className="item-content">{this.state.data.linkAddress || "暂无"}</span>
                </div>,
                
                <div className="description">
                    <span className="item-name">听书概述：</span>
                    <pre>
                        <span className="item-content">{this.state.data.summary}</span>
                    </pre>
                </div>,

                 <div className="description">
                    <span className="item-name">状态：</span>
                    <pre>
                        <span className="item-content">{this.state.data.status}</span>
                    </pre>
                </div>,
                <div className="telephone">
                   {/* <span className="item-name">听书详情：</span>*/}
                    {/*<div stye={{height: "200px", overflow: "scroll"}} className="item-content">{this.state.riches}</div>*/}
                </div>                
            ];
        } else {
            dataSource = ""
        }
        return (
            <a style={{display: this.props.opStatus ? "inline": "none"}}>
                <span onClick={this.showModal}>详情</span>
                <Modal
                    title={"听书详情"}
                    visible={this.state.visible}
                    width={750}
                    bodyStyle={{padding: "0", overflow: "auto"}}
                    footer={null}
                    onCancel={this.handleCancel}
                >
                    <div className="institution-details item-details newsOne-show">
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

//听书列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            // 听书类型表
            typeList: [],
            // 当前听书类型
            type: null,
            // 当前听书状态
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
                width: 70,
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '排序',
                dataIndex: 'sort',
                width: 130,
                editable: true,
            },
            {
                title: '标题',
                dataIndex: 'name',
                width: '10%',
                className: 'operating',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '图片',
                dataIndex: 'photo',
                width: '5%',
                render: (text, record) => (
                    <div className="hove-photo-scale">
                        <img style={{width: '45px', height: "25px"}} alt="" src={record["photo"]}/>
                    </div>
                )
            },
            {
                title: '类型',
                dataIndex: 'typeName',
                width: '7%',
                render: (text, record) => this.renderColumns(text, record, 'typeName'),
            },            
            {
                title: '展示城市',
                dataIndex: 'cityName',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'cityName'),
            },
            {
                title: '时长',
                dataIndex: 'duration',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'duration'),
            },
            {
                title: '浏览量',
                dataIndex: 'commentTotal',
                width: '5%',
                render: (text, record) => this.renderColumns(text, record, 'commentTotal'),
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
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },            
            {
                title: '操作',
                dataIndex: '操作',
                width: 200,
                className: 'operating',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*听书详情*/}
                            <ItemDetail 
                                id={record.id}
                                record={record}
                                educationKey={record.educationKey}
                                toLoginPage={this.props.toLoginPage} 
                                opStatus={this.props.opObj.select}/>
                            {/*听书编辑*/}               
                            <ItemEdit 
                                id={record.id}
                                record={record}
                                optionsOfType={this.props.optionsOfType} 
                                typeList={this.props.typeList}
                                optionsOfCity={this.props.optionsOfCity}
                                provinceList={this.props.provinceList}
                                educationKey={record.educationKey} 
                                recapture={this.getData}
                                toLoginPage={this.props.toLoginPage} 
                                opStatus={this.props.opObj.modify}/>                            
                            {/*听书删除*/}
                            <Popconfirm 
                                title="确认删除?"
                                placement="topRight"
                                onConfirm={() => this.itemDelete(record.id)}
                                onCancel=""
                                okType="danger"
                                okText="立即删除"
                                cancelText="取消">
                                <a style={{display: this.props.opObj.delete ? "inline" : "none"}}>删除</a>
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

    //获取本页信息
    getData = (keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/listenBook/list',
            type: 'json',
            method: 'get',
            data: {
                // 听书类型
                type: keyword ? keyword.type : this.props.keyword.type,
                // 听书名称
                name: keyword ? keyword.educationName : this.props.keyword.educationName,
                // 城市
                cityId: keyword ? keyword.cityCode : this.props.keyword.cityCode,
                beginDate: keyword ? keyword.startTime : this.props.keyword.startTime,
                endDate: keyword ? keyword.endTime : this.props.keyword.endTime,
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({loading: false});
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
                        let tempStatus = "";
                        if (item.state === 1) {
                            tempStatus = "删除"
                        }
                        if (item.state === 2) {
                            tempStatus = "正常"
                        }                        
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            sort: item.sort !== 0 ? item.sort : "",
                            name: item.name || "暂无",
                            photo: item.photo || "暂无",
                            createUser: item.createUser || "暂无",
                            cityName: item.cityName || "暂无", 
                            cityId: item.cityId,               
                            typeName: item.typeName || "暂无",
                            typeId: item.typeId,
                            commentTotal: item.playbackNum,
                            summary: item.summary,
                            linkAddress: item.linkAddress,
                            duration_copy: item.duration,
                            duration: ((item.duration/60).toFixed() < 10 ? '0' : '') + (item.duration/60).toFixed() + "'" + item.duration%60 + '"',
                            tempDuration: item.duration,
                            riches: item.riches,
                            createTime: item.createTime,
                            playbackNum: item.playbackNum,
                            originalPrice: item.originalPrice,
                            price: item.price,
                            source: item.source,
                            stateCode: item.state,
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
                    if (json.code === 902) {
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

    //听书删除
    itemDelete = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/listenBook/delete?id=' + id,
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
                    message.success("听书删除成功");
                    this.getData(this.props.keyword);
                } else {
                    if (json.code === 902) {
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
            url: '/sys/listenBook/updateSort',
            type: 'json',
            method: 'post',
            data: {
                // 听书Id
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
                    if (json.code === 902) {
                        message.error("请先登录");                        
                        this.props.toLoginPage();// 返回登陆页
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");                        
                        this.props.toLoginPage();// 返回登陆页
                    } else {
                        message.error(json.message);
                        this.setState({loading: false})
                    }
                }
            }
        });  
    };

    componentWillMount() {
        this.getData();        
    }

    componentWillReceiveProps(nextProps) {        
        if (nextProps.keyword !== this.props.keyword) {
            this.getData(nextProps.keyword);
        }
        if (nextProps.deleteFlag === null && this.props.deleteFlag) {
            this.getData();
        }
        if (nextProps.addFlag !== this.props.addFlag) {
            this.getData();
        }
        if (nextProps.editFlag !== this.props.editFlag) {
            this.getData();
        }
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
                    style={{display: this.props.addFlag ? "none" : "block"}}
                    components={components}
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    columns={columns}
                    scroll={{ x: 1600 }}
                    onChange={this.handleTableChange}/>;
    }
}

class ListeningBookManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            type: 1,
            // 获取听书列表所需关键词
            keyword: {
                cityCode: "",
                educationName: "",
                // 初始化开始日期和结束日期
                startTime: null,
                endTime: null,
            },
            flag_add: false,
            treeData: [],
            typeList: [],
            // 听书新增相关状态变量
            addStatus: false,
            addFlag: false,
            // 听书编辑相关状态变量
            editStatus: false,
            editFlag: false,
            editId: "",
            record: [],           
            // 地图控件对象
            mapObj: {},
            // 省市列表
            provinceList: [],
            // 当前城市的地区代码
            cityCode: "",
            // 日期禁选控制
            startValue: null,
            endValue: null,
        };        
        this.optionsOfCity = [{value: "0", label: "全国"}];
        // 听书类型内容列表
        this.optionsOfType = [{value: "", label: "全部分类"}];       
    }

    getData = () => {
        this.refs.getDataCopy.getData();
    };

    // 获取听书类型列表
    typeList = () => {
        reqwest({
            url: '/sys/listenBookType/list',
            type: 'json',
            method: 'get',
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
                    console.log(json.data.list)
                    json.data.list.forEach((item, index) => {
                        let children = [];
                        if (item.children) {
                            item.children.forEach((subItem) => {
                                children.push({value: subItem.id, label: subItem.name});
                            });
                        }
                    });
                    this.setState({
                        loading: false,
                        typeList: json.data.list,
                    }, () => {
                        this.typeList02();
                    });
                } else {
                    if (json.code === 902) {
                        message.error("请先登录");                        
                        this.toLoginPage();// 返回登陆页
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");                        
                        this.toLoginPage();// 返回登陆页
                    } else {
                        message.error(json.message);
                        this.setState({loading: false});
                    }
                }
            }
        });
    };

    typeList02 = () => {
        // 类型选项生成
        this.state.typeList.forEach((item) => {
            let children = [];
            if (item.children) {
                item.children.forEach((subItem) => {
                    children.push({value: subItem.id, label: subItem.name});
                });
            }
            this.optionsOfType.push({value: item.listenBookType.id, label: item.listenBookType.name, children: children});
        });
    };

    //类型选择设置
    setType = (value) => {
        console.log("selected:", value);
        this.setState({
            keyword: {
                type: value[1] || value[0],
            }
        })
    };

    //城市选择设置
    setCity = (value) => {
        console.log("selected:", value);
        this.setState({
            keyword: {
                cityCode: value[1],
            }
        })
    };

    // 获取当前登录人对此菜单的操作权限
    // 多了一级循环
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
        });        
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

    // 成长新增相关状态变量设置
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

    // 成长编辑相关状态变量设置
    setEdit = (type, para, id, record) => {
        if (type === "status") {
            this.setState({
                editStatus: para,
                editId: id,
                record: record,
            })
        }
        if (type === "flag") {
            this.setState({
                editFlag: !this.state.editFlag
            })
        }
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
                    }, () => {
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

    setFlag = () => {
        this.setState({
            flag_add: !this.state.flag_add,
            addFlag: !this.state.addFlag,
        })
    };

    // 登陆信息过期或不存在时的返回登陆页操作
    toLoginPage = () => {
        sessionStorage.clear();
        this.props.history.push('/')
    };

    componentWillMount() {
        this.typeList();
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
        return (
            <div className="institutions">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                {/*类型筛选*/}                               
                                <Cascader options={this.optionsOfType} onChange={this.setType} style={{width: "150px", float: "left", marginRight: "20px"}} placeholder="请选择类型"/>
                                {/*城市筛选*/}
                                <Cascader options={this.optionsOfCity} onChange={this.setCity} style={{width: "150px", float: "left", marginRight: "20px"}} placeholder="请选择所属城市"/>
                                {/*听书名称筛选*/}
                                <Search
                                    placeholder="请输入描述信息"
                                    onSearch={this.setName}
                                    enterButton
                                    style={{width: "240px", float: "left", marginRight: "20px"}}/>
                                {/*听书创建日期筛选*/}
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
                                {/*听书添加*/}
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd
                                        opStatus={this.state.opObj.add}
                                        optionsOfType={this.optionsOfType} 
                                        optionsOfCity={this.optionsOfCity}
                                        recapture={this.getData}
                                        toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            {/*听书列表*/}
                            <div className="table-box">
                                <DataTable 
                                    ref="getDataCopy"
                                    opObj={this.state.opObj}
                                    optionsOfType={this.optionsOfType} 
                                    typeList={this.state.typeList}
                                    optionsOfCity={this.optionsOfCity}
                                    provinceList={this.state.provinceList}
                                    keyword={this.state.keyword}
                                    addFlag={this.state.addFlag}
                                    setEdit={this.setEdit}
                                    editFlag={this.state.editFlag}
                                    toLoginPage={this.toLoginPage}/>
                            </div>                            
                            {/*地图组件容器*/}
                            <div id="information-mapContainer"/>                              
                        </div>
                        :
                        <p>暂无查询权限</p>
                }
            </div>  
        )
    }
}

export default ListeningBookManage;