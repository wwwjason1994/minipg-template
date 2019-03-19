// const ald = require('./utils/ald/ald-stat.js');

import Bus from './model/event-bus.js'
import { userLogin } from './utils/api/login'

App({
    globalData: {
        // 是否审核版本
        versionConfig: null,
        wxSetting:{},
        windowSize:{},
        isIphoneX: false,
        // 用户信息
        userInfo: {
            avatar: '/images/common/no_login_avatar.png',
            nickname: '未登录',
            user_id: null,
        },
        source_user_id: null,
        task_type: null,
        system:'', //设备系统类型,
        scene: -1, //场景值
        hadLogin: false,

        // 缓存配置信息
        config: {
            cs: null
        },
        videoCompUrl: '',
    },

    getWindowSize(){
        let that = this;
        try {
            var res = wx.getSystemInfoSync()
            this.checkSystem(res.system)
            let windowSize = {};
            windowSize.width = res.windowWidth;
            windowSize.height = res.windowHeight;
            that.globalData.windowSize = windowSize;
            let model = res.model.toLowerCase();
            if(model.indexOf('iphone x') >= 0 || model.indexOf('iphone11') >= 0){
                that.globalData.isIphoneX = true;
            }
            return windowSize;
        } catch (e) {
          // Do something when catch error
        }
    },
    getSetting(){
        let that = this;
        return new Promise((reslove, reject)=>{
            wx.getSetting({
                success(res){
                    that.globalData.wxSetting = res;
                    reslove(res);
                },
                fail(err){
                    reject(err);
                }
            })
        })
    },
    // 检查更新代码
    checkUpdate(){
        const updateManager = wx.getUpdateManager()

        updateManager.onCheckForUpdate(function (res) {
          // 请求完新版本信息的回调
          console.log('是否有新版本：',res);
        })
        updateManager.onUpdateReady(function () {
            wx.showModal({
                title: '更新提示',
                showCancel: false,
                content: '新版本已经准备好，请重启应用~',
                success: function (res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                }
            })
        })
    },
    // 检查系统类型
    checkSystem(system) {
        /^Android/.test(system) && (this.globalData.system = 'android');
        /^iOS/.test(system) && (this.globalData.system = 'ios')
    },
    onLaunch(){
        try{
            this.checkUpdate();
        }catch(e){
            console.log('检查更新出错：',e);
        }

        this.getSetting();
        this.getWindowSize();
        this.eventBus = new Bus();
    },
    onShow(options) {
        this.globalData.scene = options.scene
    },
    /**
     * 登录
     * @param {*} [{type = '', extraData = {}}={}] type: 登录类型,普通登录不传, extraData: 非普通登录额外传的数据
     * @returns
     */
    login({type = '', extraData = {},loadingText = '加载中'} = {}) {
        return new Promise((resolve,reject) => {
            if(this.globalData.hadLogin && !type) {
                resolve(this.globalData.userInfo)
                return
            }
            userLogin({
                loadingText,
                type,
                extraData
            })
            .then(res => {
                resolve(res.data)
            })
            .catch(err => {
                console.log(err)
                if (err.hadGetUserInfo !== false) {
                    wx.showToast({
                        title: '登录失败',
                        icon: 'none',
                        duration: 2000
                    });
                }
                reject(err)
            });
        })
    }
})
