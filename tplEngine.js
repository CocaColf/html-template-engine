/**
 * html模板转换
 * @param {String} tpl html模板
 * @param {Object} data 数据
 */
var tplEngine = function(tpl, data) {

    var templateBoundary = /<%([^%]+)?%>/g,     // 模板边界 <% %>
        jsKeyWord = /(^( )?(for|if|else|switch|case|break|{|}))(.*)?/g,     // js关键字匹配出来
        tplToCode = 'var r=[];\n',  // html转化为js代码
        matchedLen = 0;     // 已经处理的长度

    var _addToCode = function(elememt, isJs) {

        // 去除空字符串的影响，否则会导致一些语法，比如 else 没有和if连接起来，出现报错
        if(elememt === '') return;

        // 组装成对应的js语句
        if(isJs) {
            if(elememt.match(jsKeyWord)) {
                tplToCode +=  elememt + '\n';
            } else {
                tplToCode += 'r.push(' + elememt + ');\n';
            }
        } else {
            tplToCode += 'r.push("' + elememt.replace(/"/g, '\\"') + '");\n';
        }
    };

    while (match = templateBoundary.exec(tpl)) {
        // 不存在模板(不需要处理)的部分
        _addToCode(tpl.slice(matchedLen, match.index));

        // 不存在关键字则认为是变量替换
        jsKeyWord.test(match[1]) ? _addToCode(match[1], true) : _addToCode("this." + match[1], true);

        matchedLen = match.index + match[0].length;
    }

    _addToCode(tpl.substr(matchedLen, tpl.length - matchedLen));

    tplToCode += 'return r.join("\n");'; 
    // console.info(code);

    return new Function(tplToCode.replace(/[\r\t\n]/g, '')).apply(data);
}