/**
 * 分页管理器
 * @author anran758
 * @createdTime 2019-03-11
 */

//  data
const data = {
    dataArray: [],
    pagination: {
        page: 1,
        size: 10,
        allPage: 0,
    },

    // 是否初始化数据完毕
    // 可通过`!initedData && loading`来判断是否首屏加载
    // 从而显示不同的`loading`样式
    isInitedData: false,

    // 加载中
    loading: false,

    // 列表为空
    empty: false,

    // 数据已经加载完毕
    isEnded: false,
}

// 事件
const methods = {
    /**
     * 初始化页码
     */
    initPagination() {
        this.data.pagination.page = 1

        this.setData({
            dataArray: [],
            isEnded: false,
        })
    },

    /**
     * 设置更多的数据
     *
     * @param { Array } dataArray - 新的列表信息
     * @param { Number } allPage - 该列表的 page 页
     * @returns
     */
    setMoreData(dataArray = [], allPage) {
        // 更新 allPage
        if (allPage) this.data.pagination.allPage = allPage;

        // 数据加载完毕
        if (!dataArray.length) {
            this.setData({ isEnded: true });

            // 空列表
            if (!this.data.dataArray.length) this.setData({ empty: true });

            return false;
        }

        const { pagination } = this.data;

        // 判断是否已达到最大页码
        if (pagination.page >= pagination.allPage) {
            this.setData({ isEnded: true });
        } else {
            this.data.pagination.page++;
        }

        // 合并数据
        this.setData({
            dataArray: this.data.dataArray.concat(dataArray)
        })

        return true;
    },

    // 是否可以获取更多的数据
    _hasMore() {
        return !this.data.isEnded
    },
}

/**
 * 调用该函数可生命供 wx 组件件共用的 Behavior
 *
 * @description
 * 使用方法如下:
 *
 *  const pageBehavior = behaviorFn();
 *  Component({
 *      behaviors: [pageBehavior],
 *      // other code...
 *  });
 */
const behaviorFn = () => Behavior({ data, methods });

module.exports = {
    data,
    methods,
    behaviorFn,
}
