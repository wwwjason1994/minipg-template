// formid-view.js
import sendFormId from './sendFormId.js'

Component({
    options: {
        addGlobalClass: true,
    },
    properties: {
        buttonid:{
            type: String,
            value: '',
        },
        formType:{
            type: String,
            value: 'submit',
        },
        gotUserInfo: {
            type: Boolean,
            value: false,
            observer: function(newVal) {
            }
        },
        openType:{
            type: String,
            value: '',
        },
        _style:{
            type: String,
            value:''
        }
    },

    methods: {
        onGotUserInfo(e){
            if(!this.data.gotUserInfo) return;
            this.triggerEvent('getUserInfo',e.detail);
        },
        formSubmit(e){
            this.triggerEvent('formSubmit',e.detail);
            this.sendFormId(e.detail.formId);
        },
        sendFormId(id){
            sendFormId(id);
        },
        getphonenumber(e){
            this.triggerEvent('getphonenumber',e.detail);
        }
    }
});
