// components/share-canvas/index.js
import Downloader from '../../../utils/modules/downloader'
const downloader = new Downloader()

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        width: {
            type: Number,
            value: 600
        },
        height: {
            type: Number,
            value: 1000
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        windowSize: {},
        background: {},
        fonts: [],
        images: [],
        graphs: [],
        imagesFilePath: [],
        backgroundFilePath: '',
        canvasTempFilePath: null,
        hadDrawn: false,
    },
    created() {
        let app = getApp();
        this.setData({
            windowSize: app.globalData.windowSize
        })
    },
    attached() {
        // this.draw();
    },
    detached() {
        clearInterval(this.intervalTime);
        clearTimeout(this.timeOutTime);
    },
    /**
     * 组件的方法列表
     */
    methods: {
        draw(options) {
            return new Promise((resolve, reject) => {
                wx.showLoading({
                    title: '加载中',
                    mask: true
                })
                this.setData(options);
                this.setData({
                    canvasTempFilePath: null,
                    hadDrawn: false
                })
                this.downloadAllImg().then(() => {
                    wx.hideLoading();
                    this.drawOnCanvas();
                    resolve();
                }).catch((err) => {
                    wx.hideLoading();
                    reject(err);
                })
            })
        },
        drawOnCanvas() {
            wx.showLoading({
                title: '加载中',
                mask: true
            })
            let OriginImageIndex = 0; // 远程图片集下标
            let ctx = wx.createCanvasContext('share_canvas', this);
            const { background, fonts, images, graphs } = this.data;

            const { width: canvasW, height: canvasH } = this.data;
            // 不知为何this 有指针问题，在draw里面调用this为undefined
            const cl = this.countLength.bind(this);

            // 圆角矩形
            function roundRect(x, y, w, h, r, color) {
                if (w < 2 * r) r = w / 2;
                if (h < 2 * r) r = h / 2;

                ctx.beginPath();
                ctx.moveTo(f(x + f(r, 0)), f(y));
                ctx.arcTo(f(x + w), f(y), f(x + w), f(y + h), f(r, 0));
                ctx.arcTo(f(x + w), f(y + h), f(x), f(y + h), f(r, 0));
                ctx.arcTo(f(x), f(y + h), f(x), f(y), f(r, 0));
                ctx.arcTo(f(x), f(y), f(x + w), f(y), f(r, 0));
                ctx.closePath();
                ctx.setFillStyle(color || '#fff')
            }

            function f(l, d = 1) {
                return l.toFixed(d) * 1;
            }

            // 画背景
            ctx.setFillStyle('#fff');
            if (background.backgroundColor) {
                ctx.setFillStyle(background.backgroundColor);
                ctx.fillRect(0, 0, cl(canvasW), cl(canvasH))
            }
            if (background.backgroundImage) {
                if (!background.local) {
                    ctx.drawImage(this.data.backgroundFilePath, 0, 0, cl(background.width || canvasW), cl(background.height || canvasH));
                } else {
                    ctx.drawImage(background.backgroundImage, 0, 0, cl(background.width || canvasW), cl(background.height || canvasH));
                }
            }
            ctx.setFillStyle('#000');

            // 画图形
            for (var index = 0; index < graphs.length; index++) {
                let graph = graphs[index];

                if (graph.circle) {
                    ctx.arc(cl(graph.x + graph.width / 2), cl(graph.y + graph.width / 2), cl(graph.width / 2), 0, 2 * Math.PI);
                    ctx.setFillStyle(graph.backgroundColor || '#fff');
                    ctx.fill();
                } else if (graph.radius && graph.radius > 0) {
                    roundRect(cl(graph.x), cl(graph.y), cl(graph.width), cl(graph.height), cl(graph.radius));
                    ctx.setFillStyle(graph.backgroundColor || '#fff');
                    ctx.fill()
                } else {
                    ctx.setFillStyle(graph.backgroundColor || '#fff');
                    ctx.fillRect(cl(graph.x), cl(graph.y), cl(graph.width), cl(graph.height));
                }
                ctx.setFillStyle('#000');
            }

            // 画所有图片
            for (var index = 0; index < images.length; index++) {
                let image = images[index];
                if (image.clipCircle) {
                    // 圆形裁剪
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(cl(image.x + image.width / 2), cl(image.y + image.width / 2), cl(image.width / 2), 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.clip();
                } else if (image.radius && image.radius > 0) {
                    // 图片圆角
                    ctx.save();
                    roundRect(cl(image.x), cl(image.y), cl(image.width), cl(image.height), cl(image.radius));
                    ctx.clip();
                }

                image.backgroundColor && ctx.setFillStyle(image.backgroundColor);
                image.backgroundColor && ctx.fillRect(cl(image.x), cl(image.y), cl(image.width), cl(image.height));

                if (!image.local) {
                    let img = this.data.imagesFilePath[OriginImageIndex++];
                    ctx.drawImage(img, cl(image.x), cl(image.y), cl(image.width), cl(image.height));
                } else {
                    ctx.drawImage(image.url, cl(image.x), cl(image.y), cl(image.width), cl(image.height));
                }
                if (image.clipCircle || (image.radius && image.radius > 0)) {
                    ctx.restore();
                }
                ctx.setFillStyle('#000');
            }

            // 画所有文字
            // TODO: font.y 是需要加上文字高度(fontSize)才会同设计图的高度相匹配，
            // 现在修改会牵连太多页面，暂时保持原样
            for (var index = 0; index < fonts.length; index++) {
                let font = fonts[index];
                ctx.setFillStyle(font.color || '#000');
                ctx.setFontSize(cl(font.fontSize || 30));
                font.textAlign && ctx.setTextAlign(font.textAlign);
                font.fontWeight && (ctx.font = `normal ${font.fontWeight} ${cl(font.fontSize || 30,0)}px arial`);

                if (font.width) {
                    let chr = font.content.split("");
                    let temp = "";
                    let row = [];

                    // 遍历字符串
                    for (let i = 0; i < chr.length; i++) {
                        if (ctx.measureText(temp).width < cl(font.width)) {
                            temp += chr[i];
                        } else {
                            // 换行
                            (i--, row.push(temp), temp = "");
                        }
                    }
                    row.push(temp);

                    // 截取行数
                    if (font.rowSize && row.length > font.rowSize) {
                        const rowCut = row.slice(0, font.rowSize);
                        const length = Math.min(font.rowSize, rowCut.length);

                        // 取最后一段文字
                        const rowPart = rowCut[length - 1];
                        const ellipsisLen = cl(font.width - font.fontSize);
                        let text = "";

                        for (let i = 0; i < rowPart.length; i++) {
                            // console.log(ctx.measureText(text).width, i);
                            if (ctx.measureText(text).width < ellipsisLen) {
                                text += rowPart[i];
                            } else {
                                break;
                            }
                        }

                        rowCut.splice(length - 1, 1, `${text}...`);
                        row = rowCut;
                    }

                    // 计算居中
                    const computedCenter = (x, w, fW) => {
                        const div = (v) => (v / 2).toFixed() * 1;
                        return cl(x) + cl(div(w)) - div(fW);
                    }

                    const { x, y } = font;
                    for (let i = 0; i < row.length; i++) {
                        let compY = y + (i * font.fontSize);

                        // 设置行高
                        !!i && (compY += (i * (font.lineGap || 4)));

                        // 文字居中
                        if (!font.textCenter) {
                            ctx.fillText(row[i], cl(x), cl(compY));
                        } else {
                            const fontWidth = ctx.measureText(row[i]).width;
                            ctx.fillText(
                                row[i],
                                computedCenter(x, font.width, fontWidth),
                                cl(compY),
                            );
                        }
                    }
                } else {
                    ctx.fillText(font.content, cl(font.x), cl(font.y));

                    if (font.deleteLine) {
                        const middle = Math.floor(font.fontSize / 3);
                        const w = ctx.measureText(font.content).width;
                        const y = cl(font.y) - cl(middle);

                        ctx.beginPath();
                        ctx.setLineWidth(cl(1));
                        ctx.setStrokeStyle(font.color);
                        ctx.moveTo(cl(font.x), y);
                        ctx.lineTo(cl(font.x) + w, y);
                        ctx.stroke();
                    }
                }


                ctx.font = 'normal normal 30px arial';
                ctx.setTextAlign('left');
            }
            ctx.draw(true);
            this.setData({
                hadDrawn: true
            })
            setTimeout(() => {
                wx.hideLoading();
                this.canvasToTempFilePath(res => {
                    this.triggerEvent('canvasdrawn', res);
                })
            }, 600)
        },
        canvasToTempFilePath(success, fail) {
            if (!this.data.hadDrawn) return typeof fail === 'function' && fail('no hadDrawn');;
            const { width: canvasW, height: canvasH } = this.data;
            const cl = this.countLength.bind(this);
            let that = this;
            if (this.data.canvasTempFilePath) {
                typeof success === 'function' && success(this.data.canvasTempFilePath);
                return;
            }
            wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width: cl(canvasW),
                height: cl(canvasH),
                destWidth: cl(canvasW) * 3,
                destHeight: cl(canvasH) * 3,
                quality: 1,
                fileType: 'png',
                canvasId: 'share_canvas',
                success: function(res) {
                    console.log(res.tempFilePath);
                    that.setData({
                        canvasTempFilePath: res.tempFilePath
                    })
                    typeof success === 'function' && success(res.tempFilePath);
                },
                fail(err) {
                    console.log(err)
                    typeof fail === 'function' && fail(err);
                }
            }, this)
        },
        countLength(l, d = 1) { // d 小数位
            const windowSize = this.data.windowSize;
            return (windowSize.width * l / 750).toFixed(d) - 0;
        },
        // 下载所有图片到微信缓存
        downloadAllImg() {
            return new Promise((resolve, reject) => {
                let OriginImageNum = 0;
                let OriginBgNum = 0;
                let images = this.data.images;
                let background = this.data.background;

                // 下载背景
                if (!background.local && background.backgroundImage) {
                    OriginBgNum++;
                    this.downloadImg(background.backgroundImage, res => {
                        this.setData({
                            backgroundFilePath: res
                        })
                    }, err => {
                        clearInterval(this.intervalTime);
                        reject(err)
                    })
                }
                // 下载图片
                for (var index in images) {
                    let image = images[index - 0];
                    if (!image.local) {
                        const idx = OriginImageNum++;
                        this.downloadImg(image.url, res => {
                            let imagesFilePath = this.data.imagesFilePath;
                            imagesFilePath[idx] = res;
                            this.setData({
                                imagesFilePath
                            })
                        }, err => {
                            clearInterval(this.intervalTime);
                            reject(err)
                        })
                    }
                }
                // 所有远程图片下载完才开始绘图
                this.intervalTime = setInterval(() => {
                    let allImageNum = this.data.imagesFilePath.length + (this.data.backgroundFilePath ? 1 : 0);
                    if (allImageNum === OriginImageNum + OriginBgNum) {
                        let arrayReadLong = 0;
                        this.data.imagesFilePath.forEach(item => {
                            arrayReadLong++;
                        });
                        if (arrayReadLong === OriginImageNum) {
                            clearInterval(this.intervalTime);
                            resolve(this.data.imagesFilePath);
                        }
                    }
                }, 50)
                // 下载超时
                this.timeOutTime = setTimeout(() => {
                    clearInterval(this.intervalTime);
                    reject('图片请求超时');
                }, 30000);
            })
        },
        downloadImg(url, success, fail) {
            downloader.download(url)
                .then((path) => {
                    success && success(path)
                })
                .catch((err) => {
                    fail && fail(err)
                })
            // wx.downloadFile({
            //   url: url,
            //   success: (res)=> {
            //     if(res.statusCode === 200){
            //       success&&success(res.tempFilePath)
            //     }else{
            //       fail&&fail(res)
            //     }
            //   },
            //   fail: (res)=> {
            //     fail&&fail(res)
            //   }
            // })
        },
    }
})

// 绘图示例
// :: 中括号([])里的属性为依赖项
// this.selectComponent('#share_canvas').draw({
//     background:{
//         // 背景颜色 非必填
//         backgroundColor: '#ca0c16',
//         // 图片地址 非必填
//         backgroundImage: 'https://cdn.mengshu.com/miniprograms/qiangbao/bg.png',
//         // 背景宽度 非必填 默认画布宽度 单位统一rpx
//         width: null,
//         // 背景高度 非必填 默认画布高度
//         height: null,
//         // 是否本地图片 非必填 默认false  网络图片会自动进行下载
//         local: false
//     },
//     fonts:[
//         {
//             // 文字内容 必填
//             content: 'this is second text',
//             // 文字大小 非必填 默认30rpx
//             fontSize: 40,
//             // 文字颜色 非必填 默认#000
//             color: '#1AAD16',
//             // 文字宽度
//             width: 542,
//             // 截取行数，需要设置文字宽度
//             rowSize: 2,
//             // x轴位置 必填
//             x: 400,
//
//             // y轴位置 必填。
//             // 组件内暂未添加字体高度，即需要 (orgin y) + (font height) = y
//             y: 120,

//             // 文字对齐方式 非必填. [defualt: left|center|right]
//             // 适用于将 x 定位在指定位置后，居中是冲 x 坐标向两侧延伸
//             textAlign: 'center',
//             // [font.width] 在 font.x 不变的情况下，通过计算 font.width 来进行文字居中,
//             // 通过计算 font.width 来进行文字居中
//             textCenter: false,
//             // 行间距
//             lineGap: 4
//         }
//     ],
//     graphs:[
//         {
//             // 背景颜色 非必填 默认#fff
//             backgroundColor: '#ca0c16',
//             //图片宽度 必填
//             width: 100,
//             // 图片高度 必填
//             height: 100,
//             // x轴位置 必填
//             x: 400,
//             // y轴位置 必填
//             y: 120,
//             // 是否圆形
//             circle: false,
//             // 圆角
//             radius: 0,
//         }
//     ],
//     images:[
//         {
//             // 图片地址 必填
//             url: '../../images/logo.png',
//             // 背景颜色 非必填
//             backgroundColor: '#ca0c16',
//             // 图片宽度 必填
//             width: 100,
//             // 图片高度 必填
//             height: 100,
//             // x轴位置 必填
//             x: 200,
//             // y轴位置 必填
//             y: 200,
//             // 圆形图片 非必填 默认false 用于圆形头像
//             clipCircle: true,
//             // 是否本地图片 非必填 默认false  网络图片会自动进行下载
//             local: true,
//             // 圆角
//             radius: 0,
//         }
//     ]
// })

// 获取图片缓存地址
// this.selectComponent('#share_canvas').canvasToTempFilePath(res=>{
//     this.setData({
//         shareImage: res
//     })
// });
