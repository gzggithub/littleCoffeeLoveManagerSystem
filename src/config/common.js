
import React from 'react';
import { Select, message } from 'antd';
import * as qiniu from 'qiniu-js';
import * as UUID from 'uuid-js';
import {configUrl, getToken} from './index'
const {Option} = Select;

/* ............................................公共的常量............................................. */
export const pagination = {
    current: 1,
    pageSize: 15,
    pageSizeOptions: ["5", "10", "15", "20"],
    showQuickJumper: true,
    showSizeChanger: true
}

export const genderOptions = [
    <options key={0} value={0}>女</options>,
    <options key={1} value={1}>男</options>
]

export const genderStatus = (gender) => {
    let tempGender = '';
    if (gender === 0) {
        tempGender = "女";
    }
    if (gender === 1) {
        tempGender = "男";
    }
    return tempGender;
}

export const bannerOptions = [
    <Option key={1} value={1}>明星banner</Option>,
    <Option key={2} value={2}>通告banner</Option>
]

export const noticeOptions = [
    <Option key="" value="">全部</Option>,
    <Option key={1} value={1}>进行中</Option>,
    <Option key={2} value={2}>已结束</Option>,
]

export const noticeStatus = (status) => {// 通告状态    
    let tempStatus = "";
    if (status === 1) {
        tempStatus = "进行中";
    }
    if (status  === 2) {
        tempStatus = "已结束";
    }
    return tempStatus;
}
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
    const optionsOfArea = [{value: "0", label: "全国"}];
    let currentCityName = [];
    let currentCity = [];
    let currentAreaName = [];
    let currentArea = [];
    if (provinceList.length) {        
        provinceList.forEach((item) => {
            let childrenCity = [];
            let childrenArea = [];
            if (item.districtList) {
                item.districtList.forEach((subItem) => {
                    let subChildrenArea = [];
                    if (subItem.districtList) {
                        subItem.districtList.forEach((thirdItem) => {
                            subChildrenArea.push({value: thirdItem.adcode, label: thirdItem.name});
                            if (thirdItem.adcode === String(adcode)) {
                                console.log(888)
                                currentArea = [item.adcode, subItem.adcode, thirdItem.adcode];
                                currentAreaName = [item.name, subItem.name, thirdItem.name];
                            }
                        })
                    }
                    if (subItem.adcode === String(adcode)) {
                        console.log(777)
                        currentCity = [item.adcode, subItem.adcode];
                        currentCityName = [item.name, subItem.name];
                    }
                    childrenCity.push({value: subItem.adcode, label: subItem.name});
                    childrenArea.push({value: subItem.adcode, label: subItem.name, children: subChildrenArea});
                })
            }
            optionsOfCity.push({value: item.adcode, label: item.name, children: childrenCity});
            optionsOfArea.push({value: item.adcode, label: item.name, children: childrenArea});
        })
    }
    return { optionsOfCity, currentCity, currentCityName, optionsOfArea, currentArea, currentAreaName };
}

// 获取当前登录人对此菜单的操作权限
export const getPower = (_this, url, num) => {
    console.log(555);
    console.log(url);
    console.log(num);
    let data = {};
    let dataTabs = {}; // 具有tabs选项卡权限
    let dataSub = {}; // (多一级)
    // 菜单信息为空则直接返回登陆页
    if (!sessionStorage.menuListOne) {
        _this.toLoginPage();
        return
    }
    JSON.parse(sessionStorage.menuListOne).forEach((item) => {
        item.children.forEach((subItem) => {
            if (subItem.url === _this.props.location.pathname) {
                subItem.children.forEach((thirdItem) => {
                    data[thirdItem.url] = true;
                });
            }
            if (url) {
                console.log(url)
                subItem.children.forEach((fourthItem) => {
                    if (fourthItem.url === url) {                        
                        fourthItem.children.forEach((fifthItem) => {
                            dataTabs[fifthItem.url] = true;
                        })                        
                    }                    
                })
            }
            if (num) {
                subItem.children.forEach((thirdItem) => {
                    if (thirdItem.url === _this.props.location.pathname) {                   
                        thirdItem.children.forEach((fourthItem) => {
                            dataSub[fourthItem.url] = true;
                        });                    
                    }
                })
            }
            
        })
    });
    return {data, dataTabs, dataSub};
};

// 获取省市列表信息及当前城市地区代码
export const getMapDate = (_this, id, num) => { // id: 地图容器，num：表示省市区列表即 1:省，2:市，3:区，4:街道
    let provinceList = [];
    let cityCode = null;
    _this.setState({
        mapObj: new window.AMap.Map(id)
    }, () => {
        // 获取省区列表
        _this.state.mapObj.plugin('AMap.DistrictSearch', () => {
            var districtSearch = new window.AMap.DistrictSearch({
                level: 'country',
                subdistrict: num // 1:省，2:市，3:区，4:街道
            });
            districtSearch.search('中国', (status, result) => {
                provinceList = result.districtList[0].districtList.sort((a, b) => {return a.adcode - b.adcode});
            });
        });
        // 获取当前城市地区代码
        _this.state.mapObj.plugin('AMap.CitySearch', () => {
            var citySearch = new window.AMap.CitySearch();
            citySearch.getLocalCity((status, result) => {
                if (status === 'complete' && result.info === 'OK') {
                    cityCode = result.adcode;
                }
            })
        })
    })
    console.log(provinceList);
    console.log(cityCode);
    return {provinceList, cityCode};
};

// 小于两位时间处理
const timeDeal = (time) => {
    return time < 10 ? '0' + time : time;
}

// 倒计时
export const countdown = (startTime, endDate) => {
    let day = 0;
    let hours = 0;
    let minute = 0;
    let second = 0;    
    var nowTime = Math.floor(new Date());
    var endTime = Math.floor(new Date(endDate));
    var difference = endTime - nowTime;
    if (difference > 0) {        
        // 将毫秒差换算成天数
        day = Math.floor(difference / (24 * 60 * 60 * 1000));
        difference = difference -(day * 24 * 60 * 60 * 1000);
        // 换算成小时数
        hours = Math.floor(difference / (60 * 60 * 1000));
        difference = difference - (hours * 60 * 60 * 1000);
        // 换算成分钟数
        minute = Math.floor(difference / (60*1000));
        difference = difference - (minute * 60 * 1000) ;
        // 换算成秒数
        second = Math.floor(difference / (1000));
        difference = difference - (second * 1000);
    } else {
        clearInterval();
    }
    return {
        day: timeDeal(day),
        hours: timeDeal(hours),
        minute: timeDeal(minute),
        second: timeDeal(second)
    };
}

var uploadToken = '';

const reqwestUploadToken = (_this) => {
    getToken().then((json) => {
        if (json.data.result === 0) {
                uploadToken = json.data.data;
            } else {
                exceptHandle(_this, json.data);
            }
    }).catch((err) => errorHandle(_this, err));
    return uploadToken;
};

// 图片上传
export const picUpload = (_this, num, para) => {
    _this.setState({photoLoading: true, videoLoading: true});
    const file = para;
    const key = UUID.create().toString().replace(/-/g, "");
    const token = reqwestUploadToken(_this);
    console.log(token)
    console.log(1231231312312)
    const config = {region: qiniu.region.z0};
    const observer = {
        next (res) {console.log(res)},
        error (err) {
            console.log(err)
            message.error(err.message ? err.message : "图片提交失败");
            _this.setState({photoLoading: false, videoLoading: false})
        }, 
        complete (res) {
            console.log(res);
            message.success("图片提交成功");
            let {picList, videoList} = _this.state; // 此行不加只能添加一张
            if (num === 1) {// 1:表示单张图片
                _this.setState({                   
                    viewPic: configUrl.photoUrl + res.key || "",           
                    photoLoading: false,
                })
            } else if (num === 2) {// 2:表示多张图片
                picList.push(configUrl.photoUrl + res.key);
                _this.setState({
                    picList: picList,
                    viewPic: configUrl.photoUrl + res.key || "",           
                    photoLoading: false,
                })
            } else if (num === 3) {// 3:多条视频
                videoList.push(configUrl.photoUrl + res.key);
                _this.setState({
                    videoList: videoList,
                    videoPic: configUrl.photoUrl + res.key || "",           
                    videoLoading: false,
                })
            }
        }
    }
    const observable = qiniu.upload(file, key, token, config);
    observable.subscribe(observer); // 上传开始        
};

// 登陆信息过期或不存在时的返回登陆页操作
export const toLoginPage = (_this) => {
    sessionStorage.clear();
    _this.props.history.push('/');
};

// 异常处理
export const exceptHandle = (_this, json) => {
    if (json.code === 901) {
        message.error("请先登录");          
        _this.props.toLoginPage();// 返回登陆页
    } else if (json.code === 902) {
        message.error("登录信息已过期，请重新登录");            
        _this.props.toLoginPage();// 返回登陆页
    } else if (json.code === 1005) {
        message.error("无数据，请添加");
        _this.setState({loading: false});                     
    } else {
        message.error(json.message);
        _this.setState({loading: false});
    }
};
    
// 错误处理
export const errorHandle = (_this, err) => {
    message.error(err.message);
    _this.setState({loading: false});
};

// js实现复制到剪贴板上
export const copyToClipboard = (txt) => {
    if (window.clipboardData) {
        window.clipboardData.clearData();
        window.clipboardData.setData("Text", txt);
        alert("复制成功！");
    } else if (navigator.userAgent.indexOf("Opera") !== -1) {
        window.location = txt;
    } else if (window.netscape) {
        try {
            console.log(5777)
            window.netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        } catch (e) {
            console.log(5777)
            alert("被浏览器拒绝！\n请在浏览器地址栏输入'about:config'并回车\n然后将 'signed.applets.codebase_principal_support'设置为'true'");
        }
        var clip = window.Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(window.Components.interfaces.nsIClipboard);
        if (!clip)
        return;
        var trans = window.Components.classes['@mozilla.org/widget/transferable;1'].createInstance(window.Components.interfaces.nsITransferable);
        if (!trans)
        return;
        trans.addDataFlavor("text/unicode");
        var str = window.Components.classes["@mozilla.org/supports-string;1"].createInstance(window.Components.interfaces.nsISupportsString);
        var copytext = txt;
        str.data = copytext;
        trans.setTransferData("text/unicode", str, copytext.length * 2);
        var clipid = window.Components.interfaces.nsIClipboard;
        if (!clip)
        return false;
        clip.setData(trans, null, clipid.kGlobalClipboard);
        alert("复制成功！");
    } else { // 目前只有这个能用
        let oInput = document.createElement('input');
        oInput.value = txt;
        document.body.appendChild(oInput);
        oInput.select();
        document.execCommand("Copy");
        oInput.style.display = 'none';
        document.body.removeChild(oInput);
    }
}

// 富文本校验
export const checkRiches = (rule, value, callback) => {
    callback();
    return true;
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
    };
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
    const str = n.toString();
    return str[1] ? str : `0${str}`;
}

export function formatTime (date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();    
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();    
    const t1 = [year, month, day].map(formatNumber).join('/');
    const t2 = [hour, minute, second].map(formatNumber).join(':');
    return `${t1} ${t2}`;
}

// 去除富文本的标签只获得文本内容
export function removeTag (str) {
    let fn_result = str;
    // fn_result = fn_result.replace(/(↵)/g, "");
    fn_result = fn_result.replace(/\s*|\t|\r|\n/g, "");// 去除tab、空格、空行
    fn_result = fn_result.replace(/(&nbsp;)/g, "");
    fn_result = fn_result.replace("<html><head><title></title></head><body>", "");
    fn_result = fn_result.replace("</body></html>", "");
    console.log(fn_result.length)
    return fn_result;
};

// 菜单分级处理函数
export const dataHandle01 = (data) => {
    const dataEffective = (para) => {
        return para && para.status === false
    };
    data = data.filter(dataEffective);
    const tempResult = [];
    const result = [];
    const fnFilter01 = (para) => {
        return para.parentId === 0
    };
    let data01 = data.filter(fnFilter01);
    data01.sort((a, b) => {
        return a.orderNum - b.orderNum
    });
    data01.forEach((item) => {
        const temp = {
            id: item.id,
            name: item.name,
            url: item.url,
        };
        tempResult.push(temp)
    });
    tempResult.forEach((item) => {
        const fnFilter02 = (para) => {
            return para.parentId === item.id
        };
        let data02 = data.filter(fnFilter02);
        data02.sort((a, b) => {
            return a.orderNum - b.orderNum
        });
        if (data02.length) {
            item.children = [];
            data02.forEach((subItem) => {
                const fnFilter03 = (para) => {
                    return para.parentId === subItem.id
                };
                let data03 = data.filter(fnFilter03);
                const temp = {
                    id: subItem.id,
                    name: subItem.name,
                    url: subItem.url,
                    children: data03
                };
                item.children.push(temp)
            });
            result.push(item)
        }
    });
    return result
};

// 菜单分级处理函数 (多了一级)
export const dataHandle = (data) => {
    console.log(88888888);
    const dataEffective = (para) => {
        return para && para.status === false
    };
    data = data.filter(dataEffective);        
    const tempResult = [];
    const result = [];
    const fnFilter01 = (para) => {
        return para.parentId === 0
    };
    let data01 = data.filter(fnFilter01);
    // data01.sort((a, b) => {
    //     return a.orderNum - b.orderNum
    // });
    data01.forEach((item) => {
        const temp = {
            id: item.id,
            name: item.name,
            url: item.url,
            orderNum: item.orderNum
        };
        tempResult.push(temp)
    });
    tempResult.forEach((item) => {
        const fnFilter02 = (para) => {
            return para.parentId === item.id
        };
        let data02 = data.filter(fnFilter02);
        // data02.sort((a, b) => {                
        //     return b.id - a.id
        // });
        if (data02.length) {
            item.children = [];
            data02.forEach((subItem) => {
                const fnFilter03 = (para) => {
                    return para.parentId === subItem.id
                };
                let data03 = data.filter(fnFilter03);                   

                // 多了一级
                if (data03.length) {
                    subItem.children = [];
                    data03.forEach((thirdItem) => {
                        const fnFilter04 = (para) => {
                            return para.parentId === thirdItem.id
                        };
                        let data04 = data.filter(fnFilter04);
                        const temp = {
                            id: thirdItem.id,
                            name: thirdItem.name,
                            url: thirdItem.url,
                            children: data04
                        };
                        subItem.children.push(temp)
                    })
                    item.children.push(subItem)
                } else {
                    const temp = {
                        id: subItem.id,
                        name: subItem.name,
                        url: subItem.url,
                        children: data03
                    };
                    item.children.push(temp)
                }
            });
            result.push(item)
        }
    });
    return result
};