# 算法与数据结构

参考资料：

[Leetcode知乎的总结](https://www.zhihu.com/question/24964987/answer/586425979)

1. 斐波那契
2. N的阶乘
3. 计算字符串字节长度
4. 最小的三数之和
5. 冒泡排序
6. 快速排序
7. 归并排序

## 快速排序

```js
function quicksort(array){
  if(array.length<=1){return array};
  let left=[];
  let right=[];
  let mid=array.shift();
  for(let i=0;i<array.length;i++){
    if(array[i]<mid){
      left.push(array[i])
    }else{
      right.push(array[i])
    }
  }
  return quicksort(left).concat(mid).concat(quicksort(right));
}
```

## 冒泡排序

```js
//升序
function popersort(array){
   for(let i=0;i<array.length-1;i++){
     for(let j=0;j<array.length-1-i;j++){
        if(array[j]>array[j+1]){//大的在后面
          let temp=array[j+1];
          array[j+1]=array[j];
          array[j]=temp;
        }
     }
   }
  return array;
}

//降序
function popersort(array){
  for(let i=0;i<array.length-1;i++){
    for(let j=0;j<array.length-1-i;j++){
      if(array[j]<array[j+1]){//小的在后面
        let temp=array[j+1];
        array[j+1]=array[j];
        array[j]=temp;
      }
    }
  }
}
```

## 斐波那契

写一个函数，输入 `n` ，求斐波那契（Fibonacci）数列的第 `n` 项。斐波那契数列的定义如下

```
F(0) = 0,   F(1) = 1
F(N) = F(N - 1) + F(N - 2), 其中 N > 1.
```

```js
//递归
function Fibonacci(n){
  if(n<=1){return n}
  return Fibonacci(n-1)+Fibonacci(n-2);
}
//非递归
function Fibonacci(n){
  if(n<=1){return n}
  let result=0;
  let f0=0;
  let f1=1;
  for(let i=0;i<n;i++){
    result=f0+f1;
    f0=f1;
    f1=result;
  }
  return result;
}
```

## 最小三数之和

给定一个长度为 n 的整数数组和一个目标值 target，寻找能够使条件 nums[i] + nums[j] + nums[k] < target 成立的三元组 i, j, k 个数（0 <= i < j < k < n）。

```js
function threeSmallerSum=function(nums,target){
  if(!nums||nums.length<3){return}
  nums=nums.sort((a,b)=>a-b) //升序
  let result=0;
  for(let i=0;i<nums.length;i++){
    let second=i+1;
    let last=nums.length-1;
    while(second<last){
      let sum=nums[i]+nums[second]+nums[last];
      if(sum<target){
        result=last-second;
        second++;
      }
      if(sum>target){
        last--;
      }
    }
    return result;
  }
}
```



## 三数之和

给你一个包含 n 个整数的数组 nums，判断 nums 中是否存在三个元素 a，b，c ，使得 a + b + c = 0 ？请你找出所有满足条件且不重复的三元组。

```js
function threeSum(nums){
  if(!nums||nums.length<3){return;}
  nums=nums.sort((a,b)=>a-b);
  let result=[];
  for(let i=0;i<nums.length;i++){
    if(nums[i]>0){break;}
    if(nums[i]===nums[i-1]) continue;
    let second=i+1;
    let last=sums.length-1;
    while(second<last){
    const sum=nums[i]+nums[second]+nums[last];
    if(sum===0){
      result.push([nums[i],nums[second],nums[last]]);
      second++;
      last--;
    }
    if(sum<0){
      second++;
    }
    if(sum>0){
      last--;
    }
    }
  }
  return result;
}
```



## 爬楼梯

假设你正在爬楼梯。需要 *n* 阶你才能到达楼顶。

每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？

```js
//动态规划
function climbStairs(n){
  if(n<=2){return n};
  let pre=1,next=2,result=3;
  for(let i=3;i<=n;i++){
    result=pre+next;
    pre=next;
    next=result;
  }
  return result;
}
```

