import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    Form,
    List,
    Select,
    Upload,
    Slider,
    Row,
    Col,
    Icon,
    Cascader,
    InputNumber,
    message,
    Popconfirm,
    Spin,
} from 'antd';
import '../../config/config.js';
import reqwest from 'reqwest';
import AvatarEditor from 'react-avatar-editor';

const Search = Input.Search;
const FormItem = Form.Item;
const {TextArea} = Input;
const {Option} = Select;
const confirm = Modal.confirm;

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
    <div>{value}</div>
);
//可编辑单元格
const EditableCell = ({editable, value, onChange}) => (
    <div>
        {editable
            ? <Input style={{margin: '-5px 0'}} value={value} onChange={e => onChange(e.target.value)}/>
            : value
        }
    </div>
);

//新增商品表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, viewPic, effectPic, data_pic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoLoading, typeList, labelList, confirmLoading} = props;
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
                width={120}
                height={86}
                border={0}
                color={[255, 255, 255, 0.6]}
                scale={avatarEditor.scale}
                position={{x: avatarEditor.positionX, y: avatarEditor.positionY}}
                rotate={0}
            />
        );

        //商品类别选择
        const optionsOfTypeList = [];
        typeList.forEach((item) => {
            let children = [];
            if (item.list) {
                item.list.forEach((subItem) => {
                    children.push({value: subItem.id, label: subItem.name})
                });
            }
            if (children.length) {
                optionsOfTypeList.push({value: item.id, label: item.name, children: children})
            }
        });

        //商品标签选择
        const optionsOfLabelList = [];
        labelList.forEach((item, index) => {
            optionsOfLabelList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>)
        });

        return (
            <Modal
                visible={visible}
                title="添加商品"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="goods-add goods-form item-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_8} label="商品名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '商品名称不能为空',
                                }],
                            })(
                                <Input placeholder="请输入商品名称"/>
                            )}
                        </FormItem>
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
                        <FormItem className="classId" {...formItemLayout_8} label="商品类别：">
                            {getFieldDecorator('classId', {
                                rules: [{
                                    required: true,
                                    message: '商品类别不能为空',
                                }],
                            })(
                                <Cascader options={optionsOfTypeList} placeholder="请选择商品类别"/>
                            )}
                        </FormItem>
                        <FormItem className="labels" {...formItemLayout_8} label="商品标签：">
                            {getFieldDecorator('labels', {
                                rules: [{
                                    required: true,
                                    message: '商品标签不能为空',
                                }],
                            })(
                                <Select
                                    mode="multiple"
                                    style={{width: '100%'}}
                                    placeholder="请选择商品标签"
                                >
                                    {optionsOfLabelList}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem className="details longItem" {...formItemLayout_14} label="商品详情：">
                            {getFieldDecorator('details', {
                                rules: [{
                                    required: true,
                                    message: '商品详情不能为空',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写商品详情"
                                          autosize={{minRows: 5, maxRows: 10}}/>
                            )}
                        </FormItem>
                        <FormItem className="originalPrice" {...formItemLayout_10} label="商品原价：">
                            {getFieldDecorator('originalPrice', {
                                rules: [{
                                    required: true,
                                    message: '商品价格不能为空',
                                }],
                            })(
                                <InputNumber min={0} precision={2} step={100}/>
                            )}
                        </FormItem>
                        <FormItem className="price" {...formItemLayout_10} label="价格区间：">
                            {getFieldDecorator('price', {
                                rules: [{
                                    required: true,
                                    message: '商品价格区间不能为空',
                                }],
                            })(
                                <Input placeholder="请输入商品价格区间（￥）"/>
                            )}
                        </FormItem>
                        <FormItem className="address longItem" {...formItemLayout_14} label="发货地址：">
                            {getFieldDecorator('address', {
                                rules: [{
                                    required: true,
                                    message: '发货地址不能为空',
                                }],
                            })(
                                <Input placeholder="请输入发货地址"/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//新增商品组件
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
        // 类型列表
        typeList: [],
        // 标签列表
        labelList: [],
        // 确认按钮状态变量
        confirmLoading: false
    };

    getTypeList = () => {
        reqwest({
            url: '/goods/getGoodsTypeList',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: [
                //         {
                //             id: 1,
                //             name: "",
                //             status: 0,
                //             list: [
                //                 {id: 11, name: "11"},
                //                 {id: 12, name: "12"},
                //                 {id: 13, name: "13"},
                //             ]
                //         },
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        typeList: json.data
                    });
                }
            }
        });
    };

    getLabelList = () => {
        reqwest({
            url: '/goodsLabels/getGoodsLabelsList',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: [
                //         {
                //             id: 1,
                //             name: "7天无理由退款",
                //             status: 0
                //         },
                //         {
                //             id: 2,
                //             name: "1年保修",
                //             status: 0
                //         },
                //         {
                //             id: 3,
                //             name: "3年售后",
                //             status: 0
                //         }
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        labelList: json.data
                    });
                }
            }
        });
    };

    showModal = () => {
        this.getTypeList();
        this.getLabelList();
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

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false,
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
                    typeList: [],
                    labelList: [],
                    confirmLoading: false
                })
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
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            values.photo = this.state.data_pic;
            values.classId = values.classId[1];
            values.labels = values.labels.join();
            reqwest({
                url: '/goods/saveGoods',
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
                        message.success("商品添加成功");
                        this.setState({
                            visible: false,
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
                                typeList: [],
                                labelList: [],
                                confirmLoading: false
                            })
                        });
                        this.props.setFlag()
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
            <div>
                <Button type="primary" onClick={this.showModal}>添加商品</Button>
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
                    typeList={this.state.typeList}
                    labelList={this.state.labelList}
                    confirmLoading={this.state.confirmLoading}
                />
            </div>
        );
    }
}

//商品信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, viewPic, effectPic, data_pic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoLoading, typeList, labelList, confirmLoading} = props;
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
                width={120}
                height={86}
                border={0}
                color={[255, 255, 255, 0.6]}
                scale={avatarEditor.scale}
                position={{x: avatarEditor.positionX, y: avatarEditor.positionY}}
                rotate={0}
            />
        );

        //商品类别选择
        const optionsOfTypeList = [];
        typeList.forEach((item) => {
            let children = [];
            if (item.list) {
                item.list.forEach((subItem) => {
                    children.push({value: subItem.id, label: subItem.name})
                });
            }
            if (children.length) {
                optionsOfTypeList.push({value: item.id, label: item.name, children: children})
            }
        });

        //商品标签选择
        const optionsOfLabelList = [];
        labelList.forEach((item, index) => {
            optionsOfLabelList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>)
        });

        return (
            <Modal
                visible={visible}
                title="商品编辑"
                width={600}
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
                        <div className="goods-edit goods-form item-form">
                            <Form layout="vertical">
                                <FormItem className="name" {...formItemLayout_8} label="商品名称：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.name,
                                        rules: [{
                                            required: true,
                                            message: '商品名称不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入商品名称"/>
                                    )}
                                </FormItem>
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
                                <FormItem className="classId" {...formItemLayout_8} label="商品类别：">
                                    {getFieldDecorator('classId', {
                                        initialValue: data.classId ? [data.parentClassId, data.classId] : null,
                                        rules: [{
                                            required: true,
                                            message: '商品类别不能为空',
                                        }],
                                    })(
                                        <Cascader options={optionsOfTypeList} placeholder="请选择商品类别"/>
                                    )}
                                </FormItem>
                                <FormItem className="labels" {...formItemLayout_8} label="商品标签：">
                                    {getFieldDecorator('labels', {
                                        initialValue: data.labels ? data.labels.split(",").map((item) => Number(item)) : [],
                                        rules: [{
                                            required: true,
                                            message: '商品标签不能为空',
                                        }],
                                    })(
                                        <Select
                                            mode="multiple"
                                            style={{width: '100%'}}
                                            placeholder="请选择商品标签"
                                        >
                                            {optionsOfLabelList}
                                        </Select>
                                    )}
                                </FormItem>
                                <FormItem className="details noInput longItem" {...formItemLayout_14} label="商品详情：">
                                    {getFieldDecorator('details', {
                                        initialValue: data.details,
                                        rules: [{
                                            required: true,
                                            message: '商品详情不能为空',
                                        }],
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写商品详情"
                                                  autosize={{minRows: 5, maxRows: 10}}/>
                                    )}
                                </FormItem>
                                <FormItem className="originalPrice" {...formItemLayout_10} label="商品原价：">
                                    {getFieldDecorator('originalPrice', {
                                        initialValue: data.originalPrice,
                                        rules: [{
                                            required: true,
                                            message: '商品价格不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入商品价格（￥）"/>
                                    )}
                                </FormItem>
                                <FormItem className="price" {...formItemLayout_10} label="价格区间：">
                                    {getFieldDecorator('price', {
                                        initialValue: data.price,
                                        rules: [{
                                            required: true,
                                            message: '商品价格区间不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入商品价格区间（￥）"/>
                                    )}
                                </FormItem>
                                <FormItem className="address longItem" {...formItemLayout_14} label="发货地址：">
                                    {getFieldDecorator('address', {
                                        initialValue: data.address,
                                        rules: [{
                                            required: true,
                                            message: '发货地址不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入发货地址"/>
                                    )}
                                </FormItem>
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

//商品信息编辑组件
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
        // 商品类别列表
        typeList: this.props.typeList || [],
        // 商品标签列表
        labelList: [],
        confirmLoading: false
    };

    // 获取商品分类列表
    getTypeList = () => {
        reqwest({
            url: '/goods/getGoodsTypeList',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: [
                //         {
                //             id: 1,
                //             name: "",
                //             status: 0,
                //             list: [
                //                 {
                //                     id: 11,
                //                     name: "11",
                //                 },
                //                 {
                //                     id: 12,
                //                     name: "12",
                //                 }
                //             ]
                //         },
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        typeList: json.data
                    });
                }
            }
        });
    };

    // 获取商品标签列表
    getLabelList = () => {
        reqwest({
            url: '/goodsLabels/getGoodsLabelsList',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: [
                //         {
                //             id: 1,
                //             name: "7天无理由退款",
                //             status: 0
                //         },
                //         {
                //             id: 2,
                //             name: "1年保修",
                //             status: 0
                //         },
                //         {
                //             id: 3,
                //             name: "3年售后",
                //             status: 0
                //         }
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        labelList: json.data
                    });
                }
            }
        });
    };

    getData = () => {
        reqwest({
            url: '/goods/getDetail',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: this.props.id
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         goodsDetail: {
                //             id: 1,
                //             name: "",
                //             photo: "",
                //             parentClassId: null,
                //             classId: null,
                //             className: "",
                //             originalPrice: "",
                //             price: "",
                //             labels: "",
                //             details: "",
                //             address: "",
                //             status: 1,
                //         }
                //     },
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        data: json.data.goodsDetail,
                        viewPic: "http://image.taoerxue.com/" + json.data.goodsDetail.photo,
                        data_pic: json.data.goodsDetail.photo
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
        if (!this.state.typeList.length) {
            this.getTypeList();
        }
        this.getLabelList();
        this.setState({
            visible: true,
        })
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
        const itemList = ["name", "photo", "classId", "labels", "details", "originalPrice", "price", "address"];
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
            result.id = this.props.id;
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
                    typeList: [],
                    labelList: [],
                    confirmLoading: false
                })
            })
        };
        // data空值处理
        if (JSON.stringify(this.state.data) === "{}") {
            cancel();
            return;
        }
        form.validateFields((err, values) => {
            values.photo = this.state.data_pic;
            values.classId = values.classId ? values.classId[1] : null;
            values.labels = values.labels.join();
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
                this.setState({visible: false}, () => {
                    form.resetFields();
                })
            }
        })
    };

    handleCreate = () => {
        // data空值处理
        if (JSON.stringify(this.state.data) === "{}") {
            return;
        }
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            values.photo = this.state.data_pic;
            values.classId = values.classId[1];
            values.labels = values.labels.join();
            const result = this.dataContrast(values);
            if (!result) {
                message.error("暂无信息更改，无法提交");
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/goods/modifyShop',
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
                        message.success("商品信息修改成功");
                        this.setState({
                            visible: false,
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
                                typeList: [],
                                labelList: [],
                                confirmLoading: false
                            })
                        });
                        this.props.recapture();
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
            <a>
                <span onClick={() => this.showModal()}>编辑</span>
                <ItemEditForm
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
                    typeList={this.state.typeList}
                    labelList={this.state.labelList}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//商品详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        data: "",
        loading: true
    };

    getData = () => {
        reqwest({
            url: '/goods/getDetail',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: this.props.id
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                })
                // const json = {
                //     result: 0,
                //     data: {
                //         goodsDetail: {
                //             id: 122,
                //             name: "最好的钢琴",
                //             photo: "dda203fb72964df880aaaeb15539f5ca.jpg",
                //             parentClassId: 1,
                //             classId: 11,
                //             originalPrice: "180.00",
                //             labels: "7天无条件退货",
                //             details: "最好的钢琴最好的钢琴最好的钢琴最好的钢琴最好的钢琴最好的钢琴最好的钢琴最好的钢琴最好的钢琴",
                //             address: "浙江省杭州市余杭区",
                //             status: 1,
                //         }
                //     },
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        data: json.data.goodsDetail,
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
        if (this.state.data) {
            // 分类名称写入
            let parentClassName = "";
            let className = "";
            this.props.typeList.forEach((typeItem) => {
                if (this.state.data.parentClassId === typeItem.id) {
                    parentClassName = typeItem.name;
                    typeItem.list.forEach((subTypeItem) => {
                        if (this.state.data.classId === subTypeItem.id) {
                            className = subTypeItem.name;
                        }
                    })
                }
            });
            dataSource = [
                <div className="name">
                    <span className="item-name">商品名称：</span>
                    <span className="item-content">{this.state.data.name}</span>
                </div>,
                <div className="photo">
                    <span className="item-name">照片：</span>
                    <img src={"http://image.taoerxue.com/" + this.state.data.photo} alt="" className="item-content"/>
                </div>,
                <div className="price">
                    <span className="item-name">单价：</span>
                    <span className="item-content">{this.state.data.originalPrice}</span>
                </div>,
                <div className="className">
                    <span className="item-name">商品类别：</span>
                    <span className="item-content">{parentClassName + "/" + className}</span>
                </div>,
                <div className="details">
                    <span className="item-name">详情：</span>
                    <span className="item-content">{this.state.data.details}</span>
                </div>,
                <div className="address">
                    <span className="item-name">发货地址：</span>
                    <span className="item-content">{this.state.data.address}</span>
                </div>,
                <div className="status">
                    <span className="item-name">状态：</span>
                    <span className="item-content">{this.state.data.status}</span>
                </div>,
            ];
        } else {
            dataSource = ""
        }
        return (
            <a>
                <span onClick={() => this.showModal(this.props.id)}>详情</span>
                <Modal
                    title="商品详情"
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                    destroyOnClose={true}
                >
                    <div className="goods-details">
                        <div className="goods-baseData">
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

//商品规格列表表格
const GoodsSpeListTable = Form.create()(
    (props) => {
        const {visible, loading, onCancel, onCreate, pagination, data, columns, pageChange} = props;

        return (
            <Modal
                width={800}
                visible={visible}
                title="商品规格列表"
                footer={null}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
            >
                <div className="goodsSpe-list">
                    <Table bordered pagination={pagination} dataSource={data} columns={columns}
                           onChange={pageChange} loading={loading}/>
                </div>
            </Modal>
        );
    }
);

//商品规格列表组件
class GoodsSpeList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            loading: true,
            data: [],
            pagination: {
                current: 1,
                pageSize: 5,
            },
        };
        this.cacheData = [];
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '规格名称',
                dataIndex: 'name',
                width: '30%',
                render: (text, record) => this.renderEditableColumns(text, record, 'name'),
            },
            {
                title: '价格',
                dataIndex: 'price',
                width: '15%',
                render: (text, record) => this.renderEditableColumns(text, record, 'price'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    const {editable} = record;
                    return (
                        <div className="editable-row-operations">
                            {
                                editable ?
                                    <span>
                                        <a onClick={() => this.save(record.key)}>保存</a>
                                        <Popconfirm title="确认取消?" onConfirm={() => this.cancel(record.key)}>
                                            <a>取消</a>
                                        </Popconfirm>
                                    </span>
                                    : <a onClick={() => this.edit(record.key)}>编辑</a>
                            }
                            <Popconfirm title="确认删除?"
                                        placement="topRight"
                                        onConfirm={() => this.itemDelete(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="立即删除"
                                        cancelText="取消">
                                {
                                    editable ?
                                        null :
                                        <a>删除</a>
                                }
                            </Popconfirm>
                        </div>
                    );
                },
            }
        ];
    }

    getData = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/goods/getSpecifications',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                goodsId: this.props.id
            },
            error: (XMLHttpRequest) => {
                message.error("获取失败");
                this.setState({
                    loading: false
                })
                // const json = {
                //     result: 0,
                //     data: [
                //         {
                //             id: 1,
                //             name: "书法课书法课书法课书法课",
                //             price: "500.00"
                //         },
                //         {
                //             id: 2,
                //             name: "书法课书法课书法课书法课",
                //             price: "500.00"
                //         },
                //         {
                //             id: 3,
                //             name: "书法课书法课书法课书法课",
                //             price: "500.00"
                //         }
                //     ]
                // };
            },
            success: (json) => {
                const data = [];
                if (json.result === 0) {
                    json.data.forEach((item, index) => {
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            name: item.name,
                            price: item.price,
                        });
                    });
                    //原始数据深拷贝
                    this.cacheData = data.map(item => ({...item}));
                    this.setState({
                        loading: false,
                        data: data,
                        pagination: {
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
        })
    };

    showModal = () => {
        this.getData();
        this.setState({visible: true});
    };

    //规格删除
    itemDelete = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/goods/deleteGoodsSpecifications',
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
                    message.success("商品规格删除成功");
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

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    //可编辑列渲染
    renderEditableColumns(text, record, column) {
        return (
            <EditableCell
                editable={record.editable}
                value={text}
                onChange={value => this.handleChange(value, record.key, column)}
            />
        );
    }

    handleChange(value, key, column) {
        const newData = [...this.state.data];
        const target = newData.filter(item => key === item.key)[0];
        if (target) {
            target[column] = value;
            this.setState({data: newData});
        }
    }

    //编辑
    edit(key) {
        const newData = [...this.state.data];
        const target = newData.filter(item => key === item.key)[0];
        if (target) {
            target.editable = true;
            this.setState({data: newData});
        }
    }

    //编辑保存前的内容处理
    dataContrast = (value, initValue, id) => {
        const itemList = ["name", "price"];
        const result = {};
        itemList.forEach((item) => {
            if (value[item] !== initValue[item]) {
                result[item] = value[item];
            }
        });
        if (JSON.stringify(result) === "{}") {
            return false;
        } else {
            result.id = id;
            return result;
        }
    };

    //编辑保存
    save(key) {
        const newData = [...this.state.data];
        const target = newData.filter(item => key === item.key)[0];
        if (target) {
            const result = this.dataContrast(target, this.cacheData.filter(item => key === item.key)[0], target.id);
            if (!result) {
                return;
            }
            this.setState({
                loading: true
            });
            reqwest({
                url: '/goods/modifySpecification',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: result,
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    Object.assign(target, this.cacheData.filter(item => key === item.key)[0]);
                    delete target.editable;
                    this.setState({
                        loading: false,
                        data: newData,
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("商品规格编辑成功");
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
                            Object.assign(target, this.cacheData.filter(item => key === item.key)[0]);
                            delete target.editable;
                            this.setState({
                                loading: false,
                                data: newData,
                            })
                        }
                    }
                }
            })
        }
    }

    //编辑取消
    cancel(key) {
        const newData = [...this.state.data];
        const target = newData.filter(item => key === item.key)[0];
        if (target) {
            Object.assign(target, this.cacheData.filter(item => key === item.key)[0]);
            delete target.editable;
            this.setState({data: newData});
        }
    }

    //页码变化处理
    pageChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        })
    };

    handleCancel = () => {
        this.setState({visible: false})
    };

    render() {
        return (
            <a>
                <span onClick={() => this.showModal(this.props.id)}>规格列表</span>
                <GoodsSpeListTable
                    visible={this.state.visible}
                    loading={this.state.loading}
                    onCancel={this.handleCancel}
                    pagination={this.state.pagination}
                    data={this.state.data}
                    columns={this.columns}
                    pageChange={this.pageChange}
                />
            </a>
        );
    }
}

//添加商品规格表单
const GoodsSpeAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="添加商品规格"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="goodsSpe-add goodsSpe-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_8} label="规格名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '规格名称不能为空'
                                }]
                            })(
                                <Input placeholder="请输入规格名称"/>
                            )}
                        </FormItem>
                        <FormItem className="price" {...formItemLayout_8} label="价格(￥)：">
                            {getFieldDecorator('price', {
                                rules: [{
                                    required: true,
                                    message: '价格不能为空'
                                }]
                            })(
                                <InputNumber min={0} precision={2} step={100}/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//添加商品规格组件
class GoodsSpeAdd extends Component {
    state = {
        visible: false,
        confirmLoading: false
    };

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
                    confirmLoading: false
                })
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
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/goods/saveGoodsSpecifications',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    goodsId: this.props.id,
                    name: values.name,
                    price: values.price,
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("商品规格添加成功");
                        this.setState({
                            visible: false,
                        }, () => {
                            this.setState({
                                confirmLoading: false
                            })
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
            })
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a>
                <span onClick={() => this.showModal(this.props.id)}>添加规格</span>
                <GoodsSpeAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//店铺信息编辑表单
const ShopEditForm = Form.create()(
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
                width={120}
                height={86}
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
                title="店铺编辑"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="shop-edit shop-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_12} label="店铺名称：">
                            {getFieldDecorator('name', {
                                initialValue: data.name,
                                rules: [{
                                    required: true,
                                    message: '店铺名称不能为空',
                                }],
                            })(
                                <Input placeholder="请输入店铺名称"/>
                            )}
                        </FormItem>
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
                        <FormItem className="details noInput longItem" {...formItemLayout_14} label="店铺简介：">
                            {getFieldDecorator('details', {
                                initialValue: data.details,
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

//店铺信息编辑组件
class ShopEdit extends Component {
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
        reqwest({
            url: '/shop/getDetail',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         shopDetails: {
                //             id: 122,
                //             name: "最好的钢琴",
                //             photo: "dda203fb72964df880aaaeb15539f5ca.jpg",
                //             details: "最好的钢琴最好的钢琴最好的钢琴最好的钢琴最好的钢琴最好的钢琴最好的钢琴最好的钢琴最好的钢琴"
                //         }
                //     },
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        data: json.data.shopDetails,
                        viewPic: "http://image.taoerxue.com/" + json.data.shopDetails.photo,
                        data_pic: json.data.shopDetails.photo
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
            visible: true,
        })
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
        const itemList = ["name", "photo", "details"];
        const result = {};
        itemList.forEach((item) => {
            if (values[item] !== initValues[item]) {
                result[item] = values[item];
            }
        });
        if (JSON.stringify(result) === "{}") {
            return false;
        } else {
            return result;
        }
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({visible: false}, () => {
                this.setState({
                    data: {},
                    viewPic: "",
                    effectPic: "",
                    data_pic: "",
                    avatarEditor: {
                        scale: 1,
                        positionX: 0.5,
                        positionY: 0.5,
                    },
                    photoLoading: false,
                    confirmLoading: false
                })
            })
        };
        // data空值处理
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
                cancel();
            }
        })
    };

    handleCreate = () => {
        // data空值处理
        if (JSON.stringify(this.state.data) === "{}") {
            return;
        }
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            values.photo = this.state.data_pic;
            const result = this.dataContrast(values);
            if (!result) {
                message.error("暂无信息更改，无法提交");
                return
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/shop/modifyShop',
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
                        message.success("店铺信息修改成功");
                        this.setState({
                            visible: false,
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
                                confirmLoading: false,
                            })
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
            })
        });
    };

    saveFormRef = (form) => {
        this.form = form
    };

    render() {
        return (
            <div>
                <Button type="primary" onClick={this.showModal}>店铺编辑</Button>
                <ShopEditForm
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
            </div>
        );
    }
}

//店铺详情组件
class ShopDetails extends Component {
    state = {
        visible: false,
        data: "",
        loading: true
    };

    getData = () => {
        reqwest({
            url: '/shop/getDetail',
            type: 'json',
            method: 'post',
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
                //         shopDetails: {
                //             id: 122,
                //             name: "最好的钢琴",
                //             photo: "dda203fb72964df880aaaeb15539f5ca.jpg",
                //             details: "最好的钢琴最好的钢琴最好的钢琴最好的钢琴最好的钢琴最好的钢琴最好的钢琴最好的钢琴最好的钢琴"
                //         }
                //     },
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        data: json.data.shopDetails
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
        if (this.state.data) {
            dataSource = [
                <div className="name">
                    <span className="item-name">店铺名称：</span>
                    <span className="item-content">{this.state.data.name}</span>
                </div>,
                <div className="photo">
                    <span className="item-name">照片：</span>
                    <img src={"http://image.taoerxue.com/" + this.state.data.photo} alt="" className="item-content"/>
                </div>,
                <div className="details">
                    <span className="item-name">简介：</span>
                    <span className="item-content">{this.state.data.details}</span>
                </div>
            ];
        } else {
            dataSource = ""
        }
        return (
            <div>
                <Button type="primary" onClick={this.showModal}>店铺详情</Button>
                <Modal
                    title="店铺详情"
                    width={600}
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                    destroyOnClose={true}
                >
                    <div className="shop-details">
                        <div className="shop-baseData">
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
            </div>
        );
    }
}

//商品列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            typeList: [],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.goodsPageSize) || 10,
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
                title: '商品名称',
                dataIndex: 'name',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: "分类名称",
                dataIndex: "className",
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, "className"),
            },
            {
                title: '单价',
                dataIndex: 'price',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'price'),
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
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*商品详情*/}
                            <ItemDetails id={record.id} typeList={this.state.typeList}
                                         toLoginPage={this.props.toLoginPage}/>
                            {/*商品编辑*/}
                            <ItemEdit id={record.id} typeList={this.state.typeList} recapture={this.getData}
                                      toLoginPage={this.props.toLoginPage}/>
                            <Popconfirm title={record.statusCode === 1 ? "确认下架?" : "确认上架？"}
                                        placement="topRight"
                                        onConfirm={() => this.modifyGoodsStatus(record.id, record.statusCode)}
                                        onCancel=""
                                        okType="danger"
                                        okText="确认"
                                        cancelText="取消">
                                <a>{record.statusCode === 1 ? "下架" : "上架"}</a>
                            </Popconfirm>
                            {/*商品规格添加*/}
                            <GoodsSpeAdd id={record.id} toLoginPage={this.props.toLoginPage}/>
                            {/*商品规格列表*/}
                            <GoodsSpeList id={record.id} toLoginPage={this.props.toLoginPage}/>
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

    //获取本页信息
    getData = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/goods/getGoodsList',
            type: 'json',
            method: 'post',
            data: {
                keyWord: para || this.props.keyword,
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
                })
                // const json = {
                //     result: 0,
                //     data: {
                //         size: 100,
                //         list: [
                //             {
                //                 id: 1,
                //                 name: "",
                //                 parentClassId: 1,
                //                 classId: 11,
                //                 className: "",
                //                 originalPrice: "",
                //                 status: 1
                //             },
                //         ]
                //     }
                // };
            },
            success: (json) => {
                const data = [];
                if (json.result === 0) {
                    json.data.list.forEach((item, index) => {
                        // 分类名称写入
                        let parentClassName = "";
                        let className = "";
                        this.state.typeList.forEach((typeItem) => {
                            if (item.parentClassId === typeItem.id) {
                                parentClassName = typeItem.name;
                                typeItem.list.forEach((subTypeItem) => {
                                    if (item.classId === subTypeItem.id) {
                                        className = subTypeItem.name;
                                    }
                                })
                            }
                        });
                        // 状态写入
                        let tempStatus = "";
                        if (item.status === 0) {
                            tempStatus = "未上架"
                        }
                        if (item.status === 1) {
                            tempStatus = "已上架"
                        }
                        if (item.status === 2) {
                            tempStatus = "已下架"
                        }
                        if (item.status === 3) {
                            tempStatus = "封禁"
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            name: item.name,
                            className: parentClassName + "/" + className,
                            price: item.originalPrice,
                            statusCode: item.status,
                            status: tempStatus
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

    //获取商品分类列表
    getGoodsTypeList = () => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/goods/getGoodsTypeList',
            type: 'json',
            method: 'post',
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
                //     data: [
                //         {
                //             id: 1,
                //             name: "分类1",
                //             status: 0,
                //             list: [
                //                 {
                //                     id: 11,
                //                     name: "分类11",
                //                     status: 0,
                //                 }
                //             ]
                //         },
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        typeList: json.data
                    }, () => {
                        this.getData();
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

    //商品封禁
    banItem = (para) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/goods/banGoods',
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
                    message.success("商品下架成功");
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

    //商品状态设置
    modifyGoodsStatus = (id, status) => {
        let tempStatus = 0;
        if (status === 1) {
            tempStatus = 2
        } else {
            tempStatus = 1
        }
        this.setState({
            loading: true
        });
        reqwest({
            url: '/goods/modifyGoodsStatus',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: id,
                status: tempStatus
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    if (tempStatus === 1) {
                        message.success("商品上架成功");
                    }
                    if (tempStatus === 2) {
                        message.success("商品下架成功");
                    }
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
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.goodsPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.goodsPageSize);
        this.setState({
            pagination: pager,
        }, () => {
            this.getData();
        });
    };

    componentWillMount() {
        this.getGoodsTypeList();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.keyword === this.props.keyword && nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData(nextProps.keyword);
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

class Goods extends Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: "",
            flag_add: false
        }
    }

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
            <div className="goods">
                <header className="clearfix">
                    <Search
                        placeholder="请输入商品名称"
                        onSearch={this.search}
                        enterButton
                        style={{width: "320px", float: "left"}}
                    />
                    {/*商品添加*/}
                    <div className="add-button" style={{float: "right"}}>
                        <ItemAdd setFlag={this.setFlag} toLoginPage={this.toLoginPage}/>
                    </div>
                    {/*店铺编辑*/}
                    <div className="add-button" style={{float: "right", marginRight: "40px"}}>
                        <ShopEdit toLoginPage={this.toLoginPage}/>
                    </div>
                    {/*店铺详情*/}
                    <div className="add-button" style={{float: "right", marginRight: "40px"}}>
                        <ShopDetails toLoginPage={this.toLoginPage}/>
                    </div>
                </header>
                {/*商品列表*/}
                <div className="table-box">
                    <DataTable keyword={this.state.keyword} flag_add={this.state.flag_add}
                               toLoginPage={this.toLoginPage}/>
                </div>
            </div>
        )
    }
}

export default Goods;