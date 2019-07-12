import React, {Component} from 'react';
import {
    Tabs,
    Table,
    Input,
    InputNumber,
    Button,
    Modal,
    Form,
    Select,
    Upload,
    Slider,
    Row,
    Col,
    Radio,
    Icon,
    message,
    List,
    Popconfirm,
    TreeSelect,
    Spin
} from 'antd';
import reqwest from 'reqwest';
import AvatarEditor from 'react-avatar-editor'

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const FormItem = Form.Item;
const {TextArea} = Input;
const {Option} = Select;
const RadioGroup = Radio.Group;
const confirm = Modal.confirm;

//栅格设置
const formItemLayout_8 = {
    labelCol: {span: 4},
    wrapperCol: {span: 8}
};
const formItemLayout_12 = {
    labelCol: {span: 4},
    wrapperCol: {span: 12}
};
const formItemLayout_14 = {
    labelCol: {span: 4},
    wrapperCol: {span: 14}
};

//单元格
const Cell = ({value}) => (<div> {value}</div>);

//教师审核表单
const ItemCheckForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, opinionStatus, setOpinionStatus, confirmLoading} = props;
        const {getFieldDecorator} = form;
        let opinionClass = "opinion longItem unnecessary";
        if (opinionStatus) {
            opinionClass = "opinion longItem"
        }

        return (
            <Modal visible={visible}
                   title="教师审核"
                   width={600}
                   onCancel={onCancel}
                   onOk={onCreate}
                   destroyOnClose={true}
                   confirmLoading={confirmLoading}>
                <div className="teacherCheck-form">
                    <Form layout="vertical">
                        <FormItem className="state" {...formItemLayout_8} label="审核结果：">
                            {getFieldDecorator('state', {
                                rules: [{
                                    required: true,
                                    message: "审核结果不能为空"
                                }],
                            })(
                                <RadioGroup onChange={(event) => {
                                    setOpinionStatus(event.target.value)
                                }}>
                                    <Radio value={1}> 通过 </Radio> <
                                    Radio value={4}> 驳回 </Radio>
                                </RadioGroup>)
                            }
                        </FormItem>
                        <FormItem className={opinionClass} {...formItemLayout_14} label="审核意见：">
                            {
                                getFieldDecorator('opinion', {
                                    rules: [{
                                        required: opinionStatus,
                                        message: '审核意见不能为空',
                                    }],
                                })(
                                    <TextArea style={{resize: "none"}} placeholder="请填写审核意见"
                                              autosize={{minRows: 3, maxRows: 10}}/>
                                )
                            }
                        </FormItem>
                    </Form>
                </div>
            </Modal>);
    }
);

//教师审核组件
class ItemCheck extends Component {
    state = {
        visible: false,
        opinionStatus: false,
        confirmLoading: false
    };

    showModal = () => {
        this.setState({
            visible: true
        })
    };

    setOpinionStatus = (value) => {
        if (value === 1) {
            this.setState({
                opinionStatus: false
            })
        }
        if (value === 4) {
            this.setState({
                opinionStatus: true
            })
        }
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
                    opinionStatus: false,
                    confirmLoading: false
                });
            });
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
            if (values.state === 4 && !values.opinion) {
                message.error("驳回意见不能为空");
                return
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/teachercache/checkTeacher',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    id: this.props.id,
                    status: values.state,
                    opinion: values.opinion
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("教师审核成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                opinionStatus: false,
                                confirmLoading: false
                            });
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
            <a style={{display: this.props.status ? "inline" : "none"}}>
                <span onClick={() => this.showModal()}> 审核 </span>
                <ItemCheckForm ref={this.saveFormRef}
                               visible={this.state.visible}
                               onCancel={this.handleCancel}
                               onCreate={this.handleCreate}
                               opinionStatus={this.state.opinionStatus}
                               setOpinionStatus={this.setOpinionStatus}
                               confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//教师详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        loading: true,
        data: ""
    };

    getData = () => {
        reqwest({
            url: '/teachercache/getTeacherCache',
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
                //         teacher: {
                //             eduId: null,
                //             eduName: "",
                //             createTime: "",
                //             description: "\n" + "\n" + "",
                //             experienceAge: null,
                //             gender: null,
                //             id: 67,
                //             name: "",
                //             nickName: "",
                //             parentTypeId: null,
                //             parentTypeIdTwo: null,
                //             parentTypeIdThree: null,
                //             phone: "",
                //             photo: "",
                //             status: null,
                //             typeId: null,
                //             typeIdTwo: null,
                //             typeIdThree: null,
                //             updateTime: ""
                //         },
                //         typeName: "",
                //         typeNameTwo: "",
                //         typeNameThree: "",
                //         parentTypeName: "",
                //         parentTypeNameTwo: "",
                //         parentTypeNameThree: "",
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    json.data.teacher.typeName = json.data.typeName;
                    json.data.teacher.typeNameTwo = json.data.typeNameTwo;
                    json.data.teacher.typeNameThree = json.data.typeNameThree;
                    json.data.teacher.parentTypeName = json.data.parentTypeName;
                    json.data.teacher.parentTypeNameTwo = json.data.parentTypeNameTwo;
                    json.data.teacher.parentTypeNameThree = json.data.parentTypeNameThree;
                    this.setState({
                        loading: false,
                        data: json.data.teacher
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
            const data = this.state.data;
            let tempGender = "";
            if (data.gender === 0) {
                tempGender = "女";
            }
            if (data.gender === 1) {
                tempGender = "男";
            }
            if (data.gender === 2) {
                tempGender = "？";
            }
            dataSource = [
                <div className="name">
                    <span className="item-name"> 姓名： </span>
                    <span className="item-content"> {data.name}</span>
                </div>,
                <div className="photo">
                    <span className="item-name"> 照片： </span>
                    <img src={"http://image.taoerxue.com/" + this.state.data.photo} alt="" className="item-content"/>
                </div>,
                <div className="gender">
                    <span className="item-name"> 性别： </span>
                    <span className="item-content"> {tempGender}
                </span>
                </div>,
                <div className="nickName">
                    <span className="item-name"> 昵称： </span>
                    <span className="item-content"> {data.nickName}</span>
                </div>,
                <div className="EName">
                    <span className="item-name"> 所属机构： </span>
                    <span className="item-content"> {data.eduName}</span>
                </div>,
                <div className="phone">
                    <span className="item-name"> 联系电话： </span>
                    <span className="item-content"> {data.phone || "暂无"}</span>
                </div>,
                <div className="subject">
                    <span className="item-name"> 教学科目一： </span>
                    <span className="item-content"> {data.parentTypeName + "/" + data.typeName}</span>
                </div>,
                <div className="subject">
                    <span className="item-name"> 教学科目二： </span>
                    <span
                        className="item-content"> {data.typeIdTwo ? data.parentTypeNameTwo + "/" + data.typeNameTwo : "暂无"}</span>
                </div>,
                <div className="subject">
                    <span className="item-name"> 教学科目三： </span>
                    <span
                        className="item-content"> {data.typeIdThree ? data.parentTypeNameThree + "/" + data.typeNameThree : "暂无"}</span>
                </div>,
                <div className="seniority">
                    <span className="item-name"> 教龄： </span>
                    <span className="item-content"> {data.experienceAge}年 </span>
                </div>,
                <div className="profile">
                    <span className="item-name"> 简介： </span>
                    <pre>
                    <span className="item-content">{data.description}</span>
                </pre>
                </div>,
                <div className="opinion">
                    <span className="item-name"> 审核意见： </span>
                    <pre>
                    <span className="item-content"> {data.opinion || "暂无"}</span>
                </pre>
                </div>
            ];
        } else {
            dataSource = ""
        }

        return (
            <a style={{display: this.props.status ? "inline" : "none"}}>
                <span onClick={this.showModal}> 详情 </span>
                <Modal title="教师详情"
                       width={600}
                       visible={this.state.visible}
                       footer={null}
                       onCancel={this.handleCancel}
                       destroyOnClose={true}>
                    <div className="teacher-details item-details">
                        <div className="teacher-baseData">
                            <List size="small"
                                  split="false"
                                  dataSource={dataSource}
                                  renderItem={item => (< List.Item> {item}</List.Item>)}
                                  loading={this.state.loading}/>
                        </div>
                    </div>
                </Modal>
            </a>
        );
    }
}

//教师详情对比组件
class ItemDetailsCompare extends Component {
    state = {
        visible: false,
        loading: true,
        data01: "",
        data02: "",
    };

    getData = () => {
        reqwest({
            url: '/teachercache/teacherCompare',
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
                //     data: [
                //         {
                //             teacher: {
                //                 gender: null,
                //                 phone: "",
                //                 parentTypeId: null,
                //                 parentTypeIdTwo: null,
                //                 parentTypeIdThree: null,
                //                 typeId: null,
                //                 typeIdTwo: null,
                //                 typeIdThree: null,
                //             },
                //             typeName: "",
                //             typeNameTwo: "",
                //             typeNameThree: "",
                //             parentTypeName: "",
                //             parentTypeNameTwo: "",
                //             parentTypeNameThree: "",
                //         },
                //         {
                //             teacher: {
                //                 EId: null,
                //                 EName: "",
                //                 createTime: "",
                //                 description: "\n" + "\n" + "",
                //                 experienceAge: null,
                //                 gender: null,
                //                 id: 67,
                //                 name: "",
                //                 nickName: "",
                //                 parentTypeId: null,
                //                 parentTypeIdTwo: null,
                //                 parentTypeIdThree: null,
                //                 phone: "",
                //                 photo: "",
                //                 status: null,
                //                 typeId: null,
                //                 typeIdTwo: null,
                //                 typeIdThree: null,
                //                 updateTime: ""
                //             },
                //             typeName: "",
                //             typeNameTwo: "",
                //             typeNameThree: "",
                //             parentTypeName: "",
                //             parentTypeNameTwo: "",
                //             parentTypeNameThree: "",
                //         }
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    json.data[0].teacher.typeName = json.data[0].typeName;
                    json.data[0].teacher.typeNameTwo = json.data[0].typeNameTwo;
                    json.data[0].teacher.typeNameThree = json.data[0].typeNameThree;
                    json.data[0].teacher.parentTypeName = json.data[0].parentTypeName;
                    json.data[0].teacher.parentTypeNameTwo = json.data[0].parentTypeNameTwo;
                    json.data[0].teacher.parentTypeNameThree = json.data[0].parentTypeNameThree;
                    json.data[1].teacher.typeName = json.data[1].typeName;
                    json.data[1].teacher.typeNameTwo = json.data[1].typeNameTwo;
                    json.data[1].teacher.typeNameThree = json.data[1].typeNameThree;
                    json.data[1].teacher.parentTypeName = json.data[1].parentTypeName;
                    json.data[1].teacher.parentTypeNameTwo = json.data[1].parentTypeNameTwo;
                    json.data[1].teacher.parentTypeNameThree = json.data[1].parentTypeNameThree;
                    this.setState({
                        loading: false,
                        data01: json.data[0].teacher,
                        data02: json.data[1].teacher
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
        });
    };

    handleCancel = () => {
        this.setState({
            visible: false
        });
    };

    render() {
        let data01;
        if (this.state.data01) {
            let tempGender01 = "";
            if (this.state.data01.gender === 0) {
                tempGender01 = "女";
            }
            if (this.state.data01.gender === 1) {
                tempGender01 = "男";
            }
            if (this.state.data01.gender === 2) {
                tempGender01 = "？";
            }
            data01 = [
                <div className="item name" style={{display: this.state.data01.name ? "block" : "none"}}>
                    <span className="item-name">姓名：</span>
                    <span className="item-content">{this.state.data01.name}</span>
                </div>,
                <div className="item photo" style={{display: this.state.data01.photo ? "block" : "none"}}>
                    <span className="item-name">头像：</span>
                    <img src={"http://image.taoerxue.com/" + this.state.data01.photo} alt="" className="item-content"/>
                </div>,
                <div className="item gender"
                     style={{display: this.state.data01.gender !== undefined ? "block" : "none"}}>
                    <span className="item-name">性别：</span>
                    <span className="item-content">{tempGender01}</span>
                </div>,
                <div className="item nickName" style={{display: this.state.data01.nickName ? "block" : "none"}}>
                    <span className="item-name">昵称：</span>
                    <span className="item-content">{this.state.data01.nickName}</span>
                </div>,
                <div className="item phone" style={{display: this.state.data01.phone ? "block" : "none"}}>
                    <span className="item-name"> 联系电话： </span>
                    <span className="item-content">{this.state.data01.phone || "暂无"}</span>
                </div>,
                <div className="item subject" style={{display: this.state.data01.typeName ? "block" : "none"}}>
                    <span className="item-name">教学科目一：</span>
                    <span
                        className="item-content">{this.state.data01.parentTypeName + "/" + this.state.data01.typeName}</span>
                </div>,
                <div className="item subject"
                     style={{display: this.state.data01.typeIdTwo !== undefined ? "block" : "none"}}>
                    <span className="item-name">教学科目二：</span>
                    <span
                        className="item-content">{this.state.data01.typeIdTwo ? this.state.data01.parentTypeNameTwo + "/" + this.state.data01.typeNameTwo : "暂无"}</span>
                </div>,
                <div className="item subject"
                     style={{display: this.state.data01.typeIdThree !== undefined ? "block" : "none"}}>
                    <span className="item-name">教学科目三：</span>
                    <span
                        className="item-content">{this.state.data01.typeIdThree ? this.state.data01.parentTypeNameThree + "/" + this.state.data01.typeNameThree : "暂无"}</span>
                </div>,
                <div className="item seniority" style={{display: this.state.data01.experienceAge ? "block" : "none"}}>
                    <span className="item-name">教龄：</span>
                    <span className="item-content">{this.state.data01.experienceAge}年</span>
                </div>,
                <div className="item profile" style={{display: this.state.data01.description ? "block" : "none"}}>
                    <span className="item-name"> 简介： </span>
                    <pre>
                    <span className="item-content">{this.state.data01.description}</span>
                </pre>
                </div>
            ];
        } else {
            data01 = ""
        }
        let data02;
        if (this.state.data02) {
            let tempGender02 = "";
            if (this.state.data02.gender === 0) {
                tempGender02 = "女";
            }
            if (this.state.data02.gender === 1) {
                tempGender02 = "男";
            }
            if (this.state.data02.gender === 2) {
                tempGender02 = "？";
            }
            data02 = [
                <div className="item name">
                    <span className="item-name">姓名：</span>
                    <span className="item-content">{this.state.data02.name}</span>
                </div>,
                <div className="item photo">
                    <span className="item-name">头像：</span>
                    <img src={"http://image.taoerxue.com/" + this.state.data02.photo} alt="" className="item-content"/>
                </div>,
                <div className="item gender">
                    <span className="item-name">性别：</span>
                    <span className="item-content">{tempGender02}</span>
                </div>,
                <div className="item nickName">
                    <span className="item-name">昵称：</span>
                    <span className="item-content">{this.state.data02.nickName}</span>
                </div>,
                <div className="item EName">
                    <span className="item-name">所属机构：</span>
                    <span className="item-content">{this.state.data02.EName}</span>
                </div>,
                <div className="item phone">
                    <span className="item-name">联系电话：</span>
                    <span className="item-content">{this.state.data02.phone || "暂无"}</span>
                </div>,
                <div className="item subject">
                    <span className="item-name">教学科目一：</span>
                    <span
                        className="item-content">{this.state.data02.parentTypeName + "/" + this.state.data02.typeName}</span>
                </div>,
                <div className="item subject">
                    <span className="item-name">教学科目二：</span>
                    <span
                        className="item-content">{this.state.data02.typeIdTwo ? this.state.data02.parentTypeNameTwo + "/" + this.state.data02.typeNameTwo : "暂无"}</span>
                </div>,
                <div className="item subject">
                    <span className="item-name">教学科目三： </span>
                    <span
                        className="item-content">{this.state.data02.typeIdThree ? this.state.data02.parentTypeNameThree + "/" + this.state.data02.typeNameThree : "暂无"}</span>
                </div>,
                <div className="item seniority">
                    <span className="item-name">教龄</span>
                    <span className="item-content">{this.state.data02.experienceAge}年</span>
                </div>,
                <div className="item profile">
                    <span className="item-name">简介：</span>
                    <pre>
                    <span className="item-content">{this.state.data02.description}</span>
                </pre>
                </div>
            ];
        } else {
            data02 = ""
        }
        return (
            <a style={{display: this.props.status ? "inline" : "none"}}>
                <span onClick={this.showModal}>详情对比</span>
                <Modal title="详情对比"
                       width={1200}
                       visible={this.state.visible}
                       footer={null}
                       onCancel={this.handleCancel}
                       destroyOnClose={true}>
                    <div className="teacher-check-box clearfix">
                        <div className="teacher-check-detail teacher-check-detail-left item-details">
                            <p className="title">被修改后字段</p>
                            <div className="teacher-check-baseData">
                                <List size="small"
                                      split="false"
                                      dataSource={data01}
                                      renderItem={item => (<List.Item>{item}</List.Item>)}
                                      loading={this.state.loading}/>
                            </div>
                        </div>
                        <div className="teacher-check-detail teacher-check-detail-right item-details">
                            <p className="title">修改前：</p>
                            <div className="teacher-check-baseData">
                                <List size="small"
                                      split="false"
                                      dataSource={data02}
                                      renderItem={item => (<List.Item>{item}</List.Item>)}
                                      loading={this.state.loading}/>
                            </div>
                        </div>
                    </div>
                </Modal>
            </a>
        );
    }
}

//驳回意见
class ItemOpinion extends Component {
    state = {
        visible: false,
        loading: true,
        data: ""
    };

    getData = () => {
        reqwest({
            url: '/teachercache/getTeacherCache',
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
                //         teacher: {
                //             opinion: ""
                //         },
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        data: json.data.teacher.opinion
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
        this.setState({
            visible: false
        });
    };

    render() {
        return (
            <a style={{display: this.props.status ? "inline" : "none"}}>
                <span onClick={this.showModal}>驳回意见</span>
                <Modal title="驳回意见"
                       visible={this.state.visible}
                       footer={null}
                       onCancel={this.handleCancel}
                       destroyOnClose={true}
                >
                    {
                        this.state.loading ?
                            <div className="spin-box">
                                <Spin/>
                            </div>
                            :
                            <div className="item-opinion">
                                <p>{this.state.data || "暂无"}</p>
                            </div>
                    }
                </Modal>
            </a>
        );
    }
}

//教师信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, viewPic, effectPic, data_pic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoLoading, subjectList, confirmLoading} = props;
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
                width={80}
                height={80}
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
                title="教师编辑"
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
                        <div className="teacher-edit teacher-form item-form">
                            <Form layout="vertical">
                                <FormItem className="name" {...formItemLayout_8} label="教师姓名：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.name,
                                        rules: [{
                                            required: true,
                                            message: '请填写姓名',
                                        }],
                                    })(
                                        <Input placeholder="请输入教师姓名"/>
                                    )}
                                </FormItem>
                                <FormItem className="photo" {...formItemLayout_12} label="教师头像：">
                                    {getFieldDecorator('photo', {
                                        initialValue: viewPic,
                                        rules: [{
                                            required: true,
                                            message: '教师头像不能为空',
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
                                                    <Slider min={0.5} max={1.5} step={0.01} value={avatarEditor.scale}
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
                                <FormItem className="phone unnecessary" {...formItemLayout_8} label="联系电话：">
                                    {getFieldDecorator('phone', {
                                        initialValue: data.phone,
                                        rules: [{
                                            required: false
                                        }],
                                    })(
                                        <Input placeholder="请输入教师联系方式"/>
                                    )}
                                </FormItem>
                                <FormItem className="gender" {...formItemLayout_8} label="性别：">
                                    {getFieldDecorator('gender', {
                                        initialValue: data.gender,
                                        rules: [{
                                            required: true,
                                            message: '性别不能为空'
                                        }],
                                    })(
                                        <Select placeholder="请选择教师性别">
                                            <Option value={0}>女</Option>
                                            <Option value={1}>男</Option>
                                        </Select>
                                    )}
                                </FormItem>
                                <FormItem className="nickName" {...formItemLayout_8} label="昵称：">
                                    {getFieldDecorator('nickName', {
                                        initialValue: data.nickName,
                                        rules: [{
                                            required: true,
                                            message: '姓名不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入教师昵称"/>
                                    )}
                                </FormItem>
                                <FormItem className="experienceAge" {...formItemLayout_8} label="教龄(年)：">
                                    {getFieldDecorator('experienceAge', {
                                        initialValue: data.experienceAge,
                                        rules: [{
                                            required: true,
                                            message: '教龄不能为空',
                                        }],
                                    })(
                                        <InputNumber min={0} precision={0} step={1}/>
                                    )}
                                </FormItem>
                                <FormItem className="typeIds longItem" {...formItemLayout_14} label="教学科目：">
                                    {getFieldDecorator('typeIds', {
                                        initialValue: data.typeIds,
                                        rules: [{
                                            required: true,
                                            message: '科目不能为空',
                                        }],
                                    })(
                                        <TreeSelect
                                            placeholder="请选择教室所教科目（最多三项）"
                                            treeCheckable={true}
                                            treeData={subjectList}
                                            showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                        />
                                    )}
                                </FormItem>
                                <FormItem className="description longItem" {...formItemLayout_14} label="教师简介：">
                                    {getFieldDecorator('description', {
                                        initialValue: data.description,
                                        rules: [{
                                            required: true,
                                            message: '教师简介不能为空',
                                        }],
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写教师简介" rows={10}/>
                                    )}
                                </FormItem>
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

// 教师信息编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,
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
        // 科目列表
        subjectList: [],
        confirmLoading: false
    };

    getData = () => {
        reqwest({
            url: '/teachercache/getTeacherCache',
            type: 'json',
            method: 'post',
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
                //         teacher: {
                //             EId: null,
                //             createTime: "",
                //             description: "",
                //             experienceAge: null,
                //             gender: null,
                //             id: 67,
                //             name: "",
                //             nickName: "",
                //             parentTypeId: null,
                //             parentTypeName: "",
                //             phone: "",
                //             photo: "",
                //             status: null,
                //             typeId: null,
                //             typeName: "",
                //             typeIdTwo: null,
                //             typeIdThree: null,
                //             updateTime: ""
                //         }
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    const typeIds = [String(json.data.teacher.typeId)];
                    if (json.data.teacher.typeIdTwo) {
                        typeIds.push(String(json.data.teacher.typeIdTwo))
                    }
                    if (json.data.teacher.typeIdThree) {
                        typeIds.push(String(json.data.teacher.typeIdThree))
                    }
                    json.data.teacher.typeIds = typeIds;
                    json.data.teacher.typeIdTwo = json.data.teacher.typeIdTwo ? json.data.teacher.typeIdTwo : 0;
                    json.data.teacher.typeIdThree = json.data.teacher.typeIdThree ? json.data.teacher.typeIdThree : 0;
                    this.setState({
                        data: json.data.teacher,
                        viewPic: "http://image.taoerxue.com/" + json.data.teacher.photo,
                        effectPic: "http://image.taoerxue.com/" + json.data.teacher.photo,
                        data_pic: json.data.teacher.photo,
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

    getSubjectList = () => {
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
                //         {
                //             id: 1,
                //             name: "",
                //             list: [
                //                 {id: 11, name: ""},
                //                 {id: 12, name: ""},
                //                 {id: 13, name: ""},
                //             ]
                //         }
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    const data = [];
                    json.data.forEach((item) => {
                        let subData = [];
                        if (item.list.length) {
                            item.list.forEach((subItem) => {
                                subData.push({
                                    key: subItem.id,
                                    value: String(subItem.id),
                                    label: subItem.name
                                })
                            })
                        }
                        data.push({
                            key: item.id,
                            value: String(item.id),
                            label: item.name,
                            children: subData
                        })
                    });
                    this.setState({
                        subjectList: data
                    })
                }
            }
        });
    };

    showModal = () => {
        this.getData();
        this.getSubjectList();
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
                    message.error(json.message);
                    this.setState({
                        photoLoading: false
                    })
                }
            }
        });
    };

    // 信息比对函数
    dataContrast = (values) => {
        const initValues = this.state.data;
        const itemList = ["name", "photo", "phone", "gender", "nickName", "experienceAge", "typeId", "typeIdTwo", "typeIdThree", "description"];
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
                    subjectList: [],
                    confirmLoading: false
                });
            })
        };
        if (!this.state.data.name) {
            cancel();
            return;
        }
        form.validateFields((err, values) => {
            values.photo = this.state.data_pic;
            values.typeId = values.typeIds ? Number(values.typeIds[0]) : 0;
            values.typeIdTwo = values.typeIds ? (Number(values.typeIds[1]) || 0) : 0;
            values.typeIdThree = values.typeIds ? (Number(values.typeIds[2]) || 0) : 0;
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
        if (String(this.state.data.name) === "{}") {
            return;
        }
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            if (values.typeIds.length > 3) {
                message.error("教学科目最多选三项");
                return;
            }
            // 教师头像和教学科目写入
            values.photo = this.state.data_pic;
            values.typeId = Number(values.typeIds[0]);
            values.typeIdTwo = Number(values.typeIds[1]) || 0;
            values.typeIdThree = Number(values.typeIds[2]) || 0;
            // value与初始data进行比对，得到修改项集合
            const result = this.dataContrast(values);
            if (!result) {
                message.error("暂无信息更改");
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/teachercache/modifyTeacherCache',
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
                        message.success("教师信息修改成功，已提交审核");
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
                                subjectList: [],
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
            })
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a style={{display: this.props.status ? "inline" : "none"}}>
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
                    subjectList={this.state.subjectList}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//教师列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            // 当前机构类型
            source: 0,
            pagination: {
                current: 1,
                pageSize: Number(localStorage.teacherCheckPageSize) || 10,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            },
        };
        this.columns = Number(sessionStorage.EId) === 0 ?
            // 系统管理员列配置（展示所属机构项）
            [
                {
                    title: "序号",
                    dataIndex: "index",
                    width: '6%',
                    render: (text, record) => this.renderColumns(text, record, "index"),
                },
                {
                    title: '教师名称',
                    dataIndex: 'teacherName',
                    width: '10%',
                    render: (text, record) => this.renderColumns(text, record, 'teacherName'),
                },
                {
                    title: '所属机构',
                    dataIndex: 'eName',
                    width: '15%',
                    render: (text, record) => this.renderColumns(text, record, 'eName'),
                },
                {
                    title: '来源',
                    dataIndex: 'source',
                    width: '8%',
                    filters: [
                        {text: '平台申请入驻', value: 1},
                        {text: '数据收录', value: 2},
                        {text: '内部机构注册', value: 3},
                    ],
                    filterMultiple: false,
                    render: (text, record) => this.renderColumns(text, record, 'source'),
                },
                {
                    title: '操作',
                    dataIndex: '操作',
                    render: (text, record) => {
                        return (
                            <div className="editable-row-operations">
                                {/*修改前后信息对比（副表状态为待审核，正式表状态为禁用或审核通过的教师展示此项）*/}
                                <ItemDetailsCompare id={record.id} toLoginPage={this.props.toLoginPage}
                                                    status={record.statusCode === 3 && (record.teacherStatus === 1 || record.teacherStatus === 2) ? 1 : 0}/>
                                {/*教师详情（副表状态为审核驳回，或正式表状态为审核中的教师展示此项）*/}
                                <ItemDetails id={record.id} toLoginPage={this.props.toLoginPage}
                                             status={record.statusCode === 4 || record.teacherStatus === 3 ? 1 : 0}/>
                                {/*驳回意见（副表状态为审核驳回的课程展示此项）*/}
                                <ItemOpinion id={record.id} toLoginPage={this.props.toLoginPage}
                                             status={record.statusCode === 4 ? 1 : 0}/>
                                {/*教师编辑（副表状态为审核驳回或登陆人为超级管理员与运营人员时展示此项）*/}
                                <ItemEdit id={record.id} recapture={this.getData} toLoginPage={this.props.toLoginPage}
                                          status={(Number(sessionStorage.adminType) === 0 || Number(sessionStorage.adminType) === 4) || record.statusCode === 4 ? 1 : 0}/>
                                {/*教师审核（副表状态为待审核且登陆人为超级管理员与运营人员时展示此项）*/}
                                <ItemCheck id={record.id} recapture={this.getData} toLoginPage={this.props.toLoginPage}
                                           status={(Number(sessionStorage.adminType) === 0 || Number(sessionStorage.adminType) === 4) && record.statusCode === 3 ? 1 : 0}/>
                                {/*教师删除（登陆人为机构管理员时展示此项）*/}
                                <Popconfirm title="确认删除?"
                                            placement="topRight"
                                            onConfirm={() => this.itemDelete(record.id)}
                                            onCancel=""
                                            okType="danger"
                                            okText="立即删除"
                                            cancelText="取消">
                                    <a style={{display: Number(sessionStorage.EId) !== 0 ? "inline" : "none"}}>删除</a>
                                </Popconfirm>
                            </div>
                        );
                    },
                }
            ]
            :
            // 机构管理员列配置
            [
                {
                    title: " 序号",
                    dataIndex: "index",
                    width: '6%',
                    render: (text, record) => this.renderColumns(text, record, "index"),
                },
                {
                    title: '教师名称',
                    dataIndex: 'teacherName',
                    width: '10%',
                    render: (text, record) => this.renderColumns(text, record, 'teacherName'),
                },
                {
                    title: '操作',
                    dataIndex: '操作',
                    render: (text, record) => {
                        return (
                            <div className="editable-row-operations">
                                {/*修改前后信息对比（副表状态为待审核，正式表状态为禁用或审核通过的教师展示此项）*/}
                                <ItemDetailsCompare id={record.id} toLoginPage={this.props.toLoginPage}
                                                    status={record.statusCode === 3 && (record.teacherStatus === 1 || record.teacherStatus === 2) ? 1 : 0}/>
                                {/*教师详情（副表状态为审核驳回，或正式表状态为审核中的教师展示此项）*/}
                                <ItemDetails id={record.id} toLoginPage={this.props.toLoginPage}
                                             status={record.statusCode === 4 || record.teacherStatus === 3 ? 1 : 0}/>
                                {/*驳回意见（副表状态为审核驳回的课程展示此项）*/}
                                <ItemOpinion id={record.id} toLoginPage={this.props.toLoginPage}
                                             status={record.statusCode === 4 ? 1 : 0}/>
                                {/*教师编辑（副表状态为审核驳回或登陆人为超级管理员与运营人员时展示此项）*/}
                                <ItemEdit id={record.id} recapture={this.getData} toLoginPage={this.props.toLoginPage}
                                          status={(Number(sessionStorage.adminType) === 0 || Number(sessionStorage.adminType) === 4) || record.statusCode === 4 ? 1 : 0}/>
                                {/*教师审核（副表状态为待审核且登陆人为超级管理员与运营人员时展示此项）*/}
                                <ItemCheck id={record.id} recapture={this.getData} toLoginPage={this.props.toLoginPage}
                                           status={(Number(sessionStorage.adminType) === 0 || Number(sessionStorage.adminType) === 4) && record.statusCode === 3 ? 1 : 0}/>
                                {/*教师删除（登陆人为机构管理员时展示此项）*/}
                                <Popconfirm title="确认删除?"
                                            placement="topRight"
                                            onConfirm={() => this.itemDelete(record.id)}
                                            onCancel=""
                                            okType="danger"
                                            okText="立即删除"
                                            cancelText="取消">
                                    <a style={{display: Number(sessionStorage.EId) !== 0 ? "inline" : "none"}}>删除</a>
                                </Popconfirm>
                            </div>
                        );
                    },
                }
            ]
    }

    //列渲染
    renderColumns(text) {
        return (<Cell value={text}/>);
    }

    //获取本页信息
    getData = (type, keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/teachercache/getTeacherCacheList',
            type: 'json',
            method: 'post',
            data: {
                source: this.state.source,
                status: type === undefined ? this.props.type : type,
                educationName: keyword ? keyword.educationName : this.props.keyword.educationName,
                teacherName: keyword ? keyword.teacherName : this.props.keyword.teacherName,
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
                //         size: 102,
                //         list: [
                //             {
                //                 id: 1,
                //                 EId: 1,
                //                 EName: "",
                //                 photo: "",
                //                 name: "",
                //                 phone: "",
                //                 gender: null,
                //                 source: 1,
                //                 status: 1,
                //             },
                //             {
                //                 id: 2,
                //                 EId: 1,
                //                 EName: "",
                //                 photo: "",
                //                 name: "",
                //                 phone: "",
                //                 gender: null,
                //                 status: 2,
                //             },
                //             {
                //                 id: 3,
                //                 EId: 1,
                //                 EName: "",
                //                 photo: "",
                //                 name: "",
                //                 phone: "",
                //                 gender: null,
                //                 status: 2,
                //             },
                //             {
                //                 id: 4,
                //                 EId: 1,
                //                 EName: "",
                //                 photo: "",
                //                 name: "",
                //                 phone: "",
                //                 gender: null,
                //                 status: 2,
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
                        let source = "";
                        if (item.source === 1) {
                            source = "平台申请入驻"
                        }
                        if (item.source === 2) {
                            source = "数据收录"
                        }
                        if (item.source === 3) {
                            source = "内部机构注册"
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            teacherName: item.teacherName,
                            eName: item.EName || item.eduName,
                            teacherStatus: item.teacherStatus,
                            source: source,
                            statusCode: item.status
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

    //删除
    itemDelete = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/teachercache/checkTeacher',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: id,
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
                    message.success("教师删除成功");
                    this.getData()
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
        localStorage.teacherCheckPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.teacherCheckPageSize);
        this.setState({
            source: filters.source ? (filters.source[0] || 0) : 0,
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

class TeacherCheck extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: "3",
            keyword: {
                educationName: '',
                teacherName: ''
            },
            flag_add: false
        };
        this.educationName = "";
        this.teacherName = "";
    };

    //tab状态设置
    setType = (value) => {
        this.setState({
            type: value
        })
    };

    search = (type, value) => {
        if (type === 0) {
            if (this.state.keyword.educationName === this.educationName && this.state.keyword.teacherName === this.teacherName) {
                return
            }
            this.setState({
                keyword: {
                    educationName: this.educationName,
                    teacherName: this.teacherName
                }
            })
        }
        if (type === 1) {
            if (value !== this.state.keyword.teacherName) {
                this.setState({
                    keyword: {
                        educationName: '',
                        teacherName: value,
                    }
                })
            }

        }
    };

    setInstitutionName = (event) => {
        if (event.target.value === this.educationName) {
            return
        }
        this.educationName = event.target.value
    };

    setTeacherName = (event) => {
        if (event.target.value === this.teacherName) {
            return
        }
        this.teacherName = event.target.value
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
            <div className="teacher-check">
                <header className="clearfix">
                    <Tabs defaultActiveKey={this.state.type}
                          onChange={this.setType}>
                        <TabPane tab="待审核" key="3"/>
                        <TabPane tab="已驳回" key="4"/>
                    </Tabs>
                </header>
                <div className="keyWord clearfix">
                    <div className="teacher-filter"
                         style={{
                             display: Number(sessionStorage.EId) === 0 ? "block" : "none",
                             width: "150px",
                             float: "left",
                             marginRight: "20px"
                         }}>
                        <Input placeholder="教师姓名" onBlur={this.setTeacherName}/>
                    </div>
                    <div className="institution-filter"
                         style={{
                             display: Number(sessionStorage.EId) === 0 ? "block" : "none",
                             width: "320px",
                             float: "left",
                             marginRight: "20px"
                         }}>
                        <Input placeholder="机构名称" onBlur={this.setInstitutionName}/>
                    </div>
                    <Button style={{display: Number(sessionStorage.EId) === 0 ? "block" : "none"}} type="primary"
                            onClick={() => this.search(0)}>
                        <Icon type="search" style={{fontSize: "16px"}}/>
                    </Button>
                    <Search placeholder="请输入教师姓名"
                            onSearch={(value) => this.search(1, value)} enterButton
                            style={{
                                display: Number(sessionStorage.EId) !== 0 ? "block" : "none",
                                width: "320px",
                                float: "left"
                            }}/>
                </div>
                <div className="table-box">
                    <DataTable type={this.state.type} keyword={this.state.keyword}
                               flag_add={this.state.flag_add} toLoginPage={this.toLoginPage}/>
                </div>
                <p className="hint"/>
            </div>
        )
    }
}

export default TeacherCheck;
