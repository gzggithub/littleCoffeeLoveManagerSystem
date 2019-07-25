import axios from 'axios';
import api from './api';
var qs = require('qs');

/*设置请求头的类型*/
// axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
/*设置请求头的token 开始加载一次(解决办法是写一个方法。调接口之前调下改方法)*/
// axios.defaults.headers.common['Authorization'] = getAuthorization();

export const configUrl = {   
    // photoUrl: 'https://image.taoerxue.com/' // 正式服务器图片地址
    photoUrl: 'http://image.taoerxue.cn/'      // 测试服务器图片地址
}

/*创建Post x-www-form-urlencode请求参数, 参数转字符串*/
function createPostParams(obj) {
    return qs.stringify(obj);
}

// 设置请求头的 Authorization
const setAuthorization =  () => {
    return axios.defaults.headers.common['Authorization'] = sessionStorage.token;    
}

/*get*/
export const getOrgDetailInfo = params => {
    return axios.get(api.getOrgDetailInfo, {params: params});
}

/*post*/ 
export const getCourseDetailInfo = data => {
    return axios.post(api.getCourseDetailInfo, qs.stringify(data));
}

/*delete*/
//  删除-如果服务端将参数当做url 参数 接收，则格式为：{params: param}，这样发送的url将变为http:www.XXX.com?a=..&b=..
export const getNewsDetail = params => {
    return axios.delete(api.getNewsDetail, {params: params});
}

/*-------------------------------公共接口-------------------------------*/
// 获取验证码
export const getVerificationCode = data => {
    setAuthorization();
    return axios.post(api.getVerificationCode, createPostParams(data));
}
// 图片上传token
export const getToken = params => {
    setAuthorization();
    return axios.get(api.getToken, {params: params});
}

/*---------------------------------登录---------------------------------*/
// 登录
export const login = data => {
    return axios.post(api.login, createPostParams(data));
}

// 退出登录
export const loginOut = data => {
    setAuthorization();
    return axios.post(api.loginOut, createPostParams(data));
}

// 重置密码
export const resetPassword = data => {
    setAuthorization();
    return axios.post(api.resetPassword, createPostParams(data));
}

/*-------------------------------分类管理-------------------------------*/
// 列表
export const getOrgTypeList = params => {
    setAuthorization();
    return axios.get(api.getOrgTypeList, {params: params});
}

// 添加
export const addOrgType = data => {
    setAuthorization();
    return axios.post(api.addOrgType, createPostParams(data));
}

// 删除
export const deleteOrgType = params => {
    setAuthorization();
    return axios.delete(api.deleteOrgType, {params: params});
}

// 编辑
export const updateOrgType = data => {
    setAuthorization();
    return axios.post(api.updateOrgType, createPostParams(data));
}

// 详情
export const getOrgTypeDetail = params => {
    setAuthorization();
    return axios.get(api.getOrgTypeDetail, {params: params});
}

// 排序
export const sortOrgType = data => {
    setAuthorization();
    return axios.post(api.sortOrgType, createPostParams(data));
}

/*-------------------------------广告管理-------------------------------*/
// 列表
export const advList = params => {
    setAuthorization();
    return axios.get(api.advList, {params: params});
}

// 添加
export const saveAdv = data => {
    setAuthorization();
    return axios.post(api.saveAdv, createPostParams(data));
}

// 删除
export const deleteAdv = params => {
    setAuthorization();
    return axios.delete(api.deleteAdv, {params: params});
}

// 编辑
export const updateAdv = data => {
    setAuthorization();
    return axios.post(api.updateAdv, createPostParams(data));
}

// 详情
export const getAdvDetail = params => {
    setAuthorization();
    return axios.get(api.getAdvDetail, {params: params});
}

// 排序
export const sortAdv = data => {
    setAuthorization();
    return axios.post(api.sortAdv, createPostParams(data));
}

// 上、下架
export const putAwayAdv = data => {
    setAuthorization();
    return axios.post(api.putAwayAdv, createPostParams(data));
}

/*-------------------------------明星管理-------------------------------*/
// 列表
export const starList = params => {
    setAuthorization();
    return axios.get(api.starList, {params: params});
}

// 添加
export const saveStar = data => {
    setAuthorization();
    axios.defaults.headers['Content-Type'] = 'application/json';
    return axios.post(api.saveStar, data);
}

// 编辑
export const updateStar = data => {
    setAuthorization();
    return axios.post(api.updateStar, data);
}

// 详情
export const starDetail = params => {
    setAuthorization();
    return axios.get(api.starDetail, {params: params});
}
// 复制
export const NewestStar = params => {
    setAuthorization();
    return axios.get(api.NewestStar, {params: params});
}

// 排序
export const sortStar = data => {
    setAuthorization();
    return axios.post(api.sortStar, createPostParams(data));
}

// 上、下架
export const putAwayStar = data => {
    setAuthorization();
    return axios.post(api.putAwayStar, createPostParams(data));
}

// 所属分类
export const starTypeList = params => {
    setAuthorization();
    return axios.get(api.starTypeList, {params: params});
}

// 列表项
export const childrenList = params => {
    setAuthorization();
    return axios.get(api.childrenList, {params: params});
}

/*-------------------------------通告管理-------------------------------*/
// 列表
export const noticeList = params => {
    setAuthorization();
    return axios.get(api.noticeList, {params: params});
}

// 添加
export const addNotice = data => {
    setAuthorization();
    return axios.post(api.addNotice, createPostParams(data));
}

// 编辑
export const updateNotice = data => {
    setAuthorization();
    return axios.post(api.updateNotice, createPostParams(data));
}

// 详情
export const noticeDetail = params => {
    setAuthorization();
    return axios.get(api.noticeDetail, {params: params});
}

// 复制
export const NewestNotice = params => {
    setAuthorization();
    return axios.get(api.NewestNotice, {params: params});
}

// 结束
export const noticeOver = data => {
    setAuthorization();
    return axios.post(api.noticeOver, createPostParams(data));
}

// 往期回顾
export const pastReview = params => {
    setAuthorization();
    return axios.get(api.pastReview, {params: params});
}

/*-------------------------------报名名单-------------------------------*/
// 列表
export const signList = params => {
    setAuthorization();
    return axios.get(api.signList, {params: params});
}

// 详情
export const signDetail = params => {
    setAuthorization();
    return axios.get(api.signDetail, {params: params});
}

// 下载
export const downloadSignList = data => {
    setAuthorization();
    return axios.post(api.downloadSignList, createPostParams(data));
}

/*-------------------------------明星审核-------------------------------*/
// 列表
export const checkList = params => {
    setAuthorization();
    return axios.get(api.checkList, {params: params});
}

// 详情
export const checkDetail = params => {
    setAuthorization();
    return axios.get(api.checkDetail, {params: params});
}

// 审核
export const check = data => {
    setAuthorization();
    return axios.post(api.check, createPostParams(data));
}

// 驳回意见
export const checkOpinion = params => {
    setAuthorization();
    return axios.get(api.checkOpinion, {params: params});
}

/*------------------------------小咖圈管理-------------------------------*/
// 列表
export const coffeeList = params => {
    setAuthorization();
    return axios.get(api.coffeeList, {params: params});
}

// 删除
export const deleteCoffee = params => {
    setAuthorization();
    return axios.delete(api.deleteCoffee, {params: params});
}

// 编辑
export const updateCoffee = data => {
    setAuthorization();
    return axios.post(api.updateCoffee, data);
}

// 详情
export const coffeeDetail = params => {
    setAuthorization();
    return axios.get(api.coffeeDetail, {params: params});
}

// 排序
export const sortCoffee = data => {
    setAuthorization();
    return axios.post(api.sortCoffee, createPostParams(data));
}
// 浏览数
export const viewNum = data => {
    setAuthorization();
    return axios.post(api.viewNum, createPostParams(data));
}

/*-------------------------------评论管理-------------------------------*/
// 列表
export const commentList = params => {
    setAuthorization();
    return axios.get(api.commentList, {params: params});
}

// 删除
export const deleteComment = params => {
    setAuthorization();
    return axios.delete(api.deleteComment, {params: params});
}

/*-------------------------------所有账号-------------------------------*/
// 列表
export const accountList = params => {
    setAuthorization();
    return axios.get(api.accountList, {params: params});
}

// 添加
export const addAccount = data => {
    setAuthorization();
    return axios.post(api.addAccount, createPostParams(data));
}

// 删除
export const deleteAccount = params => {
    setAuthorization();
    return axios.delete(api.deleteAccount, {params: params});
}

// 编辑
export const updateAccount = data => {
    setAuthorization();
    return axios.post(api.updateAccount, createPostParams(data));
}

// 详情
export const accountDetail = params => {
    setAuthorization();
    return axios.get(api.accountDetail, {params: params});
}
// 禁用、启用
export const ban = data => {
    setAuthorization();
    return axios.post(api.ban, createPostParams(data));
}

// 重置密码
export const resetPwd = data => {
    setAuthorization();
    return axios.post(api.resetPwd, createPostParams(data));
}

// 机构列表
export const orgList = params => {
    setAuthorization();
    return axios.get(api.orgList, {params: params});
}

/*-------------------------------部门管理-------------------------------*/
// 列表
export const departmentList = params => {
    setAuthorization();
    return axios.get(api.departmentList, {params: params});
}

// 添加
export const addDepartment = data => {
    setAuthorization();
    return axios.post(api.addDepartment, createPostParams(data));
}

// 删除
export const deleteDepartment = params => {
    setAuthorization();
    return axios.delete(api.deleteDepartment, {params: params});
}

// 编辑
export const updateDepartment = data => {
    setAuthorization();
    return axios.post(api.updateDepartment, createPostParams(data));
}

// 详情
export const departmentDetail = params => {
    setAuthorization();
    return axios.get(api.departmentDetail, {params: params});
}

export const departmentUserList = params => {
    setAuthorization();
    return axios.get(api.departmentUserList, {params: params});
}

/*-------------------------------角色管理-------------------------------*/
// 列表
export const roleList = params => {
    setAuthorization();
    return axios.get(api.roleList, {params: params});
}

// 添加
export const addRole = data => {
    setAuthorization();
    return axios.post(api.addRole, createPostParams(data));
}

// 删除
export const deleteRole = params => {
    setAuthorization();
    return axios.delete(api.deleteRole, {params: params});
}

// 编辑
export const updateRole = data => {
    setAuthorization();
    return axios.post(api.updateRole, createPostParams(data));
}

// 详情
export const roleDetail = params => {
    setAuthorization();
    return axios.get(api.roleDetail, {params: params});
}

// 成员列表
export const memberList = params => {
    setAuthorization();
    return axios.get(api.memberList, {params: params});
}
// 添加人员可分配的角色列表
export const roleUserList = params => {
    setAuthorization();
    return axios.get(api.roleUserList, {params: params});
}

// 添加人员
export const addMember = data => {
    setAuthorization();
    return axios.post(api.addMember, data);
}

// 获取权限项
export const getPermissionList = params => {
    setAuthorization();
    return axios.get(api.getPermissionList, {params: params});
}

// 获取已有权限项
export const getPermission = params => {
    setAuthorization();
    return axios.get(api.getPermission, {params: params});
}

// 设置权限
export const setPermission = data => {
    setAuthorization();
    return axios.post(api.setPermission, data);
}

/*-------------------------------公共方法-------------------------------*/
// 去除富文本的标签只获得文本内容
export const removeTag = (str) => {
    let fn_result = str;
    fn_result = fn_result.replace(/(↵)/g, "");
    fn_result = fn_result.replace(/(&nbsp;)/g, "");
    fn_result = fn_result.replace("<html><head><title></title></head><body>", "");
    fn_result = fn_result.replace("</body></html>", "");
    return fn_result;
};