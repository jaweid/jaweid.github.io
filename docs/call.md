### call

语法

```js
function.call(thisArg, arg1, arg2, ...)
```

### 返回值 

使用调用者提供的 `this` 值和参数调用该函数的返回值。若该方法没有返回值，则返回 `undefined`。

### 使用场景

`call() `允许为不同的对象分配和调用属于一个对象的函数/方法。

`call() `提供新的 this 值给当前调用的函数/方法。你可以使用 call 来实现继承：写一个方法，然后让另外一个新的对象来继承它（而不是在新对象中再写一次这个方法）。

```js

function Product(name, price) {
  this.name = name;
  this.price = price;
}

function Food(name, price) {
  Product.call(this, name, price);
  this.category = 'food';
}

function Toy(name, price) {
  Product.call(this, name, price);
  this.category = 'toy';
}

var cheese = new Food('feta', 5);
var fun = new Toy('robot', 40);

console.log(cheese);

//打印结果：
{
category: "food"
name: "feta"
price: 5
}



```

