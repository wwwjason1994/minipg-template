import sendFormId from '../formid-view/sendFormId'
let app = getApp();

Component({
    properties: {
        loginType:{
            type: String,
            value: ''
        },
        loadingText:{
            type: String,
            value: ''
        },
        extraData:{
            type: Object,
            value: {}
        },
    },

    data: {
        hadAuth: false,
        formId: null
    },
    ready() {
        app.getSetting().then(res => {
            if(res.authSetting['scope.userInfo'] && wx.getStorageSync('sessionid')){
                this.setData({
                    hadAuth: true
                })
            }else{
                this.setData({
                    hadAuth: false
                })
            }
        })
    },
    methods: {
        authLogin(e){
            if(e.detail.userInfo){
                app.login({
                    type: this.data.loginType,
                    loadingText: this.data.loadingText,
                    extraData: this.data.extraData
                }).then(res=>{
                    if(this.data.formId){
                        sendFormId(this.data.formId);
                    }
                    this.setData({
                        hadAuth: true
                    })
                    // 刚登陆完的标识
                    res.justLogined = true;
                    this.triggerEvent('success',res);
                }).catch(err=>{
                    this.triggerEvent('fail',err);
                })
            }else{
                this.triggerEvent('fail',e.detail.errMsg);
            }
        },
        sendFormId(e) {
            if(this.data.formId){
                sendFormId(this.data.formId);
            }
            this.triggerEvent('success',app.globalData.userInfo);
        },
        getFormId(e){
            this.setData({
                formId: e.detail.formId
            })
        }
    }
})
