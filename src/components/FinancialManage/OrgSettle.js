import React, {Component} from 'react';
import {
    Link
} from 'react-router-dom';
import {
    Table,
    Input,
    Button,
    Modal,
    Form,
    Icon,
    message,
} from 'antd';
import '../../config/config';
import reqwest from 'reqwest';

const Search = Input.Search;
const confirm = Modal.confirm;

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//订单信息使用表单
// const ItemEditForm = Form.create()(
//     (props) => {
//         const {visible, onCancel, onCreate, form, data, allTypeList, confirmLoading} = props;
//         const {getFieldDecorator} = form;

//         // 总订单选项生成
//         const optionsOfAllTypeList = [];
//         if (allTypeList) {
//             allTypeList.forEach((item, index) => {
//                 optionsOfAllTypeList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
//             });
//         }

//         return (
//             <Modal
//                 visible={visible}
//                 title="使用"
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
//                                         <FormItem className="companyName" label="订单编号：">
//                                             {getFieldDecorator('orderNum', {
//                                                 initialValue: data.orderNum,
//                                                 rules: [
//                                                     {
//                                                         required: true,
//                                                         message: '订单编号不能为空',
//                                                     },
//                                                 ]
//                                             })(
//                                                 <Input placeholder="请输入订单编号"/>
//                                             )}
//                                         </FormItem>
//                                     </Col>
//                                     <Col span={8}>
//                                         <FormItem className="licenseNumber" label="支付单号：">
//                                             {getFieldDecorator('payNum', {
//                                                 initialValue: data.payNum,
//                                                 rules: [{
//                                                     required: true,
//                                                     message: '订单单号不能为空',
//                                                 }],
//                                             })(
//                                                 <Input placeholder="请输入支付单号"/>
//                                             )}
//                                         </FormItem>
//                                     </Col>
//                                     <Col span={8}>
//                                         <FormItem className="licenseNumber" label="订单总金额：">
//                                             {getFieldDecorator('orderAmount', {
//                                                 initialValue: data.orderAmount,
//                                                 rules: [{
//                                                     required: true,
//                                                     message: '订单总金额不能为空',
//                                                 }],
//                                             })(
//                                                 <Input placeholder="请输入订单总金额"/>
//                                             )}
//                                         </FormItem>
//                                     </Col>
//                                 </Row>
//                                 <div className="ant-line"></div>
//                                 <Row gutter={24}>
//                                     <Col span={8}>
//                                         <FormItem className="companyName" label="券号：">
//                                             {getFieldDecorator('couponNum', {
//                                                 initialValue: data.couponNum,
//                                                 rules: [
//                                                     {
//                                                         required: true,
//                                                         message: '券号不能为空',
//                                                     }
//                                                 ]
//                                             })(
//                                                 <Input placeholder="请输入券号"/>
//                                             )}
//                                         </FormItem>
//                                     </Col>
//                                     <Col span={8}>
//                                         <FormItem className="licenseNumber" label="消费时间：">
//                                             {getFieldDecorator('consumTime', {
//                                                 initialValue: data.consumTime,
//                                                 rules: [{
//                                                     required: true,
//                                                     message: '消费时间不能为空',
//                                                 }],
//                                             })(
//                                                 <Input placeholder="请输入消费时间"/>
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

//订单信息使用组件
// class ItemEdit extends Component {
//     constructor(props) {
//       super(props);
    
//       this.state = {
//             visible: false,
//             // 订单基本信息
//             data: {},
//             // 提交按钮状态变量
//             confirmLoading: false,
//         };
//     } 

//     onChange = (value) => {
//         console.log('onChange ', value);
//         this.setState({ 
//             tempTypeIds: value
//         });
//     };

//     // 获取订单基本信息
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
//                     this.setState({
//                         data: json.data.org,
//                         photoList01: json.data.orgResourceList,
//                         viewPic02: json.data.orgResourceList[0] ?  json.data.orgResourceList[0].path : "",
//                         effectPic02: json.data.orgResourceList[1] ? json.data.orgResourceList[1].path : "",
//                         data_pic02: json.data.orgResourceList[2] ? json.data.orgResourceList[2].path : "",
//                         areaId: json.data.org.areaId,
//                         // area: {
//                         //     province: "provinceName",
//                         //     city: "cityName",
//                         // },
//                         // provinceId: "provinceId",
//                         // cityId: "cityId",
//                         formattedAddress: json.data.org.address,
//                         xy: {
//                             x: json.data.org.lng,
//                             y: json.data.org.lat
//                         }
//                     }, () => {
//                         // 订单地址相关操作
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
//                     if (json.code === 901) {
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
//         // 获取订单基本信息
//         console.log(this.props.record)
//         // this.getData();
//         this.setState({
//             visible: true,
//             data: this.props.record,
//         })
//     };

//     // 信息比对函数
//     dataContrast = (values) => {
//         const initValues = this.state.data;
//         const itemList = ["orderNum:", "payNum", "orderAmount", "couponNum", "consumTime"];
//         const result = {};
//         itemList.forEach((item) => {
//             if (values[item] !== initValues[item]) {
//                 result[item] = values[item];
//             }
//         });
//         console.log(result);
//         if (JSON.stringify(result) === "{}") {
//             return false;
//         } else {
//             result.id = this.props.id;
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
//                     confirmLoading: false
//                 });
//             })
//         };
//         // data空值处理
//         if (JSON.stringify(this.state.data) === "{}") {
//             cancel();
//             return;
//         }

//         form.validateFields((err, values) => {
//             confirm({
//                 title: '确认放弃使用？',
//                 content: "",
//                 okText: '确认',
//                 okType: 'danger',
//                 cancelText: '取消',
//                 onOk() {
//                     cancel();
//                 }
//             });
//         })
//     };

//     // 确认操作
//     handleCreate = () => {
//         // data空值处理
//         if (JSON.stringify(this.state.data) === "{}") {
//             return;
//         }
//         const form = this.form;
//         form.validateFieldsAndScroll((err, values) => {
//             if (err) {
//                 return;
//             }
//             // 信息比对
//             // const result = this.dataContrast(values);
//             const result = {
//                 id: this.props.id,
//                 orderNum: values.orderNum,
//                 payNum: values.payNum,
//                 orderAmount: values.orderAmount,
//                 couponNum: values.couponNum,
//                 consumTime: values.consumTime,
//         }
//             if (!result) {
//                 message.error("暂无信息更改");
//                 return;
//             }
//             this.setState({
//                 confirmLoading: true
//             });
//             reqwest({
//                 url: '/sys/banner/update',
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
//                         message.success("订单使用成功");
//                         this.setState({
//                             visible: false
//                         }, () => {
//                             this.setState({
//                                 data: {},                                
//                                 confirmLoading: false
//                             });
//                         });
//                         this.props.recapture();
//                     } else {
//                         if (json.code === 901) {
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
//                 <span onClick={this.showModal}>使用</span>
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
//                     confirmLoading={this.state.confirmLoading}
//                 />
//             </a>
//         );
//     }
// }

//银行卡信息表单
// const BankBardForm = Form.create()(
//     (props) => {
//         const {visible, onCancel, onCreate, form, data, orgName, confirmLoading} = props;
//         const {getFieldDecorator} = form;

//         return (
//             <Modal
//                 visible={visible}
//                 title="收款银行帐号"
//                 width={600}
//                 onCancel={onCancel}
//                 onOk={onCreate}
//                 destroyOnClose={true}
//                 confirmLoading={confirmLoading}
//                 footer={false}
//             >
//                 {
//                     /*JSON.stringify(data) === "{}" ?
//                         <div className="spin-box">
//                             <Spin/>
//                         </div>
//                         :*/
//                         <div className="institution-edit institution-form item-form receive-bank-card-form">
//                             <Form layout="vertical">
//                                 <h3 style={{color: "#3390FF"}}>此收款银行卡号仅作参考，支付前请与商家确认相关信息</h3>
//                                 <FormItem className="companyName" label="机构名称：">
//                                     {getFieldDecorator('orgName', {
//                                         initialValue: orgName,
//                                         rules: [
//                                             {
//                                                 required: true,
//                                                 message: '机构名称不能为空',
//                                             },
//                                         ]
//                                     })(
//                                         <Input disabled placeholder="请输入机构名称"/>
//                                     )}
//                                 </FormItem>
//                                 <div className="ant-line"></div>
//                                 <FormItem className="licenseNumber" label="银行开户名：">
//                                     {getFieldDecorator('accountName', {
//                                         initialValue: data.accountName,
//                                         rules: [{
//                                             required: true,
//                                             message: '银行开户名不能为空',
//                                         }],
//                                     })(
//                                         <Input disabled placeholder="请输入银行开户名"/>
//                                     )}
//                                 </FormItem>
//                                 <div className="ant-line"></div>
//                                 <FormItem className="licenseNumber" label="银行卡号：">
//                                     {getFieldDecorator('cardNum', {
//                                         initialValue: data.cardNum,
//                                         rules: [{
//                                             required: true,
//                                             message: '银行卡号不能为空',
//                                         }],
//                                     })(
//                                         <Input disabled placeholder="请输入银行卡号"/>
//                                     )}
//                                 </FormItem>
//                                 <div className="ant-line"></div>
//                                 <FormItem className="companyName" label="开户行名称：">
//                                     {getFieldDecorator('bankName', {
//                                         initialValue: data.bankName,
//                                         rules: [
//                                             {
//                                                 required: true,
//                                                 message: '开户行名称不能为空',
//                                             }
//                                         ]
//                                     })(
//                                         <Input disabled placeholder="请输入开户行名称"/>
//                                     )}
//                                 </FormItem>
//                                 <div className="ant-line"></div>
//                                 <FormItem className="licenseNumber" label="开户行所在地：">
//                                     {getFieldDecorator('bankAddress', {
//                                         initialValue: data.bankAddress,
//                                         rules: [{
//                                             required: true,
//                                             message: '开户行所在地不能为空',
//                                         }],
//                                     })(
//                                         <Input disabled placeholder="请输入开户行所在地"/>
//                                     )}
//                                 </FormItem>
//                                 <div className="ant-line"></div>
//                                 <div className="ant-line"></div>          
//                             </Form>
//                         </div>
//                 }
//             </Modal>
//         );
//     }
// );

//银行卡信息组件
// class BankBard extends Component {
//     constructor(props) {
//       super(props);
    
//       this.state = {
//             visible: false,
//             // 订单基本信息
//             data: {},
//             // 提交按钮状态变量
//             confirmLoading: false,
//         };
//     } 

//     onChange = (value) => {
//         console.log('onChange ', value);
//         this.setState({ 
//             tempTypeIds: value
//         });
//     };

//     // 获取银行卡基本信息
//     getData = () => {
//         reqwest({
//             url: '/sys/orgBank/details',
//             type: 'json',
//             method: 'get',
//             data: {
//                 orgId: this.props.record.orgId
//             },
//             headers: {
//                 Authorization: sessionStorage.token
//             },
//             error: (XMLHttpRequest) => {
               
//             },
//             success: (json) => {
//                 if (json.result === 0) {
//                     if (json.data) {
//                         this.setState({
//                             data: json.data,
//                         })
//                     }                                       
//                 } else {
//                     if (json.code === 901) {
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
//         // 获取订单基本信息
//         console.log(this.props.record)
//         this.getData();
//         this.setState({
//             visible: true,
//             // data: this.props.record,
//         })
//     };

//     // 信息比对函数
//     dataContrast = (values) => {
//         const initValues = this.state.data;
//         const itemList = ["orderNum:", "payNum", "orderAmount", "couponNum", "consumTime"];
//         const result = {};
//         itemList.forEach((item) => {
//             if (values[item] !== initValues[item]) {
//                 result[item] = values[item];
//             }
//         });
//         console.log(result);
//         if (JSON.stringify(result) === "{}") {
//             return false;
//         } else {
//             result.id = this.props.id;
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
//                     confirmLoading: false
//                 });
//             })
//         };
//         // data空值处理
//         if (JSON.stringify(this.state.data) === "{}") {
//             cancel();
//             return;
//         }

//         form.validateFields((err, values) => {
//             confirm({
//                 title: '确认放弃使用？',
//                 content: "",
//                 okText: '确认',
//                 okType: 'danger',
//                 cancelText: '取消',
//                 onOk() {
//                     cancel();
//                 }
//             });
//         })
//     };

//     // 确认操作
//     handleCreate = () => {
//         // data空值处理
//         if (JSON.stringify(this.state.data) === "{}") {
//             return;
//         }
//         const form = this.form;
//         form.validateFieldsAndScroll((err, values) => {
//             if (err) {
//                 return;
//             }
//             // 信息比对
//             // const result = this.dataContrast(values);
//             const result = {
//                 id: this.props.id,
//                 orderNum: values.orderNum,
//                 payNum: values.payNum,
//                 orderAmount: values.orderAmount,
//                 couponNum: values.couponNum,
//                 consumTime: values.consumTime,
//         }
//             if (!result) {
//                 message.error("暂无信息更改");
//                 return;
//             }
//             this.setState({
//                 confirmLoading: true
//             });
//             reqwest({
//                 url: '/sys/banner/update',
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
//                         message.success("订单使用成功");
//                         this.setState({
//                             visible: false
//                         }, () => {
//                             this.setState({
//                                 data: {},                                
//                                 confirmLoading: false
//                             });
//                         });
//                         this.props.recapture();
//                     } else {
//                         if (json.code === 901) {
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
//                 <span onClick={this.showModal}>收款银行卡</span>
//                 <BankBardForm
//                     ref={this.saveFormRef}
//                     visible={this.state.visible}
//                     onCancel={this.handleCancel}
//                     onCreate={this.handleCreate}
//                     onChange={this.onChange}
//                     id={this.props.id}
//                     orgName={this.props.record.orgName}
//                     data={this.state.data}
//                     allTypeList={this.state.allTypeList}
//                     handleSearch={this.handleSearch}
//                     handleChange={this.handleChange}
//                     typeList={this.state.typeList}
//                     confirmLoading={this.state.confirmLoading}
//                 />
//             </a>
//         );
//     }
// }

//申请表单
const ItemApplyForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, confirmLoading} = props;

        return (
            <Modal
                visible={visible}
                title="申请提示"
                width={500}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                {
                    <div className="">
                        <h3 style={{fontWeight: "bold"}}>
                        <Icon type="close" style={{background: "red", color: "#FFF", borderRadius: "100%"}}/>30天内还有3次免费申请机会，操作后将无法恢复，您确定是进行操作吗？</h3>
                    </div>
                }
            </Modal>
        );
    }
);

//申请组件
class ItemApply extends Component {
    constructor(props) {
      super(props);    
      this.state = {
            visible: false,
            // 订单基本信息
            data: {},
            // 提交按钮状态变量
            confirmLoading: false,
        };
    } 

    showModal = () => {
        // 获取订单基本信息
        console.log(this.props.record)
        this.setState({
            visible: true,
            // data: this.props.record,
        })
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
                    confirmLoading: false
                });
            })
        };
        // data空值处理
        if (JSON.stringify(this.state.data) === "{}") {
            cancel();
            return;
        }

        form.validateFields((err, values) => {
            confirm({
                title: '确认放弃使用？',
                content: "",
                okText: '确认',
                okType: 'danger',
                cancelText: '取消',
                onOk() {
                    cancel();
                }
            });
        })
    };

    // 确认操作
    handleCreate = () => {
        this.setState({
            confirmLoading: true
        });
        reqwest({
            url: '/sys/settle/apply',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    confirmLoading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("申请成功");
                    this.setState({
                        visible: false
                    }, () => {
                        this.setState({                              
                            confirmLoading: false
                        });
                    });
                    this.props.recapture();
                } else {
                    if (json.code === 901) {
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
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a>
            {/*<a style={{display: this.props.opStatus ? "inline" : "none"}}>*/}
                <Button type="primary" onClick={this.showModal}>申请</Button>
                <ItemApplyForm
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

//订单信息查看表单
// const ItemViewForm = Form.create()(
//     (props) => {
//         const {visible, onCancel, onCreate, form, data, allTypeList, confirmLoading} = props;
//         const {getFieldDecorator} = form;

//         // 总订单选项生成
//         const optionsOfAllTypeList = [];
//         if (allTypeList) {
//             allTypeList.forEach((item, index) => {
//                 optionsOfAllTypeList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
//             });
//         }

//         return (
//             <Modal
//                 visible={visible}
//                 title="使用"
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
//                                         <FormItem className="companyName" label="订单编号：">
//                                             {getFieldDecorator('orderNum', {
//                                                 initialValue: data.orderNum,
//                                                 rules: [
//                                                     {
//                                                         required: true,
//                                                         message: '订单编号不能为空',
//                                                     },
//                                                 ]
//                                             })(
//                                                 <Input placeholder="请输入订单编号"/>
//                                             )}
//                                         </FormItem>
//                                     </Col>
//                                     <Col span={8}>
//                                         <FormItem className="licenseNumber" label="支付单号：">
//                                             {getFieldDecorator('payNum', {
//                                                 initialValue: data.payNum,
//                                                 rules: [{
//                                                     required: true,
//                                                     message: '订单单号不能为空',
//                                                 }],
//                                             })(
//                                                 <Input placeholder="请输入支付单号"/>
//                                             )}
//                                         </FormItem>
//                                     </Col>
//                                     <Col span={8}>
//                                         <FormItem className="licenseNumber" label="订单总金额：">
//                                             {getFieldDecorator('orderAmount', {
//                                                 initialValue: data.orderAmount,
//                                                 rules: [{
//                                                     required: true,
//                                                     message: '订单总金额不能为空',
//                                                 }],
//                                             })(
//                                                 <Input placeholder="请输入订单总金额"/>
//                                             )}
//                                         </FormItem>
//                                     </Col>
//                                 </Row>
//                                 <div className="ant-line"></div>
//                                 <Row gutter={24}>
//                                     <Col span={8}>
//                                         <FormItem className="companyName" label="券号：">
//                                             {getFieldDecorator('couponNum', {
//                                                 initialValue: data.couponNum,
//                                                 rules: [
//                                                     {
//                                                         required: true,
//                                                         message: '券号不能为空',
//                                                     }
//                                                 ]
//                                             })(
//                                                 <Input placeholder="请输入券号"/>
//                                             )}
//                                         </FormItem>
//                                     </Col>
//                                     <Col span={8}>
//                                         <FormItem className="licenseNumber" label="消费时间：">
//                                             {getFieldDecorator('consumTime', {
//                                                 initialValue: data.consumTime,
//                                                 rules: [{
//                                                     required: true,
//                                                     message: '消费时间不能为空',
//                                                 }],
//                                             })(
//                                                 <Input placeholder="请输入消费时间"/>
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

//订单信息查看组件
// class ItemView extends Component {
//     constructor(props) {
//       super(props);
    
//       this.state = {
//             visible: false,
//             // 订单基本信息
//             data: {},
//             // 提交按钮状态变量
//             confirmLoading: false,
//         };
//     } 

//     onChange = (value) => {
//         console.log('onChange ', value);
//         this.setState({ 
//             tempTypeIds: value
//         });
//     };

//     // 获取订单基本信息
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
//                     this.setState({
//                         data: json.data.org,
//                     })
//                 } else {
//                     if (json.code === 901) {
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
//         // 获取订单基本信息
//         console.log(this.props.record)
//         // this.getData();
//         this.setState({
//             visible: true,
//             data: this.props.record,
//         })
//     };

//     // 信息比对函数
//     dataContrast = (values) => {
//         const initValues = this.state.data;
//         const itemList = ["orderNum:", "payNum", "orderAmount", "couponNum", "consumTime"];
//         const result = {};
//         itemList.forEach((item) => {
//             if (values[item] !== initValues[item]) {
//                 result[item] = values[item];
//             }
//         });
//         console.log(result);
//         if (JSON.stringify(result) === "{}") {
//             return false;
//         } else {
//             result.id = this.props.id;
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
//                     confirmLoading: false
//                 });
//             })
//         };
//         // data空值处理
//         if (JSON.stringify(this.state.data) === "{}") {
//             cancel();
//             return;
//         }

//         form.validateFields((err, values) => {
//             confirm({
//                 title: '确认放弃使用？',
//                 content: "",
//                 okText: '确认',
//                 okType: 'danger',
//                 cancelText: '取消',
//                 onOk() {
//                     cancel();
//                 }
//             });
//         })
//     };

//     // 确认操作
//     handleCreate = () => {
//         // data空值处理
//         if (JSON.stringify(this.state.data) === "{}") {
//             return;
//         }
//         const form = this.form;
//         form.validateFieldsAndScroll((err, values) => {
//             if (err) {
//                 return;
//             }
//             // 信息比对
//             // const result = this.dataContrast(values);
//             const result = {
//                 id: this.props.id,
//                 orderNum: values.orderNum,
//                 payNum: values.payNum,
//                 orderAmount: values.orderAmount,
//                 couponNum: values.couponNum,
//                 consumTime: values.consumTime,
//         }
//             if (!result) {
//                 message.error("暂无信息更改");
//                 return;
//             }
//             this.setState({
//                 confirmLoading: true
//             });
//             reqwest({
//                 url: '/sys/banner/update',
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
//                         message.success("订单使用成功");
//                         this.setState({
//                             visible: false
//                         }, () => {
//                             this.setState({
//                                 data: {},                                
//                                 confirmLoading: false
//                             });
//                         });
//                         this.props.recapture();
//                     } else {
//                         if (json.code === 901) {
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
//                 <span onClick={this.showModal}>查看</span>
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
//                     confirmLoading={this.state.confirmLoading}
//                 />
//             </a>
//         );
//     }
// }

//订单列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            // 订单类型表
            typeList: [],
            // 当前订单类型
            type: null,
            // 当前订单状态
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
                title: '账单编号',
                dataIndex: 'orderNum',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'orderNum'),
            },
            {
                title: '出帐日期',
                dataIndex: 'createTime',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '应结金额',
                dataIndex: 'settleSum',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'settleSum'),
            },                      
            {
                title: '所属机构',
                dataIndex: 'orgName',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'orgName'),
            },            
            {
                title: '截止日期',
                dataIndex: 'settleEndDate',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'settleEndDate'),
            },
            {
                title: '账单状态',
                dataIndex: 'billStatus',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'billStatus'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                width: 350,
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*订单使用*/}
                            {/*<ItemEdit id={record.id}
                                      record={record} 
                                      educationKey={record.educationKey}
                                      recapture={this.getData}
                                      toLoginPage={this.props.toLoginPage} 
                                      opStatus={this.props.opObj.modify}/>*/}
                            {/*订单查看*/}
                            {/*<Link to={"./order-detail?" + record.orderNum}>查看</Link>*/}
                            <Link to={"./org-order-detail?" + JSON.stringify(record)}>查看</Link>
                            {/*<BankBard id={record.id}
                                      record={record}
                                      recapture={this.getData}
                                      toLoginPage={this.props.toLoginPage} 
                                      opStatus={this.props.opObj.modify}/>*/}
                            {/*<ItemView id={record.id}
                                      record={record} 
                                      educationKey={record.educationKey}
                                      recapture={this.getData}
                                      toLoginPage={this.props.toLoginPage} 
                                      opStatus={this.props.opObj.modify}/>*/}
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
            url: '/sys/settle/list',
            type: 'json',
            method: 'get',
            data: {
                // 订单描述
                title: keyword ? keyword.educationName : this.props.keyword.educationName,
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
                        let tempStatus = "";
                        if (item.status === 1) {
                            tempStatus = "商家申请"
                        }
                        if (item.status === 2) {
                            tempStatus = "平台审核"
                        }
                        if (item.status === 3) {
                            tempStatus = "商家确认"
                        }
                        if (item.status === 4) {
                            tempStatus = "财务支付"
                        }
                        
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            orderNum: item.settleCode,
                            courseName: item.courseName,
                            createTime: item.createTime,
                            orgName: item.orgName,
                            orgId: item.orgId,
                            settleSum: "￥" + item.settleSum,
                            totalSum: item.totalSum,
                            settleEndDate: item.settleEndDate,
                            orderStatus: item.orderStatus,                         
                            statusCode: item.status,
                            billStatus: tempStatus,
                            orderAmount: item.totalSum,
                            platformCommission: item.fee,
                            refundAmount: item.refundSum,
                            returnCommission: item.refundFeeSum,
                            orgActivityFees: item.orgActivityFees,
                            platformCoupon: item.platformCoupon,
                            returnPlatformCoupon: item.returnPlatformCoupon,
                            serviceFees: item.extraFee,
                            fees: item.transferFee,
                            transferFee: item.transferFee,                    
                            transferTime: item.transferTime,
                            remark: item.remark,
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

    componentWillMount() {
        this.getData();
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
                      expandedRowRender={record => {
                        return (
                            <div>
                                <p style={{ margin: 0, textAlign: "left" }}>订单金额：￥{record.orderAmount}</p>
                                <p style={{ margin: 0, textAlign: "left" }}>平台分拥：￥{record.platformCommission}</p>
                                <p style={{ margin: 0, textAlign: "left" }}>退款金额：￥{record.refundAmount}</p>
                                <p style={{ margin: 0, textAlign: "left" }}>退还佣金：￥{record.returnCommission}</p>
                                <p style={{ margin: 0, textAlign: "left" }}>机构活动费用：￥{record.orgActivityFees}</p>
                                <p style={{ margin: 0, textAlign: "left" }}>平台优惠券：￥{record.platformCoupon}</p>
                                <p style={{ margin: 0, textAlign: "left" }}>退还平台优惠券：￥{record.returnPlatformCoupon}</p>
                                <p style={{ margin: 0, textAlign: "left" }}>额外服务费：￥{record.serviceFees}</p>
                                <p style={{ margin: 0, textAlign: "left" }}>转帐手续费：￥{record.fees}</p>
                                <p style={{ margin: 0, textAlign: "left" }}>机构ID：{record.orgId}</p>
                            </div>                            
                        )
                    }}

                      dataSource={this.state.data}
                      pagination={this.state.pagination}
                      columns={this.columns}
                      scroll={{ x: 1500 }}
                      onChange={this.handleTableChange}/>;
    }
}

class OrgSettleAccountsManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            // 获取订单列表所需关键词
            keyword: {
                educationName: "",
            },
            flag_add: false,
        };   
    }

    getData = () => {
        this.refs.getDataCopy.getData();
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
                    educationName: value
                }
            })
        }
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

    apply = () => {
        confirm({
            title: '申请提示',
            content: '30天内还有3次免费申请机会，操作后将无法恢复，您确定是进行操作吗？',
            onOk() {
              return new Promise((resolve, reject) => {
                setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
              }).catch(() => console.log('Oops errors!'));
            },
            onCancel() {},
        });
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
            <div className="institutions finace-order">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix" style={{ height: "50px", lineHeight: "50px", background: "#FFF", padding: "0 24px"}}>                                
                                {/*订单名称筛选*/}
                                <Search
                                    placeholder="请输入订单编号或机构名称"
                                    onSearch={this.setName}
                                    enterButton
                                    style={{width: "240px", float: "left", marginRight: "20px", marginTop: "10px"}}
                                />
                                {/*结算申请*/}
                                <div className="add-button" style={{float: "right"}}>
                                    {/*<Button type="primary" onClick={this.apply}>申请</Button>*/}
                                    <ItemApply 
                                        recapture={this.getData}
                                        opStatus={this.state.opObj.add} 
                                        toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            {/*订单列表*/}
                            <div className="table-box order-list" style={{background: "#FFF", padding: "24px 24px 0"}}>
                                <div className="order-operation-tip"> 
                                    <h2>操作提示</h2>
                                    <ul>
                                        <li style={{listStyle: "disc"}}>如果用户确认消费，可以点击使用操作，并填写相关信息后即更改订单状态。</li>
                                        <li style={{listStyle: "disc"}}>账单计算公式：平台应结金额 = 已消费订单金额[截止日期前全部未结算订单] - 平台分佣。</li>
                                        <li style={{listStyle: "disc"}}>账单处理流程为：商家申请> 平台审核 > 商家确认> 财务支付(完成结算) 4个环节，其中平台审核和财务支付需要平台介入，请予以关注。</li>
                                    </ul>
                                </div>
                                <DataTable 
                                        ref="getDataCopy"
                                        opObj={this.state.opObj} 
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

export default OrgSettleAccountsManage;