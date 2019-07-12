import React, {Component} from 'react';
import {
    Table,
    Modal,
    Form,
    Select,
    DatePicker,
    message,
    List,
    Popconfirm,
} from 'antd';
import reqwest from 'reqwest';
import moment from "moment/moment";

const {Option} = Select;

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//课程详情组件
class CourseDetails extends Component {
    state = {
        visible: false,
				loading: true,
        studentTypeList: [],
        data: {},
				lessonList: [],
    };

    showModal = () => {
        this.getStudentTypeAndLevelList();
        this.getData();
				this.getLessonList();
        this.setState({
            visible: true,
        })
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
    				oTime = oYear + '-' + oMonth + '-' + oDay+" "+oHour + ":" + oMinute;
    		return oTime;
    };

    getStudentTypeAndLevelList = () => {
        reqwest({
            url: '/course/getTypeAndBasics',
            type: 'json',
            method: 'post',
            data: {
                eId: Number(sessionStorage.EId)
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
//                 const json = {
//                     result: 0,
//                     data: {
//                         studentTypeList: [
//                             {id: 1, name: "0-3岁"},
//                             {id: 2, name: "3-6岁"},
//                             {id: 3, name: "6-12岁"},
//                             {id: 4, name: "12岁以上"}
//                         ],
//                         studentLevelList: [
//                             {id: 1, name: "0基础"},
//                             {id: 2, name: "初级水平"},
//                             {id: 3, name: "中级水平"},
//                             {id: 4, name: "高级水平"}
//                         ],
//                     }
//                 };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        studentTypeList: json.data.studentTypeList
                    })
                }
            }
        });
    };

    getData = () => {
        reqwest({
            url: '/course/getDetail',
            type: 'json',
            method: 'post',
            data: {
                courseId: this.props.courseId
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
//                 const json = {
//                     result: 0,
//                     data: {
//                         courseInfo: {
//                             address: "浙江省杭州市西湖区文新街道丹枫新村金都花园东区",
//                             areaId: 330106,
//                             areaName: "西湖区",
//                             characteristic: "00开飞机开绿灯飞机上的大撒旦撒旦孤苦伶仃分，非流动商贩连锁店1@001放松贷款累计孤苦伶仃，广东福建各级地方，反对和房价是否。@001",
//                             cityId: 330100,
//                             cityName: "杭州市",
//                             count: 10,
//                             courseType: 0,
//                             number: 50,
//                             createTime: "Fri Feb 09 14:29:53 CST 2018",
//                             duration: 30,
//                             lat: "30.276780",
//                             lng: "120.099928",
//                             name: "开课了",
//                             parentTypeId: 8,
//                             parentTypeName: "小学数学",
//                             photo: "dda203fb72964df880aaaeb15539f5ca.jpg",
//                             photo2: "dda203fb72964df880aaaeb15539f5ca.jpg",
//                             photo3: "dda203fb72964df880aaaeb15539f5ca.jpg",
//                             photo4: "0",
//                             // photo5: "dda203fb72964df880aaaeb15539f5ca.jpg",
//                             originalPrice: "500.00",
//                             price: "300.00",
//                             provinceId: 330000,
//                             provinceName: "浙江省",
//                             studentLevelId: 1,
//                             studentLevelName: "0基础",
//                             studentTypeIds: "4",
//                             // studentTypeNames: "0-3岁",
//                             submitTime: "Fri Feb 09 14:29:53 CST 2018",
//                             target: "开课了",
//                             sketch: "啊啊啊",
//                             throughTime: "Fri Feb 09 14:29:52 CST 2018",
//                             typeId: 65,
//                             typeName: "雅思",
//                             updateTime: "Fri Feb 09 14:58:06 CST 2018",
//                             status: 2,
//                         }
//                     },
//                 };
            },
            success: (json) => {
                if (json.result === 0) {
                    const characteristic = [];
                    if(json.data.courseInfo.characteristic){
                    		json.data.courseInfo.characteristic.split("@").forEach((item, index) => {
                    				characteristic.push(<p key={index}>{item}</p>);
                    		});
                    		json.data.courseInfo.characteristic = characteristic;
                    }
                    this.setState({
												loading: false,
                    		data: json.data.courseInfo
                    });
                }
            }
        });
    };

    //获取课时列表
    getLessonList = () => {
        reqwest({
            url: '/lesson/getLessonList',
            type: 'json',
            method: 'post',
            data: {
                courseId: this.props.id
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
//                 const json = {
//                     result: 0,
//                     data: [
//                         {id: 1, lessonName: "第一课"},
//                         {id: 2, lessonName: "第二课"},
//                         {id: 3, lessonName: "第三课"},
//                         {id: 4, lessonName: "第四课"},
//                         {id: 5, lessonName: "第五课"}
//                     ]
//                 };
            },
            success: (json) => {
                if (json.result === 0) {
                    let data = [];
                    json.data.forEach((item, index) => {
                        data.push(<p key={index}>{item.lessonName}</p>);
                    });
                    this.setState({
                        lessonList: data
                    })
                }
            }
        });
    };		

    handleCancel = () => {
        this.setState({visible: false});
    };

    render() {
        let tempCourseType="";
        if (this.state.data.courseType === 0) {
        		tempCourseType = "线下正式课";
        }
        if (this.state.data.courseType === 1) {
        		tempCourseType = "视频课程";
        }
        if (this.state.data.courseType === 2) {
        		tempCourseType = "线下体验课";
        }
        let tempStudentTypeIds = "";
        if (this.state.studentTypeList.length && this.state.data.studentTypeIds) {
        		const fn_filter = (item) => {
        				return item.id === Number(this.state.data.studentTypeIds);
        		};
        		tempStudentTypeIds = this.state.studentTypeList.filter(fn_filter)[0] ? this.state.studentTypeList.filter(fn_filter)[0].name : "";
        }
        let tempStatus = "";
        if (this.state.data.status === 0) {
        		tempStatus = "已驳回";
        }
        if (this.state.data.status === 1) {
        		tempStatus = "审核中";
        }
        if (this.state.data.status === 2) {
        		tempStatus = "审核通过";
        }
        if (this.state.data.status === 3) {
        		tempStatus = "删除";
        }
        if (this.state.data.status === 4) {
        		tempStatus = "已下架";
        }
        if (this.state.data.status === 5) {
        		tempStatus = "暂存";
        }
        const baseData = [
        		<div className="name">
        				<span className="item-name">课程名称：</span>
        				<span className="item-content">{this.state.data.name}</span>
        		</div>,
        		<div className="courseType">
        				<span className="item-name">课程类型：</span>
        				<span className="item-content">{tempCourseType||"暂无"}</span>
        		</div>,
        		<div className="subject">
        				<span className="item-name">科目：</span>
        				<span className="item-content">{this.state.data.typeId?(this.state.data.parentTypeName + "/" + this.state.data.typeName):"暂无"}</span>
        		</div>,
        		<div className="photo">
        				<span className="item-name">图片一：</span>
        				{
        						this.state.data.photo && this.state.data.photo !== "0" ?
        								<img src={"http://image.taoerxue.com/" + this.state.data.photo} alt=""
        										className="item-content"/>
        								:
        								<span className="item-content">暂无</span>
        				}
        		</div>,
        		<div className="photo">
        				<span className="item-name">图片二：</span>
        				{
        						this.state.data.photo2 && this.state.data.photo2 !== "0" ?
        								<img src={"http://image.taoerxue.com/" + this.state.data.photo2} alt=""
        										className="item-content"/>
        								:
        								<span className="item-content">暂无</span>
        				}
        		</div>,
        		<div className="photo">
        				<span className="item-name">图片三：</span>
        				{
        						this.state.data.photo3 && this.state.data.photo3 !== "0" ?
        								<img src={"http://image.taoerxue.com/" + this.state.data.photo3} alt=""
        										className="item-content"/>
        								:
        								<span className="item-content">暂无</span>
        				}
        		</div>,
        		<div className="photo">
        				<span className="item-name">图片四：</span>
        				{
        						this.state.data.photo4 && this.state.data.photo4 !== "0" ?
        								<img src={"http://image.taoerxue.com/" + this.state.data.photo4} alt=""
        										className="item-content"/>
        								:
        								<span className="item-content">暂无</span>
        				}
        		</div>,
        		<div className="photo">
        				<span className="item-name">图片五：</span>
        				{
        						this.state.data.photo5 && this.state.data.photo5 !== "0" ?
        								<img src={"http://image.taoerxue.com/" + this.state.data.photo5} alt=""
        										className="item-content"/>
        								:
        								<span className="item-content">暂无</span>
        				}
        		</div>,
        		<div className="studentTypeNames">
        				<span className="item-name">适合年龄：</span>
        				<span className="item-content">{tempStudentTypeIds || "暂无"}</span>
        		</div>,
        		<div className="studentLevelName">
        				<span className="item-name">适合基础：</span>
        				<span className="item-content">{this.state.data.studentLevelName||"暂无"}</span>
        		</div>,
        		<div className="number">
        				<span className="item-name">开班人数：</span>
        				<span className="item-content">{this.state.data.number===undefined?"暂无":this.state.data.number}</span>
        		</div>,
        		<div className="duration">
        				<span className="item-name">单节时长：</span>
        				<span className="item-content">{this.state.data.duration?(this.state.data.duration+"分钟"):"暂无"}</span>
        		</div>,
        		<div className="count">
        				<span className="item-name">课时数：</span>
        				<span className="item-content">{this.state.data.count||"暂无"}</span>
        		</div>,
        		<div className="lessonList">
        				<span className="item-name">课时安排：</span>
        				<div className="item-content">
        						{this.state.lessonList.length?this.state.lessonList:"暂无"}
        				</div>
        		</div>,
        		<div className="characteristic">
        				<span className="item-name">课程特色：</span>
        				<pre>
        						<div className="item-content">{this.state.data.characteristic||"暂无"}</div>
        				</pre>
        		</div>,
        		<div className="sketch">
        				<span className="item-name">课程简介：</span>
        				<pre>
        						<span className="item-content">{this.state.data.sketch||"暂无"}</span>
        				</pre>
        		</div>,
        		<div className="target">
        				<span className="item-name">学习目标：</span>
        				<pre>
        						<span className="item-content">{this.state.data.target||"暂无"}</span>
        				</pre>
        		</div>,
        		<div className="originalPrice">
        				<span className="item-name">课程原价：</span>
        				<span className="item-content">{this.state.data.originalPrice||"暂无"}</span>
        		</div>,
        		<div className="price">
        				<span className="item-name">课程现价：</span>
        				<span className="item-content">{this.state.data.price||"暂无"}</span>
        		</div>,
        		<div className="address">
        				<span className="item-name">详细地址：</span>
        				<span className="item-content">{this.state.data.address||"暂无"}</span>
        		</div>,
        		<div className="tips">
        				<span className="item-name">购买须知：</span>
        				<pre>
        						<span className="item-content">{this.state.data.tips || "暂无"}</span>
        				</pre>
        		</div>,
        		<div className="createTime">
        				<span className="item-name">创建时间：</span>
        				<span className="item-content">{this.state.data.createTime?this.timeHandle(this.state.data.createTime):""}</span>
        		</div>,
        		<div className="opinion">
        				<span className="item-name">审核意见：</span>
        				<pre>
        						<span className="item-content">{this.state.data.opinion || "暂无"}</span>
        				</pre>
        		</div>,
        		<div className="status">
        				<span className="item-name">课程状态：</span>
        				<span className="item-content">{tempStatus}</span>
        		</div>
        ];
        return (
        		<a>
        				<span onClick={this.showModal}>详情</span>
        				<Modal
        						title="课程详情"
        						visible={this.state.visible}
        						footer={null}
        						onCancel={this.handleCancel}
        				>
        						<div className="course-details item-details">
        								<div className="course-baseData">
        										<List
        												size="small"
        												split="false"
        												dataSource={this.state.loading?"":baseData}
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

//签到列表表格
const StudentsListTable = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, pagination, data, columns, pageChange, loading} = props;

        return (
            <Modal
                width={1000}
                visible={visible}
                title="签到列表"
                footer={null}
                onCancel={onCancel}
                onOk={onCreate}
            >
                <div className="students-list">
                    <Table bordered pagination={pagination} dataSource={data} columns={columns}
                           onChange={pageChange} loading={loading}/>
                </div>
            </Modal>
        );
    }
);

//签到列表组件
class StudentsList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
						loading: true,
            data: [{key: 1}],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.studentListPageSize) || 10,
                pageSizeOptions: ["5", "6", "7", "8", "9", "10"],
                showQuickJumper: true,
                showSizeChanger: true
            },
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '8%',
                // render: (text, record) =>
                //     <div>
                //         <div
                //             style={{
                //                 width: "10px",
                //                 height: "14px",
                //                 backgroundColor: "blue",
                //                 position: "absolute",
                //                 top: 0,
                //                 left: 0
                //             }}
                //             className="color"/>
                //         <div>{text}</div>
                //     </div>,
            },
            {
                title: '孩子昵称',
                dataIndex: 'childrenName',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'childrenName'),
            },
            {
                title: '联系人',
                dataIndex: 'userName',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'userName'),
            },
            {
                title: '联系电话',
                dataIndex: 'userPhone',
                width: '12%',
                render: (text, record) => this.renderColumns(text, record, 'userPhone'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {
                                record.state ?
                                    <span>已签到</span>
                                    :
                                    <Popconfirm title="确认签到?"
                                                placement="topRight"
                                                onConfirm={() => this.itemConfirm(record.userId, record.orderSn)}
                                                onCancel=""
                                                okType="danger"
                                                okText="确认"
                                                cancelText="取消">
                                        <a>签到</a>
                                    </Popconfirm>
                            }
                        </div>
                    )
                }
            }
        ];
    }

    //获取学生列表
    getData = () => {
				this.setState({
						loading: true
				})
        if (this.props.type === "0") {
            reqwest({
                url: '/signin/getUserList',
                type: 'json',
                method: 'post',
                data: {
                    belongId: this.props.id,
                    date: this.props.date,
                    pageNum: this.state.pagination.current,
                    pageSize: this.state.pagination.pageSize
                },
                headers: {
                    Authorization: sessionStorage.token
                },
                error: (XMLHttpRequest) => {
//                     const json = {
//                         result: 0,
//                         data: {
//                             size: 10,
//                             list: [
//                                 {
//                                     id: 1,
//                                     userId: 1,
//                                     childrenName: "001",
//                                     userPhone: "18234085568",
//                                     userName: "01",
//                                     orderSn: "Y485963",
// 																		state:1
//                                 },
//                                 {
//                                     id: 2,
//                                     userId: 2,
//                                     childrenName: "002",
//                                     userPhone: "18234085568",
//                                     userName: "02",
//                                     orderSn: "Y485963"
//                                 },
//                                 {
//                                     id: 3,
//                                     userId: 3,
//                                     childrenName: "003",
//                                     userPhone: "18234085512",
//                                     userName: "03",
//                                     orderSn: "Y485963"
//                                 },
//                                 {
//                                     id: 4,
//                                     userId: 4,
//                                     childrenName: "004",
//                                     userPhone: "18234085512",
//                                     userName: "04",
//                                     orderSn: "Y485963"
//                                 },
//                                 {
//                                     id: 5,
//                                     userId: 4,
//                                     childrenName: "004",
//                                     userPhone: "18234085512",
//                                     userName: "04",
//                                     orderSn: "Y485963"
//                                 },
//                                 {
//                                     id: 6,
//                                     userId: 4,
//                                     childrenName: "004",
//                                     userPhone: "18234085512",
//                                     userName: "04",
//                                     orderSn: "Y485963"
//                                 },
//                                 {
//                                     id: 7,
//                                     userId: 4,
//                                     childrenName: "004",
//                                     userPhone: "18234085512",
//                                     userName: "04",
//                                     orderSn: "Y485963"
//                                 },
//                                 {
//                                     id: 8,
//                                     userId: 4,
//                                     childrenName: "004",
//                                     userPhone: "18234085512",
//                                     userName: "04",
//                                     orderSn: "Y485963"
//                                 },
//                                 {
//                                     id: 9,
//                                     userId: 4,
//                                     childrenName: "004",
//                                     userPhone: "18234085512",
//                                     userName: "04",
//                                     orderSn: "Y485963"
//                                 },
//                                 {
//                                     id: 10,
//                                     userId: 4,
//                                     childrenName: "004",
//                                     userPhone: "18234085512",
//                                     userName: "04",
//                                     orderSn: "Y485963"
//                                 },
//                             ]
//                         }
//                     };
                },
                success: (json) => {
                    const data = [];
                    if (json.result === 0) {
                        json.data.list.forEach((item, index) => {
                            data.push({
                                key: item.id,
                                id: item.id,
                                userId: item.userId,
                                index: index + 1,
                                childrenName: item.childrenName,
                                userName: item.userName,
                                userPhone: item.userPhone,
                                orderSn: item.orderSn,
                                state: item.state,
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
                    }
                }
            });
        }
        if (this.props.type === "1") {
            reqwest({
                url: '/signin/getExperienceUserList',
                type: 'json',
                method: 'post',
                data: {
                    courseId: this.props.id,
                    date: this.props.date,
                    pageNum: this.state.pagination.current,
                    pageSize: this.state.pagination.pageSize
                },
                headers: {
                    Authorization: sessionStorage.token
                },
                error: (XMLHttpRequest) => {
//                     const json = {
//                         result: 0,
//                         data: {
//                             size: 10,
//                             list: [
//                                 {
//                                     id: 1,
//                                     userId: 1,
//                                     childrenName: "001",
//                                     userPhone: "18234085568",
//                                     userName: "01",
//                                     orderSn: "Y5694178"
//                                 },
//                                 {
//                                     id: 2,
//                                     userId: 2,
//                                     childrenName: "002",
//                                     userPhone: "18234085568",
//                                     userName: "02",
//                                     orderSn: "Y5694178"
//                                 },
//                                 {
//                                     id: 3,
//                                     userId: 3,
//                                     childrenName: "003",
//                                     userPhone: "18234085512",
//                                     userName: "03",
//                                     orderSn: "Y5694178"
//                                 },
//                                 {
//                                     id: 4,
//                                     userId: 4,
//                                     childrenName: "004",
//                                     userPhone: "18234085512",
//                                     userName: "04",
//                                     orderSn: "Y5694178"
//                                 },
//                                 {
//                                     id: 5,
//                                     userId: 4,
//                                     childrenName: "004",
//                                     userPhone: "18234085512",
//                                     userName: "04",
//                                     orderSn: "Y5694178"
//                                 },
//                                 {
//                                     id: 6,
//                                     userId: 4,
//                                     childrenName: "004",
//                                     userPhone: "18234085512",
//                                     userName: "04",
//                                     orderSn: "Y5694178"
//                                 },
//                                 {
//                                     id: 7,
//                                     userId: 4,
//                                     childrenName: "004",
//                                     userPhone: "18234085512",
//                                     userName: "04",
//                                     orderSn: "Y5694178"
//                                 },
//                                 {
//                                     id: 8,
//                                     userId: 4,
//                                     childrenName: "004",
//                                     userPhone: "18234085512",
//                                     userName: "04",
//                                     orderSn: "Y5694178"
//                                 },
//                                 {
//                                     id: 9,
//                                     userId: 4,
//                                     childrenName: "004",
//                                     userPhone: "18234085512",
//                                     userName: "04",
//                                     orderSn: "Y5694178"
//                                 },
//                                 {
//                                     id: 10,
//                                     userId: 4,
//                                     childrenName: "004",
//                                     userPhone: "18234085512",
//                                     userName: "04",
//                                     orderSn: "Y5694178"
//                                 },
//                             ]
//                         }
//                     };
                },
                success: (json) => {
                    const data = [];
                    if (json.result === 0) {
                        json.data.list.forEach((item, index) => {
                            data.push({
                                key: item.id,
                                id: item.id,
                                userId: item.userId,
                                index: index + 1,
                                childrenName: item.childrenName,
                                userName: item.userName,
                                userPhone: item.userPhone,
                                orderSn: item.orderSn,
                                state: item.state,
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
                    }
                }
            });
        }
    };

    //签到
    itemConfirm = (id, orderSn) => {
        this.setState({
        		loading: true
        })
        reqwest({
            url: '/signin/sign',
            type: 'json',
            method: 'post',
            data: {
                type: Number(this.props.type),
                userId: id,
                belongId: this.props.id,
                date: this.props.date,
                orderSn: orderSn
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("学生签到成功");
                    this.getData();
                } else {
                    if (json.code === "1118") {
                        message.error("无需重复签到")
                    }
                }
            }
        });
    };

    showModal = () => {
        this.getData();
        this.setState({visible: true});
    };

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    //页码变化处理
    pageChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.studentListPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.studentListPageSize);
        this.setState({
            pagination: pager
        }, () => {
            this.getData();
        })
    };

    handleCancel = () => {
        this.setState({
            visible: false
        }, () => {
            this.setState({
                data: [{key: 1}]
            });
        })
    };

    render() {
        return (
            <a style={{display: this.props.status ? "inline" : "none"}}>
                <span onClick={() => this.showModal(this.props.id)}>签到列表</span>
                <StudentsListTable
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    pagination={this.state.pagination}
										loading={this.state.loading}
                    data={this.state.data}
                    columns={this.columns}
                    pageChange={this.pageChange}/>
            </a>
        );
    }
}

//列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
						loading: true,
            data: [{key: 1}],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.attendConfirmPageSize) || 10,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            },
        };
        this.columns01 = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '8%',
            },
            {
                title: '班级名称',
                dataIndex: 'name',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '所属课程',
                dataIndex: 'courseName',
                width: '25%',
                render: (text, record) => this.renderColumns(text, record, 'courseName'),
            },
            {
                title: '开课时间',
                dataIndex: 'startTime',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'startTime'),
            },
            {
                title: '结束时间',
                dataIndex: 'endTime',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'endTime'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            <CourseDetails courseId={record.courseId} status={1}/>
                            <StudentsList id={record.id} type="0" date={this.props.keyword.date} status={1}/>
                        </div>
                    );
                },
            }
        ];
        this.columns02 = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '8%',
            },
            {
                title: '课程名称',
                dataIndex: 'name',
                width: '25%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            <CourseDetails courseId={record.id} status={record.courseId ? 0 : 1}/>
                            <StudentsList id={record.id} type="1" date={this.props.keyword.date} status={1}/>
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

    timeHandle = (para) => {
        const tempDate = new Date(para.replace("CST", "GMT+0800")),
            oHourT = tempDate.getHours().toString(),
            oHour = oHourT.length <= 1 ? "0" + oHourT : oHourT,
            oMinuteT = tempDate.getMinutes().toString(),
            oMinute = oMinuteT.length <= 1 ? "0" + oMinuteT : oMinuteT,
            oTime = oHour + ":" + oMinute;
        return oTime;
    };

    courseHandle = (data) => {
        const result = [];
        data.forEach((item, index) => {
            const temp = {
                key: item.id,
                id: item.id,
                index: index + 1,
                name: item.name
            };
            // if (item.lessonList) {
            //     const tempChildren = [];
            //     item.lessonList.forEach((subItem, subIndex) => {
            //         const temp = {
            //             key: subItem.id,
            //             id: subItem.id,
            //             courseId: subItem.courseId,
            //             index: subIndex + 1,
            //             lessonName: subItem.lessonName
            //         };
            //         tempChildren.push(temp)
            //     });
            //     temp.children = tempChildren
            // }
            result.push(temp)
        });
        return result;
    };

    //获取列表
    getData = (keyword) => {
        let type = keyword ? keyword.type : this.props.keyword.type;
				this.setState({
						loading: true
				})
        if (type === "0") {
            reqwest({
                url: '/signin/getClassList',
                type: 'json',
                method: 'post',
                data: {
                    date: keyword === undefined ? this.props.keyword.date : keyword.date,
                    className: keyword === undefined ? this.props.keyword.className : keyword.className,
                    pageNum: this.state.pagination.current,
                    pageSize: this.state.pagination.pageSize
                },
                headers: {
                    Authorization: sessionStorage.token
                },
                error: (XMLHttpRequest) => {
//                     const json = {
//                         result: 0,
//                         data: {
//                             size: 100,
//                             list: [
//                                 {
//                                     id: 1,
//                                     name: "书法课书法课书法课书法课",
//                                     week: "1,2",
//                                     startTime: "Thu Jan 01 7:5:00 CST 1970",
//                                     endTime: "Thu Jan 01 09:05:00 CST 1970",
//                                     state: 0,
//                                     classState: 0,
//                                     courseId: 1,
//                                     courseName: "课程001"
//                                 },
//                             ]
//                         }
//                     };
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
                                key: item.id,
                                id: item.id,
                                courseId: item.courseId,
                                courseName: item.courseName,
                                index: index + 1,
                                name: item.name,
                                startTime: this.timeHandle(item.startTime),
                                endTime: this.timeHandle(item.endTime),
                                classState: item.classState
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
                    }
                }
            })
        }
        if (type === "1") {
            reqwest({
                url: '/signin/getExperienceCourseList',
                type: 'json',
                method: 'post',
                data: {
                    pageNum: this.state.pagination.current,
                    pageSize: this.state.pagination.pageSize
                },
                headers: {
                    Authorization: sessionStorage.token
                },
                error: (XMLHttpRequest) => {
//                     const json = {
//                         result: 0,
//                         data: {
//                             size: 100,
//                             list: [
//                                 {
//                                     id: 2,
//                                     name: "体验课001",
//                                     lessonList: [
//                                         {id: 11, courseId: 1, lessonName: "001"},
//                                         {id: 12, courseId: 1, lessonName: "002"},
//                                         {id: 13, courseId: 1, lessonName: "003"},
//                                     ]
//                                 },
//                             ]
//                         }
//                     };
                },
                success: (json) => {
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
                        this.setState({
														loading: false,
                            data: this.courseHandle(json.data.list),
                            pagination: {
                                total: json.data.size,
                                current: this.state.pagination.current,
                                pageSize: this.state.pagination.pageSize
                            }
                        })
                    }
                }
            })
        }
    };

    //页码变化处理
    handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.attendConfirmPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.attendConfirmPageSize);
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
        if (nextProps.keyword !== this.props.keyword) {
            this.getData(nextProps.keyword);
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
                      columns={this.props.keyword.type === "0" ? this.columns01 : this.columns02}
                      onChange={this.handleTableChange}/>;
    }
}

class AttendConfirm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: {
                type: "0",
                date: '',
                className: ''
            },
            flag_add: false
        };
    };

    search = (type, value) => {
        if (type === 0) {
            this.setState({
                keyword: {
                    type: value,
                    date: this.state.keyword.date,
                    className: this.state.keyword.className,
                }
            })
        }
        if (type === 1) {
            if (value !== this.state.keyword.date) {
                this.setState({
                    keyword: {
                        type: this.state.keyword.type,
                        date: value,
                        className: this.state.keyword.className,
                    }
                })
            }
        }
        if (type === 2) {
            if (value !== this.state.keyword.className) {
                this.setState({
                    keyword: {
                        type: this.state.keyword.type,
                        date: this.state.keyword.date,
                        className: value,
                    }
                })
            }
        }
    };

    setFlag = () => {
        this.setState({
            flag_add: !this.state.flag_add
        })
    };

    getToday = () => {
        const tempDate = new Date(),
            oMonthT = (tempDate.getMonth() + 1).toString(),
            oMonth = oMonthT.length <= 1 ? "0" + oMonthT : oMonthT,
            oDayT = tempDate.getDate().toString(),
            oDay = oDayT.length <= 1 ? "0" + oDayT : oDayT,
            oYear = tempDate.getFullYear().toString(),
            oTime = oYear + '-' + oMonth + '-' + oDay;
        return oTime;
    };

    componentWillMount() {
        this.setState({
            keyword: {
                type: this.state.keyword.type,
                date: this.getToday(),
                className: this.state.keyword.className
            },
        });
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
            <div className="attendConfirm">
                <header className="clearfix">
                    <Select defaultValue="线下课程" style={{width: "150px", float: "left", marginRight: "20px"}}
                            onChange={(value) => this.search(0, value)}>
                        <Option key={0} value="0">{"线下课程"}</Option>
                        <Option key={1} value="1">{"体验课程"}</Option>
                    </Select>
                    <DatePicker placeholder="请选择日期"
                                defaultValue={moment(this.state.keyword.date)}
                                style={{width: "120px", float: "left", marginRight: "20px"}}
                                onChange={(date, dateString) => this.search(1, dateString)}/>
                    {/*<Search placeholder="请输入班级名称信息"*/}
                    {/*onSearch={(value) => this.search(2, value)}*/}
                    {/*enterButton*/}
                    {/*style={{width: "320px", float: "left"}}*/}
                    {/*/>*/}
                </header>
                <div className="table-box">
                    <DataTable keyword={this.state.keyword} flag_add={this.state.flag_add}/>
                </div>
            </div>
        )
    }
}

export default AttendConfirm;