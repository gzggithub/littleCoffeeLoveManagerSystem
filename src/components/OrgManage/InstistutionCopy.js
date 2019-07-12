import React, {Component} from 'react';
import {
    Table,
    Input,
    InputNumber,
    DatePicker,
    Select,
    Button,
    Modal,
    Form,
    Popconfirm,
    Upload,
    Slider,
    Row,
    Col,
    Radio,
    Icon,
    message,
    List,
    TreeSelect,
    Cascader,
    Checkbox,
    Spin,
    Tooltip
} from 'antd';
import reqwest from 'reqwest';
import AvatarEditor from 'react-avatar-editor'

const Search = Input.Search;
const {Option} = Select;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const {TextArea} = Input;
const confirm = Modal.confirm;
// const EditableContext = React.createContext();

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
const formItemLayout_16 = {
    labelCol: {span: 4},
    wrapperCol: {span: 16},
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

// 可编辑的单元格
// const editableCell = ({value}) => (
//     <input style={{width: "100"}} placeholder='排序' value={value}/>
// );

// const editableCell = Form.create()(
//     (props) => {
//         const {form} = props;
//         const {getFieldDecorator} = form;
//         return (
//             <div>
//                 <Form>
//                     <FormItem className="name">
//                         {getFieldDecorator('sort', {
//                             rules: [{
//                                 required: true,
//                                 message: '机构名称不能为空',
//                             }],
//                         })(
//                             <Input placeholder="设置排序"/>
//                         )}
//                     </FormItem>
//                 </Form>
//             </div>
//         )
//     }
// )

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

  save = (e) => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        return;
      }
      this.toggleEdit();
      handleSave({ ...record, ...values });
    });
  }

  render() {
    const { editing } = this.state;
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editable ? (
          <EditableContext.Consumer>
            {(form) => {
              this.form = form;
              return (
                editing ? (
                  <FormItem style={{ margin: 0 }}>
                    {form.getFieldDecorator(dataIndex, {
                      rules: [{
                        required: true,
                        message: `${title} is required.`,
                      }],
                      initialValue: record[dataIndex],
                    })(
                      <Input
                        ref={node => (this.input = node)}
                        onPressEnter={this.save}
                        onBlur={this.save}
                      />
                    )}
                  </FormItem>
                ) : (
                  <div
                    className="editable-cell-value-wrap"
                    style={{ paddingRight: 24 }}
                    onClick={this.toggleEdit}
                  >
                    {restProps.children}
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


//添加机构表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, typeList, provinceList, cityList, districtList, streetList, markers, setMarkers, area, setArea, mapObj, setXY, setFormattedAddress, formattedAddress, setPhone, countDown, codeButtonStatus, getCode, viewPic01, setViewPic01, picUpload01, avatarEditor01, setAvatarEditor01, photoList01, setPhotoList01, photoLoading, viewPic02, effectPic02, data_pic02, setViewPic02, picUpload02, avatarEditor02, setAvatarEditor02, logoLoading, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 机构类型选项生成
        const optionsOfTypeList = [];
        typeList.forEach((item, index) => {
            optionsOfTypeList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
        });

        // 已上传图片列表
        const photoExist01 = [];
        photoList01.forEach((item, index) => {
            photoExist01.push(
                <div className="photoExist-item clearfix" key={index + 1}>
                    <img src={"http://image.taoerxue.com/" + item} alt=""/>
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
            return new Blob([u8arr], {type: "image/jpeg"});
        };

        // 机构图片相关
        const setEditorRef01 = (editor) => this.editor01 = editor;
        const beforeUpload01 = (file) => {
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
                    setViewPic01(imageUrl);
                });
            }
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
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('文件不能大于2M');
            }
            if (isIMG && isLt2M) {
                getBase64(file, (imageUrl) => {
                    setViewPic02(imageUrl);
                });
            }
            return false
        };
        const uploadButton02 = (
            <div>
                <Icon type={'plus'}/>
                <div className="ant-upload-text" style={{display: viewPic02 ? "none" : "block"}}>选择图片</div>
            </div>
        );
        const picHandle02 = () => {
            if (viewPic02) {
                const canvas = this.editor02.getImage();
                const url = canvas.toDataURL("image/jpeg", 0.92);
                if (url === effectPic02) {
                    message.error("图片未改动，无法提交");
                    return
                }
                const file = dataURLtoFile(url);
                picUpload02(url, file)
            } else {
                message.error("图片未选择");
            }
        };
        const partImg02 = (
            <AvatarEditor
                ref={setEditorRef02}
                image={viewPic02}
                width={80}
                height={80}
                border={0}
                color={[0, 0, 0, 1]}
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
                title="添加机构"
                width={1000}
                onCancel={onCancel}
                onOk={onCreate}
                confirmLoading={confirmLoading}
            >
                <div className="institution-add institution-form item-form">
                    <Form layout="vertical">
                        <h4 className="add-form-title-h4">基础信息</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="name"  label="机构名称：">
                                    {getFieldDecorator('name', {
                                        rules: [{
                                            required: true,
                                            message: '机构名称不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入机构名称"/>
                                    )}
                                </FormItem>
                                <div  style={{position: 'absolute', top: 6, right: 20}}>
                                    <Tooltip title="请填写营业执照上完整的名称">
                                        <span>填写帮助</span>
                                    </Tooltip>
                                </div>
                            </Col>
                            <Col span={8}>
                                <FormItem className="typeIds" label="机构类型：">
                                    {getFieldDecorator('typeIds', {
                                        rules: [{
                                            required: true,
                                            message: '机构类型不能为空',
                                        }],
                                    })(
                                        <Select
                                            mode="multiple"
                                            style={{width: '100%'}}
                                            placeholder="请选择机构所属类型（最多三项）"
                                        >
                                            {optionsOfTypeList}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                             <Col span={8}>
                                <FormItem className="telephone"  label="机构电话：">
                                    {getFieldDecorator('telephone', {
                                        rules: [{
                                            required: true,
                                            message: '机构电话不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入机构电话"/>
                                    )}
                                </FormItem>
                             </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="adminUserName" label="管理员：">
                                    {getFieldDecorator('adminUserName', {
                                        rules: [{
                                            required: true,
                                            message: '管理员不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入机构管理员名字"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="managerAddress unnecessary" label="地址：">
                                    {getFieldDecorator('managerAddress', {
                                        rules: [{
                                            required: false
                                        }],
                                    })(
                                        <Input placeholder="请输入管理员地址"/>
                                    )}
                                </FormItem>
                            </Col>

                        </Row>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="adminUserPhone" label="手机号码：">
                                    {getFieldDecorator('adminUserPhone', {
                                        rules: [{
                                            required: true,
                                            message: '手机号码不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入管理员手机号" onBlur={(event) => setPhone(event.target.value)}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="verifyCode" label="验证码：">
                                    {getFieldDecorator('verifyCode', {
                                        rules: [{
                                            required: true,
                                            message: '验证码不能为空',
                                        }],
                                    })(
                                        <div>
                                            <Input style={{width: "60%"}} placeholder="请输入手机验证码"/>
                                            <Button style={{float: "right", width: "100px"}}
                                                    type="primary"
                                                    onClick={getCode}
                                            >
                                                {codeButtonStatus ? countDown + "s后重发" : "获取验证码"}
                                            </Button>
                                        </div>
                                        // <Input placeholder="请输入管理员手机验证码"/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>

                        <Row>
                            <Col span={10}>
                                <FormItem className="photo"  label="机构图片：">
                                    {getFieldDecorator('photo', {
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
                                                action="/file/upload"
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
                            </Col>
                        </Row>

                        <h4 className="add-form-title-h4">商家信息</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="adminUserName" label="营业时间：">
                                    {getFieldDecorator('businessHours', {
                                        rules: [{
                                            required: true,
                                            message: '营业时间不能为空',
                                        }],
                                    })(
                                        <Input placeholder="如：周一至周日  09:00-21:00"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="adminUserName" label="商家面积：">
                                    {getFieldDecorator('businessArea', {
                                        rules: [{
                                            required: true,
                                            message: '商家面积不能为空',
                                        }],
                                    })(
                                        <Input placeholder="如：1000平方米"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="adminUserName" label="教室数目：">
                                    {getFieldDecorator('teacherRoomNumbers', {
                                        rules: [{
                                            required: true,
                                            message: '教室数目不能为空',
                                        }],
                                    })(
                                        <Input placeholder="如：8间"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="adminUserName" label="师资力量：">
                                    {getFieldDecorator('adminUserName', {
                                        rules: [{
                                            required: true,
                                            message: '师资力量不能为空',
                                        }],
                                    })(
                                        <Input placeholder="如：9名"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={16}>
                                <FormItem className="adminUserName" label="特色标签：">
                                    {getFieldDecorator('adminUserName', {
                                        rules: [{
                                            required: false,
                                        }],
                                    })(
                                        <Row gutter={8}>
                                            <Col span={4}>
                                                <Input  placeholder="如：小班教学"/>
                                            </Col>
                                            <Col span={4}>
                                                <Input  placeholder="如：免费WiFi"/>
                                            </Col>
                                            <Col span={4}>
                                                <Input  placeholder="如：一对一"/>
                                            </Col>
                                            <Col span={4}>
                                                <Input  placeholder="如：夏令营"/>
                                            </Col>
                                            <Col span={4}>
                                                <Input  placeholder="如：主题活动"/>
                                            </Col>
                                            <Col span={4}>
                                                <Input  placeholder="如：生日会"/>
                                            </Col>
                                        </Row>
                                    )}
                                </FormItem>
                                <div>

                                </div>
                            </Col>
                        </Row>
                        <h4 className="add-form-title-h4">机构详情</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="icon" label="机构LOGO：">
                                    {getFieldDecorator('icon', {
                                        rules: [{
                                            required: true,
                                            message: '请上传机构LOGO',
                                        }],
                                    })(
                                        <div className="itemBox">
                                            <Upload
                                                name="file"
                                                listType="picture-card"
                                                className="avatar-uploader"
                                                showUploadList={false}
                                                action="/file/upload"
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
                                                        right: "0",
                                                        bottom: "0"
                                                    }}>{data_pic02 ? "重新提交" : "图片提交"}</Button>
                                        </div>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={16}>
                                <Row>
                                    <Col span={24}>
                                        <FormItem className="area longItem" label="机构地址：">
                                            {getFieldDecorator('area', {
                                                rules: [{
                                                    required: false
                                                }],
                                            })(
                                                <div>
                                                    <Select placeholder="省" style={{width: "20%", marginRight: 10}}
                                                            value={area.province || undefined} onChange={(value) => {
                                                        setArea(1, value)
                                                    }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                        {provinceOptions}
                                                    </Select>
                                                    <Select placeholder="市" style={{width: "20%", marginRight: 10}}
                                                            value={area.city || undefined} onChange={(value) => {
                                                        setArea(2, value)
                                                    }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                        {cityOptions}
                                                    </Select>
                                                    <Select placeholder="区" style={{width: "20%", marginRight: 10}}
                                                            value={area.district || undefined} onChange={(value) => {
                                                        setArea(3, value)
                                                    }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                        {districtOptions}
                                                    </Select>
                                                    <Select placeholder="街道" style={{width: "20%"}} value={area.street || undefined}
                                                            onChange={(value) => {
                                                                setArea(4, value)
                                                            }} dropdownMatchSelectWidth={false} allowClear={true}>
                                                        {streetOptions}
                                                    </Select>
                                                </div>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <FormItem className="" label="详细地址">
                                            {getFieldDecorator('detailedAddress', {
                                                rules: [{
                                                    required: true,
                                                    message: '详细地址不能为空',
                                                }],
                                            })(
                                                <Input placeholder="如道路、门牌号、小区、楼栋号、单元室等"
                                                       onBlur={(event) => addressChange(event.target.value)}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem className="" label="电话">
                                            {getFieldDecorator('detailedAddress', {
                                                rules: [{
                                                    required: true,
                                                    message: '电话不能为空',
                                                }],
                                            })(
                                                <Input placeholder="请输入电话"
                                                       onBlur={(event) => addressChange(event.target.value)}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <p className="addressSaved">定位点：{formattedAddress || "暂无"}</p>
                                        <div id="add-institution-container" name="container" tabIndex="0"/>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                        <FormItem className="description longItem" label="机构简介：">
                            {getFieldDecorator('description', {
                                rules: [{
                                    required: true,
                                    message: '机构简介不能为空',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写机构简介" rows={10}/>
                            )}
                        </FormItem>
                        <h4 className="add-form-title-h4">其它信息</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="companyName" label="企业名称：">
                                    {getFieldDecorator('companyName', {
                                        rules: [{
                                            required: true,
                                            message: '企业名称不能为空',
                                        }],
                                    })(
                                        <Input placeholder="请输入企业名称"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="licenseNumber" label="执照号码：">
                                    {getFieldDecorator('licenseNumber', {
                                        rules: [{
                                            required: true,
                                            max: 18,
                                            message: '请填写正确的执照号码',
                                        }],
                                    })(
                                        <Input placeholder="请输入18位执照号码"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="fees" label="手续费：">
                                    {getFieldDecorator('fees', {
                                        rules: [{
                                            required: true,
                                            message: '机构手续费不能为空',
                                        }],
                                    })(
                                        <div>
                                            <InputNumber style={{width: "100%"}} placeholder="填写0.15即为手续费15%" max={1} min={0} precision={2} step={0.01}/>
                                            {/* <div className="feesHint">填写0.15即为手续费15%</div> */}
                                        </div>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <FormItem className="additionalProtocol unnecessary"
                                          label="附加协议：">
                                    {getFieldDecorator("additionalProtocol", {
                                        rules: [{
                                            required: false
                                        }],
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写附加协议" rows={10}/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </Modal>
        );
    }
);

//添加机构组件
class ItemAdd extends Component {
    state = {
        visible: false,
        // 机构类型表
        typeList: [],
        // 短信验证码相关变量
        phone: "",
        countDown: 0,
        codeButtonStatus: false,
        // 机构图片相关变量
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
        effectPic02: "",
        data_pic02: "",
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
        confirmLoading: false
    };
    fn_countDown = "";

    showModal = () => {
        this.setState({visible: true}, () => {
            this.getInstitutionTypeList();
            setTimeout(() => {
                this.setState({
                    mapObj: new window.AMap.Map('add-institution-container', {
                        resizeEnable: true,
                        zoom: 16
                    })
                }, () => {
                    this.getProvinceList();
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
                })
            }, 500)
        });
    };

    // 获取机构类型列表
    getInstitutionTypeList = () => {
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
                //         {id: 1, name: ""},
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        typeList: json.data
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
                    }
                }
            }
        });
    };

    // 短信验证码相关函数
    // 手机号码写入
    setPhone = (para) => {
        this.setState({
            phone: para
        })
    };
    // 短信验证码倒计时函数
    countDown = () => {
        if (this.state.countDown <= 0) {
            clearInterval(this.fn_countDown);
            this.setState({
                countDown: 0,
                codeButtonStatus: false
            });
            return;
        }
        this.setState({
            countDown: this.state.countDown - 1
        })
    };
    // 获取验证码
    getCode = () => {
        if (this.state.codeButtonStatus) {
            // 倒计时未结束，直接return
            return;
        } else {
            const regPhone = /^1[0-9]{10}$/;
            if (regPhone.test(this.state.phone)) {
                reqwest({
                    url: '/mobileCode/sendVerificationCode',
                    type: 'json',
                    method: 'post',
                    data: {
                        phone: this.state.phone
                    },
                    headers: {
                        Authorization: sessionStorage.token
                    },
                    error: (XMLHttpRequest) => {
                        message.error("发送失败");
                    },
                    success: (json) => {
                        if (json.result === 0) {
                            this.setState({
                                codeButtonStatus: true,
                                countDown: 60
                            }, () => {
                                this.fn_countDown = setInterval(this.countDown, 1000)
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
            } else {
                if (this.state.phone) {
                    message.warning("请填写正确的手机号码")
                } else {
                    message.warning("手机号码不能为空")
                }
            }
        }
    };

    // 机构图片处理-----------------------------------
    // 初始图片写入
    setViewPic01 = (para) => {
        this.setState({
            viewPic01: para
        })
    };
    // 设置图片缩放比例及偏移量
    setAvatarEditor01 = (index, value) => {
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
    // 图片上传
    picUpload01 = (para) => {
        if (this.state.photoList01.length >= 5) {
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
                        let photoList01 = this.state.photoList01;
                        photoList01.push(json.data.url);
                        this.setState({
                            photoList01: photoList01,
                            viewPic01: "",
                            avatarEditor01: {
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
    setPhotoList01 = (index) => {
        let data = this.state.photoList01;
        data.splice(index, 1);
        this.setState({
            photoList01: data
        })
    };

    // 机构LOGO处理-----------------------------------
    setViewPic02 = (para) => {
        this.setState({
            viewPic02: para
        })
    };
    setAvatarEditor02 = (index, value) => {
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
        const formData = new FormData();
        formData.append("file", para02);
        this.setState({
            logoLoading: true
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
                    logoLoading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("图片提交成功");
                    this.setState({
                        effectPic02: para01,
                        data_pic02: json.data.url,
                        logoLoading: false,
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
                            logoLoading: false
                        })
                    }
                }
            }
        });
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
                        districtSearch.search(value.adcode, (status, result) => {
                            this.setState({
                                streetList: result.districtList[0].districtList || [],
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
            var districtSearch = new window.AMap.DistrictSearch({
                level: 'country',
                subdistrict: 3
            });

            districtSearch.search('中国', (status, result) => {
                this.setState({
                    provinceList: result.districtList[0].districtList
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

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
                    typeList: [],
                    phone: "",
                    countDown: 0,
                    codeButtonStatus: false,
                    viewPic01: "",
                    photoList01: [],
                    avatarEditor01: {
                        scale: 1,
                        positionX: 0.5,
                        positionY: 0.5
                    },
                    photoLoading: false,
                    viewPic02: "",
                    effectPic02: "",
                    data_pic02: "",
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
                    confirmLoading: false
                });
                form.resetFields();
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
            // 类型校验
            if (values.typeIds.length > 3) {
                message.error("机构类型最多选三项");
                return;
            }
            values.typeId = values.typeIds[0];
            values.typeIdTwo = values.typeIds[1] || 0;
            values.typeIdThree = values.typeIds[2] || 0;
            // 机构图片校验
            values.photo = this.state.photoList01[0] || 0;
            values.photo2 = this.state.photoList01[1] || 0;
            values.photo3 = this.state.photoList01[2] || 0;
            values.photo4 = this.state.photoList01[3] || 0;
            values.photo5 = this.state.photoList01[4] || 0;
            if (!values.photo) {
                message.error("机构图片未提交");
                return
            }
            // 机构logo校验
            if (!this.state.data_pic02) {
                message.error("LOGO未提交");
                return
            }
            values.icon = this.state.data_pic02;
            if (!this.state.area.street) {
                message.error("请选择机构所在省、市、区及街道");
                return
            }
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/institution/registerEducation',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    name: values.name,
                    telephone: values.telephone,
                    adminUserName: values.adminUserName,
                    adminUserPhone: values.adminUserPhone,
                    managerAddress: values.managerAddress,
                    photo: values.photo,
                    photo2: values.photo2,
                    photo3: values.photo3,
                    photo4: values.photo4,
                    photo5: values.photo5,
                    code: values.verifyCode,
                    address: this.state.formattedAddress,
                    detailedAddress: values.detailedAddress,
                    description: values.description,
                    fees: values.fees,
                    icon: values.icon,
                    lng: this.state.xy.x,
                    lat: this.state.xy.y,
                    provinceName: this.state.area.province,
                    cityName: this.state.area.city,
                    areaName: this.state.area.district,
                    areaId: this.state.areaId,
                    street: this.state.area.street,
                    typeId: values.typeId,
                    typeIdTwo: values.typeIdTwo,
                    typeIdThree: values.typeIdThree,
                    companyName: values.companyName,
                    licenseNumber: values.licenseNumber,
                    additionalProtocol: values.additionalProtocol
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("机构添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                typeList: [],
                                phone: "",
                                countDown: 0,
                                codeButtonStatus: false,
                                viewPic01: "",
                                photoList01: [],
                                avatarEditor01: {
                                    scale: 1,
                                    positionX: 0.5,
                                    positionY: 0.5
                                },
                                photoLoading: false,
                                viewPic02: "",
                                effectPic02: "",
                                data_pic02: "",
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
                                confirmLoading: false
                            });
                            form.resetFields();
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
            });
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button type="primary" onClick={this.showModal}>添加机构</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    typeList={this.state.typeList}
                    setPhone={this.setPhone}
                    countDown={this.state.countDown}
                    codeButtonStatus={this.state.codeButtonStatus}
                    getCode={this.getCode}
                    viewPic01={this.state.viewPic01}
                    setViewPic01={this.setViewPic01}
                    picUpload01={this.picUpload01}
                    avatarEditor01={this.state.avatarEditor01}
                    setAvatarEditor01={this.setAvatarEditor01}
                    photoList01={this.state.photoList01}
                    setPhotoList01={this.setPhotoList01}
                    photoLoading={this.state.photoLoading}
                    viewPic02={this.state.viewPic02}
                    effectPic02={this.state.effectPic02}
                    data_pic02={this.state.data_pic02}
                    setViewPic02={this.setViewPic02}
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
                    confirmLoading={this.state.confirmLoading}
                />
            </div>
        );
    }
}

//机构信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, id, data, typeList, viewPic01, setViewPic01, picUpload01, avatarEditor01, setAvatarEditor01, photoList01, setPhotoList01, photoLoading, viewPic02, setViewPic02, data_pic02, effectPic02, picUpload02, avatarEditor02, setAvatarEditor02, logoLoading, provinceList, cityList, districtList, streetList, markers, setMarkers, area, setArea, mapObj, setXY, setFormattedAddress, formattedAddress, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 机构类型选项生成
        const optionsOfTypeList = [];
        typeList.forEach((item, index) => {
            optionsOfTypeList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
        });

        // 已上传图片列表
        const photoExist01 = [];
        photoList01.forEach((item, index) => {
            photoExist01.push(
                <div className="photoExist-item clearfix" key={index + 1}>
                    <img src={"http://image.taoerxue.com/" + item} alt=""/>
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
            return new Blob([u8arr], {type: "image/jpeg"});
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
                const file = dataURLtoFile(url);
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
                                        <Select
                                            mode="multiple"
                                            style={{width: '100%'}}
                                            placeholder="请选择机构所属类型（最多三项）"
                                        >
                                            {optionsOfTypeList}
                                        </Select>
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
                                                action="/file/upload"
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
                                                action="/file/upload"
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
        // 机构基本信息
        data: {},
        // 机构类型表
        typeList: [],
        // 机构图片相关变量
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
        // 提交按钮状态变量
        confirmLoading: false
    };

    // 获取机构类型列表
    getInstitutionTypeList = () => {
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
                //         {id: 1, name: "01"},
                //         {id: 2, name: "02"},
                //         {id: 3, name: "03"},
                //         {id: 4, name: "04"},
                //     ]
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        typeList: json.data
                    })
                }
            }
        })
    };

    // 获取机构基本信息
    getData = () => {
        reqwest({
            url: '/institution/getDetail',
            type: 'json',
            method: 'post',
            data: {
                eId: this.props.id
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         institution: {
                //             address: "浙江省杭州市余杭区仓前街道余杭四无粮仓陈列馆",
                //             areaId: 330110,
                //             areaName: "余杭区",
                //             balance: "",
                //             cityId: 330100,
                //             cityName: "杭州市",
                //             companyName: "",
                //             createTime: "",
                //             // description: "\n" + "\n" + "",
                //             detailedAddress: "余杭四无粮仓陈列馆",
                //             id: 1,
                //             lat: "30.291940",
                //             licenseNumber: "",
                //             lng: "120.007284",
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
                //             provinceId: 330000,
                //             provinceName: "浙江省",
                //             star: null,
                //             status: null,
                //             street: "仓前街道",
                //             telephone: "",
                //             typeId: 2,
                //             typeName: "",
                //             typeIdTwo: 3,
                //             updateTime: ""
                //         }
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    // 已有机构类型写入
                    const typeIds = [];
                    if (json.data.institution.typeId) {
                        typeIds.push(json.data.institution.typeId)
                    }
                    if (json.data.institution.typeIdTwo) {
                        typeIds.push(json.data.institution.typeIdTwo)
                    }
                    if (json.data.institution.typeIdThree) {
                        typeIds.push(json.data.institution.typeIdThree)
                    }
                    json.data.institution.typeIds = typeIds;
                    json.data.institution.typeIdTwo = json.data.institution.typeIdTwo ? json.data.institution.typeIdTwo : 0;
                    json.data.institution.typeIdThree = json.data.institution.typeIdThree ? json.data.institution.typeIdThree : 0;
                    // 已有机构图片写入
                    const photoList01 = [];
                    if (json.data.institution.photo && json.data.institution.photo !== "0") {
                        photoList01.push(json.data.institution.photo)
                    } else {
                        json.data.institution.photo = 0;
                    }
                    if (json.data.institution.photo2 && json.data.institution.photo2 !== "0") {
                        photoList01.push(json.data.institution.photo2)
                    } else {
                        json.data.institution.photo2 = 0;
                    }
                    if (json.data.institution.photo3 && json.data.institution.photo3 !== "0") {
                        photoList01.push(json.data.institution.photo3)
                    } else {
                        json.data.institution.photo3 = 0
                    }
                    if (json.data.institution.photo4 && json.data.institution.photo4 !== "0") {
                        photoList01.push(json.data.institution.photo4)
                    } else {
                        json.data.institution.photo4 = 0
                    }
                    if (json.data.institution.photo5 && json.data.institution.photo5 !== "0") {
                        photoList01.push(json.data.institution.photo5)
                    } else {
                        json.data.institution.photo5 = 0
                    }
                    // 备注信息写入
                    json.data.institution.remark = json.data.remark;
                    this.setState({
                        data: json.data.institution,
                        photoList01: photoList01,
                        viewPic02: json.data.institution.icon ? "http://image.taoerxue.com/" + json.data.institution.icon : "",
                        effectPic02: json.data.institution.icon ? "http://image.taoerxue.com/" + json.data.institution.icon : "",
                        data_pic02: json.data.institution.icon,
                        areaId: json.data.institution.areaId,
                        formattedAddress: json.data.institution.address,
                        xy: {
                            x: json.data.institution.lng,
                            y: json.data.institution.lat
                        }
                    }, () => {
                        // 机构地址相关操作
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

    showModal = () => {
        // 获取机构基本信息
        this.getData();
        // 获取机构类型列表
        this.getInstitutionTypeList();
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
    picUpload01 = (para) => {
        if (this.state.photoList01.length >= 5) {
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
                        let photoList01 = this.state.photoList01;
                        photoList01.push(json.data.url);
                        this.setState({
                            photoList01: photoList01,
                            viewPic01: "",
                            avatarEditor01: {
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
        const formData = new FormData();
        formData.append("file", para02);
        this.setState({
            logoLoading: true
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
                    logoLoading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success("图片提交成功");
                    this.setState({
                        effectPic02: para01,
                        data_pic02: json.data.url,
                        logoLoading: false,
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
                            logoLoading: false
                        })
                    }
                }
            }
        });
    };

    // 机构地址处理-----------------------------------
    setArea = (type, value) => {
        // 省份信息变更
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
        // 城市信息变更
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
        // 区信息变更
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
        // 街道信息变更
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
        // 地址信息整体写入
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
    // 获取省列表（包含市区信息）
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
    // 根据区Id获取街道列表
    getStreetList = () => {
        this.state.mapObj.plugin('AMap.DistrictSearch', () => {
            let districtSearch = new window.AMap.DistrictSearch({
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
    // 经纬度写入
    setXY = (para) => {
        this.setState({
            xy: para
        })
    };
    // 定位地址写入
    setFormattedAddress = (para) => {
        this.setState({
            formattedAddress: para
        })
    };
    // 地图标记点信息记录
    setMarkers = (marker) => {
        const arr = [];
        arr.push(marker);
        this.setState({
            markers: arr
        })
    };

    // 信息比对函数
    dataContrast = (values) => {
        const initValues = this.state.data;
        const itemList = ["name", "typeId", "typeIdTwo", "typeIdThree", "telephone", "photo", "photo2", "photo3", "photo4", "photo5", "icon", "fees", "description", "provinceName", "cityName", "areaName", "areaId", "street", "address", "detailedAddress", "lng", "lat", "companyName", "licenseNumber", "additionalProtocol"];
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

    // 确认操作
    handleCreate = () => {
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
            const result = this.dataContrast(values);
            if (!result) {
                message.error("暂无信息更改");
                return;
            }
            // 修改项提交，状态变为待审核
            result.status = 1;
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
                        message.success("机构信息修改成功，已提交审核");
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
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>编辑</span>
                <ItemEditForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    id={this.props.id}
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
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//新增教师表单
const TeacherAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, subjectList, viewPic, effectPic, data_pic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoLoading, confirmLoading} = props;
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
                title="添加教师"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="teacher-add teacher-form item-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_8} label="教师姓名：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '姓名不能为空',
                                }],
                            })(
                                <Input placeholder="请输入教师姓名"/>
                            )}
                        </FormItem>
                        <FormItem className="photo" {...formItemLayout_12} label="教师头像：">
                            {getFieldDecorator('photo', {
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
                                            }}>{data_pic ? "重新提交" : "图片提交"}</Button>
                                </div>
                            )}
                        </FormItem>
                        <FormItem className="phone unnecessary" {...formItemLayout_8} label="联系电话：">
                            {getFieldDecorator('phone', {
                                rules: [{
                                    required: false
                                }],
                            })(
                                <Input placeholder="请输入教师联系方式"/>
                            )}
                        </FormItem>
                        <FormItem className="gender" {...formItemLayout_8} label="性别：">
                            {getFieldDecorator('gender', {
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
                                rules: [{
                                    required: true,
                                    message: '昵称不能为空'
                                }],
                            })(
                                <Input placeholder="请填写教师昵称"/>
                            )}
                        </FormItem>
                        <FormItem className="experienceAge" {...formItemLayout_8} label="教龄(年)：">
                            {getFieldDecorator('experienceAge', {
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
                                rules: [{
                                    required: true,
                                    message: '科目不能为空',
                                }],
                            })(
                                <TreeSelect
                                    style={{width: 300}}
                                    placeholder="请选择教室所教科目（最多三项）"
                                    treeCheckable={true}
                                    treeData={subjectList}
                                    showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                />
                            )}
                        </FormItem>
                        <FormItem className="description longItem" {...formItemLayout_14} label="教师简介：">
                            {getFieldDecorator('description', {
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
            </Modal>
        );
    }
);

//新增教师组件
class TeacherAdd extends Component {
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
        // 科目列表
        subjectList: [],
        confirmLoading: false
    };

    showModal = () => {
        this.getSubjectList();
        this.setState({visible: true});
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
                visible: false
            }, () => {
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
            if (values.typeIds.length > 3) {
                message.error("教学科目最多选三项");
                return;
            }
            if (!this.state.data_pic) {
                message.error("图片未提交");
                return
            }
            values.typeId = Number(values.typeIds[0]);
            values.typeIdTwo = Number(values.typeIds[1]) || 0;
            values.typeIdThree = Number(values.typeIds[2]) || 0;
            values.photo = this.state.data_pic;
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/teacher/saveTeacher',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    eId: this.props.id,
                    name: values.name,
                    nickName: values.nickName,
                    phone: values.phone,
                    photo: values.photo,
                    gender: values.gender,
                    experienceAge: values.experienceAge,
                    description: values.description,
                    typeId: values.typeId,
                    typeIdTwo: values.typeIdTwo,
                    typeIdThree: values.typeIdThree,
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        confirmLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("教师添加成功");
                        this.setState({
                            visible: false
                        }, () => {
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
                <span onClick={this.showModal}>添加教师</span>
                <TeacherAddForm
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
                    subjectList={this.state.subjectList}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//新增课程表单
const CourseAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, courseType, setCourseType, viewPic, setViewPic, picUpload, avatarEditor, setAvatarEditor, photoList, setPhotoList, photoLoading, subjectList, studentTypeList, studentType, setStudentType, studentLevelList, lessonList, fn_lesson, characteristicList, fn_characteristic, institutionList, saveLoading, confirmLoading} = props;
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
            return new Blob([u8arr], {type: "image/jpeg"});
        };
        const setEditorRef = (editor) => this.editor = editor;
        // 图片文件选中后的相关操作
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
        // 点击图片提交按钮的相关操作
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
        // 图片选择框：图片文件未选择时展示
        const uploadButton = (
            <div>
                <Icon type={'plus'}/>
                <div className="ant-upload-text" style={{display: viewPic ? "none" : "block"}}>选择图片</div>
            </div>
        );
        // 展示有效图片的canvas元素：图片文件已选择时展示
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

        // 多机构选项生成
        const institutionOptions = institutionList.map(item => <Checkbox key={item.id}
                                                                         value={item.id}>{item.name}</Checkbox>);

        return (
            <Modal
                visible={visible}
                title="添加课程"
                width={650}
                onCancel={onCancel}
                footer={[
                    <Button key="back" onClick={onCancel} disabled={saveLoading || confirmLoading}>取消</Button>,
                    <Button key="save" type="primary" loading={saveLoading} disabled={confirmLoading}
                            onClick={() => onCreate(1)}>暂存</Button>,
                    <Button key="submit" type="primary" loading={confirmLoading} disabled={saveLoading}
                            onClick={() => onCreate(2)}>保存并提交</Button>
                ]}
                destroyOnClose={true}
            >
                <div className="course-add course-form item-form">
                    <Form layout="vertical">
                        <FormItem className="name longItem" {...formItemLayout_14} label="课程名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    max: 30,
                                    message: '请按要求填写课程名称',
                                }],
                            })(
                                <Input placeholder="请输入课程名称（30字以内）"/>
                            )}
                        </FormItem>
                        <FormItem className="courseType" {...formItemLayout_10} label="课程类型：">
                            {getFieldDecorator('courseType', {
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
                                        <InputNumber value={studentType.ageOne} size="small" style={{width: "50px"}}
                                                     min={0} max={18} precision={0} step={1}
                                                     onChange={(value) => setStudentType(2, value)}/> 至 <InputNumber
                                        value={studentType.ageTwo} size="small" style={{width: "50px"}} min={0} max={18}
                                        precision={0} step={1} onChange={(value) => setStudentType(3, value)}/> 岁
                                    </div>
                                </div>
                            )}
                        </FormItem>
                        <FormItem className="studentLevelId" {...formItemLayout_8} label="适合基础：">
                            {getFieldDecorator('studentLevelId', {
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
                        <FormItem className={courseType === 2 ? "number itemNone" : "number"} {...formItemLayout_8}
                                  label="开班人数：">
                            {getFieldDecorator('number', {
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
                                rules: [{
                                    required: true,
                                    message: '学习目标不能为空',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写学习目标"
                                          autosize={{minRows: 3, maxRows: 10}}/>
                            )}
                        </FormItem>
                        {/*课程特色项*/}
                        {characteristicItems}
                        <FormItem className="sketch longItem" {...formItemLayout_14} label="课程简介：">
                            {getFieldDecorator('sketch', {
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
                                rules: [{
                                    required: true,
                                    message: '购买须知不能为空',
                                }],
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写课程购买须知"
                                          autosize={{minRows: 5, maxRows: 10}}/>
                            )}
                        </FormItem>
                        <FormItem
                            className={institutionOptions.length >= 1 ? "eIds longItem unnecessary" : "eIds longItem unnecessary itemNone"} {...formItemLayout_16}
                            label="将课程信息同步到如下分机构：">
                            {getFieldDecorator('eIds', {
                                rules: [{
                                    required: false,
                                }],
                            })(
                                <Checkbox.Group style={{width: '100%'}}>
                                    {institutionOptions}
                                </Checkbox.Group>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        )
    }
);

//新增课程组件
class CourseAdd extends Component {
    state = {
        visible: false,
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
        // 课程课时列表
        lessonList: [],
        // 课程特色列表
        characteristicList: [{index: 1, value: ""}],
        // 关联机构列表
        institutionList: [],
        // 暂存按钮状态变量
        saveLoading: false,
        // 提交按钮状态变量
        confirmLoading: false
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
                //                 {id: 11, name: "11"},
                //                 {id: 12, name: "12"},
                //                 {id: 13, name: "13"},
                //             ]
                //         },
                //         {
                //             id: 2,
                //             name: "02",
                //             list: [
                //                 {id: 21, name: "21"},
                //                 {id: 22, name: "22"},
                //                 {id: 23, name: "23"},
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

    // 获取适合年龄与适合基础列表
    getStudentTypeAndLevelList = () => {
        reqwest({
            url: '/course/getTypeAndBasics',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                eId: this.props.id
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
                        studentTypeList: json.data.studentTypeList,
                        studentLevelList: json.data.studentLevelList,
                    })
                }
            }
        });
    };

    // 获取关联机构列表
    getInstitutionList = () => {
        reqwest({
            url: '/institution/getEducations',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                eId: this.props.id
            },
            error: (XMLHttpRequest) => {
                // const json = {
                //     result: 0,
                //     data: {
                //         list: [
                //             {id: 1, name: "01"},
                //             {id: 2, name: "02"},
                //             {id: 3, name: "03"},
                //             {id: 4, name: "04"},
                //         ]
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    this.setState({
                        institutionList: json.data.list
                    })
                }
            }
        });
    };

    showModal = () => {
        this.getSubjectList();
        this.getStudentTypeAndLevelList();
        this.getInstitutionList();
        this.setState({visible: true});
    };

    // 课程类型设置
    setCourseType = (value) => {
        this.setState({
            courseType: value
        })
    };

    // 图片处理
    setViewPic = (para) => {
        this.setState({
            viewPic: para
        })
    };
    setAvatarEditor = (index, value) => {
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
            tempItems.forEach((item, itemIndex) => {
                if (item.index === index) {
                    index = itemIndex
                }
            });
            if (value === undefined) {
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

    // 取消处理
    handleCancel = () => {
        const form = this.form;
        // 取消操作函数
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
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
                    institutionList: [],
                    saveLoading: false,
                    confirmLoading: false
                });
            })
        };
        // 获取表单信息
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

    // 确认处理
    handleCreate = (type) => {
        const form = this.form;
        // 部分录入
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
            values.typeId = values.typeId ? values.typeId[1] : null;
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
            // studentType不存在于studentTypeList中，则将studentType的值写入suitAge并清空则studentType
            if (typeof(values.studentType) === typeof("")) {
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
                if (err) {
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
            // 多机构信息写入
            if (values.eIds) {
                values.eIds = values.eIds.join(",")
            }
            this.setState({
                saveLoading: true
            });
            reqwest({
                url: '/course/publish',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    eId: this.props.id,
                    name: values.name,
                    photo: values.photo,
                    photo2: values.photo2,
                    photo3: values.photo3,
                    photo4: values.photo4,
                    photo5: values.photo5,
                    typeId: values.typeId,
                    studentType: values.studentType,
                    suitAge: values.suitAge,
                    studentLevelId: values.studentLevelId,
                    courseType: values.courseType,
                    number: values.number,
                    duration: values.duration,
                    originalPrice: values.originalPrice,
                    price: values.price,
                    characteristic: values.characteristic,
                    sketch: values.sketch,
                    target: values.target,
                    count: values.count,
                    lessonName: values.lessonName,
                    tips: values.tips,
                    eIds: values.eIds
                },
                error: (XMLHttpRequest) => {
                    message.error("保存失败");
                    this.setState({
                        saveLoading: false
                    })
                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("课程暂存成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
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
                                institutionList: [],
                                saveLoading: false,
                                confirmLoading: false
                            });
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
                                saveLoading: false,
                            })
                        }
                    }
                }
            })
        }
        // 完全录入
        if (type === 2) {
            // 获取表单数据并进行必填项校验
            form.validateFieldsAndScroll((err, values) => {
                if (err) {
                    return;
                }
                // 课程图片写入与校验
                values.photo = this.state.photoList[0];
                values.photo2 = this.state.photoList[1] || 0;
                values.photo3 = this.state.photoList[2] || 0;
                values.photo4 = this.state.photoList[3] || 0;
                values.photo5 = this.state.photoList[4] || 0;
                if (!values.photo) {
                    message.error("课程图片未提交");
                    return
                }
                // 课程typeId写入(二级科目id写入)
                values.typeId = values.typeId ? values.typeId[1] : null;
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
                    return
                }
                // 校验studentType是否已存在于studentTypeList中，是则以id替换文本，studentType数据类型由string变更为number
                this.state.studentTypeList.forEach((item) => {
                    if (item.name === values.studentType) {
                        values.studentType = item.id
                    }
                });
                // studentType不存在于studentTypeList中，则将studentType的值写入suitAge并清空则studentType
                if (typeof(values.studentType) === typeof("")) {
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
                // 多机构信息写入
                if (values.eIds) {
                    values.eIds = values.eIds.join(",")
                }
                this.setState({
                    confirmLoading: true
                });
                reqwest({
                    url: '/course/publish',
                    type: 'json',
                    method: 'post',
                    headers: {
                        Authorization: sessionStorage.token
                    },
                    data: {
                        eId: this.props.id,
                        name: values.name,
                        photo: values.photo,
                        photo2: values.photo2,
                        photo3: values.photo3,
                        photo4: values.photo4,
                        photo5: values.photo5,
                        typeId: values.typeId,
                        studentType: values.studentType,
                        suitAge: values.suitAge,
                        studentLevelId: values.studentLevelId,
                        courseType: values.courseType,
                        number: values.number,
                        duration: values.duration,
                        originalPrice: values.originalPrice,
                        price: values.price,
                        characteristic: values.characteristic,
                        sketch: values.sketch,
                        target: values.target,
                        count: values.count,
                        lessonName: values.lessonName,
                        tips: values.tips,
                        eIds: values.eIds
                    },
                    error: (XMLHttpRequest) => {
                        message.error("保存失败");
                        this.setState({
                            confirmLoading: false
                        })
                    },
                    success: (json) => {
                        if (json.result === 0) {
                            reqwest({
                                url: '/course/checkCourse',
                                type: 'json',
                                method: 'post',
                                headers: {
                                    Authorization: sessionStorage.token
                                },
                                data: {
                                    id: json.data,
                                    status: 1
                                },
                                error: (XMLHttpRequest) => {
                                    message.error("提交审核失败");
                                    this.setState({
                                        confirmLoading: false
                                    })
                                },
                                success: (json) => {
                                    if (json.result === 0) {
                                        message.success("提交审核成功");
                                        this.setState({
                                            visible: false
                                        }, () => {
                                            this.setState({
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
                                                institutionList: [],
                                                saveLoading: false,
                                                confirmLoading: false
                                            });
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
                            });
                        } else {
                            message.error(json.message);
                            this.setState({
                                confirmLoading: false
                            })
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
            <a style={{display: this.props.status ? "display" : "none"}}>
                <span onClick={this.showModal}>添加课程</span>
                <CourseAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    courseType={this.state.courseType}
                    setCourseType={this.setCourseType}
                    subjectList={this.state.subjectList}
                    studentTypeList={this.state.studentTypeList}
                    studentType={this.state.studentType}
                    setStudentType={this.setStudentType}
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
                    institutionList={this.state.institutionList}
                    saveLoading={this.state.saveLoading}
                    confirmLoading={this.state.confirmLoading}
                />
            </a>
        );
    }
}

//开通店铺表单
const ShopSaveForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, loading, viewPic, fn_pic, confirmLoading} = props;
        const {getFieldDecorator} = form;

        //图片处理
        const getBase64 = (img, callback) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => callback(reader.result));
            reader.readAsDataURL(img);
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
            return isIMG && isLt2M;
        };
        const picHandleChange = (info) => {
            if (info.file.status === 'uploading') {
                fn_pic(true);
                return;
            }
            if (info.file.status === 'done') {
                getBase64(info.file.originFileObj, (imageUrl) => {
                    fn_pic(false, imageUrl, info.file.response.data.url);
                });
            }
            if (info.file.status === 'error') {
                // Get this url from response in real world.
                getBase64(info.file.originFileObj, (imageUrl) => {
                    fn_pic(false, imageUrl, "123456");
                });
            }
        };
        const uploadButton = (
            <div>
                <Icon type={loading ? 'loading' : 'plus'}/>
                <div className="ant-upload-text" style={{display: loading ? "none" : "block"}}>选择图片</div>
            </div>
        );

        return (
            <Modal
                visible={visible}
                title="添加店铺"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
            >
                <div className="shop-add shop-form">
                    <Form layout="vertical">
                        <FormItem className="name" {...formItemLayout_12} label="店铺名称：">
                            {getFieldDecorator('name', {
                                rules: [{
                                    required: true,
                                    message: '店铺名称不能为空',
                                }],
                            })(
                                <Input placeholder="请输入店铺名称"/>
                            )}
                        </FormItem>
                        <FormItem className="photo noInput" {...formItemLayout_8} label="图片：">
                            {getFieldDecorator('photo', {
                                rules: [{
                                    required: true,
                                    message: '请上传店铺图片'
                                }]
                            })(
                                <Upload
                                    name="file"
                                    listType="picture-card"
                                    className="avatar-uploader"
                                    showUploadList={false}
                                    action="/file/upload"
                                    beforeUpload={beforeUpload}
                                    onChange={picHandleChange}
                                >
                                    {viewPic ? <img src={viewPic} alt=""/> : uploadButton}
                                </Upload>
                            )}
                        </FormItem>
                        <FormItem className="details noInput longItem" {...formItemLayout_14} label="店铺简介：">
                            {getFieldDecorator('details', {
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

//开通店铺组件
class ShopSave extends Component {
    state = {
        visible: false,
        loading: false,
        viewPic: "",
        data_pic: "",
        confirmLoading: false
    };

    showModal = () => {
        this.setState({visible: true});
    };

    //图片处理
    fn_pic = (para01, para02, para03) => {
        this.setState({
            loading: para01,
            viewPic: para02 || "",
            data_pic: para03 || ""
        });
    };

    handleCancel = () => {
        const form = this.form;
        const cancel = () => {
            this.setState({
                visible: false
            }, () => {
                this.setState({
                    loading: false,
                    viewPic: "",
                    data_pic: "",
                    confirmLoading: false
                });
                form.resetFields();
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
            values.photo = this.state.data_pic;
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/shop/saveShop',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    eId: this.props.id,
                    name: values.name,
                    photo: values.photo,
                    details: values.details
                },
                error: (XMLHttpRequest) => {

                },
                success: (json) => {
                    if (json.result === 0) {
                        message.success("店铺添加成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                loading: false,
                                viewPic: "",
                                data_pic: "",
                                confirmLoading: false
                            });
                            form.resetFields();
                        });
                        this.props.recapture();
                    } else {
                        message.error(json.message);
                        this.setState({
                            confirmLoading: false
                        })
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
            <a style={{display: "none"}}>
                <span onClick={this.showModal}>开通店铺</span>
                <ShopSaveForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    loading={this.state.loading}
                    viewPic={this.state.viewPic}
                    fn_pic={this.fn_pic}
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
            url: '/institution/getDetail',
            type: 'json',
            method: 'post',
            data: {
                eId: this.props.id
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
                //         institution: {
                //             address: "",
                //             areaId: null,
                //             areaName: "",
                //             balance: "",
                //             cityId: null,
                //             cityName: "",
                //             companyName: "",
                //             createTime: "",
                //             description: "",
                //             detailedAddress: "",
                //             id: 177,
                //             lat: "",
                //             licenseNumber: "",
                //             lng: "",
                //             managerAddress: "",
                //             managerName: "",
                //             managerPhone: "",
                //             name: "",
                //             number: 1,
                //             photo: "",
                //             icon: "",
                //             fees: "",
                //             provinceId: null,
                //             provinceName: "",
                //             star: null,
                //             status: 2,
                //             telephone: "",
                //             typeId: 1,
                //             updateTime: "",
                //             additionalProtocol: "",
                //             realNameAuthentication: 0
                //         },
                //         typeName: "",
                //         typeNameTwo: "",
                //         typeNameThree: "",
                //     }
                // };
            },
            success: (json) => {
                if (json.result === 0) {
                    json.data.institution.typeName = json.data.typeName;
                    json.data.institution.typeNameTwo = json.data.typeNameTwo;
                    json.data.institution.typeNameThree = json.data.typeNameThree;
                    this.setState({
                        loading: false,
                        data: json.data.institution
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
            let tempStatus = "";
            if (this.state.data.status === 1) {
                tempStatus = "审核中";
            }
            if (this.state.data.status === 2) {
                tempStatus = "审核通过";
            }
            if (this.state.data.status === 3) {
                tempStatus = "审核驳回";
            }
            if (this.state.data.status === 0) {
                tempStatus = "禁用";
            }
            let realNameState = "";
            if (this.state.data.realNameAuthentication === 0) {
                realNameState = "未认证";
            }
            if (this.state.data.realNameAuthentication === 1) {
                realNameState = "已认证";
            }
            dataSource = [
                <div className="name">
                    <span className="item-name">机构名称：</span>
                    <span className="item-content">{this.state.data.name}</span>
                </div>,
                <div className="educationKey">
                    <span className="item-name">机构码：</span>
                    <span className="item-content">{this.state.data.educationKey}</span>
                </div>,
                <div className="logo">
                    <span className="item-name">LOGO：</span>
                    {this.state.data.icon ? <img src={"http://image.taoerxue.com/" + this.state.data.icon} alt=""
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
                    <span className="item-name">排序：</span>
                    <span className="item-content">{this.state.data.sort}</span>
                </div>,
                <div className="managerPhone">
                    <span className="item-name">联系电话：</span>
                    <span className="item-content">{this.state.data.managerPhone}</span>
                </div>,
                <div className="managerPhone">
                    <span className="item-name">点击预约试听次数：</span>
                    <span className="item-content">{this.state.data.subscribeNumber}</span>
                </div>,
                <div className="description">
                    <span className="item-name">机构简介：</span>
                    <pre>
                    <span className="item-content">{this.state.data.description}</span>
                </pre>
                </div>,
                <div className="photo">
                    <span className="item-name">图片一：</span>
                    <img src={"http://image.taoerxue.com/" + this.state.data.photo} alt="" className="item-content"/>
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
                    <span className="item-content">{this.state.data.address}</span>
                </div>,
                <div className="telephone">
                    <span className="item-name">机构电话：</span>
                    <span className="item-content">{this.state.data.telephone}</span>
                </div>,
                <div className="star">
                    <span className="item-name">机构星级：</span>
                    <span className="item-content">{this.state.data.star}</span>
                </div>,
                <div className="companyName">
                    <span className="item-name">公司名称：</span>
                    <span className="item-content">{this.state.data.companyName}</span>
                </div>,
                <div className="licenseNumber">
                    <span className="item-name">信用代码：</span>
                    <span className="item-content">{this.state.data.licenseNumber}</span>
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
                <div className="realNameState">
                    <span className="item-name">实名认证：</span>
                    <span className="item-content">{realNameState}</span>
                </div>,
                <div className="mainEducation">
                    <span className="item-name">是否主机构：</span>
                    <span className="item-content">{this.state.data.mainEducation ? "否" : "是"}</span>
                </div>,
                <div className="createTime">
                    <span className="item-name">创建时间：</span>
                    <span
                        className="item-content">{this.state.data.createTime ? this.timeHandle(this.state.data.createTime) : ""}</span>
                </div>,
                <div className="status">
                    <span className="item-name">状态：</span>
                    <span className="item-content">{tempStatus}</span>
                </div>
            ];
        } else {
            dataSource = ""
        }
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
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

//机构列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        // this.onInputChange = this.onInputChange.bind(this);
        this.state = {
            loading: true,
            // value: this.props.itemInfo.input.value,
            data: [],
            // 机构类型表
            typeList: [],
            // 当前机构类型
            type: null,
            // 当前机构状态
            status: null,
            pagination: {
                current: 1,
                pageSize: Number(localStorage.institutionPageSize) || 10,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            }
        };
    }

    // onInputChange(e) {
    //     this.setState({ value: e.target.value } );
    // }

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    //可编辑的单元格渲染
    // renderEditableColumns(text) {
    //     return (
    //         <editableCell value={text}/>
    //     );
    // }

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
    getData = (keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/institution/getEducationList',
            type: 'json',
            method: 'post',
            data: {
                // 机构类型
                typeId: this.state.type,
                // 机构状态
                status: this.state.status,
                // 机构名称
                educationName: keyword ? keyword.educationName : this.props.keyword.educationName,
                startTime: keyword ? keyword.startTime : this.props.keyword.startTime,
                endTime: keyword ? keyword.endTime : this.props.keyword.endTime,
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
                        const fnFilter = (para) => {
                            return para.id === item.id
                        };
                        const tempShopStatus = json.data.shopStatus ? json.data.shopStatus.filter(fnFilter)[0].shopStatus : 1;
                        let tempStatus = "";
                        if (item.status === 1) {
                            tempStatus = "审核中"
                        }
                        if (item.status === 2) {
                            tempStatus = "启用"
                        }
                        if (item.status === 3) {
                            tempStatus = "审核失败"
                        }
                        if (item.status === 0) {
                            tempStatus = "禁用"
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            educationKey: item.educationKey,
                            index: index + 1,
                            sort: item.sort,
                            photo: item.photo,
                            name: item.name,
                            address: item.areaName,
                            typeName: (item.typeName || "") + (item.typeNameTwo ? ("/" + item.typeNameTwo) : "") + (item.typeNameThree ? ("/" + item.typeNameThree) : ""),
                            managerName: item.managerName,
                            telephone: item.telephone,
                            subscribeNumber: item.subscribeNumber,
                            managerPhone: item.managerPhone,
                            createUserName: item.createUserName,
                            shopStatus: tempShopStatus,
                            createTime: item.createTime ? this.dateHandle(item.createTime) : "",
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

    // 获取机构类型列表
    getInstitutionTypeList = () => {
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
                //         {id: 1, name: "001"}
                //     ]
                // };
            },
            success: (json) => {
                const typeList = json.data.map((item) => {
                    return {text: item.name, value: item.id}
                });
                if (json.result === 0) {
                    this.setState({
                        typeList: typeList
                    })
                }
            }
        });
    };

    //机构禁用
    itemBan = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/institution/checkEducation',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                eId: id,
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
                    message.success("机构禁用成功");
                    this.getData(this.props.keyword);
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

    //机构启用
    itemOpen = (id) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/institution/checkEducation',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                eId: id,
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
                    message.success("机构启用成功");
                    this.getData(this.props.keyword);
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

    // 设置排序
    setSort = (sortNum) => {
        // this.getData();
    }

    componentWillMount() {
        this.getData();
        this.getInstitutionTypeList();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.keyword === this.props.keyword && nextProps.flag_add === this.props.flag_add) {
            return;
        }
        this.getData(nextProps.keyword);
    }

    render() {
        const columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: '4%',
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '排序',
                dataIndex: 'sort',
                width: '8%',
                editable: true,
                // render: (text, record) => this.renderEditableColumns(text, record, 'sort'),
                // render: (text, record) => this.renderColumns(text, record, 'index'),
                // render: (text, record) => {
                //     return (
                //         <input style={{textAlign: "center"}} value={text}/> 
                        // <div><inputNumber style={{display: "block",width: "100%",height: "30px"}} min={0} max={1000} defaultValue={0} onChange={onChange}/></div>
                        // <Form>
                        //     <FormItem style={{ margin: 0 }}>
                        //         {this.props.form.getFieldDecorator(text, {
                        //             rules: [{
                        //                 required: true,
                        //                 message: "sort is required.",
                        //             }],
                        //             initialValue: "sort",
                        //             })(
                        //             <Input
                        //                 placeholder="sort"
                        //                 ref={node => (this.input = node)}
                        //                 onPressEnter={this.save}
                        //                 onBlur={this.save}
                        //             />
                        //         )}
                        //     </FormItem>
                        // </Form>
                    // )
                // },
            },
            {
                title: '机构名称',
                dataIndex: 'name',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '所在地区',
                dataIndex: 'address',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'address'),
            },
            {
                title: '照片',
                dataIndex: 'photo',
                width: '6%',
                render: (text, record) => (<img style={{width: '45px', height: "25px"}} alt="" src={record["photo"]}/>)
            },
            {
                title: '机构类型',
                dataIndex: 'typeName',
                width: '9%',
                filters: this.state.typeList,
                // 单选
                filterMultiple: false,
                render: (text, record) => this.renderColumns(text, record, 'typeName'),
            },
            {
                title: '管理员',
                dataIndex: 'managerName',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'managerName'),
            },
            {
                title: '联系电话',
                dataIndex: 'telephone',
                width: '8%',
                render: (text, record) => this.renderColumns(text, record, 'telephone'),
            },
            {
                title: '点击预约试听次数',
                dataIndex: 'subscribeNumber',
                width: '10%',
                render: (text, record) => this.renderColumns(text, record, 'subscribeNumber'),
            },
            {
                title: '创建人',
                dataIndex: 'createUserName',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'createUserName'),
            },
            {
                title: '创建日期',
                dataIndex: 'createTime',
                width: '6%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '状态',
                dataIndex: 'status',
                width: '6%',
                filters: [
                    {text: '启用', value: 2},
                    {text: '禁用', value: 0},
                ],
                filterMultiple: false,
                render: (text, record) => this.renderColumns(text, record, 'status'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*机构详情*/}
                            <ItemDetails id={record.id} opStatus={this.props.opObj.select}
                                         toLoginPage={this.props.toLoginPage}/>
                            {/*机构编辑*/}
                            <ItemEdit id={record.id} educationKey={record.educationKey}
                                      toLoginPage={this.props.toLoginPage} opStatus={this.props.opObj.modify}/>
                            {/*教师添加*/}
                            <TeacherAdd id={record.id} toLoginPage={this.props.toLoginPage}
                                        status={record.status === "启用" ? 1 : 0}/>
                            {/*课程添加*/}
                            <CourseAdd id={record.id} status={record.status === "启用" ? 1 : 0}/>
                            {/*机构禁用*/}
                            <Popconfirm title="确认禁用?"
                                        placement="topRight"
                                        onConfirm={() => this.itemBan(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="立即禁用"
                                        cancelText="取消">
                                {
                                    <a style={{display: this.props.opObj.modify && record.statusCode === 2 ? "inline" : "none"}}>禁用</a>
                                }
                            </Popconfirm>
                            {/*机构启用*/}
                            <Popconfirm title="确认启用?"
                                        placement="topRight"
                                        onConfirm={() => this.itemOpen(record.id)}
                                        onCancel=""
                                        okType="danger"
                                        okText="立即启用"
                                        cancelText="取消">
                                {
                                    <a style={{display: this.props.opObj.modify && record.statusCode === 0 ? "inline" : "none"}}>启用</a>
                                }
                            </Popconfirm>
                            <ShopSave id={record.id} recapture={this.getData}
                                      shopStatus={this.props.opObj.modify && record.status === "启用" && record.shopStatus === 0 ? 1 : 0}/>
                        </div>
                    )
                }
            }
        ];
        const components = {
            body: {
              row: EditableFormRow,
              cell: EditableCell,
            },
          };
        // let columns = columns1.map((col) => {
        //     if (!col.editable) {
        //       return col;
        //     }
        //     return {
        //       ...col,
        //       onCell: record => ({
        //         record,
        //         editable: col.editable,
        //         dataIndex: col.dataIndex,
        //         title: col.title,
        //         handleSave: this.handleSave,
        //       }),
        //     };
        //   });
        return <Table bordered
                      components={components}
                      loading={this.state.loading}
                      dataSource={this.state.data}
                      pagination={this.state.pagination}
                      columns={columns}
                      onChange={this.handleTableChange}/>;
    }
}

class Institutions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            type: '1',
            // 获取机构列表所需关键词
            keyword: {
                educationName: "",
                startTime: "",
                endTime: "",
            },
            flag_add: false
        };
        this.optionsCity = [
            <Option key={1} value="1">{"全部"}</Option>,
            <Option key={2} value="2">{"城市1"}</Option>,
            <Option key={3} value="3">{"城市2"}</Option>,
            <Option key={4} value="4">{"城市3"}</Option>,
        ];
    }

    //城市选择设置
    setCity = (value) => {
        console.log(`selected;${value}`);
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
                    educationName: value,
                    startTime: this.state.keyword.startTime,
                    endTime: this.state.keyword.endTime,
                }
            })
        }
    };

    setStartTime = (date, dateString) => {
        this.setState({
            keyword: {
                educationName: this.state.keyword.educationName,
                startTime: dateString,
                endTime: this.state.keyword.endTime,
            }
        })
    };

    setEndTime = (date, dateString) => {
        this.setState({
            keyword: {
                educationName: this.state.keyword.educationName,
                startTime: this.state.keyword.startTime,
                endTime: dateString,
            }
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
            <div className="institutions">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                {/*城市筛选*/}
                                <Select defaultValue="全部"
                                        style={{
                                            width: "150px",
                                            float: "left",
                                            marginRight: "20px"
                                        }}
                                        onChange={this.setCity}>
                                    {this.optionsCity}
                                </Select>
                                {/*机构名称筛选*/}
                                <Search
                                    placeholder="请输入机构名称信息"
                                    onSearch={this.setName}
                                    enterButton
                                    style={{width: "320px", float: "left", marginRight: "20px"}}
                                />
                                {/*机构创建日期筛选*/}
                                <span>日期筛选： </span>
                                <DatePicker placeholder="请选择日期"
                                            style={{width: "120px"}}
                                            onChange={this.setStartTime}/>
                                <span style={{margin: "0 10px"}}>至</span>
                                <DatePicker placeholder="请选择日期"
                                            style={{width: "120px"}}
                                            onChange={this.setEndTime}/>
                                {/*机构添加*/}
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd opStatus={this.state.opObj.add} toLoginPage={this.toLoginPage}/>
                                </div>
                            </header>
                            {/*机构列表*/}
                            <div className="table-box">
                                <DataTable opObj={this.state.opObj} keyword={this.state.keyword}
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

export default Institutions;