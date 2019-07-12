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

//新增资讯表单
const ItemAddForm = Form.create()(
    (props) => {
        const {form, channels, reqwestUploadToken, viewPic, effectPic, data_pic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoLoading, provinceList} = props;
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
                    // if (subItem.adcode === cityCode) {
                    //     // 当前城市设为选中项
                    //     currentCity = [item.adcode, subItem.adcode]
                    // }
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
                            required: true,
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

    componentDidMount() {
        this.editor = window.CKEDITOR.replace('TextArea3');
    }

    render() {
        return (
            <div className="add-information" style={{display: this.props.status ? "block" : "none"}}>
                <header>
                    <Button icon="left" onClick={this.handleCancel} disabled={this.state.confirmLoading}>返回</Button>
                    <Button type="primary" onClick={this.handleCreate} style={{float: "right"}}
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
// class ItemShow extends Component {
//     state = {
//         visible: false,
//         data: {}
//     };

//     showModal = () => {
//         this.setState({
//             visible: true,
//         })
//     };

//     handleCancel = () => {
//         this.setState({visible: false});
//     };

//     render() {
//         return (
//             <a>
//                 <span onClick={this.showModal}>演示</span>
//                 <Modal
//                     title={"资讯演示"}
//                     visible={this.state.visible}
//                     width={395}
//                     bodyStyle={{padding: "0", overflow: "visible"}}
//                     footer={null}
//                     onCancel={this.handleCancel}
//                 >
//                     <div className="newsOne-show">
//                         <iframe
//                             title="资讯详情"
//                             src={"https://news.taoerxue.cn/newsDetails.html?id=" + this.props.id + "&random=" + Math.random()}
//                             scrolling="auto"
//                             frameBorder="0"/>
//                     </div>
//                 </Modal>
//             </a>
//         );
//     }
// }

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
                        initialValue: data.cityId === "0" ? ["0"] : currentCity,
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
            error: (err) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         news: {
                //             id: 122,
                //             title: "最好的过分乐观开朗大方",
                //             photo: "eb75e82708d340a3b22246c2162138bf.jpeg",
                //             author: "淘儿学",
                //             views: 60,
                //             // summary: "每个孩子生来就是圆满俱足的，即“性本善”。那为什么随着孩子年龄的增长，却出现各种问题？其中很多问题的根源来自于家长。",
                //             // keyword: "李开发贷款",
                //             parentId: 50,
                //             typeId: 0,
                //             riches: '<html>↵<head>↵  <title></title>↵</head>↵<body>↵<p>我们应该都很熟悉《三字经》的第一句话&ldquo;人之初，性本善&rdquo;，这句话到底是什么意思呢？我觉得，这里面有一个关于教育的智慧。那就是，每个孩子生来就是圆满俱足的，即&ldquo;性本善&rdquo;。那为什么随着孩子年龄的增长，却出现各种问题？其中很多问题的根源来自于家长。</p>↵↵<p><br />&nbsp;</p>↵↵<p>殊不知，孩子的智慧天生圆满俱足，只不过在孩子成长过程中，家长有意、无意地制止了孩子的发展。比如，很多内向的孩子，家中会有一位强势的老爸或老妈，他们用批评与责骂制止了孩子的活泼，所以孩子才会变得内向。</p>↵↵<p><br />&nbsp;</p>↵↵<p>罗丹曾说：&ldquo;世界并不缺少美，只是缺少发现美的眼睛。&rdquo;家庭教育也是一样，孩子具备获得幸福的所有能力，但是现实生活中，家长的眼睛却很少发现孩子的美。总是觉得自己的孩子有着这样或那样的不足，对孩子的要求无限增加。</p>↵↵<p><br />&nbsp;</p>↵↵<p style="text-align: center;"><img max-width="600" src="http://5b0988e595225.cdn.sohucs.com/images/20180323/bf8a572f85cc493b96d35f20669bf4cd.jpeg" /></p>↵↵<p style="text-align: center;"><br />&nbsp;</p>↵↵<p>孩子做事情，接收到的指责与批评多于赞赏与表扬。经常处在大量负面信息的包围中，孩子怎能不对自己的能力产生怀疑？</p>↵↵<p><br />&nbsp;</p>↵↵<p>当孩子看不到自己身上的优点时，就无法显现自身的优势，久而久之本应有的优点也被隐藏了起来，变成了&ldquo;不足&rdquo;或&ldquo;待提高点&rdquo;我们称之为&ldquo;触点&rdquo;。针对这些触点，家长需要做的就是找到它，进而点燃和引爆，将触点变成孩子的成长点。</p>↵↵<p><br />&nbsp;</p>↵↵<p>那么，怎样点燃和引爆触点呢 ? 有的家长采取&ldquo;说&rdquo;的方式。</p>↵↵<p><br />&nbsp;</p>↵↵<p>一些孩子独立就能完成的事情，家长们却经常：</p>↵↵<blockquote>↵<p>&ldquo;宝贝儿，你这样做不对，你得这样做。&rdquo;</p>↵↵<p>&ldquo;这样不对，不对，快停下。&rdquo;</p>↵</blockquote>↵↵<p><br />&nbsp;</p>↵↵<p>为了让孩子走捷径，家长们时不时地给到孩子抛出自己的&ldquo;经验&rdquo;，结果好好的互动机会变成了说教。父母总是希望将自己总结出的&ldquo;经验&rdquo;让孩子全部吸收，这样孩子就可以少走一些弯路。可是孩子呢，年龄小的时候或许还听的进去一部分，随着年龄增长有自己的想法后，左耳朵进右耳朵出，不但没有什么效果，还会认为父母太唠叨。为什么呢？因为孩子天性喜欢自己去体验与探索。</p>↵↵<p><br />&nbsp;</p>↵↵<p style="text-align: center;"><img max-width="600" src="http://5b0988e595225.cdn.sohucs.com/images/20180323/fe84a1fcc9204e3788c31fad06a50473.jpeg" /></p>↵↵<p style="text-align: center;"><br />&nbsp;</p>↵↵<p>每一个孩子对宇宙都充满了好奇，即使《十万个为什么》也无法满足他们探索宇宙的欲望。可是生活中，我经常看到家长处处阻断孩子与宇宙的连接，还自以为所做的一切都是为了孩子好。孩子在公园玩耍，家长寸步不离地跟着孩子，稍微远一点就会喊&ldquo;慢点&rdquo;、&ldquo;回来&rdquo;；孩子用暖壶倒水，家长担心孩子会被烫伤，看到孩子接近暖瓶立刻制止，并要求孩子远离类似危险物；孩子对家中马桶充满好奇，刚想伸手触碰，家长马上呵斥：&ldquo;别碰，脏！&rdquo;</p>↵↵<p><br />&nbsp;</p>↵↵<p>当我们无法满足孩子好奇心的时候，孩子就会产生匮乏感，形成&ldquo;坑洞&rdquo;。所以，在孩子成长的过程中，父母要给孩子多创造机会，让孩子直接体验，从体验中收获成长。用&ldquo;体验&rdquo;代替&ldquo;说教&rdquo;，&ldquo;结果&rdquo;是最好的老师。</p>↵</body>↵</html>',
                //             // riches: '<html>↵<head>↵   <title></title>↵</head>↵<body>↵<p style="text-align: center;">01</p>↵↵<p>今天上午群里的妹子出了一道题，可能很多人也都做过：</p>↵↵<blockquote>↵<p>王师傅是卖鱼的，一公斤鱼进价48元，现市场价36元一斤。顾客买了两公斤，给了王师傅200元假钱，王师傅没零钱，于是找邻居换了200元。事后邻居存钱过程中发现钱是假的，被银行没收了，王师傅又赔了邻居200，请问王师傅一共亏了多少?</p>↵</blockquote>↵↵<p>&nbsp;</p>↵↵<p>&nbsp;</p>↵↵<p>这道题早几年出来的时候，把很多人都绕晕了，也包括我，群里出题的妹子今天一开始也是糊涂的。</p>↵↵<p><br />&nbsp;</p>↵↵<p>我后来仔细琢磨，为什么这题目看似很简单，却有很多人上当呢？我想大部分人都是在和邻居换钱又赔钱那个环节给绕晕的。</p>↵↵<p><br />&nbsp;</p>↵↵<p>其实换钱环节还有银行没收什么的都是烟雾弹，跟邻居换钱，给了假钱，再赔给邻居钱，这个环节就两个人交易，邻居一分钱没赚到，那么王师傅在这里是没损失的。</p>↵↵<p><br />&nbsp;</p>↵↵<p>这笔糊涂账从头到尾就只有200块钱假钱，那么算出结果大于200的答案都是错的。</p>↵↵<p><br />&nbsp;</p>↵↵<p>再说简单点，王师傅的亏损，只发生在与顾客的交易过程中，他亏的钱，只有找给顾客的零钱和鱼的成本。</p>↵↵<p><br />&nbsp;</p>↵↵<p>成甲的《好好学习》这本书里告诉我们，要发现事物的底层规律。看这本书受到启发后我暗暗观察，发现生活中真的有很多事情都有个共同点：就是大部分事情都有很多干扰，我们都会被表面的现象给蒙蔽，而看不到事情的本质和重点。</p>↵↵<p><br />&nbsp;</p>↵↵<p style="text-align: center;">02</p>↵↵<p>这个道理用在教育孩子上面也同样适用。</p>↵↵<p><br />&nbsp;</p>↵↵<p>我们在与孩子相处的时候，不可避免会与孩子之间发生一些矛盾和冲突，但我发现很多人当时都被情绪带着走了，而没去解决问题本身。当时的情绪就是扰乱我们思维的表象。</p>↵↵<p><br />&nbsp;</p>↵↵<p>我想每个家长都遇到过孩子顶嘴的时候，大部分人的第一反应是很愤怒：&ldquo;反了你了，居然敢顶嘴了啊！&rdquo;</p>↵↵<p><br />&nbsp;</p>↵↵<p>然后我们很多人是不是就忘了事情本身，而先处理孩子顶嘴这件事呢？</p>↵↵<p><br />&nbsp;</p>↵↵<p>我们之所以会出现这种愤怒情绪，是因为在我们的心里已经了假定了自己是对的，孩子是错的，还有就是我们在孩子面前是权威，孩子比我们弱，应该受我们管理。</p>↵↵<p><br />&nbsp;</p>↵↵<p>其实小孩子的认知不足，在大部分情况下，也确实是家长正确，孩子错了，但当孩子反抗时，我们不能强压，而应该让他感受到你们之间有一种公平、讲理的交流模式。</p>↵↵<p><br />&nbsp;</p>↵↵<p>上周有一天小茗爬上了一辆停在小区的货车车厢里玩耍，他站在边上随时都有可能摔下来，我在旁边看着很危险就喊他下来，他直接回我：&ldquo;不！&rdquo;</p>↵↵<p><br />&nbsp;</p>↵↵<p>我当时也是很生气，正要强行将他抱下来，顺便再揍他小屁股一顿，忽然心念一动又冷静了下来，就跟他说：&ldquo;妈妈让你下来，是因为那里很危险，你觉得我说的对吗？&rdquo;</p>↵↵<p><br />&nbsp;</p>↵↵<p>他点点头。</p>↵↵<p><br />&nbsp;</p>↵↵<p>我接着说：&ldquo;那你现在不想下来，你就说出你的理由，如果更正确更有道理，我就同意你继续待在上面。&rdquo;</p>↵↵<p><br />&nbsp;</p>↵↵<p>他想了一会儿，自己爬了下来。</p>↵↵<p><br />&nbsp;</p>↵↵<p>如果我一直在他&ldquo;顶嘴&rdquo;这件事情上反复纠缠，就偏离了原本的问题，而最后即使我通过强硬的手段震慑住了他，他心中怕是也不服的。</p>↵↵<p><br />&nbsp;</p>↵↵<p style="text-align: center;">03</p>↵↵<p>我自己比较重视孩子的教育这一块儿，也看了不少教育方面的书。然后就经常有朋友让我推荐育儿书籍，我也总是很热心地推荐几本我认为还不错的书。</p>↵↵<p><br />&nbsp;</p>↵↵<p>随着孩子慢慢长大，特别是现在能和我在思想上有交流之后，我发现，所有教育的问题，所有与孩子之间的矛盾，其实都是大人本身的问题。</p>↵↵<p><br />&nbsp;</p>↵↵<p>也就是说，你怎样处理和孩子之间的关系，考验的是你的处事能力。</p>↵↵<p><br />&nbsp;</p>↵↵<p>我们在生活工作中可能见过这样一些人，觉得他们特别&ldquo;帅&rdquo;，工作中他们总能找到最有效率的工作方法，我们会认为他们工作能力强；他们处理事情也总能处理得妥贴圆满，我们也往往会以为他们情商高。</p>↵↵<p><br />&nbsp;</p>↵↵<p>其实不是的，大部分道理都是相通的，能力也都是综合考量的，那些真正厉害的人，他们处理任何事情都高明。</p>↵↵<p><br />&nbsp;</p>↵↵<p>现在，有人再让我推荐育儿书，我总是会忍不住推荐其他不相干的，因为，在我现在看来，好的教育方法应该藏在哲学、心理学、甚至经济学里。而纯粹育儿的书，看一两本就够了，在孩子还小、思维表达能力都很弱的时候或许还有些用处，大一点后教育孩子真正的功夫应该放在自己身上，这才是教育问题的关键。</p>↵↵<p><br />&nbsp;</p>↵↵<p>你能控制自己的情绪了，就能很好地和孩子相处；你逻辑清晰了，就能一针见血地发现孩子的问题出在哪里；你做好了自己，才能做好家长。</p>↵↵<p><br />&nbsp;</p>↵↵<p>大部分情况下，你做好了自己，孩子也能做好他自己。</p>↵</body>↵</html>',
                //             cityId: 0,
                //             status: 1
                //         }
                //     },
                // };
            },
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
            values.photo = this.state.data_pic;
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

    componentWillReceiveProps(nextProps) {
        if (nextProps.status) {
            // this.getData(nextProps.id);
            console.log(nextProps.record);
            this.setState({
                data: nextProps.record,
                cityCode: nextProps.record.cityId,
                viewPic: nextProps.record.photo,
                data_pic: nextProps.record.photo_copy,
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
            <div className="edit-information" style={{display: this.props.status ? "block" : "none"}}>
                <header>
                    <Button icon="left" onClick={this.handleCancel} disabled={this.state.confirmLoading}>返回</Button>
                    <Button type="primary" onClick={this.handleCreate} style={{float: "right"}}
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
        return str.replace(/<[^>]+>/g, "");
    };

    showModal = () => {
        this.setState({
            visible: true,
            data: this.props.record,
            riches: this.removeTAG(this.props.record.riches)
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
                    <span className="item-content">{this.state.data.title}</span>
                </div>,
                
                <div className="typeName">
                        <span className="item-name">资讯类型：</span>
                        <span className="item-content">{this.state.data.typeName || "暂无"}</span>
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
                    <span className="item-content">{this.state.data.keyword || "暂无"}</span>
                </div>,
                <div className="logo">
                    <span className="item-name">照片：</span>
                    {this.state.data.photo ? <img src={this.state.data.photo} alt=""
                                                 className="item-content"/> : "暂无"}
                </div>,
                
                
                <div className="description">
                    <span className="item-name">资讯概述：</span>
                    <pre>
                        <span className="item-content">{this.state.data.summary}</span>
                    </pre>
                </div>,
                <div className="telephone">
                    {/*<span className="item-name">资讯详情：</span>*/}
                    {/*<div stye={{height: "200px", overflow: "scroll"}} className="item-content">{this.state.riches}</div>*/}
                </div>                
            ];
        } else {
            dataSource = ""
        }
        return (
            <a>
                <span onClick={this.showModal}>详情</span>
                <Modal
                    title={"资讯详情"}
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

//资讯列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.informationPageSize) || 10,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            }
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '5%',
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
                width: '35%',
                render: (text, record) => this.renderColumns(text, record, 'title'),
            },
            {
                title: '照片',
                dataIndex: 'photo',
                width: '6%',
                render: (text, record) => (<img style={{width: '30px', height: "18px"}} alt="" src={record["photo"]}/>)
            },
            {
                title: '类型',
                dataIndex: "typeName",
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, "typeName"),
            },
            {
                title: '展示城市',
                dataIndex: "cityName",
                width: '5%',
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
                width: '5%',
                render: (text, record) => this.renderColumns(text, record, "author"),
            },
            {
                title: '日期',
                dataIndex: 'createTime',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*资讯演示*/}
                            {/*<ItemShow id={record.id}/>*/}
                            {/*资讯详情*/}
                            <ItemDetail id={record.id}  record={record}/>
                            {/*资讯编辑*/}
                            <a onClick={() => this.props.setEdit("status", true, record.id, record)}
                               // style={{display: this.props.opObj.modify ? "inline" : "none"}}
                               >编辑</a>
                            {/*资讯删除*/}
                            <Popconfirm title="确认删除?"
                                        placement="topRight"
                                        onConfirm={() => this.itemDelete(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="立即删除"
                                        cancelText="取消">
                                <a>删除</a>
                                {/*<a style={{display: this.props.opObj.delete ? "inline" : "none"}}>删除</a>*/}
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
            d = time.getDate(),
            h = time.getHours(),
            mm = time.getMinutes(),
            s = time.getSeconds();
        return y + '-' + add0(m) + '-' + add0(d) + ' '+ add0(h) + ':' + add0(mm) + ':' + add0(s);
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
                            photo: "http://image.taoerxue.cn/" + item.photo,
                            photo_copy: item.photo,
                            title: item.title.length > 48 ? (item.title.slice(0, 48) + "...") : item.title,
                            author: item.author,
                            views: item.views,
                            createTime: this.dateHandle02(item.createTime),
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
                    scroll={{ x: 2500 }}
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    columns={columns}
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
                cityId: value
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
                    if (json.code === "901") {
                        message.error("请先登录");
                        // 返回登陆页
                        this.toLoginPage();
                    } else if (json.code === "902") {
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
        console.log(this.state.opObj)
        return (
            <div className="information">
                {
                    // this.state.opObj.select ?
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
                                        style={{display: "block", float: "right"}}
                                        // style={{display: this.state.opObj.add ? "block" : "none", float: "right"}}
                                        onClick={() => this.setAdd("status", true)}>添加资讯</Button>
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
                            <ItemAdd status={this.state.addStatus} setAdd={this.setAdd} channels={this.state.typeList}
                                     provinceList={this.state.provinceList} cityCode={this.state.cityCode}
                                     toLoginPage={this.toLoginPage}/>
                            {/*资讯编辑组件*/}
                            <ItemEdit status={this.state.editStatus}
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
                        // :
                        // <p>暂无查询权限</p>
                }

            </div>
        )
    }
}

export default NewsManage;