// components/@common-view/list-empty/index.js
Component({
    externalClasses: ['ext-button'],
    /**
     * 组件的属性列表
     */
    properties: {
        emptyText: {
            value: '万物皆空~',
            type: String
        },
        btnText: {
            value: '',
            type: String
        },
        paddingTop: {
            value: '280',
            type: String
        },
        openType: String
    },

    methods: {
        onTapping() {
            this.triggerEvent('tapping')
        },
    }
})
