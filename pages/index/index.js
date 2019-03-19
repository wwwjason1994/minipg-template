// pages/index/index.js
const {
    create,
    APIs,
    nav
} = require('../../utils/page/index.js')({ useDiff: true });
create({
    /**
     * 页面的初始数据
     */
    data: {

    },
    // 不参与渲染的单向变量
    variables: {

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options, newOpts) {

    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function(obj, newOpts) {
        return newOpts
    }
})
