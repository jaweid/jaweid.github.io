## WEB前端

### 熟悉微前端应用并落地项目中

主要是使用它将一个Angular项目在不影响用户使用的情况下，过渡为Vue开发的项目。使用single-spa-angular和single-spa-vue进行single-spa application的初始化和挂载等。
   
1. 使用了import-map-overrides来实现本地开发过程中只需要启动新的Vue项目。

2. 使用parcels在不同框架之间共享UI或组件，使用Utility公共模块实现通用逻辑和部分的数据通信。

3. 实现了不同项目的独立仓库，开发，部署集成。

###  开发公司内部的UI库，NPM私有库

   为什么做这个？怎么做？别人怎么用？
