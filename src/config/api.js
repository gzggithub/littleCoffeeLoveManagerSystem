// 测试代理地址
// let base = ''
// 正式代理地址
let base = ''

export  default {
    /*-------------------------------公共接口-------------------------------*/
    // 获取验证码
    getVerificationCode: `${base}/mobileCode/sendVerificationCode`,
    // 获取文件上传token
    getToken: `${base}/sys/upload/getToken`,
    /*---------------------------------登录---------------------------------*/
    // 登录
    login: `${base}/user/login`,
    // 退出
    loginOut: `${base}/user/loginOut`,
    // 重置密码    
    resetPassword: `${base}/user/resetPassword`,
    /*-------------------------------分类管理-------------------------------*/
    // 列表
    getOrgTypePage: `${base}/sys/orgType/page`,    
    // 添加
    saveOrgType: `${base}/sys/orgType/save`,
    // 删除
    deleteOrgType: `${base}/sys/orgType/updateStatus`,
    // 编辑
    updateOrgType: `${base}/sys/orgType/update`,
    // 详情
    getOrgTypeDetail: `${base}/sys/orgType/getById`,    
    // 排序
    sortOrgType: `${base}/sys/orgType/updateSort`,
    /*-------------------------------广告管理-------------------------------*/
    // 列表
    advList: `${base}/sys/banner/list`,
    // 添加
    saveAdv: `${base}/sys/banner/save`,
    // 删除
    deleteAdv: `${base}/sys/banner/delete`,
    // 编辑
    updateAdv: `${base}/sys/banner/update`,
    // 详情
    getAdvDetail: `${base}/sys/banner/getDetail`,    
    // 排序
    sortAdv: `${base}/sys/banner/updateSort`,
    // 上、下架
    putAwayAdv: `${base}/sys/banner/putAway`,
    /*-------------------------------明星管理-------------------------------*/
    // 列表
    starList: `${base}/sys/excellentCourse/list`,
    // 添加
    saveStar: `${base}/sys/excellentCourse/save`,
    // 删除
    deleteStar: `${base}/sys/banner/delete`,
    // 编辑
    updateStar: `${base}/sys/excellentCourse/update`,
    // 详情
    getStarDetail: `${base}/sys/excellentCourse/detail`,
    // 复制
    NewestStar: `${base}/sys/excellentCourse/detail`,
    // 排序
    sortStar: `${base}/sys/excellentCourse/updateSort`,
    // 上、下架
    putAwayStar: `${base}/sys/excellentCourse/putAway`,
    // 所属分类列表
    starTypeList: `${base}/sys/orgType/list`,
    // 列表项
    getStarList: `${base}/sys/excellentCourse/getTeacher`,
    /*-------------------------------通告管理-------------------------------*/
    // 列表
    noticeList: `${base}/sys/excellentCourse/checkList`,
    // 添加
    addNotice: `${base}/sys/excellentCourse/save`,
    // 编辑
    updateNotice: `${base}/sys/excellentCourse/save`,
    // 详情
    noticeDetail: `${base}/sys/excellentCourse/checkDetail`,
    // 排序
    sortNotice: `${base}/sys/excellentCourse/updateSort`,
    // 结束
    noticeOver: `${base}/sys/excellentCourse/check`,
    // 往期回顾
    pastReview: `${base}/sys/excellentCourse/check`,
    /*-------------------------------报名名单-------------------------------*/
    // 列表
    signList: `${base}/sys/excellentCourse/checkList`,
    // 详情
    signDetail: `${base}/sys/excellentCourse/checkDetail`,
    // 下载
    downloadSignList: `${base}/sys/excellentCourse/getCheckOpinion`,
    /*-------------------------------明星审核-------------------------------*/
    // 列表
    checkList: `${base}/sys/excellentCourse/checkList`,
    // 详情
    checkDetail: `${base}/sys/excellentCourse/checkDetail`,
    // 审核
    check: `${base}/sys/excellentCourse/check`,
    // 驳回意见
    checkOpinion: `${base}/sys/excellentCourse/getCheckOpinion`,
    /*------------------------------小咖圈管理------------------------------*/
    // 列表
    coffeeList: `${base}/sys/comment/list`,
    // 删除
    deleteCoffee: `${base}/sys/comment/delete`,
    // 编辑
    updateCoffee: `${base}/sys/excellentCourse/update`,
    // 详情
    coffeeDetail: `${base}/sys/excellentCourse/detail`,
    // 排序
    sortCoffee: `${base}/sys/excellentCourse/updateSort`,
    // 浏览数
    viewNum: `${base}/sys/excellentCourse/updateSort`,
    /*-------------------------------评论管理-------------------------------*/
    // 列表
    commentList: `${base}/sys/comment/list`,
    // 删除
    deleteComment: `${base}/sys/comment/delete`,
    /*-------------------------------所有账号-------------------------------*/
    // 列表
    accountList: `${base}/sys/comment/list`,
    // 添加
    addAccouont: `${base}/sys/excellentCourse/save`,
    // 删除
    deleteAccount: `${base}/sys/comment/delete`,
    // 编辑
    updateAccount: `${base}/sys/excellentCourse/update`,
    // 详情
    accountDetail: `${base}/sys/excellentCourse/detail`,
    // 重置密码
    resetPwd: `${base}/sys/excellentCourse/updateSort`,
    /*-------------------------------部门管理-------------------------------*/
    // 列表
    departmentList: `${base}/sys/comment/list`,
    // 添加
    addDepartment: `${base}/sys/excellentCourse/save`,
    // 删除
    deleteDepartment: `${base}/sys/comment/delete`,
    // 编辑
    updateDepartment: `${base}/sys/excellentCourse/update`,
    // 详情
    departmentDetail: `${base}/sys/excellentCourse/detail`,
    /*-------------------------------角色管理-------------------------------*/
    // 列表
    roleList: `${base}/sys/comment/list`,
    // 添加
    addRole: `${base}/sys/excellentCourse/save`,
    // 删除
    deleteRole: `${base}/sys/comment/delete`,
    // 编辑
    updateRole: `${base}/sys/excellentCourse/update`,
    // 详情
    roleDetail: `${base}/sys/excellentCourse/detail`,
    // 成员列表
    memberList: `${base}/sys/excellentCourse/detail`,
    // 添加人员
    addMember: `${base}/sys/excellentCourse/detail`,
    // 获取权限项
    getPermissionList: `${base}/sys/excellentCourse/detail`,
    // 获取已有权限
    getPermission: `${base}/sys/excellentCourse/detail`,
    // 设置权限
    setPermission: `${base}/sys/excellentCourse/detail`,
}