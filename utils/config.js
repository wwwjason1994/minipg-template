let localConfig = {};
try{
    localConfig = require('./localConfig.js').config;
}catch(e){
    console.log('Missing localConfig.js.');
}

export default {
    ENV: 'production',
    appid: "", // kol星球
    otherAppid: {
        // 蓝钻星球
        diamond: ""
    },
    request: {
        secret: '',
        origin: ''
    },
    // 客户端版本
    version: '1.0.0',

    ...localConfig,
}
