// 第一种方式
export const config = {
    // 正式服务器图片地址
    // photoUrl: 'https://image.taoerxue.com/'
    // 测试服务器图片地址
    photoUrl: 'http://image.taoerxue.cn/'
}

// 第二种方式
global.config = {
    // 正式服务器图片地址
    // photoUrl: 'https://image.taoerxue.com/'
    // 测试服务器图片地址
    photoUrl: 'http://image.taoerxue.cn/'
}

/* 公共的方法................................................................. */
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
export const dateHandle02 = (para) => {
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

export const formatTime = (date) => {
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
export const removeTAG = (str) => {
    let fn_result = str;
    fn_result = fn_result.replace(/(↵)/g, "");
    fn_result = fn_result.replace(/(&nbsp;)/g, "");
    fn_result = fn_result.replace("<html><head><title></title></head><body>", "");
    fn_result = fn_result.replace("</body></html>", "");
    return fn_result;
};

export const expectHandle = (code, message) => {
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

export default {
    timeHandle,
    dateHandle02,
    formatNumber,
    formatTime,
    removeTAG
}