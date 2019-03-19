import initConfig from './initConfig.js'
import diff from '../modules/westore/diff.js'
import create from '../modules/westore/create.js'
import store from './store.js'

function t() {

    const np = Page;
    const nc = Component;


    return function({useDiff}={}){

        const {
            libs,
            data,
            hooks,
            methods,
            compHooks
        } = initConfig();

        /**
         * @param {Boolean} useDiff 开启diff
         */
        Page = function (r) {
            Object.keys(data).forEach(key=>{
                if (r.data) {
                    !r.data[key] && (r.data[key] = data[key]);
                } else {
                    r.data = data;
                }
            });

            // 添加公共方法
            Object.keys(methods).forEach(key => {
                // 如果 page 页面没有该方法的话
                !r[key] && (r[key] = methods[key]);
            })

            mergeHook(r,hooks);
            r._hadMergeOnPage = true;
            useDiff && (r.$setData = $setData(r));
            np(r);
        }

        Component = function (r) {
            Object.keys(data).forEach(key=>{
                if (r.data) {
                    !r.data[key] && (r.data[key] = data[key]);
                } else {
                    r.data = data;
                }
            })

            mergeHook(r.methods,hooks);
            mergeHook(r,compHooks);
            useDiff && (r.$setData = $setData(r));
            nc(r);
        }

        // westore 库引用
        libs.create = function (r){
            create(store,r);
        }
        // westore 库引用, 创建组件
        libs.createComp = function (r){
            create(r);
        }

        // 合并钩子
        function mergeHook(h,hl) {
            if(h){
                Object.keys(hl).forEach(key=>{
                    let isAlwayHook = false;
                    let originKey = key;
                    if(/\:alway$/.test(key)){
                        isAlwayHook = true;
                        key = key.replace(/\:alway$/,'');
                    }
                    if (h[key]) {
                        h[key] = mergeFun(h[key],hl[originKey]);
                    }else if(isAlwayHook){
                        h[key] = mergeFun(function(){},hl[originKey]);
                    }
                })
            }
        }
        // 合并函数
        function mergeFun(origin,ours) {
            return function (e) {
                let ourReturn;
                typeof ours === 'function' && (ourReturn = ours.call(this, e));
                return typeof origin === 'function' && origin.call(this, e, ourReturn);
            }
        }

        /**
         * diff setData
         * 注意：由于进行了diff对比，所以数据没变时候不会触发setData不会更新视图
         * 但是如果交互操作使视图改变了data没改变的话，要通过setData一样的值来刷新视图，还是要用回原本的this.setData
         */
        function $setData(r){
            let originData = null;
            const onLoad = r.onLoad;
            r.onLoad = function(){
                originData = r.data ? JSON.parse(JSON.stringify(r.data)) : {};
                // 复写一般的setData，setData的同时更新originData
                const setData = this.setData;
                this.setData = function(){
                    const call = setData.call(this,...arguments);
                    let settingData = arguments[0];
                    for (let key in settingData) {
                        updateByPath(originData, key, typeof settingData[key] === 'object' ? JSON.parse(JSON.stringify(settingData[key])) : settingData[key])
                    }
                    return call;
                }
                onLoad && onLoad.call(this,...arguments);
            }
            const onUnload = r.onUnload;
            r.onUnload = function(){
                onUnload && onUnload.call(this,...arguments);
                originData = null;
            }
            return function(data){
                let that = this;
                return new Promise(resolve => {
                    let diffResult = diff(data,originData);
                    let array = []
                    if (Object.keys(diffResult)[0] == '') {
                        diffResult = diffResult['']
                    }
                    if (Object.keys(diffResult).length > 0) {
                        array.push( new Promise( cb => that.setData(diffResult, cb) ) )
                    }
                    Promise.all(array).then( e => resolve(diffResult) );
                })
            }
        }

        return libs;

    }
}

function updateByPath(origin, path, value) {
    if(!origin) return;
    const arr = path.replace(/]/g, '').replace(/\[/g, '.').split('.')
    let current = origin
    for (let i = 0, len = arr.length; i < len; i++) {
        if (i === len - 1) {
            current[arr[i]] = value
        } else {
            current = current[arr[i]]
        }
    }
}

module.exports = t();
