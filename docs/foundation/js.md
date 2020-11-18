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

  

OK ，其实JS的事件机制也没那么难，现在我们来看个题目：

```js
function f2() {
    setTimeout(() => {
        console.log(5)
        Promise.resolve().then(() => {
            console.log(6)
        })
    })
    new Promise((resolve, reject) => {
        console.log(1)
        resolve(1)
    }).then(() => {
        console.log(2)

        Promise.resolve().then(() => {
            console.log(3)
        })

        setTimeout(() => {
            console.log(4)
        })

        Promise.resolve().then(() => {
            console.log(7)
        })
    })
    Promise.resolve().then(() => {
        console.log(8)
    })
}
> 1 2 8 3 7 5 6 4
```

有一点点复杂，但是也不是太复杂。

1. 主线程进入，第一个setTimeOut是宏任务，那你就到下一次事件循环等着吧。然后Promise里面是同步的，打印1。紧接着就来了resolve，那这个new Promise的then去微任务等着吧（微任务1）。接着执行同步代码，到了8的Promise.resolve().then，那你的回调到微任务里等着（微任务2）。后面没代码了，开始执行这一轮的微任务队列。
2. 按顺序，先读微任务1，进来直接打印2，接着读到了3的 Promise.resolve().then ，那你的回调到微任务里去（微任务3），接着是setTimeout的4，这个是宏任务，先放到下一次事件循环里。下面又是一个7的Promise.resolve().then，那你也去微任务（微任务4）。现在微任务1执行完了，微任务里总共还有三个任务。
3. 按照微任务的顺序，依次是8，3，7。这一轮的微任务清空了，开始下一轮事件循环。
4. 5早就在这等着了，打印5。然后在执行下一次宏任务前需要例行检查，是否有微任务，咦？这一轮还真有一个微任务等着，打印6。微任务清空，开始下一轮事件循环。
5. 事件循环里只有一个4，打印4，结束。

## JS原生方法

### 1. call

### 语法

```js
function.call(thisArg, arg1, arg2, ...)
```

### 返回值 

使用参数提供的this值和参数(thisArg, arg1, arg2)，调用该函数(function)的返回值。若该方法没有返回值，则返回 `undefined`。

### 使用场景

`call() `提供新的 this 值给当前调用的函数/方法。你也可以使用 call 来实现继承：写一个方法，然后让另外一个新的对象来继承它（而不是在新对象中再写一次这个方法）。

一般来说，this值的指向都是被调用的地方，比如被对象调用，被函数调用，或者直接执行也就是被全局环境调用，只有在箭头函数里面比较特殊，是指向上下文。

但是**call函数直接修改this的指向为call方法传入的第一个参数**。

下面的代码可以很简单的说明：

```js
var test = {
    name: 'test'
}
var test1 = {
    name: 'test1',
    fn: function () {
        console.log(this.name)
    }
}
test1.fn.call(test);
> 'text'
```

用call也可以实现继承：

```js
function Product(name, price) {
  this.name = name;
  this.price = price;
}
function Food(name, price) {
  Product.call(this, name, price);
  this.category = 'food';
}
var cheese = new Food('feta', 5);
console.log(cheese);
> {category: "food",name: "feta",price: 5}

```

**手写call的实现** (币安面试题) ：

理解了就很简单，其实核心目的很简单，就是把call函数的调用者的this指向，改为call方法传入的第一个参数的this。

那么我们只需要把调用者先卖身给这个参数，然后执行，那么执行的时候this自然就是参数的this，最后我们再把参数上添加的这个调用者清除掉，一别两清，参数恢复原样，调用者也偷到了参数的内部this。

```js
var test={
  name:'liujiawei'
}
var test1={
  name:'wuyifan',
  fn:function(){
    console.log(this.name);
  }
}
test1.fn.mycall=function(context){
  let context=context || window; //不传参数时的降级处理
  context.fn=this;  // this就是test1.fn这个函数
  let args=[...arguments].splice(1); // 第一个参数是context，后面的参数是其他参数
  let result=context.fn(args); // 执行context.fn，所以fn里面的this的指向当然就是传入的参数context啦
  delete context.fn; //记得恢复context哦
  return result; // 返回的结果为context.fn函数的返回结果
}

test1.fn.call(test);
> 'liujiawei'
```

### 2. apply

### 3. flat

手写flat的实现 (币安面试题)：

递归方法

```js
let array=[[-1], 1, [2], [3, 4, 7, [7]]];
function flatten(array){
  let res=[];
  array.forEach(data=>{
    if(Array.isArray(array)){
      res=res.concat(flatten(data)) 
    }else{
      res.push(data);
    }
  });
  return res;
}
> [-1, 1, 2, 3, 4, 7, 7]
```

### 4. Instance_of（币安面试题）

一张图就可以充分的解释清楚JS里绕晕了无数人的原型链：

![Image](../assets/prototype.png)

手写instanceOf方法:

```js
function instance_of(L,R){
   let proto = L.__proto__; 
   let prototype = R.prototype; 
   while(true){
      if(proto===null){return false;} //找到原型链的终点了，和R的原型函数也不一样，说明两者不同，不是一路人，返回false
      if(proto===prototype){return true;} //L的原型（或者原型的原型，不管多少级）和R相同，说明两者同出一脉，返回true
      proto=proto.__proto__; // 往上找L的原型，一直到出结果
  }
}

function A() { }
var a = new A();
function B(){};
instance_of(a,A); // true
instance_of(a,Object); //true
instance_of(a,B); //false
```

另外我们可以测试:

```js
instance_of(Object,Function); // Object.__proto__===Function.prototype
instance_of(Function,Object); // Function.prototype.__proto__===Object.prototype
```

至于为什么是这样的，看上面那张图就一目了然了。直接的原因就是上面代码注释的部分。

## Flow

Flow 使用类型接口查找错误，甚至不需要任何类型声明。 它也能够准确地跟踪变量的类型，就像运行时那样。

Flow 能在 JS 运行前找出常见的 bug，包括：

- 自动类型转换,
- `null` 引用,
- 可怕的 `undefined is not a function`.

带有 Flow 类型注解的 JS 代码可以 [简单转化](https://zhenyong.github.io/flowtype/docs/running.html) 为常规的 JS 代码，所以随处运行

```javascript
// @flow
function bar(x): string {
  return x.length;
}
bar('Hello, world!');
```

第一行，我们添加了 `// @flow`，用来告诉 Flow 你得检查我这个文件。**如果不加这个注释， Flow 就认为这个文件还没准备好，先不检查它**

Flow 虽然给出了类型错误提示，但是它不会禁止代码运行。当然，按照最佳实践， 如果有类型错误的话就绝不发布，不过在开发阶段，即便还没完美解决 Flow 的提醒，你还是会经常运行代码的（ 特别是 调试/随机测试 ）。这就是 [Gradual typing](https://en.wikipedia.org/wiki/Gradual_typing) 的好处之一，Flow 的设计如此，让你在开发期间，不受到任何耽误

### 运行Flow代码

因为类型注解不是 Js 规范的一部分，所以我们得移除它，建议使用 [Babel](http://babeljs.io/) 。

安装 Babel 命令行工具：

```shell
npm install -g babel-cli
```

安装 Flow 转换器 `babel-plugin-transform-flow-strip-types`，添加一个 `.babelrc` 文件到项目根目录，用来告诉 Babel 要 移除 Flow 注解：

```shell
cd /path/to/my/project

mkdir -p node_modules && npm install babel-plugin-transform-flow-strip-types

echo '{"plugins": ["transform-flow-strip-types"]}' > .babelrc
```

使用 `babel` 命令，在后台启动转换器

```shell
babel --watch=./src --out-dir=./build
```

这样子babel 会在后台运行，当发现 `src/` 目录下的文件改变时， 就会创建相应的正常的 Js 版本，保存在 `build/` 目录下

