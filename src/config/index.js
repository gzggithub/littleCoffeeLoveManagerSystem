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
export const getOrgTypePage = params => {
    setAuthorization();
    return axios.get(api.getOrgTypePage, {params: params});
}

// 添加
export const saveOrgType = data => {
    setAuthorization();
    return axios.post(api.saveOrgType, createPostParams(data));
}

// 删除
export const deleteOrgType = data => {
    setAuthorization();
    return axios.post(api.deleteOrgType, createPostParams(data));
}
// 详情
export const getOrgTypeDetail = params => {
    setAuthorization();
    return axios.get(api.getOrgTypeDetail, {params: params});
}

// 编辑
export const updateOrgType = data => {
    setAuthorization();
    return axios.post(api.updateOrgType, createPostParams(data));
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

// 详情
export const getAdvDetail = params => {
    setAuthorization();
    return axios.get(api.getAdvDetail, {params: params});
}

// 编辑
export const updateAdv = data => {
    setAuthorization();
    return axios.post(api.updateAdv, createPostParams(data));
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
    return axios.post(api.saveStar, createPostParams(data));
}

// 删除
// export const deleteStar = params => {
//     setAuthorization();
//     return axios.delete(api.deleteStar, {params: params});
// }

// 详情
export const getStarDetail = params => {
    setAuthorization();
    return axios.get(api.getStarDetail, {params: params});
}

// 编辑
export const updateStar = data => {
    setAuthorization();
    return axios.post(api.updateStar, createPostParams(data));
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