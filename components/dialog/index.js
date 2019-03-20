import sendFormId from '../@common-view/formid-view/sendFormId.js'

Component({
    properties: {
        showModal: {
            type: Boolean,
            value: false
        },
        title:{
            type: String,
            value: '提示'
        },
        confirmText:{
            type: String,
            value: '确认'
        },
        cancelText:{
            type: String,
            value: '取消'
        },
        showCancel: {
            type: Boolean,
            value: true
        },
        content:{
            type: String,
            value: ''
        },
        confirmOpenType:{
            type: String,
            value: ''
        },
        cancelOpenType:{
            type: String,
            value: ''
        },
        confirmBtnId:{
            type: String,
            value: ''
        },
        // 标题是否有背景
        hasTitleBg:{
            type: Boolean,
            value: false
        },
        // 是否有按钮
        hasBtns: {
            type: Boolean,
            value: true
        },
        hasCloseButton: {
            type: Boolean,
            value: false
        },
        // 用cover-view
        useCoverView: {
            type: Boolean,
            value: false
        },
    },
    options: {
        addGlobalClass: true,
    },
    data:{
        confirm: function(){
            return true;
        },
        cancel: function(){
            return true;
        },
        complete: function(){
            return true;
        }
    },
    methods: {
        /**
         * @param {Object} options 提示弹窗参数
         */
        show(options){
            this.setData(options);
            this.setData({
                showModal: true
            })
            // 示例 参数都是非必填
            // this.selectComponent('#dialog').show({
            //     showCancel:true,
            //     title: '兑换提示',
            //     confirmText:'马上兑换',
            //     cancelText:'稍后再说',
            //     content: '每日步数只可兑换一次\n每日步数只可兑换一次',
            //     confirm(context){
            //         return true; // 返回ture关闭提示弹窗
            //         或者
            //         context.hide();
            //     },
            //     cancel(context){
            //         return true;// 返回ture关闭提示弹窗
            //         或者
            //         context.hide();
            //     },
            //     confirmOpenType: 'openSetting'
            // })
        },
        hide(){
            this.data.complete();
            this.setData({
                showModal: false,
                confirm: function(){
                    return true;
                },
                cancel: function(){
                    return true;
                },
                complete: function(){
                    return true;
                }
            })
        },
        confirmBtn(){
            // confirm函数return true 隐藏
            this.data.confirm && this.data.confirm(this) && this.hide();

        },
        cancelBtn(){
            // cancel函数return true 隐藏
            this.data.cancel && this.data.cancel(this) && this.hide();
        },
        formSubmit(e){
            sendFormId(e.detail.formId);
        }
    }
});
