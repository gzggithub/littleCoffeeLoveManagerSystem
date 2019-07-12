import React, {Component} from 'react';
import {
    Tabs,
    Table,
    Input,
    InputNumber,
    Select,
    Button,
    Modal,
    Form,
    Upload,
    Slider,
    Row,
    Col,
    Radio,
    Icon,
    message,
    List,
    Spin,
    TreeSelect,
} from 'antd';
import '../../config/config';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';
import reqwest from 'reqwest';
import AvatarEditor from 'react-avatar-editor'

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const {Option} = Select;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
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
const formItemLayout_16 = {
    labelCol: {span: 4},
    wrapperCol: {span: 16},
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//机构审核表单
const ItemCheckForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, handleSearch, handleChange, companyId, companyList, form, opinionStatus, setOpinionStatus, confirmLoading} = props;
        const {getFieldDecorator} = form;
        let opinionClass = "opinion noInput longItem unnecessary";
        if (opinionStatus) {
            opinionClass = "opinion noInput longItem"
        }

        // 总机构选项生成
        const optionsOfCompanyList = [];
        if (companyList) {
            companyList.forEach((item, index) => {
                optionsOfCompanyList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
            });
        }  

        return (
            <Modal
                visible={visible}
                title="机构审核"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="institutionCheck-form">
                    <Form layout="vertical">
                        <FormItem className="state" {...formItemLayout_8} label="审核结果：">
                            {getFieldDecorator('state', {
                                initialValue: 2,
                                rules: [{
                                    required: true,
                                    message: "审核结果不能为空"
                                }],
                            })(
                                <RadioGroup
                                    buttonStyle="solid"
                                    onChange={(event) => {setOpinionStatus(event.target.value)}}>
                                    <Radio.Button value={2} style={{marginRight: "20px", borderRadius: "4px"}}>通过</Radio.Button>
                                    <Radio.Button value={3} style={{marginRight: "20px", borderRadius: "4px"}}>驳回</Radio.Button>
                                </RadioGroup>
                            )}
                        </FormItem>                        
                        <FormItem className="parentId"  {...formItemLayout_14}  label="所属分公司：">
                            {getFieldDecorator('parentId', {
                                initialValue: companyId,
                                rules: [{
                                    required: false,
                                    message: '请输入所属分公司',
                                }],
                            })(
                                <Select
                                    showSearch
                                    style={{width: '100%'}}
                                    placeholder="请选择所属分公司"
                                    onSearch={handleSearch}
                                    onChange={handleChange}                        
                                    filterOption={false}
                                    notFoundContent={null}                                
                                >
                                    {optionsOfCompanyList}
                                </Select>  
                            )}
                        </FormItem>
                        <FormItem className={opinionClass} {...formItemLayout_14} label="审核意见：">
                            {getFieldDecorator('opinion', {
                                rules: [{
                                    required: opinionStatus,
                                    message: '审核意见不能为空',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写审核意见"
                                          autosize={{minRows: 3, maxRows: 10}}/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//机构审核组件
class ItemCheck extends Component {
    state = {
        visible: false,
        opinionStatus: false,
        confirmLoading: false,
        companyList: [],
        companyId: 0,
    };

    showModal = () => {
        this.handleSearch(this.props.companyName);
        this.setState({
            visible: true,
            companyName: this.props.companyName,
            companyId: this.props.companyId,
        })
    };

    handleSearch = (value) => {
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
                        companyList: data
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
                    }
                }
            }
        });
    };

    onChange = (value) => {
        this.setState({ 
            tempTypeIds: value
        });
    };

    setOpinionStatus = (value) => {
        if (value === 2) {
            this.setState({
                opinionStatus: false
            })
        }
        if (value === 3) {
            this.setState({
                opinionStatus: true
            })
        }
    };

    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false
        }, () => {
            this.setState({
                opinionStatus: false,
                confirmLoading: false
            });
            form.resetFields();
        });
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            if (values.state === 3 && !values.opinion) {
                message.error("驳回意见不能为空");
                return
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/admin/org/checkOrg',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    id: this.props.id,
                    status: values.state,
                    parentId: values.parentId,
                    checkOpinion: values.opinion
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    });
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("机构审核成功");
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
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a style={{display: this.props.status ? "inline" : "none"}}>
                <span onClick={() => this.showModal()}>审核</span>
                <ItemCheckForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    companyId={this.state.companyId}
                    companyName={this.state.companyName}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    handleSearch={this.handleSearch}
                    handleChange={this.handleChange}
                    companyList={this.state.companyList}
                    opinionStatus={this.state.opinionStatus}
                    setOpinionStatus={this.setOpinionStatus}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//机构详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        data: "",
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
            url: '/admin/org/getDifferences',
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
                });               
            },
            success: (json) => {
                if (json.result === 0) {
                    // 过滤出机构图片
                    // const fnFilter01 = (para) => {
                    //     return para.type === 1;
                    // }
                    // 过滤出机构Logo
                    const fnFilter02 = (para) => {
                        return para.type === 2;
                    }
                    json.data.now.org.typeName = json.data.now.orgTypeList[0] ? json.data.now.orgTypeList[0].typeName : "暂无";
                    json.data.now.org.typeNameTwo = json.data.now.orgTypeList[1] ? json.data.now.orgTypeList[1].typeName : "暂无";
                    json.data.now.org.typeNameThree = json.data.now.orgTypeList[2] ? json.data.now.orgTypeList[2].typeName : "暂无";
                    json.data.now.org.photo = json.data.now.orgResourceList[0] ? json.data.now.orgResourceList[0].path : "暂无";
                    json.data.now.org.photo2 = json.data.now.orgResourceList[1] ? json.data.now.orgResourceList[1].path : "暂无";
                    json.data.now.org.photo3 = json.data.now.orgResourceList[2] ? json.data.now.orgResourceList[2].path : "暂无";
                    json.data.now.org.photo4 = json.data.now.orgResourceList[3] ? json.data.now.orgResourceList[3].path : "暂无";
                    json.data.now.org.photo5 = json.data.now.orgResourceList[4] ? json.data.now.orgResourceList[4].path : "暂无";                   
                    // json.data.org.opinion = json.data.opinion;
                    // json.data.org.remark = json.data.remark;
                    // 只显示子级类型
                    // let tempOrgType = [];
                    // if (json.data.now.orgTypeList.length) {
                    //     json.data.now.orgTypeList.forEach((item) => {
                    //         tempOrgType.push(item.typeName)
                    //     })
                    // }
                    // json.data.now.org.typeName = tempOrgType.join("/");
                    // 机构星级
                    json.data.now.org.star = Math.ceil(json.data.now.org.scoreNumber / json.data.now.org.totalScore) || 0;                   
                    // 机构Logo
                    json.data.now.icon = json.data.now.orgResourceList.filter(fnFilter02);
                    // now 是修改前的数据； difference 是修改后的数据
                    this.setState({
                        loading: false,
                        data: json.data.now.org,
                        // orgTypeList: json.data.orgTypeList,
                        // orgResourceList: json.data.orgResourceList,
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
                    <span className="item-name">机构名称：</span>
                    <span className="item-content">{this.state.data.name}</span>
                </div>,                
                <div className="logo">
                    <span className="item-name">LOGO：</span>
                    {this.state.data.icon ? <img src={this.state.data.icon} alt=""
                                                 className="item-content"/> : "暂无"}
                </div>,
                <div className="typeName">
                    <span className="item-name">机构类型一：</span>
                    <span className="item-content">{this.state.data.typeName}</span>
                </div>,
                <div className="typeName">
                    <span className="item-name">机构类型二：</span>
                    <span className="item-content">{this.state.data.typeNameTwo || "暂无"}</span>
                </div>,
                <div className="typeName">
                    <span className="item-name">机构类型三：</span>
                    <span className="item-content">{this.state.data.typeNameThree || "暂无"}</span>
                </div>,
                <div className="managerName">
                    <span className="item-name">管理员：</span>
                    <span className="item-content">{this.state.data.managerName}</span>
                </div>,
                <div className="managerPhone">
                    <span className="item-name">联系电话：</span>
                    <span className="item-content">{this.state.data.managerPhone}</span>
                </div>,
                <div className="description">
                    <span className="item-name">机构简介：</span>
                    <pre>
                    <span className="item-content">{this.state.data.description || "暂无"}</span>
                </pre>
                </div>,
                <div className="photo">
                    <span className="item-name">图片一：</span>
                    <img src={this.state.data.photo} alt="" className="item-content"/>
                </div>,
                <div className="photo">
                    <span className="item-name">图片二：</span>
                    {
                        this.state.data.photo2 && this.state.data.photo2 !== "0" ?
                            <img src={this.state.data.photo2} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="photo">
                    <span className="item-name">图片三：</span>
                    {
                        this.state.data.photo3 && this.state.data.photo3 !== "0" ?
                            <img src={this.state.data.photo3} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="photo">
                    <span className="item-name">图片四：</span>
                    {
                        this.state.data.photo4 && this.state.data.photo4 !== "0" ?
                            <img src={this.state.data.photo4} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="photo">
                    <span className="item-name">图片五：</span>
                    {
                        this.state.data.photo5 && this.state.data.photo5 !== "0" ?
                            <img src={this.state.data.photo5} alt=""
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
                    <span className="item-name">机构地址：</span>
                    <span className="item-content">{this.state.data.address || "暂无"}</span>
                </div>,
                <div className="telephone">
                    <span className="item-name">机构电话：</span>
                    <span className="item-content">{this.state.data.telephone}</span>
                </div>,
                <div className="star">
                    <span className="item-name">机构星级：</span>
                    <span className="item-content">{this.state.data.star || "暂无"}</span>
                </div>,
                <div className="companyName">
                    <span className="item-name">公司名称：</span>
                    <span className="item-content">{this.state.data.companyName || "暂无"}</span>
                </div>,
                <div className="licenseNumber">
                    <span className="item-name">信用代码：</span>
                    <span className="item-content">{this.state.data.licenseNumber || "暂无"}</span>
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
                <div className="mainEducation">
                    <span className="item-name">是否主机构：</span>
                    <span className="item-content">{this.state.data.mainEducation?"否":"是"}</span>
                </div>,
                <div className="createTime">
                    <span className="item-name">创建时间：</span>
                    <span
                        className="item-content">{this.state.data.createTime ? this.timeHandle(this.state.data.createTime) : ""}</span>
                </div>,
                <div className="opinion">
                    <span className="item-name">审核意见：</span>
                    <pre>
                        <span className="item-content">{this.state.data.opinion || "暂无"}</span>
                    </pre>
                </div>,
                <div className="remark">
                    <span className="item-name">备注信息：</span>
                    <pre>
                        <span className="item-content">{this.state.data.remark || "暂无"}</span>
                    </pre>
                </div>

            ];
        } else {
            dataSource = ""
        }
        return (
            <a style={{display: this.props.status ? "inline" : "none"}}>
                <span onClick={this.showModal}>详情</span>
                <Modal
                    title="机构详情"
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

//机构详情对比组件
class ItemDetailsCompare extends Component {
    state = {
        visible: false,
        loading: true,
        data01: "",
        data02: "",
    };

    // 信息比对函数
    dataContrast = (values, values02) => {
        // difference 修改后的数据； now 是修改前的数据；
        // values 是修改后的数据；values02 是修改前的数据
        const initValues = values02.org; //修改前org数据
        const afterValues = values.org; //修改后org数据

        const initValuesOrgResourceList = values02.org.photos;//修改前orgResourceList即图片数据
        const afterValuesOrgResourceList = values.org.photos;//修改后orgResourceList即图片数据

        const initValuesOrgTypeList = values02.org.typess;//修改前orgTypeList机构类型数据
        const afterValuesOrgTypeList = values.org.typess;//修改后orgTypeList机构类型数据

        const initValuesOrgLabel = values02.org.label;//修改前label特色标签数据比较
        const afterValuesOrgLabel = values.org.label;//修改后label特色标签数据比较

        console.log(initValuesOrgResourceList);
        console.log(afterValuesOrgResourceList);

        console.log(initValuesOrgTypeList);
        console.log(afterValuesOrgTypeList);
        console.log(initValues);

        console.log(initValuesOrgLabel);
        console.log(afterValuesOrgLabel);

        const itemList = ["name", "telephone", "fees", "icon",  "description", "star", "provinceName", "cityName", "areaName", "areaId", "street", "address", "detailedAddress", "lng", "lat", "companyName", "licenseNumber", "additionalProtocol", "businessHours", "scope", "classNumber", "teacherNumber"];
        const result = {};
        itemList.forEach((item) => {
            if (afterValues[item] !== initValues[item]) {
                result[item] = afterValues[item];
            }
        });
        // 机构类型
        if (afterValuesOrgTypeList.toString() !== initValuesOrgTypeList.toString()) {
            result.orgTypeList = afterValuesOrgTypeList;
        }
        // 机构图片
        if (afterValuesOrgResourceList.toString() !== initValuesOrgResourceList.toString()) {
            result.orgResourceList = afterValuesOrgResourceList;
        }
        // 特色标签
        if (afterValuesOrgLabel.toString() !== initValuesOrgLabel.toString()) {
            result.label  = afterValuesOrgLabel.join("/");
        }
        console.log(result);
        if (JSON.stringify(result) === "{}") {
            console.log(88888)
            return false;
        } else {
            console.log(8888448)
            result.id = this.props.id;
            return result;
        }
    };

    getData = () => {
        reqwest({
            url: '/admin/org/getDifferences',
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
                //     data: [
                //         {
                //             institution: {
                //                 address: "",
                //                 areaName: "",
                //                 provinceName: "",
                //                 cityName: "",
                //                 street: "",
                //                 typeIdTwo: 0,
                //                 typeIdThree: 0,
                //                 photo3: "",
                //                 photo4: "0",
                //             },
                //             typeNameTwo: "",
                //             typeNameThree: "",
                //         },
                //         {
                //             institution: {
                //                 address: "",
                //                 areaId: null,
                //                 areaName: "",
                //                 balance: "",
                //                 cityId: null,
                //                 cityName: "",
                //                 companyName: "",
                //                 createTime: "",
                //                 description: "\n" + "\n" + "",
                //                 detailedAddress: "",
                //                 id: 177,
                //                 lat: "",
                //                 licenseNumber: "",
                //                 lng: "",
                //                 managerAddress: "",
                //                 managerName: "",
                //                 managerPhone: "",
                //                 name: "",
                //                 number: 1,
                //                 photo: "",
                //                 photo2: "",
                //                 photo3: "0",
                //                 // photo4: "",
                //                 // photo5: "",
                //                 icon: "",
                //                 // icon: "",
                //                 fees: "",
                //                 provinceId: null,
                //                 provinceName: "",
                //                 star: 5,
                //                 status: 2,
                //                 telephone: "",
                //                 typeId: 1,
                //                 typeIdTwo: 2,
                //                 typeIdThree: 3,
                //                 updateTime: "",
                //                 additionalProtocol: "\n" + "\n" + "",
                //                 realNameAuthentication: 0
                //             },
                //             typeName: "",
                //             typeNameTwo: "",
                //             typeNameThree: "",
                //         }
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    console.log(json.data)
                    // json.data[0].institution.typeName = json.data[0].typeName;
                    // json.data[0].institution.typeNameTwo = json.data[0].typeNameTwo;
                    // json.data[0].institution.typeNameThree = json.data[0].typeNameThree;
                    // json.data[1].institution.typeName = json.data[1].typeName;
                    // json.data[1].institution.typeNameTwo = json.data[1].typeNameTwo;
                    // json.data[1].institution.typeNameThree = json.data[1].typeNameThree;
                    // 过滤出机构图片
                    const fnFilter01 = (para) => {
                        return para.type === 1;
                    }
                    // 过滤出机构logo
                    const fnFilter02 = (para) => {
                        return para.type === 2;
                    }

                    let tempLogoNow = json.data.now.orgResourceList.filter(fnFilter02);
                    let tempPhotoNow = json.data.now.orgResourceList.filter(fnFilter01);

                    let tempLogoDifference = json.data.difference.orgResourceList.filter(fnFilter02);
                    let tempPhotoDifference = json.data.difference.orgResourceList.filter(fnFilter01);

                    // 修改前的机构Logo
                    if (tempLogoNow) {
                        tempLogoNow.forEach((item, index) => {
                            json.data.now.org.icon = item.path;
                        })
                    }
                    // json.data.now.org.icon = tempLogoNow[0].path;
                    
                    // 修改后的机构Logo
                    if (tempLogoDifference) {
                        tempLogoDifference.forEach((item, index) => {
                            json.data.now.org.icon = item.path;
                        })
                    }
                    // json.data.difference.org.icon = tempLogoDifference[0].path;

                    // 修改前的机构图片资源
                    const tempPhotosNow = [];
                    if (tempPhotoNow) {
                        tempPhotoNow.forEach((item, index)=>{
                            tempPhotosNow.push(item.path)
                        });
                    }

                    json.data.now.org.photos = tempPhotosNow;

                    // 修改后的机构图片资源
                    const tempPhotosDifference = [];
                    if (tempPhotoDifference) {
                        tempPhotoDifference.forEach((item, index)=>{
                            tempPhotosDifference.push(item.path)
                        });
                    }

                    json.data.difference.org.photos = tempPhotosDifference;

                    // 修改前的机构类型数组
                    const tempTypeNow = [];
                    if (json.data.now.orgTypeList) {
                        json.data.now.orgTypeList.forEach((item, index) => {
                            tempTypeNow.push(item.parentTypeName + "/" + item.typeName)
                        })
                    }

                    json.data.now.org.typess = tempTypeNow;

                    // 修改后的机构类型数组
                    const tempTypeDifference = [];
                    if (json.data.difference.orgTypeList) {
                        json.data.difference.orgTypeList.forEach((item, index) => {
                            tempTypeDifference.push(item.parentTypeName + "/" + item.typeName)
                        })
                    }

                    json.data.difference.org.typess = tempTypeDifference;

                    // 修改前机构星级
                    json.data.now.org.star = Math.ceil(json.data.now.org.scoreNumber / json.data.now.org.totalScore) || 0;
                    // 修改后机构星级
                    json.data.difference.org.star = Math.ceil(json.data.difference.org.scoreNumber / json.data.difference.org.totalScore) || 0;
                    
                    json.data.now.org.label_copy = json.data.now.org.label.join("/");
                    console.log(json.data.now.org.label_copy);
                    // now 是修改前的数据； difference 是修改后的数据
                    this.setState({
                        loading: false,
                        // difference 是修改前的数据；对比后修改的数据项
                        data01: this.dataContrast(json.data.difference, json.data.now),
                        // now 是修改前的数据；
                        data02: json.data.now
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
        let data01;
        const tempOrgTypeList01 = [];
        if (this.state.data01.orgTypeList) {
            this.state.data01.orgTypeList.forEach((item, index) => {
                tempOrgTypeList01.push(
                    <div className="item typeName" style={{display: this.state.data01.orgTypeList !== undefined ? "block" : "none"}}>
                        <span className="item-name" style={{display: index === 0 ? "inline" : "none"}}>机构类型一：</span>
                        <span className="item-name" style={{display: index === 1 ? "inline" : "none"}}>机构类型二：</span>
                        <span className="item-name" style={{display: index === 2 ? "inline" : "none"}}>机构类型三：</span>
                        <span className="item-content">{item.parentTypeName + "/" +item.typeName}</span>
                    </div>
                )
            })
        }
        if (this.state.data01) {
            data01 = [
                <div className="item name" style={{display: this.state.data01.name ? "block" : "none"}}>
                    <span className="item-name">机构名称：</span>
                    <span className="item-content">{this.state.data01.name || "暂无"}</span>
                </div>,
                <div className="item logo" style={{display: this.state.data01.icon ? "block" : "none"}}>
                    <span className="item-name">LOGO：</span>
                    {this.state.data01.icon ? <img src={this.state.data01.icon} alt=""
                                                   className="item-content"/> : "暂无"}
                </div>,                
                <div className="item typeName" style={{display: this.state.data01.orgTypeList !== undefined ? "block" : "none"}}>
                    <span className="item-name">机构类型一：</span>
                    <span className="item-content">{  this.state.data01.orgTypeList && this.state.data01.orgTypeList[0] ? this.state.data01.orgTypeList[0] : "暂无"}</span>
                </div>,
                <div className="item typeNameTwo"
                     style={{display: this.state.data01.orgTypeList !== undefined ? "block" : "none"}}
                     >
                    <span className="item-name">机构类型二：</span>
                    <span className="item-content">{ this.state.data01.orgTypeList && this.state.data01.orgTypeList[1] ? this.state.data01.orgTypeList[1] : "暂无"}</span>
                </div>,
                <div className="item typeNameThree"
                     style={{display: this.state.data01.orgTypeList !== undefined ? "block" : "none"}}
                     >
                    <span className="item-name">机构类型三：</span>
                    <span className="item-content">{ this.state.data01.orgTypeList && this.state.data01.orgTypeList[2] ? this.state.data01.orgTypeList[2] : "暂无"}</span>
                </div>,
                <div className="subscribeNumber"
                    style={{display: this.state.data01.subscribeNumber ? "block" : "none"}}
                >
                    <span className="item-name">预约试听数：</span>
                    <span className="item-content">{this.state.data01.subscribeNumber}</span>
                </div>,
                <div className="geschaftszeit"
                    style={{display: this.state.data01.businessHours ? "block" : "none"}}
                >
                    <span className="item-name">营业时间：</span>
                    <span className="item-content">{this.state.data01.businessHours || "暂无"}</span>
                </div>,
                <div className="scope"
                    style={{display: this.state.data01.scope ? "block" : "none"}}
                >
                    <span className="item-name">商家面积：</span>
                    <span className="item-content">{this.state.data01.scope || "暂无"}</span>
                </div>,
                <div className="classNumber"
                    style={{display: this.state.data01.classNumber ? "block" : "none"}}
                    >
                    <span className="item-name">教室数目：</span>
                    <span className="item-content">{this.state.data01.classNumber || "暂无"}</span>
                </div>,
                <div className="teacherNumber"
                    style={{display: this.state.data01.teacherNumber ? "block" : "none"}}
                    >
                    <span className="item-name">师资力量：</span>
                    <span className="item-content">{this.state.data01.teacherNumber || "暂无"}</span>
                </div>,
                <div className="label"
                    style={{display: this.state.data01.label ? "block" : "none"}}
                    >
                    <span className="item-name">特色标签：</span>
                    <span className="item-content">{this.state.data01.label || "暂无"}</span>
                </div>,
                <div className="item description" 
                    style={{display: this.state.data01.description ? "block" : "none"}}
                    >
                    <span className="item-name">机构简介：</span>
                    <pre>
                    <span className="item-content">{this.state.data01.description || "暂无"}</span>
                </pre>
                </div>,
                
                <div className="item photo" 
                    style={{display: this.state.data01.orgResourceList && this.state.data01.orgResourceList[0] ? "block" : "none"}}
                    >
                    <span className="item-name">图片一：</span>
                    {
                        this.state.data01.orgResourceList && this.state.data01.orgResourceList[0] !== "" ?
                            <img src={this.state.data01.orgResourceList[0]} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="item photo" 
                    style={{display: this.state.data01.orgResourceList && this.state.data01.orgResourceList[1] ? "block" : "none"}}
                    >
                    <span className="item-name">图片二：</span>
                    {
                        this.state.data01.orgResourceList && this.state.data01.orgResourceList[1] !== "" ?
                            <img src={this.state.data01.orgResourceList[1]} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="item photo" 
                    style={{display:this.state.data01.orgResourceList && this.state.data01.orgResourceList[2] ? "block" : "none"}}
                    >
                    <span className="item-name">图片三：</span>
                    {
                        this.state.data01.orgResourceList && this.state.data01.orgResourceList[2] !== "" ?
                            <img src={this.state.data01.orgResourceList[2]} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="item photo" 
                    style={{display: this.state.data01.orgResourceList && this.state.data01.orgResourceList[3] ? "block" : "none"}}
                    >
                    <span className="item-name">图片四：</span>
                    {
                        this.state.data01.orgResourceList && this.state.data01.orgResourceList[3] !== "" ?
                            <img src={this.state.data01.orgResourceList[3]} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="item photo" 
                    style={{display: this.state.data01.orgResourceList && this.state.data01.orgResourceList[4] ? "block" : "none"}}
                    >
                    <span className="item-name">图片五：</span>
                    {
                        this.state.data01.orgResourceList && this.state.data01.orgResourceList[4] !== "" ?
                            <img src={this.state.data01.orgResourceList[4]} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="item province" 
                    style={{display: this.state.data01.provinceName ? "block" : "none"}}
                    >
                    <span className="item-name">所在省：</span>
                    <span className="item-content">{this.state.data01.provinceName || "暂无"}</span>
                </div>,
                <div className="item city" 
                    style={{display: this.state.data01.cityName ? "block" : "none"}}
                    >
                    <span className="item-name">所在市：</span>
                    <span className="item-content">{this.state.data01.cityName || "暂无"}</span>
                </div>,
                <div className="item area" 
                    style={{display: this.state.data01.areaName ? "block" : "none"}}
                    >
                    <span className="item-name">所在地区：</span>
                    <span className="item-content">{this.state.data01.areaName || "暂无"}</span>
                </div>,
                <div className="item street" 
                    style={{display: this.state.data01.street ? "block" : "none"}}
                    >
                    <span className="item-name">所在街道：</span>
                    <span className="item-content">{this.state.data01.street || "暂无"}</span>
                </div>,
                <div className="item address" 
                    style={{display: this.state.data01.detailedAddress ? "block" : "none"}}
                    >
                    <span className="item-name">详细地址：</span>
                    <span className="item-content">{this.state.data01.detailedAddress|| "暂无"}</span>
                </div>,
                <div className="item telephone" 
                    style={{display: this.state.data01.telephone ? "block" : "none"}}
                    >
                    <span className="item-name">机构电话：</span>
                    <span className="item-content">{this.state.data01.telephone || "暂无"}</span>
                </div>,
                <div className="item companyName" 
                    style={{display: this.state.data01.companyName ? "block" : "none"}}
                    >
                    <span className="item-name">企业名称：</span>
                    <span className="item-content">{this.state.data01.companyName || "暂无"}</span>
                </div>,
                <div className="item licenseNumber"
                     style={{display: this.state.data01.licenseNumber ? "block" : "none"}}
                     >
                    <span className="item-name">执照号码：</span>
                    <span className="item-content">{this.state.data01.licenseNumber || "暂无"}</span>
                </div>,
                <div className="item fees" 
                    style={{display: this.state.data01.fees ? "block" : "none"}}
                    >
                    <span className="item-name">手续费：</span>
                    <span className="item-content">{Number(this.state.data01.fees) || "暂无"}</span>
                </div>,
                <div className="star"
                    style={{display: this.state.data01.star ? "block" : "none"}}>
                    <span className="item-name">机构星级：</span>
                    <span className="item-content">{this.state.data01.star || "暂无"}</span>
                </div>,
                <div className="item additionalProtocol"
                     style={{display: this.state.data01.additionalProtocol ? "block" : "none"}}
                     >
                    <span className="item-name">附加协议：</span>
                    <pre>
                    <span className="item-content">{this.state.data01.additionalProtocol || "暂无"}</span>
                </pre>
                </div>
            ];
        } else {
            data01 = ""
        }
        let data02;
        const tempOrgTypeList02 = [];
        if (this.state.data02.orgTypeList) {
            this.state.data02.orgTypeList.forEach((item, index) => {
                tempOrgTypeList02.push(
                    <div className="item typeName">
                        <span className="item-name" style={{display: index === 0 ? "inline" : "none"}}>机构类型一：</span>
                        <span className="item-name" style={{display: index === 1 ? "inline" : "none"}}>机构类型二：</span>
                        <span className="item-name" style={{display: index === 2 ? "inline" : "none"}}>机构类型三：</span>
                        <span className="item-content">{item.parentTypeName + "/" +item.typeName}</span>
                    </div>
                )
            })
        }
        if (this.state.data02) {
            data02 = [
                <div className="item name">
                    <span className="item-name">机构名称：</span>
                    <span className="item-content">{this.state.data02.org.name || "暂无"}</span>
                </div>,
                <div className="item logo">
                    <span className="item-name">LOGO：</span>
                    {this.state.data02.org.icon ? <img src={this.state.data02.org.icon} alt=""
                                                   className="item-content"/> : "暂无"}
                </div>,
                <div className="item typeName">
                    {tempOrgTypeList02}
                </div>,                
                <div className="subscribeNumber">
                    <span className="item-name">预约试听数：</span>
                    <span className="item-content">{this.state.data02.org.subscribeNumber || "暂无"}</span>
                </div>,
                <div className="geschaftszeit">
                    <span className="item-name">营业时间：</span>
                    <span className="item-content">{this.state.data02.org.businessHours || "暂无"}</span>
                </div>,
                <div className="scope">
                    <span className="item-name">商家面积：</span>
                    <span className="item-content">{(this.state.data02.org.scope + "平方米")|| "暂无"}</span>
                </div>,
                <div className="classNumber">
                    <span className="item-name">教室数目：</span>
                    <span className="item-content">{this.state.data02.org.classNumber + "间"|| "暂无"}</span>
                </div>,
                <div className="teacherNumber">
                    <span className="item-name">师资力量：</span>
                    <span className="item-content">{this.state.data02.org.teacherNumber + "名"|| "暂无"}</span>
                </div>,
                <div className="label">
                    <span className="item-name">特色标签：</span>
                    <span className="item-content">{this.state.data02.org.label_copy || "暂无"}</span>
                </div>,
                <div className="item description">
                    <span className="item-name">机构简介：</span>
                    <pre>
                        <span className="item-content">{this.state.data02.org.description || "暂无"}</span>
                    </pre>
                </div>,
                <div className="item photo">
                    <span className="item-name">图片一：</span>
                    {
                        this.state.data02.orgResourceList[0] && this.state.data02.orgResourceList[0].path !== "" ?
                            <img src={this.state.data02.orgResourceList[0].path} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="item photo">
                    <span className="item-name">图片二：</span>
                    {
                        this.state.data02.orgResourceList[1] && this.state.data02.orgResourceList[1].path !== "" ?
                            <img src={this.state.data02.orgResourceList[1].path} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="item photo">
                    <span className="item-name">图片三：</span>
                    {
                        this.state.data02.orgResourceList[2] && this.state.data02.orgResourceList[2].path !== "" ?
                            <img src={this.state.data02.orgResourceList[2].path} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="item photo">
                    <span className="item-name">图片四：</span>
                    {
                        this.state.data02.orgResourceList[3] && this.state.data02.orgResourceList[3].path !== "" ?
                            <img src={this.state.data02.orgResourceList[3].path} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="item photo">
                    <span className="item-name">图片五：</span>
                    {
                        this.state.data02.orgResourceList[4] && this.state.data02.orgResourceList[4].path !== "" ?
                            <img src={this.state.data02.orgResourceList[4].path} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="item province">
                    <span className="item-name">所在省：</span>
                    <span className="item-content">{this.state.data02.org.provinceName || "暂无"}</span>
                </div>,
                <div className="item city">
                    <span className="item-name">所在市：</span>
                    <span className="item-content">{this.state.data02.org.cityName || "暂无"}</span>
                </div>,
                <div className="item district">
                    <span className="item-name">所在地区：</span>
                    <span className="item-content">{this.state.data02.org.areaName || "暂无"}</span>
                </div>,
                <div className="item street">
                    <span className="item-name">所在街道：</span>
                    <span className="item-content">{this.state.data02.org.street || "暂无"}</span>
                </div>,
                <div className="item address">
                    <span className="item-name">详细地址：</span>
                    <span className="item-content">{this.state.data02.org.detailedAddress || "暂无"}</span>
                </div>,
                <div className="item telephone">
                    <span className="item-name">机构电话：</span>
                    <span className="item-content">{this.state.data02.org.telephone || "暂无"}</span>
                </div>,
                <div className="item companyName">
                    <span className="item-name">企业名称：</span>
                    <span className="item-content">{this.state.data02.org.companyName || "暂无"}</span>
                </div>,
                <div className="item licenseNumber">
                    <span className="item-name">执照号码：</span>
                    <span className="item-content">{this.state.data02.org.licenseNumber || "暂无"}</span>
                </div>,
                <div className="item fees">
                    <span className="item-name">手续费：</span>
                    <span className="item-content">{Number(this.state.data02.org.fees) || "暂无"}</span>
                </div>,
                <div className="item star">
                    <span className="item-name">机构星级：</span>
                    <span className="item-content">{this.state.data01.star || "暂无"}</span>
                </div>,
                <div className="item additionalProtocol">
                    <span className="item-name">附加协议：</span>
                    <pre>
                    <span className="item-content">{this.state.data02.org.additionalProtocol || "暂无"}</span>
                </pre>
                </div>
            ];
        } else {
            data02 = ""
        }
        return (
            <a style={{display: this.props.status ? "inline" : "none"}}>
                <span onClick={this.showModal}>详情对比</span>
                <Modal
                    title="详情对比"
                    width={1200}
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                    destroyOnClose={true}
                >
                    <div className="institution-check-box clearfix">
                        <div className="institution-check-details institution-check-details-left item-details">
                            <p className="title">修改后：</p>
                            <div className="institution-check-baseData">
                                <List
                                    size="small"
                                    split="false"
                                    dataSource={data01}
                                    renderItem={item => (<List.Item>{item}</List.Item>)}
                                    loading={this.state.loading}
                                />
                            </div>
                        </div>
                        <div className="institution-check-details institution-check-details-right item-details">
                            <p className="title">修改前：</p>
                            <div className="institution-check-baseData">
                                <List
                                    size="small"
                                    split="false"
                                    dataSource={data02}
                                    renderItem={item => (<List.Item>{item}</List.Item>)}
                                    loading={this.state.loading}
                                />
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
            url: '/admin/org/checkOpinion',
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
                //         opinion: "",
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    let data = "";
                    if (json.data) {
                        data = json.data
                    }
                    this.setState({
                        loading: false,
                        data: data,
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
        return (
            <a style={{display: this.props.status ? "inline" : "none"}}>
                <span onClick={this.showModal}>驳回意见</span>
                <Modal
                    title="驳回意见"
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

//机构信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, id, status, data, typeList, viewPic01, setViewPic01, picUpload01, avatarEditor01, setAvatarEditor01, photoList01, setPhotoList01, photoLoading, viewPic02, setViewPic02, data_pic02, effectPic02, picUpload02, avatarEditor02, setAvatarEditor02, logoLoading, provinceList, cityList, districtList, streetList, markers, setMarkers, area, setArea, mapObj, setXY, setFormattedAddress, formattedAddress, saveLoading, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // // 机构类型选项生成
        // const optionsOfTypeList = [];
        // typeList.forEach((item, index) => {
        //     optionsOfTypeList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
        // });

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
            return new Blob([u8arr], { type: "image/jpeg" });
        };

        // 机构图片相关
        const setEditorRef01 = (editor) => this.editor01 = editor;
        const beforeUpload01 = (file) => {
            const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isIMG) {
                message.error('文件类型错误');
                return false
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('文件不能大于2M');
                return false
            }
            getBase64(file, (imageUrl) => {
                setViewPic01(imageUrl);
            });
            return false
        };
        const uploadButton01 = (
            <div>
                <Icon type={'plus'}/>
                <div className="ant-upload-text" style={{display: viewPic01 ? "none" : "block"}}>选择图片</div>
            </div>
        );
        const picHandle01 = () => {
            if (viewPic01) {
                const canvas = this.editor01.getImage();
                const url = canvas.toDataURL("image/jpeg", 0.92);
                const file = dataURLtoFile(url);
                picUpload01(file)
            } else {
                message.error("图片未选择");
            }
        };
        const partImg01 = (
            <AvatarEditor
                ref={setEditorRef01}
                image={viewPic01}
                width={180}
                height={100}
                border={0}
                color={[255, 255, 255, 0.6]}
                scale={avatarEditor01.scale}
                position={{x: avatarEditor01.positionX, y: avatarEditor01.positionY}}
                rotate={0}
            />
        );

        // 机构LOGO相关
        const setEditorRef02 = (editor) => this.editor02 = editor;
        const beforeUpload02 = (file) => {
            const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isIMG) {
                message.error('文件类型错误');
                return false
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('文件不能大于2M');
                return false
            }
            getBase64(file, (imageUrl) => {
                setViewPic02(imageUrl);
            });
            return false
        };
        const uploadButton02 = (
            <div>
                <Icon type={'plus'}/>
                <div className="ant-upload-text" style={{display: viewPic02 ? "none" : "block"}}>选择图片</div>
            </div>
        );
        const picHandle02 = () => {
            if (viewPic02 && viewPic02.slice(26) !== data_pic02) {
                const canvas = this.editor02.getImage();
                const url = canvas.toDataURL("png", 0.92);
                if (url === effectPic02) {
                    message.error("图片未改动，无法提交");
                    return
                }
                const file = dataURLtoFile(url, "effective.jpg");
                picUpload02(url, file)
            } else {
                message.error("图片未改动，无法提交");
            }
        };
        const partImg02 = (
            <AvatarEditor
                ref={setEditorRef02}
                image={viewPic02}
                width={80}
                height={80}
                border={0}
                color={[255, 255, 255, 0.6]}
                scale={avatarEditor02.scale}
                position={{x: avatarEditor02.positionX, y: avatarEditor02.positionY}}
                rotate={0}
            />
        );

        // 机构地址相关
        const provinceOptions = provinceList.map(item => <Option key={item.name}>{item.name}</Option>);
        const cityOptions = cityList.map(item => <Option key={item.name}>{item.name}</Option>);
        const districtOptions = districtList.map(item => <Option key={item.name}>{item.name}</Option>);
        const streetOptions = streetList.map(item => <Option key={item.name}>{item.name}</Option>);
        const addressChange = (value) => {
            if (!value) {
                return
            }
            let keyword = "";
            keyword = keyword + area.province + area.city + area.district + area.street;
            keyword = keyword + value;
            // 清除已有标记点
            mapObj.remove(markers);
            mapObj.plugin('AMap.Geocoder', function () {
                const geocoder = new window.AMap.Geocoder({});
                const marker = new window.AMap.Marker({
                    map: mapObj,
                    bubble: true
                });
                geocoder.getLocation(keyword, (status_, result_) => {
                    if (status_ === 'complete' && result_.info === 'OK') {
                        geocoder.getAddress([result_.geocodes[0].location.lng, result_.geocodes[0].location.lat], (status, result) => {
                            if (status === 'complete' && result.info === 'OK') {
                                // 经纬度写入
                                setXY({x: result_.geocodes[0].location.lng, y: result_.geocodes[0].location.lat});
                                // 生成当前标记点
                                marker.setPosition(result_.geocodes[0].location);
                                mapObj.setCenter(marker.getPosition());
                                setMarkers(marker);
                                // address字段写入
                                setFormattedAddress(area.street ? keyword : result.regeocode.addressComponent.province + result.regeocode.addressComponent.city + result.regeocode.addressComponent.district + result.regeocode.addressComponent.township + keyword);
                                // 其他地址信息写入
                                setArea(5, result.regeocode.addressComponent);
                            }
                        });
                    }
                });
            });
        };

        return (
            <Modal
                visible={visible}
                title="机构编辑"
                width={750}
                onCancel={onCancel}
                destroyOnClose={true}
                footer={[
                    <Button key="back" onClick={onCancel} disabled={saveLoading || confirmLoading}>取消</Button>,
                    /*<Button style={{display: status === 3 ? 'none' : 'inline'}} key="save" type="primary"
                            loading={saveLoading} disabled={confirmLoading}
                            onClick={() => onCreate(1)}>暂存</Button>,
                    <Button style={{display: status === 3 ? 'none' : 'inline'}} key="save_submit" type="primary"
                            loading={confirmLoading} disabled={saveLoading}
                            onClick={() => onCreate(2)}>{status === 10 ? "录入完成" : "保存并提交"}</Button>,*/
                    // <Button style={{display: status === 3 ? 'inline' : 'none'}} key="submit" type="primary"
                    //         loading={confirmLoading} disabled={saveLoading}
                    //         onClick={() => onCreate(2)}>确定</Button>
                    <Button style={{display: status === 3 ? 'none' : 'inline'}} key="submit" type="primary"
                            loading={confirmLoading} disabled={saveLoading}
                            onClick={() => onCreate(2)}>确定</Button>
                ]}
            >
                {
                    JSON.stringify(data) === "{}" ?
                        <div className="spin-box">
                            <Spin/>
                        </div>
                        :
                        <div className="institution-edit institution-form item-form">
                            <Form layout="vertical">
                                <FormItem className="name" {...formItemLayout_12} label="机构名称：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.name,
                                        rules: [{
                                            required: true,
                                            message: '机构名称不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入机构名称"/>
                                    )}
                                </FormItem>
                                <FormItem className="typeIds" {...formItemLayout_12} label="机构类型：">
                                    {getFieldDecorator('typeIds', {
                                        initialValue: data.typeIds,
                                        rules: [{
                                            required: true,
                                            message: '机构类型不能为空',
                                        }],
                                    })(
                                        // <Select
                                        //     mode="multiple"
                                        //     style={{width: '100%'}}
                                        //     placeholder="请选择机构所属类型（最多三项）"
                                        // >
                                        //     {optionsOfTypeList}
                                        // </Select>
                                        <TreeSelect
                                            style={{width: 300}}
                                            placeholder="请选择机构类型（最多三项）"
                                            dropdownStyle={{maxHeight: 400, overflow: "auto"}}
                                            treeCheckable={true}
                                            treeData={typeList}
                                            showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                        />
                                    )}
                                </FormItem>
                                <FormItem className="telephone" {...formItemLayout_8} label="机构电话：">
                                    {getFieldDecorator('telephone', {
                                        initialValue: data.telephone,
                                        rules: [{
                                            required: true,
                                            message: '机构电话不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入机构电话号码"/>
                                    )}
                                </FormItem>
                                <FormItem className="photo" {...formItemLayout_14} label="机构图片：">
                                    {getFieldDecorator('photo', {
                                        initialValue: photoList01[0],
                                        rules: [{
                                            required: true,
                                            message: '机构图片不能为空',
                                        }],
                                    })(
                                        <div className="itemBox">
                                            {photoExist01}
                                            <Upload
                                                name="file"
                                                listType="picture-card"
                                                className="avatar-uploader"
                                                showUploadList={false}
                                                // action="/file/upload"
                                                beforeUpload={beforeUpload01}
                                            >
                                                {viewPic01 ? partImg01 : uploadButton01}
                                                <p className="hint">（可上传1-5张图片）</p>
                                            </Upload>
                                            <Row>
                                                <Col span={4}>缩放：</Col>
                                                <Col span={12}>
                                                    <Slider min={1} max={1.5} step={0.01} value={avatarEditor01.scale}
                                                            disabled={!viewPic01}
                                                            onChange={(value) => {
                                                                setAvatarEditor01(1, value)
                                                            }}/>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={4}>X：</Col>
                                                <Col span={12}>
                                                    <Slider min={0} max={1} step={0.01} value={avatarEditor01.positionX}
                                                            disabled={!viewPic01}
                                                            onChange={(value) => {
                                                                setAvatarEditor01(2, value)
                                                            }}/>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={4}>Y：</Col>
                                                <Col span={12}>
                                                    <Slider min={0} max={1} step={0.01} value={avatarEditor01.positionY}
                                                            disabled={!viewPic01}
                                                            onChange={(value) => {
                                                                setAvatarEditor01(3, value)
                                                            }}/>
                                                </Col>
                                            </Row>
                                            <Button type="primary"
                                                    onClick={picHandle01}
                                                    loading={photoLoading}
                                                    style={{
                                                        position: "absolute",
                                                        right: "-20px",
                                                        bottom: "0"
                                                    }}>
                                                图片提交
                                            </Button>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem className="description longItem" {...formItemLayout_14} label="机构简介：">
                                    {getFieldDecorator('description', {
                                        initialValue: data.description,
                                        rules: [{
                                            required: true,
                                            message: '机构简介不能为空',
                                        }],
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写机构简介" rows={10}/>
                                    )}
                                </FormItem>
                                <FormItem className="icon" {...formItemLayout_12} label="机构LOGO：">
                                    {getFieldDecorator('icon', {
                                        initialValue: viewPic02,
                                        rules: [{
                                            required: true,
                                            message: '机构LOGO不能为空',
                                        }],
                                    })(
                                        <div className="itemBox">
                                            <Upload
                                                name="file"
                                                listType="picture-card"
                                                className="avatar-uploader"
                                                showUploadList={false}
                                                // action="/file/upload"
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
                                                        right: "-20px",
                                                        bottom: "0"
                                                    }}>图片提交</Button>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem className="fees" {...formItemLayout_8} label="手续费：">
                                    {getFieldDecorator('fees', {
                                        initialValue: data.fees,
                                        rules: [{
                                            required: true,
                                            message: '机构手续费不能为空',
                                        }],
                                    })(
                                        <InputNumber max={1} min={0} precision={2} step={0.01}/>
                                    )}
                                </FormItem>
                                <div className="feesHint">填写0.15即为手续费15%</div>
                                <FormItem className="area longItem" {...formItemLayout_16} label="机构地址：">
                                    {getFieldDecorator('area', {
                                        rules: [{
                                            required: false
                                        }],
                                    })(
                                        <div>
                                            <Select placeholder="省" style={{width: 100, marginRight: 10}}
                                                    value={area.province || undefined} onChange={(value) => {
                                                setArea(1, value)
                                            }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                {provinceOptions}
                                            </Select>
                                            <Select placeholder="市" style={{width: 100, marginRight: 10}}
                                                    value={area.city || undefined} onChange={(value) => {
                                                setArea(2, value)
                                            }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                {cityOptions}
                                            </Select>
                                            <Select placeholder="区" style={{width: 100, marginRight: 10}}
                                                    value={area.district || undefined} onChange={(value) => {
                                                setArea(3, value)
                                            }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                {districtOptions}
                                            </Select>
                                            <Select placeholder="街道" style={{width: 100}}
                                                    value={area.street || undefined}
                                                    onChange={(value) => {
                                                        setArea(4, value)
                                                    }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                {streetOptions}
                                            </Select>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem className="detailedAddress longItem" {...formItemLayout_16} label="">
                                    {getFieldDecorator('detailedAddress', {
                                        initialValue: data.detailedAddress,
                                        rules: [{
                                            required: true,
                                            message: '详细地址不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请填写详细地址"
                                               onBlur={(event) => addressChange(event.target.value)}/>
                                    )}
                                </FormItem>
                                <p className="addressSaved">定位点：{formattedAddress || "暂无"}</p>
                                <div id={"edit-institution-container" + id} name="container" tabIndex="0"
                                     style={{
                                         width: "520px",
                                         height: "320px",
                                         marginLeft: "50px",
                                         marginBottom: "10px"
                                     }}/>
                                <FormItem className="companyName" {...formItemLayout_12} label="企业名称：">
                                    {getFieldDecorator('companyName', {
                                        initialValue: data.companyName,
                                        rules: [{
                                            required: true,
                                            message: '企业名称不能为空',
                                        }]
                                    })(
                                        <Input placeholder="请输入企业名称"/>
                                    )}
                                </FormItem>
                                <FormItem className="licenseNumber" {...formItemLayout_12} label="执照号码：">
                                    {getFieldDecorator('licenseNumber', {
                                        initialValue: data.licenseNumber,
                                        rules: [{
                                            required: true,
                                            max: 18,
                                            message: '请填写正确的执照号码',
                                        }],
                                    })(
                                        <Input placeholder="请输入18位执照号码"/>
                                    )}
                                </FormItem>
                                <FormItem className="additionalProtocol unnecessary" {...formItemLayout_14}
                                          label="附加协议：">
                                    {getFieldDecorator("additionalProtocol", {
                                        initialValue: data.additionalProtocol,
                                        rules: [{
                                            required: false
                                        }],
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写附加协议" rows={10}/>
                                    )}
                                </FormItem>
                                <FormItem className="remark longItem unnecessary" {...formItemLayout_14} label="备注：">
                                    {
                                        getFieldDecorator('remark', {
                                            initialValue: data.remark,
                                            rules: [{
                                                required: false,
                                            }],
                                        })(
                                            <TextArea style={{resize: "none"}} placeholder="请填写备注信息"
                                                      autosize={{minRows: 3, maxRows: 10}}/>
                                        )
                                    }
                                </FormItem>
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

//机构信息编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,
        data: {},
        // 机构类型表
        typeList: [],
        // 机构图片相关变量
        uploadToken: "",
        viewPic01: "",
        photoList01: [],
        avatarEditor01: {
            scale: 1,
            positionX: 0.5,
            positionY: 0.5
        },
        photoLoading: false,
        // 机构LOGO相关变量
        viewPic02: "",
        data_pic02: "",
        effectPic02: "",
        avatarEditor02: {
            scale: 1,
            positionX: 0.5,
            positionY: 0.5
        },
        logoLoading: false,
        // 机构地址相关变量
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
        // 暂存按钮状态变量
        saveLoading: false,
        // 提交按钮状态变量
        confirmLoading: false
    };

    // 获取机构类型列表
    getInstitutionTypeList = () => {
        reqwest({
            // url: '/institution/getEducationTypeList',
            url: '/sys/orgType/getByOrg',
            type: 'json',
            method: 'get',
            data: {
                orgId: this.props.orgId
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: [
                //         {id: 1, name: ""},
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
                        typeList: data
                    })
                    // this.setState({
                    //     typeList: json.data
                    // })
                }
            }
        })
    };

    // 获取机构基本信息
    getData = () => {
        reqwest({
            // url: '/cache/getDetailsEducations',
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
                //             address: "默认地址",
                //             areaId: 320502,
                //             areaName: "沧浪区",
                //             balance: "",
                //             cityId: 320500,
                //             cityName: "苏州市",
                //             companyName: "",
                //             createTime: "",
                //             // description: "\n" + "\n" + "",
                //             detailedAddress: "东环路1408号",
                //             id: 1,
                //             lat: "31.166595",
                //             licenseNumber: "",
                //             lng: "121.425004",
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
                //             provinceId: 320000,
                //             provinceName: "江苏省",
                //             star: null,
                //             status: null,
                //             street: "暂无",
                //             telephone: "",
                //             typeId: 2,
                //             typeName: "",
                //             typeIdTwo: 3,
                //             updateTime: ""
                //         }，
                //         remark: "111111"
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    // 已有机构类型写入
                    const typeIds = [];
                    // if (json.data.institution.typeId) {
                    //     typeIds.push(json.data.institution.typeId)
                    // }
                    // if (json.data.institution.typeIdTwo) {
                    //     typeIds.push(json.data.institution.typeIdTwo)
                    // }
                    // if (json.data.institution.typeIdThree) {
                    //     typeIds.push(json.data.institution.typeIdThree)
                    // }
                    if (json.data.orgTypeList) {
                        json.data.orgTypeList.forEach((item, index) => {
                            typeIds.push(item.typeId)
                        })
                    }
                    json.data.org.typeIds = typeIds;
                    // json.data.institution.typeIdTwo = json.data.institution.typeIdTwo ? json.data.institution.typeIdTwo : 0;
                    // json.data.institution.typeIdThree = json.data.institution.typeIdThree ? json.data.institution.typeIdThree : 0;
                    // 已有机构图片写入
                    const photoList01 = [];
                    // if (json.data.institution.photo && json.data.institution.photo !== "0") {
                    //     photoList01.push(json.data.institution.photo)
                    // } else {
                    //     json.data.institution.photo = 0;
                    // }
                    // if (json.data.institution.photo2 && json.data.institution.photo2 !== "0") {
                    //     photoList01.push(json.data.institution.photo2)
                    // } else {
                    //     json.data.institution.photo2 = 0;
                    // }
                    // if (json.data.institution.photo3 && json.data.institution.photo3 !== "0") {
                    //     photoList01.push(json.data.institution.photo3)
                    // } else {
                    //     json.data.institution.photo3 = 0
                    // }
                    // if (json.data.institution.photo4 && json.data.institution.photo4 !== "0") {
                    //     photoList01.push(json.data.institution.photo4)
                    // } else {
                    //     json.data.institution.photo4 = 0
                    // }
                    // if (json.data.institution.photo5 && json.data.institution.photo5 !== "0") {
                    //     photoList01.push(json.data.institution.photo5)
                    // } else {
                    //     json.data.institution.photo5 = 0
                    // }
                    // 备注信息写入
                    // json.data.institution.remark=json.data.remark;
                    this.setState({
                        data: json.data.org,
                        photoList01: photoList01,
                        // viewPic02: json.data.institution.icon ? "http://image.taoerxue.com/" + json.data.institution.icon : "",
                        // effectPic02: json.data.institution.icon ? "http://image.taoerxue.com/" + json.data.institution.icon : "",
                        // data_pic02: json.data.institution.icon,
                        areaId: json.data.org.areaId,
                        formattedAddress: json.data.org.address,
                        xy: {
                            x: json.data.org.lng,
                            y: json.data.org.lat
                        }
                    }, () => {
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
                    }
                    this.setState({

                    })
                }
            }
        })
    };

    showModal = () => {
        // 获取机构基本信息
        this.getData();
        // 获取机构类型列表
        this.getInstitutionTypeList();
        // 获取图片上传的token
        this.reqwestUploadToken();
        this.setState({
            visible: true,
        })
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
    picUpload01 = (para) => {
        const _this = this;//改变this指向
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
                    // message.error("图片提交失败");
                    _this.setState({
                        photoLoading: false,
                    })
                }, 
                complete (res) {
                    console.log(res);
                    message.success("图片提交成功");
                    let photoList01 = _this.state.photoList01;                    
                    photoList01.push({
                        path: global.config.photoUrl + res.key
                    });
                    _this.setState({
                        photoList01: photoList01,
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
             logoLoading: true,
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
                    logoLoading: false,
                })
            }
        }
        const observable = qiniu.upload(file, key, token, config)
        observable.subscribe(observer) // 上传开始
    };

    // 机构地址处理-----------------------------------
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

    dataContrast = (values) => {
        const initValues = this.state.data;
        const itemList = ["name", "typeId", "typeIdTwo", "typeIdThree", "telephone", "photo", "photo2", "photo3", "photo4", "photo5", "icon", "fees", "description", "provinceName", "cityName", "areaName", "areaId", "street", "address", "detailedAddress", "lng", "lat", "companyName", "licenseNumber", "additionalProtocol", "remark"];
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
            result.educationKey = this.props.educationKey;
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
            })
        };
        // data空值处理
        if (JSON.stringify(this.state.data) === "{}") {
            cancel();
            return;
        }
        // 地址信息加载中处理
        if (this.state.addressLoading) {
            message.warning("地图信息加载中，请稍后进行操作");
            return
        }
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
            const result = this.dataContrast(values);
            if (result) {
                confirm({
                    title: '确认放弃修改？',
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

    // 确认操作
    handleCreate = (type) => {
        // data空值处理
        if (JSON.stringify(this.state.data) === "{}") {
            return;
        }
        // 地址信息加载中处理
        if (this.state.addressLoading) {
            message.warning("地图信息加载中，请稍后进行操作");
            return
        }
        const form = this.form;
        // 部分录入
        if (type === 1) {
            // 获取表单数据
            let values = form.getFieldsValue();
            // 空值处理
            if (!values.name) {
                message.error("机构名称不能为空");
                return
            }
            // 机构类型写入与校验
            if (values.typeIds.length > 3) {
                message.error("机构类型最多选三项");
                return;
            }
            values.typeId = values.typeIds ? values.typeIds[0] : 0;
            values.typeIdTwo = values.typeIds ? (values.typeIds[1] || 0) : 0;
            values.typeIdThree = values.typeIds ? (values.typeIds[2] || 0) : 0;
            // 机构图片写入与校验
            values.photo = this.state.photoList01[0] || 0;
            values.photo2 = this.state.photoList01[1] || 0;
            values.photo3 = this.state.photoList01[2] || 0;
            values.photo4 = this.state.photoList01[3] || 0;
            values.photo5 = this.state.photoList01[4] || 0;
            // 机构logo写入
            values.icon = this.state.data_pic02;
            // 机构地址信息写入
            values.provinceName = this.state.area.province;
            values.cityName = this.state.area.city;
            values.areaName = this.state.area.district;
            values.areaId = this.state.areaId;
            values.street = this.state.area.street;
            values.address = this.state.formattedAddress;
            values.lng = this.state.xy.x;
            values.lat = this.state.xy.y;
            // 信息比对
            const result = this.dataContrast(values);
            if (!result) {
                message.error("暂无信息更改");
                return;
            }
            this.setState({
                saveLoading: true
            });
            // 已联系-未录入状态的机构在第一次编辑时状态变更为已录入-部分录入
            if (this.props.itemStatus === 7) {
                result.status = 8
            }
            reqwest({
                // url: '/institution/modifyEducation',
                url: "/cache/modifyEducationCache",
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: result,
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        saveLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("机构信息录入成功");
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
                                saveLoading: false,
                                confirmLoading: false
                            });
                        });
                        this.props.recapture();
                    } else {
                        if (json.code === 901) {
                            message.error("请先登录");
                            // 返回登陆页
                            this.props.toLoginPage();
                        } else if (json.code === 902) {
                            message.error("登录信息已过期，请重新登录");
                            // 返回登陆页
                            this.props.toLoginPage();
                        } else if (json.code === "1127") {
                            message.error("已修改信息正在审核中，暂不能修改");
                            this.setState({
                                saveLoading: false
                            })
                        } else {
                            message.error(json.message);
                            this.setState({
                                saveLoading: false
                            })
                        }
                    }
                }
            });
        }
        // 完全录入
        if (type === 2) {
            // 获取表单数据并进行必填项校验
            form.validateFieldsAndScroll((err, values) => {
                if (err) {
                    return;
                }
                // 机构类型写入与校验
                if (values.typeIds.length > 3) {
                    message.error("机构类型最多选三项");
                    return;
                }
                values.typeId = values.typeIds ? values.typeIds[0] : 0;
                values.typeIdTwo = values.typeIds ? (values.typeIds[1] || 0) : 0;
                values.typeIdThree = values.typeIds ? (values.typeIds[2] || 0) : 0;
                // 机构图片写入与校验
                values.photo = this.state.photoList01[0];
                values.photo2 = this.state.photoList01[1] || 0;
                values.photo3 = this.state.photoList01[2] || 0;
                values.photo4 = this.state.photoList01[3] || 0;
                values.photo5 = this.state.photoList01[4] || 0;
                if (!values.photo) {
                    message.error("课程图片未选择或未提交");
                    return
                }
                // 机构logo写入
                values.icon = this.state.data_pic02;
                // 机构地址信息写入
                values.provinceName = this.state.area.province;
                values.cityName = this.state.area.city;
                values.areaName = this.state.area.district;
                values.areaId = this.state.areaId;
                values.street = this.state.area.street;
                values.address = this.state.formattedAddress;
                values.lng = this.state.xy.x;
                values.lat = this.state.xy.y;
                // 信息比对
                let result = this.dataContrast(values);
                // 分支1：审核驳回状态的机构进行信息编辑时状态变更为待审核
                if (this.props.itemStatus === 3) {
                    if (!result) {
                        message.error("暂无信息更改");
                        return;
                    }
                    result.status = 1
                }
                // 分之2：已联系-未录入和已录入-部分录入状态的机构进行信息完全录入时状态变更为待审核
                if (this.props.itemStatus === 7 || this.props.itemStatus === 8) {
                    if (!result) {
                        result = {};
                        result.educationKey = this.props.educationKey;
                    }
                    result.status = 1
                }
                // 分之3：机构拒绝-部分录入状态的机构进行信息完全录入时状态变更为机构拒绝-完全录入
                if (this.props.itemStatus === 10) {
                    if (!result) {
                        result = {};
                        result.educationKey = this.props.educationKey;
                    }
                    result.status = 11
                }
                this.setState({
                    confirmLoading: true
                });
                reqwest({
                    // url: '/institution/modifyEducation',
                    url: "/cache/modifyEducationCache",
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
                            if (this.props.itemStatus === 3) {
                                message.success("机构信息修改成功，已提交审核");
                            }
                            if (this.props.itemStatus === 7 || this.props.itemStatus === 8) {
                                message.success("机构信息录入成功，已提交审核");
                            }
                            if (this.props.itemStatus === 10) {
                                message.success("机构信息录入成功");
                            }
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
                                    saveLoading: false,
                                    confirmLoading: false
                                });
                            });
                            this.props.recapture();
                        } else {
                            if (json.code === 901) {
                                message.error("请先登录");
                                // 返回登陆页
                                this.props.toLoginPage();
                            } else if (json.code === 902) {
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
        }
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a style={{display: this.props.status ? "inline" : "none"}}>
                <span onClick={this.showModal}>编辑</span>
                <ItemEditForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    id={this.props.id}
                    status={this.props.itemStatus}
                    data={this.state.data}
                    typeList={this.state.typeList}
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
                    saveLoading={this.state.saveLoading}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//沟通结果表单
const ContactResultsForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, result, setResult, confirmLoading} = props;
        const {getFieldDecorator} = form;
        let refuseStatusClass = "refuseStatus longItem itemNone";
        if (result === "refuse") {
            refuseStatusClass = "refuseStatus longItem"
        }

        return (
            <Modal
                visible={visible}
                title="沟通结果设置"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="contactResult-form">
                    <Form layout="vertical">
                        <FormItem className="result longItem" {...formItemLayout_14} label="沟通结果：">
                            {getFieldDecorator('result', {
                                rules: [{
                                    required: true,
                                    message: "沟通结果不能为空"
                                }],
                            })(
                                <RadioGroup onChange={(event) => {
                                    setResult(event.target.value)
                                }}>
                                    <Radio value={6}>联系不通</Radio>
                                    <Radio value={7}>沟通成功</Radio>
                                    <Radio value={"refuse"}>机构拒绝</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem className={refuseStatusClass} {...formItemLayout_14} label="拒绝操作：">
                            {getFieldDecorator('refuseStatus', {
                                rules: [{
                                    required: result === "refuse",
                                    message: "沟通结果不能为空"
                                }],
                            })(
                                <RadioGroup>
                                    <Radio value={9}>无法录入</Radio>
                                    <Radio value={10}>可以录入</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem className="remark longItem unnecessary" {...formItemLayout_14} label="备注：">
                            {
                                getFieldDecorator('remark', {
                                    rules: [{
                                        required: false,
                                    }],
                                })(
                                    <TextArea style={{resize: "none"}} placeholder="请填写备注信息"
                                              autosize={{minRows: 3, maxRows: 10}}/>
                                )
                            }
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//沟通结果组件
class ContactResults extends Component {
    state = {
        visible: false,
        result: null,
        confirmLoading: false
    };

    showModal = () => {
        this.setState({
            visible: true
        })
    };

    setResult = (value) => {
        this.setState({
            result: value
        })
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState(
                {
                    visible: false
                }, () => {
                    this.setState({
                        result: null,
                        confirmLoading: false
                    });
                }
            );
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
            if (values.result === "refuse") {
                values.status = values.refuseStatus
            } else {
                values.status = values.result
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/cache/checkEducation',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    eId: this.props.id,
                    status: values.status,
                    remark: values.remark
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("操作成功");
                        this.setState(
                            {
                                visible: false
                            }, () => {
                                this.setState({
                                    result: null,
                                    confirmLoading: false
                                });
                            }
                        );
                        this.props.recapture();
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
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a style={{display: this.props.status ? "inline" : "none"}}>
                <span onClick={() => this.showModal()}>沟通结果</span>
                <ContactResultsForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    result={this.state.result}
                    setResult={this.setResult}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//机构列表
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
            },
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: 70,
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '机构名称',
                dataIndex: 'institutionName',
                className: 'orgName',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'institutionName'),
            },
            {
                title: '所在地区',
                dataIndex: 'areaName',
                className: 'address',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'areaName'),
            },
            {
                title: '机构类型',
                dataIndex: 'typeName',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'typeName'),
            },
            {
                title: '照片',
                dataIndex: 'photo',
                width: '5%',
                render: (text, record) => (
                    <div className="hove-photo-scale">
                        <img style={{width: '30px', height: "30px"}} src={record["photo"]} alt=""/>
                    </div>
                ),
            },
            {
                title: '管理员',
                dataIndex: 'managerName',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'managerName'),
            },
            {
                title: '联系电话',
                dataIndex: 'telephone',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'telephone'),
            },
            {
                title: '创建日期',
                dataIndex: 'createTime',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '创建人',
                dataIndex: 'createUser',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'createUser'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*修改前后信息对比（副表状态为待审核，正式表状态为禁用或审核通过的机构展示此项）*/}
                            <ItemDetailsCompare 
                                id={record.id} 
                                toLoginPage={this.props.toLoginPage}
                                // status={record.statusCode === 1 && (record.institutionStatus === 0 || record.institutionStatus === 2) ? 1 : 0}/>
                                status={this.props.type === 1 && this.props.opObjReady.select}/>
                            {/*机构详情（副表状态为审核驳回，或正式表状态既非禁用也非审核通过的机构展示此项）*/}
                            <ItemDetails 
                                id={record.id} 
                                toLoginPage={this.props.toLoginPage}
                                // status={record.statusCode === 3 || (record.institutionStatus !== 0 && record.institutionStatus !== 2) ? 1 : 0}/>
                                status={this.props.type === 3 && this.props.opObjDeny.select}/>
                            {/*驳回意见（副表状态为审核驳回的机构展示此项）*/}
                            <ItemOpinion
                                id={record.id} 
                                toLoginPage={this.props.toLoginPage}
                                // status={record.statusCode === 3 ? 1 : 0}/>
                                status={this.props.type === 3 && this.props.opObjDeny.checkOpinion}/>
                            {/*机构编辑（副表状态为审核驳回/已联系-未录入/已录入-部分录入/机构拒绝-部分录入的机构展示此项）*/}
                            <ItemEdit 
                                id={record.id} 
                                educationKey={record.educationKey} 
                                recapture={this.getData}
                                itemStatus={record.statusCode} 
                                toLoginPage={this.props.toLoginPage}
                                // status={(record.statusCode === 3 || record.statusCode === 7 || record.statusCode === 8 || record.statusCode === 10) ? 1 : 0}/>
                                status={this.props.type === 2 ? 1 : 0}/>
                            {/*机构审核（副表状态为待审核，当前登录人为超级管理员或运营人员时展示此项）*/}
                            <ItemCheck 
                                id={record.id} 
                                companyId={record.parentId} 
                                companyName={record.parentName} 
                                recapture={this.getData} 
                                toLoginPage={this.props.toLoginPage}
                                // status={(Number(sessionStorage.adminType) === 0 || Number(sessionStorage.adminType) === 4) && (record.statusCode === 1) ? 1 : 0}
                                status={this.props.type === 1 && this.props.opObjReady.checkOrg}/>
                            {/*沟通结果选择（副表状态为未联系-未录入，当前登录人为超级管理员或运营人员时展示此项）*/}
                            <ContactResults 
                                id={record.id} 
                                recapture={this.getData} 
                                toLoginPage={this.props.toLoginPage}
                                status={(Number(sessionStorage.adminType) === 0 || Number(sessionStorage.adminType) === 4) && record.statusCode === 5 ? 1 : 0}/>
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
    }

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
    getData = (type, keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/admin/org/checkList',
            type: 'json',
            method: 'get',
            data: {
                status: type === undefined ? this.props.type : type,
                orgName: keyword === undefined ? this.props.keyword : keyword,
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
                        // 过滤机构Logo
                        const fnFilter02 = (para) => {
                            return para.type === 2;
                        }
                        const tempIconList = item.resourceList.filter(fnFilter02);
                        let tempIcon = "";
                        tempIconList.forEach((iconItem, iconIndex) => {
                            tempIcon = iconItem.path;
                        })

                        data.push({
                            key: index.toString(),
                            id: item.id,
                            educationKey: item.educationKey,
                            index: index + 1,
                            institutionName: item.name,
                            areaName: item.provinceName + item.cityName + item.areaName + item.street,                        
                            photo: tempIcon,
                            name: item.name,
                            parentName: item.parentName,
                            parentId: item.parentId,
                            typeName: item.typeName ? item.typeName.replace(/,/g, "/") : '',
                            telephone: item.managerPhone,
                            managerName: item.managerName,
                            createTime: item.createTime ? this.dateHandle(item.createTime) : "",
                            createUser: item.createUserName,
                            shopStatus: tempShopStatus,
                            institutionStatus: item.institutionStatus,
                            statusCode: item.status,
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

    //页码变化处理
    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.institutionCheckPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.institutionCheckPageSize);
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
                      scroll={{ x: 1500 }}
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={this.state.pagination}
                      columns={this.columns}
                      onChange={this.handleTableChange}/>;
    }
}

class InstitutionCheck extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: "1",
            keyword: "",
            provinceList: [],
            flag_add: false,
            // 权限            
            opObjCheck: {},
            // 待审核权限
            opObjReady: {},
            //已驳回 
            opObjDeny: {},
        };
        this.optionsOfSaved = [
            <Option key={5} value="5">{"未联系-未录入"}</Option>,
            <Option key={6} value="6">{"联系不通"}</Option>,
            <Option key={7} value="7">{"已联系-未录入"}</Option>,
            <Option key={8} value="8">{"已录入-部分录入"}</Option>,
            <Option key={9} value="9">{"机构拒绝-无法录入"}</Option>,
            <Option key={10} value="10">{"机构拒绝-部分录入"}</Option>,
            <Option key={11} value="11">{"机构拒绝-完全录入"}</Option>,
        ];
    }

    //tab状态设置
    setType = (value) => {
        if (value === "saved") {
            this.setState({
                type: "5"
            })
        } else {
            this.setState({
                type: value,
            })
        }
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

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
        // 菜单信息为空则直接返回登陆页
        if (!sessionStorage.menuListOne) {
            this.toLoginPage();
            return
        }
        JSON.parse(sessionStorage.menuListOne).forEach((item) => {
            item.children.forEach((subItem) => {
                if (subItem.url === this.props.location.pathname) {
                    let data = {};
                    subItem.children.forEach((thirdItem) => {
                        data[thirdItem.url] = true;
                    });
                    this.setState({
                        opObjCheck: data
                    })
                }
            })
        });

        // 待审核权限
        JSON.parse(sessionStorage.menuListOne).forEach((item) => {
            item.children.forEach((subItem) => {
                // const fnfilter = (para) => {
                //     return  para.url === "/index/check-manage/org-check/ready";
                // }
                // const tempSubItem = subItem.children.filter(fnfilter);
                subItem.children.forEach((fourthItem) => {
                    if (fourthItem.url === "/index/check-manage/org-check/ready") {
                        let data = {};
                        fourthItem.children.forEach((fifthItem) => {
                            data[fifthItem.url] = true;
                        })
                        this.setState({
                            opObjReady: data
                        })
                    }                    
                })
            })
        })

        // 已驳回权限
        JSON.parse(sessionStorage.menuListOne).forEach((item) => {
            item.children.forEach((subItem) => {
                // const fnfilter = (para) => {
                //     return  para.url === "/index/check-manage/org-check";
                // }
                // const tempSubItem = subItem.children.filter(fnfilter);
                subItem.children.forEach((fourthItem) => {
                    if (fourthItem.url === "/index/check-manage/org-check/deny") {
                        let data = {};
                        fourthItem.children.forEach((fifthItem) => {
                            data[fifthItem.url] = true;
                        })
                        this.setState({
                            opObjDeny: data
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
            <div className="institution-check">
                <header className="clearfix">
                    <Tabs defaultActiveKey={this.state.type} onChange={this.setType}>
                        <TabPane tab="待审核" key="1"/>
                        <TabPane tab="已驳回" key="3"/>
                        {/*<TabPane tab="数据录入" key="saved"/>*/}
                    </Tabs>
                </header>
                <div className="keyWord clearfix">
                    {/*暂存状态筛选*/}
                    {/*<Select value={this.state.type}
                            style={{
                                display: (this.state.type !== "1" && this.state.type !== "3") ? 'block' : 'none',
                                width: "150px",
                                float: "left",
                                marginRight: "20px"
                            }}
                            onChange={this.setType}>
                        {this.optionsOfSaved}
                    </Select>*/}
                    <Search
                        placeholder="请输入机构名称"
                        onSearch={this.search}
                        enterButton
                        style={{width: "320px", float: "left"}}
                    />
                </div>
                <div className="table-box">
                    <DataTable 
                        type={Number(this.state.type)} 
                        keyword={this.state.keyword}
                        opObjReady={this.state.opObjReady}
                        opObjDeny={this.state.opObjDeny}
                        toLoginPage={this.toLoginPage} 
                        flag_add={this.state.flag_add}/>
                </div>
                <p className="hint"/>
            </div>
        )
    }
}

export default InstitutionCheck;