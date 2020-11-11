# CSS

## CSS子元素宽度自动为父容器剩余宽度

``` 
因此猜测是flex布局的问题，进一步猜测省略符需要对父元素限定宽度。
尝试对父元素.content设置width: 100%无效，但是设置width: 0可行。即：

.content {
flex: 1;
width: 0;
}

测试还有一种方法可以达到效果：

.content {
flex: 1;
overflow: hidden；
}

上面的二种方法都可以达到我们需要的效果，即给 content 设置了 flex 为 1 的时候，它会动态的获得父容器的剩余宽度，且不会被自己的子元素把内容撑开。

```

## CSS超出显示省略号

``` 
overflow:hidden;
text-overflow:ellipsis;
white-space: nowrap;
```

这个存在浏览器兼容问题的。
