import React from 'react';
import { Select, Modal, Radio, Icon, message } from 'antd';
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
};

export const genderOptions = [
    // <Option key="" value="">{"全部"}</Option>,
    <Option key={0} value={0}>女</Option>,
    <Option key={1} value={1}>男</Option>
];

export const genderStatus = (gender) => {// 性别 女：0，男： 1
    let tempGender = '';
    if (gender === 0) {
        tempGender = "女";
    } else if (gender === 1) {
        tempGender = "男";
    }
    return tempGender;
};

export const putAwayStatus = (status) => {// 明星状态    
    let tempStatus = "";
    if (status === 2) {
        tempStatus = "上架";
    } else if (status  === 3) {
        tempStatus = "下架";
    }
    return tempStatus;
};

export const banStatus = (status) => {
    let tempStatus = "";
    if (status === 0) {
        tempStatus = "禁用"
    } else if (status === 1) {
        tempStatus = "启用"
    }
    return tempStatus;
}

export const bannerOptions = [
    // <Option key="" value="">全部banner位置</Option>,
    <Option key={1} value={1}>明星banner</Option>,
    <Option key={2} value={2}>通告banner</Option>
];

export const bannerStatus = (type) => {
    let tempTypeName = "";                    
    if (type === 1) {
        tempTypeName = "明星banner"
    } else if (type === 2) {
        tempTypeName = "通告banner"
    }
    return tempTypeName;
}

export const noticeOptions = [
    <Option key="" value="">全部</Option>,
    <Option key={1} value={1}>进行中</Option>,
    <Option key={2} value={2}>已结束</Option>,
];

export const noticeStatus = (status) => {// 通告状态    
    let tempStatus = "";
    if (status === 1) {
        tempStatus = "进行中";
    } else if (status  === 2) {
        tempStatus = "已结束";
    }
    return tempStatus;
};

export const childrenOptions = [
    <Option key={0} value={0}>妈妈</Option>,
    <Option key={1} value={1}>爸爸</Option>,
    <Option key={2} value={2}>爷爷</Option>,
    <Option key={3} value={3}>奶奶</Option>,
    <Option key={4} value={4}>外公</Option>,
    <Option key={5} value={5}>外婆</Option>,
    <Option key={6} value={6}>其他</Option>,
];

export const checkOptions = [
    <Radio.Button key={3} value={3} style={{marginRight: "20px", borderRadius: "4px"}}>驳回</Radio.Button>,
    <Radio.Button key={4} value={4} style={{marginRight: "20px", borderRadius: "4px"}}>通过</Radio.Button>,
    <Radio.Button key={5} value={5} style={{marginRight: "20px", borderRadius: "4px"}}>不通过</Radio.Button>
];

export const checkStatus = (checkStatus) => {
    let tempStatus = '';
    if (checkStatus === 1) {
        tempStatus = "未审核";
    } else if (checkStatus === 2) {
        tempStatus = "需重审";
    } else if (checkStatus === 3) {
        tempStatus = "已驳回";
    } else if (checkStatus === 4) {
        tempStatus = "通过";
    } else if (checkStatus === 5) {
        tempStatus = '不通过'
    }
    return tempStatus;
};

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
    const optionsOfCity = [{value: "0", label: "全国"}];//省，市选项生成
    const optionsOfArea = [{value: "0", label: "全国"}];//省，市，区选项生成
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
                                currentArea = [item.adcode, subItem.adcode, thirdItem.adcode];
                                currentAreaName = [item.name, subItem.name, thirdItem.name];
                            }
                        })
                    }
                    if (subItem.adcode === String(adcode)) {
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
};

// 获取当前登录人对此菜单的操作权限
export const getPower = (_this, url, num) => {
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
                _this.setState({
                    provinceList: result.districtList[0].districtList.sort((a, b) => {return a.adcode - b.adcode})
                });
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
    return {provinceList, cityCode};
};

// 小于两位时间处理
const timeDeal = (time) => {
    return time < 10 ? '0' + time : time;
};

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
};

// 复制 倒计时 提示模态框
const countDownModalTip = (content) => {
    let secondsToGo = 3;
    const modal = Modal.success({
        title: `温馨提示`,
        content: `你还没添加${content}，请先添加${content}，正在返回，请稍后 ${secondsToGo} s.`,
    });
    const timer = setInterval(() => {
        secondsToGo -= 1;
        modal.update({
           content: `你还没添加${content}，请先添加${content}，正在返回，请稍后 ${secondsToGo} s.`,
        });
    }, 1000);
    setTimeout(() => {
        clearInterval(timer);
        modal.destroy();
    }, secondsToGo * 1000);
};

export const beforeUpload = (file, _this, num) => {
    if (num === 2) {
        reqwestUploadToken(_this);
    } else {
        const isIMG = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isIMG) {
            message.error('文件类型错误');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('文件不能大于2M');
        }         
        reqwestUploadToken(_this);
        return isIMG && isLt2M;
    }    
};

export const uploadButton = (num, loading) => {
    if (num === 1) {
        return (
            <div>
                <Icon type={loading ? 'loading' : 'plus'}/>
                <div className="ant-upload-text" style={{display: loading ? "none" : "block"}}>选择图片</div>
            </div>
        );
    } else if (num === 2) {
        return (
            <div>
                <Icon style={{fontSize: "50px"}} type={loading ? 'loading' : 'video-camera'}/>
                <div className="ant-upload-text" style={{display: loading ? "none" : "block"}}>添加视频</div>
            </div>
        );
    }    
}

// 请求上传凭证token，需要后端提供接口
export const reqwestUploadToken = (_this) => {
    getToken().then((json) => {
        if (json.data.result === 0) {
            _this.setState({
                uploadToken: json.data.data,
            });
        } else {
            exceptHandle(_this, json.data);
        }
    }).catch((err) => errorHandle(_this, err));
};

// 图片上传
export const picUpload = (_this, num, para, uploadToken) => {
    let videoSize = 0;
    if (num === 1) {
        _this.setState({photoLoading: true});
    } else if (num === 2) {
        _this.setState({photoLoading02: true});
    } else if (num === 3) {
        _this.setState({photoLoading: true});
    } else if (num === 4) {
        _this.setState({videoLoading: true});
    } else if (num === 5) {
        videoSize = (para.size/1024/1024).toFixed(2);
        _this.setState({videoLoading: true});
    }   
    const file = para;
    const key = UUID.create().toString().replace(/-/g, "");
    const token = uploadToken;
    const config01 = {region: qiniu.region.z0};
    const observer = {
        next (res) {console.log(res)},
        error (err) {
            console.log(err)
            if (num === 1 || num ===2 || num === 3) {
                message.error(err.message ? err.message : "图片提交失败");
                _this.setState({photoLoading: false, photoLoading02: false})
            } else {
                message.error(err.message ? err.message : "视频提交失败");
                _this.setState({videoLoading: false})
            }
        }, 
        complete (res) {
            console.log(res);
            if (num === 4 || num === 5) {
                message.success("视频提交成功");
            } else {
                message.success("图片提交成功");
            }             
            let {picList, videoList} = _this.state; // 此行不加只能添加一张
            if (num === 1) {// 1:表示单张图片
                _this.setState({                   
                    viewPic: configUrl.photoUrl + res.key || "",           
                    photoLoading: false,
                })
            } else if (num === 2) {// 2:表示多张图片（数组元素是string）
                picList.push(configUrl.photoUrl + res.key);
                _this.setState({
                    picList: picList,
                    viewPic02: configUrl.photoUrl + res.key || "",           
                    photoLoading02: false,
                });
            } else if (num === 3) {// 3:表示多张图片（数组元素是object）
                 picList.push({resource: configUrl.photoUrl + res.key, type: 0});
                _this.setState({
                    picList: picList,
                    viewPic: configUrl.photoUrl + res.key || "",           
                    photoLoading: false,
                });
            } else if (num === 4) {// 4:多条视频（数组元素是string）
                videoList.push(configUrl.photoUrl + res.key);
                _this.setState({
                    videoList: videoList,
                    videoPic: configUrl.photoUrl + res.key || "",           
                    videoLoading: false,
                });
            } else if (num === 5) {// 4:多条视频（数组元素是object))
                let videoE = document.createElement("video"); // 获取时长
                videoE.src = configUrl.photoUrl + res.key;
                setTimeout(()=> {
                    videoList.unshift({ 
                        sort: 0,
                        name: '',                    
                        resource: configUrl.photoUrl + res.key,
                        duration: videoE.duration,
                        videoSize: videoSize,
                        readOnly: true,
                    });
                    _this.setState({
                        videoList: videoList,                       
                        viewVideo: "",
                        videoLoading: false,
                    });
                }, 1500);
                
            }
        }
    }
    const observable = qiniu.upload(file, key, token, config01);
    observable.subscribe(observer); // 上传开始
};

// 删除图片和视频
export const deleteFileList = (_this, num, index) => {
    let {picList, videoList} = _this.state;
    if (num === 2) { // 2:表示是图片
        picList.splice(index, 1);
        _this.setState({picList: picList});
    } else if (num === 3) { // 3:表示是视频
        videoList.splice(index, 1);
        _this.setState({videoList: videoList});
    }
};

// 登陆信息过期或不存在时的返回登陆页操作
export const toLoginPage = (_this) => {
    sessionStorage.clear();
    _this.props.history.push('/');
};

// 异常处理
export const exceptHandle = (_this, json, content) => {
    if (json.code === 603) {
        message.error("账号不存在")
    } else if (json.code === 605) {
        message.error("您的名下有多家机构，需填写用户名才能重置密码。’");
    } else if (json.code === 703) {
        message.error("短信验证码错误或已过期");
    } else if (json.code === 704) {
        message.error("图片验证码为空");
    } else if (json.code === 705) {
        message.error("验证码错误1");
    } else if (json.code === 802) {
        message.error("密码错误");
    } else if (json.code === 803) {
        message.error("密码格式错误");    
    } else if (json.code === 901) {
        message.error("请先登录");          
        _this.props.toLoginPage();// 返回登陆页
    } else if (json.code === 902) {
        message.error("登录信息已过期，请重新登录");            
        _this.props.toLoginPage();// 返回登陆页
    } else if (json.code === 903) {
        message.error("请先配置用户角色或权限")
    } else if (json.code === 1004) {
        message.error("用户不存在");
    } else if (json.code === 1005) {
        message.error("无数据，请添加");
    } else if (json.code === 1205) {// 判断没有添加数据时，提示信息                    
        countDownModalTip(content);                  
    } else {
        message.error(json.message);        
    }
    _this.setState({loading: false});
};
    
// 错误处理
export const errorHandle = (_this, err) => {
    message.error(err.message);
    _this.setState({loading: false});
};

// js实现复制到剪贴板上
export const copyToClipboard = (_this, txt) => {
    if (window.clipboardData) {
        window.clipboardData.clearData();
        window.clipboardData.setData("Text", txt);
        alert("复制成功！");
    } else if (navigator.userAgent.indexOf("Opera") !== -1) {
        window.location = txt;
    } else if (window.netscape) {
        try {
            window.netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        } catch (e) {
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
        message.success("链接地址已经复制成功，请使用 Ctrl+V 粘贴");
        _this.handleCancel();
    }
}

// 富文本校验
export const checkRiches = (rule, value, callback) => {
    callback();
    return true;
}

// table 请求数据不成功或list为空时处理
export const handleTableNoDataResponse = (_this, data) => {
    if (data.list.length === 0 && _this.state.pagination.current !== 1) {
        _this.setState({
            pagination: {
                current: 1,
                pageSize: _this.state.pagination.pageSize
            }
        }, () => {
            _this.getData();
        });
        return
    }
}

// 页码变化处理  (暂时不能用，传参问题)
export const handleTableChange = (_this, pagination, filters) => {
    const pager = {..._this.state.pagination};
    pager.current = pagination.current;
    localStorage.roleSize = pagination.pageSize;
    pager.pageSize = Number(localStorage.roleSize);
    _this.setState({
        // type: filters.type ? filters.type[0] : null,
        // status: filters.status ? filters.status[0] : null,    
        pagination: pager
    }, () => {
        _this.getData();
    });
};

// 禁用开始日期之前的日期
export const disabledStartDate = (_this, startValue) => {
    const endValue = _this.state.endValue;
    if (!startValue || !endValue) {
        return false;
    }
    return (startValue.valueOf() + 60*60*24*1000) > endValue.valueOf();
};

// 禁用结束日期之后的日期
export const disabledEndDate = (_this, endValue) => {
    const startValue = _this.state.startValue;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= (startValue.valueOf() + 60*60*24*1000);
};

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