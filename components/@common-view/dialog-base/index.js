// pages/user/componments/dialog/index.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        showModel: false,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        hide() {
            this.setData({ showModel: false })
        },

        show() {
            this.setData({ showModel: true });
        },
    }
})
