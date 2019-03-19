import APIs from '../../../utils/api/list.js'
let last_time = 0;
let delay = 1000 * 10;

export default function(id,success,fail){
    // 10秒发一次
    if(last_time+delay < Date.now()){
        console.log(id);
        APIs.sendFormId({
            data:{
                form_id: id
            }
        }).then(res=>{
            last_time = Date.now();
            typeof success === 'function' && success();
        }).catch(err=>{
            console.log(err);
            last_time = Date.now();
            typeof fail === 'function' && fail();
        })
    }
}
