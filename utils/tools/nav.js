/**
 * 避免频繁跳转的页面跳转封装
 * @author Jenson
 * @createdDate 2018-12-1
 */
class nav{
    constructor(){
        this.isNaving = false;
    }
    clearStatus(){
        this.isNaving = false;
    }
    optionInit(opt){
        let that = this;
        return Object.assign({},opt,{
            complete:function(e){
                opt && opt.complete && opt.complete.call(this,e);
                that.isNaving = false;
            }
        })
    }
    navigateBack(opt){
        if(!this.isNaving){
            this.isNaving = true;
            wx.navigateBack(this.optionInit(opt))
        }
    }
    navigateTo(opt){
        if(!this.isNaving){
            this.isNaving = true;
            wx.navigateTo(this.optionInit(opt))
        }
    }
    redirectTo(opt){
        if(!this.isNaving){
            this.isNaving = true;
            wx.redirectTo(this.optionInit(opt))
        }
    }
    reLaunch(opt){
        if(!this.isNaving){
            this.isNaving = true;
            wx.reLaunch(this.optionInit(opt))
        }
    }
    switchTab(opt){
        if(!this.isNaving){
            this.isNaving = true;
            wx.switchTab(this.optionInit(opt))
        }
    }
}

export default new nav()
