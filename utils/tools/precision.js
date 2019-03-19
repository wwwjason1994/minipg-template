/**
 * 补0
 * @param {*} num 0个数
 */
function padding0(num) {
    let str = '';
    while (num--) str += '0';
    return str;
}

/**
 * 将科学记数法转为普通字符串
 * @param {Number} number
 */
function noExponent(number) {
    const data = String(number).split(/[eE]/);
    if (data.length == 1) return data[0];

    let z = '';
    const sign = number < 0 ? '-' : '';
    const str = data[0].replace('.', '');
    let mag = Number(data[1]) + 1;

    if (mag < 0) {
        z = sign + '0.';
        while (mag++) z += '0';
        return z + str.replace(/^\-/, '');
    }
    mag -= str.length;
    while (mag--) z += '0';
    return str + z;
}

function split(number) {
    let str;
    if (number < 1e-6) {
        str = noExponent(number);
    } else {
        str = number + '';
    }
    const index = str.lastIndexOf('.');
    if (index < 0) {
        return [str, 0];
    } else {
        return [str.replace('.', ''), str.length - index - 1];
    }
}

/**
 * 计算
 * @param {*} l 操作数1
 * @param {*} r 操作数2
 * @param {*} sign 操作符
 * @param {*} f 精度
 */
function operate(l, r, sign, f) {
    switch (sign) {
        case '+':
            return (l + r) / f;
        case '-':
            return (l - r) / f;
        case '*':
            return (l * r) / (f * f);
        case '/':
            return l / r;
    }
}

/**
 * 解决小数精度问题
 * @param {*} l 操作数1
 * @param {*} r 操作数2
 * @param {*} sign 操作符
 * fixedFloat(0.3, 0.2, '-')
 */
function fixedFloat(l, r, sign) {
    const arrL = split(l);
    const arrR = split(r);
    let fLen = Math.max(arrL[1], arrR[1]);

    if (fLen === 0) {
        return operate(Number(l), Number(r), sign, 1);
    }
    const f = Math.pow(10, fLen);
    if (arrL[1] !== arrR[1]) {
        if (arrL[1] > arrR[1]) {
            arrR[0] += padding0(arrL[1] - arrR[1]);
        } else {
            arrL[0] += padding0(arrR[1] - arrL[1]);
        }
    }
    return operate(Number(arrL[0]), Number(arrR[0]), sign, f);
}

/**
 * 加
 */
function add(l, r) {
    return fixedFloat(l, r, '+');
}

/**
 * 减
 */
function sub(l, r) {
    return fixedFloat(l, r, '-');
}

/**
 * 乘
 */
function mul(l, r) {
    return fixedFloat(l, r, '*');
}

/**
 * 除
 */
function div(l, r) {
    return fixedFloat(l, r, '/');
}

/**
 * 四舍五入
 * @param {*} number
 * @param {*} fraction
 */
function round(number, fraction) {
    return Math.round(number * Math.pow(10, fraction)) / Math.pow(10, fraction);
}

/**
 * 单位换算
 * @author anran758
 * @param { Number } num       金额或者数字
 * @param { Number } decimal   保留几位小数
 * @param { Number } digit     数位
 */
export function conversionUnit(num, decimal = 2, digit = 1000000) {
    let numArr = ((num / digit) || 0).toString().split('.');
    let decimals = numArr[1] || '';

    numArr[1] = decimals.length < decimal ?
        decimals + padding0(decimal - decimals.length) :
        decimals.slice(0, decimal);

    return numArr.join('.');
}

// 数字转万
export function numberToTenThousand(n,digit=2,unit='w',billion={digit:3,unit:'亿'}){
        var num = n * 1
        if(isFinite(num)){
            if(num >= 100000000){
                var result = numberToBillion(num,billion.digit,billion.unit)
                return result
            }else if(num >= 10000){
                var result = (num/10000)
                return result.toFixed(digit) * 1 + unit;
            }else if(num <= -10000){
                var result = -(num/10000)
                return result.toFixed(digit) * -1 + unit;
            }else {
                return num.toFixed(digit) * 1;
            }
        }
}
// 数字转亿
function numberToBillion(n,digit=3,unit='亿'){
    var num = n * 1
    if(typeof num === 'number'){
        if(isFinite(num)){
            var result = (num/100000000)
            return result.toFixed(digit) * 1 + unit;
        }else{
            return num.toFixed(digit) * 1;
        }
    }
}
// 分割数值
export function intervalNum(n,digit=2,interval=','){
    var num = n * 1
    if(isFinite(num)){
        var arr=num.toFixed(digit).split('.')

        var t1=arr[0].split('');
        var t2= arr[1] > 0 ? '.' + (arr[1]*1) : '';
        var result=[],counter=0;
        for(var i=t1.length-1;i>=0;i--){
            counter++;
            result.unshift(t1[i]);
            if((counter%3)==0&&i!=0)
            {
                result.unshift(interval);
            }
        }
        var t3=result.join('')
        var t4=t3 + t2
        return t4
    }else{
        return n
    }
}
// 百分比
export function percent(n,digit=2,retain=2){
    var num = n * 1
    if(isFinite(num)){
        num = ((num * 100).toFixed(digit) * 1).toFixed(retain) + '%'
        return num
    }else{
        return n
    }
}
export default { add, sub, mul, div, round, conversionUnit,
    numberToTenThousand,
    intervalNum,
    percent
};
