# Javascript

##  Object.assign()和深浅拷贝

1）浅拷贝

``` js
let user = {
    name: "John",
    age: 30
};

let cloneUser = Object.assign({}, user);
```

如果user里面有个属性为对象，那么assign对深层次的拷贝为对象地址的引用，例如：

``` js
let user = {
    name: "John",
    age: 30,
    sizes: {
        height: 182,
        width: 50
    }
};

let cloneUser = Object.assign({}, user);

user.sizes.width++;

console.log(cloneUser.sizes.width) // 51
```

这种嵌套对象的拷贝使用引用的方式拷贝的，称为“浅拷贝”。拷贝的是对象的引用（内存地址），而不是这个对象本身。

因此对这个引用的修改，都是作用在同一个对象上的，会导致你不想修改的对象也发生修改。

值类型（字符串，数字，布尔值）和引用类型。对值类型的拷贝都是直接拷贝原始值的，所以不会出现这个问题。

为了解决此问题，我们应该使用会检查每个 user[key] 的值的克隆循环，如果值是一个对象，那么也要复制它的结构。这就叫“深拷贝”。

我们可以自己实现，或者使用loadsh的_.cloneDeep()方法。

2）合并多个对象

``` js
let user = {
    name: "John"
};

let permissions1 = {
    canView: true
};
let permissions2 = {
    canEdit: true
};

let clone = Object.assign(user, permissions1, permissions2);

console.log(clone) // {name: "John",canView: true,canEdit: true}
```

如果被拷贝的属性的属性名已经存在，那么它会被覆盖。

``` js
let user = {
    name: "John"
};

Object.assign(user, {
    name: "Pete"
});

console.log(user.name) //'Pete'
```

## == 和=== 的区别

操作数1 == 操作数2，  操作数1 === 操作数2

比较过程：

　　双等号==： 

　　（1）如果两个值类型相同，再进行三个等号(===)的比较

　　（2）如果两个值类型不同，也有可能相等，需根据以下规则进行类型转换在比较：

　　　　1）如果一个是null，一个是undefined，那么相等

　　　　2）如果一个是字符串，一个是数值，把字符串转换成数值之后再进行比较

　　
　　三等号===:

　　（1）如果类型不同，就一定不相等

　　（2）如果两个都是数值，并且是同一个值，那么相等；如果其中至少一个是NaN，那么不相等。（判断一个值是否是NaN，只能使用isNaN( ) 来判断）

　　（3）如果两个都是字符串，每个位置的字符都一样，那么相等，否则不相等。

　　（4）如果两个值都是true，或是false，那么相等

　　（5）如果两个值都引用同一个对象或是函数，那么相等，否则不相等

　　（6）如果两个值都是null，或是undefined，那么相等

## WeakMap和WeakSet

WeakMap 是类似于 Map 的集合，它仅允许对象作为键，并且一旦通过其他方式无法访问它们，便会将它们与其关联值一同删除。

WeakSet 是类似于 Set 的集合，它仅存储对象，并且一旦通过其他方式无法访问它们，便会将其删除。

它们都不支持引用所有键或其计数的方法和属性。仅允许单个操作。

WeakMap 和 WeakSet 被用作“主要”对象存储之外的“辅助”数据结构。一旦将对象从主存储器中删除，如果该对象仅被用作 WeakMap 或 WeakSet 的键，那么它将被自动清除。

### WeakMap

``` js
let john = {
    name: "John"
};

let weakMap = new WeakMap();
weakMap.set(john, "...");

john = null; // 覆盖引用

// john 被从内存中删除了！
```

WeakMap 只有以下的方法：

* weakMap.get(key)
* weakMap.set(key, value)
* weakMap.delete(key)
* weakMap.has(key)

为什么会有这种限制呢？这是技术的原因。如果一个对象丢失了其它所有引用（就像上面示例中的 john），那么它就会被垃圾回收机制自动回收。但是在从技术的角度并不能准确知道 何时会被回收。

这些都是由 JavaScript 引擎决定的。JavaScript 引擎可能会选择立即执行内存清理，如果现在正在发生很多删除操作，那么 JavaScript 引擎可能就会选择等一等，稍后再进行内存清理。因此，从技术上讲，WeakMap 的当前元素的数量是未知的。JavaScript 引擎可能清理了其中的垃圾，可能没清理，也可能清理了一部分。因此，暂不支持访问 WeakMap 的所有键/值的方法。
　

使用场景：

1. 假如我们正在处理一个“属于”另一个代码的一个对象，也可能是第三方库，并想存储一些与之相关的数据，那么这些数据就应该与这个对象共存亡
2. 当一个函数的结果需要被缓存。用 WeakMap 替代 Map，当对象被垃圾回收时，对应的缓存的结果也会被自动地从内存中清除。

### WeakSet

WeakSet 支持 `add`，`has` 和 `delete` 方法，但不支持 `size`和` keys()`，并且不可迭代。

``` js
let visitedSet = new WeakSet();

let john = {
    name: "John"
};
let pete = {
    name: "Pete"
};
let mary = {
    name: "Mary"
};

visitedSet.add(john); // John 访问了我们
visitedSet.add(pete); // 然后是 Pete
visitedSet.add(john); // John 再次访问

// visitedSet 现在有两个用户了

// 检查 John 是否来访过？
alert(visitedSet.has(john)); // true

// 检查 Mary 是否来访过？
alert(visitedSet.has(mary)); // false

john = null;

// visitedSet 将被自动清理
```

## JS的事件循环机制

JS中存在一个叫做执行栈的东西。JS的所有同步代码都在这里执行，当执行一个函数调用时，会创建一个新的执行环境并压到栈中开始执行函数中的代码，当函数中的代码执行完毕后将执行环境从栈中弹出，当栈空了，也就代表执行完毕。

这里有一个问题是代码中不只是同步代码，也会有异步代码。当一个异步任务执行完毕后会将任务添加到任务队列中。例如：

``` js
setTimeout(_ => {}, 1000)
```

代码中 `setTimeout` 会在一秒后将回调函数添加到任务队列中。事实上异步队列也分两种类型：**微任务**、**宏任务**。

微任务和宏任务的区别是，当执行栈空了，会检查微任务队列中是否有任务，将微任务队列中的任务依次拿出来执行一遍。当微任务队列空了，从宏任务队列中拿出来一个任务去执行，执行完毕后检查微任务队列，微任务队列空了之后再从宏任务队列中拿出来一个任务执行。这样持续的交替执行任务叫做**事件循环**。

属于微任务（microtask）的事件有以下几种：

* Promise.then
* MutationObserver
* Object.observe
* process.nextTick

属于宏任务（macrotask）的事件有以下几种：

* setTimeout
* setInterval
* setImmediate
* MessageChannel
* requestAnimationFrame
* I/O
* UI交互事件
