import APIs from '../api/list.js'
import tools from '../tools/tools.js'
import date from '../tools/date.js'
import precision from '../tools/precision.js'
import nav from '../tools/nav.js'
import share from '../share/index.js'

function ConfigFunction() {
    const { decodeObject } = tools;
    const app = getApp();

    // 引入外部工具
    const libs = {
        APIs,
        tools,
        date,
        precision,
        share,
        nav
    }

    // data
    const data = {
        userInfo: app.globalData.userInfo,
        isIphoneX: app.globalData.isIphoneX
    }

    // 页面钩子
    /**
     * 页面钩子触发器，会在页面上同名钩子触发时先触发，
     * return的参数会作为钩子的第二个参数传给页面的钩子
     * onLoad(opts,newOpts) {} newOpts是hooks的钩子返回的参数
     */
    const hooks = {
        onLoad(o) {
            this.globalData = getApp().globalData;
            this.setData({
                isIphoneX: getApp().globalData.isIphoneX,
                userInfo: getApp().globalData.userInfo
            })
            let newOpts = Object.assign({}, o);
            // 对二维码携带的scene统一decode;
            newOpts.sceneArr = o.scene ? decodeURIComponent(o.scene).split(',') : [];
            // 对所有传参decode;
            newOpts.decodeQuery = decodeObject(o);
            console.log(newOpts);

            // 防止westore的update多个页面同事diff和setdata，消耗性能
            let currentPgae = getCurrentPages()
            let myPage = currentPgae[currentPgae.length-1].route;
            this._updatePageUserInfo = (res)=>{
                let updatingPgaes = getCurrentPages()
                let updatingPgae = updatingPgaes[updatingPgaes.length-1].route;
                if(this.update && myPage === updatingPgae){
                    this.update({
                        userInfo: res
                    })
                }else if(!this.update){
                    this.setData({
                        userInfo: res
                    })
                }
            }

            getApp().eventBus.on('updatePageUserInfo',this._updatePageUserInfo);
            return newOpts;
        },
        // :alway 后缀，就算页面没有注册钩子也会合并进去
        'onUnload:alway'(e){
            getApp().eventBus.off('updatePageUserInfo',this._updatePageUserInfo);
            return e
        },
        onShareAppMessage(e) {
            return share.getShareMessage();
        }
    }

    // 组件钩子
    const compHooks = {
        ready(e) {
            return e
        }
    }

    // 全局方法
    const methods = {
        // 更新用户信息
        updateUserInfo() {
            return APIs.getUserInfo()
                .then(({ data: userInfo }) => {
                    getApp().globalData.userInfo = userInfo;
                    getApp().eventBus.emit('updatePageUserInfo',userInfo);
                    return userInfo;
                })
                .catch(err => {
                    console.log(err, '获取用户信息失败')
                    return Promise.reject(err);
                });
        },
    }

    return {
        libs,
        data,
        hooks,
        methods,
        compHooks
    }
}


export default ConfigFunction;
