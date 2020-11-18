# 框架

## Vue中`plugin`和`mixins`的区别

区别在于，对于需要该功能的每个组件，必须在vm定义的mixin hash中引入这个mixin。plugin使它在所有组件中全局可用，而无需引入（因为它扩展了主Vue实例，因此您创建的每个组件都已包含此功能）

Mixins通常会单独添加到组件中，除非大多数组件都需要该功能。

当然了，我们也可以创建全局Mixin，但是从Vue的官方文档中，是不建议这么做的。官方文档是这么说的：

谨慎使用全局mixins，因为它会影响创建的每个Vue实例，包括第三方组件。 在大多数情况下，仅应将其用于自定义选项处理(custom option handling )，如下例所示。 推荐将其作为**插件**发布，以避免重复应用混入。

``` js
// inject a handler for `myOption` custom option
Vue.mixin({
    created: function() {
        var myOption = this.$options.myOption
        if (myOption) {
            console.log(myOption)
        }
    }
})

new Vue({
    myOption: 'hello!'
})
// => "hello!"
```

因此，在一般情况下，对于需要全局使用的方法/处理函数，我们还是使用Plugin的方式。

Plugin暴露一个install接口，里面包含一些选项，然后使用Vue.use()即可。

``` js
const plugin = {
    install() {
        Vue.prototype.$helpers = helpers; //helpers可能是你自己的全局方法JS文件
        // 2. add a global asset
        Vue.directive('my-directive', {
            bind(el, binding, vnode, oldVnode) {
                // some logic ...
            }
        })

        // 3. inject some component options
        Vue.mixin({
            created: function() {
                // some logic ...
            }
        })
    }
}

Vue.use(plugin);
```


另外，其实我们应该谨慎考虑使用`mixins`:

1. Mixin 引入了隐式依赖关系。JavaScript是一种动态语言，所以很难执行或记录这些依赖关系。与组件不同，mixin不构成层次结构：它们被夷为平地并在相同的名称空间中运行。
2. Mixins导致名称冲突。因为一个名称相同的方法可能已经存在于一些使用它的组件。mixin很难删除或更改。不好的想法不会被重构，因为重构风险太大。
3. Mixin导致复杂的滚雪球。逐渐地，封装边界逐渐消失，由于很难改变或移除现有的混合，他们不断变得抽象，直到没人理解它们是如何工作的。

## Vue中`$nextTick`和`setTimeout`的区别

nextTick 源码在 src/core/util/next-tick.js 里面。

在vue的next-tick实现中使用了几种情况来延迟调用该函数，首先我们会判断我们的设备是否支持Promise对象，如果支持的话，会使用 Promise.then 来做延迟调用函数。如果设备不支持Promise对象，再判断是否支持 MutationObserver 对象，如果支持就使用MutationObserver来做延迟，如果不支持的话，我们会使用setImmediate，如果不支持setImmediate的话， 会使用setTimeout 来做延迟操作。

所以，setImmediate和setTimeout这两种宏任务可以看作是降级处理，一般情况都不会用到。

#### JS中的Event Loop

我们都明白，javascript是单线程的，所有的任务都会在主线程中执行的，当主线程中的任务都执行完成之后，系统会 "依次" 读取任务队列里面的事件，因此对应的异步任务进入主线程，开始执行。

但是异步任务队列又分为: macrotasks(宏任务) 和 microtasks(微任务)。 他们两者分别有如下API:

* macrotasks(宏任务): setTimeout、setInterval、setImmediate、I/O、UI rendering 等。
* microtasks(微任务): Promise、process.nextTick、MutationObserver 等。

promise的then方法的函数会被推入到 microtasks(微任务) 队列中(Promise本身代码是同步执行的)，而setTimeout函数会被推入到 macrotasks(宏任务) 任务队列中，在每一次事件循环中 macrotasks(宏任务) 只会提取一个执行，而 microtasks(微任务) 会一直提取，直到 microtasks(微任务)队列为空为止。

也就是说，如果某个 microtasks(微任务) 被推入到执行中，那么当主线程任务执行完成后，会循环调用该队列任务中的下一个任务来执行，直到该任务队列到最后一个任务为止。而事件循环每次只会入栈一个 macrotasks(宏任务), 主线程执行完成该任务后又会循环检查 microtasks(微任务) 队列是否还有未执行的，直到所有的执行完成后，再执行 macrotasks(宏任务)。 依次循环，直到所有的异步任务完成为止。

现在我们来看一个简单的例子分析一下：

``` js
    console.log(1);
    setTimeout(function() {
        console.log(2);
    }, 0);
    new Promise(function(resolve) {
        console.log(3);
        for (var i = 0; i < 100; i++) {
            i === 99 && resolve();
        }
        console.log(4);
    }).then(function() {
        console.log(5);
    });
    console.log(6);
```

打印结果：

``` 

1
3
4
6
5
2
```

再试试这个复杂点的例子：

``` js
  console.log(1);
  setTimeout(function() {
      console.log(2);
  }, 10);
  new Promise(function(resolve) {
      console.log(3);
      for (var i = 0; i < 10000; i++) {
          i === 9999 && resolve();
      }
      console.log(4);
  }).then(function() {
      console.log(5);
  });
  setTimeout(function() {
      console.log(7);
  }, 1);
  new Promise(function(resolve) {
      console.log(8);
      resolve();
  }).then(function() {
      console.log(9);
  });
  console.log(6);
```

打印结果：

``` 

1
3
4
8
6
5
9
7
2
```

值得一提的是，微任务执行完成后，就执行第二个宏任务setTimeout，由于第一个setTimeout是10毫秒后执行，第二个setTimeout是1毫秒后执行，因此1毫秒的优先级大于10毫秒的优先级，因此最后分别打印 7, 2 了

而很多人会发现**vue中的nextTick会比setTimeout优先级高**，就是因为nextTick是以微任务Promise.then优先的。

**Vue的特点之一就是能实现响应式，但数据更新时，DOM不会立即更新，而是放入一个异步队列中，因此如果在我们的业务场景中，有一段代码里面的逻辑需要在DOM更新之后才能顺利执行，这个时候我们可以使用this.$nextTick() 函数来实现。**

分析nextTick的源码(Vue2.6.10)：

``` js
/* @flow */
/* globals MutationObserver */

import {
    noop
} from 'shared/util'
import {
    handleError
} from './error'
import {
    isIE,
    isIOS,
    isNative
} from './env'

export let isUsingMicroTask = false

const callbacks = [] //用来存储所有需要执行的回调函数
let pending = false //该变量的作用是表示状态，判断是否有正在执行的回调函数。

function flushCallbacks() {
    pending = false
    const copies = callbacks.slice(0)
    callbacks.length = 0
    for (let i = 0; i < copies.length; i++) {
        copies[i]()
    }
}

let timerFunc

// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
    const p = Promise.resolve()
    timerFunc = () => {
        p.then(flushCallbacks)
        // In problematic UIWebViews, Promise.then doesn't completely break, but
        // it can get stuck in a weird state where callbacks are pushed into the
        // microtask queue but the queue isn't being flushed, until the browser
        // needs to do some other work, e.g. handle a timer. Therefore we can
        // "force" the microtask queue to be flushed by adding an empty timer.
        if (isIOS) setTimeout(noop)
    }
    isUsingMicroTask = true
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
        isNative(MutationObserver) ||
        // PhantomJS and iOS 7.x
        MutationObserver.toString() === '[object MutationObserverConstructor]'
    )) {
    // Use MutationObserver where native Promise is not available,
    // e.g. PhantomJS, iOS7, Android 4.4
    // (#6466 MutationObserver is unreliable in IE11)

    let counter = 1
    const observer = new MutationObserver(flushCallbacks)
    const textNode = document.createTextNode(String(counter))
    observer.observe(textNode, {
        characterData: true
    })
    timerFunc = () => {
        counter = (counter + 1) % 2
        textNode.data = String(counter)
    }

    // timerFunc函数执行时会导致文本节点textNode的数据发生改变，因为MutationObserver对象在监听文本节点，
    //所以进而也就会触发flushCallbacks回调函数
    isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
    // Fallback to setImmediate.
    // Techinically it leverages the (macro) task queue,
    // but it is still a better choice than setTimeout.
    timerFunc = () => {
        setImmediate(flushCallbacks)
    }
} else {
    // Fallback to setTimeout.
    timerFunc = () => {
        setTimeout(flushCallbacks, 0)
    }
}

export function nextTick(cb ? : Function, ctx ? : Object) {
    let _resolve
    callbacks.push(() => {
        if (cb) {
            try {
                cb.call(ctx)
            } catch (e) {
                handleError(e, ctx, 'nextTick')
            }
        } else if (_resolve) {
            _resolve(ctx)
        }
    })
    if (!pending) {
        pending = true
        timerFunc()
    }

    //如果cb不是一个函数的话, 那么会判断是否有_resolve值, 有该值就使用Promise.then() 这样的方式来调用。比如: this.$nextTick().then(cb) 这样的使用方式。
    if (!cb && typeof Promise !== 'undefined') {
        return new Promise(resolve => {
            _resolve = resolve
        })
    }
}
```

#### MutationObserver

MutationObserver是监听DOM变动的接口，DOM发生任何变动，MutationObserver会得到通知。在Vue中是通过该属性来监听DOM更新完毕的。

它和事件类似，但有所不同，事件是同步的，当DOM发生变动时，事件会立刻处理，但是 MutationObserver 则是异步的，它不会立即处理，而是等页面上所有的DOM完成后，会执行一次，如果页面上要操作100次DOM的话，如果是事件的话会监听100次DOM，但是我们的 MutationObserver 只会执行一次，它是等待所有的DOM操作完成后，再执行。

MutationObserver 构造函数

``` js
var observer = new MutationObserver(callback);
```

观察器callback回调函数会在每次DOM发生变动后调用，它接收2个参数，第一个是变动的数组，第二个是观察器的实列。

MutationObserver实例的方法

observe() ：该方法是要观察DOM节点的变动的。该方法接收2个参数，第一个参数是要观察的DOM元素，第二个是要观察的变动类型。

``` js
observer.observe(dom, options);
```

options 类型有如下：

* childList: 子节点的变动。
* attributes: 属性的变动。
* characterData: 节点内容或节点文本的变动。
* subtree: 所有后代节点的变动。

需要观察哪一种变动类型，需要在options对象中指定为true即可；但是如果设置subtree的变动，必须同时指定childList, attributes, 和 characterData 中的一种或多种。

## `watch`和`computed`的区别

### watch的使用场景

当在data中的某个数据发生变化时, 我们需要做一些操作, 或者当需要在数据变化时执行异步或开销较大的操作时, 我们就可以使用watch来进行监听。

对于dialog需要每次打开都执行一段逻辑的情景，目前暂时使用watch，等我再研究研究看有没有替代方案。

* 谨慎使用deep为true，性能开销会非常大。
* immediate:true的话, 第一次页面加载的时候也会执行watch的handler函数。

### computed的使用场景

1. 使模板中的逻辑更清晰, 方便代码管理。
2. 计算之后的值会被缓存起来, 依赖的data值改变后会重新计算。

### computed 为什么要缓存

优化性能，避免造成性能浪费，提升体验

### computed和methods的区别

``` js
 computed: {
     reversedMsg() {
         // this 指向 vm 实例
         return this.msg.split('').reverse().join('')
     }
 }
```

1. computed 是基于响应性依赖来进行缓存的。只有在响应式依赖发生改变时它们才会重新求值, 以上面的代码为例, 当msg属性值没有发生改变时, **多次访问 reversedMsg 计算属性会立即返回之前缓存的计算结果**, 而不会再次执行computed中的函数。但是methods方法中是**每次调用, 都会执行函数**的, methods它不是响应式的。
2. computed中的成员可以只定义一个函数作为只读属性, 也可以定义成 get/set变成可读写属性, 但是methods中的成员没有这样的。

### coumuted和watch的区别

相同点：他们两者都是观察页面数据变化的。

不同点：computed只有当依赖的数据变化时才会计算, 当数据没有变化时, 它会读取缓存数据。
watch每次都需要执行函数。watch更适用于数据变化时的异步操作。

## OCR识别开源库：tesseract.js

GitHub地址：https://github.com/naptha/tesseract.js#tesseractjs

## Vue里的组件属性`attrs`

* $attrs和$listeners

比如一个父组件：

``` html
template:

<div>
    <div> attrs: {{$attrs}} </div>
    <div> foo: {{foo}} </div>
</div>

js:
props: {
foo: {
type: String,
default: ''
}
}
```

然后在祖先组件里面使用：

``` html
 <father-component :foo="foo" :bar="bar" @event="reciveChildFunc()"></father-component>

     ...

     data() {
     return {
     foo: 'hello world',
     bar: 'kongzhi'
     }
     },
```

注意，我们在父组件里传了俩属性，但是自组件只接收一个 `foo` ，那么另外一个会发生什么呢？

Vue里2.4+版本之后，新增加 `$attrs` 来接收祖先组件传递给父组件中但是未在props对象里面声明的数据。

所以上面的代码$attrs就是:

``` js
{
    bar: 'kongzhi'
}
```

爷组件和孙组件通信，中间的父组件如下：

``` html
<child-component v-bind="$attrs" v-on="$listeners"></child-component>
```

* inheritAttrs，默认为true

而且bar参数默认会把属性放入到我们父组件的根元素上当做一个普通属性：

``` html
<div bar="kongzhi">
```

如果我们不想让未使用的属性放入到父组件的根元素上当做普通属性的话, 我们可以在父组件上把 inheritAttrs 设置为false即可。

``` js
  // 这是新增的代码
  inheritAttrs: false,

      props: {
          foo: {
              type: String,
              default: ''
          }
      },
```

## Vue为什么要异步更新队列？

异步更新队列指的是当状态发生变化时，Vue异步执行DOM更新。


组件内部使用Virtualdom进行渲染，也就是说，组件内部其实是不关心哪个状态发生了变化，它只需要计算一次就可以得知哪些节点需要更新。也就是说，如果更改了N个状态，其实只需要发送一个信号就可以将DOM更新到最新。例如：

```js
this.message = '更新完成'
this.age =  23
this.name = berwin
```

代码中我们分三次修改了三种状态，但其实Vue只会渲染一次。因为`Virtualdom`只需要一次就可以将整个组件的DOM更新到最新，它根本不会关心这个更新的信号到底是从哪个具体的状态发出来的。

那如何才能将渲染操作推迟到所有状态都修改完毕呢？很简单，只需要将渲染操作推迟到本轮事件循环的最后或者下一轮事件循环。也就是说，只需要在本轮事件循环的最后，等前面更新状态的语句都执行完之后，执行一次渲染操作。这样无论前面写了多少条更新状态的语句，只在最后渲染一次就可以了。

将渲染推迟到本轮事件循环的最后执行渲染的时机会比推迟到下一轮快很多，所以Vue优先将渲染操作推迟到本轮事件循环的最后(`微任务`)，如果执行环境不支持会降级到下一轮（`宏任务`）。

当然，Vue的变化侦测机制决定了它必然会在每次状态发生变化时都会发出渲染的信号，但Vue会在收到信号之后检查队列中是否已经存在这个任务。如果队列中不存在则将渲染操作添加到队列中，这样可以保证队列中不会有重复。

之后通过异步的方式延迟执行队列中的所有渲染的操作（`微任务`）并清空队列。当同一轮事件循环中反复修改状态时，并不会反复向队列中添加相同的渲染操作。

所以我们在使用Vue时，修改状态后更新DOM都是异步的。

问题1:

解释下面代码
```js
new Vue({
  // ...
  methods: {
    // ...
    example: function () {
      // 先使用nextTick注册回调
      this.$nextTick(function () {
        // DOM没有更新
      })
      // 后修改数据
      this.message = 'changed'
    }
  }
})
```
因为Vue更新dom是异步的，而且是优先加入微任务队列的，所以这里nextTick获取dom因为也是微任务队列，而且位于修改状态的语句之前，所以nextTick的执行顺序是在状态修改之前的。故而此时dom还未更新。

所以使用nextTick获取dom的代码都应该在更新状态的代码之后。

问题2:

解释下面代码
```js
new Vue({
  // ...
  methods: {
    // ...
    example: function () {
      // 先使用setTimeout向宏任务中注册回调
      setTimeout(_ => {
        // DOM现在更新了
      }, 0)
      // 后修改数据向微任务中注册回调
      this.message = 'changed'
    }
  }
})

```
因为setTimeout是宏任务，他的执行顺序在微任务之后，所以他的代码顺序是无所谓的。即使状态修改的代码位于setTimeout回调的后面，他也会先于setTimeout执行。

## Vue的模版编译

参考文章：

[博客文章](https://github.com/berwin/Blog/issues/18)

## Vue的VirtualDOM

[ 最好的、最容易理解的讲VirtualDOM的PPT](https://ppt.baomitu.com/d/2afbd5b9#/)

## Vue的变化侦测

参考文章：

- [博客文章](https://github.com/berwin/Blog/issues/17)

- [深入浅出Vue.js对象的变化侦测章节](https://www.ituring.com.cn/book/tupubarticle/29448)

### 什么是变化侦测

Vue.js会自动通过状态生成DOM，并将其输出到页面上显示出来，这个过程叫渲染。Vue.js的渲染过程是声明式的，我们通过模板来描述状态与DOM之间的映射关系。

通常，在运行时应用内部的状态会不断发生变化，此时需要不停地重新渲染。这时如何确定状态中发生了什么变化？

变化侦测就是用来解决这个问题的，它分为两种类型：一种是“推”（push），另一种是“拉”（pull）。

Angular和React中的变化侦测都属于“拉”，这就是说当状态发生变化时，它不知道哪个状态变了，只知道状态有可能变了，然后会发送一个信号告诉框架，框架内部收到信号后，会进行一个暴力比对来找出哪些DOM节点需要重新渲染。这在Angular中是脏检查的流程，在React中使用的是虚拟DOM。

而Vue.js的变化侦测属于“推”。当状态发生变化时，Vue.js立刻就知道了，而且在一定程度上知道哪些状态变了。因此，它知道的信息更多，也就可以进行更细粒度的更新。

所谓更细粒度的更新，就是说：假如有一个状态绑定着好多个依赖，每个依赖表示一个具体的DOM节点，那么当这个状态发生变化时，向这个状态的所有依赖发送通知，让它们进行DOM更新操作。相比较而言，“拉”的粒度是最粗的。

但是它也有一定的代价，因为粒度越细，每个状态所绑定的依赖就越多，依赖追踪在内存上的开销就会越大。因此，从Vue.js 2.0开始，它引入了虚拟DOM，将粒度调整为中等粒度，即一个状态所绑定的依赖不再是具体的DOM节点，而是一个组件。这样状态变化后，会通知到组件，组件内部再使用虚拟DOM进行比对。这可以大大降低依赖数量，从而降低依赖追踪所消耗的内存。

Vue.js之所以能随意调整粒度，本质上还要归功于变化侦测。因为“推”类型的变化侦测可以随意调整粒度。

### 如何追踪变化

Object.defineProperty和ES6中的Proxy

### Observer

Observer类会附加到每一个被侦测的object上。一旦被附加上，Observer会将object的所有属性转换为getter/setter的形式。来收集属性的依赖，并且当属性发生变化时会通知这些依赖

```javascript
import Dep from './Dep';

export class Observer {

    constructor(value) {
        this.value = value;
        if (!Array.isArray(value)) {
            this.walk(value);
        }
    }
    walk(obj) {
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i], obj[keys[i]])
        }
    }
}

function defineReactive(data, key, val) {
    if (typeof val === 'object') {
        new Observer(val);
    }
    let dep = new Dep();
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get() {
            dep.depend();//收集依赖
            return val
        },
        set(newVal) {
            if (val === newVal) {
                return
            }
            val = newVal;
            dep.notify();//触发依赖
        }
    })
}
```

### Dep

它用来收集依赖、删除依赖和向依赖发送消息等。

```javascript
import { Watcher } from "./Watcher";

export  class Dep {
    target; //target: ?Watcher;
    constructor() {
        this.subs = [];
    }

    addSub(sub) {
        this.subs.push(sub);
    }

    removeSub(sub) {
        remove(this.subs, sub);
    }
  
    depend(){
        if(this.target instanceof Watcher){
            this.addSub(this.target);
        }
    }

    notify(){
        const subs=this.subs.slice();
        for (let i = 0; i < subs.length; i++) {
            subs[i].update();
        }
    }
}

function remove(arr, item) {
    if (arr.length) {
        const index = arr.findIndex(item);
        if (index > -1) {
            this.subs.splice(index, 1);
        }
    }
}
```

### Watcher

`Watcher`是一个中介的角色，数据发生变化时通知它，然后它再通知其他地方。

```js
import { Dep } from "./Dep";

export class Watcher {
    constructor(vm, expOrFn, cb) {
        this.vm = vm;// vm指当前的Vue实例
        this.getter = parsePath(expOrFn);
        this.cb = cb;
        this.value = this.get();// 读取vm.$data中的值，同时会触发属性上的getter
    }

    get() {
        // Watcher把自己设置到全局唯一的指定位置，在这里就是Dep.target
        Dep.target = this;
        //读取数据，触发这个数据的getter。因此Observer会收集依赖，将这个Watcher收集到Dep，也就是依赖收集。
        let value = this.getter.call(this.vm, this.vm);
        //收集结束，清除Dep.target的内容
        Dep.target = null;
        //返回读取到的数据值
        return value
    }

    update() {
        //数据改变之后，Dep会依次循环向依赖发通知，这里接到通知之后，先获取之前的旧数据
        const oldValue = this.value;
        //然后获取最新的值
        this.value = this.get();
        //将新旧值传给回调函数
        this.cb.call(this.vm, this.value, oldValue);
    }
}

const bailRE = /[^\w.$]/
export function parsePath(path) {
    if (bailRE.tetx(path)) {
        return
    }
    const segments = path.split('.')
    return function (obj) {
        for (let i = 0; i < segments.length; i++) {
            if (!obj) { return; }
            obj = obj[segments[i]]
        }
        return obj;
    }
}

```

### 总结综述

变化侦测就是侦测数据的变化。当数据发生变化时，要能侦测到并发出通知。

`Object`可以通过`Object.defineProperty`将属性转换成getter/setter的形式来追踪变化。读取数据时会触发getter，修改数据时会触发setter。

我们需要在getter中收集有哪些依赖使用了数据。当setter被触发时，去通知getter中收集的依赖数据发生了变化。

收集依赖需要为依赖找一个存储依赖的地方，为此我们创建了`Dep`，它用来收集依赖、删除依赖和向依赖发送消息等。

所谓的依赖，其实就是`Watcher`。只有`Watcher`触发的getter才会收集依赖，哪个`Watcher`触发了getter，就把哪个`Watcher`收集到`Dep`中。当数据发生变化时，会循环依赖列表，把所有的`Watcher`都通知一遍。

`Watcher`的原理是先把自己设置到全局唯一的指定位置（例如`window.target`），然后读取数据。因为读取了数据，所以会触发这个数据的getter。接着，在getter中就会从全局唯一的那个位置读取当前正在读取数据的`Watcher`，并把这个`Watcher`收集到`Dep`中去。通过这样的方式，`Watcher`可以主动去订阅任意一个数据的变化。

此外，我们创建了`Observer`类，它的作用是把一个`object`中的所有数据（包括子数据）都转换成响应式的，也就是它会侦测`object`中所有数据（包括子数据）的变化。

由于在ES6之前JavaScript并没有提供元编程的能力，所以在对象上新增属性和删除属性都无法被追踪到。

### Data、Observer、Dep和Watcher之间的关系

`Data`通过`Observer`转换成了getter/setter的形式来追踪变化。

当外界通过`Watcher`读取数据时，会触发getter从而将`Watcher`添加到依赖中。

当数据发生了变化时，会触发setter，从而向`Dep`中的依赖（`Watcher`）发送通知。

`Watcher`接收到通知后，会向外界发送通知，变化通知到外界后可能会触发视图更新，也有可能触发用户的某个回调函数等。

![Image](../assets/watch-observer.png)

### 如何进行数组变化侦测

现在又发现了新的问题，`data` 中不是所有的 `value` 都是对象和基本类型，如果是一个数组怎么办？数组是没有办法通过 `Object.defineProperty` 来侦测到行为的。

vue 中对这个数组问题的解决方案非常的简单粗暴，vue是如何实现的，大体上分三步：

第一步：先把原生 `Array` 的原型方法继承下来。

第二步：对继承后的对象使用 `Object.defineProperty` 做一些拦截操作。

第三步：把加工后可以被拦截的原型，赋值到需要被拦截的 `Array` 类型的数据的原型上。

。。。有待继续补充关于数组的变化侦测实现原理部分

