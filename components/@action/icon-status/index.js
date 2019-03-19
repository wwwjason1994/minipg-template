// components/@action/vip-status/index.js
/**
 * 定义 icon 状态管理
 * @author anran758
 * @created 2019-02-12
 * @description 适用于两种状态的 icon 组件，默认用 vip 图标
 */
Component({
    externalClasses: ['ext-class'],

    /**
     * 组件的属性列表
     */
    properties: {
        action: Boolean,
        iconPath: {
            type: String,
            value: '/images/user-centre/icon@vip-light.png',
        },
        iconDisPath: {
            type: String,
            value: '/images/user-centre/icon@vip.png'
        },
    },

    /**
     * 组件的初始数据
     */
    data: {},

    /**
     * 组件的方法列表
     */
    methods: {

    }
})
