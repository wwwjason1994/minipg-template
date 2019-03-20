import APIs from '../api/list';
let shareMessageList = null;

/**
 * 获取文案配置，如分享文案和规则问啊
 */
function getShareInfo() {
    if (shareMessageList) {
        return Promise.resolve(shareMessageList);
    }

    return APIs.getShareInfo({ nologin: true })
        .then(res => {
            shareMessage = res.data.share_list;
            return shareMessage;
        }).catch(err => {
            Promise.reject(err);
        })
}

/** 配置分享信息. */
class shareMessage {
    /**
     * Create a share message.
     */
    constructor() {
        this.shareMessageList = null;
        this.initHadErr = false;
        // this.init();
    }

    /**
     * init status
     */
    init() {
        this.initShareMessage();
    }

    /**
     * 获取分享信息
     * @memberof shareMessage
     * @return { Promise } 返回一个Promise
     */
    initShareMessage() {
        return getShareInfo()
            .then(res => {
                console.log('shareMessageList', res);
                this.shareMessageList = res;
                return res;
            }).catch(err => {
                console.log('获取分享内容失败', err);
                this.initHadErr = true;
                return Promise.reject(err);
            })
    }
    /**
     * 获取对应分享类型的信息
     * @param { Number } type 分享类型 ，1 默认分享和用户中心分享| 100 我的2018答题分享
     * @return { Object } 返回对应type的分享信息
     */
    getTargetTypeShareInfo(type) {
        let shareMessageList = this.shareMessageList;
        if (!shareMessageList) {
            this.initShareMessage();
            return null;
        } else if (shareMessageList && shareMessageList.length > 0 && type) {
            return shareMessageList.find(item => item.type === type);
        }
    }

    /**
     * 获取分享内容
     * 默认返回 {
            title: `${who}正在抽红包，邀请你一起瓜分现金大奖`,
            path: 'pages/index/index',
            imageUrl: '/images/share.png'
        };
     * @param { Object } options - 自定义转发内容
     * @param { Object } options.type - 分享类型 默认1
     * @param { Object } options.path - 分享路径
     * @param { Object } options.title - 分享路径
     * @param { Object } options.imageUrl - 分享图, 自定义图片路径 为'none'时用默认截图
     * @param { Boolean } options.invite - 是否邀新
     * @return { Object } 自定义转发内容
     * @memberof shareMessage
     */
    getShareMessage(options = {}) {
        let definePath = `pages/index/index`; // 默认分享路径
        let defineTitle = ``;// 默认标题

        let shareMessage = this.getTargetTypeShareInfo(options.type || 1) || {};

        if (this.initHadErr) {
            this.initShareMessage();
        }

        const { user_id } = getApp().globalData.userInfo
        const uid = user_id || wx.getStorageSync("uid") || '';

        // 右上角分享默认会带上拉新任务的参数
        options.invite && uid && (definePath += (definePath.indexOf('?') >= 0 ? '&' : '?') + 'source=' + encodeURIComponent(uid));

        console.log('definePath', definePath);

        const title = shareMessage.title || options.title || defineTitle;
        const path = options.path || definePath;
        const imageUrl = options.imageUrl !== 'none' ?
            (shareMessage.img || options.imageUrl || '/images/share.png') :
            '';

        const opt = {
            title,
            path,
            imageUrl
        };

        return opt;
    }
}

export default new shareMessage();
