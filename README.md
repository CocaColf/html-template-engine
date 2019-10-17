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
    <%  if(this.isHappy) { %>
        <p>看书: <% bookName %></p>
    <% } %>
    
    <% else {%>
        <div><% saySomething %></div>
    <% } %>
    `
   
let parsedHTML = tplEngine(tpl, {
    title: '今天干嘛?',
    isHappy: true,
    bookName: '《1984》',
    saySomething: '睡觉，睡觉'
});
```

这里是我的一个真实需求的解决:
