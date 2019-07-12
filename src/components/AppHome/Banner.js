import React, {Component} from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Upload,
    Slider,
    Row,
    Col,
    Input,
    Icon,
    message,
    Popconfirm
} from 'antd';
import reqwest from 'reqwest';
import AvatarEditor from 'react-avatar-editor';

const FormItem = Form.Item;
const confirm = Modal.confirm;

//栅格设置
const formItemLayout_14 = {
    labelCol: {span: 4},
    wrapperCol: {span: 14}
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//banner新增表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, viewPic, effectPic, data_pic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoLoading, confirmLoading} = props;
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
            // new File IE环境下失效
            // return new File([u8arr], "effective.jpg", {type: "image/jpeg"});
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
                width={250}
                height={120}
                border={0}
                color={[255, 255, 255, 0.6]}
                scale={avatarEditor.scale}
                position={{x: avatarEditor.positionX, y: avatarEditor.positionY}}
                rotate={0}
            />
        );

        return (
            <Modal
                visible={visible}
                title="新增banner"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="banner-add banner-form item-form">
                    <Form layout="vertical">
                        <FormItem className="photo longItem" {...formItemLayout_14} label="图片：">
                            {getFieldDecorator('photo', {
                                rules: [{
                                    required: true,
                                    message: '请上传图片',
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
                                        {/*根据图片文件是否已选择展示不同组件*/}
                                        {viewPic ? partImg : uploadButton}
                                    </Upload>
                                    {/*缩放及偏移操作*/}
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
                                    {/*图片提交按钮*/}
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
                        <FormItem className="title longItem" {...formItemLayout_14} label="图片描述：">
                            {getFieldDecorator('title', {
                                rules: [{
                                    required: true,
                                    message: '描述字段不能为空',
                                }],
                            })(
                                <Input placeholder="请输入图片描述"/>
                            )}
                        </FormItem>
                        <FormItem className="linkAddress longItem unnecessary" {...formItemLayout_14} label="跳转链接：">
                            {getFieldDecorator('linkAddress', {
                                rules: [{
                                    required: false
                                }],
                            })(
                                <Input placeholder="请输入图片跳转链接"/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//banner新增组件
class ItemAdd extends Component {
    state = {
        visible: false,
        // 图片相关变量--------------------------------------
        // 初始图片
        viewPic: "",
        // 有效图片：图片提交成功时写入，用以与提交时canvas生成的图片编码进行比对，已确定图片是否有改动
        effectPic: "",
        // 保存待提交的图片
        data_pic: "",
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

    showModal = () => {
        this.setState({visible: true});
    };

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
                message.error("登录信息已过期，请重新登录");
                this.props.toLoginPage();

                // message.error("图片提交失败");
                // this.setState({
                //     photoLoading: false
                // })
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
            // 图片校验
            if (!this.state.data_pic) {
                message.error("图片未提交");
                return
            }
            values.photo = this.state.data_pic;
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: global.config.baseUrl + '/banner/saveBanner',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: values,
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("banner添加成功");
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
                <Button type="primary" onClick={this.showModal}>新增</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
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
                    confirmLoading={this.state.confirmLoading}
                />
            </div>
        );
    }
}

//banner编辑表单
const ItemAEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, viewPic, effectPic, data_pic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoLoading, confirmLoading} = props;
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
                width={250}
                height={120}
                border={0}
                color={[255, 255, 255, 0.6]}
                scale={avatarEditor.scale}
                position={{x: avatarEditor.positionX, y: avatarEditor.positionY}}
                rotate={0}
            />
        );

        return (
            <Modal
                visible={visible}
                title="banner编辑"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="banner-add banner-form item-form">
                    <Form layout="vertical">
                        <FormItem className="photo longItem" {...formItemLayout_14} label="图片：">
                            {getFieldDecorator('photo', {
                                initialValue: viewPic,
                                rules: [{
                                    required: true,
                                    message: "图片不能为空"
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
                                    <Button type="primary" onClick={picHandle}
                                            loading={photoLoading}
                                            style={{
                                                position: "absolute",
                                                right: "-20px",
                                                bottom: "0"
                                            }}>图片提交</Button>
                                </div>
                            )}
                        </FormItem>
                        <FormItem className="title longItem" {...formItemLayout_14} label="图片描述：">
                            {getFieldDecorator('title', {
                                initialValue: data.title,
                                rules: [{
                                    required: true,
                                    message: '描述字段不能为空',
                                }],
                            })(
                                <Input placeholder="请输入图片描述"/>
                            )}
                        </FormItem>
                        <FormItem className="linkAddress longItem unnecessary" {...formItemLayout_14} label="跳转链接：">
                            {getFieldDecorator('linkAddress', {
                                initialValue: data.linkAddress,
                                rules: [{
                                    required: false
                                }],
                            })(
                                <Input placeholder="请输入图片跳转链接"/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//banner编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,
        // 初始信息
        data: {},
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

    getData = () => {
        // 初次写入时，初始图片，有效图片及保存待提交的图片均为当前详情photo
        this.setState({
            data: this.props.data,
            viewPic: "http://image.taoerxue.com/" + this.props.data.photo,
            effectPic: "http://image.taoerxue.com/" + this.props.data.photo,
            data_pic: this.props.data.photo,
        })
    };

    showModal = () => {
        // 初始信息写入
        this.getData();
        this.setState({visible: true});
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

    // 信息比对函数
    dataContrast = (values) => {
        // initValues为初始信息，传入的values为当前信息
        const initValues = this.state.data;
        // 代比对常规项
        const itemList = ["title", "photo", "linkAddress"];
        // 循环比对，有差异则将values对应项写入result
        const result = {};
        itemList.forEach((item) => {
            if (values[item] !== initValues[item]) {
                result[item] = values[item];
            }
        });
        if (JSON.stringify(result) === "{}") {
            // result为空对象，即没有信息改动，返回false
            return false;
        } else {
            // result有值，补全当前banner的Id项作为提交内容，返回result
            result.id = this.state.data.id;
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
        form.validateFields((err, values) => {
            // data_pic写入value
            values.photo = this.state.data_pic;
            // value与初始data进行比对，得到修改项集合
            const result = this.dataContrast(values);
            if (result) {
                // 有修改项，进行取消操作二次确认
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
                // 无修改项，直接执行取消操作函数
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
            // data_pic写入value
            values.photo = this.state.data_pic;
            // value与初始data进行比对，得到修改项集合
            const result = this.dataContrast(values);
            if (!result) {
                // 修改项为空则直接return
                message.error("暂无信息更改，无法提交");
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/banner/modifyBanner',
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
                        message.success("banner编辑成功");
                        // 编辑成功进行变量初始化
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
                        // 重新获取列表内容
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
                <ItemAEditForm
                    ref={this.saveFormRef}
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
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//banner列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            // 原始信息列表：用于在不请求详情接口的情况下进行信息详情展示
            dataOriginal: [],
            // 依据表格列配置生成的表格所需的信息列表
            data: []
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '描述',
                dataIndex: 'title',
                width: '30%',
                render: (text, record) => this.renderColumns(text, record, 'title'),
            },
            {
                title: '图片',
                dataIndex: 'photo',
                width: '8%',
                render: (text, record) => (<img style={{width: '30px', height: "18px"}} alt="" src={record["photo"]}/>)
            },
            {
                title: '跳转链接',
                dataIndex: 'linkAddress',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'linkAddress'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            <ItemEdit data={this.state.dataOriginal[record.index - 1]} recapture={this.getData}
                                      toLoginPage={this.props.toLoginPage} opStatus={this.props.opObj.modify}/>
                            <Popconfirm title="确认删除?"
                                        placement="topRight"
                                        onConfirm={() => this.deleteItem(record.id)}
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
        ]
    }

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    //获取信息
    getData = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/sys/banner/bannerList',
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
                const data = [];
                if (json.result === 0) {
                    json.data.forEach((item, index) => {
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            title: item.title,
                            photo: "http://image.taoerxue.com/" + item.photo,
                            linkAddress: item.linkAddress || "暂无"
                        });
                    });
                    this.setState({
                        loading: false,
                        data: data,
                        dataOriginal: json.data
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

    //banner删除
    deleteItem = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/banner/deleteBanner',
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
                    message.success("banner删除成功");
                    this.getData();
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
                            loading: false
                        })
                    }
                }
            }
        });
    };

    //表格参数变化处理
    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        this.setState({
            pagination: pager,
        });
    };

    componentWillMount() {
        this.getData();
    }

    componentWillReceiveProps(nextProps) {
        // flag_add改变，则重新获取列表内容
        if (nextProps.flag_add !== this.props.flag_add) {
            this.getData();
        }
    }

    render() {
        return <Table bordered
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={false}
                      columns={this.columns}
                      onChange={this.handleTableChange}/>;
    }
}

class Banner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            flag_add: false
        };
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
        });
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
        // 获取此菜单的操作权限
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
            <div className="banner">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                <span>banner列表</span>
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd opStatus={this.state.opObj.add} setFlag={this.setFlag}
                                             toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            <div className="table-box">
                                <DataTable opObj={this.state.opObj} flag_add={this.state.flag_add}
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

export default Banner;