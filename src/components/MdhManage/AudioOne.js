import React, {
    Component
} from 'react';
import {
    Tabs,
    Table,
    Input,
    Button,
    Modal,
    Form,
    Upload,
    Icon,
    message,
    List,
    Slider,
    Row,
    Col,
    Radio,
    InputNumber,
    Popconfirm,
    Spin
} from 'antd';
import '../../config/config.js';
import reqwest from 'reqwest';
import AvatarEditor from 'react-avatar-editor'

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const FormItem = Form.Item;
const {TextArea} = Input;
const RadioGroup = Radio.Group;
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

//单元格
const Cell = ({value}) => (
    <div> {value} </div>
);

//音频添加表单
const ItemAddForm = Form.create()(
    (props) => {
        const {
            visible,
            onCancel,
            onCreate,
            form,
            viewPic, effectPic, data_pic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoLoading,
            audioLoading,
            fn_audio,
            data_audio,
            confirmLoading
        } = props;
        const {getFieldDecorator} = form;

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
                width={150}
                height={100}
                border={0}
                color={[255, 255, 255, 0.6]}
                scale={avatarEditor.scale}
                position={{x: avatarEditor.positionX, y: avatarEditor.positionY}}
                rotate={0}
            />
        );

        //音频处理
        const beforeAudioUpload = (file) => {
            const isMP3 = file.type === 'audio/mp3';
            if (!isMP3) {
                message.error('文件类型错误');
                return false;
            }
            const isLt100M = file.size / 1024 / 1024 < 100;
            if (!isLt100M) {
                message.error('文件不能大于100M');
                return false;
            }
            if (isMP3 && isLt100M) {
                fn_audio(true, file.name, file);
            }
            return false;
        };
        const audioUploadButton = (
            <div>
                <Icon type={audioLoading ? 'loading' : 'plus'}/>
                <div className="ant-upload-text"
                     style={{display: audioLoading ? "none" : "block"}}> 添加文件
                </div>
            </div>
        );

        return (
            <Modal visible={visible}
                   title="音频添加"
                   width={600}
                   onCancel={onCancel}
                   onOk={onCreate}
                   destroyOnClose={true}
                   confirmLoading={confirmLoading}>
                <div className="audioOne-add audioOne-form item-form">
                    <Form layout="vertical">
                        <FormItem className="name longItem" {...formItemLayout_14} label="名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    max: 18,
                                    message: '请按要求填写音频名称',
                                }],
                            })(
                                <Input placeholder="请填写音频名称（18字以内）"/>
                            )}
                        </FormItem>
                        <FormItem className="type" {...formItemLayout_10} label="类型：">
                            {getFieldDecorator('type', {
                                rules: [{
                                    required: true,
                                    message: '请选择音频类型',
                                }],
                            })(
                                <RadioGroup>
                                    <Radio value={0}>孩子听书</Radio>
                                    <Radio value={1}>父母听书</Radio>
                                </RadioGroup>)}
                        </FormItem>
                        <FormItem className="photo" {...formItemLayout_12} label="图片：">
                            {getFieldDecorator('photo', {
                                rules: [{
                                    required: true,
                                    message: '请上传课程图片',
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
                        <FormItem className="summary longItem" {...formItemLayout_14} label="简介：">
                            {getFieldDecorator('summary', {
                                rules: [{
                                    required: true,
                                    message: '音频简介不能为空',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写音频简介"
                                          autosize={{minRows: 3, maxRows: 10}}/>
                            )}
                        </FormItem>
                        <FormItem className="originalPrice" {...formItemLayout_8} label="原价(￥)：">
                            {getFieldDecorator('originalPrice', {
                                rules: [{
                                    required: true,
                                    message: '音频原价不能为空',
                                }]
                            })(
                                <InputNumber min={0}
                                             precision={2}
                                             step={100}/>
                            )}
                        </FormItem>
                        <FormItem className="price" {...formItemLayout_8} label="现价(￥)：">
                            {getFieldDecorator('price', {
                                rules: [{
                                    required: true,
                                    message: '音频现价不能为空',
                                }]
                            })(
                                <InputNumber min={0}
                                             precision={2}
                                             step={100}/>
                            )}
                        </FormItem>
                        <FormItem className="audio" {...formItemLayout_8} label="音频文件：">
                            {getFieldDecorator('audio', {
                                rules: [{
                                    required: true,
                                    message: '请上传音频文件',
                                }],
                            })(
                                <Upload name="file"
                                        listType="picture-card"
                                        className="avatar-uploader"
                                        showUploadList={false}
                                        beforeUpload={beforeAudioUpload}>
                                    {data_audio ? < p> {data_audio}</p> : audioUploadButton}
                                </Upload>)}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//音频添加组件
class ItemAdd extends Component {
    state = {
        visible: false,
        // 图片相关变量--------------------------------------
        viewPic: "",
        effectPic: "",
        data_pic: "",
        avatarEditor: {
            scale: 1,
            positionX: 0.5,
            positionY: 0.5,
        },
        photoLoading: false,
        // 音频相关变量
        data_audio: "",
        file: "",
        fileList: [],
        audioLoading: false,
        audioList: [],
        confirmLoading: false
    };

    showModal = () => {
        this.setState({
            visible: true
        });
    };

    // 图片处理-------------------------------------------------------------
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
    // 图片上传
    picUpload = (para01, para02) => {
        // 文件对象写入formData
        const formData = new FormData();
        formData.append("file", para02);
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
                    photoLoading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("图片提交成功");
                    // 图片上传成功，effectPic与data_pic写入
                    this.setState({
                        effectPic: para01,
                        data_pic: json.data.url,
                        photoLoading: false
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
    };

    //音频处理
    fn_audio = (audioLoading, fileName, file) => {
        this.setState({
            audioLoading: audioLoading,
            data_audio: fileName || "",
            file: file
        });
        this.setState(({fileList}) => ({
            fileList: [...fileList, file],
        }));
    };
    audioUpload = (para) => {
        const formData = new FormData();
        formData.append("file", this.state.file);
        reqwest({
            url: '/file/uploadAudio',
            type: 'json',
            method: 'post',
            processData: false,
            headers: {
                ClassId: para,
                type: 2
            },
            data: formData,
            error: () => {
                message.error("音频提交失败");
            },
            success: (json) => {
                if (json.result === 0) {
                    let newAudioOne = sessionStorage.newAudioOne ? JSON.parse(sessionStorage.newAudioOne) : {};
                    newAudioOne[para] = 0;
                    sessionStorage.newAudioOne = JSON.stringify(newAudioOne);
                    this.setState({
                        audioList: <audio onCanPlay={(e) => this.editAudioDuration(para, e.target)}
                                          src="https://image.taoerxue.com/fc9b089bd0314da4bd6d514e236818c8.mp3"/>
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
                    }
                }
            }
        });
    };
    audioDurationHandle = (para) => {
        const seconds = Math.floor(para);
        const partOne = String(Math.floor(seconds / 60)).length === 1 ? 0 + String(Math.floor(seconds / 60)) :
            String(Math.floor(seconds / 60));
        const partTwo = String(seconds % 60).length === 1 ? 0 + String(seconds % 60) : String(seconds % 60);
        return partOne + "'" + partTwo + '"';
    };
    editAudioDuration = (id, ele) => {
        reqwest({
            url: '/mdhListenBook/modifyListenBook',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: id,
                duration: this.audioDurationHandle(ele.duration)
            },
            error: (XMLHttpRequest) => {

            },
            success: (json) => {
                this.props.setFlag();
            }
        })
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
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
                    data_audio: "",
                    file: "",
                    fileList: [],
                    audioLoading: false,
                    audioSrc: "",
                    confirmLoading: false
                });
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
            if (!this.state.data_pic) {
                message.error("图片未提交");
                return
            }
            values.photo = this.state.data_pic;
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/mdhListenBook/addListenBook',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    name: values.name,
                    type: values.type,
                    photo: values.photo,
                    summary: values.summary,
                    originalPrice: values.originalPrice,
                    price: values.price
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        let newAudioOne = sessionStorage.newAudioOne ? JSON.parse(sessionStorage.newAudioOne) : {};
                        newAudioOne[json.data] = 1;
                        sessionStorage.newAudioOne = JSON.stringify(newAudioOne);
                        message.success("添加成功、正在上传，请耐心等待");
                        this.audioUpload(json.data);
                        this.setState({
                            visible: false
                        }, () => {
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
                                data_audio: "",
                                file: "",
                                fileList: [],
                                audioLoading: false,
                                audioSrc: "",
                                confirmLoading: false
                            });
                        });
                        this.props.setFlag()
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
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button type="primary" onClick={this.showModal}>音频添加</Button>
                <ItemAddForm ref={this.saveFormRef}
                             visible={this.state.visible}
                             onCancel={this.handleCancel}
                             onCreate={this.handleCreate}
                             viewPic={this.state.viewPic}
                             effectPic={this.state.effectPic}
                             data_pic={this.state.data_pic}
                             setViewPic={this.setViewPic}
                             avatarEditor={this.state.avatarEditor}
                             setAvatarEditor={this.setAvatarEditor}
                             picUpload={this.picUpload}
                             photoLoading={this.state.photoLoading}
                             audioLoading={this.state.audioLoading}
                             fn_audio={this.fn_audio}
                             data_audio={this.state.data_audio}
                             confirmLoading={this.state.confirmLoading}/>
                {this.state.audioList}
            </div>
        );
    }
}

//音频编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {
            visible,
            onCancel,
            onCreate,
            form,
            data,
            viewPic, effectPic, data_pic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoLoading,
            confirmLoading
        } = props;
        const {getFieldDecorator} = form;

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
                width={150}
                height={100}
                border={0}
                color={[255, 255, 255, 0.6]}
                scale={avatarEditor.scale}
                position={{x: avatarEditor.positionX, y: avatarEditor.positionY}}
                rotate={0}
            />
        );

        return (
            <Modal visible={visible}
                   title="音频编辑"
                   width={600}
                   onCancel={onCancel}
                   onOk={onCreate}
                   destroyOnClose={true}
                   confirmLoading={confirmLoading}>
                {
                    JSON.stringify(data) === "{}" ?
                        <div className="spin-box">
                            <Spin/>
                        </div>
                        :
                        <div className="audioOne-add audioOne-form item-form">
                            <Form layout="vertical">
                                <FormItem className="name longItem" {...formItemLayout_14} label="音频名称：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.name,
                                        rules: [{
                                            required: true,
                                            max: 18,
                                            message: '请按要求填写音频名称',
                                        }],
                                    })(
                                        <Input placeholder="请填写音频名称（18字以内）"/>
                                    )}
                                </FormItem>
                                <FormItem className="type" {...formItemLayout_10} label="类型：">
                                    {getFieldDecorator('type', {
                                        initialValue: data.type,
                                        rules: [{
                                            required: true,
                                            message: '请选择音频类型',
                                        }],
                                    })(
                                        <RadioGroup>
                                            <Radio value={0}>孩子听书</Radio>
                                            <Radio value={1}>父母听书</Radio>
                                        </RadioGroup>)}
                                </FormItem>
                                <FormItem className="photo" {...formItemLayout_12} label="图片：">
                                    {getFieldDecorator('photo', {
                                        initialValue: viewPic,
                                        rules: [{
                                            required: true,
                                            message: "图片不能为空"
                                        }],
                                    })(
                                        <div className="itemBox">
                                            <Upload name="file"
                                                    listType="picture-card"
                                                    className="avatar-uploader"
                                                    showUploadList={false}
                                                    action="/file/upload"
                                                    beforeUpload={beforeUpload}>
                                                {viewPic ? partImg : uploadButton}
                                            </Upload>
                                            <Row>
                                                <Col span={4}>缩放：</Col>
                                                <Col span={12}>
                                                    <Slider min={1}
                                                            max={1.5}
                                                            step={0.01}
                                                            value={avatarEditor.scale}
                                                            disabled={!viewPic}
                                                            onChange={(value) => {
                                                                setAvatarEditor(1, value)
                                                            }}/>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={4}>X：</Col>
                                                <Col span={12}>
                                                    <Slider min={0}
                                                            max={1}
                                                            step={0.01}
                                                            value={avatarEditor.positionX}
                                                            disabled={!viewPic}
                                                            onChange={(value) => {
                                                                setAvatarEditor(2, value)
                                                            }}/>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={4}>Y：</Col>
                                                <Col span={12}>
                                                    <Slider min={0}
                                                            max={1}
                                                            step={0.01}
                                                            value={avatarEditor.positionY}
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
                                                    }}> 图片提交 </Button>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem className="summary longItem" {...formItemLayout_14} label="简介：">
                                    {getFieldDecorator('summary', {
                                        initialValue: data.summary,
                                        rules: [{
                                            required: true,
                                            message: '音频简介不能为空',
                                        }],
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写音频简介"
                                                  autosize={{minRows: 3, maxRows: 10}}/>
                                    )}
                                </FormItem>
                                <FormItem className="originalPrice" {...formItemLayout_8} label="原价(￥)：">
                                    {getFieldDecorator('originalPrice', {
                                        initialValue: data.originalPrice,
                                        rules: [{
                                            required: true,
                                            message: '音频原价不能为空'
                                        }]
                                    })(
                                        <InputNumber min={0} precision={2} step={100}/>
                                    )}
                                </FormItem>
                                <FormItem className="price" {...formItemLayout_8} label="现价(￥)：">
                                    {getFieldDecorator('price', {
                                        initialValue: data.price,
                                        rules: [{
                                            required: true,
                                            message: '音频现价不能为空',
                                        }]
                                    })(
                                        <InputNumber min={0} precision={2} step={100}/>
                                    )}
                                </FormItem>
                            </Form>
                        </div>
                }
            </Modal>
        )
    }
);

//音频编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,
        // 基本信息
        data: {},
        // 图片相关变量
        viewPic: "",
        effectPic: "",
        data_pic: "",
        avatarEditor: {
            scale: 1,
            positionX: 0.5,
            positionY: 0.5
        },
        photoLoading: false,
        // 提交按钮状态变量
        confirmLoading: false
    };

    getData = () => {
        reqwest({
            url: '/mdhListenBook/getDetail',
            type: 'json',
            method: 'post',
            data: {
                id: this.props.id
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                const json = {
                    result: 0,
                    data: {
                        mdhListenBook: {
                            id: 1,
                            name: "",
                            type: 1,
                            photo: "",
                            summary: "",
                            duration: "",
                            playbackNum: null,
                            originalPrice: "",
                            price: "",
                            linkAddress: "",
                            createUser: "",
                            createTime: "",
                            examineUser: "",
                            examineTime: "",
                            opinion: "",
                            state: null
                        }
                    }
                };
                if (json.result === 0) {
                    let data = json.data.mdhListenBook;
                    data.duration = Number(json.data.mdhListenBook.duration);
                    data.originalPrice = json.data.mdhListenBook.originalPrice ? Number(json.data.mdhListenBook.originalPrice) : null;
                    data.price = json.data.mdhListenBook.price ? Number(json.data.mdhListenBook.price) : null;
                    this.setState({
                        data: data,
                        viewPic: "http://image.taoerxue.com/" + data.photo,
                        effectPic: "http://image.taoerxue.com/" + data.photo,
                        data_pic: data.photo
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
            },
            success: (json) => {
                if (json.result === 0) {
                    let data = json.data.mdhListenBook;
                    data.duration = Number(json.data.mdhListenBook.duration);
                    data.originalPrice = json.data.mdhListenBook.originalPrice ? Number(json.data.mdhListenBook.originalPrice) : null;
                    data.price = json.data.mdhListenBook.price ? Number(json.data.mdhListenBook.price) : null;
                    this.setState({
                        data: data,
                        viewPic: "http://image.taoerxue.com/" + data.photo,
                        effectPic: "http://image.taoerxue.com/" + data.photo,
                        data_pic: data.photo
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
        });
    };

    showModal = () => {
        this.getData();
        this.setState({
            visible: true
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
    // 图片上传
    picUpload = (para01, para02) => {
        const formData = new FormData();
        formData.append("file", para02);
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
                    photoLoading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("图片提交成功");
                    this.setState({
                        effectPic: para01,
                        data_pic: json.data.url,
                        photoLoading: false
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
    };

    dataContrast = (values) => {
        const initValues = this.state.data;
        const itemList = ["name", "type", "photo", "summary", "originalPrice", "price"];
        const result = {};

        itemList.forEach((item) => {
            if (values[item] !== initValues[item]) {
                result[item] = values[item];
            }
        });
        if (JSON.stringify(result) === "{}") {
            if (this.state.data_audio) {
                result.data_audio = this.state.data_audio;
                return result;
            } else {
                return false;
            }
        } else {
            result.id = this.props.id;
            if (this.state.data_audio) {
                result.data_audio = this.state.data_audio;
            }
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
            })
        };
        if (JSON.stringify(this.state.data) === "{}") {
            cancel();
            return;
        }
        form.validateFields((err, values) => {
            values.photo = this.state.data_pic;
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
        if (JSON.stringify(this.state.data) === "{}") {
            return;
        }
        const form = this.form;
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            if (!this.state.data_pic) {
                message.error("图片未提交");
                return
            }
            values.photo = this.state.data_pic;
            const result = this.dataContrast(values);
            if (!result) {
                message.error("暂无信息更改");
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/mdhListenBook/modifyListenBook',
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
                    });
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("音频编辑成功");
                        this.setState({
                            visible: false
                        }, () => {
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
                        });
                        this.props.recapture()
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
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>编辑</span>
                <ItemEditForm ref={this.saveFormRef}
                              visible={this.state.visible}
                              onCancel={this.handleCancel}
                              onCreate={this.handleCreate}
                              data={this.state.data}
                              viewPic={this.state.viewPic}
                              effectPic={this.state.effectPic}
                              data_pic={this.state.data_pic}
                              setViewPic={this.setViewPic}
                              avatarEditor={this.state.avatarEditor}
                              setAvatarEditor={this.setAvatarEditor}
                              picUpload={this.picUpload}
                              photoLoading={this.state.photoLoading}
                              confirmLoading={this.state.confirmLoading}/>
            </a>
        );
    }
}

//音频详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        data: "",
        loading: true
    };

    showModal = () => {
        this.getData();
        this.setState({
            visible: true,
        })
    };

    //日期处理
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
            oSecondT = tempDate.getSeconds().toString(),
            oSecond = oSecondT.length <= 1 ? "0" + oSecondT : oSecondT,
            oTime = oYear + '-' + oMonth + '-' + oDay + " " + oHour + ":" + oMinute + ":" + oSecond;
        return oTime;
    };

    getData = () => {
        reqwest({
            url: '/mdhListenBook/getDetail',
            type: 'json',
            method: 'post',
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
                //         mdhListenBook: {
                //             id: null,
                //             name: "",
                //             photo: "",
                //             type: null,
                //             duration: "",
                //             playbackNum: null,
                //             originalPrice: "",
                //             price: "",
                //             // linkAddress: "566355d55252dhytj25k554f5sdf2n55.mp3",
                //             createUser: "",
                //             createTime: "",
                //             examineUser: "",
                //             examineTime: "",
                //             opinion: "",
                //             state: null
                //         }
                //     },
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        data: json.data.mdhListenBook
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

    handleCancel = () => {
        this.setState({
            visible: false
        });
    };

    render() {
        let dataSource;
        if (this.state.data) {
            let tempType = "";
            if (this.state.data.type === 0) {
                tempType = "孩子听书";
            }
            if (this.state.data.type === 1) {
                tempType = "父母听书";
            }
            let tempState = "";
            if (this.state.data.state === 0) {
                tempState = "暂存";
            }
            if (this.state.data.state === 1) {
                tempState = "审核中";
            }
            if (this.state.data.state === 2) {
                tempState = "审核通过";
            }
            if (this.state.data.state === 3) {
                tempState = "审核驳回";
            }
            if (this.state.data.state === 4) {
                tempState = "已下架";
            }
            dataSource = [
                <div className="name">
                    <span className="item-name">音频名称：</span>
                    <span className="item-content">{this.state.data.name}</span>
                </div>,
                <div className="type">
                    <span className="item-name">音频类型：</span>
                    <span className="item-content">{tempType}</span>
                </div>,
                <div className="photo">
                    <span className="item-name">图片：</span>
                    <img src={"http://image.taoerxue.com/" + this.state.data.photo} alt="" className="item-content"/>
                </div>,
                <div className="duration">
                    <span className="item-name">音频时长：</span>
                    <span className="item-content">{this.state.data.duration}</span>
                </div>,
                <div className="playbackNum">
                    <span className="item-name">播放次数：</span>
                    <span className="item-content">{this.state.data.playbackNum}</span>
                </div>,
                <div className="originalPrice">
                    <span className="item-name">原价：</span>
                    <span className="item-content">￥{this.state.data.originalPrice}</span>
                </div>,
                <div className="price">
                    <span className="item-name">现价：</span>
                    <span className="item-content">￥{this.state.data.price}
                </span>
                </div>,
                <div className="linkAddress">
                    <span className="item-name">音频地址：</span>
                    <span
                        className="item-content">{this.state.data.linkAddress ? ("https://image.taoerxue.com/" + this.state.data.linkAddress) : "音频上传失败"}</span>
                </div>,
                <div className="createTime">
                    <span className="item-name">创建时间：</span>
                    <span
                        className="item-content">{this.state.data.createTime ? this.timeHandle(this.state.data.createTime) : ""}</span>
                </div>,
                <div className="examineTime">
                    <span className="item-name">审核时间：</span>
                    <span
                        className="item-content">{this.state.data.examineTime ? this.timeHandle(this.state.data.examineTime) : "暂无"}</span>
                </div>,
                <div className="opinion">
                    <span className="item-name">审核意见：</span>
                    <pre>
                    <span className="item-content">{this.state.data.opinion || "暂无"}</span>
                </pre>
                </div>,
                <div className="state">
                    <span className="item-name">状态：</span>
                    <span className="item-content">{tempState}</span>
                </div>
            ];
        } else {
            dataSource = ""
        }
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>详情</span>
                <Modal title="音频详情"
                       width={600}
                       visible={this.state.visible}
                       footer={null}
                       onCancel={this.handleCancel}
                       destroyOnClose={true}>
                    <div className="audioOne-details item-details">
                        <div className="audioOne-baseData">
                            <List size="small"
                                  split="false"
                                  dataSource={dataSource}
                                  renderItem={item => (<List.Item>{item}</List.Item>)}
                                  loading={this.state.loading}/>
                        </div>
                    </div>
                </Modal>
            </a>
        );
    }
}

//音频列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.audioOneSize) || 10,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            },
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '音频名称',
                dataIndex: 'name',
                width: '25%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '类型',
                dataIndex: 'type',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'type'),
            },
            {
                title: '时长',
                dataIndex: 'duration',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'duration'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*音频详情*/}
                            <ItemDetails id={record.id} toLoginPage={this.props.toLoginPage}
                                         opStatus={this.props.opObj.select}/>
                            {/*音频编辑*/}
                            <ItemEdit id={record.id} recapture={this.getData} toLoginPage={this.props.toLoginPage}
                                      opStatus={(record.state === 0 || record.state === 3 || record.state === 4) && this.props.opObj.modify}/>
                            <Popconfirm title="确认提交?"
                                        placement="topRight"
                                        onConfirm={() => this.itemSubmit(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="确认"
                                        cancelText="取消">
                                <a style={{display: (record.state === 0 || record.state === 3 || record.state === 4) && this.props.opObj.modify ? "inline" : "none"}}>提交审核</a>
                            </Popconfirm>
                            <Popconfirm title="确认取消审核?"
                                        placement="topRight"
                                        onConfirm={() => this.itemSubmitCancel(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="确认"
                                        cancelText="取消">
                                <a style={{display: record.state === 1 && this.props.opObj.modify ? "inline" : "none"}}>取消审核</a>
                            </Popconfirm>
                            <Popconfirm title="确认下架?"
                                        placement="topRight"
                                        onConfirm={() => this.itemWithdraw(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="确认"
                                        cancelText="取消">
                                <a style={{display: record.state === 2 && this.props.opObj.modify ? "inline" : "none"}}>下架</a>
                            </Popconfirm>
                            <Popconfirm title="确认删除?"
                                        placement="topRight"
                                        onConfirm={() => this.itemDelete(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="立即删除"
                                        cancelText="取消">
                                <a style={{display: (record.state === 0 || record.state === 3 || record.state === 4) && this.props.opObj.delete ? "inline" : "none"}}>删除</a>
                            </Popconfirm>
                            <Icon style={{display: this.newAudioOne[record.id] === 1 ? "inline" : "none"}}
                                  type="loading"/>
                        </div>
                    );
                },
            }
        ];
        this.newAudioOne = {}
    }

    //列渲染
    renderColumns(text) {
        return (<Cell value={text}/>);
    }

    //获取本页信息
    getData = (type, keyword) => {
        this.newAudioOne = sessionStorage.newAudioOne ? JSON.parse(sessionStorage.newAudioOne) : {};
        this.setState({
            loading: true
        });
        reqwest({
            url: '/mdhListenBook/list',
            type: 'json',
            method: 'post',
            data: {
                state: type === undefined ? this.props.type : type,
                name: keyword === undefined ? this.props.keyword : keyword,
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                });
                // const json = {
                //     result: 0,
                //     data: {
                //         size: 100,
                //         list: [
                //             {
                //                 id: 1,
                //                 name: "",
                //                 type: null,
                //                 duration: "",
                //                 originalPrice: "",
                //                 price: "",
                //                 state: 0
                //             }
                //         ]
                //     },
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
                        let type = "";
                        if (item.type === 0) {
                            type = "孩子听书"
                        }
                        if (item.type === 1) {
                            type = "父母听书"
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            courseType: item.courseType,
                            index: index + 1,
                            name: item.name,
                            type: type,
                            duration: item.duration,
                            state: item.state
                        });
                    });
                    this.setState({
                        loading: false,
                        data: data,
                        pagination: {
                            total: json.data.size,
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

    //提交审核
    itemSubmit = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/mdhListenBook/submitAudit',
            type: 'json',
            method: 'post',
            data: {
                id: para
            },
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
                    message.success("提交审核成功");
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

    //取消审核
    itemSubmitCancel = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/mdhListenBook/cancelAudit',
            type: 'json',
            method: 'post',
            data: {
                id: para
            },
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
                    message.success("取消审核成功");
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

    //下架
    itemWithdraw = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/mdhListenBook/shelveListenBook',
            type: 'json',
            method: 'post',
            data: {
                id: para
            },
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
                    message.success("音频下架成功");
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

    //删除
    itemDelete = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/mdhListenBook/deleteListenBook',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: para
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("音频删除成功");
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

    //页码变化处理
    handleTableChange = (pagination) => {
        const pager = {
            ...this.state.pagination
        };
        pager.current = pagination.current;
        localStorage.audioOneSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.audioOneSize);
        this.setState({
            pagination: pager,
        }, () => {
            this.getData();
        });
    };

    componentWillMount() {
        this.getData();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.type !== this.props.type) {
            this.getData(nextProps.type, this.props.keyword);
        }
        if (nextProps.keyword !== this.props.keyword) {
            this.getData(this.props.type, nextProps.keyword);
        }
        if (nextProps.flag_add !== this.props.flag_add) {
            this.getData();
        }
    }

    render() {
        return <Table bordered
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={this.state.pagination}
                      columns={this.columns}
                      onChange={this.handleTableChange}/>;
    }
}

class AudioOne extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            type: "0",
            keyword: "",
            flag_add: false
        }
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

    //tab状态设置
    setType = (value) => {
        this.setState({
            type: value
        })
    };

    search = (value) => {
        this.setState({
            keyword: value
        })
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
            <div className="audioOne">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                <Tabs defaultActiveKey={this.state.type} onChange={this.setType}>
                                    <TabPane tab="暂存" key="0"/>
                                    <TabPane tab="审核中" key="1"/>
                                    <TabPane tab="审核通过" key="2"/>
                                    <TabPane tab="已驳回" key="3"/>
                                    <TabPane tab="已下架" key="4"/>
                                </Tabs>
                                {/*音频新增*/}
                                <div className="add-button"
                                     style={{float: "right"}}>
                                    <ItemAdd opStatus={this.state.opObj.add} setFlag={this.setFlag}
                                             toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            <div className="keyWord clearfix">
                                <Search placeholder="请输入音频名称信息"
                                        onSearch={this.search}
                                        enterButton style={{width: "320px", float: "left"}}/>
                            </div>
                            {/*音频列表*/}
                            <div className="table-box">
                                <DataTable
                                    opObj={this.state.opObj}
                                    type={this.state.type}
                                    keyword={this.state.keyword}
                                    flag_add={this.state.flag_add}
                                    toLoginPage={this.toLoginPage}/>
                            </div>
                        </div>
                        :
                        <p>暂无查询权限</p>
                }
            </div>
        )
    }
}

export default AudioOne;
