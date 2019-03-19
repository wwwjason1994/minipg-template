/**
 * 工具类通用方法
 */

/**
 * 格式化时间为年
 * @param {Number} date 时间戳
 * @param {String} format 格式化分隔符
 */
function formatDate(date, format = '-') {
    let d = new Date(date * 1);
    if (isNaN(date * 1)) {
        d = new Date(date);
    }


    let yy = d.getFullYear();
    let MM = ('00' + (d.getMonth() + 1)).slice(-2);
    let dd = ('00' + d.getDate()).slice(-2);

    return '' + yy + format + MM + format + dd;
}

function setOptions(method, url, options) {
    return Object.assign({}, {
        method,
        url
    }, options);
}

/**
 * 把微信api转换为promise对象
 * @param {String} wxApi 微信api
 * @returns {Function} 返回的函数接收微信api除success与fail之外的参数
 */
function promisifyWxAPI(wxApi) {
    return function promisify(params = {}) {
        return new Promise((resolve, reject) => {
            wx[wxApi]({
                ...params,
                success: (res) => {
                    resolve(res)
                },
                fail: (err) => {
                    reject(err)
                }
            })
        })
    }
}



/**
 *检查是否是有效url
 *
 * @param {String} url url
 * @return {Boolean} 是否有效
 */
function isValidUrl(url) {
    return /(ht|f)tp(s?):\/\/([^ \\/]*\.)+[^ \\/]*(:[0-9]+)?\/?/.test(url);
}

/**
 * 深度对比两个对象是否一致
 * @param  {Object} a 对象a
 * @param  {Object} b 对象b
 * @return {Boolean}   是否相同
 */
function equal(a, b) {
    if (a === b) return true;

    if (a && b && typeof a == 'object' && typeof b == 'object') {
        var arrA = Array.isArray(a),
            arrB = Array.isArray(b),
            i, length, key;

        if (arrA && arrB) {
            length = a.length;
            if (length != b.length) return false;
            for (i = length; i-- !== 0;)
                if (!equal(a[i], b[i])) return false;
            return true;
        }

        if (arrA != arrB) return false;

        var dateA = a instanceof Date,
            dateB = b instanceof Date;
        if (dateA != dateB) return false;
        if (dateA && dateB) return a.getTime() == b.getTime();

        var regexpA = a instanceof RegExp,
            regexpB = b instanceof RegExp;
        if (regexpA != regexpB) return false;
        if (regexpA && regexpB) return a.toString() == b.toString();

        var keys = Object.keys(a);
        length = keys.length;

        if (length !== Object.keys(b).length)
            return false;

        for (i = length; i-- !== 0;)
            if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

        for (i = length; i-- !== 0;) {
            key = keys[i];
            if (!equal(a[key], b[key])) return false;
        }

        return true;
    }

    return a !== a && b !== b;
}

// 获取当前页面路由信息工具类
class RouteTool {
    constructor() {
        this.pageObj = this.getPageObj()
    }

    getPageObj() {
        const pages = getCurrentPages() //获取已经加载的页面
        const currentPage = pages[pages.length - 1] //获取当前页面的对象
        return currentPage
    }

    getCurrentPageUrl() {
        return this.pageObj.route //当前页面url
    }

    getCurrentPageOptions() {
        return this.pageObj.options //获取当前url中所带的query
    }

    getCurrentPageQuery() {
        const options = this.getCurrentPageOptions()
        let query = ''
        Object.keys(options).map(key => {
            !query ? query += '?' : query += '&'
            query += `${key}=${options[key]}`
        })
        return query
    }

    navigate({reLaunch=false, redirect=false, url=''}) {
        const pages = getCurrentPages()

        if(reLaunch || pages.length >= 10) {
            wx.reLaunch({
                url
            })
            return
        }

        if(redirect) {
            wx.redirectTo({
                url
            })
            return
        }

        const routes = pages.map(page => '/' + page.route)
        const indexTarget = routes.indexOf(url)
        const indexCurrent = routes.indexOf('/' + this.getCurrentPageUrl())
        if(indexTarget>=0 && indexCurrent >= indexTarget) {
            wx.navigateBack({
                delta: indexCurrent - indexTarget
            })
        }else{
            wx.navigateTo({
                url
            })
        }
    }
}

/**
 * 对象转义
 * @param {Object} obj 要进行转义的对象
 */
function decodeObject(obj){
    if(Object.prototype.toString.call(obj) === '[object Object]'){
        let newObj = {};
        for(let key in obj){
            let item = obj[key];
            if(typeof item === 'string'){
                newObj[key] = decodeURIComponent(item);
            }else{
                newObj[key] = decodeObject(item);
            }
        }
        return newObj;
    }else{
        return obj;
    }
}

export {
    formatDate,
    setOptions,
    promisifyWxAPI,
    isValidUrl,
    equal,
    RouteTool,
    decodeObject
}
export default {
    formatDate,
    setOptions,
    promisifyWxAPI,
    isValidUrl,
    equal,
    RouteTool,
    decodeObject
}
