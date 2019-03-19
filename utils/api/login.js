/**
 * @deprecated 登录 上传用户信息
 */

import { promisifyWxAPI } from '../tools/tools'
import { request } from '../request.js'
import config from '../config.js';

const loginURL = {
    // 普通登录
    'normal': '/member/login/',
}

/**
 * 用户登录
 * @param { Object } cfg 配置信息
 *   cfg.loadingText  { String }    加载文案
 *   cfg.type      { String }   登录类型,默认为普通登录
 *   cfg.extraData: 非普通登录时额外传入的参数
 */
export const userLogin = function(cfg = {}) {
    wx.showLoading({
        title: cfg.loadingText || '登录中',
        mask: true
    })
    let app = getApp();

    // 获取用户授权信息
    // https://developers.weixin.qq.com/miniprogram/dev/api/wx.getSetting.html
    const wxGetSetting = function() {
        const getSetting = promisifyWxAPI('getSetting');
        return getSetting().then(res => {
            if (!res.authSetting['scope.userInfo']) {
                return Promise.reject({ hadGetUserInfo: false });
            } else {
                return res;
            }
        })
    }

    // 微信登录
    // https://developers.weixin.qq.com/miniprogram/dev/api/wx.login.html
    const wxLogin = function(info) {
        const login = promisifyWxAPI('login');
        return login().then(res => {
            // 用户登录凭证
            if (!res.code) {
                return Promise.reject(info);
            } else {
                return res;
            }
        })
    }

    // 获取用户信息
    // https://developers.weixin.qq.com/miniprogram/dev/api/wx.getUserInfo.html
    const wxGetUserInfo = function(loginInfo) {
        const getUserInfo = promisifyWxAPI('getUserInfo');
        return getUserInfo().then(info => {
            const { rawData, signature, encryptedData, iv } = info;
            const { code } = loginInfo;
            const {extraData, type} = cfg
            const { source_user_id, task_type } = getApp().globalData;

            let data = {
                v: config.version,
                timestamp: Date.now().toString(),

                code,
                rawData,
                signature,
                encryptedData,
                iv,

                source_user_id: source_user_id||'',
                task_type: task_type||'',

                ...extraData
            }

            console.log(data);

            const options = {
                url: type ? loginURL[type] : loginURL['normal'],
                method: 'POST',
                data
            }

            // 登录并获取用户信息
            return request(options).then(res => {
                app = getApp();
                // 抢包迁移过来的不同登录情况，爱豆星球暂时用不到
                const data = (cfg.type) ? res.data.user_info : res.data
                const user_id = data.user_id;
                const sessionid = res.header["Cookie"] || res.header["cookie"] || '';

                // 缓存
                wx.setStorageSync("sessionid", sessionid);
                wx.setStorageSync("user_id", user_id);

                app.globalData.userInfo = data;
                app.globalData.hadLogin = true
                // 更新每一个页面的userInfo
                app.eventBus.emit('updatePageUserInfo',data);
                return res;
            })
        })
    }

    return new Promise((resolve, reject) => {
        Promise.resolve()
            .then(wxGetSetting)
            .then(wxLogin)
            .then(wxGetUserInfo)
            .then(res => {
                wx.hideLoading();
                resolve(res);
            })
            .catch(err => {
                getApp().globalData.hadLogin = false;
                wx.hideLoading();
                reject(err);
            })
    })
}

export default {
    userLogin
}
