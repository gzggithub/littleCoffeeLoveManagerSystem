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
    InputNumber,
    Cascader,
} from 'antd';
import '../../config/config';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';
import reqwest from 'reqwest';
import AvatarEditor from 'react-avatar-editor'

const Search = Input.Search;
const {Option} = Select;
const FormItem = Form.Item;
const { TreeNode } = Tree;
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
            <a>
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
            values.typeId = values.parentId,
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
                    <span className="item-name">资讯详情：</span>
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
                    width={600}
                    bodyStyle={{padding: "0", overflow: "visible"}}
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

//听书信息详情组件
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
        //                 <span className="item-name">听书类型一：</span>
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
                    <span className="item-name">听书名称：</span>
                    <span className="item-content">{this.state.data.name}</span>
                </div>,
                <div className="logo">
                    <span className="item-name">LOGO：</span>
                    {this.state.data.icon ? <img src={"http://image.taoerxue.com/" + this.state.data.icon} alt=""
                                                 className="item-content"/> : "暂无"}
                </div>,
                <div className="typeName">
                        <span className="item-name">听书类型一：</span>
                        <span className="item-content">{this.state.orgTypeList[0] ? this.state.orgTypeList[0].typeName : "暂无"}</span>
                </div>,
                <div className="typeName">
                    <span className="item-name">听书类型二：</span>
                    <span className="item-content">{this.state.orgTypeList[1] ? this.state.orgTypeList[1].typeName : "暂无"}</span>
                </div>,
                <div className="typeName">
                    <span className="item-name">听书类型三：</span>
                    <span className="item-content">{this.state.orgTypeList[2] ? this.state.orgTypeList[2].typeName : "暂无"}</span>
                </div>,
                <div className="managerName">
                    <span className="item-name">管理员：</span>
                    <span className="item-content">{this.state.data.managerName}</span>
                </div>,
                <div className="sort">
                    <span className="item-name">排序：</span>
                    <span className="item-content">{this.state.data.sort}</span>
                </div>,
                <div className="managerPhone">
                    <span className="item-name">联系电话：</span>
                    <span className="item-content">{this.state.data.managerPhone}</span>
                </div>,
                <div className="subscribeNumber">
                    <span className="item-name">预约试听数：</span>
                    <span className="item-content">{this.state.data.subscribeNumber}</span>
                </div>,
                <div className="geschaftszeit">
                    <span className="item-name">营业时间：</span>
                    <span className="item-content">{this.state.data.businessHours || "暂无"}</span>
                </div>,
                <div className="scope">
                    <span className="item-name">商家面积：</span>
                    <span className="item-content">{this.state.data.scope || "暂无"}</span>
                </div>,
                <div className="classNumber">
                    <span className="item-name">教室数目：</span>
                    <span className="item-content">{this.state.data.classNumber || "暂无"}</span>
                </div>,
                <div className="teacherNumber">
                    <span className="item-name">师资力量：</span>
                    <span className="item-content">{this.state.data.teacherNumber || "暂无"}</span>
                </div>,
                <div className="label">
                    <span className="item-name">特色标签：</span>
                    <span className="item-content">{this.state.data.label || "暂无"}</span>
                </div>,
                <div className="description">
                    <span className="item-name">听书简介：</span>
                    <pre>
                    <span className="item-content">{this.state.data.description}</span>
                </pre>
                </div>,
                <div className="photo">
                    <span className="item-name">图片一：</span>
                    <img src={this.state.orgResourceList[0] ? this.state.orgResourceList[0].path : ''} alt="" className="item-content"/>
                </div>,
                <div className="photo">
                    <span className="item-name">图片二：</span>
                    {
                        this.state.orgResourceList[1] ?
                            <img src={this.state.orgResourceList[1].path} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="photo">
                    <span className="item-name">图片三：</span>
                    {
                        this.state.orgResourceList[2] ?
                            <img src={this.state.orgResourceList[2].path} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="photo">
                    <span className="item-name">图片四：</span>
                    {
                        this.state.orgResourceList[3] ?
                            <img src={this.state.orgResourceList[3].path} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="photo">
                    <span className="item-name">图片五：</span>
                    {
                        this.state.orgResourceList[4] ?
                            <img src={this.state.orgResourceList[4].path} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
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
                    <span className="item-name">听书地址：</span>
                    <span className="item-content">{this.state.data.detailedAddress}</span>
                </div>,
                <div className="telephone">
                    <span className="item-name">听书电话：</span>
                    <span className="item-content">{this.state.data.telephone}</span>
                </div>,
                <div className="star">
                    <span className="item-name">听书星级：</span>
                    <span className="item-content">{this.state.data.star}</span>
                </div>,
                <div className="companyName">
                    <span className="item-name">公司名称：</span>
                    <span className="item-content">{this.state.data.companyName}</span>
                </div>,
                <div className="licenseNumber">
                    <span className="item-name">信用代码：</span>
                    <span className="item-content">{this.state.data.licenseNumber}</span>
                </div>,
                <div className="fees">
                    <span className="item-name">手续费：</span>
                    <span className="item-content">{Number(this.state.data.fees) || "暂无"}</span>
                </div>,
                <div className="additionalProtocol">
                    <span className="item-name">附加协议：</span>
                    <pre>
                    <span className="item-content">{this.state.data.additionalProtocol || "暂无"}</span>
                </pre>
                </div>,
                <div className="realNameState">
                    <span className="item-name">实名认证：</span>
                    <span className="item-content">{realNameState}</span>
                </div>,
                <div className="mainEducation">
                    <span className="item-name">是否主听书：</span>
                    <span className="item-content">{this.state.data.mainEducation ? "否" : "是"}</span>
                </div>,
                <div className="createTime">
                    <span className="item-name">创建时间：</span>
                    <span
                        className="item-content">{this.state.data.createTime ? this.timeHandle(this.state.data.createTime) : ""}</span>
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
                    title="听书详情"
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
                title: '排序',
                dataIndex: 'sort',
                width: 150,
                editable: true,
            },
            {
                title: '标题',
                dataIndex: 'name',
                // width: '10%',
                className: 'operating',
                render: (text, record) => this.renderColumns(text, record, 'name'),
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
                width: '8%',
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
                width: '6%',
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
                title: '状态',
                dataIndex: 'status',
                filters: [
                    {text: '启用', value: 2},
                    {text: '禁用', value: 0},
                ],
                filterMultiple: false,
                render: (text, record) => this.renderColumns(text, record, 'status'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                width: 200,
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*听书详情*/}
                            {/*<ItemDetails id={record.id} educationKey={record.educationKey}
                                      toLoginPage={this.props.toLoginPage} opStatus={this.props.opObj.modify}/>*/}
                            <ItemDetail id={record.id}  record={record}/>
                            {/*听书编辑*/}
                            <a onClick={() => this.props.setEdit("status", true, record.id, record)}
                               // style={{display: this.props.opObj.modify ? "inline" : "none"}}
                               >编辑</a>
                            {/*<ItemEdit id={record.id} educationKey={record.educationKey} recapture={this.getData}
                                      toLoginPage={this.props.toLoginPage} opStatus={this.props.opObj.modify}/>*/}
                            
                            {/*听书删除*/}
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
            url: '/sys/listenBook/list',
            type: 'json',
            method: 'get',
            data: {
                // 听书类型
                type: keyword ? keyword.type : this.props.keyword.type,
                // 听书状态
                // status: this.state.status,
                // 听书名称
                name: keyword ? keyword.educationName : this.props.keyword.educationName,
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
                            name: item.name || "暂无",
                            photo: item.photo || "暂无",
                            cityName: item.cityName || "暂无",                
                            typeName: item.typeName || "暂无",
                            commentTotal: item.commentTotal,
                            summary: item.summary,
                            linkAddress: item.linkAddress,
                            duration: ((item.duration/60).toFixed() < 10 ? '0' : '') + (item.duration/60).toFixed() + "'" + item.duration%60 + '"',
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

    // 获取听书类型列表
    getInstitutionTypeList = () => {
        reqwest({
            url: '/sys/listenBook/list',
            type: 'json',
            method: 'get',
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

    //听书禁用
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
                    message.success("听书禁用成功");
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

    //听书启用
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
                    message.success("听书启用成功");
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

    //听书删除
    itemDelete = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/listenBook/delete?id=' + id,
            type: 'json',
            method: 'post',
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
        /*if (nextProps.keyword === this.props.keyword && nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData(nextProps.keyword);*/
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
        return <Table bordered
                      style={{display: this.props.addFlag ? "none" : "block"}}
                      components={components}
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={this.state.pagination}
                      columns={columns}
                      scroll={{ x: 2500 }}
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
        // this.treeData = [];
        this.optionsOfCity = [{value: "0", label: "全国"}];
        // 听书类型内容列表
        this.optionsOfType = [<Option key={null} value={null}>{"全部分类"}</Option>];
        this.optionsCity = [<Option key={this.state.keyword.cityCode} value={this.state.keyword.cityCode}>{"全部展示城市"}</Option>];
    }

    getData = () => {
        this.refs.getDataCopy.getData();
    };

    // 获取听书类型列表
    typeList = () => {
        reqwest({
            url: '/sys/listenBook/list',
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
                    console.log(json.data.list)
                    json.data.list.forEach((item, index) => {
                        this.optionsOfType.push(
                            <Option key={index + 1} value={item.id}>{item.typeName}</Option>
                        );
                    });
                    this.setState({
                        loading: false,
                    });
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
        });
    } 

    //类型选择设置
    setType = (value) => {
        console.log("selected:", value);
        this.setState({
            keyword: {
                type: value,
            }
        })
    };

    // 城市列表 
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
                            <Option key={item.id} value={item.id}>{item.name}</Option>
                        ) 
                    });
                    return false;
                });
            }
        });
    }  

    //城市选择设置
    setCity = (value) => {
        console.log("selected:", value);
        this.setState({
            keyword: {
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
                    // this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                {/*听书位置筛选*/}
                               {/* <Select defaultValue="全部类型"
                                        style={{
                                            width: "150px",
                                            float: "left",
                                            marginRight: "20px"
                                        }}
                                        onChange={this.setType}>
                                    {this.optionsType}
                                </Select>*/}
                                <Select style={{width: "150px", float: "left", marginRight: "20px"}}
                                        onChange={this.setType} placeholder="请选择类型">
                                    {this.optionsOfType}
                                </Select>
                                {/*城市筛选*/}
                                <Cascader options={this.optionsOfCity} onChange={this.setCity} style={{width: "150px", float: "left", marginRight: "20px"}} placeholder="请选择所属城市"/>
                                {/*<Select defaultValue="全部展示城市"
                                        style={{
                                            width: "150px",
                                            float: "left",
                                            marginRight: "20px"
                                        }}
                                        onChange={this.setCity}>
                                    {this.optionsCity}
                                </Select>*/}
                                {/*听书名称筛选*/}
                                <Search
                                    placeholder="请输入描述信息"
                                    onSearch={this.setName}
                                    enterButton
                                    style={{width: "240px", float: "left", marginRight: "20px"}}
                                />
                                {/*听书创建日期筛选*/}
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
                                {/*听书添加*/}
                                <Button type="primary"
                                        style={{display: "block", float: "right"}}
                                        // style={{display: this.state.opObj.add ? "block" : "none", float: "right"}}
                                        onClick={() => this.setAdd("status", true)}>添加资讯</Button>
                                {/*<div className="add-button" style={{float: "right"}}>
                                    <ItemAdd opStatus={this.state.opObj.add} toLoginPage={this.toLoginPage}/>
                                </div>*/}
                            </header>
                            {/*听书列表*/}
                            <div className="table-box">
                                <DataTable 
                                        ref="getDataCopy"
                                        opObj={this.state.opObj} 
                                        keyword={this.state.keyword}
                                        addFlag={this.state.addFlag}
                                        setEdit={this.setEdit}
                                        editFlag={this.state.editFlag}
                                        toLoginPage={this.toLoginPage}/>
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

// //添加听书表单
// const ItemAddForm = Form.create()(
//     (props) => {
//         const {visible, onCancel, onCreate, form, allTypeList, provinceList, cityList, districtList, streetList, markers, setMarkers, area, setArea, mapObj, setXY, setFormattedAddress, formattedAddress, viewPic01, setViewPic01, picUpload01, avatarEditor01, setAvatarEditor01, photoList01, setPhotoList01, photoLoading, confirmLoading} = props;
//         const {getFieldDecorator} = form;

//         // 总听书选项生成
//         const optionsOfAllTypeList = [];
//         if (allTypeList) {
//             allTypeList.forEach((item, index) => {
//                 optionsOfAllTypeList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
//             });
//         }        

//         // 已上传图片列表
//         const photoExist01 = [];
//         photoList01.forEach((item, index) => {
//             photoExist01.push(
//                 <div className="photoExist-item clearfix" key={index + 1}>
//                     <img src={item.path} alt=""/>
//                     <div className="remove">
//                         <Button type="dashed"
//                                 shape="circle" icon="minus" onClick={() => setPhotoList01(index)}/>
//                     </div>
//                 </div>
//             )
//         });

//         // 由图片文件对象获取其base64编码
//         const getBase64 = (img, callback) => {
//             const reader = new FileReader();
//             reader.addEventListener('load', () => callback(reader.result));
//             reader.readAsDataURL(img);
//         };
//         // 由图片地址获取其文件对象
//         const dataURLtoFile = (url) => {
//             let arr = url.split(','),
//                 bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
//             while (n--) {
//                 u8arr[n] = bstr.charCodeAt(n)
//             }
//             return new Blob([u8arr], {type: "image/jpeg"});
//         };

//         // 听书图片相关
//         const setEditorRef01 = (editor) => this.editor01 = editor;
//         const beforeUpload01 = (file) => {
//             const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
//             if (!isIMG) {
//                 message.error('文件类型错误');
//             }
//             const isLt2M = file.size / 1024 / 1024 < 2;
//             if (!isLt2M) {
//                 message.error('文件不能大于2M');
//             }
//             if (isIMG && isLt2M) {
//                 getBase64(file, (imageUrl) => {
//                     setViewPic01(imageUrl);
//                 });
//             }
//             return false
//         };
//         const uploadButton01 = (
//             <div>
//                 <Icon type={'plus'}/>
//                 <div className="ant-upload-text" style={{display: viewPic01 ? "none" : "block"}}>选择图片</div>
//             </div>
//         );
//         const picHandle01 = () => {
//             if (viewPic01) {
//                 const canvas = this.editor01.getImage();
//                 const url = canvas.toDataURL("image/jpeg", 0.92);
//                 const file = dataURLtoFile(url);
//                 picUpload01(file)
//             } else {
//                 message.error("图片未选择");
//             }
//         };
//         const partImg01 = (
//             <AvatarEditor
//                 ref={setEditorRef01}
//                 image={viewPic01}
//                 width={180}
//                 height={100}
//                 border={0}
//                 color={[255, 255, 255, 0.6]}
//                 scale={avatarEditor01.scale}
//                 position={{x: avatarEditor01.positionX, y: avatarEditor01.positionY}}
//                 rotate={0}
//             />
//         );

//         // 听书音频相关
//         const setEditorRef02 = (editor) => this.editor01 = editor;
//         const beforeUpload02 = (file) => {
//             const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
//             if (!isIMG) {
//                 message.error('文件类型错误');
//             }
//             const isLt2M = file.size / 1024 / 1024 < 2;
//             if (!isLt2M) {
//                 message.error('文件不能大于2M');
//             }
//             if (isIMG && isLt2M) {
//                 getBase64(file, (imageUrl) => {
//                     setViewPic01(imageUrl);
//                 });
//             }
//             return false
//         };
//         const uploadButton02 = (
//             <div>
//                 <Icon type={'plus'}/>
//                 <div className="ant-upload-text" style={{display: viewPic01 ? "none" : "block"}}>添加文件</div>
//             </div>
//         );
//         const picHandle02 = () => {
//             if (viewPic01) {
//                 const canvas = this.editor01.getImage();
//                 const url = canvas.toDataURL("image/jpeg", 0.92);
//                 const file = dataURLtoFile(url);
//                 picUpload01(file)
//             } else {
//                 message.error("图片未选择");
//             }
//         };
//         const partImg02 = (
//             <AvatarEditor
//                 ref={setEditorRef01}
//                 image={viewPic01}
//                 width={180}
//                 height={100}
//                 border={0}
//                 color={[255, 255, 255, 0.6]}
//                 scale={avatarEditor01.scale}
//                 position={{x: avatarEditor01.positionX, y: avatarEditor01.positionY}}
//                 rotate={0}
//             />
//         );


//         // 听书地址相关
//         const provinceOptions = provinceList.map(item => <Option key={item.name}>{item.name}</Option>);
//         const cityOptions = cityList.map(item => <Option key={item.name}>{item.name}</Option>);
//         const districtOptions = districtList.map(item => <Option key={item.name}>{item.name}</Option>);
//         const streetOptions = streetList.map(item => <Option key={item.name}>{item.name}</Option>);
//         const addressChange = (value) => {
//             if (!value) {
//                 return
//             }
//             let keyword = "";
//             keyword = keyword + area.province + area.city + area.district + area.street;
//             keyword = keyword + value;
//             // 清除已有标记点
//             mapObj.remove(markers);
//             mapObj.plugin('AMap.Geocoder', function () {
//                 const geocoder = new window.AMap.Geocoder({});
//                 const marker = new window.AMap.Marker({
//                     map: mapObj,
//                     bubble: true
//                 });
//                 geocoder.getLocation(keyword, (status_, result_) => {
//                     if (status_ === 'complete' && result_.info === 'OK') {
//                         geocoder.getAddress([result_.geocodes[0].location.lng, result_.geocodes[0].location.lat], (status, result) => {
//                             if (status === 'complete' && result.info === 'OK') {
//                                 // 经纬度写入
//                                 setXY({x: result_.geocodes[0].location.lng, y: result_.geocodes[0].location.lat});
//                                 // 生成当前标记点
//                                 marker.setPosition(result_.geocodes[0].location);
//                                 mapObj.setCenter(marker.getPosition());
//                                 setMarkers(marker);
//                                 // address字段写入
//                                 setFormattedAddress(area.street ? keyword : result.regeocode.addressComponent.province + result.regeocode.addressComponent.city + result.regeocode.addressComponent.district + result.regeocode.addressComponent.township + keyword);
//                                 // 其他地址信息写入
//                                 setArea(5, result.regeocode.addressComponent);
//                             }
//                         });
//                     }
//                 });
//             });
//         };

//         return (
//             <Modal
//                 visible={visible}
//                 title="添加听书"
//                 width={1000}
//                 onCancel={onCancel}
//                 onOk={onCreate}
//                 confirmLoading={confirmLoading}
//             >
//                 <div className="institution-add institution-form item-form">
//                     <Form layout="vertical">
//                         <h4 className="add-form-title-h4">基础信息</h4>
//                         <Row gutter={24}>
//                             <Col span={8}>
//                                 <FormItem className="companyName" label="听书标题：">
//                                     {getFieldDecorator('title', {
//                                         rules: [
//                                             {
//                                                 required: true,
//                                                 message: '听书标题不能为空',
//                                             },
//                                             {
//                                                 min: 6,
//                                                 message: "听书标题至少6个字",
//                                             },
//                                             {
//                                                 max: 42,
//                                                 message: "听书标题不能超过42个字符",
//                                             },
//                                         ],
//                                     })(
//                                         <Input placeholder="请填写听书标题(6-42字)"/>
//                                     )}
//                                 </FormItem>
//                             </Col>
//                             <Col span={8}>
//                                 <FormItem className="advPosition" label="听书分类：">
//                                     {getFieldDecorator('type', {
//                                         rules: [
//                                             {
//                                                 required: true,
//                                                 message: '听书分类不能为空',
//                                             }
//                                         ],
//                                     })(
//                                         <Select
//                                             style={{width: '100%'}}
//                                             placeholder="请选择听书位置"
//                                             // onChange={handleFirstChange}
//                                         >
//                                             {/*{optionsOfTypeList}*/}
//                                             <Option key={1} value={1}>首页banner听书</Option>
//                                             <Option key={2} value={2}>育儿栏目banner听书</Option>
//                                             <Option key={3} value={3}>首页banner听书1</Option>
//                                             <Option key={4} value={4}>首页banner听书2</Option>
//                                         </Select>
                                       
//                                     )}
//                                 </FormItem>
//                             </Col>
//                             <Col span={8}>
//                                 <FormItem className="companyName" label="听书来源：">
//                                     {getFieldDecorator('titleOrgin', {
//                                         rules: [
//                                             {
//                                                 required: false,
//                                                 message: '听书标题不能为空',
//                                             },
//                                             {
//                                                 max: 10,
//                                                 message: "听书标题不能超过10个字",
//                                             },
//                                         ],
//                                     })(
//                                         <Input placeholder="请填写听书来源(不超过10个字)"/>
//                                     )}
//                                 </FormItem>
//                             </Col> 
//                         </Row>
//                         <div className="ant-line"></div>
//                         <Row gutter={24}>
//                             <Col span={8}>
//                                 <FormItem className="originalPrice" label="原价（￥）：">
//                                     {getFieldDecorator('originalPrice', {
//                                         rules: [{
//                                             required: true,
//                                             message: '原价不能为空',
//                                         }],
//                                     })(
//                                         <InputNumber min={0} precision={2} step={100} style={{width: "100%"}} />
//                                     )}
//                                 </FormItem>
//                             </Col>
//                             <Col span={8}>
//                                 <FormItem className="price"  label="现价（￥）：">
//                                     {getFieldDecorator('price', {
//                                         rules: [{
//                                             required: true,
//                                             message: '现价不能为空',
//                                         }],
//                                     })(
//                                         <InputNumber min={0} precision={2} step={100} style={{width: "100%"}} />
//                                     )}
//                                 </FormItem>
//                             </Col>
//                             <Col span={8}>
//                                 <FormItem className="area longItem" label="展示城市：">
//                                     {getFieldDecorator('area', {
//                                         rules: [{
//                                             required: false,
//                                             message: '所在区域未选择'
//                                         }],
//                                     })(
//                                         <div>
//                                             <Select placeholder="省" style={{width: "45%", marginRight: 10}}
//                                                     value={area.province || undefined} onChange={(value) => {
//                                                 setArea(1, value)
//                                             }} dropdownMatchSelectWidth={false} allowClear={true}>
//                                                 {provinceOptions}
//                                             </Select>
//                                             <Select placeholder="市" style={{width: "45%", marginRight: 10}}
//                                                     value={area.city || undefined} onChange={(value) => {
//                                                 setArea(2, value)
//                                             }} dropdownMatchSelectWidth={false} allowClear={true}>
//                                                 {cityOptions}
//                                             </Select>
//                                         </div>
//                                     )}
//                                 </FormItem>
//                             </Col>
//                         </Row>
//                         <div className="ant-line"></div>
//                         <Row>
//                             <Col span={10}>
//                                 <FormItem className="photo photos"  label="听书图片：">
//                                     {getFieldDecorator('photo', {
//                                         rules: [{
//                                             required: true,
//                                             message: '听书图片不能为空',
//                                         }],
//                                     })(
//                                         <div className="itemBox">
//                                             {photoExist01}                                            
//                                             <Upload
//                                                 name="file"                                          
//                                                 showUploadList={false}
//                                                 listType="picture-card"
//                                                 className="avatar-uploader"
//                                                 beforeUpload={beforeUpload01}
//                                             >
//                                                 {viewPic01 ? partImg01 : uploadButton01}
//                                                 <p className="hint">（可上传1-5张图片）</p>
//                                             </Upload>
//                                             <Row>
//                                                 <Col span={4}>缩放：</Col>
//                                                 <Col span={12}>
//                                                     <Slider min={1} max={1.5} step={0.01} value={avatarEditor01.scale}
//                                                             disabled={!viewPic01}
//                                                             onChange={(value) => {
//                                                                 setAvatarEditor01(1, value)
//                                                             }}/>
//                                                 </Col>
//                                             </Row>
//                                             <Row>
//                                                 <Col span={4}>X：</Col>
//                                                 <Col span={12}>
//                                                     <Slider min={0} max={1} step={0.01} value={avatarEditor01.positionX}
//                                                             disabled={!viewPic01}
//                                                             onChange={(value) => {
//                                                                 setAvatarEditor01(2, value)
//                                                             }}/>
//                                                 </Col>
//                                             </Row>
//                                             <Row>
//                                                 <Col span={4}>Y：</Col>
//                                                 <Col span={12}>
//                                                     <Slider min={0} max={1} step={0.01} value={avatarEditor01.positionY}
//                                                             disabled={!viewPic01}
//                                                             onChange={(value) => {
//                                                                 setAvatarEditor01(3, value)
//                                                             }}/>
//                                                 </Col>
//                                             </Row>
//                                             <Button type="primary"
//                                                     onClick={picHandle01}
//                                                     loading={photoLoading}
//                                                     style={{
//                                                         position: "absolute",
//                                                         right: "-20px",
//                                                         bottom: "0"
//                                                     }}>
//                                                 图片提交
//                                             </Button>
//                                         </div>
//                                     )}
//                                 </FormItem>
//                             </Col>
//                         </Row>                       
                        
//                         <div className="ant-line"></div>
//                         <Row gutter={24}>
//                             <Col span={24}>
//                                 <FormItem className="companyName" label="简介：">
//                                     {getFieldDecorator('summary', {
//                                         rules: [
//                                             {
//                                                 required: true,
//                                                 message: '简介不能为空',
//                                             },
//                                             {
//                                                 max: 300,
//                                                 message: "简介不能超过300个字",
//                                             },
//                                         ],
//                                     })(
//                                         <TextArea style={{resize: "none"}} placeholder="请填写简介" rows={10}/>
//                                     )}
//                                 </FormItem>
//                             </Col>
//                         </Row> 
//                         <div className="ant-line"></div>
//                         <h4 className="add-form-title-h4">音频文件</h4>
//                         <Row>
//                             <Col span={10}>
//                                 <FormItem className="photo photos">
//                                     {getFieldDecorator('video', {
//                                         rules: [{
//                                             required: false,
//                                             message: '音频不能为空',
//                                         }],
//                                     })(
//                                         <div className="itemBox">
//                                             {photoExist01}                                            
//                                             <Upload
//                                                 name="file"                                          
//                                                 showUploadList={false}
//                                                 listType="picture-card"
//                                                 className="avatar-uploader"
//                                                 beforeUpload={beforeUpload01}
//                                             >
//                                                 {viewPic01 ? partImg01 : uploadButton01}
//                                             </Upload>
//                                             <Button type="primary"
//                                                     onClick={picHandle01}
//                                                     loading={photoLoading}
//                                                     style={{
//                                                         position: "absolute",
//                                                         right: "-20px",
//                                                         bottom: "0"
//                                                     }}>
//                                                 文件提交
//                                             </Button>
//                                         </div>
//                                     )}
//                                 </FormItem>
//                             </Col>
//                         </Row>                         
//                     </Form>
//                 </div>
//             </Modal>
//         );
//     }
// );

// //添加听书组件
// class ItemAdd extends Component {
//     state = {
//         visible: false,
//         // 总听书类型表
//         allTypeList: [],
//         // 听书类型表
//         typeList: [],
//         // 短信验证码相关变量
//         phone: "",
//         countDown: 0,
//         codeButtonStatus: false,
//         // 听书图片相关变量
//         // 上传Token
//         uploadToken: '',
//         fileKey: 0,
//         viewPic01: "",
//         photoList01: [],
//         photoList11: [],
//         avatarEditor01: {
//             scale: 1,
//             positionX: 0.5,
//             positionY: 0.5
//         },
//         photoLoading: false,
//         // 听书LOGO相关变量
//         viewPic02: "",
//         effectPic02: "",
//         data_pic02: "",
//         data_pic22: "",
//         avatarEditor02: {
//             scale: 1,
//             positionX: 0.5,
//             positionY: 0.5
//         },
//         logoLoading: false,
//         // 听书地址相关变量
//         provinceList: [],
//         cityList: [],
//         districtList: [],
//         streetList: [],
//         markers: [],
//         area: {
//             province: "",
//             provinceId: "",            
//             city: "",
//             cityId: "",
//             district: "",
//             street: ""
//         },
//         mapObj: {},
//         formattedAddress: "",
//         xy: {},
//         provinceId: null,
//         cityId: null,
//         areaId: null,
//         confirmLoading: false
//     };
//     fn_countDown = "";

//     showModal = () => {
//         this.setState({visible: true}, () => {
//             this.getInstitutionTypeList();
//             this.reqwestUploadToken();
//             setTimeout(() => {
//                 this.setState({
//                     mapObj: new window.AMap.Map('add-institution-container', {
//                         resizeEnable: true,
//                         zoom: 16
//                     })
//                 }, () => {
//                     this.getProvinceList();
//                     window.AMap.service('AMap.Geocoder', () => {
//                         const geocoder = new window.AMap.Geocoder({extensions: "all"});
//                         this.state.mapObj.on('click', (e) => {
//                             // 清除已有标记点
//                             this.state.mapObj.remove(this.state.markers);
//                             // 经纬度写入
//                             this.setXY({x: e.lnglat.lng, y: e.lnglat.lat});
//                             // 生成当前标记点
//                             const marker = new window.AMap.Marker({
//                                 map: this.state.mapObj,
//                                 bubble: true
//                             });
//                             marker.setPosition(e.lnglat);
//                             this.state.mapObj.setCenter(marker.getPosition());
//                             this.state.markers.push(marker);
//                             geocoder.getAddress([e.lnglat.lng, e.lnglat.lat], (status, result) => {
//                                 if (status === 'complete' && result.info === 'OK') {
//                                     this.setFormattedAddress(result.regeocode.formattedAddress);
//                                     // 其他地址信息写入
//                                     this.setArea(5, result.regeocode.addressComponent);
//                                 }
//                             });
//                         });
//                     })
//                 })
//             }, 500)
//         });
//     };

//     // 获取听书类型列表
//     getInstitutionTypeList = () => {
//         reqwest({
//             url: '/sys/orgType/list',
//             type: 'json',
//             method: 'get',
//             data: {
//                 status: 1,
//             },
//             headers: {
//                 Authorization: sessionStorage.token
//             },
//             error: (XMLHttpRequest) => {
//                 // const json = {
//                 //     result: 0,
//                 //     data: [
//                 //         {id: 1, name: ""},
//                 //     ]
//                 // };
//             },
//             success: (json) => {
//                 if (json.result === 0) {
//                     const data = [];
//                     // const fnFilter = (para) => {
//                     //     return para.parentId = item.id
//                     // }
//                     json.data.forEach((item) => {
//                         let subData = [];
//                         if (item.list) {
//                             item.list.forEach((subItem) => {
//                                 subData.push({
//                                     key: subItem.parentId + ',' + subItem.id,
//                                     value: subItem.parentId + ',' + subItem.id,
//                                     title: subItem.name,
//                                     parentId: item.id,
//                                 })
//                             })
//                         }                        
//                         data.push({
//                             key: item.id,
//                             value: String(item.id),
//                             title: item.name,
//                             children: subData
//                         })
//                     });
//                     console.log(data);
//                     this.setState({
//                         typeList: data
//                     })
//                 } else {
//                     if (json.code === "901") {
//                         message.error("请先登录");
//                         // 返回登陆页
//                         this.props.toLoginPage();
//                     } else if (json.code === "902") {
//                         message.error("登录信息已过期，请重新登录");
//                         // 返回登陆页
//                         this.props.toLoginPage();
//                     } else {
//                         message.error(json.message);
//                     }
//                 }
//             }
//         });
//     };

//     // 根据输入听书名字模糊查找听书列表
//     handleSearch = (value) => {
//         console.log(value);
//         reqwest({
//             url: '/admin/org/list',
//             type: 'json',
//             method: 'get',
//             data: {
//                 orgName: value,
//                 status: 2,
//             },
//             headers: {
//                 Authorization: sessionStorage.token
//             },
//             error: (XMLHttpRequest) => {},
//             success: (json) => {
//                 if (json.result === 0) {
//                     console.log(json.data.list)
//                     const data = [];
//                     if (json.data.list.length) {
//                         json.data.list.forEach((item, index) => {
//                             data.push({
//                                 id: item.id,
//                                 name: item.name,
//                             })
//                         });
//                     }
//                     this.setState({
//                         allTypeList: data
//                     });
//                     // if (currentValue === value) {
//                     //     const result = d.result;
//                     //     const data = [];
//                     //     result.forEach(r => {
//                     //         data.push({
//                     //             value: r[0],
//                     //             text: r[0]
//                     //         });
//                     //     });
//                     //     callback(data);
//                     // }
//                 } else {
//                     if (json.code === "901") {
//                         message.error("请先登录");
//                         // 返回登陆页
//                         this.props.toLoginPage();
//                     } else if (json.code === "902") {
//                         message.error("登录信息已过期，请重新登录");
//                         // 返回登陆页
//                         this.props.toLoginPage();
//                     } else {
//                         message.error(json.message);
//                     }
//                 }
//             }
//         });
//     };
    
//     // 校验听书类型父级最多选三项
//     checkOrgType = (rule, value, callback) => {
//         console.log(value);
//         // 类型校验
//         // 此处要判断父Id最多选三项,如何筛选
//         const parentIdsTemp = [];
//         const typeIdsTemp = [];
//         value.forEach((item, index) => {
//             let endIndex = item.indexOf(',');
//             let parentId = item.slice(0, endIndex);
//             let id = item.slice(endIndex + 1);
//             parentIdsTemp.push(Number(parentId));
//             typeIdsTemp.push(Number(id));
//         })
//         // 获得选中的所有父id，去重
//         let setParentIds = Array.from(new Set(parentIdsTemp));
//         console.log(setParentIds);
//         console.log(typeIdsTemp);
//         // 父id和子id数组合并
//         const temp = setParentIds.concat(typeIdsTemp);
//         console.log(temp);
//         if (setParentIds.length > 3) {
//             // message.error("听书类型父级最多选三项");
//             callback('听书类型父级最多选三项'); // 校验未通过
//             // return;
//         }
//     };

//     // 听书图片处理-----------------------------------
//     // 初始图片写入
//     setViewPic01 = (para) => {
//         this.setState({
//             viewPic01: para
//         })
//     };
//     // 设置图片缩放比例及偏移量
//     setAvatarEditor01 = (index, value) => {
//         if (index === 1) {
//             this.setState({
//                 avatarEditor01: {
//                     scale: value,
//                     positionX: this.state.avatarEditor01.positionX,
//                     positionY: this.state.avatarEditor01.positionY
//                 }
//             })
//         }
//         if (index === 2) {
//             this.setState({
//                 avatarEditor01: {
//                     scale: this.state.avatarEditor01.scale,
//                     positionX: value,
//                     positionY: this.state.avatarEditor01.positionY
//                 }
//             })
//         }
//         if (index === 3) {
//             this.setState({
//                 avatarEditor01: {
//                     scale: this.state.avatarEditor01.scale,
//                     positionX: this.state.avatarEditor01.positionX,
//                     positionY: value
//                 }
//             })
//         }
//     };

//     // 请求上传凭证，需要后端提供接口
//     reqwestUploadToken = (file) => {
//         reqwest({
//             url: '/sys/upload/getToken',
//             type: 'json',
//             method: 'get',
//             headers: {
//                 Authorization: sessionStorage.token
//             },
//             error: (XMLHttpRequest) => {
//                 message.error("发送失败");
//             },
//             success: (json) => {
//                 if (json.result === 0) {
//                     // sessionStorage.uploadToken = json.data;
//                     this.setState({
//                         uploadToken: json.data,
//                     })
//                 } else {
//                     if (json.code === "901") {
//                         message.error("请先登录");
//                         // 返回登陆页
//                         this.props.toLoginPage();
//                     } else if (json.code === "902") {
//                         message.error("登录信息已过期，请重新登录");
//                         // 返回登陆页
//                         this.props.toLoginPage();
//                     } else {
//                         message.error(json.message);
//                         this.setState({
//                             loading: false
//                         })
//                     }
//                 }
//             }
//         });
//     };

//     // 图片上传
//     picUpload01 = (para) => {
//         const _this = this;
//         if (this.state.photoList01.length >= 5) {
//             message.error("图片最多上传5张");
//             return
//         } else {
//             this.setState({
//                 photoLoading: true,
//             });
//             const file = para;
//             const key = UUID.create().toString().replace(/-/g,"");
//             const token = this.state.uploadToken;
//             const config = {
//                 region: qiniu.region.z0
//             };
//             const observer = {
//                 next (res) {
//                     console.log(res)
//                 },
//                 error (err) {
//                     console.log(err)
//                     message.error(err.message ? err.message : "图片提交失败");
//                     // message.error("图片提交失败");
//                     _this.setState({
//                         photoLoading: false,
//                     })
//                 }, 
//                 complete (res) {
//                     console.log(res);
//                     message.success("图片提交成功");
//                     let photoList01 = _this.state.photoList01;   
//                     let photoList11 = _this.state.photoList11;                  
//                     photoList01.push({
//                         path: global.config.photoUrl + res.key
//                     });
//                     photoList11.push({
//                         path: res.key
//                     });
//                     _this.setState({
//                         photoList01: photoList01,
//                         photoList11: photoList11,
//                         viewPic01: "",
//                         avatarEditor01: {
//                             scale: 1,
//                             positionX: 0.5,
//                             positionY: 0.5
//                         },
//                         photoLoading: false,
//                     })
//                 }
//             }
//             const observable = qiniu.upload(file, key, token, config);
//             observable.subscribe(observer); // 上传开始
//         }        
//     };
//     // 图片删除
//     setPhotoList01 = (index) => {
//         let data = this.state.photoList01;
//         data.splice(index, 1);
//         this.setState({
//             photoList01: data
//         })
//     };

//     // 听书地址处理-----------------------------------
//     setArea = (type, value) => {
//         if (type === 1) {
//             const fnFilter = (item) => {
//                 return item.name === value
//             };
//             this.setState({
//                 area: {
//                     province: value,
//                     city: "",
//                     district: "",
//                     street: ""
//                 }
//             }, () => {
//                 this.setState({
//                     cityList: this.state.provinceList.filter(fnFilter)[0] ? this.state.provinceList.filter(fnFilter)[0].districtList : [],
//                     provinceId: this.state.provinceList.filter(fnFilter)[0] ? this.state.provinceList.filter(fnFilter)[0].adcode : null,
//                     districtList: [],
//                     streetList: []
//                 })
//             })
//         }
//         if (type === 2) {
//             const fnFilter = (item) => {
//                 return item.name === value
//             };
//             this.setState({
//                 area: {
//                     province: this.state.area.province,
//                     city: value,
//                     district: "",
//                     street: ""
//                 },
//             }, () => {
//                 this.setState({
//                     districtList: this.state.cityList.filter(fnFilter)[0] ? this.state.cityList.filter(fnFilter)[0].districtList : [],
//                     cityId: this.state.cityList.filter(fnFilter)[0] ? this.state.cityList.filter(fnFilter)[0].adcode : null,
//                     streetList: []
//                 })
//             })
//         }
//         if (type === 3) {
//             const fnFilter = (item) => {
//                 return item.name === value
//             };
//             this.setState({
//                 area: {
//                     province: this.state.area.province,
//                     city: this.state.area.city,
//                     district: value,
//                     street: ""
//                 },
//             }, () => {
//                 this.setState({
//                     streetList: [],
//                     areaId: this.state.districtList.filter(fnFilter)[0] ? this.state.districtList.filter(fnFilter)[0].adcode : null
//                 }, () => {
//                     if (this.state.areaId) {
//                         this.getStreetList();
//                     }
//                 })
//             })
//         }
//         if (type === 4) {
//             this.setState({
//                 area: {
//                     province: this.state.area.province,
//                     city: this.state.area.city,
//                     district: this.state.area.district,
//                     street: value
//                 },
//             })
//         }
//         if (type === 5) {
//             // 获取城市列表
//             const provinceFilter = (item) => {
//                 return item.name === value.province;
//             };
//             this.setState({
//                 cityList: this.state.provinceList.filter(provinceFilter)[0] ? this.state.provinceList.filter(provinceFilter)[0].districtList : [],
//             }, () => {
//                 // 获取地区列表
//                 // 城市列表只有一条信息，如直辖市，导致value.city为空，则取城市列表第一条作为有效信息
//                 if (this.state.cityList.length === 1) {
//                     value.city = this.state.cityList[0].name;
//                 }
//                 const cityFilter = (item) => {
//                     return item.name === value.city;
//                 };
//                 this.setState({
//                     districtList: this.state.cityList.filter(cityFilter)[0] ? this.state.cityList.filter(cityFilter)[0].districtList : [],
//                 }, () => {
//                     // 根据区ID获取街道列表
//                     this.state.mapObj.plugin('AMap.DistrictSearch', () => {
//                         let districtSearch = new window.AMap.DistrictSearch({
//                             level: 'district',
//                             subdistrict: 1
//                         });
//                         districtSearch.search(value.adcode, (status, result) => {
//                             this.setState({
//                                 streetList: result.districtList[0].districtList || [],
//                             }, () => {
//                                 // 地址信息获取完全之后进行写入
//                                 this.setState({
//                                     areaId: value.adcode,
//                                     area: {
//                                         province: value.province,
//                                         city: value.city,
//                                         district: value.district,
//                                         street: value.township
//                                     },
//                                 })
//                             })
//                         })
//                     })
//                 })
//             });
//         }
//     };
//     getProvinceList = () => {
//         this.state.mapObj.plugin('AMap.DistrictSearch', () => {
//             var districtSearch = new window.AMap.DistrictSearch({
//                 level: 'country',
//                 subdistrict: 3
//             });

//             districtSearch.search('中国', (status, result) => {
//                 this.setState({
//                     provinceList: result.districtList[0].districtList
//                 })
//             })
//         })
//     };
//     getStreetList = () => {
//         this.state.mapObj.plugin('AMap.DistrictSearch', () => {
//             var districtSearch = new window.AMap.DistrictSearch({
//                 level: 'district',
//                 subdistrict: 1
//             });
//             districtSearch.search(this.state.areaId, (status, result) => {
//                 this.setState({
//                     streetList: result.districtList[0].districtList || [],
//                 })
//             })
//         })
//     };
//     setXY = (para) => {
//         this.setState({
//             xy: para
//         })
//     };
//     setFormattedAddress = (para) => {
//         console.log(para)
//         this.setState({
//             formattedAddress: para
//         })
//     };
//     setMarkers = (marker) => {
//         const arr = [];
//         arr.push(marker);
//         this.setState({
//             markers: arr
//         })
//     };

//     handleCancel = () => {
//         const form = this.form;
//         const cancel = () => {
//             this.setState({
//                 visible: false
//             }, () => {
//                 this.setState({
//                     typeList: [],
//                     phone: "",
//                     countDown: 0,
//                     codeButtonStatus: false,
//                     viewPic01: "",
//                     photoList01: [],
//                     photoList11: [],
//                     avatarEditor01: {
//                         scale: 1,
//                         positionX: 0.5,
//                         positionY: 0.5
//                     },
//                     photoLoading: false,
//                     viewPic02: "",
//                     effectPic02: "",
//                     data_pic02: "",
//                     data_pic22: "",
//                     avatarEditor02: {
//                         scale: 1,
//                         positionX: 0.5,
//                         positionY: 0.5
//                     },
//                     logoLoading: false,
//                     provinceList: [],
//                     cityList: [],
//                     districtList: [],
//                     streetList: [],
//                     markers: [],
//                     area: {
//                         province: "",
//                         city: "",
//                         district: "",
//                         street: ""
//                     },
//                     mapObj: {},
//                     formattedAddress: "",
//                     xy: {},
//                     provinceId: null,
//                     cityId: null,
//                     areaId: null,
//                     confirmLoading: false
//                 });
//                 form.resetFields();
//             })
//         };
//         const data = form.getFieldsValue();
//         let flag = false;
//         for (let x in data) {
//             if (data[x]) {
//                 flag = true
//             }
//         }
//         if (flag) {
//             confirm({
//                 title: '已添加信息未保存，确认放弃添加？',
//                 content: "",
//                 okText: '确认',
//                 okType: 'danger',
//                 cancelText: '取消',
//                 onOk() {
//                     cancel();
//                 },
//                 onCancel() {
//                 }
//             });
//         } else {
//             cancel()
//         }
//     };

//     handleCreate = () => {
//         const form = this.form;
//         form.validateFieldsAndScroll((err, values) => {
//             if (err) {
//                 return;
//             }
//             // 类型校验
//             // 此处要判断父Id最多选三项,如何筛选
//             console.log(values.typeIds);
//             const typeIdsTemp = [];
//             const typeIdsTem = [];
//             values.typeIds.forEach((item, index) => {
//                 let endIndex = item.indexOf(',');
//                 let parentId = item.slice(0,endIndex);
//                 let id = item.slice(endIndex + 1);
//                 typeIdsTemp.push(Number(parentId));
//                 typeIdsTem.push(Number(id));
//             })
//             let setTypeIds = Array.from(new Set(typeIdsTemp));
//             console.log(setTypeIds);
//             console.log(typeIdsTem);
//             const temp = setTypeIds.concat(typeIdsTem);
//             console.log(temp);
//             if (setTypeIds.length > 3) {
//                 message.error("听书类型最多选三项");
//                 return;
//             }
//             // values.typeId = values.typeIds[0];
//             // values.typeIdTwo = values.typeIds[1] || 0;
//             // values.typeIdThree = values.typeIds[2] || 0;
//             // 听书图片校验
//             // values.photo = this.state.photoList01[0] || 0;
//             // values.photo2 = this.state.photoList01[1] || 0;
//             // values.photo3 = this.state.photoList01[2] || 0;
//             // values.photo4 = this.state.photoList01[3] || 0;
//             // values.photo5 = this.state.photoList01[4] || 0;
//             if (!values.photos) {
//                 message.error("听书图片未提交");
//                 return
//             }
//             // 听书logo校验
//             if (!this.state.data_pic02) {
//                 message.error("LOGO未提交");
//                 return
//             }
//             values.icon = this.state.data_pic02;
//             if (!this.state.area.street) {
//                 message.error("请选择听书所在省、市、区及街道");
//                 return
//             }
//             // 需要特色标签转成json字符串
//             let labelAll = [];
//             if (values.label_01) {
//                 labelAll.push(values.label_01);
//             }
//             if (values.label_02) {
//                 labelAll.push(values.label_02);
//             }
//             if (values.label_03) {
//                 labelAll.push(values.label_03);
//             }
//             if (values.label_04) {
//                 labelAll.push(values.label_04);
//             }
//             if (values.label_05) {
//                 labelAll.push(values.label_05);
//             }
//             if (values.label_06) {
//                 labelAll.push(values.label_06);
//             }
//             this.setState({
//                 confirmLoading: true
//             });
//             console.log(this.state.photoList01);
//             const photoTemp = [];
//             if (this.state.photoList01.length) {
//                 this.state.photoList11.forEach((item, index) => {
//                     photoTemp.push(item.path);
//                 })
//             }
//             console.log(values.parentId)
           
//             reqwest({
//                 url: '/sys/listenBook/save',
//                 type: 'json',
//                 method: 'post',
//                 headers: {
//                     Authorization: sessionStorage.token
//                 },
//                 data: {
//                     name: values.name,
//                     type: temp,
//                     duration: values.duration,
//                     linkAddress: values.linkAddress,
//                     originalPrice: values.originalPrice,
//                     price: values.price,
//                     photo: values.photo,
//                     summary: values.summary,
                   
//                     provinceName: this.state.area.province,
//                     provinceId: this.state.provinceId,
//                     cityId: this.state.cityId,
//                     cityName: this.state.area.city,
//                 },
//                 error: (XMLHttpRequest) => {
//                     message.error("保存失败");
//                     this.setState({
//                         confirmLoading: false
//                     })
//                 },
//                 success: (json) => {
//                     if (json.result === 0) {
//                         message.success("听书添加成功");
//                         this.setState({
//                             visible: false
//                         }, () => {
//                             this.setState({
//                                 typeList: [],
//                                 phone: "",
//                                 countDown: 0,
//                                 codeButtonStatus: false,
//                                 viewPic01: "",
//                                 photoList01: [],
//                                 avatarEditor01: {
//                                     scale: 1,
//                                     positionX: 0.5,
//                                     positionY: 0.5
//                                 },
//                                 photoLoading: false,
//                                 viewPic02: "",
//                                 effectPic02: "",
//                                 data_pic02: "",
//                                 avatarEditor02: {
//                                     scale: 1,
//                                     positionX: 0.5,
//                                     positionY: 0.5
//                                 },
//                                 logoLoading: false,
//                                 provinceList: [],
//                                 cityList: [],
//                                 districtList: [],
//                                 streetList: [],
//                                 markers: [],
//                                 area: {
//                                     province: "",
//                                     city: "",
//                                     district: "",
//                                     street: ""
//                                 },
//                                 mapObj: {},
//                                 formattedAddress: "",
//                                 xy: {},
//                                 areaId: null,
//                                 confirmLoading: false
//                             });
//                             form.resetFields();
//                         });
//                     } else {
//                         if (json.code === "901") {
//                             message.error("请先登录");
//                             this.props.toLoginPage();
//                         } else if (json.code === "902") {
//                             message.error("登录信息已过期，请重新登录");
//                             this.props.toLoginPage();
//                         } else {
//                             message.error(json.message);
//                             this.setState({
//                                 confirmLoading: false
//                             })
//                         }
//                     }
//                 }
//             });
//         });
//     };

//     saveFormRef = (form) => {
//         this.form = form;
//     };

//     render() {
//         return (
//             <div>
//             {/*<div style={{display: this.props.opStatus ? "block" : "none"}}>*/}
//                 <Button type="primary" onClick={this.showModal}>添加听书</Button>
//                 <ItemAddForm
//                     ref={this.saveFormRef}
//                     visible={this.state.visible}
//                     onCancel={this.handleCancel}
//                     onCreate={this.handleCreate}
//                     allTypeList={this.state.allTypeList}
//                     typeList={this.state.typeList}
//                     handleSearch={this.handleSearch}
//                     checkOrgType={this.checkOrgType}

//                     viewPic01={this.state.viewPic01}
//                     setViewPic01={this.setViewPic01}
//                     picUpload01={this.picUpload01}
//                     avatarEditor01={this.state.avatarEditor01}
//                     setAvatarEditor01={this.setAvatarEditor01}
//                     photoList01={this.state.photoList01}
//                     setPhotoList01={this.setPhotoList01}
//                     photoLoading={this.state.photoLoading}
                    
//                     getUploadToken={this.getUploadToken}
//                     reqwestUploadToken={this.reqwestUploadToken}
//                     logoLoading={this.state.logoLoading}
//                     provinceList={this.state.provinceList}
//                     cityList={this.state.cityList}
//                     districtList={this.state.districtList}
//                     streetList={this.state.streetList}
//                     markers={this.state.markers}
//                     setMarkers={this.setMarkers}
//                     area={this.state.area}
//                     setArea={this.setArea}
//                     mapObj={this.state.mapObj}
//                     formattedAddress={this.state.formattedAddress}
//                     setFormattedAddress={this.setFormattedAddress}
//                     setXY={this.setXY}
//                     confirmLoading={this.state.confirmLoading}
//                 />
//             </div>
//         );
//     }
// }

// //听书信息编辑表单
// const ItemEditForm = Form.create()(
//     (props) => {
//         const {visible, onCancel, onCreate, form, data, allTypeList, viewPic01, setViewPic01, picUpload01, avatarEditor01, setAvatarEditor01, photoList01, setPhotoList01, photoLoading, provinceList, cityList, districtList, streetList, markers, setMarkers, area, setArea, mapObj, setXY, setFormattedAddress, formattedAddress, confirmLoading} = props;
//         const {getFieldDecorator} = form;

//         // 总听书选项生成
//         const optionsOfAllTypeList = [];
//         if (allTypeList) {
//             allTypeList.forEach((item, index) => {
//                 optionsOfAllTypeList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
//             });
//         }  

//         // 已上传图片列表
//         const photoExist01 = [];
//         photoList01.forEach((item, index) => {
//             photoExist01.push(
//                 <div className="photoExist-item clearfix" key={index + 1}>
//                     <img src={item.path} alt=""/>
//                     <div className="remove">
//                         <Button type="dashed"
//                                 shape="circle" icon="minus" onClick={() => setPhotoList01(index)}/>
//                     </div>
//                 </div>
//             )
//         });

//         // 由图片文件对象获取其base64编码
//         const getBase64 = (img, callback) => {
//             const reader = new FileReader();
//             reader.addEventListener('load', () => callback(reader.result));
//             reader.readAsDataURL(img);
//         };
//         // 由图片地址获取其文件对象
//         const dataURLtoFile = (url) => {
//             let arr = url.split(','),
//                 bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
//             while (n--) {
//                 u8arr[n] = bstr.charCodeAt(n)
//             }
//             return new Blob([u8arr], {type: "image/jpeg"});
//         };

//         // 听书图片相关
//         const setEditorRef01 = (editor) => this.editor01 = editor;
//         const beforeUpload01 = (file) => {
//             const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
//             if (!isIMG) {
//                 message.error('文件类型错误');
//                 return false
//             }
//             const isLt2M = file.size / 1024 / 1024 < 2;
//             if (!isLt2M) {
//                 message.error('文件不能大于2M');
//                 return false
//             }
//             getBase64(file, (imageUrl) => {
//                 setViewPic01(imageUrl);
//             });
//             return false
//         };
//         const uploadButton01 = (
//             <div>
//                 <Icon type={'plus'}/>
//                 <div className="ant-upload-text" style={{display: viewPic01 ? "none" : "block"}}>选择图片</div>
//             </div>
//         );
//         const picHandle01 = () => {
//             if (viewPic01) {
//                 const canvas = this.editor01.getImage();
//                 const url = canvas.toDataURL("image/jpeg", 0.92);
//                 const file = dataURLtoFile(url);
//                 picUpload01(file)
//             } else {
//                 message.error("图片未选择");
//             }
//         };
//         const partImg01 = (
//             <AvatarEditor
//                 ref={setEditorRef01}
//                 image={viewPic01}
//                 width={180}
//                 height={100}
//                 border={0}
//                 color={[255, 255, 255, 0.6]}
//                 scale={avatarEditor01.scale}
//                 position={{x: avatarEditor01.positionX, y: avatarEditor01.positionY}}
//                 rotate={0}
//             />
//         );

//         // 听书地址相关
//         const provinceOptions = provinceList.map(item => <Option key={item.name}>{item.name}</Option>);
//         const cityOptions = cityList.map(item => <Option key={item.name}>{item.name}</Option>);
//         /*const districtOptions = districtList.map(item => <Option key={item.name}>{item.name}</Option>);
//         const streetOptions = streetList.map(item => <Option key={item.name}>{item.name}</Option>);
//         const addressChange = (value) => {
//             if (!value) {
//                 return
//             }
//             let keyword = "";
//             keyword = keyword + area.province + area.city + area.district + area.street;
//             keyword = keyword + value;
//             // 清除已有标记点
//             mapObj.remove(markers);
//             mapObj.plugin('AMap.Geocoder', function () {
//                 const geocoder = new window.AMap.Geocoder({});
//                 const marker = new window.AMap.Marker({
//                     map: mapObj,
//                     bubble: true
//                 });
//                 geocoder.getLocation(keyword, (status_, result_) => {
//                     if (status_ === 'complete' && result_.info === 'OK') {
//                         geocoder.getAddress([result_.geocodes[0].location.lng, result_.geocodes[0].location.lat], (status, result) => {
//                             if (status === 'complete' && result.info === 'OK') {
//                                 // 经纬度写入
//                                 setXY({x: result_.geocodes[0].location.lng, y: result_.geocodes[0].location.lat});
//                                 // 生成当前标记点
//                                 marker.setPosition(result_.geocodes[0].location);
//                                 mapObj.setCenter(marker.getPosition());
//                                 setMarkers(marker);
//                                 // address字段写入
//                                 setFormattedAddress(area.street ? keyword : result.regeocode.addressComponent.province + result.regeocode.addressComponent.city + result.regeocode.addressComponent.district + result.regeocode.addressComponent.township + keyword);
//                                 // 其他地址信息写入
//                                 setArea(5, result.regeocode.addressComponent);
//                             }
//                         });
//                     }
//                 });
//             });
//         };*/

//         return (
//             <Modal
//                 visible={visible}
//                 title="听书编辑"
//                 width={1000}
//                 onCancel={onCancel}
//                 onOk={onCreate}
//                 destroyOnClose={true}
//                 confirmLoading={confirmLoading}
//             >
//                 {
//                     JSON.stringify(data) === "{}" ?
//                         <div className="spin-box">
//                             <Spin/>
//                         </div>
//                         :
//                         <div className="institution-edit institution-form item-form">
//                             <Form layout="vertical">
//                                 <Row gutter={24}>
//                                     <Col span={8}>
//                                         <FormItem className="area longItem" label="展示城市：">
//                                             {getFieldDecorator('area', {
//                                                 rules: [{
//                                                     required: false
//                                                 }],
//                                             })(
//                                                 <div>
//                                                     <Select placeholder="省" style={{width: "45%", marginRight: 10}}
//                                                             value={area.province || undefined} onChange={(value) => {
//                                                         setArea(1, value)
//                                                     }} dropdownMatchSelectWidth={false} allowClear={true}>
//                                                         {provinceOptions}
//                                                     </Select>
//                                                     <Select placeholder="市" style={{width: "45%", marginRight: 10}}
//                                                             value={area.city || undefined} onChange={(value) => {
//                                                         setArea(2, value)
//                                                     }} dropdownMatchSelectWidth={false} allowClear={true}>
//                                                         {cityOptions}
//                                                     </Select>                                                    
//                                                 </div>
//                                             )}
//                                         </FormItem>
//                                     </Col>
//                                     <Col span={8}>
//                                         <FormItem className="advPositionIds" label="听书位置：">
//                                             {getFieldDecorator('advPositionIds', {
//                                                 // initialValue: data.advPositionIds,
//                                                 rules: [
//                                                     {
//                                                         required: true,
//                                                         message: '听书位置不能为空',
//                                                     }
//                                                 ],
//                                             })(
//                                                 <Select
//                                                     style={{width: '100%'}}
//                                                     placeholder="请选择听书位置"
//                                                 >
//                                                     {/* {optionsOfTypeList}*/}
//                                                     <Option key={1} value={1}>首页banner听书</Option>
//                                                     <Option key={2} value={2}>育儿栏目banner听书</Option>
//                                                     <Option key={3} value={3}>首页banner听书1</Option>
//                                                     <Option key={4} value={4}>首页banner听书2</Option>
//                                                 </Select>
//                                             )}
//                                         </FormItem>
//                                     </Col>
//                                     {/*<Col span={8}>
//                                         <FormItem className="parentId" label="父级：">
//                                             {getFieldDecorator('parentId', {
//                                                 initialValue: data.parentId,
//                                                 rules: [{
//                                                     required: false,
//                                                     message: '请选择总听书',
//                                                 }],
//                                             })(
//                                                 <Select
//                                                     showSearch
//                                                     style={{width: '100%'}}
//                                                     placeholder="请选择总听书"
//                                                     onSearch={handleSearch}
//                                                     onChange={handleChange}                        
//                                                     filterOption={false}
//                                                     notFoundContent={null}                                
//                                                 >
//                                                     {optionsOfAllTypeList}
//                                                 </Select>  
//                                             )}
//                                         </FormItem>
//                                     </Col>*/}
//                                 </Row>                             
//                                 <div className="ant-line"></div>
//                                 <Row gutter={24}>
//                                     <Col span={8}>
//                                         <FormItem className="photo photos" label="听书图片：">
//                                             {getFieldDecorator('photos', {
//                                                 initialValue: photoList01[0],
//                                                 rules: [{
//                                                     required: true,
//                                                     message: '听书图片不能为空',
//                                                 }],
//                                             })(
//                                                 <div className="itemBox">
//                                                     {photoExist01}
//                                                     <Upload
//                                                         name="file"
//                                                         listType="picture-card"
//                                                         className="avatar-uploader"
//                                                         showUploadList={false}
//                                                         // action="/file/upload"
//                                                         beforeUpload={beforeUpload01}
//                                                     >
//                                                         {viewPic01 ? partImg01 : uploadButton01}
//                                                         <p className="hint">（可上传1-5张图片）</p>
//                                                     </Upload>
//                                                     <Row>
//                                                         <Col span={4}>缩放：</Col>
//                                                         <Col span={12}>
//                                                             <Slider min={1} max={1.5} step={0.01} value={avatarEditor01.scale}
//                                                                     disabled={!viewPic01}
//                                                                     onChange={(value) => {
//                                                                         setAvatarEditor01(1, value)
//                                                                     }}/>
//                                                         </Col>
//                                                     </Row>
//                                                     <Row>
//                                                         <Col span={4}>X：</Col>
//                                                         <Col span={12}>
//                                                             <Slider min={0} max={1} step={0.01} value={avatarEditor01.positionX}
//                                                                     disabled={!viewPic01}
//                                                                     onChange={(value) => {
//                                                                         setAvatarEditor01(2, value)
//                                                                     }}/>
//                                                         </Col>
//                                                     </Row>
//                                                     <Row>
//                                                         <Col span={4}>Y：</Col>
//                                                         <Col span={12}>
//                                                             <Slider min={0} max={1} step={0.01} value={avatarEditor01.positionY}
//                                                                     disabled={!viewPic01}
//                                                                     onChange={(value) => {
//                                                                         setAvatarEditor01(3, value)
//                                                                     }}/>
//                                                         </Col>
//                                                     </Row>
//                                                     <Button type="primary"
//                                                             onClick={picHandle01}
//                                                             loading={photoLoading}
//                                                             style={{
//                                                                 position: "absolute",
//                                                                 right: "-20px",
//                                                                 bottom: "0"
//                                                             }}>
//                                                         图片提交
//                                                     </Button>
//                                                 </div>
//                                             )}
//                                         </FormItem>
//                                     </Col>
//                                 </Row>
                                
//                                 <div className="ant-line"></div>
//                                 <Row gutter={24}>
//                                     <Col span={8}>
//                                         <FormItem className="companyName" label="图片描述：">
//                                             {getFieldDecorator('companyName', {
//                                                 initialValue: data.companyName,
//                                                 rules: [
//                                                     {
//                                                         required: true,
//                                                         message: '图片描述不能为空',
//                                                     },
//                                                     {
//                                                         min: 12,
//                                                         message: '图片描述至少6个字'
//                                                     },
//                                                     {
//                                                         max: 84,
//                                                         message: '图片描述不能超过84个字符'
//                                                     }
//                                                 ]
//                                             })(
//                                                 <Input placeholder="请输入图片描述(6-42字)"/>
//                                             )}
//                                         </FormItem>
//                                     </Col>
//                                     <Col span={8}>
//                                         <FormItem className="licenseNumber" label="跳转链接：">
//                                             {getFieldDecorator('licenseNumber', {
//                                                 initialValue: data.licenseNumber,
//                                                 rules: [{
//                                                     required: false,
//                                                 }],
//                                             })(
//                                                 <Input placeholder="请输入图片跳转链接"/>
//                                             )}
//                                         </FormItem>
//                                     </Col>
//                                 </Row>
//                                 <div className="ant-line"></div>             
//                             </Form>
//                         </div>
//                 }
//             </Modal>
//         );
//     }
// );

// //听书编辑组件
// class ItemEdit extends Component {
//     state = {
//         visible: false,
//         // 听书基本信息
//         data: {},
//         allTypeList: [],
//         // 听书类型表
//         typeList: [],
//         // 听书图片相关变量
//         uploadToken: "",
//         viewPic01: "",
//         photoList01: [],
//         photoList11: [],
//         avatarEditor01: {
//             scale: 1,
//             positionX: 0.5,
//             positionY: 0.5
//         },
//         photoLoading: false,
//         // 听书LOGO相关变量
//         viewPic02: "",
//         data_pic02: "",
//         data_pic22: "",
//         effectPic02: "",
//         avatarEditor02: {
//             scale: 1,
//             positionX: 0.5,
//             positionY: 0.5
//         },
//         logoLoading: false,
//         // 听书地址相关变量
//         provinceList: [],
//         cityList: [],
//         districtList: [],
//         streetList: [],
//         markers: [],
//         area: {
//             province: "",
//             city: "",
//             district: "",
//             street: ""
//         },
//         mapObj: {},
//         formattedAddress: "",
//         xy: {},
//         provinceId: null,
//         cityId: null,
//         areaId: null,
//         addressLoading: true,
//         // 提交按钮状态变量
//         confirmLoading: false,
//         tempTypeIds: [],
//     };

//     // 获取听书类型列表
//     getInstitutionTypeList = () => {
//         reqwest({
//             url: '/sys/orgType/list',            
//             type: 'json',
//             method: 'get',
//             data: {
//                 status: 1
//             },
//             headers: {
//                 Authorization: sessionStorage.token
//             },
//             error: (XMLHttpRequest) => {
//                 // const json = {
//                 //     result: 0,
//                 //     data: [
//                 //         {id: 1, name: "01"},
//                 //         {id: 2, name: "02"},
//                 //         {id: 3, name: "03"},
//                 //         {id: 4, name: "04"},
//                 //     ]
//                 // };
//             },
//             success: (json) => {
//                 if (json.result === 0) {
//                     const data = [];
//                     json.data.forEach((item) => {
//                         let subData = [];
//                         if (item.list) {
//                             item.list.forEach((subItem) => {
//                                 subData.push({
//                                     key: subItem.id,
//                                     value: subItem.parentId + ',' + subItem.id,
//                                     // value: String(subItem.id),
//                                     title: subItem.name,
//                                     parentId: item.id,
//                                 })
//                             })
//                         }                        
//                         data.push({
//                             key: item.id,
//                             value: String(item.id),
//                             title: item.name,
//                             children: subData,
//                         })
//                     });
//                     console.log(data)
//                     this.setState({
//                         typeList: data
//                     });
//                 } else {
//                     if (json.code === "901") {
//                         message.error("请先登录");
//                         // 返回登陆页
//                         this.props.toLoginPage();
//                     } else if (json.code === "902") {
//                         message.error("登录信息已过期，请重新登录");
//                         // 返回登陆页
//                         this.props.toLoginPage();
//                     } else {
//                         message.error(json.message);
//                     }
//                 }
//             }
//         })
//     };

//     // 校验听书类型父级最多选三项
//     checkOrgType = (rule, value, callback) => {
//         console.log(value);
//         // 类型校验
//         // 此处要判断父Id最多选三项,如何筛选
//         const parentIdsTemp = [];
//         const typeIdsTemp = [];
//         value.forEach((item, index) => {
//             let endIndex = item.indexOf(',');
//             let parentId = item.slice(0, endIndex);
//             let id = item.slice(endIndex + 1);
//             parentIdsTemp.push(Number(parentId));
//             typeIdsTemp.push(Number(id));
//         })
//         // 获得选中的所有父id，去重
//         let setParentIds = Array.from(new Set(parentIdsTemp));
//         console.log(setParentIds);
//         console.log(typeIdsTemp);
//         // 父id和子id数组合并
//         const temp = setParentIds.concat(typeIdsTemp);
//         console.log(temp);
//         if (setParentIds.length > 3) {
//             // message.error("听书类型父级最多选三项");
//             callback('听书类型父级最多选三项'); // 校验未通过
//             return;
//         }
//     };

//     onChange = (value) => {
//         console.log('onChange ', value);
//         this.setState({ 
//             tempTypeIds: value
//         });
//     };

//     // 获取听书基本信息
//     getData = () => {
//         reqwest({
//             url: '/admin/org/getDetails',
//             type: 'json',
//             method: 'get',
//             data: {
//                 id: this.props.id
//             },
//             headers: {
//                 Authorization: sessionStorage.token
//             },
//             error: (XMLHttpRequest) => {
//                 // const json = {
//                 //     result: 0,
//                 //     data: {
//                 //         institution: {
//                 //             address: "浙江省杭州市余杭区仓前街道余杭四无粮仓陈列馆",
//                 //             areaId: 330110,
//                 //             areaName: "余杭区",
//                 //             balance: "",
//                 //             cityId: 330100,
//                 //             cityName: "杭州市",
//                 //             companyName: "",
//                 //             createTime: "",
//                 //             // description: "\n" + "\n" + "",
//                 //             detailedAddress: "余杭四无粮仓陈列馆",
//                 //             id: 1,
//                 //             lat: "30.291940",
//                 //             licenseNumber: "",
//                 //             lng: "120.007284",
//                 //             managerName: "",
//                 //             managerPhone: "",
//                 //             name: "",
//                 //             number: null,
//                 //             photo: "1",
//                 //             photo2: "",
//                 //             photo3: "",
//                 //             photo4: "",
//                 //             photo5: "",
//                 //             icon: "",
//                 //             fees: "",
//                 //             provinceId: 330000,
//                 //             provinceName: "浙江省",
//                 //             star: null,
//                 //             status: null,
//                 //             street: "仓前街道",
//                 //             telephone: "",
//                 //             typeId: 2,
//                 //             typeName: "",
//                 //             typeIdTwo: 3,
//                 //             updateTime: ""
//                 //         }
//                 //     }
//                 // };
//             },
//             success: (json) => {
//                 if (json.result === 0) {
//                     // 已有听书类型写入
//                     // const typeIds = [];
//                     // if (json.data.institution.typeId) {
//                     //     typeIds.push(json.data.institution.typeId)
//                     // }
//                     // if (json.data.institution.typeIdTwo) {
//                     //     typeIds.push(json.data.institution.typeIdTwo)
//                     // }
//                     // if (json.data.institution.typeIdThree) {
//                     //     typeIds.push(json.data.institution.typeIdThree)
//                     // }
//                     // json.data.institution.typeIds = typeIds;
//                     // json.data.institution.typeIdTwo = json.data.institution.typeIdTwo ? json.data.institution.typeIdTwo : 0;
//                     // json.data.institution.typeIdThree = json.data.institution.typeIdThree ? json.data.institution.typeIdThree : 0;
//                     // 已有听书图片写入
//                     // const photoList01 = [];
//                     // const orgResourceList = json.data.orgResourceList;
//                     // if (json.data.institution.photo && json.data.institution.photo !== "0") {
//                     //     photoList01.push(json.data.institution.photo)
//                     // } else {
//                     //     json.data.institution.photo = 0;
//                     // }
//                     // if (json.data.institution.photo2 && json.data.institution.photo2 !== "0") {
//                     //     photoList01.push(json.data.institution.photo2)
//                     // } else {
//                     //     json.data.institution.photo2 = 0;
//                     // }
//                     // if (json.data.institution.photo3 && json.data.institution.photo3 !== "0") {
//                     //     photoList01.push(json.data.institution.photo3)
//                     // } else {
//                     //     json.data.institution.photo3 = 0
//                     // }
//                     // if (json.data.institution.photo4 && json.data.institution.photo4 !== "0") {
//                     //     photoList01.push(json.data.institution.photo4)
//                     // } else {
//                     //     json.data.institution.photo4 = 0
//                     // }
//                     // if (json.data.institution.photo5 && json.data.institution.photo5 !== "0") {
//                     //     photoList01.push(json.data.institution.photo5)
//                     // } else {
//                     //     json.data.institution.photo5 = 0
//                     // }
//                     // 备注信息写入
//                     // json.data.institution.remark = json.data.remark;
//                     const data = [];
//                     json.data.orgTypeList.forEach((item, index) => {
//                         // if (item.list) {
//                         //     item.list.forEach((subItem) => {
//                         //         subData.push({
//                         //             key: subItem.parentTypeId + ',' + subItem.tyeId,
//                         //             value: subItem.parentTypeId + ',' + subItem.tyeId,
//                         //             title: subItem.typeName,
//                         //             parentId: item.id,
//                         //         })
//                         //     })
//                         // }                    
//                         // data.push({
//                         //     key: item.parentTypeId + ',' + item.typeId,
//                         //     value: item.parentTypeId + ',' + item.typeId,
//                         //     title: item.typeName,
//                         //     // children: subData
//                         // })
//                         data.push(item.parentTypeId + ',' + item.typeId);
//                         // data.push(item.typeId);
//                     });
//                     console.log(data)
//                     json.data.org.typeIds = data;
//                     // json.data.orgTypeList.forEach((item, index) => {
//                     //     data.typeIds.push({
//                     //         typeId: item.typeId,
//                     //         typeName: item.typeName,
//                     //     })
//                     // });
//                     this.setState({
//                         data: json.data.org,
//                         // typeIds: data,
//                         // photoList01: photoList01,
//                         photoList01: json.data.orgResourceList,
//                         viewPic02: json.data.orgResourceList[0] ?  json.data.orgResourceList[0].path : "",
//                         effectPic02: json.data.orgResourceList[1] ? json.data.orgResourceList[1].path : "",
//                         data_pic02: json.data.orgResourceList[2] ? json.data.orgResourceList[2].path : "",
//                         areaId: json.data.org.areaId,
//                         formattedAddress: json.data.org.address,
//                         xy: {
//                             x: json.data.org.lng,
//                             y: json.data.org.lat
//                         }
//                     }, () => {
//                         // 听书地址相关操作
//                         const mapId = "edit-institution-container" + this.props.id;
//                         this.setState({
//                             mapObj: new window.AMap.Map(mapId, {
//                                 resizeEnable: true,
//                                 zoom: 16,
//                                 center: this.state.data.lng ? [this.state.data.lng, this.state.data.lat] : ""
//                             })
//                         }, () => {
//                             this.state.mapObj.on('complete', () => {
//                                 // 获取省份列表
//                                 this.getProvinceList();
//                                 // 生成当前标记点
//                                 const marker = new window.AMap.Marker({
//                                     map: this.state.mapObj,
//                                     bubble: true
//                                 });
//                                 marker.setPosition(this.state.mapObj.G.center);
//                                 this.state.mapObj.setCenter(marker.getPosition());
//                                 this.state.markers.push(marker);
//                                 // 地图点击事件
//                                 window.AMap.service('AMap.Geocoder', () => {
//                                     const geocoder = new window.AMap.Geocoder({extensions: "all"});
//                                     this.state.mapObj.on('click', (e) => {
//                                         // 清除已有标记点
//                                         this.state.mapObj.remove(this.state.markers);
//                                         // 经纬度写入
//                                         this.setXY({x: e.lnglat.lng, y: e.lnglat.lat});
//                                         // 生成当前标记点
//                                         const marker = new window.AMap.Marker({
//                                             map: this.state.mapObj,
//                                             bubble: true
//                                         });
//                                         marker.setPosition(e.lnglat);
//                                         this.state.mapObj.setCenter(marker.getPosition());
//                                         this.state.markers.push(marker);
//                                         geocoder.getAddress([e.lnglat.lng, e.lnglat.lat], (status, result) => {
//                                             if (status === 'complete' && result.info === 'OK') {
//                                                 this.setFormattedAddress(result.regeocode.formattedAddress);
//                                                 // 其他地址信息写入
//                                                 this.setArea(5, result.regeocode.addressComponent);
//                                             }
//                                         });
//                                     });
//                                 })
//                             });
//                         })
//                     })
//                 } else {
//                     if (json.code === "901") {
//                         message.error("请先登录");
//                         // 返回登陆页
//                         this.props.toLoginPage();
//                     } else if (json.code === "902") {
//                         message.error("登录信息已过期，请重新登录");
//                         // 返回登陆页
//                         this.props.toLoginPage();
//                     } else {
//                         message.error(json.message);
//                     }
//                 }
//             }
//         })
//     };

//     showModal = () => {
//         // 获取听书基本信息
//         // this.getData();
//         // 获取听书类型列表
//         this.getInstitutionTypeList();
//         // 获取上传Token
//         this.reqwestUploadToken();
//         this.setState({
//             visible: true,
//         })
//     };

//     handleSearch = (value) => {
//         console.log(value);
//         reqwest({
//             url: '/admin/org/list',
//             type: 'json',
//             method: 'get',
//             data: {
//                 orgName: value,
//                 status: 2,
//             },
//             headers: {
//                 Authorization: sessionStorage.token
//             },
//             error: (XMLHttpRequest) => {},
//             success: (json) => {
//                 if (json.result === 0) {
//                     console.log(json.data.list)
//                     const data = [];
//                     if (json.data.list.length) {
//                         json.data.list.forEach((item, index) => {
//                             data.push({
//                                 id: item.id,
//                                 name: item.name,
//                             })
//                         });
//                     }
//                     this.setState({
//                         allTypeList: data
//                     });
//                     // if (currentValue === value) {
//                     //     const result = d.result;
//                     //     const data = [];
//                     //     result.forEach(r => {
//                     //         data.push({
//                     //             value: r[0],
//                     //             text: r[0]
//                     //         });
//                     //     });
//                     //     callback(data);
//                     // }
//                 } else {
//                     if (json.code === "901") {
//                         message.error("请先登录");
//                         // 返回登陆页
//                         this.props.toLoginPage();
//                     } else if (json.code === "902") {
//                         message.error("登录信息已过期，请重新登录");
//                         // 返回登陆页
//                         this.props.toLoginPage();
//                     } else {
//                         message.error(json.message);
//                     }
//                 }
//             }
//         });
//     };

//     //图片处理
//     getBase64Image01 = (url, width, height) => {//width、height调用时传入具体像素值，控制大小 ,不传则默认图像大小
//         const image = new Image();
//         image.crossOrigin = '';
//         image.src = url;
//         image.onload = () => {
//             const canvas = document.createElement("canvas");
//             canvas.width = width ? width : image.width;
//             canvas.height = height ? height : image.height;
//             const ctx = canvas.getContext("2d");
//             ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
//             const dataURL = canvas.toDataURL("image/jpeg", 0.92);
//             this.setState({
//                 viewPic01: dataURL,
//                 effectPic01: dataURL,
//             })
//         };
//     };
//     setViewPic01 = (para) => {
//         this.setState({
//             viewPic01: para
//         })
//     };
//     setAvatarEditor01 = (index, value) => {
//         if (this.state.viewPic01.slice(26) === this.state.data_pic01) {
//             this.getBase64Image01(this.state.viewPic01)
//         }
//         if (index === 1) {
//             this.setState({
//                 avatarEditor01: {
//                     scale: value,
//                     positionX: this.state.avatarEditor01.positionX,
//                     positionY: this.state.avatarEditor01.positionY
//                 }
//             })
//         }
//         if (index === 2) {
//             this.setState({
//                 avatarEditor01: {
//                     scale: this.state.avatarEditor01.scale,
//                     positionX: value,
//                     positionY: this.state.avatarEditor01.positionY
//                 }
//             })
//         }
//         if (index === 3) {
//             this.setState({
//                 avatarEditor01: {
//                     scale: this.state.avatarEditor01.scale,
//                     positionX: this.state.avatarEditor01.positionX,
//                     positionY: value
//                 }
//             })
//         }
//     };

//     // 请求上传凭证，需要后端提供接口
//     reqwestUploadToken = (file) => {
//         reqwest({
//             url: '/sys/upload/getToken',
//             type: 'json',
//             method: 'get',
//             headers: {
//                 Authorization: sessionStorage.token
//             },
//             error: (XMLHttpRequest) => {
//                 message.error("发送失败");
//             },
//             success: (json) => {
//                 if (json.result === 0) {
//                     sessionStorage.uploadToken = json.data;
//                     this.setState({
//                         uploadToken: json.data,
//                     })
//                 } else {
//                     if (json.code === "901") {
//                         message.error("请先登录");
//                         // 返回登陆页
//                         this.props.toLoginPage();
//                     } else if (json.code === "902") {
//                         message.error("登录信息已过期，请重新登录");
//                         // 返回登陆页
//                         this.props.toLoginPage();
//                     } else {
//                         message.error(json.message);
//                         this.setState({
//                             loading: false
//                         })
//                     }
//                 }
//             }
//         });
//     };
//     picUpload01 = (para) => {
//         const _this = this;
//         if (this.state.photoList01.length >= 5) {
//             message.error("图片最多上传5张");
//             return
//         } else {
//             this.setState({
//                 photoLoading: true,
//             });
//             const file = para;
//             const key = UUID.create().toString().replace(/-/g,"");
//             const token = this.state.uploadToken;
//             const config = {
//                 region: qiniu.region.z0
//             };
//             const observer = {
//                 next (res) {
//                     console.log(res)
//                 },
//                 error (err) {
//                     console.log(err)
//                     message.error(err.message ? err.message : "图片提交失败");
//                     _this.setState({
//                         photoLoading: false,
//                     })
//                 }, 
//                 complete (res) {
//                     console.log(res);
//                     message.success("图片提交成功");
//                     let photoList01 = _this.state.photoList01; 
//                     let photoList11 = _this.state.photoList11;               
//                     photoList01.push({
//                         path: global.config.photoUrl + res.key
//                     });
//                     photoList11.push({
//                         path: res.key
//                     })
//                     _this.setState({
//                         photoList01: photoList01,
//                         photoList11: photoList11,
//                         viewPic01: "",
//                         avatarEditor01: {
//                             scale: 1,
//                             positionX: 0.5,
//                             positionY: 0.5
//                         },
//                         photoLoading: false,
//                     })
//                 }
//             }
//             const observable = qiniu.upload(file, key, token, config);
//             observable.subscribe(observer); // 上传开始
//         } 
//     };
//     //图片删除
//     setPhotoList01 = (index) => {
//         let data = this.state.photoList01;
//         data.splice(index, 1);
//         this.setState({
//             photoList01: data
//         })
//     };

//     //LOGO处理
//     getBase64Image02 = (url, width, height) => {//width、height调用时传入具体像素值，控制大小 ,不传则默认图像大小
//         const image = new Image();
//         image.crossOrigin = '';
//         image.src = url;
//         image.onload = () => {
//             const canvas = document.createElement("canvas");
//             canvas.width = width ? width : image.width;
//             canvas.height = height ? height : image.height;
//             const ctx = canvas.getContext("2d");
//             // ctx.fillStyle = "#fff";
//             // ctx.fillRect(0, 0, canvas.width, canvas.height);
//             ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
//             // const dataURL = canvas.toDataURL("image/jpeg", 0.92);
//             const dataURL = canvas.toDataURL("png", 0.92);
//             this.setState({
//                 viewPic02: dataURL,
//                 effectPic02: dataURL,
//             })
//         };
//     };
//     setViewPic02 = (para) => {
//         this.setState({
//             viewPic02: para
//         })
//     };
//     setAvatarEditor02 = (index, value) => {
//         if (this.state.viewPic02.slice(26) === this.state.data_pic02) {
//             this.getBase64Image02(this.state.viewPic02)
//         }
//         if (index === 1) {
//             this.setState({
//                 avatarEditor02: {
//                     scale: value,
//                     positionX: this.state.avatarEditor02.positionX,
//                     positionY: this.state.avatarEditor02.positionY
//                 }
//             })
//         }
//         if (index === 2) {
//             this.setState({
//                 avatarEditor02: {
//                     scale: this.state.avatarEditor02.scale,
//                     positionX: value,
//                     positionY: this.state.avatarEditor02.positionY
//                 }
//             })
//         }
//         if (index === 3) {
//             this.setState({
//                 avatarEditor02: {
//                     scale: this.state.avatarEditor02.scale,
//                     positionX: this.state.avatarEditor02.positionX,
//                     positionY: value
//                 }
//             })
//         }
//     };
//     picUpload02 = (para01, para02) => {
//         const _this = this;
//         this.setState({
//             logoLoading: true
//         });
//         const file = para02;
//         const key = UUID.create().toString().replace(/-/g,"");
//         const token = this.state.uploadToken;
//         const config = {
//             region: qiniu.region.z0
//         };
//         const observer = {
//             next (res) {
//                 console.log(res)
//             },
//             error (err) {
//                 console.log(err)
//                 message.error(err.message ? err.message : "图片提交失败");
//                 _this.setState({
//                     logoLoading: false,
//                 })
//             }, 
//             complete (res) {
//                 message.success("图片提交成功");
//                 _this.setState({
//                     effectPic02: para01,
//                     data_pic02: global.config.photoUrl + res.key,
//                     data_pic22: res.key,
//                     logoLoading: false,
//                 })
//             }
//         };
//         const observable = qiniu.upload(file, key, token, config);
//         observable.subscribe(observer); // 上传开始
//     };

//     // 听书地址处理-----------------------------------
//     setArea = (type, value) => {
//         // 省份信息变更
//         if (type === 1) {
//             const fnFilter = (item) => {
//                 return item.name === value
//             };
//             this.setState({
//                 area: {
//                     province: value,
//                     city: "",
//                     district: "",
//                     street: ""
//                 }
//             }, () => {
//                 this.setState({
//                     cityList: this.state.provinceList.filter(fnFilter)[0] ? this.state.provinceList.filter(fnFilter)[0].districtList : [],
//                     provinceId: this.state.provinceList.filter(fnFilter)[0] ? this.state.provinceList.filter(fnFilter)[0].adcode : null,
//                     districtList: [],
//                     streetList: []
//                 })
//             })
//         }
//         // 城市信息变更
//         if (type === 2) {
//             const fnFilter = (item) => {
//                 return item.name === value
//             };
//             this.setState({
//                 area: {
//                     province: this.state.area.province,
//                     city: value,
//                     district: "",
//                     street: ""
//                 },
//             }, () => {
//                 this.setState({
//                     districtList: this.state.cityList.filter(fnFilter)[0] ? this.state.cityList.filter(fnFilter)[0].districtList : [],
//                     cityId: this.state.cityList.filter(fnFilter)[0] ? this.state.cityList.filter(fnFilter)[0].adcode : null,
//                     streetList: []
//                 })
//             })
//         }
//         // 区信息变更
//         if (type === 3) {
//             const fnFilter = (item) => {
//                 return item.name === value
//             };
//             this.setState({
//                 area: {
//                     province: this.state.area.province,
//                     city: this.state.area.city,
//                     district: value,
//                     street: ""
//                 },
//             }, () => {
//                 this.setState({
//                     streetList: [],
//                     areaId: this.state.districtList.filter(fnFilter)[0] ? this.state.districtList.filter(fnFilter)[0].adcode : null
//                 }, () => {
//                     if (this.state.areaId) {
//                         this.getStreetList();
//                     }
//                 })
//             })
//         }
//         // 街道信息变更
//         if (type === 4) {
//             this.setState({
//                 area: {
//                     province: this.state.area.province,
//                     city: this.state.area.city,
//                     district: this.state.area.district,
//                     street: value
//                 },
//             })
//         }
//         // 地址信息整体写入
//         if (type === 5) {
//             // 获取城市列表
//             const provinceFilter = (item) => {
//                 return item.name === value.province;
//             };
//             this.setState({
//                 cityList: this.state.provinceList.filter(provinceFilter)[0] ? this.state.provinceList.filter(provinceFilter)[0].districtList : [],
//             }, () => {
//                 // 获取地区列表
//                 // 城市列表只有一条信息，如直辖市，导致value.city为空，则取城市列表第一条作为有效信息
//                 if (this.state.cityList.length === 1) {
//                     value.city = this.state.cityList[0].name;
//                 }
//                 const cityFilter = (item) => {
//                     return item.name === value.city;
//                 };
//                 this.setState({
//                     districtList: this.state.cityList.filter(cityFilter)[0] ? this.state.cityList.filter(cityFilter)[0].districtList : [],
//                 }, () => {
//                     // 根据区ID获取街道列表
//                     this.state.mapObj.plugin('AMap.DistrictSearch', () => {
//                         let districtSearch = new window.AMap.DistrictSearch({
//                             level: 'district',
//                             subdistrict: 1
//                         });
//                         districtSearch.search(String(value.adcode), (status, result) => {
//                             this.setState({
//                                 streetList: result.districtList ? result.districtList[0].districtList : [],
//                             }, () => {
//                                 // 地址信息获取完全之后进行写入
//                                 this.setState({
//                                     areaId: value.adcode,
//                                     area: {
//                                         province: value.province,
//                                         city: value.city,
//                                         district: value.district,
//                                         street: value.township
//                                     },
//                                     addressLoading: false
//                                 })
//                             })
//                         })
//                     })
//                 })
//             });
//         }
//     };
//     // 获取省列表（包含市区信息）
//     getProvinceList = () => {
//         this.state.mapObj.plugin('AMap.DistrictSearch', () => {
//             const districtSearch = new window.AMap.DistrictSearch({
//                 level: 'country',
//                 subdistrict: 3
//             });
//             districtSearch.search('中国', (status, result) => {
//                 this.setState({
//                     provinceList: result.districtList[0].districtList
//                 }, () => {
//                     const addressComponent = {
//                         province: this.state.data.provinceName,
//                         city: this.state.data.cityName,
//                         district: this.state.data.areaName,
//                         township: this.state.data.street,
//                         adcode: this.state.data.areaId
//                     };
//                     this.setArea(5, addressComponent)
//                 })
//             })
//         })
//     };
//     // 根据区Id获取街道列表
//     getStreetList = () => {
//         this.state.mapObj.plugin('AMap.DistrictSearch', () => {
//             let districtSearch = new window.AMap.DistrictSearch({
//                 level: 'district',
//                 subdistrict: 1
//             });
//             districtSearch.search(this.state.areaId, (status, result) => {
//                 this.setState({
//                     streetList: result.districtList[0].districtList || [],
//                 })
//             })
//         })
//     };
//     // 经纬度写入
//     setXY = (para) => {
//         this.setState({
//             xy: para
//         })
//     };
//     // 定位地址写入
//     setFormattedAddress = (para) => {
//         this.setState({
//             formattedAddress: para
//         })
//     };
//     // 地图标记点信息记录
//     setMarkers = (marker) => {
//         const arr = [];
//         arr.push(marker);
//         this.setState({
//             markers: arr
//         })
//     };

//     // 信息比对函数
//     dataContrast = (values) => {
//         console.log(values);
//         const initValues = this.state.data;
//         console.log(initValues);
//         const itemList = ["name", "telephone", "fees", "description", "provinceName", "cityName", "areaName", "areaId", "street", "address", "detailedAddress", "lng", "lat", "companyName", "licenseNumber", "additionalProtocol", "businessHours", "scope", "classNumber", "teacherNumber"];
//         const result = {};
//         itemList.forEach((item) => {
//             if (values[item] !== initValues[item]) {
//                 result[item] = values[item];
//             }
//         });
//         // 听书类型
//         if (values.typeIds.sort().toString() !== initValues.toString()) {
//             result.typeIds = values.typeIds;
//         }
//         // 听书图片
//         if (values.photos.toString() !== initValues.toString()) {
//             const photoTemp = [];
//             if (this.state.photoList01.length) {
//                 this.state.photoList11.forEach((item, index) => {
//                     photoTemp.push(item.path);
//                 })
//             }
//             result.photos = photoTemp;
//             console.log(result.photos);
//         }
//         if (values.icon.toString() !== initValues.toString()) {
//             result.icon = this.state.data_pic22;
//         }
//         console.log(result);
//         if (JSON.stringify(result) === "{}") {
//             return false;
//         } else {
//             result.id = this.props.id;
//             // result.educationKey = this.props.educationKey;
//             return result;
//         }
//     };

//     // 取消操作
//     handleCancel = () => {
//         const form = this.form;
//         const cancel = () => {
//             this.setState({
//                 visible: false
//             }, () => {
//                 this.setState({
//                     data: {},
//                     typeList: [],
//                     viewPic01: "",
//                     photoList01: [],
//                     photoList11: [],
//                     avatarEditor01: {
//                         scale: 1,
//                         positionX: 0.5,
//                         positionY: 0.5
//                     },
//                     photoLoading: false,
//                     viewPic02: "",
//                     data_pic02: "",
//                     data_pic22: "",
//                     effectPic02: "",
//                     avatarEditor02: {
//                         scale: 1,
//                         positionX: 0.5,
//                         positionY: 0.5
//                     },
//                     logoLoading: false,
//                     provinceList: [],
//                     cityList: [],
//                     districtList: [],
//                     streetList: [],
//                     markers: [],
//                     area: {
//                         province: "",
//                         city: "",
//                         district: "",
//                         street: ""
//                     },
//                     mapObj: {},
//                     formattedAddress: "",
//                     xy: {},
//                     provinceId: null,
//                     cityId: null,
//                     areaId: null,
//                     addressLoading: true,
//                     confirmLoading: false
//                 });
//             })
//         };
//         // data空值处理
//         if (JSON.stringify(this.state.data) === "{}") {
//             cancel();
//             return;
//         }
//         // 地址信息加载中处理
//         // if (this.state.addressLoading) {
//         //     message.warning("地图信息加载中，请稍后进行操作");
//         //     return
//         // }
//         form.validateFields((err, values) => {
//             values.typeId = values.typeIds ? values.typeIds[0] : 0;
//             values.typeIdTwo = values.typeIds ? (values.typeIds[1] || 0) : 0;
//             values.typeIdThree = values.typeIds ? (values.typeIds[2] || 0) : 0;
//             values.photo = this.state.photoList01[0];
//             values.photo2 = this.state.photoList01[1] || 0;
//             values.photo3 = this.state.photoList01[2] || 0;
//             values.photo4 = this.state.photoList01[3] || 0;
//             values.photo5 = this.state.photoList01[4] || 0;
//             values.icon = this.state.data_pic02;
//             values.provinceName = this.state.area.province;
//             values.cityName = this.state.area.city;
//             values.areaName = this.state.area.district;
//             values.areaId = this.state.areaId;
//             values.street = this.state.area.street;
//             values.address = this.state.formattedAddress;
//             values.lng = this.state.xy.x;
//             values.lat = this.state.xy.y;
//             const result = this.dataContrast(values);
//             if (result) {
//                 confirm({
//                     title: '已修改信息未保存，确认放弃修改？',
//                     content: "",
//                     okText: '确认',
//                     okType: 'danger',
//                     cancelText: '取消',
//                     onOk() {
//                         cancel();
//                     }
//                 });
//             } else {
//                 cancel()
//             }
//         })
//     };

//     // 确认操作
//     handleCreate = () => {
//         // data空值处理
//         if (JSON.stringify(this.state.data) === "{}") {
//             return;
//         }
//         // 地址信息加载中处理
//         // if (this.state.addressLoading) {
//         //     message.warning("地图信息加载中，请稍后进行操作");
//         //     return
//         // }
//         const form = this.form;
//         form.validateFieldsAndScroll((err, values) => {
//             if (err) {
//                 return;
//             }
//             // 听书类型写入与校验
//             // 听书类型是父级最多选三个
//             console.log(values);
//             console.log(values.typeIds);
//             const typeIdsTemp = [];
//             const typeIdsTem = [];
//             values.typeIds.forEach((item, index) => {
//                 let endIndex = item.indexOf(',');
//                 let parentId = item.slice(0,endIndex);
//                 let id = item.slice(endIndex + 1);
//                 typeIdsTemp.push(Number(parentId));
//                 typeIdsTem.push(Number(id));
//             })
//             let setTypeIds = Array.from(new Set(typeIdsTemp));
//             console.log(setTypeIds);
//             console.log(typeIdsTem);
//             const temp = setTypeIds.concat(typeIdsTem);
//             console.log(temp);
//             if (setTypeIds.length > 3) {
//                 message.error("听书类型最多选三项");
//                 return;
//             }
//             values.typeIds = temp;

//             // values.typeId = values.typeIds ? values.typeIds[0] : 0;
//             // values.typeIdTwo = values.typeIds ? (values.typeIds[1] || 0) : 0;
//             // values.typeIdThree = values.typeIds ? (values.typeIds[2] || 0) : 0;
//             // 听书图片写入与校验
//             // values.photos = this.state.photoList01;
//             console.log(this.state.photoList01);
//             console.log(values.photos);
//             values.photo = this.state.photoList01[0];
//             // values.photo2 = this.state.photoList01[1] || 0;
//             // values.photo3 = this.state.photoList01[2] || 0;
//             // values.photo4 = this.state.photoList01[3] || 0;
//             // values.photo5 = this.state.photoList01[4] || 0;

//             const photoTemp = [];
//             if (this.state.photoList01.length) {
//                 this.state.photoList01.forEach((item, index) => {
//                     let endIndex = item.path.indexOf('cn/');
//                     // let endIndexo = item.path.indexOf('.jpg');
//                     let pathTemp = item.path.slice(endIndex + 3);
//                     photoTemp.push(pathTemp);
//                 })
//             }

//             if (this.state.data_pic02) {
//                 values.icon = this.state.data_pic22
//             }

//             if (!values.photo) {
//                 message.error("课程图片未选择或未提交");
//                 return
//             }
//             // 听书logo写入
//             values.icon = this.state.data_pic02;
//             // 听书地址信息写入
//             values.provinceName = this.state.area.province;
//             values.provinceId = this.state.provinceId;
//             values.cityName = this.state.area.city;
//             values.cityId = this.state.cityId;
//             values.areaName = this.state.area.district;
//             values.areaId = this.state.areaId;
//             values.street = this.state.area.street;
//             values.address = this.state.formattedAddress;
//             values.lng = this.state.xy.x;
//             values.lat = this.state.xy.y;
//             // 信息比对
//             // const result = this.dataContrast(values);
//             let labelAll = [];
//             if (values.label_01) {
//                 labelAll.push(values.label_01);
//             }
//             if (values.label_02) {
//                 labelAll.push(values.label_02);
//             }
//             if (values.label_03) {
//                 labelAll.push(values.label_03);
//             }
//             if (values.label_04) {
//                 labelAll.push(values.label_04);
//             }
//             if (values.label_05) {
//                 labelAll.push(values.label_05);
//             }
//             if (values.label_06) {
//                 labelAll.push(values.label_06);
//             }
//             const result = {
//                 id: this.props.id,
//                 name: values.name,
//                 typeIds: values.typeIds,
//                 // typeIds: this.state.tempTypeIds,
//                 telephone: values.telephone,
//                 photos: photoTemp,
//                 description: values.description,
//                 businessHours: values.businessHours,
//                 scope: values.scope, 
//                 classNumber: values.classNumber, 
//                 teacherNumber: values.teacherNumber,
//                 icon: values.icon,
//                 label: JSON.stringify(labelAll),
//                 // icon: this.state.data_pic22,
//                 provinceName:  values.provinceName,
//                 provinceId: values.provinceId,
//                 cityName: values.cityName,
//                 cityId: values.cityId,
//                 areaName: values.areaName,
//                 areaId: values.areaId,
//                 street: values.street,
//                 address: values.address,
//                 lng: values.lng,
//                 lat: values.lat,
//                 detailedAddress: values.detailedAddress, 
//                 companyName: values.companyName, 
//                 licenseNumber: values.licenseNumber, 
//                 additionalProtocol: values.additionalProtocol,
//             }
//             if (!result) {
//                 message.error("暂无信息更改");
//                 return;
//             }
//             // 修改项提交，状态变为待审核
//             result.status = 1;
//             this.setState({
//                 confirmLoading: true
//             });
//             reqwest({
//                 url: '/admin/org/update',
//                 type: 'json',
//                 method: 'post',
//                 headers: {
//                     Authorization: sessionStorage.token
//                 },
//                 data: result,
//                 error: (XMLHttpRequest) => {
//                     message.error("保存失败");
//                     this.setState({
//                         confirmLoading: false
//                     })
//                 },
//                 success: (json) => {
//                     if (json.result === 0) {
//                         message.success("听书信息修改成功，已提交审核");
//                         this.setState({
//                             visible: false
//                         }, () => {
//                             this.setState({
//                                 data: {},
//                                 typeList: [],
//                                 viewPic01: "",
//                                 photoList01: [],
//                                 avatarEditor01: {
//                                     scale: 1,
//                                     positionX: 0.5,
//                                     positionY: 0.5
//                                 },
//                                 photoLoading: false,
//                                 viewPic02: "",
//                                 data_pic02: "",
//                                 effectPic02: "",
//                                 avatarEditor02: {
//                                     scale: 1,
//                                     positionX: 0.5,
//                                     positionY: 0.5
//                                 },
//                                 logoLoading: false,
//                                 provinceList: [],
//                                 cityList: [],
//                                 districtList: [],
//                                 streetList: [],
//                                 markers: [],
//                                 area: {
//                                     province: "",
//                                     city: "",
//                                     district: "",
//                                     street: ""
//                                 },
//                                 mapObj: {},
//                                 formattedAddress: "",
//                                 xy: {},
//                                 areaId: null,
//                                 addressLoading: true,
//                                 confirmLoading: false
//                             });
//                         });
//                     } else {
//                         if (json.code === "901") {
//                             message.error("请先登录");
//                             // 返回登陆页
//                             this.props.toLoginPage();
//                         } else if (json.code === "902") {
//                             message.error("登录信息已过期，请重新登录");
//                             // 返回登陆页
//                             this.props.toLoginPage();
//                         } else if (json.code === "1127") {
//                             message.error("已修改信息正在审核中，暂不能修改");
//                             this.setState({
//                                 confirmLoading: false
//                             })
//                         } else {
//                             message.error(json.message);
//                             this.setState({
//                                 confirmLoading: false
//                             })
//                         }
//                     }
//                 }
//             });
//         });
//     };

//     saveFormRef = (form) => {
//         this.form = form;
//     };

//     render() {
//         return (
//             <a>
//             {/*<a style={{display: this.props.opStatus ? "inline" : "none"}}>*/}
//                 <span onClick={this.showModal}>编辑</span>
//                 <ItemEditForm
//                     ref={this.saveFormRef}
//                     visible={this.state.visible}
//                     onCancel={this.handleCancel}
//                     onCreate={this.handleCreate}
//                     onChange={this.onChange}
//                     id={this.props.id}
//                     data={this.state.data}
//                     allTypeList={this.state.allTypeList}
//                     handleSearch={this.handleSearch}
//                     handleChange={this.handleChange}
//                     typeList={this.state.typeList}
//                     checkOrgType={this.checkOrgType}
//                     viewPic01={this.state.viewPic01}
//                     setViewPic01={this.setViewPic01}
//                     picUpload01={this.picUpload01}
//                     avatarEditor01={this.state.avatarEditor01}
//                     setAvatarEditor01={this.setAvatarEditor01}
//                     photoList01={this.state.photoList01}
//                     setPhotoList01={this.setPhotoList01}
//                     photoLoading={this.state.photoLoading}
//                     viewPic02={this.state.viewPic02}
//                     data_pic02={this.state.data_pic02}
//                     setViewPic02={this.setViewPic02}
//                     effectPic02={this.state.effectPic02}
//                     picUpload02={this.picUpload02}
//                     avatarEditor02={this.state.avatarEditor02}
//                     setAvatarEditor02={this.setAvatarEditor02}
//                     logoLoading={this.state.logoLoading}
//                     provinceList={this.state.provinceList}
//                     cityList={this.state.cityList}
//                     districtList={this.state.districtList}
//                     streetList={this.state.streetList}
//                     markers={this.state.markers}
//                     setMarkers={this.setMarkers}
//                     area={this.state.area}
//                     setArea={this.setArea}
//                     mapObj={this.state.mapObj}
//                     formattedAddress={this.state.formattedAddress}
//                     setFormattedAddress={this.setFormattedAddress}
//                     setXY={this.setXY}
//                     confirmLoading={this.state.confirmLoading}
//                 />
//             </a>
//         );
//     }
// }


export default ListeningBookManage;