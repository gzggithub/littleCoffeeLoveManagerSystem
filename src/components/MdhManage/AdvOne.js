import React, {Component} from 'react';
import {
    Tabs,
    Table,
    Input,
    Button,
    Modal,
    Form,
    Upload,
    Icon,
    Select,
    message,
    List,
    Slider,
    Row,
    Col,
    Popconfirm
} from 'antd';
import '../../config/config.js';
import reqwest from 'reqwest';
import AvatarEditor from 'react-avatar-editor'

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const FormItem = Form.Item;
const {Option} = Select;
const {TextArea} = Input;
const confirm = Modal.confirm;

//栅格设置
const formItemLayout_8 = {
    labelCol: {span: 4},
    wrapperCol: {span: 8},
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

//广告新增表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, setType, setKeyword, list, viewPic, effectPic, data_pic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoLoading, confirmLoading} = props;
        const {getFieldDecorator} = form;

        const children = [];
        list.forEach((item, index) => {
            children.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
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
            <Modal
                visible={visible}
                title="广告选择"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="advOne-add advOne-form item-form">
                    <Form layout="vertical">
                        <FormItem className="type" {...formItemLayout_8} label="类型：">
                            {getFieldDecorator('type', {
                                rules: [{
                                    required: true,
                                    message: '推荐广告类型不能为空',
                                }],
                            })(
                                <Select
                                    style={{width: '100%'}}
                                    placeholder="请选择推荐广告类型"
                                    onChange={setType}
                                >
                                    <Option value={0}>课程</Option>
                                    <Option value={1}>音频</Option>
                                </Select>
                            )}
                        </FormItem>
                        <FormItem className="keyword longItem" {...formItemLayout_14} label="关键词：">
                            {getFieldDecorator('keyword', {
                                rules: [{
                                    required: true,
                                    message: '关键词不能为空',
                                }]
                            })(
                                <Input placeholder="请输入关键词" onBlur={setKeyword}/>
                            )}
                        </FormItem>
                        <FormItem className="adv longItem" {...formItemLayout_14} label="内容选择：">
                            {getFieldDecorator('adv', {
                                rules: [{
                                    required: true,
                                    message: '广告内容不能为空',
                                }],
                            })(
                                <Select
                                    style={{width: '100%'}}
                                    placeholder="请选择推荐广告内容"
                                >
                                    {children}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem className="name longItem" {...formItemLayout_14} label="名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '广告名称不能为空',
                                }]
                            })(
                                <Input placeholder="请输入广告名称" onBlur={setKeyword}/>
                            )}
                        </FormItem>
                        <FormItem className="photo" {...formItemLayout_12} label="图片：">
                            {getFieldDecorator('photo', {
                                initialValue: viewPic,
                                rules: [{
                                    required: true,
                                    message: '课程图片不能为空',
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
                        <FormItem className="remark longItem unnecessary" {...formItemLayout_14} label="备注：">
                            {getFieldDecorator('remark', {
                                rules: [{
                                    required: false,
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写广告备注"
                                          autosize={{minRows: 3, maxRows: 10}}/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        )
    }
);

//广告新增组件
class ItemAdd extends Component {
    state = {
        visible: false,
        // 广告类型
        type: null,
        // 列表关键字
        keyword: "",
        // 列表内容
        list: [],
        // 图片相关变量--------------------------------------
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

    showModal = () => {
        this.setState({visible: true})
    };

    // 广告类型写入
    setType = (value) => {
        this.setState({
            type: value
        }, () => {
            this.getList();
        })
    };

    // 关键字写入
    setKeyword = (event) => {
        this.setState({
            keyword: event.target.value
        }, () => {
            this.getList()
        })
    };

    // 列表内容获取
    getList = () => {
        if (this.state.type !== null && this.state.keyword) {
            if (this.state.type === 0) {
                reqwest({
                    url: '/mdhCourse/courseList',
                    type: 'json',
                    method: 'post',
                    headers: {
                        Authorization: sessionStorage.token
                    },
                    data: {
                        state: 2,
                        name: this.state.keyword,
                    },
                    error: (XMLHttpRequest) => {
                        // const json = {
                        //     result: 0,
                        //     data: {
                        //         size: 20,
                        //         list: [
                        //             {id: 1, name: ""},
                        //         ]
                        //     }
                        // };
                    },
                    success: (json) => {
                        if (json.result === 0) {
                            this.setState({
                                list: json.data.list
                            })
                        }else{
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
            }
            if (this.state.type === 1) {
                reqwest({
                    url: '/mdhListenBook/list',
                    type: 'json',
                    method: 'post',
                    headers: {
                        Authorization: sessionStorage.token
                    },
                    data: {
                        state: 2,
                        name: this.state.keyword,
                    },
                    error: (XMLHttpRequest) => {
                        // const json = {
                        //     result: 0,
                        //     data: {
                        //         size: 20,
                        //         list: [
                        //             {id: 1, name: "最好的钢琴课"},
                        //             {id: 2, name: "最好的钢琴课"},
                        //             {id: 3, name: "最好的钢琴课"}
                        //         ]
                        //     }
                        // };
                    },
                    success: (json) => {
                        if (json.result === 0) {
                            this.setState({
                                list: json.data.list
                            })
                        }else{
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
            }
        }
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

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
                    type: null,
                    keyword: "",
                    list: [],
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
            if (!this.state.data_pic) {
                message.error("图片未提交");
                return
            }
            values.photo = this.state.data_pic;
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/mdhAdvertisement/addAdvertisement',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    belongId: values.adv,
                    name: values.name,
                    type: this.state.type,
                    photo: values.photo,
                    remark: values.remark
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败")
                    this.setState({
                        confirmLoading: false
                    });
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("广告添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                type: null,
                                keyword: "",
                                list: [],
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
                <Button type="primary" onClick={this.showModal}>选择</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    loading={false}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    setType={this.setType}
                    setKeyword={this.setKeyword}
                    list={this.state.list}
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

//广告详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        data: "",
        loading: true,
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
            url: '/mdhAdvertisement/getAdvertisement',
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
                //         advertisement: {
                //             id: null,
                //             name: "",
                //             photo: "",
                //             type: null,
                //             createTime: "",
                //             examineTime: "",
                //             remark: "\n" + "\n" + "",
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
                        data: json.data.advertisement
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
        this.setState({visible: false});
    };

    render() {
        let dataSource;
        if (this.state.data) {
            let tempType = "";
            if (this.state.data.type === 0) {
                tempType = "课程";
            }
            if (this.state.data.type === 1) {
                tempType = "音频";
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
                    <span className="item-name">名称：</span>
                    <span className="item-content">{this.state.data.name}</span>
                </div>,
                <div className="type">
                    <span className="item-name">广告类型：</span>
                    <span className="item-content">{tempType}</span>
                </div>,
                <div className="photo">
                    <span className="item-name">图片：</span>
                    <img src={"http://image.taoerxue.com/" + this.state.data.photo} alt="" className="item-content"/>
                </div>,
                <div className="remark">
                    <span className="item-name">备注：</span>
                    <pre>
										<span className="item-content">{this.state.data.remark || "暂无"}</span>
								</pre>
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
                <Modal
                    title="广告详情"
                    width={600}
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                    destroyOnClose={true}
                >
                    <div className="advOne-details item-details">
                        <div className="advOne-baseData">
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

//广告列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.advOneSize) || 10,
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
                title: '名称',
                dataIndex: 'name',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*详情*/}
                            <ItemDetails id={record.id} toLoginPage={this.props.toLoginPage} opStatus={this.props.opObj.select}/>
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
                        </div>
                    );
                },
            }
        ]
    }

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    //获取本页信息
    getData = (type, keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/mdhAdvertisement/getAdvertisementList',
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
                //                 id: null,
                //                 name: "",
                //                 photo: "",
                //                 type: null,
                //                 createTime: "",
                //                 examineTime: "",
                //                 opinion: "",
                //                 state: 0
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
            url: '/mdhAdvertisement/submitAdvertisement',
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
            url: '/mdhAdvertisement/cancelAdvertisement',
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
            url: '/mdhAdvertisement/dropAdvertisement',
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
                    message.success("广告下架成功");
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
            url: '/mdhAdvertisement/deleteAdvertisement',
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
                    message.success("广告删除成功");
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
        localStorage.advOneSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.advOneSize);
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

class AdvOne extends Component {
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
            <div className="advOne">
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
                                {/*广告添加*/}
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd opStatus={this.state.opObj.add} setFlag={this.setFlag} toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            <div className="keyWord clearfix">
                                <Search
                                    placeholder="请输入广告名称信息"
                                    onSearch={this.search}
                                    enterButton
                                    style={{width: "320px", float: "left"}}
                                />
                            </div>
                            {/*广告列表*/}
                            <div className="table-box">
                                <DataTable opObj={this.state.opObj} type={this.state.type} keyword={this.state.keyword}
                                           flag_add={this.state.flag_add} toLoginPage={this.toLoginPage}/>
                            </div>
                        </div>
                        :
                        <p>暂无查询权限</p>
                }

            </div>
        )
    }
}

export default AdvOne;