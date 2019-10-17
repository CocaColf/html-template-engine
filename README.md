一个简单的html模板引擎。

# 使用方式

```js
// tpl为html模板, data为传入的数据对象
tplEngine(tpl, data);
```

# 例子

```
let tpl = 
    `
    <div><%title%></div>
    <%  var key in arr %>
        <p><% arr[key] %>
    <% } %>
    
    <% if(this.status !== 1) { %>
        <div><% option %></div>
    <% } %>
    <% else {%>
        <div><% saySomething %></div>
    <% } %>
    `
   
let parsedHTML = tplEngine(tpl, {
    title: '例子',
    arr: ['apple', 'orange'],
    option: '重启',
    saySomething: '当前状态良好'
});
```

[这是](https://github.com/CocaColf/html-template-engine/blob/master/real_scene.md)使用它来解决一个真实需求，同时也是因这个需求而编写了这个函数。
