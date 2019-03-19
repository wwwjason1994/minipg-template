/**
 * westore 库的全剧store配置
 * @author Jenson
 * @createdDate 2019-02-19
 * https://github.com/Tencent/westore
 */
export default {
    data : {
        userInfo: getApp().globalData.userInfo,
        isIphoneX: getApp().globalData.isIphoneX,
    },
    globalData: ['userInfo', 'isIphoneX'],
}
