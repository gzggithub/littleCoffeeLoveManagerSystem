import React, {Component} from 'react';
import {
    Table,
    Input,
    Button,
    Modal,
    Form,
    Popconfirm,
    Checkbox,
    message,
    Row,
    Col,
    Spin,
    Tree,
    Icon,
} from 'antd';
// import { roleList, addRole, deleteRole, updateRole, roleDetail, departmentList, memberList, subordinateMember, addMember, getPermissionList, getPermission, setPermission } from '../../config';
// import { getPower, handleTableChange, exceptHandle, errorHandle, toLoginPage } from '../../config/common';
import * as common from '../../config/common';
import * as config from '../../config';

const Search = Input.Search;
const {TextArea} = Input;
const FormItem = Form.Item;
const { TreeNode } = Tree;

//栅格设置
const formItemLayout_16 = {
    labelCol: {span: 4},
    wrapperCol: {span: 16},
};

//单元格
const Cell = ({value}) => (
    <div>{value}</div>
);

//新增角色表单
const ItemAddForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="添加角色"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}>
                <div className="role-add role-form">
                    <Form layout="vertical">
                        <FormItem className="roleName" {...formItemLayout_16} label="角色名称：">
                            {getFieldDecorator('roleName', {
                                rules: [{
                                    required: true,
                                    message: '角色名称不能为空'
                                }]
                            })(
                                <Input placeholder="请填写角色名称"/>
                            )}
                        </FormItem>
                        <FormItem className="remark" {...formItemLayout_16} label="角色描述：">
                            {getFieldDecorator('remark', {
                                rules: [{
                                    required: false,
                                    message: '角色描述'
                                }]
                            })(
                                <TextArea style={{resize: "none"}} placeholder="请填写角色描述" rows={5}/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        )
    }
);

//新增角色组件
class ItemAdd extends Component {
    state = {
        visible: false,
        loading: false
    };

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false
        }, () => {
            this.setState({loading: false});
            form.resetFields();
        });
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {return;}
            this.setState({loading: true});
            const data = {
                name: values.roleName,
                desc: values.remark,                
            };
            config.addRole(data).then((json) => {
                if (json.data.result === 0) {
                    message.success("角色添加成功");
                    this.handleCancel();
                    this.props.setFlag();
                } else {
                    common.exceptHandle(this, json.data);
                }
            }).catch((err) => common.errorHandle(this, err));
        })
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <div style={{display: this.props.opStatus ? "block" : "none"}}>
                <Button type="primary" onClick={this.showModal}>添加</Button>
                <ItemAddForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    confirmLoading={this.state.loading}
                />
            </div>
        );
    }
}

//添加人员表单
const ItemAddMemberForm  = Form.create()(
    (props) => {
        const {visible, checkedKeys, onCancel, onCreate, gData, searchValue, expandedKeys, autoExpandParent, onChange, onExpand, memberList, menberListLen, clearAllMember, clearSingle, onSelect, onCheck} = props;
        // 用于和表单进行双向绑定，详见下方描述
        // const {getFieldDecorator} = form;
        // 另外一种方式
        const renderTreeNodes = data => data.map((item) => {
            if (item.children) {
              return (
                <TreeNode title={item.title} key={item.key} dataRef={item}>
                  {renderTreeNodes(item.children)}
                </TreeNode>
              );
            }
            return <TreeNode {...item} dataRef={item} />;
        });

        // console.log(gData);
        // 添加人员所有的列表
        const loop = data => data.map((item) => {
            const index = item.title.indexOf(searchValue);
            const beforeStr = item.title.substr(0, index);
            const afterStr = item.title.substr(index + searchValue.length);
            const title = index > -1 ? (
                <span>
                    {beforeStr}
                    <span style={{ color: '#f50' }}>{searchValue}</span>
                    {afterStr}
                </span>
            ) : <span>{item.title}</span>;

            if (item.children) {
                return (
                    <TreeNode key={item.key} title={title}>
                        {loop(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode key={item.key} title={title} />;
        });        

        // 已选用户列表
        const memberListOption = [];
        memberList.forEach((item, index) => {
            memberListOption.push(
                <li key={index}>
                    <div>{item.name}</div>
                    <div onClick={()=>clearSingle(index, item.name,  item.id, (item.name + ',' + item.id))}><Icon type="close" style={{textAlign:"right"}} /></div>                                    
                </li>
            );
        });
        
        // console.log(checkedKeys);
        return (
            <Modal
                visible={visible}
                title="添加人员"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}>
                <div className="role-edit role-form role-add-member">
                    <div className="left">
                        <div className="top">添加人员</div>
                        <div className="bottom">
                            <Search style={{ marginBottom: 8}} onChange={onChange} placeholder="输入员工姓名"/>
                            <div style={{maxHeight: "300px", overflow: "auto"}}>
                                <Tree
                                    checkedKeys={checkedKeys}
                                    onExpand={onExpand}
                                    expandedKeys={expandedKeys}
                                    autoExpandParent={autoExpandParent}
                                    onSelect={onSelect}
                                    onCheck={onCheck}
                                    checkable={true}>
                                    {loop(gData)}
                                </Tree>                                    
                            </div>
                        </div>
                    </div>
                    <div className="right">
                        <div className="top">
                            <div>已选（<span>{menberListLen}</span>）</div>
                            <div onClick={clearAllMember}>清空</div>
                        </div>
                        <ul className="bottom">
                            {memberListOption}
                        </ul>
                    </div>                        
                </div>
            </Modal>
        );
    }
);

//添加人员组件
class ItemAddMember extends Component {
    constructor(props) {
        super(props);    
        this.state = {
            visible: false,
            // 初始详情信息
            data: {},
            loading: false,
            mockData: [],
            targetKeys: [],
            // 添加人员菜单项初始化
            expandedKeys: [],
            searchValue: '',
            autoExpandParent: true,
            // 添加人员选择人员数组初始化
            memberList: [],
            // 已选人员数
            menberListLen: 0,
            // 添加人员所有id
            memberListId: [],
            // 选中的key
            checkedKeys: [],
            // 部门列表数据
            gData: [],
            dataList: [],
            treeData: [],
        };
    }   

    showModal = () => {        
        this.getDepartmentList();// 获取部门列表
        this.setState({visible: true});
    };
    
    // 部门列表数据树型结构处理
    dataHandle = (data) => {
        let result = [];
        console.log(data)
        data.forEach((item) => {
            let subData = [];
            console.log(item.children.length)
            if (item.children.length) {
                console.log(123)
                item.children.forEach((subItem) => {
                    let thirdData = [];
                    if (subItem.children) {// 此处不能使用length判断是否存在
                        subItem.children.forEach((thirdItem) => {
                            let fourthData = [];
                            if (thirdItem.children) {
                                thirdItem.children.forEach((fourthItem) => {
                                    fourthData.push({
                                        title: fourthItem.name,                                                
                                        // key: fourthItem.name + ',' + fourthItem.id,
                                        key: fourthItem.id,
                                    })
                                })
                            } else {                                       
                                if (thirdItem.userList.length) {                                            
                                    thirdItem.userList.forEach((fifthItem) =>{
                                        fourthData.push({
                                            title: fifthItem.userName,                                                    
                                            key: fifthItem.userName + ',' + fifthItem.userId
                                        })
                                    })
                                }                                          
                            }                            
                            thirdData.push({
                                title: thirdItem.name,                                       
                                // key: thirdItem.name + ',' + thirdItem.id,
                                key: thirdItem.id,
                                children: fourthData,
                            })
                        })
                    } else {
                        if (subItem.userList.length) {
                            subItem.userList.forEach((thirdCopyItem) => {
                                thirdData.push({
                                    title: thirdCopyItem.userName,                                    
                                    key: thirdCopyItem.userName + ',' + thirdCopyItem.userId,
                                })                                            
                            })
                        }
                    }
                    console.log(subItem.userList)
                    subData.push({
                        title: subItem.name,
                        // key: subItem.name + ',' + subItem.id,                             
                        key: subItem.id,                             
                        children: thirdData
                    })
                })
            } else {
                console.log(23)
                if (item.userList.length) {
                    item.userList.forEach((subCopyItem) => {
                        subData.push({
                            title: subCopyItem.userName,                            
                            key: subCopyItem.userName + ',' + subCopyItem.userId
                        })
                    })
                }                
            }
            
            console.log(444)                     
            result.push({
                title: item.name,
                // key: item.name + ',' + item.id,
                key: item.id,
                children: subData
            })
        });
        console.log(result)
        return result;
    };
    
    // 获取部门列表
    getDepartmentList = (departmentName) => {
        config.subordinateMember().then((json) => {
            if (json.data.result === 0) {
                console.log(json.data.data)
                this.setState({                    
                    gData: this.dataHandle(json.data.data)
                });                
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };
    
    // 暂时不用
    generateList = (data) => {
        for (let i = 0; i < data.length; i++) {
            const node = data[i];
            const key = node.key;
            this.state.dataList.push({ key, title: key });
            if (node.children) {
              this.generateList(node.children);
            }
        }
    };    
    
    // 获取父级Key （暂时不用无删）
    getParentKey = (key, tree) => {
        let parentKey;
        for (let i = 0; i < tree.length; i++) {
            const node = tree[i];
            if (node.children) {
               if (node.children.some(item => item.key === key)) {
                    parentKey = node.key;
               } else if (this.getParentKey(key, node.children)) {
                    parentKey = this.getParentKey(key, node.children);
               }
            }
        }
        return parentKey;
    };
    
    // 展开指定的父节点key（暂时不用无删）
    onExpand = (expandedKeys) => {
        this.setState({
          expandedKeys,
          autoExpandParent: false,
        });
    };
    
    // 搜索查询 （暂时不用无删）
    onChange = (e) => {
        const value = e.target.value;
        // 按姓名模糊搜索部门
        this.getDepartmentList(value);

        const expandedKeys = this.state.dataList.map((item) => {
            if (item.title.indexOf(value) > -1) {
                return this.getParentKey(item.key, this.state.gData);
            }
            return null;
        }).filter((item, i, self) => item && self.indexOf(item) === i);
        this.setState({
            expandedKeys,
            searchValue: value,
            autoExpandParent: true,
        });
    };

    // 多选点击复选框的时候执行
    onCheck = (checkedKeys) => {
        console.log(checkedKeys)
        // 所选人员userName
        const userNamesTemp = [];
        //  所选人员userId
        const userIdsTemp = [];
        
        // 所有一级，二级id
        let allIds = [];

        // 选中的key（包括父级，自己，人员那一级）
        checkedKeys.forEach((item, index) => {
            let endIndex = item.indexOf(',');
            // console.log(endIndex)
            if (endIndex !== -1) {
                let name = item.slice(0, endIndex);
                let id = item.slice(endIndex + 1);
                // 所选人员name
                userNamesTemp.push({
                    name: name,
                    id: id
                })
                // 所选人员id
                userIdsTemp.push(Number(id));
            }
            if (endIndex === -1) {
                allIds.push(Number(item));
            }
        })
       
        // 合并人员和父级, 子级的id
        const temp = allIds.concat(userIdsTemp);
        // 现在是只显示人员名字那一层，那一层有人员，显示那些人员名字
        this.setState({
            // 已选添加人员的name列表
            memberList: userNamesTemp,
            // 所有id（包括父级，子级，人员那一级）
            memberListAllIds: temp,            
            // 已选人员数
            menberListLen: userNamesTemp.length,
            // 传给后台的已选人员id
            memberListId: userIdsTemp,
            // 选中的checkedKeys
            checkedKeys: checkedKeys,
        })
    };

    // 单选
    onSelect = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
        console.log(selectedKeys);        
    };
    
    // 清空所有 但是复选项框没有清除选项状态
    clearAllMember = () => {
        this.setState({
            // 已选添加人员的name列表
            memberList: [],
            // 传给后台的已选人员id
            memberListId: [],
            // 已选人员数
            menberListLen: 0,
            // 清空选中复选框的树节点
            checkedKeys: [],
        });
    };
    
    // 清掉单个 但是复选项框没有清除选项状态（使用checkedKeys)
    clearSingle = (index, name, id, userName) => {
        let memberListTemp01 = []
        this.state.memberList.forEach((item) => {
            if (item.name !== name) {
                memberListTemp01.push(item)
            } 
        });               
        
        // 已选成员人员id (删除当前点击id)
        let memberListTempId01 = [];       
        
        this.state.memberListId.forEach((item) => {
            // 数据类型
            if (item !== Number(id)) {
                memberListTempId01.push(item);
            }
        });       
        // 清掉单个之后，没有清掉的选中状态keys       
        let defaultCheckedKeys = [];
        this.state.checkedKeys.forEach((item)=>{           
            // 判断清除一个人员与选中人员进行比较，返回不等于清除的那个人员的所有人员名字
            if (item !== userName) {
                defaultCheckedKeys.push(item)
                // 清除一个添加人员的id 需要清除父级和子级id，当添加人员都被选了，默认父级和子级都选中
                let parentIndex = defaultCheckedKeys.indexOf(",")
                if (parentIndex === -1) {
                    defaultCheckedKeys = defaultCheckedKeys.splice(parentIndex, 1)
                }                
            }
        });
        
        this.setState({
            // 已选人员name
            memberList: memberListTemp01,
            // 已选成员人员id
            memberListId: memberListTempId01,
            // 已选人员数
            menberListLen: memberListTemp01.length,
            // 选择人员数节点控件
            checkedKeys: defaultCheckedKeys,           
        },()=>{            
            if (!this.state.memberList.length) {
                this.setState({
                    // 已选添加人员的name列表
                    memberList: [],
                    // 传给后台的已选人员id
                    memberListId: [],
                    // 已选人员数
                    menberListLen: 0,
                    // 清空选中复选框的树节点
                    checkedKeys: [],
                })
            }           
        })
    };

    // 过滤
    filterOption = (inputValue, option) => {
        return option.description.indexOf(inputValue) > -1
    };    
    
    //（暂时不用勿删）
    handleChange = (targetKeys) => {
        this.setState({ targetKeys });
    };
    
    //（暂时不用勿删）
    handleSearch = (dir, value) => {
        console.log('search:', dir, value);
    };
    
    // 取消
    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false,
        }, () => {
            this.setState({
                data: {},
                loading: false,             
                mockData: [],
                targetKeys: [],               
                expandedKeys: [],
                searchValue: '',
                autoExpandParent: true,                
                memberList: [],                
                menberListLen: 0,               
                memberListId: [],                
                checkedKeys: [],                
                gData: [],
                dataList: [],
                treeData: [],
            });
            form.resetFields();
        });
    };
    
    // 添加人员按钮
    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {return;}
            this.setState({loading: true});
            console.log(this.state.memberListId);
            const data = {
                roleId: this.props.id,             
                userIds: this.state.memberListId// 添加人员所有id                
            };
            config.addMember(data).then((json) => {
                if (json.data.result === 0) {
                    message.success("添加人员成功");
                    this.handleCancel();                        
                    this.props.recapture();// 编辑成功，重新获取列表
                } else {
                    common.exceptHandle(this, json.data);
                }
            }).catch((err) => common.errorHandle(this, err));
        });
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>添加人员</span>
                <ItemAddMemberForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    onLoadData={this.onLoadData}
                    treeData={this.state.treeData}
                    checkedKeys={this.state.checkedKeys}
                    defaultCheckedKeys={this.state.defaultCheckedKeys}
                    data={this.state.data}
                    confirmLoading={this.state.lLoading}
                    onExpand={this.onExpand}
                    onChange={this.onChange}
                    onSelect={this.onSelect}
                    onCheck={this.onCheck}
                    expandedKeys={this.state.expandedKeys}
                    searchValue={this.state.searchValue}
                    autoExpandParent={this.state.autoExpandParent}
                    memberList={this.state.memberList}
                    menberListLen={this.state.menberListLen}
                    clearAllMember={this.clearAllMember}
                    clearSingle={this.clearSingle}
                    mockData={this.state.mockData}
                    gData={this.state.gData}
                    targetKeys={this.state.targetKeys}
                    getMock={this.getMock}
                    dataList={this.state.dataList}
                    getParentKey={this.getParentKey}

                    handleChange={this.handleChange}
                    handleSearch={this.handleSearch}
                    filterOption={this.filterOption}
                />
            </a>
        )
    }
}

//角色权限设置表单
const RoleAuthorityForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, menuList, menuListExist, setMenuListExist, confirmLoading} = props;

        // 一级菜单项点击处理函数
        const itemClick = (id, value) => {
            setMenuListExist(1, id, value)
        };
        // 二级菜单项点击处理函数
        const subItemClick = (id, value, parentId) => {
            setMenuListExist(2, id, value, parentId)
        };
        // 三级菜单项点击处理函数
        const thirdItemClick = (id, value, parentId, gParentId) => {
            setMenuListExist(3, id, value, parentId, gParentId)
        };

        // 四级菜单项点击处理函数
        const fourthItemClick = (id, value, parentId, gParentId, gfParentId) => {
            setMenuListExist(4, id, value, parentId, gParentId, gfParentId)
        };

        // 权限菜单选项列表生成
        const optionOfMenuList = [];
        menuList.forEach((item) => {
            // 遍历当前一级菜单下属二级菜单，生成二级菜单选项列表
            const tempSubItems = [];
            if (item.children) {
                item.children.forEach((childrenItem) => {
                    // 遍历当前二级菜单下属三级菜单，生成三级菜单选项列表
                    const tempThirdItems = [];
                    if (childrenItem.children) {
                        childrenItem.children.forEach((thirdItem) => {
                            const tempFourthItems = [];
                            if(thirdItem.children) {
                                thirdItem.children.forEach((fourthItem) => {
                                    tempFourthItems.push(
                                        <Col key={fourthItem.id}>
                                            <Checkbox value={fourthItem.id}
                                                      onClick={(event) => {
                                                          fourthItemClick(fourthItem.id, event.target.checked, fourthItem.parentId, fourthItem.gParentId, fourthItem.gfParentId)
                                                      }}>{fourthItem.name}</Checkbox>
                                        </Col>)
                                        })
                            }
                            // 三级菜单选项写入
                            tempThirdItems.push(
                                thirdItem.children ?
                                    <Row key={thirdItem.id} className="subfourthItemBox">
                                        <Col key={thirdItem.id}>
                                            <Checkbox value={thirdItem.id}
                                                      onClick={(event) => {
                                                          thirdItemClick(thirdItem.id, event.target.checked, thirdItem.parentId, thirdItem.gParentId, thirdItem.gfParentId)
                                                      }}>{thirdItem.name}</Checkbox>
                                        </Col>
                                        <div className={thirdItem.children ? "fourthItemBox" : ""}
                                            style={{display: thirdItem.children ? "block" : "none"}}>
                                            {tempFourthItems}
                                        </div>
                                    </Row>
                                    :
                                    <Row key={thirdItem.id} className="subfourthItemBox">
                                        <Col key={thirdItem.id}>
                                            <Checkbox value={thirdItem.id}
                                                      onClick={(event) => {
                                                          thirdItemClick(thirdItem.id, event.target.checked, thirdItem.parentId, thirdItem.gParentId, thirdItem.gfParentId)
                                                      }}>{thirdItem.name}</Checkbox>
                                        </Col>
                                    </Row>
                            )
                        })
                    }
                    // 二级菜单选项写入
                    tempSubItems.push(
                        <Row key={childrenItem.id}>
                            <div className="">
                                <Col key={childrenItem.id}>
                                    <Checkbox value={childrenItem.id}
                                              onClick={(event) => {
                                                  subItemClick(childrenItem.id, event.target.checked, childrenItem.parentId)
                                              }}>{childrenItem.name}</Checkbox>
                                </Col>
                            </div>
                            <div className="thirdItemBox">
                                {tempThirdItems}
                            </div>
                        </Row>)
                })
            }
            // 一级菜单选项写入
            optionOfMenuList.push(
                <Row key={item.id}>
                    <div className="itemBox">
                        <Col key={item.id}>
                            <Checkbox value={item.id}
                                      onClick={(event) => {
                                          itemClick(item.id, event.target.checked)
                                      }}>{item.name}</Checkbox>
                        </Col>
                    </div>
                    <div className="subItemBox">
                        {tempSubItems}
                    </div>
                </Row>
            )
        });

        return (
            <Modal
                visible={visible}
                title="权限设置"
                width={1000}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}>
                {
                    (menuList.length === 0 || menuListExist.length === "") ?
                        <div className="spin-box">
                            <Spin/>
                        </div>
                        :
                        <div className="role-authority" style={{width: "1500px"}}>
                            <Form layout="vertical">
                                <FormItem className="roleMenuList" label="角色权限：">
                                    <Checkbox.Group style={{width: '100%'}} value={menuListExist}>
                                        {optionOfMenuList}
                                    </Checkbox.Group>
                                </FormItem>
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

//角色权限设置组件
class RoleAuthority extends Component {
    state = {
        visible: false,
        // 可用权限菜单列表，即当前登录人权限菜单列表
        menuList: [],
        // 该角色权限菜单列表
        menuListExist: [],
        // 该角色初始权限菜单列表
        menuListExistInit: [],
        loading: false
    };

    // 权限菜单列表处理函数
    dataHandle = (data) => {
        // 列表中过滤掉status为true的项，得到有效的权限菜单列表
        const dataEffective = (para) => {
            return para.status === false
        };
        console.log(data)
        // 有效的权限菜单列表
        data = data.filter(dataEffective);
        console.log(data)
        // 一级菜单列表
        const tempResult = [];
        // 所需权限菜单列表
        const result = [];
        // 获取一级菜单列表（parentId为0的项）；
        const fnFilter = (para) => {
            return para.parentId === 0
        };
        console.log(data);
        data.filter(fnFilter).forEach((item) => {
            let temp = {
                id: item.id,
                name: item.name,
                url: item.url,
            };
            tempResult.push(temp)
        });
        console.log(tempResult)
        console.log(tempResult);
        // 遍历一级菜单，生成所需要的权限菜单列表
        tempResult.forEach((item) => {
            // 获取当前一级菜单下属二级菜单列表，写入children属性
            const fnFilter_ = (para) => {
                return para.parentId === item.id
            };
            if (data.filter(fnFilter_).length) {
                item.children = [];
                // 遍历二级菜单列表
                data.filter(fnFilter_).forEach((subItem) => {
                    // 获取当前二级菜单下属三级菜单列表，写入children属性
                    const fnFilter__ = (para) => {
                        return para.parentId === subItem.id
                    };
                    if (data.filter(fnFilter__).length) {
                        subItem.children = [];
                        // 遍历三级菜单列表
                        data.filter(fnFilter__).forEach((thirdItem) => {
                            // 获取当前三级菜单下属四级菜单，写入children属性
                            const fnFilter___ = (para) => {
                                return para.parentId === thirdItem.id
                            }
                            if (data.filter(fnFilter___).length) {
                                thirdItem.children = [];
                                // 遍历四级菜单列表
                                data.filter(fnFilter___).forEach((fourthItem) => {
                                    // 当前四级菜单信息对象生成
                                    let fourthData = {
                                        id: fourthItem.id,
                                        name: fourthItem.name,
                                        url: fourthItem.url,
                                        parentId: thirdItem.id,
                                        gParentId: subItem.id,
                                        gfParentId: item.id,
                                    }
                                    thirdItem.children.push(fourthData);
                                })
                            }

                            // 当前三级菜单信息对象生成
                            let thirdData = {
                                id: thirdItem.id,
                                name: thirdItem.name,
                                url: thirdItem.url,
                                parentId: subItem.id,
                                gParentId: item.id,
                                children: thirdItem.children,
                            };
                            // 写入所属二级菜单children属性
                            subItem.children.push(thirdData)
                        })
                    }
                    // 当前二级菜单信息对象生成
                    let temp = {
                        id: subItem.id,
                        name: subItem.name,
                        url: subItem.url,
                        parentId: item.id,
                        children: subItem.children
                    };
                    // 写入所属一级菜单children属性
                    item.children.push(temp)
                });
            }
            // 写入result
            result.push(item)
        });
        console.log(result);
        return result
    };

    // 获取可用权限菜单列表
    getMenuList = () => {
        config.getPermissionList().then((json) => {
            if (json.data.result === 0) {
                console.log(json.data.data);
                this.setState({
                    menuList: this.dataHandle(json.data.data)// 对原始权限菜单列表进行处理后写入
                });
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    // 获取该角色当前权限菜单列表
    getMenuListExist = () => {
        config.getPermission({id: this.props.id}).then((json) => {
            if (json.data.result === 0) {
                let data=[];
                if (json.data.data.length) {
                    json.data.data.forEach((item) => {
                        data.push(item.id);
                    });
                    // 排序
                    data.sort((a, b) => {return a - b});
                    // 该处需进行对象深拷贝，防止menuListExistInit数据篡改
                    this.setState({
                        menuListExist: JSON.parse(JSON.stringify(data)),
                        menuListExistInit: JSON.parse(JSON.stringify(data))
                    });
                }                   
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    // 权限菜单变更处理函数（无三级菜单项处理，已废弃）
    setMenuListExist__ = (type, id, value, parentId) => {
        if (type === 1) {
            let target = this.state.menuList.filter(item => id === item.id)[0];
            if (value) {
                let tempArr = this.state.menuListExist;
                tempArr.push(id);
                target.children.forEach((item) => {
                    tempArr.push(item.id)
                });
                this.setState({
                    menuListExist: tempArr
                })
            } else {
                let tempArr = this.state.menuListExist;
                tempArr.splice(tempArr.indexOf(id), 1);
                target.children.forEach((item) => {
                    const index = tempArr.indexOf(item.id);
                    if (index !== -1) {
                        tempArr.splice(index, 1);
                    }
                });
                this.setState({
                    menuListExist: tempArr
                })
            }
        }
        if (type === 2) {
            if (value) {
                let tempArr = this.state.menuListExist;
                if (tempArr.indexOf(parentId) === -1) {
                    tempArr.push(parentId);
                }
                tempArr.push(id);
                this.setState({
                    menuListExist: tempArr
                })
            } else {
                let tempArr = this.state.menuListExist;
                tempArr.splice(tempArr.indexOf(id), 1);
                let target = this.state.menuList.filter(item => parentId === item.id)[0];
                let flag = false;
                target.children.forEach((item) => {
                    let index = tempArr.indexOf(item.id);
                    if (index !== -1) {
                        flag = true
                    }
                });
                if (!flag) {
                    tempArr.splice(tempArr.indexOf(parentId), 1);
                }
                this.setState({
                    menuListExist: tempArr
                })
            }
        }
    };

    // 权限菜单变更处理函数
    setMenuListExist = (type, id, value, parentId, gParentId, gfParentId) => {
        // type：操作菜单级别标识；id：操作菜单id；value：操作菜单选择框当前状态；parentId：操作菜单父菜单id；gParentId：操作菜单父菜单的父菜单Id
        // 已选中菜单Id列表
        const tempArr = this.state.menuListExist;
        // 一级菜单变更处理
        if (type === 1) {
            // type, id, value
            // 获取当前操作菜单对象
            let target = this.state.menuList.filter(item => id === item.id)[0];
            if (value) {
                // 选中分支
                // 选中一级菜单项，则默认选中其下属所有二、三级菜单项
                // 一级菜单id写入
                tempArr.push(id);
                target.children.forEach((item) => {
                    // 二级菜单id写入
                    tempArr.push(item.id);
                    if (item.children) {
                        item.children.forEach((subItem) => {
                            // 三级菜单id写入
                            tempArr.push(subItem.id);
                            if (subItem.children) {
                                subItem.children.forEach((thirdItem) => {
                                    // 四级菜单id写入
                                    tempArr.push(thirdItem.id);
                                })
                            }
                        });
                    }
                });
                this.setState({
                    menuListExist: tempArr
                })
            } else {
                // 取消选中分支
                // 取消选中一级菜单项，则默认取消选中其下属所有二、三级菜单项
                // 一级菜单id删除
                tempArr.splice(tempArr.indexOf(id), 1);
                target.children.forEach((item) => {
                    const index = tempArr.indexOf(item.id);
                    if (index !== -1) {
                        // 二级菜单id存在则删除
                        tempArr.splice(index, 1);
                        if (item.children) {
                            item.children.forEach((subItem) => {
                                const subIndex = tempArr.indexOf(subItem.id);
                                if (subIndex !== -1) {
                                    // 三级菜单id存在则删除
                                    tempArr.splice(subIndex, 1);

                                    if (subItem.children) {
                                        subItem.children.forEach((thirdItem) => {
                                            const thirdIndex = tempArr.indexOf(thirdItem.id)
                                            if (thirdIndex !== -1) {
                                                // 四级菜单id存在则删除
                                                tempArr.splice(thirdIndex, 1)
                                            }
                                        })
                                    }

                                }
                            });
                        }
                    }
                });
                this.setState({
                    menuListExist: tempArr
                })
            }
        }
        // 二级菜单变更处理
        if (type === 2) {
            // type, id, value，parentId
            // 获取当前操作菜单所属一级菜单对象
            let parentTarget = this.state.menuList.filter(item => parentId === item.id)[0];
            // 获取当前操作菜单对象
            let target = parentTarget.children.filter(item => id === item.id)[0];
            if (value) {
                // 选中分支
                // 选中二级菜单项，则默认选中其所属一级菜单项及其下属所有三级、四级菜单项
                // 一级菜单为未选择状态，则id写入
                if (tempArr.indexOf(parentId) === -1) {
                    tempArr.push(parentId);
                }
                // 二级菜单id写入
                tempArr.push(id);
                if (target.children) {
                    target.children.forEach((item) => {
                        // 三级菜单id写入
                        tempArr.push(item.id)
                        if (item.children) {
                            item.children.forEach((subItem) => {
                                // 四级菜单id写入
                                tempArr.push(subItem.id)
                            })
                            
                        }
                    });
                }
                this.setState({
                    menuListExist: tempArr
                })
            } else {
                // 取消选中分支
                // 取消选中二级菜单项，则默认取消选中其下属所有三级菜单项；若该二级菜单项已经是其一级菜单下属二级菜单中唯一一个选中项，则取消选中此二级菜单项的同时需取消选中其一级菜单项
                // 二级菜单id删除
                tempArr.splice(tempArr.indexOf(id), 1);
                // 所属一级菜单项是否取消选中判断
                let flag = false;
                parentTarget.children.forEach((item) => {
                    let index = tempArr.indexOf(item.id);
                    if (index !== -1) {
                        // 有选中项，flag设为true
                        flag = true
                    }
                });
                if (!flag) {
                    // flag为false表明所属一级菜单下属二级菜单均未选中，则取消选中该一级菜单
                    tempArr.splice(tempArr.indexOf(parentId), 1);
                }
                // 下属三、四级菜单取消选中
                if (target.children) {
                    target.children.forEach((item) => {
                        const index = tempArr.indexOf(item.id);
                        if (index !== -1) {
                            // 三级菜单id存在则删除
                            tempArr.splice(index, 1);
                            // 下属四级级菜单取消选中
                            if (item.children) {
                                item.children.forEach((subItem) => {
                                    const subIndex = tempArr.indexOf(subItem.id);
                                    if (subIndex !== -1) {
                                        // 四级菜单id存在则删除
                                        tempArr.splice(subIndex, 1);
                                    }
                                })
                            }
                        }
                    });
                }
                this.setState({
                    menuListExist: tempArr
                })
            }
        }
        // 三级菜单变更处理
        if (type === 3) {
            // 获取当前操作菜单所属一级菜单对象
            let target02 = this.state.menuList.filter(item => gParentId === item.id)[0];
            // 获取当前操作菜单所属二级菜单对象
            let target01 = target02.children.filter(item => parentId === item.id)[0];
            // 获取当前操作菜单对象
            let target = target01.children.filter(item => id === item.id)[0];
            if (value) {
                // 选中分支
                // 选中三级菜单项，则默认选中其所属一、二级菜单项及其下属所有四级菜单项
                // 一级菜单为未选择状态，则id写入
                if (tempArr.indexOf(gParentId) === -1) {
                    tempArr.push(gParentId);
                }
                // 二级菜单为未选择状态，则id写入
                if (tempArr.indexOf(parentId) === -1) {
                    tempArr.push(parentId);
                }
                // 三级菜单id写入
                tempArr.push(id);
                if (target.children) {
                    target.children.forEach((item) => {
                        // 四级菜单id写入
                        tempArr.push(item.id)
                    });
                }
                this.setState({
                    menuListExist: tempArr
                })
            } else {
                // 取消选中分支
                tempArr.splice(tempArr.indexOf(id), 1);
                // // 获取当前操作菜单所属一级菜单对象
                // let target02 = this.state.menuList.filter(item => gParentId === item.id)[0];
                // // 获取当前操作菜单所属二级菜单对象
                // let target01 = target02.children.filter(item => parentId === item.id)[0];
                
                // 所属一级菜单项是否取消选中判断
                // let flag = false;
                // target02.children.forEach((item) => {
                //     let index = tempArr.indexOf(item.id);
                //     if (index !== -1) {
                //         // 有选中项，flag设为true
                //         flag = true
                //     }
                // });
                // if (!flag) {
                //     // flag为false表明所属一级菜单下属二级菜单均未选中，则取消选中该一级菜单
                //     tempArr.splice(tempArr.indexOf(parentId), 1);
                // }


                // 所属二级菜单项是否取消选中判断
                let flag01 = false;
                target01.children.forEach((item) => {
                    let index = tempArr.indexOf(item.id);
                    if (index !== -1) {
                        flag01 = true
                    }
                });
                if (!flag01) {
                    // 二级菜单项取消选中
                    tempArr.splice(tempArr.indexOf(parentId), 1);
                    // 所属一级菜单项是否取消选中判断
                    let flag02 = false;
                    target02.children.forEach((item) => {
                        let index = tempArr.indexOf(item.id);
                        if (index !== -1) {
                            flag02 = true
                        }
                    });
                    if (!flag02) {
                        // 一级菜单项取消选中
                        tempArr.splice(tempArr.indexOf(gParentId), 1);
                    }
                }
                
                // 下属四级菜单取消选中
                if (target.children) {
                    target.children.forEach((item) => {
                        const index = tempArr.indexOf(item.id);
                        if (index !== -1) {
                            // 四级菜单id存在则删除
                            tempArr.splice(index, 1);
                        }
                    });
                }
                this.setState({
                    menuListExist: tempArr
                })
            }
        }
        // 四级菜单变更处理
        if (type === 4) {
            console.log(444)
            if (value) {
                // 选中分支
                // 选中四级菜单项，则默认选中其所属一、二、三级菜单项
                // 一级菜单为未选择状态，则id写入
                if (tempArr.indexOf(gfParentId) === -1) {
                    tempArr.push(gfParentId);
                }
                // 二级菜单为未选择状态，则id写入
                if (tempArr.indexOf(gParentId) === -1) {
                    tempArr.push(gParentId);
                }
                // 三级菜单为未选择状态，则id写入
                if (tempArr.indexOf(parentId) === -1) {
                    tempArr.push(parentId);
                }
                // 四级菜单id写入
                tempArr.push(id);
                this.setState({
                    menuListExist: tempArr
                })
            } else {
                // 取消选中分支
                tempArr.splice(tempArr.indexOf(id), 1);
                // 获取当前操作菜单所属一级菜单对象
                console.log(this.state.menuList);
                console.log(gfParentId);
                let target03 = this.state.menuList.filter(item => gfParentId === item.id)[0];
                // 获取当前操作菜单所属二级菜单对象
                console.log(target03);
                console.log(gParentId);
                let target02 = target03.children.filter(item => gParentId === item.id)[0];
                // 获取当前操作菜单所属三级菜单对象
                console.log(target02);
                let target01 = target02.children.filter(item => parentId === item.id)[0];

                // 注意三级菜单

                // 所属三级菜单项是否取消选中判断
                let flag01 = false;
                target01.children.forEach((item) => {
                    let index = tempArr.indexOf(item.id);
                    if (index !== -1) {
                        flag01 = true
                    }
                });
                if (!flag01) {
                    // 三级菜单项取消选中
                    tempArr.splice(tempArr.indexOf(parentId), 1);
                    // 所属二级菜单项是否取消选中判断
                    let flag02 = false;
                    target02.children.forEach((item) => {
                        let index = tempArr.indexOf(item.id);
                        if (index !== -1) {
                            flag02 = true
                        }
                    });
                    if (!flag02) {
                        // 二级菜单项取消选中
                        tempArr.splice(tempArr.indexOf(gParentId), 1);

                        let flag03 = false;
                        target03.children.forEach((item) => {
                            let index = tempArr.indexOf(item.id);
                            if (index !== -1) {
                                flag03 = true
                            }
                        });
                        if (!flag03) {
                            // 一级菜单项取消选中
                            tempArr.splice(tempArr.indexOf(gfParentId), 1);
                        }
                    }
                }
                this.setState({
                    menuListExist: tempArr
                })
            }
        }
    };

    showModal = () => {        
        this.getMenuList();// 获取可用角色权限菜单列表        
        this.getMenuListExist();// 获取该角色当前权限菜单列表
        this.setState({visible: true});
    };

    handleCancel = () => {
        this.setState({
            visible: false
        }, () => {
            this.setState({
                menuList: [],
                menuListExist: [],
                menuListExistInit: [],
                loading: false
            });
        });
    };

    handleCreate = () => {
        if (this.state.menuList.length === 0) {
            return;
        }
        // 排序
        let data = this.state.menuListExist;
        data.sort((a, b) => {
            return a - b
        });
        console.log(data);
        console.log(this.state.menuListExist);
        this.setState({loading: true});
        console.log(this.state.menuListExist);

        config.setPermission({
            roleId: this.props.id,
            menuIds: this.state.menuListExist            
        }).then((json) => {
            if (json.data.result === 0) {
                message.success("角色权限设置成功");
                this.handleCancel();
                this.props.recapture();
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    render() {
        return (
            <a style={{display: this.props.opStatus ? "inline" : "none"}}>
                <span onClick={this.showModal}>权限设置</span>
                <RoleAuthorityForm
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                    menuList={this.state.menuList}
                    menuListExist={this.state.menuListExist}
                    setMenuListExist={this.setMenuListExist}
                    confirmLoading={this.state.loading}/>
            </a>
        )
    }
}

//角色编辑表单
const ItemEditForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, data, confirmLoading} = props;
        const {getFieldDecorator} = form;

        return (
            <Modal
                visible={visible}
                title="角色编辑"
                width={600}
                onCancel={onCancel}
                onOk={onCreate}
                destroyOnClose={true}
                confirmLoading={confirmLoading}>
                {
                    JSON.stringify(data) === "{}" ?
                        <div className="spin-box">
                            <Spin/>
                        </div>
                        :
                        <div className="role-edit role-form">
                            <Form layout="vertical">
                                <FormItem className="roleName" {...formItemLayout_16} label="角色名称：">
                                    {getFieldDecorator('roleName', {
                                        initialValue: data.roleName,
                                        rules: [{
                                            required: true,
                                            message: '角色名称不能为空'
                                        }]
                                    })(
                                        <Input placeholder="请填写角色名称"/>
                                    )}
                                </FormItem>
                                <FormItem className="remark" {...formItemLayout_16} label="角色描述：">
                                    {getFieldDecorator('remark', {
                                        initialValue: data.remark,
                                        rules: [{
                                            required: false,
                                            message: '角色描述'
                                        }]
                                    })(
                                        <TextArea style={{resize: "none"}} placeholder="请填写角色描述" rows={5}/>
                                    )}
                                </FormItem>
                            </Form>
                        </div>
                }
            </Modal>
        );
    }
);

//角色编辑组件
class ItemEdit extends Component {
    state = {
        visible: false,        
        data: {},// 初始详情信息
        loading: false
    };

    getData = () => {       
        config.roleDetail({id: this.props.id}).then((json) => {
            if (json.data.result === 0) {
                this.setState({data: json.data.data});
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    showModal = () => {        
        this.getData();// 获取初始详情信息
        this.setState({visible: true,})
    };

    handleCancel = () => {
        const form = this.form;
        this.setState({
            visible: false,
        }, () => {
            this.setState({
                data: {},
                loading: false
            });
            form.resetFields();
        });
    };

    handleCreate = () => {
        const form = this.form;
        form.validateFields((err, values) => {
            if (err) {return;}
            const data = {
                id: this.props.id,
                name: values.roleName,
                desc: values.remark
            };
            config.updateRole(data).then((json) => {
                if (json.data.result === 0) {
                    message.success("角色信息编辑成功");
                    this.handleCancel();                    
                    this.props.recapture();// 编辑成功，重新获取列表
                } else {
                    common.exceptHandle(this, json.data);
                }
            }).catch((err) => common.errorHandle(this, err));
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
                    data={this.state.data}
                    confirmLoading={this.state.loading}/>
            </a>
        )
    }
}

//成员名单表单
const NumDetailForm = Form.create()(
    (props) => {
        const {visible, onCancel, loading, data, columns, _this, pagination, confirmLoading} = props;

        return (
            <Modal
                visible={visible}
                title="成员"
                width={600}
                onCancel={onCancel}
                destroyOnClose={true}
                confirmLoading={confirmLoading}
                footer={null}>
                <div className="table-box">                    
                    <Table 
                        bordered
                        loading={loading}
                        dataSource={data}
                        pagination={pagination}
                        columns={columns}
                        onChange={(pagination) => common.handleTableChange(_this, pagination)}/>
                </div>
            </Modal>
        );
    }
);

//成员名单组件
class NumDetail extends Component {
    state = {
        visible: false,
        loading: false,
        data: [],
        pagination: common.pagination
    };
                     
    columns = [
            {
                title: '姓名',
                dataIndex: 'username',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'username'),
            },
            {
                title: '手机号',
                dataIndex: 'phone',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'phone'),
            },
            {
                title: '部门',
                dataIndex: 'departmentName',
                render: (text, record) => this.renderColumns(text, record, 'departmentName'),                
            },
        ];

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        );
    }

    showModal = () => {
        this.setState({visible: true});
        this.getDataMemberList();
    };

    dataHandle = (data) => {
        const result = [];
        data.forEach((item, index) => {
            result.push({
                key: index.toString(),
                id: item.id,
                index: index + 1,
                username: item.username,
                phone: item.phone,
                departmentName: item.departmentName
            });
        });
        return result;
    };

    getDataMemberList = () => {
        this.setState({loading: true});        
        config.memberList({
            id: this.props.id,
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize
        }).then((json) => {
            if (json.data.result === 0) {
                if (json.data.data.list.length === 0 && this.state.pagination.current !== 1) {
                    this.setState({
                        pagination: {
                            current: 1,
                            pageSize: this.state.pagination.pageSize
                        }
                    }, () => {
                        this.getDataMemberList();
                    });
                    return
                }
                this.setState({
                    data: this.dataHandle(json.data.data.list),
                    loading: false,
                    pagination: {
                        total: json.data.data.total,
                        current: this.state.pagination.current,
                        pageSize: this.state.pagination.pageSize
                    }
                })
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    handleCancel = () => {
        this.setState({
            visible: false
        }, () => {
            this.setState({                
                loading: false,
                data: [],
            });
        })       
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    render() {
        return (
            <a>
                <span onClick={() => this.showModal()}>{this.props.num}</span>
                <NumDetailForm
                    ref={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    loading={this.state.loading}
                    data={this.state.data}
                    columns={this.columns}
                    pagination={this.state.pagination}
                    _this={this}/>
            </a>
        );
    }
}

//角色列表
class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            pagination: common.pagination
        };
        this.columns = [
            {
                title: '序号',
                dataIndex: 'index',
                width: 70,
                render: (text, record) => this.renderColumns(text, record, 'index'),
            },
            {
                title: '角色名称',
                dataIndex: 'name',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'name'),
            },
            {
                title: '成员',
                dataIndex: 'roleNums',
                width: '10%',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            <NumDetail 
                                id={record.id} 
                                parentId={record.parentId} 
                                num={record.roleNums} 
                                recapture={this.getData}
                                toLoginPage={this.props.toLoginPage}/>
                        </div>
                    )
                }
            },
            {
                title: '角色描述',
                dataIndex: 'remark',
                width: '20%',
                render: (text, record) => this.renderColumns(text, record, 'remark'),
            },
            {
                title: '更新时间',
                dataIndex: 'updateTime',
                width: '15%',
                render: (text, record) => this.renderColumns(text, record, 'updateTime'),
            },
            {
                title: '操作',
                dataIndex: '操作',
                className: 'operating',
                render: (text, record) => {
                    return (
                        <div className="editable-row-operations">
                            {/*添加人员*/}
                            <ItemAddMember 
                                id={record.id} 
                                roleId={record.roleId} 
                                orgId={record.orgId} 
                                recapture={this.getData} 
                                opStatus={this.props.opObj.bindUserRole}
                                toLoginPage={this.props.toLoginPage}/>                            
                            {/*设置权限*/}
                            <RoleAuthority 
                                id={record.id} 
                                recapture={this.getData} 
                                opStatus={this.props.opObj.updateJurisdiction}
                                toLoginPage={this.props.toLoginPage}/>
                            {/*编辑*/}
                            <ItemEdit 
                                id={record.id} 
                                recapture={this.getData} 
                                opStatus={this.props.opObj.modify}
                                toLoginPage={this.props.toLoginPage}/>
                            {/*删除*/}
                            <Popconfirm 
                                title="确认删除?"
                                placement="topRight"
                                onConfirm={() => this.itemDelete(record.id)}
                                onCancel=""
                                okType="danger"
                                okText="立即删除"
                                cancelText="取消">
                                <a style={{display: this.props.opObj.delete ? "inline" : "none"}}>删除</a>
                            </Popconfirm>
                        </div>
                    );
                },
            }
        ];
    };

    //列渲染
    renderColumns(text) {
        return (
            <Cell value={text}/>
        )
    };

    dataHandle = (data) => {
        const result = [];
        data.forEach((item, index) => {
            result.push({
                key: index.toString(),
                id: item.id,
                index: index + 1,
                name: item.roleName,
                roleNums: item.num,
                remark: item.remark,
                updateTime: item.createTime,
            })
        })
        return result;
    };

    //获取本页信息
    getData = (keyword) => {
        this.setState({loading: true});
        const params = {
            roleName: keyword ? keyword.roleName : this.props.keyword.roleName,
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize
        }
        config.roleList(params).then((json) => {
            if (json.data.result === 0) {
                if (json.data.data.list.length === 0 && this.state.pagination.current !== 1) {
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
                    data: this.dataHandle(json.data.data.list),
                    pagination: {
                        total: json.data.data.total,
                        current: this.state.pagination.current,
                        pageSize: this.state.pagination.pageSize
                    }
                })
            } else {
                common.exceptHandle(this, json.data);
            }
        }).catch((err) => common.errorHandle(this, err));
    };

    //角色删除
    itemDelete = (para) => {
        this.setState({loading: true});
        config.deleteRole({id: para}).then((json) => {
            if (json.data.result === 0) {
                    message.success("删除成功");
                    this.getData();
                } else {
                    common.exceptHandle(this, json.data);
                }
        }).catch((err) => common.errorHandle(this, err));
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
    };

    render() {
        return <Table 
                    bordered
                    loading={this.state.loading}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    columns={this.columns}
                    onChange={(pagination) => common.handleTableChange(this, pagination)}/>;
    }
}

class Roles extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opObj: {},            
            keyword: { // 获取信息列表所需关键词            
                roleName: ''// 角色名称
            },
            flag_add: false
        }
    };

    // 获取当前登录人对此菜单的操作权限
    setPower = () => {
       this.setState({opObj: common.getPower(this).data});
    };

    // 关键词写入
    setKeyword = (value) => {
        this.setState({keyword: {roleName: value}});
    };

    setFlag = () => {
        this.setState({flag_add: !this.state.flag_add});
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
        console.log(this.state.opObj);
        return (
            <div className="roles">
                {
                    this.state.opObj.select ?
                        <div>
                            <header className="clearfix">
                                <Search 
                                    onSearch={(value) => this.setKeyword(value)}
                                    enterButton
                                    style={{width: "320px", float: "left"}}
                                    placeholder="请输入角色名称信息"/>
                                {/*角色添加*/}
                                <div className="add-button" style={{float: "right"}}>
                                    <ItemAdd 
                                        opStatus={this.state.opObj.add} 
                                        setFlag={this.setFlag}
                                        toLoginPage={() => common.toLoginPage(this)}/>
                                </div>
                            </header>
                            {/*角色列表*/}
                            <div className="table-box">
                                <DataTable 
                                    opObj={this.state.opObj} 
                                    keyword={this.state.keyword}
                                    flag_add={this.state.flag_add} 
                                    toLoginPage={() => common.toLoginPage(this)}/>
                            </div>
                        </div>
                        :
                        <p>暂无查询权限</p>
                }

            </div>
        )
    }
}

export default Roles;