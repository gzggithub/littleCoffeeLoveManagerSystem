/* ............................................公共的方法............................................. */
// 手机号和座机号正则验证
export function checkTel (rule, value, callback) {
    console.log(value);
    if (!value) {
        callback('电话不能为空'); // 校验不通过
        return false;
    } else {
        const isPhone = /^([0-9]{3,4}-)?[0-9]{7,8}$/;
        const isPhone02 = /^\d{3,4}-\d{3,4}-\d{3,4}$/;
        const isMob = /^1[0-9]{10}$/;           
        const valuePhone = value.trim();
        if (isMob.test(valuePhone) || isPhone.test(valuePhone) || isPhone02.test(valuePhone)) {
            callback(); // 校验通过
            return true;
        } else {
            callback('请输入正确手机号或座机电话'); // 校验不通过
            return false;
        }
    }           
};

// 手机号校验
export function checkPhone (rule, value, callback) {
    if (!value) {
        callback('手机号码不能为空'); // 校验不通过
        return false;
    } else {
        const isMob = /^1[0-9]{10}$/; // 格式已经包括长度校验了
        const valuePhone = value.trim(); // 去掉空格处理
        if (isMob.test(valuePhone)) { // 正则验证
            callback(); // 校验通过
            return true;
        } else {
            callback('请输入正确手机号'); // 校验不通过
            return false;
        }
    }
};
// 密码8-16位字母与数字校验
export function checkPassword (rule, value, callback) {
    if (!value) {
        callback('密码不能为空');
        return false;
    } else {
        const isPwd = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/;
        if (isPwd.test(value)) {
            callback();
            return true;
        } else {
            callback("请输入8-16位字母与数字");
            return false;
        }
    }
};

// 根据省市区id 查找 省市区name
export const pCAName = (provinceList, adcode) => {
    const optionsOfCity = [{value: "0", label: "全国"}];
    let currentAreaName = [];
    let currentArea = [];
    if (provinceList.length) {        
        provinceList.forEach((item) => {
            let children = [];                   
            if (item.districtList) {
                item.districtList.forEach((subItem) => {
                    let subChildren = [];
                    if (subItem.districtList) {
                        subItem.districtList.forEach((thirdItem) => {
                            subChildren.push({value: thirdItem.adcode, label: thirdItem.name});
                            if (thirdItem.adcode === adcode) {
                                console.log(888)
                                currentArea = [item.adcode, subItem.adcode, thirdItem.adcode];
                                currentAreaName = [item.name, subItem.name, thirdItem.name];
                            }
                        })
                    }
                    children.push({value: subItem.adcode, label: subItem.name, children: subChildren});
                })
            }
            optionsOfCity.push({value: item.adcode, label: item.name, children: children});
        })
    }
    return { optionsOfCity, currentArea, currentAreaName };
}

// 日期处理函数
export const timeHandle = (para)  => {
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

// 时间日期处理
export function dateHandle02 (para) {
    const add0 = (m) => {
        return m < 10 ? '0' + m : m;
    }
    //时间戳是整数，否则要parseInt转换
    const time = new Date(para),
        y = time.getFullYear(),
        m = time.getMonth()+1,
        d = time.getDate(),
        h = time.getHours(),
        mm = time.getMinutes(),
        s = time.getSeconds();
    return y + '-' + add0(m) + '-' + add0(d) + ' '+ add0(h) + ':' + add0(mm) + ':' + add0(s);
};

// 时间格式处理
function formatNumber (n) {
    const str = n.toString()
    return str[1] ? str : `0${str}`
}

export function formatTime (date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    
    const t1 = [year, month, day].map(formatNumber).join('/')
    const t2 = [hour, minute, second].map(formatNumber).join(':')

  return `${t1} ${t2}`
}

// 去除富文本的标签只获得文本内容
export function removeTag (str) {
    let fn_result = str;
    fn_result = fn_result.replace(/(↵)/g, "");
    fn_result = fn_result.replace(/(&nbsp;)/g, "");
    fn_result = fn_result.replace("<html><head><title></title></head><body>", "");
    fn_result = fn_result.replace("</body></html>", "");
    return fn_result;
};

export function expectHandle (code, message) {
    if (code === 901) {
        message.error("请先登录");                        
        toLoginPage();// 返回登陆页
    } else if (code === 902) {
        message.error("登录信息已过期，请重新登录");                        
        toLoginPage();// 返回登陆页
    } else {
        message.error(message);
        this.setState({loading: false});
    }
}

function toLoginPage () {
    sessionStorage.clear();
    this.props.history.push('/')
};