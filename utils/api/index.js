/**
 * @deprecated 统一接口封装
 */

import { request } from '../../utils/request.js'
import { userLogin } from './login.js'
import config from '../config.js';

// 超时处理
const loopCount = 3;
let loopNum = 0;

function setOptions(method, url, options) {
    return Object.assign({}, options, { method, url });
}

/**
 * 格式化的请求接口
 * @param { String } method 请求方法
 * @param { String } url url
 * @param { Object } opt 额外的配置项 options.nologin 跳过登录检查
 */
export function unifiedRequest(method, url, opt) {
    let options = setOptions(method, url, opt);

    return new Promise((resolve, reject) => {
        const relogin = (reqErr) => {
            userLogin().then(res => {
                if (loopNum > loopCount) {
                    loopNum = 0;
                    reject(reqErr || '登录循环结束');
                    return;
                }

                loopNum++
                req();
            }).catch(err => {
                if (!err.hadGetUserInfo) {
                    wx.showToast({ title: '没有授权用户信息', icon: 'none', duration: 2000 });
                } else {
                    reject(err);
                }
                console.log(err);
            })
        }

        const req = function() {
            let sessionid = wx.getStorageSync("sessionid");
            if (sessionid || options.nologin) {
                options.header = {
                    'Cookie': sessionid
                }
                options.query = {
                    v: config.version,
                    ...options.query
                }

                request(options).then(res => {
                    loopNum = 0;
                    resolve(res);
                }).catch(err => {
                    if ([401].indexOf(err.statusCode) >= 0) {
                        return relogin(err);
                    } else {
                        console.log(err);
                        reject(err);
                    }
                })
            } else {
                relogin();
            }
        }

        req();


    })
}
