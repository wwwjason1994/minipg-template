// import sendFormId from '../@common-view/formid-view/sendFormId.js'

Component({
    properties: {
        checked: {
            type: Boolean,
            value: true
        }
    },
    methods: {
        handleTap() {
            const checked = !this.data.checked
            this.setData({ checked })
            this.triggerEvent('change', { checked })
        },
        restore() {
            const checked = !this.data.checked
            this.setData({ checked })
        }
    },
})
