## 微前端

微前端是指存在于浏览器中的微服务。

微前端作为用户界面的一部分，通常由许多组件组成，并使用类似于React、Vue和Angular等框架来渲染组件。每个微前端可以由不同的团队进行管理，并可以自主选择框架。虽然在迁移或测试时可以添加额外的框架，出于实用性考虑，建议只使用一种框架。

每个微前端都拥有独立的git仓库、package.json和构建工具配置。因此，每个微前端都拥有独立的构建进程和独立的部署/CI。这通常意味着，每个仓库能快速构建。

### Single SPA

Single-spa 是一个将多个单页面应用聚合为一个整体应用的 JavaScript 微前端框架。 使用 single-spa 进行前端架构设计可以带来很多好处，例如:

* 在同一页面上使用多个前端框架 而不用刷新页面 (React, AngularJS, Angular, Ember, 你正在使用的框架)
* 独立部署每一个单页面应用
* 新功能使用新框架，旧的单页应用不用重写可以共存
* 改善初始加载时间，迟加载代码

在single-spa中，有以下三种微前端类型：

- single-spa applications:为一组特定路由渲染组件的微前端。
- single-spa parcels: 不受路由控制，渲染组件的微前端。
- utility modules: 非渲染组件，用于暴露共享javascript逻辑的微前端，也就是通用JS模块。

single-spa是一个小于5kb（gzip）npm包，用于协调微前端的挂载和卸载。它知道何时基于活动挂载应用程序，并且可以在小型适配器库的帮助下以与框架无关的方式挂载应用程序。

相比于原生应用，微前端性能更佳。这是由于懒加载和其他相关的优化。微前端为我们提供一种迁移方式，从而解决我们原生项目中隐藏的问题。出于性能考虑，强烈建议框架（如：React, Vue, or Angular等）级别的实例仅引用一次。

### 工作原理

Single-spa 包括以下内容:

1. Applications，每个应用程序本身就是一个完整的 SPA (某种程度上)。 每个应用程序都可以响应 url 路由事件，并且必须知道如何从 DOM 中初始化、挂载和卸载自己。 传统 SPA 应用程序和 Single SPA 应用程序的主要区别在于，它们必须能够与其他应用程序共存，而且它们没有各自的 html 页面。

   例如，React 或 Angular spa 就是应用程序。 当激活时，它们监听 url 路由事件并将内容放在 DOM上。 当它们处于非活动状态时，它们不侦听 url 路由事件，并且完全从 DOM 中删除。

2. 一个 single-spa-config配置, 这是html页面和向Single SPA注册应用程序的JavaScript。每个应用程序都注册了三件东西

  + A name
  + A function (加载应用程序的代码)
  + A function (确定应用程序何时处于活动状态/非活动状态)

  ### 简单使用示例

html

``` html
<html>

<body>
    <script src="single-spa-config.js"></script>
</body>

</html>
```

main.js  

``` js
  import * as singleSpa from 'single-spa';
  const name = 'app1';
  /* loading 是一个返回 promise 的函数，用于 加载/解析 应用代码。
   * 它的目的是为延迟加载提供便利 —— single-spa 只有在需要时才会下载应用程序的代码。
   * 在这个示例中，在 webpack 中支持 import ()并返回 Promise，但是 single-spa 可以使用任何返回 Promise 的加载函数。
   */
  const app = () => import('./app1/app1.js');
  /* Single-spa 配置顶级路由，以确定哪个应用程序对于指定 url 是活动的。
   * 您可以以任何您喜欢的方式实现此路由。
   * 一种有用的约定是在url前面加上活动应用程序的名称，以使顶层路由保持简单。
   */
  const activeWhen = '/app1';
  singleSpa.registerApplication({
      name,
      app,
      activeWhen
  });
  singleSpa.start();
```

app1.js

``` js
let domEl;
export function bootstrap(props) {
    return Promise
        .resolve()
        .then(() => {
            domEl = document.createElement('div');
            domEl.id = 'app1';
            document.body.appendChild(domEl);
        });
}
export function mount(props) {
    return Promise
        .resolve()
        .then(() => {
            // 在这里通常使用框架将ui组件挂载到dom。请参阅https://single-spa.js.org/docs/ecosystem.html。
            domEl.textContent = 'App 1 is mounted!'
        });
}
export function unmount(props) {
    return Promise
        .resolve()
        .then(() => {
            // 在这里通常是通知框架把ui组件从dom中卸载。参见https://single-spa.js.org/docs/ecosystem.html
            domEl.textContent = '';
        })
}
```

### Application

single-spa application与普通的单页面是一样的，只不过它没有HTML页面。在一个single-spa中，你的SPA包含许多被注册的应用，而各个应用可以使用不同的框架。被注册的这些应用维护自己的客户端路由，使用自己需要的框架或者类库。应用只要通过挂载，便可渲染自己的html页面，并自由实现功能。“挂载”(mounted)的概念指的是被注册的应用内容是否已展示在DOM上。我们可通过应用的activity function来判断其是否已被挂载。应用在未挂载之前，会一直保持休眠状态。

在一个 single-spa 页面，注册的应用会经过下载(loaded)、初始化(initialized)、被挂载(mounted)、卸载(unmounted)和unloaded（被移除）等过程。single-spa会通过“生命周期”为这些过程提供钩子函数。

### Parcels

创建一个parcel很容易，会返回一个对象(parcelConfig)，single-spa可以使用该对象来创建和挂载parcel（mountParcel，unmount）。由于single-spa可以在任何地方挂载parcel，所以可以通过这种方式在各个框架之间共享UI或组件。 但是，共享UI在同一框架的另一个应用程序中使用的时候，不应该使用parcel。

例如：application1 用Vue编写，包含创建用户的所有UI和逻辑。 application2是用React编写的，需要创建一个用户。 使用single-spa parcels可以让您包装application2Vue组件。尽管框架不同，但它可以在`application2'内部运行。 

生命周期：bootstrap，mount，unmount，update（可选）

我们可以将Parcels视为Web组件的single-spa特定实现。


### Utility
公共模块是共享通用逻辑的好地方。 您可以用一个普通的JavaScript对象 (single-spa 公共模块)共享一段逻辑，代替在每个应用程序中都创建自己的通用逻辑实现。 例如：授权。 每个应用程序怎么知道哪个用户已登录？ 你可以让每个应用程序都询问服务器或读取JWT，但这会在每个应用程序中创建重复的工作。 使用Utility程序模块模式会让你创建一个实现授权逻辑的模块。 该模块将导出所有你需要的方法，然后你的其他的single-spa 应用程序可以通过导入这个模块来使用这些授权方法。
- Notification service
- Styleguide/component library
- Error tracking service
- Authorization service
- Data fetching

### Import Maps

Import Maps是一个浏览器规范，用于将某个URL起一个“Import specifier”的别名。 import specifier是指示要加载哪个模块的字符串。例子:

```js
// ./thing.js is the import specifier
import thing from './thing.js';
// react is the import specifier
import React from 'react';
```
不是URL的说明符称为“纯说明符”，如“import”react”。对于能够使用浏览器内模块来说，能够将裸说明符别名为URL是至关重要的，这就是存在导入映射的原因。

截止到2020年2月，import maps仅在Chrome中实现，并在开发者特性切换后实现。因此，您将需要一个polyfill使import maps正常工作。

### 本地开发

与整体前端应用程序相比，single-spa的本地开发鼓励只运行您正在开发的一个microfrontend，而使用其他所有microfrontend的部署版本。这一点很重要，因为每次您想要做任何事情时运行每个single-spa microfrontend都是非常笨拙和麻烦的。


为了一次只完成一个微前端的本地开发，我们可以在导入映射中定制该微前端的URL。例如，如下的import map 设置了navbar应用本地开发，因为它是唯一指向本地web服务器的应用，而planets 和 things都指向已部署的应用版本。

```js
{
  "imports": {
    "navbar": "https://localhost:8080/react-mf-navbar.js",
    "planets": "https://react.microfrontends.app/planets/2717466e748e53143474beb6baa38e3e5320edd7/react-mf-planets.js",
    "things": "https://react.microfrontends.app/things/7f209a1ed9ac9690835c57a3a8eb59c17114bb1d/react-mf-things.js"
  }
}

```

import-map-overrides可以通过浏览器内的UI定制导入地图。该工具将自动允许您在本地主机和部署版本之间切换一个或多个微前端。

此外，您还可以选择在本地运行single-spa基础配置，或者使用在已部署环境上运行的single-spa配置。single-spa核心团队发现在部署的环境(可能是在您的组织中运行的“集成”、“开发”或“暂存”环境)上开发是最容易的，因此您不必经常运行signle-spa基础配置。
示例：

``` html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Coexisting Vue Microfrontends</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="importmap-type" content="systemjs-importmap">
    <script type="systemjs-importmap">
      {
        "imports": {
          "navbar": "http://localhost:8080/js/app.js",
          "app1": "http://localhost:8081/js/app.js",
          "app2": "http://localhost:8082/js/app.js",
          "single-spa": "https://cdnjs.cloudflare.com/ajax/libs/single-spa/4.3.7/system/single-spa.min.js",
          "vue": "https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.js",
          "vue-router": "https://cdn.jsdelivr.net/npm/vue-router@3.0.7/dist/vue-router.min.js"
        }
      }
    </script>
    <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/single-spa/4.3.7/system/single-spa.min.js" as="script" crossorigin="anonymous" />
    <link rel="preload" href="https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.js" as="script" crossorigin="anonymous" />
    <script src="https://unpkg.com/import-map-overrides@1.7.2/dist/import-map-overrides.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/systemjs/6.1.1/system.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/systemjs/6.1.1/extras/amd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/systemjs/6.1.1/extras/named-exports.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/systemjs/6.1.1/extras/named-register.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/systemjs/6.1.1/extras/use-default.min.js"></script>
  </head>
  <body>
    <script>
      (function() {
        Promise.all([System.import('single-spa'), System.import('vue'), System.import('vue-router')]).then(function (modules) {
          var singleSpa = modules[0];
          var Vue = modules[1];
          var VueRouter = modules[2];

          Vue.use(VueRouter)

          singleSpa.registerApplication(
            'navbar',
            () => System.import('navbar'),
            location => true
          );

          singleSpa.registerApplication(
            'app1',
            () => System.import('app1'),
            location => location.pathname.startsWith('/app1')
          )

          singleSpa.registerApplication(
            'app2',
            () => System.import('app2'),
            location => location.pathname.startsWith('/app2')
          )

          singleSpa.start();
        })
      })()
    </script>
    <!-- See https://github.com/joeldenning/import-map-overrides#user-interface  -->
    <import-map-overrides-full show-when-local-storage="overrides-ui"></import-map-overrides-full>
  </body>
</html>

```

### 通信

一个好的体系结构是将微前端解耦，并且不需要频繁通信。遵循上面关于应用程序与parces的指导原则，可以帮助您保持微前端的解耦。基于路由的single-spa应用程序本质上需要较少的应用程序间通信。

微前端直接通信的可能有三样东西：

- 方法，组件，逻辑，全局状态（可以在JS文件之间导入或导出方法，组件，逻辑，全局状态）
- API数据（导出一个fetchWithCache 方法 and 导入方法.）
- UI状态(极少)

### 应用 vs. parcels vs. 通用模块

Single-spa 有微前端的不同目录。在何处和如何使用他们，决定权在于你。然而，single-spa核心团队有如下推荐：

多用基于路由的single-spa应用, 少用 single-spa parcels

1. 首选按路由而不是按路由中的组件拆分微前端。 这意味着在可能的情况下，首选single-spa应用程序而不是single-spa parcels。 原因是路由之间的转换通常涉及破坏和重新创建大多数UI状态，这意味着位于不同路由上的single-spa应用程序无需共享UI状态。
2. 将固定的导航菜单移至其自己的single-spa应用程序中时，要使自己的激活函数默认激活, 除此之外只有在登录页才需要卸载。
3. 为你核心的组件，样式，权限和全局错误处理新增通用模块。
4. 如果你只使用一个框架，尽可能使用框架组件(例如 React, Vue, and Angular 组件)而不是single-spa parcels。这是因为框架组件之间的互操作比有single-spa包的中间层时更容易。 您应该只在需要使用多个框架时创建single-spa parcels，在多个single-spa应用程序之间导入组件。

### 共享依赖

为了提高性能，web应用程序只加载一次大型JavaScript库是至关重要的。你选择的框架(React, Vue, Angular等)应该只在页面上加载一次。

不建议把所有东西都变成共享依赖项，因为当每个微前沿需要升级时共享依赖项必须立即升级。对于小型库，在使用它们的每个微前端中重复加载它们是可以接受的。例如，react-router可能足够小，可以重复，当您想一次升级一个微前端路由时，这是很好的。然而，对于像react、momentjs、rxjs等大型库，你可以考虑让它们共享依赖。

有两种共享依赖关系的方法:

- 运行时import maps(推荐)
- 构建时module federation（模块联合，这是一个新特性，仍在发展）

使用import maps实现共享依赖如下：
```js
{
  "imports": {
    "single-spa": "https://cdn.jsdelivr.net/npm/single-spa@5.5.1/lib/system/single-spa.min.js",
    "vue": "https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.min.js",
    "vue-router": "https://cdn.jsdelivr.net/npm/vue-router@3.1.6/dist/vue-router.min.js"
  }
}
```

### 通用模块

“通用模块”是一个运行时的JavaScript模块，它不是一个single-spa应用程序或parcel。换句话说，它的唯一目的是为其他微前端导出要导入的功能。

实用程序模块的常见示例包括样式指南、身份验证助手和API助手。这些模块不需要向single-spa注册，但是对于维护几个single-spa应用程序和parcel之间的一致性非常重要。

```js
// In a repo called "api", you may export functions from the repo's entry file.

export function authenticatedFetch(url, init) {
  return fetch(url, init).then(r => {
    // Maybe do some auth stuff here
    return r.json()
  })
}

// Inside of a single-spa application, you can import the functions from the 'api' repo
```

