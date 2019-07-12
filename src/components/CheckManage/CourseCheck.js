import React, {Component} from 'react';
import {
    Tabs,
    Table,
    Input,
    Button,
    Modal,
    Form,
    Select,
    Upload,
    Icon,
    message,
    Slider,
    Row,
    Col,
    List,
    Radio,
    InputNumber,
    Popconfirm,
    Cascader,
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
    wrapperCol: {span: 8},
};
const formItemLayout_10 = {
    labelCol: {span: 4},
    wrapperCol: {span: 10},
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

//课程信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, itemStatus, data, courseType, setCourseType, subjectList, studentTypeList, studentType, setStudentType, studentLevelList, viewPic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoList, setPhotoList, photoLoading, lessonList, fn_lesson, characteristicList, fn_characteristic, saveLoading, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 已上传图片列表
        const photoExist = [];
        photoList.forEach((item, index) => {
            photoExist.push(
                <div className="photoExist-item clearfix" key={index + 1}>
                    <img src={"http://image.taoerxue.com/" + item} alt=""/>
                    <div className="remove">
                        <Button type="dashed" shape="circle"
                                icon="minus" onClick={() => setPhotoList(index)}/>
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
        const setEditorRef = (editor) => this.editor = editor;
        const beforeUpload = (file) => {
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
                setViewPic(imageUrl);
            });
            return false
        };
        const picHandle = () => {
            if (viewPic) {
                const canvas = this.editor.getImage();
                const url = canvas.toDataURL("image/jpeg", 0.92);
                const file = dataURLtoFile(url);
                picUpload(file)
            } else {
                message.error("图片未选择");
            }
        };
        const uploadButton = (
            <div>
                <Icon type={'plus'}/>
                <div className="ant-upload-text" style={{display: viewPic ? "none" : "block"}}>选择图片</div>
            </div>
        );
        const partImg = (
            <AvatarEditor
                ref={setEditorRef}
                image={viewPic}
                width={180}
                height={100}
                border={0}
                color={[255, 255, 255, 0.6]}
                scale={avatarEditor.scale}
                position={{x: avatarEditor.positionX, y: avatarEditor.positionY}}
                rotate={0}
            />
        );

        //科目选项生成
        const subjectOptions = [];
        subjectList.forEach((item) => {
            let children = [];
            item.list.forEach((subItem) => {
                children.push({value: subItem.id, label: subItem.name})
            });
            subjectOptions.push({value: item.id, label: item.name, children: children});
        });

        //适合年龄选项生成
        const optionsOfStudentAge = [];
        studentTypeList.forEach((item, index) => {
            optionsOfStudentAge.push(<Option key={index + 1} value={item.name}>{item.name}</Option>)
        });

        //适合基础选项生成
        const optionsOfStudentLevel = [];
        studentLevelList.forEach((item, index) => {
            optionsOfStudentLevel.push(<Option key={index + 1} value={item.id}>{item.name}</Option>)
        });

        //课时
        const lessonItems = [];
        const fnFilterSubItems = (para) => {
            return para.flag === true
        };
        const lessonItemsVisible = lessonList.filter(fnFilterSubItems);
        lessonItemsVisible.forEach((item, index) => {
            lessonItems.push(
                <FormItem className={"subItem" + (index + 1) + " subItem longItem unnecessary"} {...formItemLayout_14}
                          label={index === 0 ? "课时安排：" : ""}
                          key={item.index}>
                    {getFieldDecorator('subItem' + item.index, {
                        rules: [{
                            required: false,
                            max: 18,
                            pattern: /^[^@]+$/g,
                            message: "请按要求填写课时名称",
                        }]
                    })(
                        <div className="course-subItem-box">
                            <Input placeholder={"请输入课时名称（18字以内）"}
                                   defaultValue={item.value}
                                   onBlur={(event) => fn_lesson(item.index, event.target.value)}
                                   style={{width: "80%", marginRight: "10px"}}/>
                            <Button
                                type="dashed"
                                size="small"
                                onClick={() => fn_lesson(item.index)}
                                icon="minus"
                            >
                            </Button>
                        </div>
                    )}
                </FormItem>
            );
        });
        lessonItems.push(
            <FormItem
                className={lessonItemsVisible.length === 0 ? "subItemsAddButton subItemsAddButtonInit unnecessary" : "subItemsAddButton subItemsAddButtonChanged unnecessary"}
                {...formItemLayout_14}
                label={lessonItemsVisible.length === 0 ? "课时安排：" : ""}
                key="subItemsAddButton">
                {getFieldDecorator('subItemsAddButton', {
                    rules: [{
                        required: false
                    }]
                })(
                    <div className="course-subItem-box">
                        <Button
                            type="dashed"
                            size="small"
                            onClick={() => fn_lesson()}
                            icon="plus"
                        >
                            添加课时
                        </Button>
                    </div>
                )}
            </FormItem>
        );

        //课程特色
        const characteristicItems = [];
        characteristicList.forEach((item, index) => {
            // 课程特色列表项生成
            characteristicItems.push(
                <FormItem
                    className={"characteristic" + (index + 1) + " characteristic longItem"} {...formItemLayout_14}
                    label={index === 0 ? "课程特色：" : ""}
                    key={item.index}>
                    {getFieldDecorator('characteristic' + item.index, {
                        initialValue: item.value,
                        rules: [{
                            required: true,
                            pattern: /^[^@]+$/g,
                            message: "请按要求填写课程特色",
                        }]
                    })(
                        <div className="course-characteristic-box">
                            <Input placeholder={"请输入课程特色（不能包含@等特殊字符）"}
                                   defaultValue={item.value}
                                   onBlur={(event) => fn_characteristic(index, event.target.value)}
                                   style={{width: "85%", marginRight: "10px"}}/>
                            <Button
                                type="dashed"
                                size="small"
                                onClick={() => fn_characteristic(index)}
                                icon="minus"
                                style={{display: characteristicList.length <= 1 ? "none" : "inline"}}
                            >
                            </Button>
                        </div>
                    )}
                </FormItem>
            );
        });
        // 添加按钮
        characteristicItems.push(
            <FormItem
                className={characteristicList.length === 0 ? "characteristicAddButton characteristicAddButtonInit longItem" : "characteristicAddButton characteristicAddButtonChanged longItem"}
                {...formItemLayout_14}
                label={characteristicList.length === 0 ? "课程特色：" : ""}
                key="characteristicAddButton">
                {getFieldDecorator('characteristicAddButton', {
                    rules: [{
                        required: characteristicList.length === 0,
                        message: "课程特色不能少于1条",
                    }]
                })(
                    <div className="course-characteristic-box">
                        <Button
                            type="dashed"
                            size="small"
                            onClick={() => fn_characteristic()}
                            icon="plus"
                        >
                            添加课程特色
                        </Button>
                    </div>
                )}
            </FormItem>
        );

        return (
            <Modal
                visible={visible}
                title="课程编辑"
                width={650}
                onCancel={onCancel}
                footer={[
                    <Button key="back" onClick={onCancel} disabled={saveLoading || confirmLoading}>取消</Button>,
                    <Button key="save01" type="primary" loading={saveLoading} disabled={confirmLoading}
                            onClick={() => onCreate(1)}
                            style={{display: itemStatus === 5 ? "inline" : "none"}}>暂存</Button>,
                    <Button key="save02" type="primary" loading={saveLoading} disabled={confirmLoading}
                            onClick={() => onCreate(2)}
                            style={{display: itemStatus !== 5 ? "inline" : "none"}}>保存</Button>,
                    <Button key="submit" type="primary" loading={confirmLoading} disabled={saveLoading}
                            onClick={() => onCreate(3)}
                            style={{display: itemStatus !== 1 ? "inline" : "none"}}>保存并提交</Button>
                ]}
                destroyOnClose={true}
            >
                {
                    JSON.stringify(data) === "{}" ?
                        <div className="spin-box">
                            <Spin/>
                        </div>
                        :
                        <div className="course-edit course-form item-form">
                            <Form layout="vertical">
                                <FormItem className="name longItem" {...formItemLayout_14} label="课程名称：">
                                    {getFieldDecorator('name', {
                                        initialValue: data.name,
                                        rules: [{
                                            required: true,
                                            max: 30,
                                            message: '请按要求填写课程名称',
                                        }],
                                    })(
                                        <Input placeholder="请输入课程名称（30字以内）"/>
                                    )}
                                </FormItem>
                                <FormItem
                                    className="courseType" {...formItemLayout_10}
                                    label="课程类型：">
                                    {getFieldDecorator('courseType', {
                                        initialValue: data.courseType,
                                        rules: [{
                                            required: true,
                                            message: '请选择课程类型',
                                        }],
                                    })(
                                        <RadioGroup onChange={(e) => {
                                            setCourseType(e.target.value)
                                        }}>
                                            <Radio value={0}>线下正式课</Radio>
                                            {/*<Radio value={1}>视频课程</Radio>*/}
                                            <Radio value={2}>线下体验课</Radio>
                                        </RadioGroup>
                                    )}
                                </FormItem>
                                <FormItem className="photo" {...formItemLayout_14} label="课程图片：">
                                    {getFieldDecorator('photo', {
                                        initialValue: photoList[0],
                                        rules: [{
                                            required: true,
                                            message: '课程图片不能为空',
                                        }],
                                    })(
                                        <div className="itemBox">
                                            {photoExist}
                                            <Upload
                                                name="file"
                                                listType="picture-card"
                                                className="avatar-uploader"
                                                showUploadList={false}
                                                action="/file/upload"
                                                beforeUpload={beforeUpload}
                                            >
                                                {viewPic ? partImg : uploadButton}
                                                <p className="hint">（可上传1-5张图片）</p>
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
                                                    }}>
                                                图片提交
                                            </Button>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem className="typeId" {...formItemLayout_8} label="所属科目：">
                                    {getFieldDecorator('typeId', {
                                        initialValue: data.typeId?[data.parentTypeId, data.typeId]:"",
                                        rules: [{
                                            required: true,
                                            message: '科目不能为空',
                                        }],
                                    })(
                                        <Cascader options={subjectOptions} placeholder="请选择所属教学科目"/>
                                    )}
                                </FormItem>
                                <FormItem className="studentType longItem" {...formItemLayout_16} label="适合年龄：">
                                    {getFieldDecorator('studentType', {
                                        rules: [{
                                            required: false,
                                        }],
                                    })(
                                        <div>
                                            <Select
                                                value={studentType.str || undefined}
                                                style={{float: "left", width: "195px"}}
                                                placeholder="请选择适合年龄段"
                                                onChange={(value) => setStudentType(1, value)}
                                            >
                                                {optionsOfStudentAge}
                                            </Select>
                                            <span style={{float: "left", margin: "6px 10px 0"}}>或</span>
                                            <div style={{float: "left", marginTop: "4px"}}>
                                                <InputNumber
                                                    value={studentType.ageOne} size="small"
                                                    style={{width: "50px"}} min={0} max={18} precision={0}
                                                    step={1}
                                                    onChange={(value) => setStudentType(2, value)}/>
                                                至
                                                <InputNumber
                                                    value={studentType.ageTwo} size="small" style={{width: "50px"}}
                                                    min={0}
                                                    max={18} precision={0} step={1}
                                                    onChange={(value) => setStudentType(3, value)}/>
                                                岁
                                            </div>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem className="studentLevelId" {...formItemLayout_8} label="适合基础：">
                                    {getFieldDecorator('studentLevelId', {
                                        initialValue: data.studentLevelId,
                                        rules: [{
                                            required: true,
                                            message: '请选择适合基础',
                                        }],
                                    })(
                                        <Select
                                            style={{width: '100%'}}
                                            placeholder="请选择适合基础"
                                        >
                                            {optionsOfStudentLevel}
                                        </Select>
                                    )}
                                </FormItem>
                                <FormItem
                                    className={courseType === 2 ? "number itemNone" : "number"} {...formItemLayout_8}
                                    label="开班人数：">
                                    {getFieldDecorator('number', {
                                        initialValue: data.number,
                                        rules: [{
                                            required: courseType !== 2,
                                            message: '开班人数不能为空',
                                        }],
                                    })(
                                        <InputNumber min={0} precision={0} step={1}/>
                                    )}
                                </FormItem>
                                <FormItem className="duration" {...formItemLayout_8} label="单节时长：">
                                    {getFieldDecorator('duration', {
                                        initialValue: data.duration,
                                        rules: [{
                                            required: true,
                                            message: '单节时常不能为空',
                                        }],
                                    })(
                                        <InputNumber placeholder="单节分钟数" min={1} precision={0} step={1}
                                                     style={{width: "120px"}}/>
                                    )}
                                </FormItem>
                                <FormItem className="count" {...formItemLayout_8} label="课时数：">
                                    {getFieldDecorator('count', {
                                        initialValue: data.count,
                                        rules: [{
                                            required: true,
                                            message: '课时数不能为空',
                                        }],
                                    })(
                                        <InputNumber min={0} precision={0} step={1}/>
                                    )}
                                </FormItem>
                                {/*课程课时项*/}
                                {lessonItems}
                                <p className="lessonHint">注：课时名称不能包含@等特殊字符</p>
                                <FormItem className="target longItem" {...formItemLayout_14} label="学习目标：">
                                    {getFieldDecorator('target', {
                                        initialValue: data.target,
                                        rules: [{
                                            required: true,
                                            message: '学习目标不能为空',
                                        }],
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写学习目标" autosize={{minRows: 3, maxRows: 10}}/>
                                    )}
                                </FormItem>
                                {/*课程特色项*/}
                                {characteristicItems}
                                <FormItem className="sketch longItem" {...formItemLayout_14} label="课程简介：">
                                    {getFieldDecorator('sketch', {
                                        initialValue: data.sketch,
                                        rules: [{
                                            required: true,
                                            message: '课程简介不能为空',
                                        }],
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写课程简介" rows={10}/>
                                    )}
                                </FormItem>
                                <FormItem className="originalPrice" {...formItemLayout_8} label="课程原价：">
                                    {getFieldDecorator('originalPrice', {
                                        initialValue: data.originalPrice,
                                        rules: [{
                                            required: true,
                                            message: '课程原价不能为空',
                                        }],
                                    })(
                                        <InputNumber min={0} precision={2} step={100}/>
                                    )}
                                </FormItem>
                                <FormItem className="price" {...formItemLayout_8} label="课程现价：">
                                    {getFieldDecorator('price', {
                                        initialValue: data.price,
                                        rules: [{
                                            required: true,
                                            message: '课程现价不能为空',
                                        }],
                                    })(
                                        <InputNumber min={0} precision={2} step={100}/>
                                    )}
                                </FormItem>
                                <FormItem className="tips longItem" {...formItemLayout_14} label="购买须知：">
                                    {getFieldDecorator('tips', {
                                        initialValue: data.tips,
                                        rules: [{
                                            required: true,
                                            message: "购买须知不能为空"
                                        }],
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写课程购买须知" autosize={{minRows: 5, maxRows: 10}}/>
                                    )}
                                </FormItem>
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

//课程信息编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,
        // 课程基本信息
        data: {},
        // 课程类型
        courseType: null,
        // 课程图片相关变量
        viewPic: "",
        photoList: [],
        avatarEditor: {
            scale: 1,
            positionX: 0.5,
            positionY: 0.5
        },
        photoLoading: false,
        // 科目列表
        subjectList: [],
        // 适合年龄列表
        studentTypeList: [],
        // 当前适合年龄字段信息
        studentType: {
            str: "",
            ageOne: null,
            ageTwo: null
        },
        // 适合基础列表
        studentLevelList: [],
        // 初始课时列表
        lessonListInit: [],
        // 当前课时列表
        lessonList: [],
        // 课程特色列表
        characteristicList: [{index: 1, value: ""}],
        saveLoading: false,
        confirmLoading: false
    };

    // 获取课程基本信息
    getData = () => {
        reqwest({
            url: '/course/getDetail',
            type: 'json',
            method: 'post',
            data: {
                courseId: this.props.id
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         courseInfo: {
                //             address: "",
                //             areaId: null,
                //             areaName: "",
                //             street: "",
                //             characteristic: "001@002@003",
                //             cityId: null,
                //             cityName: "",
                //             count: 1,
                //             courseType: 0,
                //             number: 1,
                //             createTime: "",
                //             duration: 1,
                //             lat: "",
                //             lng: "",
                //             name: "1",
                //             parentTypeId: 1,
                //             parentTypeName: "",
                //             photo: "1",
                //             photo2: "",
                //             photo3: "",
                //             photo4: "",
                //             photo5: "",
                //             originalPrice: "1",
                //             price: "1",
                //             provinceId: null,
                //             provinceName: "",
                //             status: null,
                //             studentLevelId: 2,
                //             studentLevelName: "",
                //             studentTypeIds: "2",
                //             submitTime: "",
                //             target: "1",
                //             sketch: "1",
                //             throughTime: "",
                //             typeId: 11,
                //             typeName: "",
                //             updateTime: "",
                //             tips: "1"
                //         }
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    // 已有机构图片写入
                    const photoList = [];
                    if (json.data.courseInfo.photo && json.data.courseInfo.photo !== "0") {
                        photoList.push(json.data.courseInfo.photo)
                    } else {
                        json.data.courseInfo.photo = 0;
                    }
                    if (json.data.courseInfo.photo2 && json.data.courseInfo.photo2 !== "0") {
                        photoList.push(json.data.courseInfo.photo2)
                    } else {
                        json.data.courseInfo.photo2 = 0;
                    }
                    if (json.data.courseInfo.photo3 && json.data.courseInfo.photo3 !== "0") {
                        photoList.push(json.data.courseInfo.photo3)
                    } else {
                        json.data.courseInfo.photo3 = 0
                    }
                    if (json.data.courseInfo.photo4 && json.data.courseInfo.photo4 !== "0") {
                        photoList.push(json.data.courseInfo.photo4)
                    } else {
                        json.data.courseInfo.photo4 = 0
                    }
                    if (json.data.courseInfo.photo5 && json.data.courseInfo.photo5 !== "0") {
                        photoList.push(json.data.courseInfo.photo5)
                    } else {
                        json.data.courseInfo.photo5 = 0
                    }
                    // 适合年龄字段为空处理
                    if (!json.data.courseInfo.studentTypeIds) {
                        json.data.courseInfo.studentTypeIds = ""
                    }
                    // 已有课程特色项写入
                    let tempCharacteristic = [];
                    if (json.data.courseInfo.characteristic) {
                        json.data.courseInfo.characteristic.split("@").forEach((item, index) => {
                            tempCharacteristic.push({index: index + 1, value: item});
                        });
                    } else {
                        tempCharacteristic = this.state.characteristicList
                    }
                    // 信息写入
                    this.setState({
                        data: json.data.courseInfo,
                        courseType: json.data.courseInfo.courseType,
                        photoList: photoList,
                        characteristicList: tempCharacteristic,
                    }, () => {
                        // 基本信息写入后，获取适合年龄与适合基础列表，写入studentType
                        this.getStudentTypeAndLevelList();
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

    // 获取科目列表
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
                //             name: "01",
                //             list: [
                //                 {id: 11, name: "0101"},
                //             ]
                //         },
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        subjectList: json.data
                    })
                }
            }
        });
    };

    // 获取适合年龄与适合基础列表，写入studentType
    getStudentTypeAndLevelList = () => {
        reqwest({
            url: '/course/getTypeAndBasics',
            type: 'json',
            method: 'post',
            data: {
                eId: this.props.eId
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         studentTypeList: [
                //             {id: 1, name: "01"},
                //             {id: 2, name: "02"},
                //             {id: 3, name: "03"},
                //         ],
                //         studentLevelList: [
                //             {id: 1, name: "01"},
                //             {id: 2, name: "02"},
                //             {id: 3, name: "03"},
                //         ],
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    let studentTypeName = "";
                    const fnFilter = (para) => {
                        return para.id === Number(this.state.data.studentTypeIds)
                    };
                    if (json.data.studentTypeList.filter(fnFilter)[0]) {
                        studentTypeName = json.data.studentTypeList.filter(fnFilter)[0].name;
                    }
                    this.setState({
                        studentTypeList: json.data.studentTypeList,
                        studentType: {
                            str: studentTypeName,
                            ageOne: null,
                            ageTwo: null
                        },
                        studentLevelList: json.data.studentLevelList,
                    })
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
                // const json = {
                //     result: 0,
                //     data: [
                //         {id: 1, lessonName: "001"},
                //         {id: 2, lessonName: "002"},
                //         {id: 3, lessonName: "003"},
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    let dataInit = [];
                    let data = [];
                    if (json.data.length) {
                        json.data.forEach((item, index) => {
                            dataInit.push(item.id + "@" + item.lessonName);
                            data.push({index: index + 1, id: item.id, value: item.lessonName, flag: true});
                        });
                    }
                    this.setState({
                        lessonListInit: dataInit,
                        lessonList: data
                    })
                }
            }
        });
    };

    showModal = () => {
        this.getData();
        this.getSubjectList();
        this.getLessonList();
        this.setState({visible: true})
    };

    // 课程类型设置
    setCourseType = (value) => {
        this.setState({
            courseType: value
        })
    };

    // 图片处理
    getBase64Image = (url, width, height) => {//width、height调用时传入具体像素值，控制大小 ,不传则默认图像大小
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
                viewPic: dataURL,
                effectPic: dataURL,
            })
        };
    };
    setViewPic = (para) => {
        this.setState({
            viewPic: para
        })
    };
    setAvatarEditor = (index, value) => {
        if (this.state.viewPic.slice(26) === this.state.data_pic) {
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
    picUpload = (para) => {
        if (this.state.photoList.length >= 5) {
            message.error("图片最多上传5张");
            return
        } else {
            const formData = new FormData();
            formData.append("file", para);
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
                        photoLoading: false,
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("图片提交成功");
                        let photoList = this.state.photoList;
                        photoList.push(json.data.url);
                        this.setState({
                            photoList: photoList,
                            viewPic: "",
                            avatarEditor: {
                                scale: 1,
                                positionX: 0.5,
                                positionY: 0.5
                            },
                            photoLoading: false,
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
        }
    };
    // 图片删除
    setPhotoList = (index) => {
        let data = this.state.photoList;
        data.splice(index, 1);
        this.setState({
            photoList: data
        })
    };

    // 适合年龄字段有效信息写入
    setStudentType = (type, value) => {
        // 分支1，适合年龄字符串信息写入
        if (type === 1) {
            this.setState({
                studentType: {
                    str: value,
                    ageOne: null,
                    ageTwo: null
                }
            })
        }
        // 分支2：年龄下限写入
        if (type === 2) {
            this.setState({
                studentType: {
                    str: (value || value === 0) ? "" : this.state.studentType.str,
                    ageOne: value,
                    ageTwo: this.state.studentType.ageTwo
                }
            })
        }
        // 年龄上限写入
        if (type === 3) {
            this.setState({
                studentType: {
                    str: (value || value === 0) ? "" : this.state.studentType.str,
                    ageOne: this.state.studentType.ageOne,
                    ageTwo: value
                }
            })
        }
    };

    // 课时字段处理
    fn_lesson = (index, value) => {
        const tempItems = this.state.lessonList;
        if (index === undefined) {
            // 索引为空，进入新增分支
            tempItems.push({
                index: tempItems.length ? (tempItems[tempItems.length - 1].index + 1) : 1,
                id: 0,
                value: "",
                flag: true
            });
            this.setState({
                lessonList: tempItems
            })
        } else {
            // 索引不为空
            tempItems.forEach((item, itemIndex) => {
                if (item.index === index) {
                    index = itemIndex
                }
            });
            if (value === undefined) {
                // value为空，进入删除分支
                if (tempItems[index].id) {
                    tempItems[index].flag = false;
                    tempItems[index].value = "";
                } else {
                    tempItems.splice(index, 1);
                }
                this.setState({
                    lessonList: tempItems
                })
            } else {
                // value不为空，进入value修改分支
                tempItems[index].value = value;
                this.setState({
                    lessonList: tempItems
                })
            }
        }
    };

    // 课程特色字段处理
    fn_characteristic = (index, value) => {
        if (index === undefined) {
            // 列表项新增分支
            const tempPara = this.state.characteristicList;
            tempPara.push({index: tempPara.length ? (tempPara[tempPara.length - 1].index + 1) : 1, value: ""});
            this.setState({
                characteristicList: tempPara
            })
        } else {
            if (value === undefined) {
                // 列表项删除分支
                const tempPara = this.state.characteristicList;
                tempPara.splice(index, 1);
                this.setState({
                    characteristicList: tempPara
                })
            } else {
                // 列表项修改分支
                const tempPara = this.state.characteristicList;
                tempPara[index].value = value;
                this.setState({
                    characteristicList: tempPara
                })
            }
        }
    };

    // 信息比对函数
    dataContrast = (values) => {
        const initValues = this.state.data;
        // 待比对常规项
        const itemList = ["name", "courseType", "photo", "photo2", "photo3", "photo4", "photo5", "typeId", "studentLevelId", "count", "number", "duration", "originalPrice", "price", "target", "characteristic", "sketch", "tips"];
        const result = {};

        // 常规项比对
        itemList.forEach((item) => {
            if (values[item] !== initValues[item]) {
                result[item] = values[item];
            }
        });
        // 课程适合年龄项比对--------------------------------------
        // suitAge存在则suitAge写入result
        if (values.suitAge) {
            result.suitAge = values.suitAge
        }else{
            // suitAge不存在则进行studentType判断
            // 有变化则studentType写入result
            if (String(values.studentType) !== initValues.studentTypeIds) {
                result.studentType = values.studentType;
            }
        }
        // 课程课时项比对------------------------------------------
        values.lessonName.forEach((item, index) => {
            if (item !== this.state.lessonListInit[index]) {
                result.lessonName = values.lessonName
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

    // 取消处理
    handleCancel = () => {
        const form = this.form;
        // 取消操作函数
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
                    data: {},
                    courseType: null,
                    viewPic: "",
                    photoList: [],
                    avatarEditor: {
                        scale: 1,
                        positionX: 0.5,
                        positionY: 0.5
                    },
                    photoLoading: false,
                    subjectList: [],
                    studentTypeList: [],
                    studentType: {
                        str: "",
                        ageOne: null,
                        ageTwo: null
                    },
                    studentLevelList: [],
                    lessonListInit: [],
                    lessonList: [],
                    characteristicList: [{index: 1, value: ""}],
                    saveLoading: false,
                    confirmLoading: false,
                });
            })
        };
        // 课程基本信息为空的处理
        if (JSON.stringify(this.state.data) === "{}") {
            cancel();
            return;
        }
        // 获取表单数据
        let values = form.getFieldsValue();
        // 课程图片写入
        values.photo = this.state.photoList[0] || 0;
        values.photo2 = this.state.photoList[1] || 0;
        values.photo3 = this.state.photoList[2] || 0;
        values.photo4 = this.state.photoList[3] || 0;
        values.photo5 = this.state.photoList[4] || 0;
        // 课程typeId写入(二级科目id写入)
        values.typeId = values.typeId[1];
        // 适合年龄写入-------------------------------------
        // studentType写入
        values.studentType = "";
        if (this.state.studentType.str) {
            // str存在，则写入studentType
            values.studentType = this.state.studentType.str
        } else {
            // str不存在，且ageOne与ageTwo至少一项有值则写入ageOne与ageTwo拼接后的信息
            if (this.state.studentType.ageOne || this.state.studentType.ageOne === 0 || this.state.studentType.ageTwo || this.state.studentType.ageTwo === 0) {
                values.studentType = this.state.studentType.ageOne + "-" + this.state.studentType.ageTwo + "岁"
            }
        }
        // 校验studentType是否已存在于studentTypeList中，是则以id替换文本，studentType数据类型由string变更为number
        this.state.studentTypeList.forEach((item) => {
            if (item.name === values.studentType) {
                values.studentType = item.id
            }
        });
        // studentType不存在于studentTypeList中，则将studentType的值写入suitAge并清空studentType
        if (values.studentType && (typeof(values.studentType) === "string")) {
            values.suitAge = values.studentType;
            values.studentType = ""
        }
        // 课程课时写入-------------------------------------
        const lessonList = [];
        this.state.lessonList.forEach((item) => {
            if (item.id) {
                // id存在，为修改或删除项
                lessonList.push(item.id + "@" + item.value);
            } else {
                // id不存在，为新增项
                lessonList.push(item.value);
            }
        });
        values.lessonName = lessonList;
        // 课程特色写入-------------------------------------
        let characteristic = "";
        this.state.characteristicList.forEach((item) => {
            if (!item.value) {
                return;
            }
            characteristic += (item.value + "@");
        });
        values.characteristic = characteristic.slice(0, -1);
        // 信息比对
        const result = this.dataContrast(values);
        // 比对结果处理
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
    };

    // 确认处理
    handleCreate = (type) => {
        // 课程基本信息为空的处理
        if (JSON.stringify(this.state.data) === "{}") {
            return;
        }
        const form = this.form;
        // 部分录入保存操作
        if (type === 1) {
            // 获取表单数据
            let values = form.getFieldsValue();
            // 空值处理
            if (!values.name) {
                message.error("课程名称不能为空");
                return
            }
            // 课程图片写入
            values.photo = this.state.photoList[0] || 0;
            values.photo2 = this.state.photoList[1] || 0;
            values.photo3 = this.state.photoList[2] || 0;
            values.photo4 = this.state.photoList[3] || 0;
            values.photo5 = this.state.photoList[4] || 0;
            // 课程typeId写入(二级科目id写入)
            values.typeId = values.typeId[1];
            // 适合年龄写入------------------------------------
            values.studentType = "";
            if (this.state.studentType.str) {
                // str存在，则写入studentType
                values.studentType = this.state.studentType.str
            } else {
                // str不存在的分支操作
                if (this.state.studentType.ageOne || this.state.studentType.ageOne === 0) {
                    if (this.state.studentType.ageTwo || this.state.studentType.ageTwo === 0) {
                        if (this.state.studentType.ageOne >= this.state.studentType.ageTwo) {
                            message.error("适合年龄区间有误");
                            return;
                        }
                        values.studentType = this.state.studentType.ageOne + "-" + this.state.studentType.ageTwo + "岁"
                    } else {
                        message.error("适合年龄区间有误");
                        return;
                    }
                } else {
                    if (this.state.studentType.ageTwo || this.state.studentType.ageTwo === 0) {
                        message.error("适合年龄区间有误");
                        return;
                    }
                }
            }
            // 校验studentType是否已存在于studentTypeList中，是则以id替换文本，studentType数据类型由string变更为number
            this.state.studentTypeList.forEach((item) => {
                if (item.name === values.studentType) {
                    values.studentType = item.id
                }
            });
            // studentType不存在于studentTypeList中，则将studentType的值写入suitAge并清空studentType
            if (values.studentType && (typeof(values.studentType) === "string")) {
                values.suitAge = values.studentType;
                values.studentType = ""
            }
            // 课程课时写入----------------------------------------------------------------------------------------------
            let lessonFlag = true;
            const lessonListChecked = [];
            const lessonList = [];
            this.state.lessonList.forEach((item) => {
                lessonListChecked.push("subItem" + item.index);
                if (item.id) {
                    // id存在，为修改或删除项
                    lessonList.push(item.id + "@" + item.value);
                } else {
                    // id不存在，为新增项
                    if (item.value) {
                        lessonList.push(item.value);
                    }
                }
            });
            // 课时字段合法性校验
            form.validateFieldsAndScroll(lessonListChecked, (err) => {
                if(err){
                    lessonFlag = false
                }
            });
            if (lessonFlag) {
                // 合法则写入
                values.lessonName = lessonList;
            } else {
                // 不合法直接return
                return
            }
            // 课程特色写入----------------------------------------------------------------------------------------------
            let characteristicFlag = true;
            let characteristic = "";
            this.state.characteristicList.forEach((item) => {
                if (!item.value) {
                    return;
                }
                if (item.value.indexOf("@") === -1) {
                    characteristic += (item.value + "@");
                } else {
                    characteristicFlag = false
                }
            });
            if (characteristicFlag) {
                values.characteristic = characteristic.slice(0, -1);
            } else {
                message.error("请按要求填写课程特色");
                return
            }
            // 信息比对
            const result = this.dataContrast(values);
            if (!result) {
                message.error("暂无信息更改");
                return;
            }
            this.setState({
                saveLoading: true
            });
            reqwest({
                url: '/course/edit',
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
                        message.success("课程信息修改成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                data: {},
                                courseType: null,
                                viewPic: "",
                                photoList: [],
                                avatarEditor: {
                                    scale: 1,
                                    positionX: 0.5,
                                    positionY: 0.5
                                },
                                photoLoading: false,
                                subjectList: [],
                                studentTypeList: [],
                                studentType: {
                                    str: "",
                                    ageOne: null,
                                    ageTwo: null
                                },
                                studentLevelList: [],
                                lessonListInit: [],
                                lessonList: [],
                                characteristicList: [{index: 1, value: ""}],
                                saveLoading: false,
                                confirmLoading: false,
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
                                saveLoading: false
                            })
                        }
                    }
                }
            })
        }
        // 完全录入保存操作
        if (type === 2) {
            // 获取表单数据并进行必填项校验
            form.validateFieldsAndScroll((err, values) => {
                if (err) {
                    return;
                }
                // 课程图片写入与校验
                values.photo = this.state.photoList[0] || 0;
                values.photo2 = this.state.photoList[1] || 0;
                values.photo3 = this.state.photoList[2] || 0;
                values.photo4 = this.state.photoList[3] || 0;
                values.photo5 = this.state.photoList[4] || 0;
                if (!values.photo) {
                    message.error("课程图片未选择或未提交");
                    return
                }
                // 课程typeId写入(二级科目id写入)
                values.typeId = values.typeId[1];
                // 适合年龄写入------------------------------------
                values.studentType = "";
                if (this.state.studentType.str) {
                    // str存在，则写入studentType
                    values.studentType = this.state.studentType.str
                } else {
                    // str不存在的分支操作
                    if (this.state.studentType.ageOne || this.state.studentType.ageOne === 0) {
                        if (this.state.studentType.ageTwo || this.state.studentType.ageTwo === 0) {
                            if (this.state.studentType.ageOne >= this.state.studentType.ageTwo) {
                                message.error("适合年龄区间有误");
                                return;
                            }
                            values.studentType = this.state.studentType.ageOne + "-" + this.state.studentType.ageTwo + "岁"
                        } else {
                            message.error("适合年龄区间有误");
                            return;
                        }
                    } else {
                        if (this.state.studentType.ageTwo || this.state.studentType.ageTwo === 0) {
                            message.error("适合年龄区间有误");
                            return;
                        }
                    }
                }
                if (!values.studentType) {
                    message.error("适合年龄不能为空");
                    return;
                }
                // 校验studentType是否已存在于studentTypeList中，是则以id替换文本，studentType数据类型由string变更为number
                this.state.studentTypeList.forEach((item) => {
                    if (item.name === values.studentType) {
                        values.studentType = item.id
                    }
                });
                // studentType不存在于studentTypeList中，则将studentType的值写入suitAge并清空studentType
                if (values.studentType && (typeof(values.studentType) === "string")) {
                    values.suitAge = values.studentType;
                    values.studentType = ""
                }
                // 课程课时写入---------------------------------------
                const lessonList = [];
                this.state.lessonList.forEach((item) => {
                    if (item.id) {
                        // id存在，为修改或删除项
                        lessonList.push(item.id + "@" + item.value);
                    } else {
                        // id不存在，为新增项
                        lessonList.push(item.value);
                    }
                });
                values.lessonName = lessonList;
                // 课程特色写入---------------------------------------
                let characteristic = "";
                this.state.characteristicList.forEach((item) => {
                    if (!item.value) {
                        return;
                    }
                    characteristic += (item.value + "@");
                });
                values.characteristic = characteristic.slice(0, -1);
                // 信息比对
                const result = this.dataContrast(values);
                if (!result) {
                    message.error("暂无信息更改");
                    return;
                }
                this.setState({
                    confirmLoading: true
                });
                reqwest({
                    url: '/course/edit',
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
                            message.success("课程信息修改成功");
                            this.setState({
                                visible: false
                            }, () => {
                                this.setState({
                                    data: {},
                                    courseType: null,
                                    viewPic: "",
                                    photoList: [],
                                    avatarEditor: {
                                        scale: 1,
                                        positionX: 0.5,
                                        positionY: 0.5
                                    },
                                    photoLoading: false,
                                    subjectList: [],
                                    studentTypeList: [],
                                    studentType: {
                                        str: "",
                                        ageOne: null,
                                        ageTwo: null
                                    },
                                    studentLevelList: [],
                                    lessonListInit: [],
                                    lessonList: [],
                                    characteristicList: [{index: 1, value: ""}],
                                    saveLoading: false,
                                    confirmLoading: false,
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
        }
        // 完全录入保存并提交审核
        if (type === 3) {
            // 获取表单数据并进行必填项校验
            form.validateFieldsAndScroll((err, values) => {
                if (err) {
                    return;
                }
                // 课程图片写入与校验
                values.photo = this.state.photoList[0] || 0;
                values.photo2 = this.state.photoList[1] || 0;
                values.photo3 = this.state.photoList[2] || 0;
                values.photo4 = this.state.photoList[3] || 0;
                values.photo5 = this.state.photoList[4] || 0;
                if (!values.photo) {
                    message.error("课程图片未选择或未提交");
                    return
                }
                // 课程typeId写入(二级科目id写入)
                values.typeId = values.typeId[1];
                // 适合年龄写入------------------------------------
                values.studentType = "";
                if (this.state.studentType.str) {
                    // str存在，则写入studentType
                    values.studentType = this.state.studentType.str
                } else {
                    // str不存在的分支操作
                    if (this.state.studentType.ageOne || this.state.studentType.ageOne === 0) {
                        if (this.state.studentType.ageTwo || this.state.studentType.ageTwo === 0) {
                            if (this.state.studentType.ageOne >= this.state.studentType.ageTwo) {
                                message.error("适合年龄区间有误");
                                return;
                            }
                            values.studentType = this.state.studentType.ageOne + "-" + this.state.studentType.ageTwo + "岁"
                        } else {
                            message.error("适合年龄区间有误");
                            return;
                        }
                    } else {
                        if (this.state.studentType.ageTwo || this.state.studentType.ageTwo === 0) {
                            message.error("适合年龄区间有误");
                            return;
                        }
                    }
                }
                if (!values.studentType) {
                    message.error("适合年龄不能为空");
                    return;
                }
                // 校验studentType是否已存在于studentTypeList中，是则以id替换文本，studentType数据类型由string变更为number
                this.state.studentTypeList.forEach((item) => {
                    if (item.name === values.studentType) {
                        values.studentType = item.id
                    }
                });
                // studentType不存在于studentTypeList中，则将studentType的值写入suitAge并清空studentType
                if (values.studentType && (typeof(values.studentType) === "string")) {
                    values.suitAge = values.studentType;
                    values.studentType = ""
                }
                // 课程课时写入---------------------------------------
                const lessonList = [];
                this.state.lessonList.forEach((item) => {
                    if (item.id) {
                        // id存在，为修改或删除项
                        lessonList.push(item.id + "@" + item.value);
                    } else {
                        // id不存在，为新增项
                        lessonList.push(item.value);
                    }
                });
                values.lessonName = lessonList;
                // 课程特色写入---------------------------------------
                let characteristic = "";
                this.state.characteristicList.forEach((item) => {
                    if (!item.value) {
                        return;
                    }
                    characteristic += (item.value + "@");
                });
                values.characteristic = characteristic.slice(0, -1);
                // 信息比对
                let result = this.dataContrast(values);
                if (!result) {
                    result = {};
                    result.id = this.props.id;
                }
                result.status = 1;
                this.setState({
                    confirmLoading: true
                });
                reqwest({
                    url: '/course/edit',
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
                            message.success("课程信息修改成功");
                            this.setState({
                                visible: false
                            }, () => {
                                this.setState({
                                    data: {},
                                    courseType: null,
                                    viewPic: "",
                                    photoList: [],
                                    avatarEditor: {
                                        scale: 1,
                                        positionX: 0.5,
                                        positionY: 0.5
                                    },
                                    photoLoading: false,
                                    subjectList: [],
                                    studentTypeList: [],
                                    studentType: {
                                        str: "",
                                        ageOne: null,
                                        ageTwo: null
                                    },
                                    studentLevelList: [],
                                    lessonListInit: [],
                                    lessonList: [],
                                    characteristicList: [{index: 1, value: ""}],
                                    saveLoading: false,
                                    confirmLoading: false,
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
                    itemStatus={this.props.itemStatus}
                    data={this.state.data}
                    courseType={this.state.courseType}
                    setCourseType={this.setCourseType}
                    subjectList={this.state.subjectList}
                    studentType={this.state.studentType}
                    setStudentType={this.setStudentType}
                    studentTypeList={this.state.studentTypeList}
                    studentLevelList={this.state.studentLevelList}
                    viewPic={this.state.viewPic}
                    setViewPic={this.setViewPic}
                    picUpload={this.picUpload}
                    avatarEditor={this.state.avatarEditor}
                    setAvatarEditor={this.setAvatarEditor}
                    photoList={this.state.photoList}
                    setPhotoList={this.setPhotoList}
                    photoLoading={this.state.photoLoading}
                    lessonList={this.state.lessonList}
                    fn_lesson={this.fn_lesson}
                    characteristicList={this.state.characteristicList}
                    fn_characteristic={this.fn_characteristic}
                    saveLoading={this.state.saveLoading}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//课程详情组件
class ItemDetails extends Component {
    state = {
        visible: false,
        loading: true,
        // 课程基本信息
        data: "",
        // 学生类型列表
        studentTypeList: [],
        // 课程课时列表
        lessonList: [],
        // 关联机构列表
        institutionList: []
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

    // 获取该课程所属机构可见学生类型列表
    getStudentTypeAndLevelList = () => {
        reqwest({
            url: '/course/getTypeAndBasics',
            type: 'json',
            method: 'post',
            data: {
                eId: this.props.eId
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         studentTypeList: [
                //             {id: 1, name: ""},
                //         ],
                //         studentLevelList: [
                //             {id: 1, name: ""},
                //         ],
                //     }
                // };
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

    // 获取课程基本信息及关联机构列表
    getData = () => {
        reqwest({
            url: '/course/getDetail',
            type: 'json',
            method: 'post',
            data: {
                courseId: this.props.id
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
                //         courseInfo: {
                //             address: "",
                //             areaId: null,
                //             areaName: "",
                //             characteristic: "",
                //             cityId: null,
                //             cityName: "",
                //             count: null,
                //             courseType: null,
                //             number: null,
                //             createTime: "",
                //             duration: null,
                //             lat: "",
                //             lng: "",
                //             name: "",
                //             parentTypeId: null,
                //             parentTypeName: "",
                //             photo: "",
                //             photo2: "",
                //             photo3: "",
                //             photo4: "",
                //             photo5: "",
                //             originalPrice: "",
                //             price: "",
                //             provinceId: null,
                //             provinceName: "",
                //             studentLevelId: null,
                //             studentLevelName: "",
                //             studentTypeIds: "",
                //             submitTime: "",
                //             target: "",
                //             sketch: "",
                //             throughTime: "",
                //             typeId: null,
                //             typeName: "",
                //             updateTime: "",
                //             status: null,
                //         },
                //         list:["001","002","003"]
                //     },
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    // 课程特色字段处理
                    const characteristic = [];
                    if (json.data.courseInfo.characteristic) {
                        json.data.courseInfo.characteristic.split("@").forEach((item, index) => {
                            characteristic.push(<p key={index}>{item}</p>);
                        });
                        json.data.courseInfo.characteristic = characteristic;
                    }
                    this.setState({
                        loading: false,
                        data: json.data.courseInfo,
                        institutionList: json.data.list || []
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
                // const json = {
                //     result: 0,
                //     data: [
                //         {id: 1, lessonName: ""}
                //     ]
                // };
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

    showModal = () => {
        this.getStudentTypeAndLevelList();
        this.getData();
        this.getLessonList();
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
            // 课程类型
            let tempCourseType = "";
            if (this.state.data.courseType === 0) {
                tempCourseType = "线下正式课";
            }
            if (this.state.data.courseType === 1) {
                tempCourseType = "视频课程";
            }
            if (this.state.data.courseType === 2) {
                tempCourseType = "线下体验课";
            }
            // 学生类型
            let tempStudentTypeIds = "";
            if (this.state.studentTypeList.length && this.state.data.studentTypeIds) {
                const fn_filter = (item) => {
                    return item.id === Number(this.state.data.studentTypeIds);
                };
                tempStudentTypeIds = this.state.studentTypeList.filter(fn_filter)[0] ? this.state.studentTypeList.filter(fn_filter)[0].name : "";
            }
            // 关联机构列表
            let institutionList = [];
            this.state.institutionList.forEach((item, index) => {
                institutionList.push(<p key={index}>{item}</p>)
            });
            // 课程状态
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
            dataSource = [
                <div className="name">
                    <span className="item-name">课程名称：</span>
                    <span className="item-content">{this.state.data.name}</span>
                </div>,
                <div className="courseType">
                    <span className="item-name">课程类型：</span>
                    <span className="item-content">{tempCourseType || "暂无"}</span>
                </div>,
                <div className="eName">
                    <span className="item-name">所属机构：</span>
                    <span className="item-content">{this.state.data.EName || "暂无"}</span>
                </div>,
                <div className="subject">
                    <span className="item-name">科目：</span>
                    <span
                        className="item-content">{this.state.data.typeId ? (this.state.data.parentTypeName + "/" + this.state.data.typeName) : "暂无"}</span>
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
                    <span className="item-content">{this.state.data.studentLevelName || "暂无"}</span>
                </div>,
                <div className="number">
                    <span className="item-name">开班人数：</span>
                    <span
                        className="item-content">{(this.state.data.number === undefined || this.state.data.courseType === 2) ? "暂无" : this.state.data.number}</span>
                </div>,
                <div className="duration">
                    <span className="item-name">单节时长：</span>
                    <span
                        className="item-content">{this.state.data.duration ? (this.state.data.duration + "分钟") : "暂无"}</span>
                </div>,
                <div className="count">
                    <span className="item-name">课时数：</span>
                    <span className="item-content">{this.state.data.count || "暂无"}</span>
                </div>,
                <div className="lessonList">
                    <span className="item-name">课时安排：</span>
                    <div className="item-content">
                        {this.state.lessonList.length ? this.state.lessonList : "暂无"}
                    </div>
                </div>,
                <div className="characteristic">
                    <span className="item-name">课程特色：</span>
                    <pre>
                        <div className="item-content">{this.state.data.characteristic || "暂无"}</div>
                    </pre>
                </div>,
                <div className="sketch">
                    <span className="item-name">课程简介：</span>
                    <pre>
                       <span className="item-content">{this.state.data.sketch || "暂无"}</span>
                    </pre>
                </div>,
                <div className="target">
                    <span className="item-name">学习目标：</span>
                    <pre>
                       <span className="item-content">{this.state.data.target || "暂无"}</span>
                    </pre>
                </div>,
                <div className="originalPrice">
                    <span className="item-name">课程原价：</span>
                    <span className="item-content">{this.state.data.originalPrice || "暂无"}</span>
                </div>,
                <div className="price">
                    <span className="item-name">课程现价：</span>
                    <span className="item-content">{this.state.data.price || "暂无"}</span>
                </div>,
                <div className="address">
                    <span className="item-name">详细地址：</span>
                    <span className="item-content">{this.state.data.address || "暂无"}</span>
                </div>,
                <div className="tips">
                    <span className="item-name">购买须知：</span>
                    <pre>
                        <span className="item-content">{this.state.data.tips || "暂无"}</span>
                    </pre>
                </div>,
                <div className="institutionList">
                    <span className="item-name">关联机构：</span>
                    <div className="item-content">
                        {this.state.institutionList.length ? institutionList : "暂无"}
                    </div>
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
                <div className="status">
                    <span className="item-name">课程状态：</span>
                    <span className="item-content">{tempStatus}</span>
                </div>
            ];
        } else {
            dataSource = ""
        }
        return (
            <a>
                <span onClick={this.showModal}>详情</span>
                <Modal
                    title="课程详情"
                    width={600}
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                    destroyOnClose={true}
                >
                    <div className="course-details item-details">
                        <div className="course-baseData">
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

//驳回意见
class ItemOpinion extends Component {
    state = {
        visible: false,
        loading: true,
        data: ""
    };

    getData = () => {
        reqwest({
            url: '/course/getDetail',
            type: 'json',
            method: 'post',
            data: {
                courseId: this.props.id
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
                //         courseInfo: {
                //             opinion: ""
                //         }
                //     },
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        data: json.data.courseInfo.opinion
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
        return (
            <a style={{display: this.props.status ? "inline" : "none"}}>
                <span onClick={this.showModal}>驳回意见</span>
                <Modal
                    title="驳回意见"
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
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

//课程审核表单
const ItemCheckForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, opinionStatus, setOpinionStatus, confirmLoading} = props;
        const {getFieldDecorator} = form;
        let opinionClass = "opinion noInput longItem unnecessary";
        if (opinionStatus) {
            opinionClass = "opinion noInput longItem"
        }

        return (
            <Modal
                visible={visible}
                title="课程审核"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="courseCheck-form">
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
                                    <Radio value={2}>通过</Radio>
                                    <Radio value={0}>驳回</Radio>
                                </RadioGroup>
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

//课程审核组件
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
        if (value === 2) {
            this.setState({
                opinionStatus: false
            })
        }
        if (value === 0) {
            this.setState({
                opinionStatus: true
            })
        }
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState(
                {
                    visible: false
                }, () => {
                    this.setState({
                        opinionStatus: false,
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
            if (values.state === 0 && !values.opinion) {
                message.error("驳回意见不能为空");
                return
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/course/checkCourse',
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
                        message.success("课程审核成功");
                        this.setState(
                            {
                                visible: false
                            }, () => {
                                this.setState({
                                    opinionStatus: false,
                                    confirmLoading: false
                                });
                            }
                        );
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
                <span onClick={() => this.showModal()}>审核</span>
                <ItemCheckForm
                    ref={this.saveFormRef}
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

//课程列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            pagination: {
                current: 1,
                pageSize: Number(localStorage.courseCheckPageSize) || 10,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            },
        };
        this.columns = Number(sessionStorage.EId) === 0 ?
            // 系统管理员列配置（展示所属机构项）
            [
                {
                    title: '序号',
                    dataIndex: 'index',
                    width: '6%',
                    render: (text, record) => this.renderColumns(text, record, 'index'),
                },
                {
                    title: '课程名称',
                    dataIndex: 'name',
                    width: '20%',
                    render: (text, record) => this.renderColumns(text, record, 'name'),
                },
                {
                    title: '所属机构',
                    dataIndex: 'eName',
                    width: '15%',
                    render: (text, record) => this.renderColumns(text, record, 'eName'),
                },
                {
                    title: '图片',
                    dataIndex: 'photo',
                    width: '8%',
                    render: (text, record) => (record.photo ?
                        <img style={{width: '45px', height: "25px"}} alt="" src={record.photo}/> : <span>— —</span>)
                },
                {
                    title: '科目',
                    dataIndex: 'typeName',
                    width: '8%',
                    render: (text, record) => this.renderColumns(text, record, 'typeName'),
                },
                {
                    title: '课程价格',
                    dataIndex: 'price',
                    width: '10%',
                    render: (text, record) => this.renderColumns(text, record, 'price'),
                },
                {
                    title: '操作',
                    dataIndex: '操作',
                    render: (text, record) => {
                        return (
                            <div className="editable-row-operations">
                                {/*课程详情*/}
                                <ItemDetails id={record.id} eId={record.eId} toLoginPage={this.props.toLoginPage}/>
                                {/*课程编辑*/}
                                <ItemEdit id={record.id} eId={record.eId} recapture={this.getData}
                                          toLoginPage={this.props.toLoginPage}
                                          itemStatus={record.status}
                                          status={1}/>
                                {/*提交审核（非待审核状态的课程展示此项）*/}
                                <Popconfirm title="确认提交?"
                                            placement="topRight"
                                            onConfirm={() => this.itemSubmit(record.id)}
                                            onCancel=""
                                            okType="danger"
                                            okText="确认"
                                            cancelText="取消">
                                    <a style={{display: record.status !== 1 ? "inline" : "none"}}>提交审核</a>
                                </Popconfirm>
                                {/*驳回意见（审核驳回状态的课程展示此项）*/}
                                <ItemOpinion id={record.id} status={record.status === 0}
                                             toLoginPage={this.props.toLoginPage}/>
                                {/*审核（待审核状态的课程展示此项，仅超级管理员和运营人员可见）*/}
                                <ItemCheck id={record.id} recapture={this.getData} toLoginPage={this.props.toLoginPage}
                                           status={(Number(sessionStorage.adminType) === 0 || Number(sessionStorage.adminType) === 4) && record.status === 1 ? 1 : 0}/>
                            </div>
                        );
                    },
                }
            ]
            :
            // 机构管理员列配置
            [
                {
                    title: '序号',
                    dataIndex: 'index',
                    width: '6%',
                    render: (text, record) => this.renderColumns(text, record, 'index'),
                },
                {
                    title: '课程名称',
                    dataIndex: 'name',
                    width: '20%',
                    render: (text, record) => this.renderColumns(text, record, 'name'),
                },
                {
                    title: '图片',
                    dataIndex: 'photo',
                    width: '8%',
                    render: (text, record) => (record.photo ?
                        <img style={{width: '30px', height: "18px"}} alt="" src={record.photo}/> : <span>— —</span>)
                },
                {
                    title: '科目',
                    dataIndex: 'typeName',
                    width: '8%',
                    render: (text, record) => this.renderColumns(text, record, 'typeName'),
                },
                {
                    title: '课程价格',
                    dataIndex: 'price',
                    width: '10%',
                    render: (text, record) => this.renderColumns(text, record, 'price'),
                },
                {
                    title: '操作',
                    dataIndex: '操作',
                    render: (text, record) => {
                        return (
                            <div className="editable-row-operations">
                                {/*课程详情*/}
                                <ItemDetails id={record.id} eId={record.eId} toLoginPage={this.props.toLoginPage}/>
                                {/*课程编辑（非待审核状态的课程展示此项）*/}
                                <ItemEdit id={record.id} eId={record.eId} recapture={this.getData}
                                          toLoginPage={this.props.toLoginPage}
                                          itemStatus={record.status}
                                          status={record.status !== 1}/>
                                {/*提交审核（非待审核状态的课程展示此项）*/}
                                <Popconfirm title="确认提交?"
                                            placement="topRight"
                                            onConfirm={() => this.itemSubmit(record.id)}
                                            onCancel=""
                                            okType="danger"
                                            okText="确认"
                                            cancelText="取消">
                                    <a style={{display: record.status !== 1 ? "inline" : "none"}}>提交审核</a>
                                </Popconfirm>
                                {/*驳回意见（审核驳回状态的课程展示此项）*/}
                                <ItemOpinion id={record.id} status={record.status === 0}
                                             toLoginPage={this.props.toLoginPage}/>
                                {/*课程删除*/}
                                <Popconfirm title="确认删除?"
                                            placement="topRight"
                                            onConfirm={() => this.itemDelete(record.id)}
                                            onCancel=""
                                            okType="danger"
                                            okText="立即删除"
                                            cancelText="取消">
                                    <a>删除</a>
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
            url: '/course/getCourseList',
            type: 'json',
            method: 'post',
            data: {
                status: type === undefined ? this.props.type : type,
                educationName: keyword ? keyword.educationName : this.props.keyword.educationName,
                courseName: keyword ? keyword.courseName : this.props.keyword.courseName,
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
                //                 EId: null,
                //                 name: "",
                //                 typeName: "",
                //                 duration: null,
                //                 characteristic: "",
                //                 courseType: null,
                //                 photo: "",
                //                 price: "",
                //                 status: 5
                //             },
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
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            eId: item.EId || item.eduId,
                            eName: item.EName || item.eduName,
                            courseType: item.courseType,
                            index: index + 1,
                            name: item.name,
                            duration: item.duration,
                            photo: (item.photo && item.photo !== "0") ? ("http://image.taoerxue.com/" + item.photo) : "",
                            typeName: item.typeName || "— —",
                            price: item.price ? ("￥" + item.price) : "— —",
                            status: item.status
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
    itemSubmit = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/course/checkCourse',
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
                    } else if (json.code === "1129") {
                        message.error("课程信息不全，无法提交审核");
                        this.setState({
                            loading: false
                        })
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
            url: '/course/checkCourse',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: id,
                status: 3
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("课程删除成功");
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
        localStorage.courseCheckPageSize = pagination.pageSize;
        pager.pageSize = Number(localStorage.courseCheckPageSize);
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

class CourseCheck extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: "5",
            keyword: {
                educationName: '',
                courseName: ''
            },
            flag_add: false
        };
        this.educationName = "";
        this.courseName = "";
    };

    //tab状态设置
    setType = (value) => {
        this.setState({
            type: value
        })
    };

    search = (type, value) => {
        if (type === 0) {
            if (this.state.keyword.educationName === this.educationName && this.state.keyword.courseName === this.courseName) {
                return
            }
            this.setState({
                keyword: {
                    educationName: this.educationName,
                    courseName: this.courseName
                }
            })
        }
        if (type === 1) {
            if (value !== this.state.keyword.courseName) {
                this.setState({
                    keyword: {
                        educationName: "",
                        courseName: value,
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

    setCourseName = (event) => {
        if (event.target.value === this.courseName) {
            return
        }
        this.courseName = event.target.value
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
            <div className="course-check">
                <header className="clearfix">
                    <Tabs defaultActiveKey={this.state.type} onChange={this.setType}>
                        <TabPane tab="暂存" key="5"/>
                        <TabPane tab="待审核" key="1"/>
                        <TabPane tab="已驳回" key="0"/>
                        <TabPane tab="已下架" key="4"/>
                    </Tabs>
                </header>
                <div className="keyWord clearfix">
                    <div className="course-filter"
                         style={{
                             display: Number(sessionStorage.EId) === 0 ? "block" : "none",
                             width: "300px",
                             float: "left",
                             marginRight: "20px"
                         }}>
                        <Input placeholder="课程名称" onBlur={this.setCourseName}/>
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
                    <Button style={{display: Number(sessionStorage.EId) === 0 ? "block" : "none"}}
                            type="primary"
                            onClick={() => this.search(0)}>
                        <Icon type="search" style={{fontSize: "16px"}}/>
                    </Button>
                    <Search placeholder="请输入课程名称"
                            onSearch={(value) => this.search(1, value)}
                            enterButton
                            style={{
                                display: Number(sessionStorage.EId) !== 0 ? "block" : "none",
                                width: "320px",
                                float: "left"
                            }}
                    />
                </div>
                <div className="table-box">
                    <DataTable type={this.state.type} keyword={this.state.keyword} flag_add={this.state.flag_add}
                               toLoginPage={this.toLoginPage}/>
                </div>
            </div>
        )
    }
}

export default CourseCheck;