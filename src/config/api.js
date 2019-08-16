// 测试代理地址
// let base = 'https://www.taoerxue.com.cn/childStarManager'
// 正式代理地址
let base = '/childStarManager'

export  default {
    /*-------------------------------公共接口-------------------------------*/
    // 获取短信验证码
    getVerificationCode: `${base}/mobileCode/sendVerificationCode`,
    // 获取图片验证码
    getImgCode: `${base}/code`,
    // 获取文件上传token
    getToken: `${base}/cs/upload/getToken`,
    /*-------------------------------登录接口-------------------------------*/
    // 登录
    login: `${base}/user/login`,
    // 退出
    loginOut: `${base}/cs/user/loginOut`,
    // 重置密码    
    resetPassword: `${base}/cs/user/resetPassword`,
    /*-------------------------------分类管理-------------------------------*/
    // 列表
    typeList: `${base}/cs/annunciateType/list`,    
    // 添加
    addType: `${base}/cs/annunciateType/save`,
    // 删除
    deleteType: `${base}/cs/annunciateType/delete`,
    // 编辑
    updateType: `${base}/cs/annunciateType/update`,
    // 详情
    typeDetail: `${base}/cs/annunciateType/getById`,    
    // 排序
    sortType: `${base}/cs/annunciateType/updateSort`,
    /*-------------------------------广告管理-------------------------------*/
    // 列表
    advList: `${base}/cs/banner/list`,
    // 添加
    saveAdv: `${base}/cs/banner/save`,
    // 删除
    deleteAdv: `${base}/cs/banner/delete`,
    // 编辑
    updateAdv: `${base}/cs/banner/update`,
    // 详情
    getAdvDetail: `${base}/cs/banner/getById`,    
    // 排序
    sortAdv: `${base}/cs/banner/updateSort`,
    // 上、下架
    putAwayAdv: `${base}/cs/banner/putAway`,
    /*-------------------------------明星管理-------------------------------*/
    // 列表
    starList: `${base}/cs/star/list`,
    // 添加
    saveStar: `${base}/cs/star/save`,
    // 删除
    // deleteStar: `${base}/cs/star/delete`,
    // 编辑
    updateStar: `${base}/cs/star/update`,
    // 详情
    starDetail: `${base}/cs/star/getById`,
    // 复制
    NewestStar: `${base}/cs/star/getNewest`,
    // 排序
    sortStar: `${base}/cs/star/updateSort`,
    // 上、下架
    putAwayStar: `${base}/cs/star/putAway`,
    // 所属分类列表
    starTypeList: `${base}/cs/star/list`,
    // 孩子列表
    childrenList: `${base}/cs/star/ordinaryChildList`,
    /*-------------------------------通告管理-------------------------------*/
    // 列表
    noticeList: `${base}/cs/annunciate/list`,
    // 添加
    addNotice: `${base}/cs/annunciate/save`,
    // 编辑
    updateNotice: `${base}/cs/annunciate/update`,
    // 详情
    noticeDetail: `${base}/cs/annunciate/getById`,
    // 复制
    NewestNotice: `${base}/cs/annunciate/getNewest`,   
    // 结束
    noticeOver: `${base}/cs/annunciate/finish`,
    // 往期回顾详情
    pastReviewDetail: `${base}/cs/annunciateSummarize/getByAnnunciateId`,
    // 往期回顾添加或编辑
    saveOrUpdatePastReview: `${base}/cs/annunciateSummarize/saveOrUpdate`,
    /*-------------------------------报名名单-------------------------------*/
    // 列表
    signList: `${base}/cs/annunciateApply/list`,
    // 详情
    signDetail: `${base}/cs/annunciateApply/getById`,
    // 下载
    downloadSignList: `${base}/sys/excellentCourse/getCheckOpinion`,
    /*-------------------------------明星审核-------------------------------*/
    // 列表
    checkList: `${base}/cs/starCache/list`,
    // 详情
    checkDetail: `${base}/cs/starCache/getById`,
    // 审核
    check: `${base}/cs/starCache/check`,
    // 驳回意见
    checkOpinion: `${base}/sys/excellentCourse/getCheckOpinion`,
    /*------------------------------小咖圈管理------------------------------*/
    // 列表
    coffeeList: `${base}/cs/social/list`,
    // 删除
    deleteCoffee: `${base}/cs/social/delete`,
    // 编辑
    updateCoffee: `${base}/cs/social/update`,
    // 详情
    coffeeDetail: `${base}/cs/social/getById`,
    // 排序
    sortCoffee: `${base}/cs/social/updateSort`,
    // 浏览数
    viewNum: `${base}/cs/social/updateVisitorNum`,
    /*-------------------------------评论管理-------------------------------*/
    // 列表
    commentList: `${base}/cs/socialComment/list`,
    // 删除
    deleteComment: `${base}/cs/socialComment/delete`,
    /*-------------------------------所有账号-------------------------------*/
    // 列表
    accountList: `${base}/cs/user/list`,
    // 添加
    addAccount: `${base}/cs/user/save`,
    // 删除
    deleteAccount: `${base}/cs/user/delete`,
    // 编辑
    updateAccount: `${base}/cs/user/update`,
    // 详情
    accountDetail: `${base}/cs/user/getById`,
    // 禁用和启用
    ban: `${base}/cs/user/ban`,
    // 重置密码
    resetPwd: `${base}/cs/user/resetPassword`,
    /*-------------------------------部门管理-------------------------------*/
    // 列表
    departmentList: `${base}/cs/department/list`,
    // 添加
    addDepartment: `${base}/cs/department/save`,
    // 删除
    deleteDepartment: `${base}/cs/department/delete`,
    // 编辑
    updateDepartment: `${base}/cs/department/update`,
    // 详情
    departmentDetail: `${base}/cs/department/getById`,
    // 成员列表
    departmentUserList: `${base}/cs/department/userList`,
    // 下属人员
    subordinateMember: `${base}/cs/department/getDepartmentUser`,
    /*-------------------------------角色管理-------------------------------*/
    // 列表
    roleList: `${base}/cs/role/getRolePage`,
    // 添加
    addRole: `${base}/cs/role/save`,
    // 删除
    deleteRole: `${base}/cs/role/delete`,
    // 编辑
    updateRole: `${base}/cs/role/update`,
    // 详情
    roleDetail: `${base}/cs/role/getById`,
    // 成员列表
    memberList: `${base}/cs/role/getUserByRole`,
    // 添加人员可分配的人员列表
    roleUserList: `${base}/cs/role/getRoleListByUserId`,    
    // 添加人员
    addMember: `${base}/cs/role/bindUserRole`,    
    // 获取权限项    
    getPermissionList: `${base}/cs/user/getMenuListByUserId`,
    // 获取已有权限
    getPermission: `${base}/cs/role/getInfoByRoleId`,
    // 设置权限
    setPermission: `${base}/cs/role/updateJurisdiction`,
}