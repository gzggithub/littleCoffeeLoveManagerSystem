import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Form,
    message,
    DatePicker,
    Icon,
    Upload,
    Modal,
    Select,
    Slider,
    Row,
    Col,
    InputNumber,
    Popconfirm,
    Cascader,
    List,
} from 'antd';
import reqwest from 'reqwest';
import AvatarEditor from 'react-avatar-editor'
import '../../config/config';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';

const Search = Input.Search;
const FormItem = Form.Item;
const {Option} = Select;
const {TextArea} = Input;
const confirm = Modal.confirm;

//栅格设置
const formItemLayout_8 = {
    labelCol: {span: 4},
    wrapperCol: {span: 8}
};
const formItemLayout_10 = {
    labelCol: {span: 4},
    wrapperCol: {span: 10}
};
const formItemLayout_12 = {
    labelCol: {span: 4},
    wrapperCol: {span: 12}
};
const formItemLayout_14 = {
    labelCol: {span: 4},
    wrapperCol: {span: 14}
};
const formItemLayout_16 = {
    labelCol: {span: 4},
    wrapperCol: {span: 16}
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

// 可编辑的单元格
// const EditableContext = React.createContext();

// const EditableRow = ({ form, index, ...props }) => (
//   <EditableContext.Provider value={form}>
//     <tr {...props} />
//   </EditableContext.Provider>
// );

// const EditableFormRow = Form.create()(EditableRow);

// class EditableCell extends Component {
//     state = {
//         editing: false,
//     }

//     toggleEdit = (valuess) => {
//         console.log(valuess);
//         const editing = !this.state.editing;
//         this.setState({ editing }, () => {
//             if (editing) {
//                 this.input.focus();
//             }
//         });
//     }

//     sort = (props1, e) => {
//         const { record, handleSort } = this.props;
//         this.form.validateFields((error, values) => {
//             if (error && error[e.currentTarget.id]) {
//                 return;
//             }
//             this.toggleEdit();
//             // 判断排序值是否改变，不变就不用排序，只有改变才请求sort接口
//             if (props1 !== Number(values.sort)) {
//                 handleSort({ ...record, ...values });
//             } 
//         });
//     }

//     render() {
//         const { editing } = this.state;
//         const { editable, dataIndex, title, record, index, handleSort, ...restProps } = this.props;
//         return (
//         <td {...restProps}>
//             {editable ? (
//             <EditableContext.Consumer>
//                 {(form) => {
//                     this.form = form;
//                     return (
//                         editing ? (
//                         <FormItem style={{ margin: 0 }}>
//                             {form.getFieldDecorator(dataIndex, {
//                                 rules: [{
//                                     required: false,                                   
//                                     message: "只能输入数字",                                    
//                                 }],                               
//                                 initialValue: record[dataIndex],
//                                 })(
//                                 <Input style={{textAlign: "center"}}
//                                     // allowClear
//                                     ref={node => (this.input = node)}
//                                     onPressEnter={this.sort.bind(this, record[dataIndex])}
//                                     onBlur={this.sort.bind(this, record[dataIndex])}
//                                     placeholder="双击设置排序"
//                                 />
//                             )}
//                         </FormItem>
//                         ) : (
//                         <div
//                             className="editable-cell-value-wrap "
//                             onClick={this.toggleEdit}
//                         >
//                             <Input style={{textAlign: "center"}}
//                                 // allowClear
//                                 ref= {node => (this.input = node)}
//                                 value={record[dataIndex]}
//                                 placeholder="双击设置排序"
//                             />
//                         </div>
//                         )
//                     );
//                 }}
//             </EditableContext.Consumer>
//             ) : restProps.children}
//         </td>
//         );
//     }
// }

//新增资讯表单
const ItemAddForm = Form.create()(
    (props) => {
        const {form, channels, reqwestUploadToken, viewPic, effectPic, data_pic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoLoading, provinceList, cityCode} = props;
        const {getFieldDecorator} = form;

        //频道选项生成
        const optionsOfChannel = [];
        channels.forEach((item) => {
            optionsOfChannel.push({value: item.id, label: item.name});
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
                scale={avatarEditor.scale}
                position={{x: avatarEditor.positionX, y: avatarEditor.positionY}}
                rotate={0}
            />
        );

        // 城市选项生成
        const optionsOfCity = [{value: "0", label: "全国"}];
        let currentCity = [];
        provinceList.forEach((item) => {
            let children = [];
            if (item.districtList) {
                item.districtList.forEach((subItem) => {
                    children.push({value: subItem.adcode, label: subItem.name});
                    if (subItem.adcode === cityCode) {
                        // 当前城市设为选中项
                        currentCity = [item.adcode, subItem.adcode]
                    }
                });
            }
            optionsOfCity.push({value: item.adcode, label: item.name, children: children});
        });

        return (
            <Form>
                <FormItem className="title" {...formItemLayout_14} label="资讯标题：">
                    {getFieldDecorator('title', {
                        rules: [{
                            required: true,
                            max: 42,
                            message: '请按要求填写资讯标题',
                        }],
                    })(
                        <Input placeholder="请输入资讯标题（6-42字）"/>
                    )}
                </FormItem>
                <FormItem className="typeIds" {...formItemLayout_8} label="资讯分类：">
                    {getFieldDecorator('typeIds', {
                        rules: [{
                            required: true,
                            message: '分类不能为空',
                        }],
                    })(
                        <Cascader options={optionsOfChannel} placeholder="请选择资讯分类"/>
                    )}
                </FormItem>
                <FormItem className="author" {...formItemLayout_8} label="资讯来源：">
                    {getFieldDecorator('author', {
                        rules: [{
                            required: true,
                            max: 10,
                            message: '请按要求填写资讯来源',
                        }],
                    })(
                        <Input placeholder="请填写资讯来源（不超过10个字）"/>
                    )}
                </FormItem>
                <FormItem
                    className={Number(sessionStorage.EId) ? "views unnecessary hide" : "views unnecessary"}
                    {...formItemLayout_8}
                    label="阅读量：">
                    {getFieldDecorator('views', {
                        rules: [{
                            required: false
                        }],
                    })(
                        <InputNumber min={0} precision={0} step={1}/>
                    )}
                </FormItem>
                <FormItem className="cityId" {...formItemLayout_8} label="所属城市：">
                    {getFieldDecorator('cityId', {
                        initialValue: currentCity,
                        rules: [{
                            required: true,
                            message: '所属城市不能为空',
                        }],
                    })(
                        <Cascader options={optionsOfCity} placeholder="请选择所属城市"/>
                    )}
                </FormItem>
                <FormItem className="keyword" {...formItemLayout_10} label="关键字：">
                    {getFieldDecorator('keyword', {
                        rules: [{
                            required: false,
                            message: '关键字不能为空'
                        }]
                    })(
                        <Input placeholder="多个关键字“，”隔开"/>
                    )}
                </FormItem>
                <FormItem className="photo" {...formItemLayout_12} label="图片：">
                    {getFieldDecorator('photo', {
                        rules: [{
                            required: true,
                            message: '资讯图片不能为空',
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
                <FormItem className="summary" {...formItemLayout_16} label="资讯概述：">
                    {getFieldDecorator('summary', {
                        rules: [{
                            required: true,
                            message: '资讯概述不能为空'
                        }]
                    })(
                        <TextArea style={{resize: "none"}} placeholder="请填写资讯概述" rows={10}/>
                    )}
                </FormItem>
            </Form>
        )
    }
);

//新增资讯组件
class ItemAdd extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 图片相关变量--------------------------------------
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
            // 确认按钮状态变量
            confirmLoading: false
        };
        this.editor = ""
    }

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

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
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
                confirmLoading: false
            }, () => {
                // 表单内容清空
                form.resetFields();
                this.props.setAdd("status", false)
            })
        };
        const data = form.getFieldsValue();
        let flag = false;
        for (let x in data) {
            if (x === "cityId") {
                data.cityId = data.cityId[1] || data.cityId[0];
                if (data.cityId !== this.props.cityCode) {
                    flag = true
                }
            } else {
                if (data[x]) {
                    flag = true
                }
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
            if (this.state.data_pic) {
                values.photo = this.state.data_pic22
            }
            values.parentId = values.typeIds[0];
            // values.typeId = values.typeIds[1];
            console.log(values.parentId);

            // values.photo = this.state.data_pic;
            values.cityId = values.cityId[1] || values.cityId[0];
            values.riches = this.editor.getData();
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/sys/news/save',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    title: values.title,
                    // parentId: values.parentId,
                    // typeId: values.typeId,
                    typeId: values.parentId,
                    author: values.author,
                    views: values.views,
                    photo: values.photo,
                    cityId: values.cityId,
                    keyword: values.keyword,
                    summary: values.summary,
                    riches: values.riches
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        form.resetFields();
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
                            confirmLoading: false
                        });
                        message.success("资讯添加成功");
                        this.editor.setData("");
                        this.props.setAdd("status", false);
                        this.props.setAdd("flag")
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
            })
        })
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    componentDidMount() {
        this.editor = window.CKEDITOR.replace('TextArea3');
    }

    render() {
        return (
            <div className="add-information" style={{minHeight: 725, display: this.props.status === 5 ? "block" : "none"}}>
                <header>
                    <Button onClick={this.handleCancel} disabled={this.state.confirmLoading}><Icon type="left"/>返回</Button>
                    <Button 
                        type="primary" 
                        onClick={this.handleCreate} 
                        style={{float: "right"}}
                        loading={this.state.confirmLoading}>提交</Button>
                </header>
                <div className="content">
                    <div className="item item-left information-form information-add">
                        <ItemAddForm
                            ref={this.saveFormRef}
                            channels={this.props.channels}
                            reqwestUploadToken={this.reqwestUploadToken}
                            viewPic={this.state.viewPic}
                            effectPic={this.state.effectPic}
                            data_pic={this.state.data_pic}
                            setViewPic={this.setViewPic}
                            avatarEditor={this.state.avatarEditor}
                            setAvatarEditor={this.setAvatarEditor}
                            picUpload={this.picUpload}
                            photoLoading={this.state.photoLoading}
                            provinceList={this.props.provinceList}
                            cityCode={this.props.cityCode}
                        />
                    </div>
                    <div className="item item-right">
                        <textarea id="TextArea3" cols="20" rows="2" className="ckeditor"/>
                    </div>
                </div>
            </div>
        )
    }
}

//资讯效果组件
class ItemShow extends Component {
    state = {
        visible: false,
        data: {}
    };

    showModal = () => {
        this.setState({
            visible: true,
        })
    };

    handleCancel = () => {
        this.setState({visible: false});
    };

    render() {
        return (
            <a style={{display: "none"}}>
                <span onClick={this.showModal}>演示</span>
                <Modal
                    title={"资讯演示"}
                    visible={this.state.visible}
                    width={395}
                    bodyStyle={{padding: "0", overflow: "visible"}}
                    footer={null}
                    onCancel={this.handleCancel}
                >
                    <div className="newsOne-show">
                        <iframe
                            title="资讯详情"
                            src={"https://news.taoerxue.cn/newsDetails.html?id=" + this.props.id + "&random=" + Math.random()}
                            scrolling="auto"
                            frameBorder="0"/>
                    </div>
                </Modal>
            </a>
        );
    }
}

//资讯编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {form, data, cityCode, channels, reqwestUploadToken, viewPic, effectPic, data_pic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoLoading, provinceList} = props;
        const {getFieldDecorator} = form;

        //频道选择
        const optionsOfChannel = [];
        channels.forEach((item) => {
            optionsOfChannel.push({value: item.id, label: item.name});
        });

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
                reqwestUploadToken();
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
                width={295}
                height={165}
                border={0}
                color={[255, 255, 255, 0.6]}
                scale={avatarEditor.scale}
                position={{x: avatarEditor.positionX, y: avatarEditor.positionY}}
                rotate={0}
            />
        );

        // 城市选项生成
        const optionsOfCity = [{value: "0", label: "全国"}];
        let currentCity = [];
        provinceList.forEach((item) => {
            let children = [];
            if (item.districtList) {
                item.districtList.forEach((subItem) => {
                    children.push({value: subItem.adcode, label: subItem.name});
                    if (subItem.adcode === cityCode) {
                        // 当前城市设为选中项
                        currentCity = [item.adcode, subItem.adcode]
                    }
                });
            }
            optionsOfCity.push({value: item.adcode, label: item.name, children: children});
        });

        return (
            <Form>
                <FormItem className="title" {...formItemLayout_14} label="资讯标题：">
                    {getFieldDecorator('title', {
                        initialValue: data.title,
                        rules: [{
                            required: true,
                            max: 42,
                            message: '资讯标题不能为空',
                        }],
                    })(
                        <Input placeholder="请输入资讯标题（6-42字）"/>
                    )}
                </FormItem>
                <FormItem className="typeIds" {...formItemLayout_8} label="资讯分类：">
                    {getFieldDecorator('typeIds', {
                        initialValue: [data.parentId, data.typeId],
                        rules: [{
                            required: true,
                            message: '分类不能为空',
                        }],
                    })(
                        <Cascader options={optionsOfChannel} placeholder="请选择资讯分类"/>
                    )}
                </FormItem>
                <FormItem className="author" {...formItemLayout_8} label="资讯来源：">
                    {getFieldDecorator('author', {
                        initialValue: data.author,
                        rules: [{
                            required: true,
                            message: '来源不能为空',
                        }],
                    })(
                        <Input placeholder="请填写资讯来源"/>
                    )}
                </FormItem>
                <FormItem
                    className={Number(sessionStorage.EId) ? "views unnecessary hide" : "views unnecessary"}
                    {...formItemLayout_8}
                    label="阅读量："
                >
                    {getFieldDecorator('views', {
                        initialValue: data.views,
                        rules: [{
                            required: false
                        }],
                    })(
                        <InputNumber min={0}/>
                    )}
                </FormItem>
                <FormItem className="photo" {...formItemLayout_12} label="图片：">
                    {getFieldDecorator('photo', {
                        initialValue: viewPic,
                        rules: [{
                            required: true,
                            message: '资讯图片不能为空'
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
                <FormItem className="cityId" {...formItemLayout_8} label="所属城市：">
                    {getFieldDecorator('cityId', {
                        initialValue: data.cityId === 0 ? ["0"] : currentCity,
                        rules: [{
                            required: true,
                            message: '所属城市不能为空',
                        }],
                    })(
                        <Cascader options={optionsOfCity} placeholder="请选择所属城市"/>
                    )}
                </FormItem>
                <FormItem className={data.keyword ? "keyword" : "keyword unnecessary"} {...formItemLayout_10}
                          label="关键字：">
                    {getFieldDecorator('keyword', {
                        initialValue: data.keyword,
                        rules: [{
                            required: !!data.keyword,
                            message: '关键字不能为空',
                        }],
                    })(
                        <Input placeholder="多个关键字“，”隔开"/>
                    )}
                </FormItem>
                <FormItem className={data.summary ? "summary" : "summary unnecessary"} {...formItemLayout_16}
                          label="资讯概述：">
                    {getFieldDecorator('summary', {
                        initialValue: data.summary,
                        rules: [{
                            required: !!data.summary,
                            message: '资讯概述不能为空'
                        }]
                    })(
                        <TextArea style={{resize: "none"}} placeholder="请填写资讯概述" rows={10}/>
                    )}
                </FormItem>
            </Form>
        )
    }
);

//资讯编辑组件
class ItemEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            cityCode: null,
            // 图片相关变量
            // 初始图片
            viewPic: "",
            // 有效图片
            effectPic: "",
            // 保存待提交的图片
            data_pic: "",
            avatarEditor: {
                scale: 1,
                positionX: 0.5,
                positionY: 0.5
            },
            photoLoading: false,
            confirmLoading: false
        };
        this.editor = ""
    }

    getData = (para) => {
        reqwest({
            url: '/news/getDetail',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: para
            },
            error: (err) => {},
            success: (json) => {
                if (json.result === 0) {
                    let data = json.data.news;
                    // 资讯类型写入
                    if (data.parentId === 0) {
                        data.parentId = data.typeId;
                        data.typeId = undefined
                    }
                    // 城市ID写入
                    data.cityId = String(json.data.news.cityId);
                    this.setState({
                            data: data,
                            viewPic: "http://image.taoerxue.com/" + json.data.news.photo,
                            data_pic: json.data.news.photo
                        }, () => {
                            this.editor.setData(this.state.data.riches);
                        }
                    )
                } else {
                    if (json.code === 901) {
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

    dataContrast = (values) => {
        const initValues = this.state.data;
        const itemList = ["title", "parentId", "author", "views", "photo", "cityId", "keyword", "summary"];
        const result = {};
        itemList.forEach((item) => {
            if (values[item] !== initValues[item]) {
                result[item] = values[item];
            }
        });
        result.riches = values.riches;
        console.log(result);
        if (JSON.stringify(result) === "{}") {
            return false;
        } else {
            result.id = this.props.id;
            result.title = values.title;
            return result;
        }
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState(
                {
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
                    confirmLoading: false
                }, () => {
                    form.resetFields();
                    this.props.setEdit("status", false)
                })
        };
        // 资讯基本信息为空的处理
        if (JSON.stringify(this.state.data) === "{}") {
            cancel();
            return;
        }
        form.validateFields((err, values) => {
            values.parentId = values.typeIds[0];
            values.photo = this.state.data_pic;
            values.cityId = values.cityId[1] || values.cityId[0];
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
                cancel();
            }
        })
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            values.parentId = values.typeIds[0];
            values.typeId = values.parentId;
            console.log(this.state.effectPic)
            console.log(this.state.viewPic);
            console.log(this.state.data_pic)
            console.log(values.photo)
            // 图片改动判断
            if (values.photo) {
                if (this.state.data_pic !== (global.config.photoUrl + this.state.data_pic22)) {
                    message.error("图片改动了，未提交")
                    return false;                 
                }
            } 
            
            // 图片处理 上传的图片宽度比例不对，会被截取
            let pathTemp = this.state.data_pic.slice(global.config.photoUrl.length);
            values.photo = pathTemp;

            values.cityId = values.cityId[1] || values.cityId[0];
            values.riches = this.editor.getData();
            // 信息对比
            // const result = this.dataContrast(values);
            const result = {
                id: this.props.id,
                title: values.title,
                // parentId: values.parentId,
                // typeId: values.typeId,
                typeId: values.parentId,
                author: values.author,
                views: values.views,
                photo: values.photo,
                cityId: values.cityId,
                keyword: values.keyword,
                summary: values.summary,
                riches: values.riches
            };
            // 所有的数据可以重新上传
            if (!result) {
                message.error("暂无信息更改");
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/sys/news/update',
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
                        form.resetFields();
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
                            confirmLoading: false
                        });
                        message.success("资讯信息修改成功");
                        this.editor.setData("");
                        this.props.setEdit("status", false);
                        this.props.setEdit("flag");
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
            })
        })
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.status) {
            // this.getData(nextProps.id);
            // console.log(nextProps.record);
            this.setState({
                data: nextProps.record,
                cityCode: nextProps.record.cityId.toString(),
                viewPic: nextProps.record.photo,
                data_pic: nextProps.record.photo,
            },() => {
                this.editor.setData(this.state.data.riches);
            })
        }
    }

    componentDidMount() {
        this.editor = window.CKEDITOR.replace('TextArea2');
    }

    render() {
        return (
            <div className="edit-information" style={{minHeight: 725, display: this.props.status ? "block" : "none"}}>
                <header>
                    <Button onClick={this.handleCancel} disabled={this.state.confirmLoading}><Icon type="left"/>返回</Button>
                    <Button 
                        type="primary" 
                        onClick={this.handleCreate} 
                        style={{float: "right"}}
                        loading={this.state.confirmLoading}>提交</Button>
                </header>
                <div className="content">
                    <div className="item item-left information-form information-edit">
                        <ItemEditForm
                            ref={this.saveFormRef}
                            data={this.state.data}
                            cityCode={this.state.cityCode}
                            channels={this.props.channels}
                            reqwestUploadToken={this.reqwestUploadToken}
                            viewPic={this.state.viewPic}
                            effectPic={this.state.effectPic}
                            data_pic={this.state.data_pic}
                            setViewPic={this.setViewPic}
                            avatarEditor={this.state.avatarEditor}
                            setAvatarEditor={this.setAvatarEditor}
                            picUpload={this.picUpload}
                            photoLoading={this.state.photoLoading}
                            provinceList={this.props.provinceList}
                        />
                    </div>
                    <div className="item item-right">
                        <textarea id="TextArea2" cols="20" rows="2" className="ckeditor"/>
                    </div>
                </div>
            </div>
        )
    }
}

//资讯详情组件
class ItemDetail extends Component {
    state = {
        visible: false,
        data: {}
    };
    
    // 去除富文本的标签只获得文本内容
    removeTAG = (str, len) => {
        // return str.replace(/<[^>]+>/g, "");
        let fn_result = str;
        fn_result = fn_result.replace(/(↵)/g, "");
        fn_result = fn_result.replace(/(&nbsp;)/g, "");
        fn_result = fn_result.replace("<html><head><title></title></head><body>", "");
        fn_result = fn_result.replace("</body></html>", "");
        return fn_result;
    };

    showModal = () => {
        console.log(this.props.record);
        this.setState({
            visible: true,
            data: this.props.record,
            riches: this.removeTAG(this.props.record.riches)
        });
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
                    <span className="item-content">{this.state.data.title}</span>
                </div>,
                
                <div className="typeName">
                    <span className="item-name">资讯类型：</span>
                    <span className="item-content">{this.state.data.typeName}</span>
                </div>,
                <div className="managerName">
                    <span className="item-name">展示城市：</span>
                    <span className="item-content">{this.state.data.cityName}</span>
                </div>,
                <div className="sort">
                    <span className="item-name">阅读量：</span>
                    <span className="item-content">{this.state.data.views}</span>
                </div>,
                <div className="managerPhone">
                    <span className="item-name">来源：</span>
                    <span className="item-content">{this.state.data.author}</span>
                </div>,
                <div className="label">
                    <span className="item-name">关键字：</span>
                    <span className="item-content">{this.state.data.keyword}</span>
                </div>,
                <div className="logo">
                    <span className="item-name">照片：</span>
                    <img src={this.state.data.photo} alt="" className="item-content"/>
                </div>,
                <div className="description">
                    <span className="item-name">资讯概述：</span>
                    <pre>
                        <span className="item-content">{this.state.data.summary}</span>                        
                    </pre>
                </div>,
                <div className="description">
                    <span className="item-name">资讯详情：</span>
                    <span dangerouslySetInnerHTML={{__html: this.state.riches}} className="item-content"></span>
                </div>                
            ];
        } else {
            dataSource = ""
        }
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>详情</span>
                <Modal
                    title={"资讯详情"}
                    visible={this.state.visible}
                    width={800}
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

//资讯列表
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
            }
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: 70,
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            // {
            //     title: '排序',
            //     dataIndex: 'sort',
            //     width: 150,
            //     editable: true,
            // },
            {
                title: '标题',
                dataIndex: 'title',
                className: 'orgName',
                // width: '35%',
                render: (text, record) => this.renderColumns(text, record, 'title'),
            },
            // {
            //     title: '照片',
            //     dataIndex: 'photo',
            //     width: '6%',
            //     render: (text, record) => (<img style={{width: '30px', height: "18px"}} alt="" src={record["photo"]}/>)
            // },
            {
                title: '类型',
                dataIndex: "typeName",
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, "typeName"),
            },
            {
                title: '展示城市',
                dataIndex: "cityName",
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, "cityName"),
            },
            {
                title: '阅读量',
                dataIndex: "views",
                width: '5%',
                render: (text, record) => this.renderColumns(text, record, "views"),
            },
            {
                title: '来源',
                dataIndex: "author",
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, "author"),
            },
            {
                title: '日期',
                dataIndex: 'createTime',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                width: 200,
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*资讯演示*/}
                            <ItemShow id={record.id} />
                            {/*资讯详情*/}
                            <ItemDetail 
                                id={record.id}  
                                record={record}
                                opStatus={this.props.opObj.select}/>
                            {/*资讯编辑*/}
                            <a 
                                onClick={() => this.props.setEdit("status", true, record.id, record)}
                                style={{display: this.props.opObj.modify ? "inline" : "none"}}
                                >编辑</a>
                            {/*资讯删除*/}
                            <Popconfirm 
                                title="确认删除?"
                                placement="topRight"
                                onConfirm={() => this.itemDelete(record.id)}
                                onCancel=""
                                okType="danger"
                                okText="立即删除"
                                cancelText="取消"
                            >                                
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
            url: '/sys/news/list',
            type: 'json',
            method: 'get',
            data: {
                cityId: keyword ? keyword.cityId : this.props.keyword.cityId,
                typeId: keyword ? keyword.type : this.props.keyword.type,
                title: keyword ? keyword.newsName : this.props.keyword.newsName,
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
                this.setState({
                    loading: false
                })
                // const json = {
                //     result: 0,
                //     data: {
                //         size: 102,
                //         list: [
                //             {
                //                 id: 1172,
                //                 title: "",
                //                 photo: "",
                //                 author: "",
                //                 createTime: "",
                //                 parentName: "测试",
                //                 typeName: "测试01",
                //                 status: 1,
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
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            sort: item.sort !== 0 ? item.sort : '',
                            photo: item.photo,
                            photo_copy: item.photo,
                            title: item.title.length > 48 ? (item.title.slice(0, 48) + "...") : item.title,
                            author: item.author,
                            views: item.views,
                            createTime: item.createTime,
                            typeName: item.parentName || item.typeName,
                            // parentId: item.parentId, 
                            parentId: item.typeId,
                            typeId: item.typeId,
                            cityName: item.cityName,
                            cityId: item.cityId,
                            riches: item.riches,
                            keyword: item.keyword,
                            summary: item.summary,
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

    //删除
    itemDelete = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/news/delete?id=' + para,
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
                    message.success("资讯删除成功");
                    this.getData();
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

    // 设置排序
    handleSort = (row) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/news/updateSort',
            type: 'json',
            method: 'post',
            data: {
                // 机构Id
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
    };

    //页码变化处理
    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.informationPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.informationPageSize);
        this.setState({
            pagination: pager,
        }, () => {
            this.getData();
        })
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
        // const components = {
        //     body: {
        //       row: EditableFormRow,
        //       cell: EditableCell,
        //     },
        // };
        // const columns = this.columns.map((col) => {
        //     if (!col.editable) {
        //       return col;
        //     }
        //     return {
        //       ...col,
        //       onCell: record => ({
        //         record,
        //         editable: col.editable,
        //         dataIndex: col.dataIndex,
        //         title: col.title,
        //         handleSort: this.handleSort,
        //       }),
        //     };
        // });
        return <Table bordered
                      scroll={{ x: 1500 }}
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={this.state.pagination}
                      columns={this.columns}
                      onChange={this.handleTableChange}/>;
    }
}

class NewsManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            // 资讯类型内容列表
            typeList: [],
            // 资讯类型选项列表
            optionsOfType: [],
            // 列表筛选关键词
            keyword: {
                newsName: "",
                type: "",
                cityId: null,
            },
            // 资讯新增相关状态变量
            addStatus: false,
            addFlag: false,
            // 资讯编辑相关状态变量
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

    }

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
    setNewsName = (value) => {
        if (value !== this.state.keyword.newsName) {
            this.setState({
                keyword: {
                    newsName: value,
                    type: this.state.keyword.type
                }
            })
        }
    };
    // 类型关键词设置
    setType = (value) => {
        value = value === "全部频道" ? "" : value;
        this.setState({
            keyword: {
                setNewsName: this.state.keyword.setNewsName,
                type: value
            }
        })
    };

    // 展示城市设置
    setCity = (value) => {
        value = value === "全部频道" ? "" : value;
        console.log(value)
        this.setState({
            keyword: {
                setNewsName: this.state.keyword.setNewsName,
                cityId: value[1] || value[0]
            }
        })
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

    // 资讯新增相关状态变量设置
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

    // 资讯编辑相关状态变量设置
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

    // 获取资讯类型列表
    getTypeList = () => {
        reqwest({
            url: '/sys/newsType/list',
            type: 'json',
            method: 'get',
            data: {
                pageNum: 1,
                pageSize: 10
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: [
                //         {
                //             id: 50,
                //             name: "50",
                //             parentId: 0
                //         },
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        typeList: json.data.list,
                    }, () => {
                        const tempArr = [<Option key={null} value={null}>{"全部分类"}</Option>];
                        this.state.typeList.forEach((item, index) => {
                            tempArr.push(<Option key={index + 1} value={item.id}>{item.name}</Option>)
                        });
                        this.setState({
                            optionsOfType: tempArr
                        });
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
                        this.setState({
                            loading: false
                        })
                    }
                }
            }
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

    // 登陆信息过期或不存在时的返回登陆页操作
    toLoginPage = () => {
        sessionStorage.clear();
        this.props.history.push('/')
    };

    componentWillMount() {
        this.setPower();
        // 获取资讯类型列表
        this.getTypeList();
        // 获取省市列表信息及当前城市地区代码
        this.getMapDate();
        if (this.props.location.search) {
            this.props.history.push(this.props.location.pathname)
        }
    }

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

    componentWillReceiveProps(nextProps) {
        if (nextProps.location.search) {
            this.props.history.push(nextProps.location.pathname);
            this.setState({
                addFlag: !this.state.addFlag
            })
        }
    }

    render() {
        return (
            <div className="information">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                <Select style={{width: "150px", float: "left", marginRight: "20px"}}
                                        onChange={this.setType} 
                                        placeholder="请选择类型"
                                        allowClear>
                                    {this.state.optionsOfType}
                                </Select>
                                <Cascader options={this.optionsOfCity} 
                                          onChange={this.setCity} 
                                          style={{width: "150px", float: "left", marginRight: "20px"}} 
                                          placeholder="请选择所属城市"
                                          allowClear/>
                            
                                {/* <Select defaultValue="全部展示城市" style={{width: "150px", float: "left", marginRight: "20px"}}
                                        onChange={this.setCity}>
                                    {this.state.optionsOfCity}
                                </Select>*/}
                                
                                <Search
                                    placeholder="请输入资讯标题信息"
                                    onSearch={this.setNewsName}
                                    enterButton
                                    style={{width: "320px", float: "left"}}
                                />
                                {/*资讯创建日期筛选*/}
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
                                {/*资讯添加按钮*/}
                                <Button type="primary"
                                        style={{display: this.state.opObj.add ? "block" : "none", float: "right"}}
                                        onClick={() => this.setAdd("status", 5)}>添加资讯</Button>
                            </header>
                            {/*资讯列表*/}
                            <div className="table-box">
                                <DataTable
                                    opObj={this.state.opObj}
                                    keyword={this.state.keyword}
                                    addFlag={this.state.addFlag}
                                    setEdit={this.setEdit}
                                    editFlag={this.state.editFlag}
                                    toLoginPage={this.toLoginPage}
                                />
                            </div>
                            {/*资讯添加组件*/}
                            <ItemAdd 
                                status={this.state.addStatus} 
                                setAdd={this.setAdd} 
                                channels={this.state.typeList}
                                provinceList={this.state.provinceList} 
                                cityCode={this.state.cityCode}
                                toLoginPage={this.toLoginPage}/>
                            {/*资讯编辑组件*/}
                            <ItemEdit 
                                status={this.state.editStatus}
                                setEdit={this.setEdit}
                                channels={this.state.typeList}
                                provinceList={this.state.provinceList}
                                id={this.state.editId}
                                cityCode={this.state.cityCode}
                                record={this.state.record}
                                toLoginPage={this.toLoginPage}/>
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

export default NewsManage;