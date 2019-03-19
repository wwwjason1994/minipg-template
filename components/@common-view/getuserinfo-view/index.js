// components/bottom_picker/index.js
Component({
    /**
     * 组件的属性列表
     */
    properties:{
        formType: {
        type: String,
        value: ''
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
    },
    options: {
        addGlobalClass: true,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onGotUserInfo(e){
            if(e.detail.userInfo){
                this.triggerEvent('success',e.detail.userInfo);
            }else{
                this.triggerEvent('fail',e.detail.errMsg);
            }
        },
        formSubmit(e){
            this.triggerEvent('submit',e.detail);
        }
    },
})
