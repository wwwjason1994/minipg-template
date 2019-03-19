// components/bottom-picker/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    options: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    selectedItem(e){
      let id = e.currentTarget.id;
      this.setData({
        isShow : false
      });
      this.triggerEvent('selected',{id});
    },
    show(){
      this.setData({
        isShow : true
      });
    },
    hide(){
      this.setData({
        isShow : false
      });
    },
  },
})
