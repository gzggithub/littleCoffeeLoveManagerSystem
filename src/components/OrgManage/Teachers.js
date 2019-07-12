import React, {Component} from 'react';
import {
    Table,
    Input,
    InputNumber,
    DatePicker,
    Button,
    Checkbox,
    Modal,
    Form,
    Select,
    Upload,
    Slider,
    Row,
    Col,
    Icon,
    message,
    List,
    Popconfirm,
    TreeSelect,
    Spin,
    Breadcrumb,
} from 'antd';
import '../../config/config';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';
import reqwest from 'reqwest';
import AvatarEditor from 'react-avatar-editor'

const Search = Input.Search;
const FormItem = Form.Item;
const {TextArea} = Input;
const {Option} = Select;

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

    toggleEdit = () => {
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
            if (props1 !== Number(values.sort)){
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
                            {form.getFieldDecorator((dataIndex === 0 ? '' : dataIndex), {
                                rules: [{
                                    required: false,                                   
                                    message: "只能输入数字",                                    
                                }],                               
                                initialValue: record[dataIndex],
                                })(
                                <Input style={{ textAlign: "center" }}
                                    ref={node => (this.input = node)}
                                    onPressEnter={this.sort.bind(this, record[dataIndex])}
                                    onBlur={this.sort.bind(this, record[dataIndex])}
                                    placeholder="双击设置排序"
                                />
                            )}
                        </FormItem>
                        ) : (
                        <div
                            className="editable-cell-value-wrap"
                            onClick={this.toggleEdit}
                        >
                            <Input style={{ textAlign: "center" }}
                                    ref={node => (this.input = node)}
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

//新增教师表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, subjectList, checkTel, coursesList, courseIds, multipleChoose, reqwestUploadToken, viewPic, effectPic, data_pic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoLoading, confirmLoading,} = props;
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
            return new Blob([u8arr], { type: "image/jpeg" });
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
            if (viewPic) {
                const canvas = this.editor.getImage();
                const url = canvas.toDataURL("image/jpeg", 0.92);
                if (url === effectPic) {
                    message.error("图片未改动，无法提交");
                    return
                }
                const file = dataURLtoFile(url);
                picUpload(url, file)
            } else {
                message.error("图片未选择");
            }
        };

        // const recordSetting = {};
        // recordSetting.subjectOne = false;
        // recordSetting.subjectTwo = true;
        // recordSetting.subjectThree = false;
        // recordSetting.subjectFour = true;
        // recordSetting.subjectFive = false;
        // recordSetting.subjectSix = true;
        // recordSetting.subjectSeven = false;
        // recordSetting.subjectEight = true;

        // function toggle (value) {
        //     console.log(value);
        //     console.log(222);
        //     if(recordSetting[value]) {
        //         recordSetting[value] = false;
        //         console.log(333); 
        //     } else {
        //             console.log(444);
        //         recordSetting[value] = true; 
        //     }
        // };

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
        
        // 主攻授课 & CheckBox
        const coursesListNum = [];

        coursesList.forEach((item) => {
            coursesListNum.push(
                <Col span={6} key={item.id}>
                    <Checkbox key={item.id} value={item.id}>{item.name}</Checkbox>                                                
                </Col>
            )
        });

        // 主攻授课 & Button
        const coursesListNumBtn = [];

        coursesList.forEach((item) => {
            coursesListNumBtn.push(
                <Col span={6} key={item.id}>
                    <Checkbox key={item.id} value={item.id}>{item.name}</Checkbox>                                                
                </Col>
            )
        });

        //  data.courseIds.forEach((item) => {
        //     coursesListNum.push(
        //             <Col span={6}>
        //                 <Checkbox key={item.id} value={item.id}>{item.name}</Checkbox>                                                
        //             </Col>
        //         )
        //     });
        // }

        return (
            <Modal
                visible={visible}
                title="添加教师"
                width={1000}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                {
                    JSON.stringify(data) === null ?
                        <div className="spin-box">
                            <Spin/>
                        </div>
                        :
                        <div className="teacher-add teacher-form item-form">
                            <Form layout="vertical">
                                <h4 className="add-form-title-h4">基础信息</h4>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="name" label="教师姓名：">
                                            {getFieldDecorator('name', {
                                                initialValue: data.name ? data.name : '',
                                                rules: [{
                                                    required: true,
                                                    message: '姓名不能为空',
                                                }],
                                            })(
                                                <Input placeholder="请输入教师姓名"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="nickName" label="昵称：">
                                            {getFieldDecorator('nickName', {
                                                initialValue: data.nickName ? data.nickName : '',
                                                rules: [{
                                                    required: true,
                                                    message: '昵称不能为空'
                                                }],
                                            })(
                                                <Input placeholder="请填写教师昵称"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="gender" label="性别：">
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
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="experienceAge" label="教龄(年)：">
                                            {getFieldDecorator('experienceAge', {
                                                initialValue: data.experienceAge ? data.experienceAge : '',
                                                rules: [{
                                                    required: true,
                                                    message: '教龄不能为空',
                                                }],
                                            })(
                                                <InputNumber style={{width: "100%"}} min={0} precision={0} step={1}/>
                                            )}
                                        </FormItem> 
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="typeIds" label="教学科目：">
                                            {getFieldDecorator('types', {
                                                initialValue: data.types ? data.types : null,
                                                rules: [{
                                                    required: true,
                                                    message: '科目不能为空',
                                                }],
                                            })(
                                                <TreeSelect
                                                    style={{width: 300}}
                                                    placeholder="请选择教师所教科目（最多三项）"
                                                    dropdownStyle={{maxHeight: 400, overflow: "auto"}}
                                                    treeCheckable={true}
                                                    treeData={subjectList}
                                                    showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                                />                                               
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="phone unnecessary" label="联系电话：">
                                            {getFieldDecorator('phone', {
                                                initialValue: data.phone ? data.phone : '',
                                                rules: [
                                                    {
                                                        required: false
                                                    },
                                                    {
                                                        validator: checkTel
                                                    }
                                                ],
                                            })(
                                                <Input placeholder="请输入教师联系方式"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <Row gutter={24}>                                    
                                    <Col span={10}>
                                        <FormItem className="photo" label="教师头像：">
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
                                                            }}>{data_pic ? "重新提交" : "图片提交"}</Button>
                                                </div>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>

                                <h4 className="add-form-title-h4">教师简介</h4>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="name" label="主攻方向：">
                                            {getFieldDecorator('principal', {
                                                initialValue: data.principal ? data.principal : '',
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '主攻方向不能为空',
                                                    },
                                                    {
                                                        max: 40,
                                                        message: "主攻方向不能大于40个字符"
                                                    }
                                                ],
                                            })(
                                                <Input placeholder="请输入主攻方向"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="name" label="教学理念：">
                                            {getFieldDecorator('teachingIdea', {
                                                initialValue: data.teachingIdea ? data.teachingIdea : '',
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '教学理念不能为空',
                                                    },
                                                    {
                                                        max: 40,
                                                        message: "主攻方向不能大于40个字符"
                                                    }
                                                ],
                                            })(
                                                <Input placeholder="请输入教学理念"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <FormItem className="experience" label="个人经历：">
                                    {getFieldDecorator('experience', {
                                        initialValue: data.experience ? data.experience : '',
                                        rules: [
                                            {
                                                required: true,
                                                message: '个人经历不能为空',
                                            },
                                            {
                                                max: 600,
                                                message: "个人经历不能大于300个字"
                                            }
                                        ],
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写个人经历" rows={10}/>
                                    )}
                                </FormItem>
                                <div className="ant-line"></div>
                                <h4 className="add-form-title-h4">主攻授课</h4>
                                <FormItem className="description longItem">
                                    {getFieldDecorator('courseIds', {
                                        initialValue: courseIds,
                                        rules: [
                                            {
                                                required: false,
                                                message: '未选择主攻授课',
                                            }
                                        ],
                                    })(
                                        <Checkbox.Group style={{ width: '100%' }} onChange={multipleChoose}>
                                            {                                                
                                                <Row gutter={8}>
                                                   {coursesListNum}  
                                                </Row>
                                            }
                                        </Checkbox.Group>
                                    )}
                                </FormItem>  
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

//新增教师组件
class ItemAdd extends Component {
    state = {
        visible: false,
        data: {},
        // 图片相关变量--------------------------------------
        // 上传Token
        uploadToken: '',
        // 初始图片
        viewPic: "",
        // 有效图片：图片提交成功时写入，用以与提交时canvas生成的图片编码进行比对，已确定图片是否有改动
        effectPic: "",
        // 保存待提交的图片
        data_pic: "",
        data_pic_copy: "",
        // 图片缩放比例及偏移量变量
        avatarEditor: {
            scale: 1,
            positionX: 0.5,
            positionY: 0.5
        },
        // 图片提交按钮状态变量
        photoLoading: false,
        // 科目列表
        subjectList: [],
        // 主攻授课列表
        coursesList: [],
        // 已选的主攻授课id
        courseIds: [],
        confirmLoading: false,        
        // recordSetting: {
        //     subjectOne: false,
        //     subjectTwo: true,
        //     subjectThree: true,
        //     subjectFour: true,
        //     subjectFive: true,
        //     subjectSix: false,
        //     subjectSeven: true,
        //     subjectEight: true,
        // } 
    };

    // 多选课程设置
    // toggle = (value) => {
    //     console.log(value);
        // console.log(this.state.recordSetting);
        // console.log(this.state.recordSetting[value])
        // if (this.state.recordSetting[value]) {
        //     console.log(2);
        //     this.setState({
        //         recordSetting: !this.state.recordSetting[value],
        //     })
        // } else {
        //     console.log(3);
        //     // this.state.recordSetting[value] = true
        //     this.setState({
        //         recordSetting: !this.state.recordSetting[value],
        //     })
        // }
    // }

    // toggle = (value) => {
    //     console.log(value);
    //     console.log(222);
    //     const recordSetting1 = {};
    //         recordSetting1.subjectOne = this.state.recordSetting.subjectOneOne;
    //         recordSetting1.subjectTwo = this.state.recordSetting.subjectTwo;
    //         recordSetting1.subjectThree = this.state.recordSetting.subjectThree;
    //         recordSetting1.subjectFour = this.state.recordSetting.subjectFour;
    //         recordSetting1.subjectFive = this.state.recordSetting.subjectFive;
    //         recordSetting1.subjectSix = this.state.recordSetting.subjectSix;
    //         recordSetting1.subjectSeven = this.state.recordSetting.subjectSeven;
    //         recordSetting1.subjectEight = this.state.recordSetting.subjectEight;
    //     if(recordSetting1[value]) {
    //         recordSetting1[value] = false;
    //         console.log(333);
    //         this.setState({
    //             recordSetting: recordSetting1,
    //         })
    //     } else {
    //         console.log(444);
    //         recordSetting1[value] = true;
    //         this.setState({
    //             recordSetting: recordSetting1,
    //         })
    //     }
    // };
    // 复制教师
    copyTeacher = (props1, events) => {
        this.getData();
    };

    showModal = (props2, events) => {
        if (props2 === '1') {
            this.setState({
                confirmLoading: true,
            })
            this.getData();
        } 
        if (props2 === "2") {
            this.setState({
                data: {},
                confirmLoading: false,
            })
        }
        this.getSubjectList();
        this.getCoursesList();
        this.setState({visible: true});
    };

    // 倒计时
    countDown = () => {
        let secondsToGo = 3;
        const modal = Modal.success({
            title: `温馨提示`,
            content: `你还没添加教师，请先添加教师，正在返回，请稍后 ${secondsToGo} s.`,
        });
        const timer = setInterval(() => {
            secondsToGo -= 1;
            modal.update({
               content: `你还没添加教师，请先添加教师，正在返回，请稍后 ${secondsToGo} s.`,
            });
        }, 1000);
        setTimeout(() => {
            clearInterval(timer);
            modal.destroy();
        }, secondsToGo * 1000);
    };

    // 根据teacherId获取最近教师信息
    getData = () => {
        reqwest({
            url: '/admin/teacher/getNewest',
            type: 'json',
            method: 'get',
            data: {
                orgId: this.props.orgId,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                this.setState({
                    confirmLoading: false,
                });
            },
            success: (json) => {
                if (json.result === 0) {                    
                    const types = [];
                    const fnFilter01 = (para) => {
                        return para.typeParentId !== 0
                    };
                    let type01 = json.data.teacherTypeList.filter(fnFilter01);
                    if (type01.length) {
                        type01.forEach((item, index) => {
                            types.push(item.typeParentId + ',' + item.typeId)
                        }) 
                    }
                    json.data.teacher.types = types;
                    console.log(types)
                    // 当前教师主攻授课已选课程id
                    let tempCourseIds = [];
                    if (json.data.courseTeacherList) {
                        json.data.courseTeacherList.forEach((item, index) => {
                            tempCourseIds.push(item.courseId)
                        })
                    }
                    console.log(tempCourseIds);
                    this.setState({
                        data: json.data.teacher,
                        viewPic: json.data.teacher.photo,
                        effectPic: json.data.teacher.photo,
                        data_pic: json.data.teacher.photo,
                        courseIds: tempCourseIds,
                        confirmLoading: false,
                    }, () => {
                        console.log(this.state.courseIds);
                        this.showModal();
                    });
                } else {
                    this.setState({
                        confirmLoading: false,
                    })  
                    if (json.code === 901) {
                        message.error("请先登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.props.toLoginPage();
                    } else if (json.code === 1041) {
                        // 当数据为空时提示
                        this.countDown();
                    } else {
                        message.error(json.message);
                    }
                }
            }
        })
    };

    // 获取科目列表
    getSubjectList = () => {
        reqwest({
            url: '/sys/orgType/getByOrg',
            type: 'json',
            method: 'get',
            data: {
                orgId: this.props.orgId
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {},
            success: (json) => {
                if (json.result === 0) {
                    console.log(json.data);
                    const data = [];
                    json.data.forEach((item) => {
                        let subData = [];
                        if (item.list) {
                            item.list.forEach((subItem) => {
                                subData.push({
                                    key: subItem.parentId + ',' + subItem.id,
                                    value: subItem.parentId + ',' + subItem.id,
                                    title: subItem.name
                                })
                            })
                        }                        
                        data.push({
                            key: item.id,
                            value: String(item.id),
                            title: item.name,
                            children: subData
                        })
                    });
                    console.log(data)
                    this.setState({
                        subjectList: data
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
        })
    };

    // 获取主攻授课课程列表
    getCoursesList = () => {
        reqwest({
            url: '/admin/course/list',
            type: 'json',
            method: 'get',
            data: {
                orgId: this.props.orgId,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {},
            success: (json) => {
                if (json.result === 0) {
                    console.log(json.data);
                    this.setState({
                        coursesList: json.data.list
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
                }
            }
        });
    };

    // 手机号和座机号校验
    checkTel = (rule, value, callback) => {
        const isPhone = /^([0-9]{3,4}-)?[0-9]{7,8}$/;
        const isPhone02 = /^\d{3,4}-\d{3,4}-\d{3,4}$/; // 4001-550-520
        const isMob = /^1[0-9]{10}$/;
        const valuePhone = value.trim();
        if (isMob.test(valuePhone) || isPhone.test(valuePhone) || isPhone02.test(valuePhone)) { // 正则验证
            callback(); // 校验通过
            return true;
        } else if (valuePhone === ""){
            callback();
            return true;
        } else {
            callback('请输入正确手机号或座机电话'); // 校验不通过
            return false;
        }
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
                _this.setState({
                    effectPic: para01,
                    data_pic: global.config.photoUrl + res.key,
                    data_pic_copy: res.key,
                    photoLoading: false,
                })
            }
        }
        const observable = qiniu.upload(file, key, token, config)
        observable.subscribe(observer) // 上传开始
    };

    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false
        }, () => {
            sessionStorage.removeItem("TeachersData");
            this.setState({
                viewPic: "",
                effectPic: "",
                data_pic: "",
                objPic: "",
                avatarEditor: {
                    scale: 1,
                    positionX: 0.5,
                    positionY: 0.5
                },
                photoLoading: false,
                // 科目列表
                subjectList: [],
                // 主攻授课列表
                coursesList: [],
                // 已选的主攻授课id
                courseIds: [],
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
            const typeIdsTemp = [];
            const typeIdsTem = [];
            values.types.forEach((item, index) => {
                let endIndex = item.indexOf(',');
                let parentId = item.slice(0,endIndex);
                let id = item.slice(endIndex + 1);
                typeIdsTemp.push(Number(parentId));
                typeIdsTem.push(Number(id));
            })
            let setTypeIds = Array.from(new Set(typeIdsTemp));
            console.log(setTypeIds);
            console.log(typeIdsTem);
            const temp = setTypeIds.concat(typeIdsTem);
            console.log(temp);
            if (setTypeIds.length > 3) {
                message.error("教学类型最多选三项");
                return;
            }
            values.types = temp;
            // if (values.typeIds.length > 3) {
            //     message.error("教学科目最多选三项");
            //     return;
            // }
            if (!this.state.data_pic) {
                message.error("图片未提交");
                return
            }
            if (this.state.data_pic) {
                values.photo = this.state.data_pic;
            }
            let iconTemp = values.photo.slice(global.config.photoUrl.length);
            console.log(iconTemp);
            values.courses = this.state.courseIds;

            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/admin/teacher/save',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    orgId: this.props.orgId,
                    name: values.name,
                    types: values.types,
                    nickName: values.nickName,
                    phone: values.phone,
                    photo: iconTemp,
                    gender: values.gender,
                    experienceAge: values.experienceAge,
                    description: values.description,
                    principal: values.principal,
                    teachingIdea: values.teachingIdea,
                    experience: values.experience,
                    courses: values.courses,
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                    sessionStorage.removeItem("TeachersData");
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("教师添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            sessionStorage.removeItem("TeachersData");
                            this.setState({
                                viewPic: "",
                                effectPic: "",
                                data_pic: "",
                                objPic: "",
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
                        this.props.setFlag()
                    } else {
                        sessionStorage.removeItem("TeachersData");
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

    multipleChoose = (value) => {
        console.log("checked: ", value);
        this.setState({
            courseIds: value
        })
        console.log(this.state.courseIds)
    }

    render() {
        return (
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
            {/*<div style={{display: "block"}}>*/}
                <Button onClick={this.copyTeacher.bind(this, "1")}>复制教师</Button>
                <Button type="primary" onClick={this.showModal.bind(this, "2")} style={{marginLeft: 10}}>添加教师</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}                    
                    data={this.state.data}
                    checkTel={this.checkTel}
                    reqwestUploadToken={this.reqwestUploadToken}
                    viewPic={this.state.viewPic}
                    effectPic={this.state.effectPic}
                    data_pic={this.state.data_pic}
                    setViewPic={this.setViewPic}
                    avatarEditor={this.state.avatarEditor}
                    setAvatarEditor={this.setAvatarEditor}
                    picUpload={this.picUpload}
                    photoLoading={this.state.photoLoading}
                    subjectList={this.state.subjectList}
                    coursesList={this.state.coursesList}
                    multipleChoose={this.multipleChoose}
                    courseIds={this.state.courseIds}
                    confirmLoading={this.state.confirmLoading}
                    recordSetting={this.state.recordSetting}
                    toggle={this.toggle}
                />
            </div>
        );
    }
}

//教师信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, reqwestUploadToken, viewPic, effectPic, data_pic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoLoading, checkTel, subjectList, coursesList, courseIds, multipleChoose, confirmLoading} = props;
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
            return new Blob([u8arr], { type: "image/jpeg" });
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
                width={80}
                height={80}
                border={0}
                color={[255, 255, 255, 0.6]}
                scale={avatarEditor.scale}
                position={{x: avatarEditor.positionX, y: avatarEditor.positionY}}
                rotate={0}
            />
        );
        
        // 教学科目生成
        const teacherTypeLists = [];
        subjectList.forEach((item, index) => {
            teacherTypeLists.push(
                <Col span={3}>
                    <Checkbox value={item.id}>{item.typeName}</Checkbox>
                </Col>
            )
        });
        
        // 主攻课程项生成
        const coursesListNum = [];
        coursesList.forEach((item, index) => {
            coursesListNum.push(
                <Col span={6} key={item.id}>
                    <Checkbox key={item.id} value={item.id}>{item.name}</Checkbox>
                </Col>
            )
        });

        // const courseTeacherLists = [];
        // courseTeacherList.forEach((item, index) => {
        //     teacherTypeLists.push(
        //         <Col span={3}>
        //             <Checkbox value={item.id}>{item.typeName}</Checkbox>
        //         </Col>
        //     )
        // });

        return (
            <Modal
                visible={visible}
                title="教师编辑"
                width={1000}
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
                                <h4 className="add-form-title-h4">基础信息</h4>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="name" label="教师姓名：">
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
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="nickName" label="昵称：">
                                            {getFieldDecorator('nickName', {
                                                initialValue: data.nickName,
                                                rules: [{
                                                    required: true,
                                                    message: '昵称不能为空',
                                                }],
                                            })(
                                                <Input placeholder="请输入教师昵称"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="gender" label="性别：">
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
                                        
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="experienceAge" label="教龄(年)：">
                                            {getFieldDecorator('experienceAge', {
                                                initialValue: data.experienceAge,
                                                rules: [{
                                                    required: true,
                                                    message: '教龄不能为空',
                                                }],
                                            })(
                                                <InputNumber style={{width: "100%"}} min={0} precision={0} step={1}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="typeIds longItem" label="教学科目：">
                                            {getFieldDecorator('types', {
                                                initialValue: data.types,
                                                rules: [{
                                                    required: true,
                                                    message: '科目不能为空',
                                                }],
                                            })(
                                                <TreeSelect
                                                    style={{width: 300}}
                                                    placeholder="请选择教师所教科目（最多三项）"
                                                    dropdownStyle={{maxHeight: 400, overflow: "auto"}}
                                                    treeCheckable={true}
                                                    treeData={subjectList}
                                                    showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                                />                                        
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="phone unnecessary" label="联系电话：">
                                            {getFieldDecorator('phone', {
                                                initialValue: data.phone,
                                                rules: [
                                                    {
                                                        required: false,
                                                    },
                                                    {
                                                        validator: checkTel,
                                                    }
                                                ],
                                            })(
                                                <Input placeholder="请输入教师联系方式"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="photo" label="教师头像：">
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
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <h4 className="add-form-title-h4">教师简介</h4>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="principal longItem" label="主攻方向：">
                                            {getFieldDecorator('principal', {
                                                initialValue: data.principal,
                                                rules: [{
                                                    required: true,
                                                    message: '主攻方向不能为空',
                                                }],
                                            })(
                                                <Input placeholder="请填写主攻方向"/>
                                            )}
                                        </FormItem></Col>
                                    <Col span={8}>
                                        <FormItem className="teachingIdea longItem" label="教学理念：">
                                            {getFieldDecorator('teachingIdea', {
                                                initialValue: data.teachingIdea,
                                                rules: [{
                                                    required: true,
                                                    message: '教学理念不能为空',
                                                }],
                                            })(
                                                <Input placeholder="请填写教学理念"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <FormItem className="experience longItem" label="个人经历：">
                                            {getFieldDecorator('experience', {
                                                initialValue: data.experience,
                                                rules: [{
                                                    required: true,
                                                    message: '个人经历不能为空',
                                                }],
                                            })(
                                                <TextArea style={{resize: "none"}} placeholder="请填写个人经历" rows={5}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>                                                    
                                <div className="ant-line"></div>
                                <h4 className="add-form-title-h4">主攻授课</h4>
                                <Row gutter={24}>
                                    <Col>
                                        <FormItem className="courseIds longItem" label="">
                                            {getFieldDecorator('courseIds', {
                                                initialValue: courseIds,
                                                rules: [
                                                    {
                                                        required: false,
                                                        message: '未选择主攻授课',
                                                    }
                                                ],
                                            })(
                                                <Checkbox.Group style={{ width: '100%' }} onChange={multipleChoose}>
                                                    {
                                                        // data.courseIds ? 
                                                        <Row gutter={8}>
                                                            {coursesListNum}                                                    
                                                        </Row>                                                
                                                    }
                                                </Checkbox.Group>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

//教师信息编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,
        // 初始数据
        data: {},
        // 图片相关变量
        uploadToken: "",
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
        // 教学科目列表
        subjectList: [],
        // 主要授课
        courseTeacherList: [],
        // 主要授课列表项
        coursesList: [],
        // 已选主要授课id
        courseIds: [],
        confirmLoading: false,
        tempCoursesId: [],
    };

    getData = () => {
        reqwest({
            url: '/admin/teacher/getDetail',
            type: 'json',
            method: 'post',
            data: {
                id: this.props.id
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {},
            success: (json) => {
                if (json.result === 0) {
                    // const typeIds = [String(json.data.teacher.typeId)];
                    // if (json.data.teacher.typeIdTwo) {
                    //     typeIds.push(String(json.data.teacher.typeIdTwo))
                    // }
                    // if (json.data.teacher.typeIdThree) {
                    //     typeIds.push(String(json.data.teacher.typeIdThree))
                    // }
                    // json.data.teacher.typeIds = typeIds;
                    // json.data.teacher.typeIdTwo = json.data.teacher.typeIdTwo ? json.data.teacher.typeIdTwo : 0;
                    // json.data.teacher.typeIdThree = json.data.teacher.typeIdThree ? json.data.teacher.typeIdThree : 0;
                    // 已选教学科目id处理
                    const types = [];
                    const fnFilter01 = (para) => {
                        return para.typeParentId !== 0
                    };
                    let type01 = json.data.teacherTypeList.filter(fnFilter01);
                    if (type01.length) {
                        type01.forEach((item, index) => {
                            types.push(item.typeParentId + ',' + item.typeId)
                        }) 
                    }
                    json.data.teacher.types = types;
                    console.log(types)
                    // 已选主要授课的id处理
                    let tempCourseIds = [];
                    if (json.data.courseTeacherList) {
                        json.data.courseTeacherList.forEach((item, index) => {
                            tempCourseIds.push(item.courseId)
                        })
                    }
                    console.log(tempCourseIds);
                    console.log(json.data.teacher);
                    this.setState({
                        data: json.data.teacher,
                        teacherTypeList: json.data.teacherTypeList,
                        courseTeacherList: json.data.courseTeacherList,
                        viewPic: json.data.teacher.photo,
                        effectPic: json.data.teacher.photo,
                        // data_pic: json.data.teacher.photo,
                        courseIds: tempCourseIds,
                    }, () => {
                        this.getSubjectList(json.data.teacher.orgId);
                        this.getCoursesList(json.data.teacher.orgId);
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
        })
    };

    // 获取教学科目列表
    getSubjectList = (orgId) => {
        reqwest({
            url: '/sys/orgType/getByOrg',
            type: 'json',
            method: 'get',
            data: {
                orgId: orgId,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                const json = {
                    result: 0,
                    data: [
                        {
                            id: 1,
                            name: "",
                            list: [
                                {id: 11, name: ""},
                                {id: 12, name: ""},
                                {id: 13, name: ""},
                            ]
                        }
                    ]
                };
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
                        subjectList: data
                    })
                }
            },
            success: (json) => {
                if (json.result === 0) {
                    const data = [];
                    json.data.forEach((item) => {
                        let subData = [];
                        if (item.list) {
                            item.list.forEach((subItem) => {
                                subData.push({
                                    // key: subItem.id,
                                    // value: String(subItem.id),
                                    key: subItem.parentId + ',' + subItem.id,
                                    value: subItem.parentId + ',' + subItem.id,
                                    title: subItem.name
                                })
                            })
                        }
                        data.push({
                            key: item.id,
                            value: String(item.id),
                            title: item.name,
                            children: subData
                        })
                    });
                    console.log(data)
                    this.setState({
                        subjectList: data
                    })
                }
            }
        });
    };

     // 获取主攻授课课程列表
    getCoursesList = (orgId) => {
        reqwest({
            url: '/admin/course/list',
            type: 'json',
            method: 'get',
            data: {
                orgId: orgId,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                message.error('获取失败');
                this.setState({
                    loading: false
                });
            },
            success: (json) => {
                if (json.result === 0) {
                    // const data = [];
                    // json.data.forEach((item) => {
                    //     data.push({
                    //         id: item.id,
                    //         name: item.name,
                    //     })
                    // });
                    this.setState({
                        coursesList: json.data.list
                    })
                    console.log(this.state.coursesList);
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

    showModal = () => {
        this.getData();
        // this.getSubjectList();
        // this.getCoursesList();
        // this.reqwestUploadToken();
        this.setState({
            visible: true,
        });
    };

    // 手机号和座机号校验
    checkTel = (rule, value, callback) => {
        console.log(rule);
        console.log(value);
        const isPhone = /^([0-9]{3,4}-)?[0-9]{7,8}$/;
        const isPhone02 = /^\d{3,4}-\d{3,4}-\d{3,4}$/; // 4001-550-520
        const isMob = /^1[0-9]{10}$/;
        const valuePhone = value.trim();
        if (isMob.test(valuePhone) || isPhone.test(valuePhone) || isPhone02.test(valuePhone)) { // 正则验证
            callback(); // 校验通过
            return true;
        } else if (valuePhone === ""){
            callback();
            return true;
        } else {
            callback('请输入正确手机号或座机电话'); // 校验不通过
            return false;
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
                _this.setState({
                    effectPic: para01,
                    data_pic: global.config.photoUrl + res.key,
                    photoLoading: false,
                })
            }
        }
        const observable = qiniu.upload(file, key, token, config)
        observable.subscribe(observer) // 上传开始
    };

    // 信息比对函数
    dataContrast = (values) => {
        const initValues = this.state.data;
        const itemList = ["name", "photo", "phone", "gender", "nickName", "experienceAge", "typeId", "typeIdTwo", "typeIdThree", "description", "principal", "teachingIdea", "experience", "courseIds"];
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
            form.resetFields();
        });
    };

    handleCreate = () => {
        if (String(this.state.data.name)==="{}") {
            return;
        }
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }

            const typeIdsTemp = [];
            const typeIdsTem = [];
            values.types.forEach((item, index) => {
                let endIndex = item.indexOf(',');
                let parentId = item.slice(0,endIndex);
                let id = item.slice(endIndex + 1);
                typeIdsTemp.push(Number(parentId));
                typeIdsTem.push(Number(id));
            })
            let setTypeIds = Array.from(new Set(typeIdsTemp));
            console.log(setTypeIds);
            console.log(typeIdsTem);
            const temp = setTypeIds.concat(typeIdsTem);
            console.log(temp);
            if (setTypeIds.length > 3) {
                message.error("教学类型最多选三项");
                return;
            }
            values.types = temp;//科目
            values.courses = this.state.tempCoursesId;//授课

            // if (values.typeIds.length > 3) {
            //     message.error("教学科目最多选三项");
            //     return;
            // }
            // 教师头像和教学科目写入
            if (this.state.data_pic) {
                values.photo = this.state.data_pic;
            }
            let iconTemp = values.photo.slice(global.config.photoUrl.length);
            console.log(iconTemp);
            // value与初始data进行比对，得到修改项集合
            // const result = this.dataContrast(values);
            console.log(this.state.courseIds)
            console.log(values.courseIds)
            const result = {
                id: this.props.id,
                name: values.name,
                nickName: values.nickName,
                gender: values.gender,
                experienceAge: values.experienceAge,
                types: values.types,
                phone: values.phone,
                photo: iconTemp,            
                description: values.description,
                principal: values.principal,
                teachingIdea: values.teachingIdea,
                experience: values.experience,
                courses: values.courseIds,
            };

            if (!result) {
                message.error("暂无信息更改");
                return;
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/admin/teacher/update',
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
                        message.success("教师信息修改成功");
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
            })
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    multipleChoose = (value) => {
        console.log("value:",value);
        this.setState({
            courseIds: value
        })
    };

    render() {
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={() => this.showModal()}>编辑</span>
                <ItemEditForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}                    
                    data={this.state.data}
                    checkTel={this.checkTel}
                    teacherTypeList= {this.state.teacherTypeList}                    
                    reqwestUploadToken={this.reqwestUploadToken}
                    viewPic={this.state.viewPic}
                    effectPic={this.state.effectPic}
                    data_pic={this.state.data_pic}
                    setViewPic={this.setViewPic}
                    avatarEditor={this.state.avatarEditor}
                    setAvatarEditor={this.setAvatarEditor}
                    picUpload={this.picUpload}
                    photoLoading={this.state.photoLoading}
                    subjectList={this.state.subjectList}
                    multipleChoose={this.multipleChoose}
                    coursesList={this.state.coursesList}
                    courseIds={this.state.courseIds}
                    courseTeacherList= {this.state.courseTeacherList}
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
        data: "",
        teacherTypeList: [],
        courseTeacherList: [],
    };

    getData = () => {
        reqwest({
            url: '/admin/teacher/getDetail',
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
                });                
            },
            success: (json) => {
                if (json.result === 0) {                    
                    this.setState({
                        loading: false,
                        data: json.data.teacher,
                        teacherTypeList: json.data.teacherTypeList,
                        courseTeacherList: json.data.courseTeacherList,
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

    showModal = () => {
        this.getData();
        this.setState({
            visible: true,
        });
    };

    handleCancel = () => {
        this.setState({visible: false});
    };

    render() {
        let dataSource;
        if(this.state.data){
            const data = this.state.data;
            const teacherTypeList = this.state.teacherTypeList;
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
            let tempStatus = "";
            if (data.status === 0) {
                tempStatus = "删除";
            }
            if (data.status === 1) {
                tempStatus = "正常";
            }
            if (data.status === 2) {
                tempStatus = "禁用";
            }
            if (data.status === 3) {
                tempStatus = "审核中";
            }
            if (data.status === 4) {
                tempStatus = "审核失败";
            }
            dataSource = [
                <div className="name">
                    <span className="item-name">姓名：</span>
                    <span className="item-content">{data.name}</span>
                </div>,
                <div className="photo">
                    <span className="item-name">照片：</span>
                    <img src={this.state.data.photo} alt="" className="item-content"/>
                </div>,
                <div className="gender">
                    <span className="item-name">性别：</span>
                    <span className="item-content">{tempGender}</span>
                </div>,
                <div className="nickName">
                    <span className="item-name">昵称：</span>
                    <span className="item-content">{data.nickName}</span>
                </div>,
                <div className="EName">
                    <span className="item-name">所属机构：</span>
                    <span className="item-content">{data.orgName}</span>
                </div>,
                <div className="phone">
                    <span className="item-name">联系电话：</span>
                    <span className="item-content">{data.phone || "暂无"}</span>
                </div>,
                <div className="subject">
                    <span className="item-name">教学科目一：</span>
                    <span className="item-content">{teacherTypeList[0] ? (teacherTypeList[0].typeName) : '暂无'}</span>
                    {/*<span className="item-content">{teacherTypeList[0] ? (teacherTypeList[0].parentTypeName + "/" + teacherTypeList[0].typeName) : '暂无'}</span>*/}
                </div>,
                <div className="subject">
                    <span className="item-name">教学科目二：</span>
                    <span
                        className="item-content">{teacherTypeList[1] ? teacherTypeList[1].typeName : "暂无"}</span>
                </div>,
                <div className="subject">
                    <span className="item-name">教学科目三：</span>
                    <span
                        className="item-content">{teacherTypeList[2] ? teacherTypeList[2].typeName : "暂无"}</span>
                </div>,
                <div className="seniority">
                    <span className="item-name">教龄：</span>
                    <span className="item-content">{data.experienceAge}年</span>
                </div>,
                <div className="principal">
                    <span className="item-name">主攻方向：</span>
                    <span className="item-content">{data.principal || "暂无"}</span>
                </div>,
                <div className="teachingIdea">
                    <span className="item-name">教学理念：</span>
                    <span className="item-content">{data.teachingIdea || "暂无"}</span>
                </div>,
                <div className="experience">
                    <span className="item-name">个人经历：</span>
                    <span className="item-content">{data.experience || "暂无"}</span>
                </div>,
                <div className="courseIds">
                    {/*<span className="item-name">主要授课：</span>*/}               
                    {/*<span className="item-content">{teacherTypeList ? data.courseIds.join("/") : '暂无'}</span>*/}
                    {/*<span className="item-content">{data.courseIds ? data.courseIds.join("/") : '暂无'}</span>*/}
                </div>,
                <div className="status">
                    <span className="item-name">状态：</span>
                    <span className="item-content">{tempStatus}</span>
                </div>
            ];
        }else{
            dataSource=""
        }
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
            {/*<a style={{display:"inline"}}>*/}
                <span onClick={this.showModal}>详情</span>
                <Modal
                    title="教师详情"
                    width={600}
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                    destroyOnClose={true}
                >
                    <div className="teacher-details item-details">
                        <div className="teacher-baseData">
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

//教师列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            ghost: false,
            data: [],
            pagination: {
                current: 1,
                pageSize: 15,
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
                    title: "排序",
                    dataIndex: "sort",
                    width: '10%',
                    editable: true,
                    // render: (text, record) => this.renderColumns(text, record, "sort"),
                },
                {
                    title: '姓名',
                    dataIndex: 'name',
                    width: '10%',
                    render: (text, record) => this.renderColumns(text, record, 'name'),
                },
                {
                    title: '所属机构',
                    dataIndex: 'eName',
                    width: '20%',
                    render: (text, record) => this.renderColumns(text, record, 'eName'),
                },
                {
                    title: '照片',
                    dataIndex: 'photo',
                    width: '8%',
                    render: (text, record) => (
                        <img style={{width: '30px', height: "30px"}} src={record["photo"]} alt=""/>)
                },
                {
                    title: '昵称',
                    dataIndex: 'nickName',
                    width: '6',
                    render: (text, record) => this.renderColumns(text, record, 'nickName'),
                },
                {
                    title: '性别',
                    dataIndex: 'gender',
                    width: '8%',
                    render: (text, record) => this.renderColumns(text, record, 'gender'),
                },
                {
                    title: '状态',
                    dataIndex: 'status',
                    width: '8%',
                    filters: [
                        {text: '正常', value: 1},
                        {text: '禁用', value: 2},
                    ],
                    filterMultiple: false,
                    render: (text, record) => this.renderColumns(text, record, 'status'),
                },
                {
                    title: '创建人',
                    dataIndex: 'createUser',
                    width: '8%',
                    render: (text, record) => this.renderColumns(text, record, 'createUser'),
                },
                {
                    title: '创建日期',
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
                                <ItemDetails id={record.id} opStatus={this.props.opObj.select} toLoginPage={this.props.toLoginPage}/>
                                <ItemEdit id={record.id} recapture={this.getData} toLoginPage={this.props.toLoginPage} opStatus={this.props.opObj.modify}/>
                                <Popconfirm title="确认禁用?"
                                            placement="topRight"
                                            onConfirm={() => this.itemBan(record.id)}
                                            onCancel=""
                                            okType="danger"
                                            okText="立即禁用"
                                            cancelText="取消">
                                    <a style={{display: this.props.opObj.modify && record.statusCode === 1 ? "inline" : "none"}}>禁用</a>
                                </Popconfirm>
                                <Popconfirm title="确认启用?"
                                            placement="topRight"
                                            onConfirm={() => this.itemOpen(record.id)}
                                            onCancel=""
                                            okType="danger"
                                            okText="立即启用"
                                            cancelText="取消">
                                    <a style={{display: this.props.opObj.modify && record.statusCode === 2 ? "inline" : "none"}}>启用</a>
                                </Popconfirm>
                                <Popconfirm title="确认删除?"
                                            placement="topRight"
                                            onConfirm={() => this.itemDelete(record.id)}
                                            onCancel=""
                                            okType="danger"
                                            okText="立即删除"
                                            cancelText="取消">
                                    {<a style={{display: this.props.opObj.delete ? "inline" : "none"}}>删除</a>}
                                    {/*<a>删除</a>*/}
                                </Popconfirm>
                            </div>
                        );
                    },
                }]
            :
            // 机构管理员列配置
            [
                {
                    title: "序号",
                    dataIndex: "index",
                    width: 70,
                    render: (text, record) => this.renderColumns(text, record, "index"),
                },
                {
                    title: "排序",
                    dataIndex: "sort",
                    width: '10%',
                    editable: true,
                    // render: (text, record) => this.renderColumns(text, record, "sort"),
                },
                {
                    title: '姓名',
                    dataIndex: 'name',
                    width: '12%',
                    render: (text, record) => this.renderColumns(text, record, 'name'),
                },
                {
                    title: '照片',
                    dataIndex: 'photo',
                    width: '10%',
                    render: (text, record) => (
                        <div className="hove-photo-scale">
                            <img style={{width: '30px', height: "30px"}} src={record["photo"]} alt=""/>
                        </div>
                        )               
                },
                {
                    title: '昵称',
                    dataIndex: 'nickName',
                    width: '10%',
                    render: (text, record) => this.renderColumns(text, record, 'nickName'),
                },
                {
                    title: '性别',
                    dataIndex: 'gender',
                    width: '8%',
                    render: (text, record) => this.renderColumns(text, record, 'gender'),
                },
                {
                    title: '状态',
                    dataIndex: 'status',
                    width: '8%',
                    // filters: [
                    //     {text: '正常', value: 1},
                    //     {text: '禁用', value: 2},
                    // ],
                    filterMultiple: false,
                    render: (text, record) => this.renderColumns(text, record, 'status'),
                },
                {
                    title: '创建人',
                    dataIndex: 'createUser',
                    width: '10%',
                    render: (text, record) => this.renderColumns(text, record, 'createUser'),
                },
                {
                    title: '创建日期',
                    dataIndex: 'createTime',
                    width: '15%',
                    render: (text, record) => this.renderColumns(text, record, 'createTime'),
                },
                {
                    title: '操作',
                    dataIndex: '操作',
                    className: 'operating',
                    render: (text, record) => {
                        return (
                            <div className="editable-row-operations">
                                <ItemDetails id={record.id} opStatus={this.props.opObj.select} toLoginPage={this.props.toLoginPage}/>
                                <ItemEdit id={record.id} recapture={this.getData} toLoginPage={this.props.toLoginPage} opStatus={this.props.opObj.modify}/>
                                <Popconfirm title="确认删除?"
                                            placement="topRight"
                                            onConfirm={() => this.itemDelete(record.id)}
                                            onCancel=""
                                            okType="danger"
                                            okText="立即删除"
                                            cancelText="取消">
                                    {<a style={{display: this.props.opObj.delete ? "inline" : "none"}}>删除</a>}
                                    {/*<a>删除</a>*/}
                                </Popconfirm>
                            </div>
                        );
                    },
                }]
    }

    // 设置排序
    handleSort = (row) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/admin/teacher/updateSort',
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
                    this.getData();
                } else {
                    if (json.code === 901) {
                        console.log(901901);
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

    dateHandle02 = (para) => {
        const add0 = (m) => {
            return m < 10 ? '0' + m : m;
        }
        //shijianchuo是整数，否则要parseInt转换
        const time = new Date(para),
            y = time.getFullYear(),
            m = time.getMonth()+1,
            d = time.getDate();
        return y + '-' + add0(m) + '-' + add0(d);
    };

    //获取本页信息
    getData = (keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            // url: '/teacher/getTeacherList',
            url: '/admin/teacher/list',
            type: 'json',
            method: 'get',
            data: {
                status: this.props.keyword.status,
                orgName: keyword ? keyword.educationName : this.props.keyword.educationName,
                teacherName: keyword ? keyword.teacherName : this.props.keyword.teacherName,
                startTime: keyword ? keyword.startTime : this.props.keyword.startTime,
                endTime: keyword ? keyword.endTime : this.props.keyword.endTime,
                orgId: this.props.orgId,
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
            },
            success: (json) => {
                const data = [];
                if (json.result === 0) {
                    if (json.data.length === 0 && this.state.pagination.current !== 1) {
                    // if (JSON.stringify(json.data) === "{}" && this.state.pagination.current !== 1) {
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
                        let tempGender = "";
                        if (item.gender === 0) {
                            tempGender = "女"
                        }
                        if (item.gender === 1) {
                            tempGender = "男"
                        }
                        if (item.gender === 2) {
                            tempGender = "?"
                        }
                        let tempStatus = "";
                        if (item.status === 0) {
                            tempStatus = "删除"
                        }
                        if (item.status === 1) {
                            tempStatus = "正常"
                        }
                        if (item.status === 2) {
                            tempStatus = "禁用"
                        }
                        if (item.status === 3) {
                            tempStatus = "审核中"
                        }
                        if (item.status === 4) {
                            tempStatus = "审核失败"
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            index: index + 1,
                            sort: item.sort === 0 ? '' : item.sort,
                            eName: item.EName || item.eduName,
                            eduName: item.eduName,
                            photo: item.photo,
                            nickName: item.nickName,
                            name: item.name,
                            gender: tempGender,
                            statusCode: item.status,
                            status: tempStatus,
                            createUser: item.createUser,
                            createTime: item.createTime,
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
                    // 暂时不需要
                    sessionStorage.TeachersData = data;
                    sessionStorage.eduName = data[0] ? data[0].eName : '';
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

    //删除
    itemDelete = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/admin/teacher/delete?id='+ id,
            type: 'json',
            method: 'delete',
            headers: {
                Authorization: sessionStorage.token
            },            
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                });
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("教师删除成功");
                    this.getData();
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
                        });
                    }
                }
            }
        });
    };

    //禁用
    itemBan = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/teacher/checkTeacher',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: id,
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
                    message.success("教师禁用成功");
                    this.getData()
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

    //启用
    itemOpen = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/teacher/checkTeacher',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: id,
                status: 1
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("教师启用成功");
                    this.getData()
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

    //表格参数变化处理
    handleTableChange = (pagination, filters) => {
        console.log(pagination);
        if (filters.status) {
            this.props.keyword.status = filters.status[0];
        }
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        localStorage.teacherPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.teacherPageSize);
        console.log(pager)
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
        if (nextProps.keyword === this.props.keyword && nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData(nextProps.keyword);
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
                      scroll={{ x: 1500 }}
                      components={components}
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={this.state.pagination}
                      columns={columns}
                      onChange={this.handleTableChange}/>;
    }
}

class Teachers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 权限
            opObj: {},
            // 教师权限
            opObjTeacher: {},
            // 获取机构列表所需关键词
            keyword: {
                educationName: "",
                teacherName: '',
                startTime: "",
                endTime: "",
            },
            startValue: null,
            endValue: null,
            flag_add: false,
            eId: null,
            eduName: "",
        };
        this.educationName = "";
        this.teacherName = "";
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
                        opObjTeacher: data
                    })
                }
            })
        });

        // 教师权限
        JSON.parse(sessionStorage.menuListOne).forEach((item) => {
            item.children.forEach((subItem) => {
                // const fnfilter = (para) => {
                //     return  para.url === "/index/org-manage/org/teacher";
                // }
                // const tempSubItem = subItem.children.filter(fnfilter);
                subItem.children.forEach((fourthItem) => {
                    if (fourthItem.url === "/index/org-manage/org/teacher") {
                        let data = {};
                        fourthItem.children.forEach((fifthItem) => {
                            data[fifthItem.url] = true;
                        })
                        this.setState({
                            opObj: data
                        })
                    }                    
                })
            })
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
        return (startValue.valueOf() + 60*60*24*1000) > endValue.valueOf();
    };

    // 禁用结束日期之后的日期
    disabledEndDate = (endValue) => {
        const startValue = this.state.startValue;
        if (!endValue || !startValue) {
          return false;
        }
        return endValue.valueOf() <= (startValue.valueOf() + 60*60*24*1000);
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

    // 返回
    handleBack = () => {
        this.props.history.push('/index/org-manage/org');
        // this.props.histroy.go(-1);
        // this.props.history.goBack();
    };

    componentWillMount() {
        this.setPower();
        this.setState({
            eId: this.props.match.params.id,
            eduName: this.props.match.params.name,
        })
        if (this.props.location.search) {
            this.props.history.push(this.props.location.pathname)
        }
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps)
        if (nextProps.location.search) {
            console.log(nextProps.location.pathname);
            this.props.history.push(nextProps.location.pathname);
            this.setFlag();
        }
    }

    render() {
        console.log(this.state.opObj)
        return (
            <div className="teachers">
                {
                    // this.state.opObj.select ?
                        <div>
                            <Breadcrumb separator=">" style={{marginBottom: "15px"}}>
                                <Breadcrumb.Item>教师管理</Breadcrumb.Item>
                                <Breadcrumb.Item>{this.state.eduName}</Breadcrumb.Item>                         
                            </Breadcrumb>
                            <div>
                                <header className="clearfix" style={{position: "relative"}}>
                                    <div className="coursesBack">
                                        <Button onClick={this.handleBack}><Icon type="left"/>返回</Button>
                                    </div>
                                    <div>
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
                                        <Button 
                                            style={{
                                                display: Number(sessionStorage.EId) === 0 ? "block" : "none",
                                                marginRight: "20px",
                                            }}
                                            type="primary"
                                            onClick={() => this.search(0)}>
                                            <Icon type="search" style={{fontSize: "16px"}}/>
                                        </Button>
                                        <Search 
                                            placeholder="请输入教师姓名信息"
                                            onSearch={(value) => this.search(1, value)}
                                            enterButton
                                            style={{
                                                display: Number(sessionStorage.EId) !== 0 ? "block" : "none",
                                                width: "320px",
                                                float: "left"
                                            }}
                                        />
                                        {/*教师创建日期筛选*/}
                                        <span>日期筛选： </span>
                                        <DatePicker placeholder="请选择开始日期"
                                                    style={{width: "150px"}}
                                                    disabledDate={this.disabledStartDate}
                                                    onChange={this.setStartTime}/>
                                        <span style={{margin: "0 10px"}}>至</span>
                                        <DatePicker placeholder="请选择结束日期"
                                                    style={{width: "150px"}}
                                                    disabledDate={this.disabledEndDate}
                                                    onChange={this.setEndTime}/>
                                    </div>
                                    <div>
                                        {/*教师添加*/}           
                                        <div className="add-button" style={{float: "right"}}>
                                            <ItemAdd 
                                                // opStatus={this.state.opObj.add && Number(sessionStorage.EId) !== 0}
                                                opStatus={this.state.opObj.add}
                                                orgId={this.state.eId}
                                                toLoginPage={this.toLoginPage} 
                                                setFlag={this.setFlag}/>
                                        </div>
                                    </div>
                                </header>
                                <div className="table-box">
                                    <DataTable 
                                        opObj={this.state.opObj} 
                                        keyword={this.state.keyword}
                                        orgId={this.state.eId}
                                        flag_add={this.state.flag_add} 
                                        toLoginPage={this.toLoginPage}
                                        />
                                </div>
                            </div>  
                        </div>
                        // :
                        // <p>暂无查询权限</p>
                }
            </div>
        )
    }
}

export default Teachers;