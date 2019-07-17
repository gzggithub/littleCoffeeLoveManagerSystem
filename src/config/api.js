// 测试代理地址
// let base = 'https://sixsix.taoerxue.com.cn/taoerxue-app/1'
// 正式代理地址
// let base = 'https://newapi.taoerxue.cn/4'

export  default {
    /*-------------------------------公共接口-------------------------------*/
    // 获取验证码
    getVerificationCode: `/mobileCode/sendVerificationCode`,
    // 获取图片上传token
    getToken: `/sys/upload/getToken`,
    /*---------------------------------登录---------------------------------*/
    // 登录
    login: `/user/login`,
    // 退出
    loginOut: `/user/loginOut`,
    // 重置密码    
    resetPassword: `/user/resetPassword`,
    /*-------------------------------分类管理-------------------------------*/
    // 列表
    getOrgTypePage: `/sys/orgType/page`,    
    // 添加
    saveOrgType: `/sys/orgType/save`,
    // 删除
    deleteOrgType: `/sys/orgType/updateStatus`,
    // 详情
    getOrgTypeDetail: `/sys/orgType/getById`,
    // 编辑
    updateOrgType: `/sys/orgType/update`,
    // 排序
    sortOrgType: `/sys/orgType/updateSort`,
    /*-------------------------------广告管理-------------------------------*/
    // 列表
    advList: `/sys/banner/list`,
    // 添加
    saveAdv: `/sys/banner/save`,
    // 删除
    deleteAdv: `/sys/banner/delete`,
    // 详情
    getAdvDetail: `/sys/banner/getDetail`,
    // 编辑
    updateAdv: `/sys/banner/update`,
    // 排序
    sortAdv: `/sys/banner/updateSort`,
    // 上、下架
    putAwayAdv: `/sys/banner/putAway`,
    /*-------------------------------明星管理-------------------------------*/
    // 列表
    starList: `/sys/excellentCourse/list`,
    // 添加
    saveStar: `/sys/excellentCourse/save`,
    // 删除
    deleteStar: `/sys/banner/delete`,
    // 详情
    getStarDetail: `/sys/excellentCourse/detail`,
    // 编辑
    updateStar: `/sys/excellentCourse/update`,
    // 排序
    sortStar: `/sys/excellentCourse/updateSort`,
    // 上、下架
    putAwayStar: `/sys/excellentCourse/putAway`,
    // 所属分类列表
    starTypeList: `/sys/orgType/list`,
    
}