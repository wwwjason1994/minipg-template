import config from './config.js';
import {
    hex_md5
} from './modules/md5.js';

/**
 * HTTP request
 * @param { Object } opts 接口请求配置项
 * @param { Object } _config 接口配置项
 * options:
 *   { String } originUrl - 完整的原始 URL
 *   详细参数列表请看 wx.request 的参数列表
 */
export function request(opts, _config) {
    let options = Object.assign({}, opts); // 为了不影响原对象，所以要构造新对象
    let { method, url, data = {}, header = {}, query = {}, ...otherOptions } = options;
    let { origin, secret } = config.request;
    let timestamp = Date.now().toString();
    const queryStr = objToQueryString(query);

    if (!method) return console.error('[request]: require method!');
    if (_config) {
        origin = _config.origin;
        secret = _config.secret;
    }

    // 对象key按字母排序
    data = objKeySort(data);

    // 验签
    let sign = '';
    const methods = ['POST', 'DELETE'];
    if (~methods.indexOf(method) && data) {
        sign = queryStr ?
            hex_md5(`${ url }?${ timestamp }?${queryStr}?${JSON.stringify(data)}?${ secret }`) :
            hex_md5(`${ url }?${ timestamp }?${JSON.stringify(data)}?${ secret }`);

        queryStr && (url += (~url.indexOf('?') ? '&' : '?') + queryStr);
    } else {
        const q = objKeySort(Object.assign({}, query, data));
        const queryParams = objToQueryString(q);

        sign = queryParams ?
            hex_md5(`${ url }?${ timestamp }?${ queryParams }?${ secret }`) :
            hex_md5(`${ url }?${ timestamp }?${ secret }`);

        if (method === 'GET') {
            const encodeQuery = objToQueryString(q, true);

            url += (~url.indexOf('?') ? '&' : '?') + encodeQuery;
        }
    }

    const fullURL = otherOptions.originUrl ? originUrl : origin + url;
    let headers = {
        'API-Sign': sign,
        'X-Timestamp': timestamp
    };
    Object.assign(headers, header);

    return new Promise(function(resolve, reject) {
        let opt = {
            method,
            url: fullURL,
            header: headers,
            success: function(res) {
                if (res.statusCode < 300) {
                    if (typeof otherOptions.success === 'function') {
                        otherOptions.success(res);
                    }
                    resolve(res);
                } else {
                    if (typeof otherOptions.fail === 'function') {
                        otherOptions.fail(res);
                    }
                    reject(res);
                }
            },
            fail: function(err) {
                // TODO: 在失败的函数可以确定一下后端返回的是不是一个错误对象
                // 非对象的话，在框架方面可以进一步的作对象封装处理，
                // 给业务返回一个约定的错误 code，由业务方决定错误提示的展示

                // 目前报错的方式统一都是报网络问题，
                // 此处可以进行优化
                console.log(typeof err, err);

                if (typeof otherOptions.fail === 'function') {
                    otherOptions.fail(err);
                }
                reject(err);
            }
        };
        method !== 'GET' && (opt.data = data);

        wx.request(Object.assign({}, otherOptions, opt));
    });
}

// 排序的函数
function objKeySort(obj) {
    if (Object.prototype.toString.call(obj) !== '[object Object]') return obj;

    // 先用 Object 内置类的 keys 方法获取要排序对象的属性名，
    // 再利用 Array 原型上的 sort 方法对获取的属性名进行排序,
    let newkey = Object.keys(obj).sort();
    let newObj = {};

    for (let i = 0; i < newkey.length; i++) {
        newObj[newkey[i]] = obj[newkey[i]];
    }

    //返回排好序的新对象
    return newObj;
}

function objToQueryString(obj, encode = false) {
    return Object.keys(obj).map(key => {
        return encode ?
            `${key}=${encodeURIComponent(obj[key])}` :
            `${key}=${obj[key]}`;
    }).join('&');
}

export default {
    request
};
