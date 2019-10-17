### 背景

功能中包含一个历史申请记录的显示页面，简笔画简单画了一下，如下所示：


![panel](https://user-images.githubusercontent.com/25732253/66994814-7bc03980-f100-11e9-8edc-e4b5427b8ebb.jpg)

不知道多久没写过字了，画下来的东西着实丑，既然不能绘色，那就绘声一下。
每一条记录对应一个面板，每一个面板上呈现着对应记录的信息。那么不同的审批状态，就有很多东西不一样：

1. 数据，这个没得说
2. 内容的样式。比如审批成功用绿色标识，失败是红色
3. 操作。比如审批中，那么就有一个撤销申请的按钮；其他的状态，就没有这个按钮，但是有一个面板折叠的按钮
4. 面板左侧有状态条，反映当前的状态，同时也是时间线的作用
5. 。。。

这个历史申请的数据是用XML格式传递的，如下所示：

```xml
<?xml version=\"1.0\" encoding=\"utf-8\"?>
	<Expansion>
		<Result>0</Result>
		<ApplicationRecord>
		<record 
			id="1" 
			status="0" 
			apply_cpu="4" 
			apply_mem="8" 
			apply_disk="256" 
			apply_time="2019-10-14 20:00" 
			approve_time="2019-10-15 15:00" 
			apply_reason="卡得不能用了"
			approve_reason="满足你"
			admin_name="XXX" 
			admin_phone="2333333" 
			admin_email="test@gmail.com"/>

			<record 
			id="2" 
			status="2" 
			apply_cpu="4" 
			apply_mem="8" 
			apply_disk="256" 
			apply_time="2019-10-14 20:00" 
			approve_time="2019-10-15 15:00" 
			apply_reason="卡得不能用了"
			approve_reason="那就继续卡着吧"
			admin_name="XXX" 
			admin_phone="2333333" 
			admin_email="test@gmail.com"/>
		</ApplicationRecord>
	</Expansion>
```

所以很明显，要去遍历解析这个XML，去循环创建面板，再根据每条记录里对应的字段，写上正确的内容以及设置不同的样式。

由于某些原因，没有使用任何样式库或者框架，使用原生js编写。

以上是背景。

### 思路

当然这个需求没有难点，最一般的方法，当然就是html字符串拼接，在大量的 js if else逻辑里，将不同的数据和html片段拼接起来。其中一个片段可能是这样：

```js
var data = {};  // 数据
var str = '';   // html拼接

if(data.status === '0') {
    str += '<p class="fail">审核失败</p>'
} else if(data.status === '1') {
    str += '<p class="ing">审核中</p>'
} else if
```

这种写法会让整个代码逻辑显得很乱，整个html片段也是分散的，不便于后期维护，别人看这份代码也不能够一眼看明白到底做了什么。这个需求如果是使用Vue这种现代化框架，可以良好的使用诸如 v-if 等指令来完成，然而这里并不能使用现代化框架来开发。

我的期望解决方式是：

+ html是完整写在一起的，而不是分散拼接的

+ 我只需要传入对应的数据，一个符合状态的面板就创建好了

于是就编写了一个简单的模板引擎来解决这个问题，它对外是一个函数，使用的方式如下:

```js
// tpmplate是html片段，第二个参数是数据
tplEngine(template, {
    status: 1,
    applyTime: '2019-10-17',
    applyCpu: 'XXX',
    ......
});
```

那么html片段是这个样子的:

```js
var template = `
    <div class="<% statusClass %>" > <%statusWords %> </div>
    <span>申请时间: <% applyTime %> </span>

    <% if(this.status !== 1) {%>
        <div>
            撤销申请
        </div>
    <% } %>

    <% else {%>
        <div>
            折叠面板的按钮
        </div>
    <% } %>
`
```

虽然嵌入了一些奇怪的东西，但是很明显：

1. html是完整的写在一起的，一眼就能看懂
2. 嵌入的部分是数据和js语法，不影响阅读习惯，逻辑很清晰
3. 内容很灵活的根据传入的数据改变而改变，不需要自己去做其他任何操作

### 结果

通过这样封装，那么最后完成这个需求的代码就很简单和清晰了,伪代码如下:

```js
// 定义好模板
var tpl = '<div>.......';

// 解析数据，得到所有的申请记录 data
var data = parseXML();

// 遍历data创建面板
data.each(function(index, item) {
    // 这一行代码就得到了创建好的面板
    var panel = tplEngine(tpl, item);

    $('pannel-container').append(panel);
});
```

### 实现原理

使用正则表达式，讲模板数据、js语法关键字、普通字符串匹配出来，然后把他们组成成Javascript语句。这些语句组成起来就是一个函数的具体实现，然后把这个函数的作用域设置在我们传入的数据对象上。

```js
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
};
```