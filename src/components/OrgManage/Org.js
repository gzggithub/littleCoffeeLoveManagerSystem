import React, {Component} from 'react';
import {
    HashRouter as Router,
    Link,
    withRouter,
} from 'react-router-dom';
import '../../config/config';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';
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
    Icon,
    message,
    List,
    TreeSelect,
    Spin,
    Tooltip,
    Tree,
    Layout,
} from 'antd';
import reqwest from 'reqwest';
import AvatarEditor from 'react-avatar-editor'

const {Sider, Content,} = Layout;
const Search = Input.Search;
const {Option} = Select;
const FormItem = Form.Item;
const {TextArea} = Input;
const { TreeNode } = Tree;

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

    toggleEdit = (valuess) => {
        console.log(valuess);
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
            // 判断排序值是否改变，不变就不用排序，只有改变才请求sort接口
            if (props1 !== Number(values.sort)) {
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
                            {form.getFieldDecorator(dataIndex, {
                                rules: [{
                                    required: false,                                   
                                    message: "只能输入数字",                                    
                                }],                               
                                initialValue: record[dataIndex],
                                })(
                                <Input style={{textAlign: "center"}}
                                    ref={node => (this.input = node)}
                                    onPressEnter={this.sort.bind(this, record[dataIndex])}
                                    onBlur={this.sort.bind(this, record[dataIndex])}
                                    placeholder="双击设置排序"
                                />
                            )}
                        </FormItem>
                        ) : (
                        <div
                            className="editable-cell-value-wrap "
                            onClick={this.toggleEdit}
                        >
                            <Input style={{textAlign: "center"}}
                                ref= {node => (this.input = node)}
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

//添加机构表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, allTypeList, typeList, checkPhone, checkTel, handleSearch, provinceList, cityList, districtList, streetList, markers, setMarkers, area, setArea, mapObj, setXY, setFormattedAddress, formattedAddress, detailedAddress, reqwestUploadToken, viewPic01, setViewPic01, picUpload01, avatarEditor01, setAvatarEditor01, photoList01, setPhotoList01, photoLoading, viewPic02, effectPic02, data_pic02, setViewPic02, picUpload02, avatarEditor02, setAvatarEditor02, logoLoading, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 总机构选项生成
        const optionsOfAllTypeList = [];
        if (allTypeList) {
            allTypeList.forEach((item, index) => {
                optionsOfAllTypeList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
            });
        }        

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
                reqwestUploadToken();
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
                reqwestUploadToken();
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
                                console.log(result_.geocodes[0].location);
                                // 生成当前标记点
                                marker.setPosition(result_.geocodes[0].location);
                                mapObj.setCenter(marker.getPosition());
                                setMarkers(marker);
                                // address字段(定位点地址)写入
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
                                        <span>*填写帮助</span>
                                    </Tooltip>
                                </div>
                            </Col>
                            <Col span={8}>
                                <FormItem className="typeIds" label="机构类型：">
                                    {getFieldDecorator('typeIds', {
                                        rules: [
                                            {
                                                required: true,
                                                message: '机构类型不能为空',
                                            },
                                            // 自定义校验导致添加事件不能执行（原因是缺少callback()）
                                            // {
                                            //     validator: checkOrgType,
                                            // }
                                        ],
                                    })(
                                       /* <Select
                                            style={{width: '100%'}}
                                            placeholder="请选择机构类型"
                                            // onChange={handleFirstChange}
                                        >
                                            {optionsOfTypeList}
                                        </Select>*/
                                        <TreeSelect
                                            style={{width: 300}}
                                            placeholder="请选择机构类型（最多三项）"
                                            dropdownStyle={{maxHeight: 400, overflow: "auto"}}
                                            treeCheckable={true}
                                            treeData={typeList}
                                            // showshowCheckedStrategy={TreeSelect.SHOW_ALL}
                                            // 父Id和子Id都显示
                                            // 我怎么判断是父Id还是子id
                                            showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                            // showCheckedStrategy={TreeSelect.SHOW_PARENT}
                                            //当子项全选的时候是显示父Id                                       
                                        />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="parentId" label="父级：">
                                    {getFieldDecorator('parentId', {
                                        rules: [{
                                            required: false,
                                            message: '请选择总机构',
                                        }],
                                    })(
                                        <Select
                                            showSearch
                                            style={{width: '100%'}}
                                            placeholder="请选择总机构"
                                            onSearch={handleSearch}
                                            // onChange={handleChange}                        
                                            filterOption={false}
                                            // optionFilterProp="children"
                                            notFoundContent={null}                                
                                        >
                                            {optionsOfAllTypeList}
                                        </Select>
                                        /*<TreeSelect
                                            style={{width: 300}}
                                            placeholder="请选择机构类型（最多三项）"
                                            dropdownStyle={{maxHeight: 400, overflow: "auto"}}
                                            treeCheckable={true}
                                            treeData={typeList}
                                            // showshowCheckedStrategy={TreeSelect.SHOW_ALL}
                                            // 父Id和子Id都显示
                                            // 我怎么判断是父Id还是子id
                                            showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                            // showCheckedStrategy={TreeSelect.SHOW_PARENT}
                                            //当子项全选的时候是显示父Id                                       
                                        />*/
                                    )}
                                </FormItem>
                            </Col>                             
                        </Row>
                        <div className="ant-line"></div>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="managerName ant-form-explain-reset-css" label="管理员：">
                                    {getFieldDecorator('managerName', {
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
                                <FormItem className="managerPhone" label="手机号码：">
                                    {getFieldDecorator('managerPhone', {
                                        rules: [
                                            {   
                                                required: true,
                                                validator: checkPhone,
                                            }
                                        ],
                                    })(
                                        <Input placeholder="请输入管理员手机号" 
                                        // onBlur={(event) => setPhone(event.target.value)}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                            {/*<Col span={8}>
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
                                    )}
                                </FormItem>
                            </Col>*/}     
                        </Row>
                        <div className="ant-line"></div>
                        <Row>
                            <Col span={10}>
                                <FormItem className="photo photos"  label="机构图片：">
                                    {getFieldDecorator('photos', {
                                        rules: [{
                                            required: true,
                                            message: '机构图片不能为空',
                                        }],
                                    })(
                                        <div className="itemBox">
                                            {photoExist01}                                            
                                            <Upload
                                                name="file"
                                                multiple={true}
                                                showUploadList={false}
                                                listType="picture-card"
                                                className="avatar-uploader"
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
                                <FormItem className="businessHours" label="营业时间：">
                                    {getFieldDecorator('businessHours', {
                                        initialValue: '周一至周日  09:00-21:00',
                                        rules: [
                                            {
                                                required: true,
                                                message: '营业时间不能为空',
                                            },
                                            {
                                                max: 100,
                                                message: '营业时间不能超过100个字',                                            
                                            },
                                        ],
                                    })(
                                        <Input placeholder="如：周一至周日  09:00-21:00"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="scope" label="商家面积：">
                                    {getFieldDecorator('scope', {
                                        rules: [
                                            {
                                                required: true,
                                                message: '商家面积不能为空',
                                            }
                                        ],
                                    })(
                                        <InputNumber 
                                            style={{width: "100%"}} 
                                            placeholder="请输入商家面积"
                                            min={0}
                                            formatter={value => `${value}㎡`}
                                            parser={value => value.replace('㎡', '')}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem className="classNumber" label="教室数目：">
                                    {getFieldDecorator('classNumber', {
                                        rules: [
                                            {
                                                required: true,
                                                message: '教室数目不能为空',
                                            }
                                        ],
                                    })(
                                        <InputNumber 
                                            style={{width: "100%"}} 
                                            placeholder="请输入教室数目"
                                            formatter={value => `${value}间`}
                                            parser={value => value.replace('间', '')}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                            <div className="" style={{color: "#FFF"}}>4554</div>
                            <Col span={8}>
                                <FormItem className="teacherNumber" label="师资力量：">
                                    {getFieldDecorator('teacherNumber', {
                                        rules: [
                                            {
                                                required: true,
                                                message: '师资力量不能为空',
                                            },
                                        ],
                                    })(
                                        // <div> 不能加父容器，加了，数据回显不了
                                            <InputNumber 
                                                style={{width: "100%"}} 
                                                placeholder="请输入师资力量"
                                                formatter={value => `${value}名`}
                                                parser={value => value.replace('名', '')}
                                                />
                                        // </div>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={16}>
                                <Row gutter={8}>
                                    <Col span={4}>
                                        <FormItem className="label_01" label="特色标签：">
                                            {getFieldDecorator('label_01', {
                                                rules: [{
                                                    required: false,
                                                    message: "只能输入4个字",
                                                    max: 4,
                                                }],
                                            })(
                                                <Input  placeholder="如：小班教学"/>     
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={4}>
                                        <FormItem className="label_02" label="">
                                            {getFieldDecorator('label_02', {
                                                rules: [{
                                                    required: false,
                                                    message: "只能输入4个字",
                                                    max: 4,
                                                }],
                                            })(
                                                <Input style={{marginTop: "31px"}} placeholder="如：免费WiFi"/>    
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={4}>
                                        <FormItem className="label_03" label="">
                                            {getFieldDecorator('label_03', {
                                                rules: [{
                                                    required: false,
                                                    message: "只能输入4个字",
                                                    max: 4,
                                                }],
                                            })(
                                                <Input style={{marginTop: "31px"}}  placeholder="如：一对一"/>     
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={4}>
                                        <FormItem className="label_04" label="">
                                            {getFieldDecorator('label_04', {
                                                rules: [{
                                                    required: false,
                                                    message: "只能输入4个字",
                                                    max: 4,
                                                }],
                                            })(
                                                <Input style={{marginTop: "31px"}}  placeholder="如：夏令营"/>     
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={4}>
                                        <FormItem className="label_05" label="">
                                            {getFieldDecorator('label_05', {
                                                rules: [{
                                                    required: false,
                                                    message: "只能输入4个字",
                                                    max: 4,
                                                }],
                                            })(
                                                <Input style={{marginTop: "31px"}} placeholder="如：主题活动"/>     
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={4}>
                                        <FormItem className="label_06" label="">
                                            {getFieldDecorator('label_06', {
                                                rules: [{
                                                    required: false,
                                                    message: "只能输入4个字",
                                                    max: 4,
                                                }],
                                            })(
                                                <Input style={{marginTop: "31px"}} placeholder="如：生日会"/>     
                                            )}
                                        </FormItem>
                                    </Col>
                                    <div  style={{position: 'absolute', top: 6, right: 20}}>
                                        <span>说明：每个标签不能超过四个字</span>
                                    </div>
                                </Row>
                            </Col>
                        </Row>
                        <div className="ant-line"></div>

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
                                        <FormItem className="area longItem" label="所在区域：">
                                            {getFieldDecorator('area', {
                                                rules: [{
                                                    required: false,
                                                    message: '所在区域未选择'
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
                                <div className="ant-line"></div>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <FormItem className="detailedAddress" label="详细地址">
                                            {getFieldDecorator('detailedAddress', {
                                                initialValue: detailedAddress || '',
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
                                        <FormItem className="telephone" label="电话">
                                            {getFieldDecorator('telephone', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        validator: checkTel,
                                                    }
                                                ],
                                                
                                            })(
                                                <Input placeholder="请输入电话"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
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
                        <div className="ant-line"></div>
                        <h4 className="add-form-title-h4">其它信息</h4>
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem className="companyName" label="企业名称：">
                                    {getFieldDecorator('companyName', {
                                        rules: [{
                                            required: false,
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
                                            required: false,
                                            // max: 18,
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
                                        initialValue: '0.15',
                                        rules: [{
                                            required: true,
                                            message: '机构手续费不能为空',
                                        }],
                                    })(
                                        <InputNumber style={{width: "100%"}} placeholder="填写0.15即为手续费15%" max={1} min={0} precision={2} step={0.01}/>
                                    )}
                                </FormItem>
                                {/*<div className="feesHint">填写0.15即为手续费15%</div>*/}
                            </Col>
                        </Row>
                        <div className="ant-line"></div>
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
        // 总机构类型表
        allTypeList: [],
        // 机构类型表
        typeList: [],
        // 短信验证码相关变量
        phone: "",
        countDown: 0,
        codeButtonStatus: false,
        // 机构图片相关变量
        // 上传Token
        uploadToken: '',
        fileKey: 0,
        viewPic01: "",
        photoList01: [],
        photoList11: [],
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
        data_pic22: "",
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
            provinceId: "",            
            city: "",
            cityId: "",
            district: "",
            street: ""
        },
        mapObj: {},
        // 省市县街道详细地址
        formattedAddress: "",
        xy: {},
        provinceId: null,
        cityId: null,
        areaId: null,
        // 详细地址
        detailedAddress: '',
        confirmLoading: false
    };
    fn_countDown = "";

    showModal = () => {
        this.setState({
            visible: true
        }, () => {
            // 获取机构列表
            this.getInstitutionTypeList();
            // 父级搜索
            this.handleSearch();
            setTimeout(() => {
                // 地图实例
                this.setState({
                    mapObj: new window.AMap.Map('add-institution-container', {
                        resizeEnable: true,
                        zoom: 16
                    })
                }, () => {
                    // 获取省份列表
                    this.getProvinceList();
                    window.AMap.service('AMap.Geocoder', () => {
                        const geocoder = new window.AMap.Geocoder({
                            extensions: "all"
                        });
                        // 地图组件点击事件处理
                        this.state.mapObj.on('click', (e) => {
                            // 清除已有标记点
                            this.state.mapObj.remove(this.state.markers);
                            // 经纬度写入
                            this.setXY({
                                x: e.lnglat.lng, 
                                y: e.lnglat.lat
                            });
                            // 生成当前标记点
                            const marker = new window.AMap.Marker({
                                map: this.state.mapObj,
                                bubble: true
                            });
                            marker.setPosition(e.lnglat);
                            this.state.mapObj.setCenter(marker.getPosition());
                            this.state.markers.push(marker);
                            console.log(this.state.mapObj);
                            console.log(this.state.markers);
                            console.log(1231231)
                            geocoder.getAddress([e.lnglat.lng, e.lnglat.lat], (status, result) => {
                                if (status === 'complete' && result.info === 'OK') {
                                    // address(formattedAddress)字段写入(全部的地址写入)
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
            url: '/sys/orgType/list',
            type: 'json',
            method: 'get',
            data: {
                status: 1,
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {},
            success: (json) => {
                if (json.result === 0) {
                    const data = [];
                    json.data.forEach((item) => {
                        let subData = [];
                        if (item.list) {
                            item.list.forEach((subItem) => {
                                subData.push({
                                    key: subItem.parentId + ',' + subItem.id,
                                    value: subItem.parentId + ',' + subItem.id,
                                    title: subItem.name,
                                    parentId: item.id,
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
                    console.log(data);
                    this.setState({
                        typeList: data
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

    // 根据输入机构名字模糊查找机构列表
    handleSearch = (value) => {
        console.log(value);
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
                        allTypeList: data
                    });
                    // if (currentValue === value) {
                    //     const result = d.result;
                    //     const data = [];
                    //     result.forEach(r => {
                    //         data.push({
                    //             value: r[0],
                    //             text: r[0]
                    //         });
                    //     });
                    //     callback(data);
                    // }
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
    
    // 校验机构类型父级最多选三项
    checkOrgType = (rule, value, callback) => {
        console.log(value);
        // 类型校验
        // 此处要判断父Id最多选三项,如何筛选
        const parentIdsTemp = [];
        const typeIdsTemp = [];
        value.forEach((item, index) => {
            let endIndex = item.indexOf(',');
            let parentId = item.slice(0, endIndex);
            let id = item.slice(endIndex + 1);
            parentIdsTemp.push(Number(parentId));
            typeIdsTemp.push(Number(id));
        })
        // 获得选中的所有父id，去重
        let setParentIds = Array.from(new Set(parentIdsTemp));
        console.log(setParentIds);
        console.log(typeIdsTemp);
        // 父id和子id数组合并
        const temp = setParentIds.concat(typeIdsTemp);
        console.log(temp);
        if (setParentIds.length > 3) {
            // message.error("机构类型父级最多选三项");
            callback('机构类型父级最多选三项'); // 校验未通过
            // return;
        }
    };
    
    // 手机号校验
    checkPhone = (rule, value, callback) => {
        if (!value) {
            callback('手机号码不能为空'); // 校验不通过
            return false;
        } else {
            const isMob = /^1[0-9]{10}$/;
            const valuePhone = value.trim();
            if (isMob.test(valuePhone)) { // 正则验证
                callback(); // 校验通过
                return true;
            } else {
                callback('请输入正确手机号'); // 校验不通过
                return false;
            }
        }
    };
    
    // 手机号和座机号校验
    checkTel = (rule, value, callback) => {
        console.log(value);
        if (!value) {
            callback('电话不能为空'); // 校验不通过
            return false;
        } else {
            const isPhone = /^([0-9]{3,4}-)?[0-9]{7,8}$/; // 0571-86295197
            const isPhone02 = /^\d{3,4}-\d{3,4}-\d{3,4}$/; // 4001-550-520
            // const isPhone02 = /^[0-9]{3,4}-[0-9]{2,3}-[0-9]{2,3}$/; // 4001-550-520
            // const isPhone02 = /^([0-9]{3,4}-)?([0-9]{3,4}-)?[0-9]{3,4}$/; // 4001-550-520
            const isMob=/^1[0-9]{10}$/;
            // const phone02 = /^0\d{2,3}-?\d{7,8}$/;
            const valuePhone = value.trim();
            if (isMob.test(valuePhone) || isPhone.test(valuePhone) || isPhone02.test(valuePhone)) { // 正则验证
                callback(); // 校验通过
                return true;
            } else {
                callback('请输入正确手机号或座机电话'); // 校验不通过
                return false;
            }
        }           
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
                    // sessionStorage.uploadToken = json.data;
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
    picUpload01 = (para) => {
        const _this = this;
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
                    let photoList11 = _this.state.photoList11;                  
                    photoList01.push({
                        path: global.config.photoUrl + res.key
                    });
                    photoList11.push({
                        path: res.key
                    });
                    _this.setState({
                        photoList01: photoList01,
                        photoList11: photoList11,
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

    // 暂时舍弃
    picUpload04 = (para) => {
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
                // url: '/file/upload',
                // url: 'https://upload-z2.qiniu.com',
                url: 'https://up-z2.qiniu.com',
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
                        if (json.code === 901) {
                            message.error("请先登录");
                            this.props.toLoginPage();
                        } else if (json.code === 902) {
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
                    data_pic22: res.key,
                    logoLoading: false,
                })
            }
        }
        const observable = qiniu.upload(file, key, token, config)
        observable.subscribe(observer) // 上传开始
    };
    picUpload05 = (para01, para02) => {
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
                    if (json.code === 901) {
                        message.error("请先登录");
                        this.props.toLoginPage();
                    } else if (json.code === 902) {
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
        // 写入已选省份信息并清除下级信息
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
                    provinceId: this.state.provinceList.filter(fnFilter)[0] ? this.state.provinceList.filter(fnFilter)[0].adcode : null,
                    districtList: [],
                    streetList: []
                })
            })
        }
        // 写入已选城市信息并清除下级信息
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
                    cityId: this.state.cityList.filter(fnFilter)[0] ? this.state.cityList.filter(fnFilter)[0].adcode : null,
                    streetList: []
                })
            })
        }
        // 写入已选区信息并清除下级信息
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
        // 写入已选街道信息并清除下级信息
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
            // 地区信息字段（用以获取不包含地区信息的详细地址内容）
            let areaString = value.province + value.city + value.district + value.township;
            console.log(areaString);
            // 获取城市列表,省份ID
            const provinceFilter = (item) => {
                return item.name === value.province;
            };
            this.setState({
                cityList: this.state.provinceList.filter(provinceFilter)[0] ? this.state.provinceList.filter(provinceFilter)[0].districtList : [],
                provinceId: this.state.provinceList.filter(provinceFilter)[0] ? this.state.provinceList.filter(provinceFilter)[0].adcode : null,
            }, () => {
                // 获取地区列表,城市ID
                // 城市列表只有一条信息，如直辖市，导致value.city为空，则取城市列表第一条作为有效信息
                if (this.state.cityList.length === 1 & !value.city) {
                    value.city = this.state.cityList[0].name;
                }
                const cityFilter = (item) => {
                    return item.name === value.city;
                };
                this.setState({
                    districtList: this.state.cityList.filter(cityFilter)[0] ? this.state.cityList.filter(cityFilter)[0].districtList : [],
                    cityId: this.state.cityList.filter(cityFilter)[0] ? this.state.cityList.filter(cityFilter)[0].adcode : null,
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
                                // areaId: this.state.districtList.filter(fnFilter)[0] ? this.state.districtList.filter(fnFilter)[0].adcode : null
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
                                    detailedAddress: this.state.formattedAddress.replace(areaString, "")
                                }, () => {
                                    console.log(this.state.provinceId);
                                    console.log(this.state.cityId);
                                    console.log(this.state.areaId);
                                    console.log(this.state.area);
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
        console.log(para)
        this.setState({
            formattedAddress: para
        })
    };
    setMarkers = (marker) => {
        const arr = [];
        console.log(marker)
        arr.push(marker);
        console.log(arr)
        this.setState({
            markers: arr
        })
    };

    handleCancel = () => {
        const form = this.form;
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
                photoList11: [],
                avatarEditor01: {
                    scale: 1,
                    positionX: 0.5,
                    positionY: 0.5
                },
                photoLoading: false,
                viewPic02: "",
                effectPic02: "",
                data_pic02: "",
                data_pic22: "",
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
                    provinceId: "",
                    city: "",
                    cityId: "",
                    district: "",
                    street: ""
                },
                mapObj: {},
                formattedAddress: "",
                xy: {},
                provinceId: null,
                cityId: null,
                areaId: null,
                detailedAddress: '',
                confirmLoading: false
            });
            form.resetFields();
        });
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            // 类型校验
            // 此处要判断父Id最多选三项,如何筛选
            const typeIdsTemp = [];
            const typeIdsTem = [];
            values.typeIds.forEach((item, index) => {
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
                message.error("机构类型最多选三项");
                return;
            }
            // 机构图片校验
            const photoTemp = [];
            if (this.state.photoList01.length) {
                this.state.photoList01.forEach((item, index) => {
                    photoTemp.push(item.path.slice(global.config.photoUrl.length));
                })
            }
            console.log(photoTemp);

            if (photoTemp.length === 0) {
                message.error("机构图片未提交");
                return
            }
            // 机构logo校验
            if (!this.state.data_pic02) {
                message.error("LOGO未提交");
                return
            }
            if (this.state.data_pic02) {
                values.icon = this.state.data_pic02.slice(global.config.photoUrl.length);
            }            

            if (!this.state.area.street) {
                message.error("请选择机构所在省、市、区及街道");
                return
            }
            // 需要特色标签转成json字符串
            let labelAll = [];
            if (values.label_01) {
                labelAll.push(values.label_01);
            }
            if (values.label_02) {
                labelAll.push(values.label_02);
            }
            if (values.label_03) {
                labelAll.push(values.label_03);
            }
            if (values.label_04) {
                labelAll.push(values.label_04);
            }
            if (values.label_05) {
                labelAll.push(values.label_05);
            }
            if (values.label_06) {
                labelAll.push(values.label_06);
            }
            this.setState({
                confirmLoading: true
            });
            console.log(this.state.photoList01);            
            console.log(values.parentId)
            console.log(this.state.provinceId)
           
            reqwest({
                url: '/admin/org/register',
                type: 'json',
                method: 'post',
                headers: {
                    Authorization: sessionStorage.token
                },
                data: {
                    name: values.name,
                    type: 2,
                    typeIds: temp,
                    parentId: values.parentId,                    
                    // adminUserName: values.adminUserName,
                    // adminUserPhone: values.adminUserPhone,
                    // 管理员名字
                    managerName: values.managerName,
                    // 管理员手机号
                    managerPhone: values.managerPhone,
                    // 机构图片
                    photos: photoTemp,
                    resources: [0],
                    // code: values.verifyCode,
                    businessHours: values.businessHours,
                    scope: values.scope,
                    classNumber: values.classNumber,
                    teacherNumber: values.teacherNumber,
                    label: JSON.stringify(labelAll),
                    icon: values.icon,
                    lng: this.state.xy.x,
                    lat: this.state.xy.y,
                    provinceName: this.state.area.province,
                    provinceId: Number(this.state.provinceId),
                    cityId: Number(this.state.cityId),
                    cityName: this.state.area.city,
                    areaName: this.state.area.district,
                    areaId: Number(this.state.areaId),
                    street: this.state.area.street,
                    address: this.state.formattedAddress,
                    detailedAddress: values.detailedAddress,
                    managerAddress: values.managerAddress,
                    telephone: values.telephone,
                    description: values.description,                                     
                    companyName: values.companyName,
                    licenseNumber: values.licenseNumber,
                    fees: values.fees,
                    additionalProtocol: values.additionalProtocol,
                    // 1为待审核 机构添加不需要审核，直接通过 暂时不需要
                    // status: 1,
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
                                photoList11: [],
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
                                provinceId: null,
                                cityId: null,
                                areaId: null,
                                detailedAddress: '',
                                confirmLoading: false
                            });
                            form.resetFields();
                            this.props.recapture();
                        });
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
                    allTypeList={this.state.allTypeList}
                    typeList={this.state.typeList}
                    handleSearch={this.handleSearch}
                    checkOrgType={this.checkOrgType}
                    checkPhone={this.checkPhone}
                    checkTel={this.checkTel}
                    setPhone={this.setPhone}
                    countDown={this.state.countDown}
                    codeButtonStatus={this.state.codeButtonStatus}
                    getCode={this.getCode}
                    reqwestUploadToken={this.reqwestUploadToken}
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
                    detailedAddress={this.state.detailedAddress}
                    confirmLoading={this.state.confirmLoading}
                />
            </div>
        );
    }
}

//机构信息编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, onChange, handleChange, handleSearch, form, id, data, allTypeList, typeList, checkTel, reqwestUploadToken, viewPic01, setViewPic01, picUpload01, avatarEditor01, setAvatarEditor01, photoList01, setPhotoList01, photoLoading, viewPic02, setViewPic02, data_pic02, effectPic02, picUpload02, avatarEditor02, setAvatarEditor02, logoLoading, provinceList, cityList, districtList, streetList, markers, setMarkers, area, setArea, mapObj, setXY, setFormattedAddress, formattedAddress, detailedAddress, confirmLoading} = props;
        const {getFieldDecorator} = form;

        // 总机构选项生成
        const optionsOfAllTypeList = [];
        if (allTypeList) {
            allTypeList.forEach((item, index) => {
                optionsOfAllTypeList.push(<Option key={index + 1} value={item.id}>{item.name}</Option>);
            });
        }  

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
            reqwestUploadToken();
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
            reqwestUploadToken();
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
        console.log(data)
        return (
            <Modal
                visible={visible}
                title="机构编辑"
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
                        <div className="institution-edit institution-form item-form">
                            <Form layout="vertical">
                                <h4 className="add-form-title-h4">基础信息</h4>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="name" label="机构名称：">
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
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="typeIds" label="机构类型：">
                                            {getFieldDecorator('typeIds', {
                                                initialValue: data.typeIds,
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '机构类型不能为空',
                                                    }
                                                ],
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
                                                    onChange={onChange}
                                                    showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                                />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="parentId" label="父级：">
                                            {getFieldDecorator('parentId', {
                                                initialValue: data.parentName,
                                                rules: [{
                                                    required: false,
                                                    message: '请选择总机构',
                                                }],
                                            })(
                                                <Select
                                                    showSearch
                                                    style={{width: '100%'}}
                                                    placeholder="请选择总机构"
                                                    onSearch={handleSearch}
                                                    onChange={handleChange}                        
                                                    filterOption={false}
                                                    notFoundContent={null}                                
                                                >
                                                    {optionsOfAllTypeList}
                                                </Select>  
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="managerPhone" label="机构电话：">
                                            {getFieldDecorator('telephone', {
                                                initialValue: data.telephone,
                                                rules: [
                                                    {   
                                                        required: true,
                                                        validator: checkTel
                                                    }
                                                ],
                                            })(
                                                <Input placeholder="请输入机构电话号码"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>                                
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="photo photos" label="机构图片：">
                                            {getFieldDecorator('photos', {
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
                                    </Col>
                                </Row>
                                
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col>
                                        <FormItem className="description longItem" label="机构简介：">
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
                                    </Col>
                                </Row>
                                
                                <div className="ant-line"></div>
                                <h4 className="add-form-title-h4">商家信息</h4>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="name" label="营业时间：">
                                            {getFieldDecorator('businessHours', {
                                                initialValue: data.businessHours,
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '营业时间不能为空',
                                                    },
                                                    {
                                                        max: 100,
                                                        message: '营业时间不能超过100个字',                                            
                                                    },
                                                ],
                                            })(
                                                <Input placeholder="请填写营业时间"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="scope" label="商家面积：">
                                            {getFieldDecorator('scope', {
                                                initialValue: data.scope,
                                                rules: [{
                                                    required: true,
                                                    message: '商家面积不能为空',
                                                }],
                                            })(
                                                <InputNumber 
                                                    style={{width: "100%"}} 
                                                    placeholder="请填写商家面积"
                                                    formatter={value => `${value}㎡`}
                                                    parser={value => value.replace('㎡', '')}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="classNumber" label="教室数目：">
                                            {getFieldDecorator('classNumber', {
                                                initialValue: data.classNumber,
                                                rules: [{
                                                    required: true,
                                                    message: '教室数目不能为空',
                                                }],
                                            })(
                                                <InputNumber 
                                                    style={{width: "100%"}} 
                                                    placeholder="请填写教室数目"
                                                    formatter={value => `${value}间`}
                                                    parser={value => value.replace('间', '')}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="teacherNumber" label="师资力量：">
                                            {getFieldDecorator('teacherNumber', {
                                                initialValue: data.teacherNumber,
                                                rules: [{
                                                    required: true,
                                                    message: '师资力量不能为空',
                                                }],
                                            })(
                                                <InputNumber 
                                                    style={{width: "100%"}} 
                                                    placeholder="请填写师资力量"
                                                    formatter={value => `${value}名`}
                                                    parser={value => value.replace('名', '')}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={16}>
                                        <Row gutter={8}>
                                            <Col span={4}>
                                                <FormItem className="label_01" label="特色标签：">
                                                    {getFieldDecorator('label_01', {
                                                        initialValue: data.label_01,
                                                        rules: [{
                                                            required: false,
                                                            message: "只能输入4个字",
                                                            max: 4,
                                                        }],
                                                    })(
                                                        <Input  placeholder="如：小班教学"/>     
                                                    )}
                                                </FormItem>
                                            </Col>
                                            <Col span={4}>
                                                <FormItem className="label_02" label="">
                                                    {getFieldDecorator('label_02', {
                                                        initialValue: data.label_02,
                                                        rules: [{
                                                            required: false,
                                                            message: "只能输入4个字",
                                                            max: 4,
                                                        }],
                                                    })(
                                                        <Input style={{marginTop: "31px"}} placeholder="如：免费WiFi"/>  
                                                    )}
                                                </FormItem>
                                            </Col>
                                            <Col span={4}>
                                                <FormItem className="label_03" label="">
                                                    {getFieldDecorator('label_03', {
                                                        initialValue: data.label_03,
                                                        rules: [{
                                                            required: false,
                                                            message: "只能输入4个字",
                                                            max: 4,
                                                        }],
                                                    })(
                                                        <Input style={{marginTop: "31px"}}  placeholder="如：一对一"/>     
                                                    )}
                                                </FormItem>
                                            </Col>
                                            <Col span={4}>
                                                <FormItem className="label_04" label="">
                                                    {getFieldDecorator('label_04', {
                                                        initialValue: data.label_04,
                                                        rules: [{
                                                            required: false,
                                                            message: "只能输入4个字",
                                                            max: 4,
                                                        }],
                                                    })(
                                                        <Input style={{marginTop: "31px"}}  placeholder="如：夏令营"/>     
                                                    )}
                                                </FormItem>
                                            </Col>
                                            <Col span={4}>
                                                <FormItem className="label_05" label="">
                                                    {getFieldDecorator('label_05', {
                                                        initialValue: data.label_05,
                                                        rules: [{
                                                            required: false,
                                                            message: "只能输入4个字",
                                                            max: 4,
                                                        }],
                                                    })(
                                                        <Input style={{marginTop: "31px"}} placeholder="如：主题活动"/>     
                                                    )}
                                                </FormItem>
                                            </Col>
                                            <Col span={4}>
                                                <FormItem className="label_06" label="">
                                                    {getFieldDecorator('label_06', {
                                                        initialValue: data.label_06,
                                                        rules: [{
                                                            required: false,
                                                            message: "只能输入4个字",
                                                            max: 4,
                                                        }],
                                                    })(
                                                        <Input style={{marginTop: "31px"}} placeholder="如：生日会"/>     
                                                    )}
                                                </FormItem>
                                            </Col>
                                            <div  style={{position: 'absolute', top: 6, right: 20}}>
                                                <span>说明：每个标签不能超过四个字</span>
                                            </div>
                                        </Row>
                                    </Col>
                                </Row>
                                <div className="ant-line"></div>
                                <h4 className="add-form-title-h4">机构详情</h4>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="icon" label="机构LOGO：">
                                            {getFieldDecorator('icon', {
                                                initialValue: viewPic02,
                                                // initialValue: data.icon,
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
                                                            <Select placeholder="街道" style={{width: "20%"}}
                                                                    value={area.street || undefined}
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
                                        
                                        <div className="ant-line"></div>
                                        <Row>
                                            <Col>
                                                <FormItem className="detailedAddress longItem" label="详细地址：">
                                                    {getFieldDecorator('detailedAddress', {
                                                        initialValue: detailedAddress,
                                                        rules: [{
                                                            required: true,
                                                            message: '详细地址不能为空',
                                                        }],
                                                    })(
                                                        <Input placeholder="请填写详细地址"
                                                               onBlur={(event) => addressChange(event.target.value)}/>
                                                    )}
                                                </FormItem>
                                            </Col>
                                        </Row>
                                        
                                        <div className="ant-line"></div>
                                        <p className="addressSaved">定位点：{formattedAddress || "暂无"}</p>
                                        <div id={"edit-institution-container" + id} name="container" tabIndex="0"
                                             style={{
                                                 width: "520px",
                                                 height: "320px",
                                                 marginLeft: "50px",
                                                 marginBottom: "10px"
                                             }}/>
                                    </Col>
                                </Row>
                                
                                <div className="ant-line"></div>
                                <h4 className="add-form-title-h4">其它信息</h4>
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <FormItem className="companyName" label="企业名称：">
                                            {getFieldDecorator('companyName', {
                                                initialValue: data.companyName,
                                                rules: [{
                                                    required: false,
                                                    message: '企业名称不能为空',
                                                }]
                                            })(
                                                <Input placeholder="请输入企业名称"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem className="licenseNumber" label="执照号码：">
                                            {getFieldDecorator('licenseNumber', {
                                                initialValue: data.licenseNumber,
                                                rules: [{
                                                    required: false,
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
                                                initialValue: data.fees || '0.15',
                                                rules: [{
                                                    required: true,
                                                    message: '机构手续费不能为空',
                                                }],
                                            })(
                                                <InputNumber style={{width: "100%"}} max={1} min={0} precision={2} step={0.01} placeholder={"填写0.15即为手续费15%"}/>
                                            )}
                                        </FormItem>
                                        {/*<div className="feesHint">填写0.15即为手续费15%</div>*/}
                                    </Col>
                                </Row>
                                
                                <div className="ant-line"></div>
                                <Row gutter={24}>
                                    <Col>
                                        <FormItem className="additionalProtocol unnecessary" label="附加协议：">
                                            {getFieldDecorator("additionalProtocol", {
                                                initialValue: data.additionalProtocol,
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
        allTypeList: [],
        // 机构类型表
        typeList: [],
        // 机构图片相关变量
        uploadToken: "",
        viewPic01: "",
        photoList01: [],
        photoList11: [],
        avatarEditor01: {
            scale: 1,
            positionX: 0.5,
            positionY: 0.5
        },
        photoLoading: false,
        // 机构LOGO相关变量
        viewPic02: "",
        data_pic02: "",
        data_pic22: "",
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
        provinceId: null,
        cityId: null,
        areaId: null,
        detailedAddress: '',
        addressLoading: true,
        // 提交按钮状态变量
        confirmLoading: false,
        tempTypeIds: [],
    };

    // 获取机构类型列表
    getInstitutionTypeList = () => {
        reqwest({
            url: '/sys/orgType/list',            
            type: 'json',
            method: 'get',
            data: {
                status: 1
            },
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {},
            success: (json) => {
                if (json.result === 0) {
                    const data = [];
                    json.data.forEach((item) => {
                        let subData = [];
                        if (item.list) {
                            item.list.forEach((subItem) => {
                                subData.push({
                                    key: subItem.id,
                                    value: subItem.parentId + ',' + subItem.id,
                                    // value: String(subItem.id),
                                    title: subItem.name,
                                    parentId: item.id,
                                })
                            })
                        }                        
                        data.push({
                            key: item.id,
                            value: String(item.id),
                            title: item.name,
                            children: subData,
                        })
                    });
                    console.log(data)
                    this.setState({
                        typeList: data
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

    // 校验机构类型父级最多选三项
    checkOrgType = (rule, value, callback) => {
        console.log(value);
        // 类型校验
        // 此处要判断父Id最多选三项,如何筛选
        const parentIdsTemp = [];
        const typeIdsTemp = [];
        value.forEach((item, index) => {
            let endIndex = item.indexOf(',');
            let parentId = item.slice(0, endIndex);
            let id = item.slice(endIndex + 1);
            parentIdsTemp.push(Number(parentId));
            typeIdsTemp.push(Number(id));
        })
        // 获得选中的所有父id，去重
        let setParentIds = Array.from(new Set(parentIdsTemp));
        console.log(setParentIds);
        console.log(typeIdsTemp);
        // 父id和子id数组合并
        const temp = setParentIds.concat(typeIdsTemp);
        console.log(temp);
        if (setParentIds.length > 3) {
            // message.error("机构类型父级最多选三项");
            callback('机构类型父级最多选三项'); // 校验未通过
            return;
        }
    };

    // 手机号校验
    checkPhone = (rule, value, callback) => {
        if (!value) {
            callback('手机号码不能为空'); // 校验不通过
            return false;
        } else {
            const isMob = /^1[0-9]{10}$/;
            const valuePhone = value.trim();
            if (isMob.test(valuePhone)) { // 正则验证
                callback(); // 校验通过
                return true;
            } else {
                callback('请输入正确手机号'); // 校验不通过
                return false;
            }
        }
    };
    
    // 手机号和座机号校验
    checkTel = (rule, value, callback) => {
        console.log(value);
        if (!value) {
            callback('电话不能为空'); // 校验不通过
            return false;
        } else {
            const isPhone = /^([0-9]{3,4}-)?[0-9]{7,8}$/;
            // 有问题
            const isPhone02 = /^\d{3,4}-\d{3,4}-\d{3,4}$/;
            const isMob = /^1[0-9]{10}$/;
            const valuePhone = value.trim();
            if (isMob.test(valuePhone) || isPhone.test(valuePhone) || isPhone02.test(valuePhone)) { // 正则验证
                callback(); // 校验通过
                return true;
            } else {
                callback('请输入正确手机号或座机电话'); // 校验不通过
                return false;
            }
        }           
    };

    onChange = (value) => {
        console.log('onChange ', value);
        this.setState({ 
            tempTypeIds: value
        });
    };

    // 获取机构基本信息
    getData = () => {
        reqwest({
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
                message.error('获取失败');
                this.setState({
                    loading: false
                });
            },
            success: (json) => {
                if (json.result === 0) {
                    // 已有机构类型写入
                    const data = [];
                    json.data.orgTypeList.forEach((item, index) => {                        
                        data.push(item.parentTypeId + ',' + item.typeId);
                    });
                    json.data.org.typeIds = data;
                    // 已有特色标签写入
                    if (json.data.org.label.length) {
                        json.data.org.label_01 = json.data.org.label[0] ? json.data.org.label[0] : '';
                        json.data.org.label_02 = json.data.org.label[1] ? json.data.org.label[1] : '';
                        json.data.org.label_03 = json.data.org.label[2] ? json.data.org.label[2] : '';
                        json.data.org.label_04 = json.data.org.label[3] ? json.data.org.label[3] : '';
                        json.data.org.label_05 = json.data.org.label[4] ? json.data.org.label[4] : '';
                        json.data.org.label_06 = json.data.org.label[5] ? json.data.org.label[5] : '';
                    }
                    console.log(json.data.org);
                    // 过滤机构图片
                    const fnFilter = (para) => {
                        return para.type === 1;
                    }
                    // 过滤机构logo
                    // const fnFilter02 = (para) => {
                    //     return para.type === 2;
                    // }
                    // 已有机构图片写入
                    const tempOrgResourceList = json.data.orgResourceList.filter(fnFilter);
                    console.log(tempOrgResourceList);
                    json.data.org.icon = json.data.orgResourceList[0] ?  json.data.orgResourceList[0].path : "";
                    console.log(json.data.org);
                    // 定位点
                    let tempAddress = json.data.org.provinceName + json.data.org.cityName + json.data.org.areaName + json.data.org.street + json.data.org.detailedAddress;
                    console.log(json.data.org)
                    this.setState({
                        data: json.data.org,
                        photoList01: tempOrgResourceList,
                        viewPic02: json.data.orgResourceList[0] ?  json.data.orgResourceList[0].path : "",
                        // effectPic02: json.data.orgResourceList[1] ? json.data.orgResourceList[1].path : "",
                        // data_pic02: json.data.orgResourceList[2] ? json.data.orgResourceList[2].path : "",
                        provinceId: json.data.org.provinceId,
                        cityId: json.data.org.cityId,
                        areaId: json.data.org.areaId,
                        formattedAddress: tempAddress,
                        xy: {
                            x: json.data.org.lng,
                            y: json.data.org.lat
                        }
                    }, () => {
                        console.log(this.state.data);
                        console.log(this.state.viewPic02);
                        console.log(this.state.data)
                        console.log(this.state.data.lng);
                        console.log(this.state.data.lat);
                        // 父级总机构查询
                        this.handleSearch(json.data.org.parentName);
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
                                        this.setXY({
                                            x: e.lnglat.lng, 
                                            y: e.lnglat.lat
                                        });
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
                                                console.log(result.regeocode.formattedAddress)
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
                }
            }
        })
    };
    
    // 编辑弹框
    showModal = () => {
        // 获取机构基本信息(包含地图实例)
        this.getData();
        // 获取机构类型列表
        this.getInstitutionTypeList();
        this.setState({
            visible: true,
        })
    };

    handleSearch = (value) => {
        console.log(value);
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
                        allTypeList: data
                    });
                    // if (currentValue === value) {
                    //     const result = d.result;
                    //     const data = [];
                    //     result.forEach(r => {
                    //         data.push({
                    //             value: r[0],
                    //             text: r[0]
                    //         });
                    //     });
                    //     callback(data);
                    // }
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
        const _this = this;
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
                    _this.setState({
                        photoLoading: false,
                    })
                }, 
                complete (res) {
                    console.log(res);
                    message.success("图片提交成功");
                    let photoList01 = _this.state.photoList01; 
                    // let photoList11 = _this.state.photoList11;             
                    photoList01.push({
                        path: global.config.photoUrl + res.key
                    });
                    // photoList11.push({
                    //     path: res.key
                    // })
                    _this.setState({
                        photoList01: photoList01,
                        // photoList11: photoList11,
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
            logoLoading: true
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
                    data_pic22: res.key,
                    logoLoading: false,
                })
            }
        };
        const observable = qiniu.upload(file, key, token, config);
        observable.subscribe(observer); // 上传开始
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
                    provinceId: this.state.provinceList.filter(fnFilter)[0] ? this.state.provinceList.filter(fnFilter)[0].adcode : null,
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
                    cityId: this.state.cityList.filter(fnFilter)[0] ? this.state.cityList.filter(fnFilter)[0].adcode : null,
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
            // 地区信息字段（用以获取不包含地区信息的详细地址内容）
            let areaString = value.province + value.city + value.district + value.township;
            // 获取城市列表
            const provinceFilter = (item) => {
                return item.name === value.province;
            };
            this.setState({
                cityList: this.state.provinceList.filter(provinceFilter)[0] ? this.state.provinceList.filter(provinceFilter)[0].districtList : [],
                provinceId: this.state.provinceList.filter(provinceFilter)[0] ? this.state.provinceList.filter(provinceFilter)[0].adcode : null,
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
                    cityId: this.state.cityList.filter(cityFilter)[0] ? this.state.cityList.filter(cityFilter)[0].adcode : null,
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
                                // areaId: this.state.districtList.filter(fnFilter)[0] ? this.state.districtList.filter(fnFilter)[0].adcode : null
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
                                    detailedAddress: this.state.formattedAddress.replace(areaString, ""),                                  
                                    addressLoading: false
                                }, () => {
                                    console.log(this.state.area);
                                    console.log(this.state.provinceId)
                                    console.log(this.state.cityId)
                                    console.log(this.state.areaId)
                                    console.log(this.state.data.detailedAddress)
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
        console.log(values);
        const initValues = this.state.data;
        console.log(initValues);
        const itemList = ["name", "telephone", "fees", "description", "provinceName", "cityName", "areaName", "areaId", "street", "address", "detailedAddress", "lng", "lat", "companyName", "licenseNumber", "additionalProtocol", "businessHours", "scope", "classNumber", "teacherNumber"];
        const result = {};
        itemList.forEach((item) => {
            if (values[item] !== initValues[item]) {
                result[item] = values[item];
            }
        });
        // 机构类型
        if (values.typeIds.sort().toString() !== initValues.toString()) {
            result.typeIds = values.typeIds;
        }
        // 机构图片
        if (values.photos.toString() !== initValues.toString()) {
            const photoTemp = [];
            if (this.state.photoList01.length) {
                this.state.photoList11.forEach((item, index) => {
                    photoTemp.push(item.path);
                })
            }
            result.photos = photoTemp;
            console.log(result.photos);
        }
        if (values.icon.toString() !== initValues.toString()) {
            result.icon = this.state.data_pic22;
        }
        console.log(result);
        if (JSON.stringify(result) === "{}") {
            return false;
        } else {
            result.id = this.props.id;
            return result;
        }
    };

    // 取消操作
    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false
        }, () => {
            this.setState({
                data: {},
                typeList: [],
                viewPic01: "",
                photoList01: [],
                photoList11: [],
                avatarEditor01: {
                    scale: 1,
                    positionX: 0.5,
                    positionY: 0.5
                },
                photoLoading: false,
                viewPic02: "",
                data_pic02: "",
                data_pic22: "",
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
                provinceId: null,
                cityId: null,
                areaId: null,
                detailedAddress: '',
                addressLoading: true,
                confirmLoading: false
            });
            form.resetFields();
        });
    };

    // 确认操作
    handleCreate = () => {
        // data空值处理
        if (JSON.stringify(this.state.data) === "{}") {
            return;
        }
        // 地址信息加载中处理
        // if (this.state.addressLoading) {
        //     message.warning("地图信息加载中，请稍后进行操作");
        //     return
        // }
        const form = this.form;
        form.validateFieldsAndScroll((err, values) => {
            if (err) {
                return;
            }
            // 机构类型写入与校验
            // 机构类型是父级最多选三个
            const typeIdsTemp = [];
            const typeIdsTem = [];
            values.typeIds.forEach((item, index) => {
                let endIndex = item.indexOf(',');
                let parentId = item.slice(0,endIndex);
                let id = item.slice(endIndex + 1);
                typeIdsTemp.push(Number(parentId));
                typeIdsTem.push(Number(id));
            })
            let setTypeIds = Array.from(new Set(typeIdsTemp));
            const temp = setTypeIds.concat(typeIdsTem);
            if (setTypeIds.length > 3) {
                message.error("机构类型最多选三项");
                return;
            }
            values.typeIds = temp;
            // 机构图片写入与校验
            values.photo = this.state.photoList01[0];
            const photoTemp = [];
            if (this.state.photoList01.length) {
                this.state.photoList01.forEach((item, index) => {
                    let pathTemp = item.path.slice(global.config.photoUrl.length);
                    photoTemp.push(pathTemp);
                })
            }
            console.log(photoTemp)

            if (!values.photo) {
                message.error("课程图片未选择或未提交");
                return
            }

            // 机构Logo修改校验
            if (values.icon !== this.state.viewPic02 && !this.state.data_pic02) {
                message.error("机构logo未提交");
                return
            }
            // 机构logo写入
            if (this.state.data_pic02) {
                values.icon = this.state.data_pic02
            }
            let iconTemp = values.icon.slice(global.config.photoUrl.length);
            console.log(iconTemp);
            // 机构地址信息写入
            values.provinceName = this.state.area.province;
            values.provinceId = Number(this.state.provinceId);
            values.cityName = this.state.area.city;
            values.cityId = Number(this.state.cityId);
            values.areaName = this.state.area.district;
            values.areaId = Number(this.state.areaId);
            values.street = this.state.area.street;
            values.address = this.state.formattedAddress;
            values.lng = this.state.xy.x;
            values.lat = this.state.xy.y;
            // 信息比对
            // const result = this.dataContrast(values);
            // 特色标签写入
            let labelAll = [];
            if (values.label_01) {
                labelAll.push(values.label_01);
            }
            if (values.label_02) {
                labelAll.push(values.label_02);
            }
            if (values.label_03) {
                labelAll.push(values.label_03);
            }
            if (values.label_04) {
                labelAll.push(values.label_04);
            }
            if (values.label_05) {
                labelAll.push(values.label_05);
            }
            if (values.label_06) {
                labelAll.push(values.label_06);
            }
            const result = {
                id: this.props.id,
                name: values.name,
                type: 2,
                typeIds: values.typeIds,
                // typeIds: this.state.tempTypeIds,
                // parentId: values.parentId,
                telephone: values.telephone,
                // adminUserPhone: values.adminUserPhone,
                photos: photoTemp,
                description: values.description,
                businessHours: values.businessHours,
                scope: values.scope, 
                classNumber: values.classNumber, 
                teacherNumber: values.teacherNumber,
                icon: iconTemp,
                label: JSON.stringify(labelAll),
                // icon: this.state.data_pic22,
                provinceName:  values.provinceName,
                provinceId: values.provinceId,
                cityName: values.cityName,
                cityId: values.cityId,
                areaName: values.areaName,
                areaId: values.areaId,
                street: values.street,
                address: values.address,
                lng: values.lng,
                lat: values.lat,
                detailedAddress: values.detailedAddress, 
                companyName: values.companyName, 
                licenseNumber: values.licenseNumber,
                fees: values.fees,
                additionalProtocol: values.additionalProtocol,
            }
            if (!isNaN(values.parentId)) {
                result.parentId = values.parentId
            }
            console.log(result)
            if (!result) {
                message.error("暂无信息更改");
                return;
            }
            // 修改项提交，状态变为待审核 暂时不需要
            // result.status = 1;
            this.setState({
                confirmLoading: true
            });
            reqwest({
                url: '/admin/org/update',
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
                        message.success("机构信息修改成功");
                        this.setState({
                            visible: false
                        }, () => {
                            this.setState({
                                data: {},
                                typeList: [],
                                viewPic01: "",
                                photoList01: [],
                                photoList11: [],
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
                                provinceId: null,
                                cityId: null,
                                areaId: null,
                                detailedAddress: '',
                                addressLoading: true,
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
                    onChange={this.onChange}
                    id={this.props.id}
                    data={this.state.data}
                    allTypeList={this.state.allTypeList}
                    handleSearch={this.handleSearch}
                    handleChange={this.handleChange}
                    typeList={this.state.typeList}
                    checkOrgType={this.checkOrgType}
                    checkPhone={this.checkPhone}
                    checkTel={this.checkTel}
                    reqwestUploadToken={this.reqwestUploadToken}
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
                    detailedAddress={this.state.detailedAddress}
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
        data: '',
        orgTypeList: [],
        orgResourceList: [],
        loading: true
    };

    getData = () => {
        reqwest({
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
                message.error("获取失败");
                this.setState({
                    loading: false
                });                
            },
            success: (json) => {
                if (json.result === 0) {
                    // json.data.org.typeName = json.data.typeName;
                    // json.data.org.typeNameTwo = json.data.typeNameTwo;
                    // json.data.org.typeNameThree = json.data.typeNameThree;
                    // 特色标签处理
                    json.data.org.label = json.data.org.label.join("/");
                    json.data.org.star = Math.ceil(json.data.org.scoreNumber / json.data.org.totalScore) || 0;
                    const fnFilter = (para) => {
                        return para.type === 1;
                    }
                    const tempOrgResourceList = json.data.orgResourceList.filter(fnFilter);
                    json.data.org.icon = json.data.orgResourceList[0] ? json.data.orgResourceList[0].path : '';
                    let tempOrgType = []
                    if (json.data.orgTypeList) {
                        json.data.orgTypeList.forEach((item, index) => {
                            tempOrgType.push(item.typeName)
                        })
                    }
                    this.setState({
                        loading: false,
                        data: json.data.org,
                        // orgTypeList: json.data.orgTypeList,
                        orgTypeList: tempOrgType.join('/'),
                        orgResourceList: tempOrgResourceList,
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
        // const orgTypeLists = () => {
        //     const orgTypeLists = [];
        //     console.log(this.state.orgTypeList);
        //     this.state.orgTypeList.forEach((item, index)=>{
        //         orgTypeLists.push(
        //             <div className="typeName">
        //                 <span className="item-name">机构类型一：</span>
        //                 <span className="item-content">{item.typeName}</span>
        //             </div>
        //         );
        //     })
        //     console.log(orgTypeLists)
        // }
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
            // let realNameState = "";
            // if (this.state.data.RealNameAuthentication === 0) {
            //     realNameState = "未认证";
            // }
            // if (this.state.data.RealNameAuthentication === 1) {
            //     realNameState = "已认证";
            // }
            
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
                    <span className="item-name">机构类型：</span>
                    <span className="item-content">{this.state.orgTypeList}</span>
                </div>,                
                <div className="managerName">
                    <span className="item-name">管理员：</span>
                    <span className="item-content">{this.state.data.managerName}</span>
                </div>,
                <div className="sort">
                    <span className="item-name">排序：</span>
                    <span className="item-content">{this.state.data.sort}</span>
                </div>,
                <div className="managerPhone">
                    <span className="item-name">管理员电话：</span>
                    <span className="item-content">{this.state.data.managerPhone}</span>
                </div>,
                <div className="subscribeNumber">
                    <span className="item-name">预约试听数：</span>
                    <span className="item-content">{this.state.data.subscribeNumber}</span>
                </div>,
                <div className="geschaftszeit">
                    <span className="item-name">营业时间：</span>
                    <span className="item-content">{this.state.data.businessHours}</span>
                </div>,
                <div className="scope">
                    <span className="item-name">商家面积：</span>
                    <span className="item-content">{this.state.data.scope + "平方米"}</span>
                </div>,
                <div className="classNumber">
                    <span className="item-name">教室数目：</span>
                    <span className="item-content">{this.state.data.classNumber + "间"}</span>
                </div>,
                <div className="teacherNumber">
                    <span className="item-name">师资力量：</span>
                    <span className="item-content">{this.state.data.teacherNumber + "名"}</span>
                </div>,
                <div className="label">
                    <span className="item-name">特色标签：</span>
                    <span className="item-content">{this.state.data.label || "暂无"}</span>
                </div>,
                <div className="description">
                    <span className="item-name">机构简介：</span>
                    <pre>
                    <span className="item-content">{this.state.data.description}</span>
                </pre>
                </div>,
                <div className="photo">
                    <span className="item-name">图片一：</span>
                    <img src={this.state.orgResourceList[0] ? this.state.orgResourceList[0].path : ''} alt="" className="item-content"/>
                </div>,
                <div className="photo">
                    <span className="item-name">图片二：</span>
                    {
                        this.state.orgResourceList[1] ?
                            <img src={this.state.orgResourceList[1].path} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="photo">
                    <span className="item-name">图片三：</span>
                    {
                        this.state.orgResourceList[2] ?
                            <img src={this.state.orgResourceList[2].path} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="photo">
                    <span className="item-name">图片四：</span>
                    {
                        this.state.orgResourceList[3] ?
                            <img src={this.state.orgResourceList[3].path} alt=""
                                 className="item-content"/>
                            :
                            <span className="item-content">暂无</span>
                    }
                </div>,
                <div className="photo">
                    <span className="item-name">图片五：</span>
                    {
                        this.state.orgResourceList[4] ?
                            <img src={this.state.orgResourceList[4].path} alt=""
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
                    <span className="item-content">{this.state.data.detailedAddress}</span>
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
                    <span className="item-content">{Number(this.state.data.fees)}</span>
                </div>,
                <div className="additionalProtocol">
                    <span className="item-name">附加协议：</span>
                    <pre>
                    <span className="item-content">{this.state.data.additionalProtocol || "暂无"}</span>
                </pre>
                </div>,
                <div className="mainEducation">
                    <span className="item-name">是否主机构：</span>
                    <span className="item-content">{this.state.data.mainEducation ? "否" : "是"}</span>
                </div>,
                <div className="createTime">
                    <span className="item-name">创建时间：</span>
                    <span
                        className="item-content">{this.state.data.createTime ? this.dateHandle02(this.state.data.createTime) : ""}</span>
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
                {/*<span onClick={this.showModal}>详情</span>*/}
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
        this.state = {
            loading: true,
            data: [],
            // 机构类型表
            typeList: [],
            // 当前机构类型
            type: null,
            // 当前机构状态
            status: null,
            addStatus: false,
            pagination: {
                current: 1,
                pageSize: 15,
                pageSizeOptions: ["5", "10", "15", "20"],
                showQuickJumper: true,
                showSizeChanger: true
            }
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                fixed: 'left',
                width: 70,
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '排序',
                dataIndex: 'sort',
                fixed: 'left',
                width: 130,
                editable: true,
            },
            {
                title: '机构名称',
                dataIndex: 'name',
                className: 'orgName',
                width: "13%",
                render: (text, record) => this.renderColumns(text, record, 'name'),
                // render: (text, record) => {
                //     return (
                //         <div>
                //             <ItemDetails
                //                 id={record.id}
                //                 record={record}
                //                 mark={1}
                //                 opStatus={this.props.opObj.select}
                //                 toLoginPage={this.props.toLoginPage}/>
                //         </div>
                //     )
                // }
            },
            {
                title: '所在地区',
                dataIndex: 'address',
                className: 'address',
                width: '13%',
                render: (text, record) => this.renderColumns(text, record, 'address'),
            },
            // {
            //     title: '照片',
            //     dataIndex: 'photo',
            //     width: '6%',
            //     render: (text, record) => (<img style={{width: '45px', height: "25px"}} alt="" src={record["photo"]}/>)
            // },
            {
                title: '机构类型',
                dataIndex: 'typeName',
                width: '8%',
                filters: this.state.typeList,
                // 单选
                filterMultiple: false,
                render: (text, record) => this.renderColumns(text, record, 'typeName'),
            },
            {
                title: '管理员',
                dataIndex: 'managerName',
                width: '5%',
                render: (text, record) => this.renderColumns(text, record, 'managerName'),
            },
            {
                title: '联系电话',
                dataIndex: 'telephone',
                width: '7%',
                render: (text, record) => this.renderColumns(text, record, 'telephone'),
            },
            {
                title: '预约次数',
                dataIndex: 'subscribeNumber',
                width: '6%',
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
                width: '7%',
                render: (text, record) => this.renderColumns(text, record, 'createTime'),
            },
            {
                title: '状态',
                dataIndex: 'status',
                /*filters: [
                    {text: '启用', value: 2},
                    {text: '禁用', value: 0},
                ],*/
                filterMultiple: false,
                width: '5%',
                render: (text, record) => this.renderColumns(text, record, 'status'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                // fixed: 'right',
                className: 'operating',
                width: 330,
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*机构详情*/}
                            <ItemDetails
                                id={record.id}
                                opStatus={this.props.opObj.select}
                                toLoginPage={this.props.toLoginPage}/>
                            {/*机构编辑*/}
                            <ItemEdit
                                id={record.id} 
                                educationKey={record.educationKey} 
                                recapture={this.getData}
                                toLoginPage={this.props.toLoginPage} 
                                opStatus={this.props.opObj.modify}/>
                            {/*教师管理*/}
                            <Link 
                                to={"./courses/" + record.id + "/" + record.name}
                                style={{display: this.props.opObj.select ? "inline" : "none"}}
                                >课程管理</Link>
                            {/* <Link to={{pathname: "./Courses", hash: "#abcd", query: {id:record.id, name: record.name}, state: {data:"hello"}}}>课程管理1</Link>*/}                       
                            {/* 课程管理 */}
                            <Link 
                                to={"./teachers/" + record.id + "/" + record.name}
                                style={{display: this.props.opObj.select ? "inline" : "none"}}
                                >教师管理</Link>
                            {/*添加教师*/}
                            {/* <TeacherAdd id={record.id} toLoginPage={this.props.toLoginPage}
                                        status={record.status === "启用" ? 1 : 0}/> */}
                            {/*课程添加*/}
                            {/* <CourseAdd id={record.id} status={record.status === "启用" ? 1 : 0}/> */}
                            {/*机构禁用*/}
                            <Popconfirm title={record.isDisabled === "启用" ? "确认禁用？" : "确认启用？"}
                                        placement="topRight"
                                        onConfirm={() => this.itemBan(record.id, record.isDisabled)}
                                        onCancel=""
                                        okType="danger"
                                        okText="确认"
                                        cancelText="取消">
                                <a style={{display: this.props.opObj.banOrg ? "inline" : "none"}}>{record.isDisabled === "启用" ? "禁用" : "启用"}</a>
                            </Popconfirm>
                            {/*<ShopSave
                                id={record.id} 
                                recapture={this.getData}
                                shopStatus={this.props.opObj.modify && record.status === "启用" && record.shopStatus === 0 ? 1 : 0}/>*/}
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
            d = time.getDate();
        return y + '-' + add0(m) + '-' + add0(d);
    };

    //获取本页信息
    getData = (keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/admin/org/list',
            type: 'json',
            method: 'get',
            data: {
                // 机构
                type: 2,
                // 机构类型
                typeId: this.state.type,
                // 机构状态
                status: this.state.status,
                // 机构名称
                orgName: keyword ? keyword.educationName : this.props.keyword.educationName,
                // 城市
                cityCode: keyword ? keyword.cityCode : this.props.keyword.cityCode,
                startTime: keyword ? keyword.startTime : this.props.keyword.startTime,
                endTime: keyword ? keyword.endTime : this.props.keyword.endTime,
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
                });                
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
                            tempStatus = "审核通过"
                        }
                        if (item.status === 3) {
                            tempStatus = "驳回"
                        }
                        let tempDisabled = ""
                        if (item.isDisabled === 1) {
                            tempDisabled = "启用"
                        }
                        if (item.isDisabled === 2) {
                            tempDisabled = "禁用"
                        }
                        data.push({
                            key: index.toString(),
                            id: item.id,
                            educationKey: item.educationKey,
                            index: index + 1,
                            sort: item.sort !== 0 ? item.sort : "",
                            photo: item.orgPath,
                            name: item.name,
                            // address: item.areaName,
                            address: item.provinceName + item.cityName + item.areaName + item.street,
                            // typeName: (item.typeName || "") + (item.typeNameTwo ? ("/" + item.typeNameTwo) : "") + (item.typeNameThree ? ("/" + item.typeNameThree) : ""),
                            typeName: item.typeNameStr || "暂无",
                            managerName: item.managerName,
                            telephone: item.telephone,
                            subscribeNumber: item.subscribeNumber,
                            managerPhone: item.managerPhone,
                            createUserName: item.createUserName,
                            shopStatus: tempShopStatus,
                            createTime: item.createTime ? this.dateHandle02(item.createTime) : "",
                            statusCode: item.status,
                            status: tempStatus,
                            isDisabled: tempDisabled,
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

    // 获取机构类型列表
    getInstitutionTypeList = () => {
        reqwest({
            url: '/institution/getEducationTypeList',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            error: (XMLHttpRequest) => {},
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

    //机构禁用、启用
    itemBan = (id, isDisabled) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/admin/org/banOrg',
            type: 'json',
            method: 'post',
            headers: {
                Authorization: sessionStorage.token
            },
            data: {
                id: id,
                // type: 2, 
                // 1-启用  2-禁用
                disabled: isDisabled === "启用" ? 2 : 1, 
            },
            error: (XMLHttpRequest) => {
                message.error("保存失败");
                this.setState({
                    loading: false
                })
            },
            success: (json) => {
                if (json.result === 0) {
                    message.success(isDisabled === "启用" ? "机构禁用成功" : "机构启用成功");
                    this.getData();
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
                            loading: false
                        })
                    }
                }
            }
        })
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
    handleSort = (row) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/admin/org/updateSort',
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
                    this.getData(); //刷新数据
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

    componentWillMount() {
        this.getData();
        // this.getInstitutionTypeList();
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
        return <Table 
                    bordered
                    components={components}
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    columns={columns}
                    scroll={{ x: 1700 }}
                    onChange={this.handleTableChange}/>;
    }
}

class Institutions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},
            type: 1,
            // 获取机构列表所需关键词
            keyword: {
                cityCode: "",
                educationName: "",
                // 初始化开始日期和结束日期
                startTime: null,
                endTime: null,
            },
            flag_add: false,
            treeData: [],
            // 日期禁选控制
            startValue: null,
            endValue: null,
        };
        // this.treeData = [];
        this.optionsCity = [<Option key={this.state.keyword.cityCode} value={this.state.keyword.cityCode}>{"全部"}</Option>];
    }

    getData = () => {
        this.refs.getDataCopy.getData();
    };

    // 城市列表 暂时不需要
    cityList = () => {
        reqwest({
            url: './city.json',
            type: 'json',
            method: 'get',
            success: (json) => {
                // for (let item in json) {
                //     console.log(item);
                //     this.optionsCity.push(
                //         // <OptGroup label={item}>
                //             {json.item.formEach((item, index)=>{
                //                 <Option key={item.id}>{item.name}</Option>
                //             })}
                //         // </OptGroup>
                //     )
                // }
                Object.keys(json).map((key) => {
                    json[key].forEach((item, index)=>{
                        this.optionsCity.push(
                            <Option key={item.id}>{item.name}</Option>
                        ) 
                    });
                    return false;
                });
            }
        });
    };

    //城市选择设置
    setCity = (value) => {
        console.log("selected:", value);
        this.setState({
            keyword: {
                cityCode: value,
            }
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
    
    // 开始日期设置
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

    // 结束日期设置
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
        console.log(1212)
        sessionStorage.clear();
        this.props.history.push('/')
    };

    componentWillMount() {
        // this.cityList();
        this.getDataOne();
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
    
    // 判断是否渲染组件
    // shouldComponentUpdate(nextProps) {
    //     console.log(nextProps);
    //     if (JSON.stringify(nextProps) == JSON.stringify(this.props)) {
    //       return false
    //     } else {
    //       return true
    //     }
    // }

    // 省份数据处理
    handleTree = (data) => {
        const tempResult = [];
        const result = [];
        
        let data01 = data.provinceList;
        let cityLists = data.cityList;
        data01.forEach((item) => {
            const temp = {
                title: item.name + "（" + item.orgNum + "）",
                key: item.id, 
                id: item.id,
                orgNum: item.orgNum,            
            };
            tempResult.push(temp)
        });
        tempResult.forEach((item) => {
            const fnFilter02 = (para) => {
                return para.provinceId === item.id
            };
            let data02 = cityLists.filter(fnFilter02);
            if (data02.length) {
                item.children = [];
                data02.forEach((subItem) => {
                    const temp = {
                        key: subItem.id,
                        title: subItem.name + "（" + subItem.orgNum + "）",
                        id: subItem.id,
                        orgNum: subItem.orgNum,
                    };
                    item.children.push(temp)                
                });
                result.push(item)
            }
        });
        console.log(result);
        return result;
    };

    //获取省份树信息
    getDataOne = (keyword) => {
        this.setState({
            loading: true
        });
        reqwest({
            url: '/admin/org/getArea',
            type: 'json',
            method: 'get',
            data: {
                type: 2,       
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
                if (json.result === 0) {
                    this.setState({
                        loading: false,
                        treeData: this.handleTree(json.data),
                    });
                    console.log(this.state.treeData);
                } else {
                    if (json.code === 901) {
                        message.error("请先登录");
                        // 返回登陆页
                        this.toLoginPage();
                    } else if (json.code === 902) {
                        message.error("登录信息已过期，请重新登录");
                        // 返回登陆页
                        this.toLoginPage();
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

     // 省份，市级选择
    onSelect = (selectedKeys, info) => {
        console.log("selected", selectedKeys);
        console.log(Number(selectedKeys));
        this.setState({
            keyword:{
                cityCode: Number(selectedKeys),
            }
        }) 
    };

    renderTreeNodes = data => data.map((item) => {
        if (item.children) {
          return (
            <TreeNode title={item.title} key={item.key} dataRef={item}>
              {this.renderTreeNodes(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode {...item} />;
    });

    render() {
        return (
            <Router>
                <div className="institutions">
                    {
                        this.state.opObj.select ?
                            <div>
                                <header className="clearfix">
                                    {/*城市筛选*/}
                                    {/*<Select defaultValue="全部"
                                            style={{
                                                width: "150px",
                                                float: "left",
                                                marginRight: "20px"
                                            }}
                                            onChange={this.setCity}>
                                        {this.optionsCity}
                                    </Select>*/}
                                    {/*机构名称筛选*/}
                                    <Search
                                        placeholder="请输入机构名称信息"
                                        onSearch={this.setName}
                                        enterButton
                                        style={{width: "320px", float: "left", marginRight: "20px"}}
                                    />
                                    {/*机构创建日期筛选*/}
                                    <span>日期筛选： </span>
                                    <DatePicker placeholder="请选择开始日期"
                                                style={{width: "150px"}}
                                                disabledDate={this.disabledStartDate}
                                                onChange={this.setStartTime}
                                                />
                                    <span style={{margin: "0 10px"}}>至</span>
                                    <DatePicker placeholder="请选择结束日期"
                                                style={{width: "150px"}}
                                                disabledDate={this.disabledEndDate}
                                                onChange={this.setEndTime}
                                                />
                                    {/*机构添加*/}
                                    <div className="add-button" style={{float: "right"}}>
                                        <ItemAdd 
                                            opStatus={this.state.opObj.add} 
                                            toLoginPage={this.toLoginPage}
                                            recapture={this.getData}/>
                                    </div>
                                </header>
                                <Layout>
                                    <Sider>
                                        <div className="tree-box">
                                            <div className="chooseDivision">选择行政区划</div>
                                            <div>
                                                {/*在测试环境中没有对接数据，不知道为什么，现在改成当有数据的时候在显示树型结构*/}
                                                {this.state.treeData && <Tree 
                                                                            showLine
                                                                            defaultExpandedKeys={["0"]} 
                                                                            onSelect={this.onSelect}>
                                                                            <TreeNode title="全部" key="0">
                                                                                {this.renderTreeNodes(this.state.treeData)}
                                                                            </TreeNode>
                                                                        </Tree>}
                                                {/*<Tree 
                                                    showLine
                                                    defaultExpandedKeys={["0"]} 
                                                    onSelect={this.onSelect}>
                                                    <TreeNode title="全部" key="0">
                                                        {this.renderTreeNodes(this.state.treeData)}
                                                    </TreeNode>
                                                </Tree>*/}
                                            </div>
                                            {/*<ProvinceTree 
                                                    getData={this.getData}
                                                    flag_add={this.state.flag_add}
                                                    toLoginPage={this.toLoginPage}/>*/}
                                        </div>
                                    </Sider>
                                    <Content>
                                        {/*机构列表*/}
                                        <div className="table-box">
                                            <DataTable
                                                    ref="getDataCopy"
                                                    opObj={this.state.opObj}
                                                    keyword={this.state.keyword}
                                                    flag_add={this.state.flag_add}
                                                    toLoginPage={this.toLoginPage}/>
                                        </div>
                                    </Content>
                                </Layout>
                            </div>
                            :
                            <p>暂无查询权限</p>
                    }
                </div>
            </Router>   
        )
    }
}

export default withRouter(Institutions);