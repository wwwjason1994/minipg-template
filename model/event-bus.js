/**
 * event bus
 * @author anran758
 * @createdDate 2019-01-18
 *
 * @export
 * @class Bus
 */
class Bus {
    busCache = { $uid: 0 };
    constructor() {}

    /**
     * 监听事件
     *
     * @param { String } type - 类型
     * @param { Function } handler - 处理函数
     * @memberof Bus
     */
    on(type, handler) {
        // 读取缓存
        const cache = this.busCache[type] || (this.busCache[type] = {});

        handler.$uid = handler.$uid || this.busCache.$uid++;
        cache[handler.$uid] = handler;
    }

    /**
     * 发射事件
     *
     * @param { String } type - 类型
     * @param {*} param
     * @returns
     * @memberof Bus
     */
    emit(type, ...params) {
        const cache = this.busCache[type];
        if (!cache) return;

        // 向每个订阅者发送消息

        for (let key in cache) {
            cache[key].call(this, ...params);
        }
    }

    /**
     * 注销事件
     * @param {*} type
     * @param {*} handler
     */
    off(type, handler) {
        let counter = 0,
            $type,
            cache = this.busCache[type];

        if (handler == null) {
            // 缓存中没有该项
            if (!cache) return true;

            // 删除整个事件
            return this.busCache[type] && (delete this.busCache[type]);
        } else {
            // 清除函数的 id
            this.busCache[type] && (delete this.busCache[type][handler.$uid]);
        }

        for ($type in cache) {
            counter++;
        }

        return !counter && (delete this.busCache[type]);
    }
}

module.exports = Bus;
