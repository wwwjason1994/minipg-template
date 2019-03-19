# 小程序工程模板

## 1. 目录结构说明

```
├── components (公共小程序组件目录)
│   ├── @anima (动画相关组件目录)
│   ├── @common-view（不涉及特定样式的公用组件，一般可以可以用到别的小程序）
│   │   ├── formid-view（formid埋点）
│   │   ├── getuserinfo-view（用户授权组件，不包含登录）
│   │   ├── login-view（用户授权+登录组件，包含登录）
│   │   └── share-canvas（生产canvas分享图组件）
│   └── ...
├── images（公用图片资源）
├── pages（主包目录）
├── style（公用样式目录）
├── subpackages（分包目录）
│   └── blue-diamond-star（分包根目录）
│        ├── components（分包用到的公共组件）
│        ├── images（分包图片资源）
│        └── pages（分包页面目录）
├── utils（公共模块）
│   ├── ald（阿拉丁统计）
│   ├── api（接口相关模块）
│   ├── modules（第三方模块）
│   ├── page（Page二次封装）
│   ├── tools（工具函数）
│   ├── config.js（项目配置 接口配置）
│   ├── localConfig.js
│   │   (本地项目配置 测试环境用于覆盖config.js 被gitgnore)
│   ├── localConfig.tpl.js(localConfig.js 的模板，不参与编译)
│   └── request.js（api请求封装模块）
├── app.js
├── app.json
├── app.wxss
├── project.config.json
...

```

## 2. 文件命名规范

### 小程序组件（components）

```
├── components
│   ├── @anima
│   ├── @common-view
│   │   └── formid-view
│   │       ├── index.js
│   │       ├── index.json
│   │       ├── index.wxml
│   │       └── index.wxss
│   └── dialog
│        ├── index.js
│        ├── index.json
│        ├── index.wxml
│        └── index.wxss
```

1. `@`开头文件夹置顶同类型组件集合
2. 其他目录为一般公共组件目录
3. 组件目录下统一用 `index` 命名

### 页面（pages）

```
├── pages
│   └── user
│       ├── index.js
│       ├── index.json
│       ├── index.wxml
│       └── index.wxss
├── subpackages（分包目录）
│   └── blue-diamond-star
│        └── pages
│            └── home
│                ├── images
│                ├── components
│                ├── subpages
│                │   └── share
│                ├── index.js
│                ├── index.json
│                ├── index.wxml
│                └── index.wxss
```

1. 页面目录下统一用 `index` 命名
2. 同一功能模块下的子页面 放到 subpages目录下
3. 单独在该功能模块下用到图片放到 image目录下
4. 该功能模块下用到组件放到 components目录下
5. 分包统一放到subpackages目录下

## 3. 配置文件说明

> `utils/config.js` 是接口的统一配置文件

``` js
let localConfig = {};
try{
    localConfig = require('./localConfig.js').config;
}catch(e){
    console.log('Missing localConfig.js.');
}
export default {
    ENV: 'production',
    appid: "",// KOL星球
    otherAppid: {
        // 蓝钻星球
        diamond: ""
    },
    request: {
        secret: '',
        origin: ''
    },
    ...localConfig
}
```

* request.secret 接口验签秘钥
* request.origin 接口请求域名


> `utils/localConfig.js` 本地接口配置，会覆盖config.js和ms.config.js内的配置,用于测试环境，已经加入.gitgnore，正式环境另外clone仓库上传就不会有localConfig.js

``` js
module.exports = {
    config:{
        ENV: 'development',
        appid: "",// 玩趣游戏盒子
        otherAppid: {
            // 抢包助手
            diamond: ""
        },
        request: {
            secret: '',
            origin: ''
            // origin: 'https://www.easy-mock.com/mock/5c78d9720be3784c0b5d351a/kol-planet' // easy-mock
        }
    }
}

```

## 4. 工具函数

目录：`utils/tools/`

### tools.js

函数|说明
:--|:--
formatDate|格式化时间为年
promisifyWxAPI|把微信api转换为promise对象
isValidUrl|检查是否是有效url
equal|深度对比两个对象是否一致
RouteTool|获取当前页面路由信息工具类

以后有新的工具函数加入请请更新文档

### precision.js

浮点数运算相关函数

函数|说明
:--|:--
add|加
sub|乘
mul|除
round|四舍五入
conversionUnit|单位换算

### date.js

时间格式化工具，具体能力请看注释

## 5. Page 方法二次封装

目录：`utils/page/index.js`

### 使用说明

```
const { APIs } =  require('../../utils/page/index.js')();

Page({
    data:{},
    onLoad(){
        APIs.getSome().then()
    }
})

```

`utils/page/index.js` 二次封装了Page函数，

返回在 `page/index.js` 引入的常用第三方工具或者库文件

### 能力1、统一引入工具和类库

如下：
```js
import APIs from './api/list.js'
import tools from './tools/tools.js'
import Date from './tools/date.js'
import precision from './tools/precision.js'

function t() {

    const libs = {
        APIs,
        tools,
        Date,
        precision
    }
...
```

### 能力2、统一处理页面钩子

 * 页面钩子触发器，会在页面上同名钩子触发时先触发，
 * return的参数会作为钩子的第二个参数传给页面的钩子

```js
// 页面钩子
const hooks = {
    onLoad(o) {
        return 123;
    }
}
```

pages/index/index

 ```js
const { APIs } =  require('../../utils/page/index.js')();

Page({
    data:{},
    onLoad(options,o){
        console.log(o)// ==> 123
    }
})
```
### 能力3、对setData进行了diff封装

用westore里的diff.js对setData进行了封装，更名为this.$setData
要看其diff，要在映入`utils/page/index.js`是设置参数`{useDiff:true}`

> 注意：由于进行了diff对比，所以数据没变时候不会触发setData不会更新视图</br>
但是如果交互操作使视图改变了data没改变的话，$setData()一样的值不会刷新视图，</br>
所以还是要用回原本的this.setData

```js
const { create } =  require('../../utils/page/index.js')({useDiff:true});

create({
    data:{
        arr: false
    },
    onLoad(){
        this.$setData({
            arr: [1,2,3]
        })
    }
})
```

### 能力4、引入 westore

westore 的使用类似于状态管理库，使用前需要创建一份`utils/page/store.js`数据作为数据源,
多页面间的数据同步都是依照这个数据进行对照的，具体说明查看[westore文档](https://github.com/Tencent/westore#%E6%99%AE%E9%80%9A%E5%BC%80%E5%8F%91)。

所有页面的数据都写到store.js里面不够灵活，所以建议westore当做状态管理使用，
注册上跨页面、跨组件或者组件和页面之间需要同步的数据。具体声明规范和westore文档一致

```js
// utils/page/store.js
export default {
    data : {
        userInfo: getApp().globalData.userInfo,
        isIphoneX: getApp().globalData.isIphoneX,
    },
    globalData: ['userInfo', 'isIphoneX'],
}
```

经过封装后，westore页面创建如下

```js
const { create } =  require('../../utils/page/index.js')({useDiff:true});

create({
    data:{
        loading: false
    }
})
```

westore组件创建如下

```js
const { createComp } =  require('../../utils/page/index.js')({useDiff:true});

createComp({
    data:{
        loading: false
    }
})
```

其余能力和使用方式和westore官方文档一致

> 注意：因为对Page()进行了二次封装，Onload等钩子函数有第二个回调参数，所以对westore的源码（`utils/modules/westore/create.js`）进行了些许修改，所以更新westore的时候需要注意

```js
43|  onLoad && onLoad.call(this, e)
50|  onUnload && onUnload.call(this, e)
76|  ready && ready.call(this, e)
==>
43| onLoad && onLoad.call(this, ...arguments)
50|  onUnload && onUnload.call(this, ...arguments)
76|  ready && ready.call(this, ...arguments)
```

## 6. appid 白名单
```js
{
    "navigateToMiniProgramAppIdList": [
    ]
}
```
