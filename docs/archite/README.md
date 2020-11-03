# 工具

架构之路需要学习了解的东西，左边菜单栏对应的页面里面是学习、了解、知识。而关于我那边是面试针对型的分类。与成为架构师无关的知识，均放到平日积累模块里面

### 技术选型

angular、react、vue

路由库、网络请求库、数据层用什么工具，UI库

less、sass还是postcss

ts,wasm,babel,polyfill

PC网站的开发，移动web应用，或是一个electron桌面项目

小程序，你会选择taro、uniapp/mpvue或是选择不使用这些工具

APP整合？直接使用webview还是选择使用cordova

RN、weex还是flutter,Web应用PWA来支持离线使用

### 代码规范

jslint、tslint、csslint、prettier

BME命名、OOCSS、scoped css、css in js还是其他什么方法来避免CSS冲突

命名，文件目录，事件

Code Review

IDE配置、git配置（例如使用LF还是CRLF作为换行符）、是否需要使用nrm来管理npm源并使用nvm来确保统一的node/npm版本

### UI规范

确定主题与配色，typography（排印）规范（包括字体、字号、行高）

界面在设计上遵循亲密性、对比、对其、重复的规则（《写给大家看的设计书》），同时给用户带来及时、一致、可控可预期的交互体验

### 公共代码

搭建私有npm仓库，还是使用git submodule的形式

对于web，你将通过webpack还是cdn的形式引入代码

### 文档

非UI组件，JSDoc

UI组件，storybook。你可以通过它创建一系列可展示、可交互的组件示例，并且让其他人可以直接拷贝实例代码

非来源于代码的文档，你可能需要借助静态网站生成器（static site generator）或是博客工具来书写文档，vuepress、wordpress、conflurence、石墨文档

可参考的代码模板是个好主意，对此你可以使用例如hygen（jondot/hygen）

### 分支管理

gitflow

所有提交到主分支的代码合并都需要提交pull request并通过code review

与CI/CD流程整合

merge还是rebase

### 演进能力

webpack从3.x升级到4.x，将vue从2.x升级到3.x

微前端理念能帮助我们处理升级和重构所带来的麻烦。single-spa是目前最流行的微前端框架之一，qiankun（umijs/qiankun）在其之上为多项目结构提供了可行的实施方案。

通过微前端架构，我们可以逐步替代项目中的代码

### 自动化：部署 & 测试

认真了解你所使用/搭建的脚手架和webpack，熟悉每一项配置（module、optimization、plugins...）的意义与使用

需要了解git hooks、docker，懂一些shell script，以便和运维团队一起整合CI/CD流程

自动化测试以及代码覆盖率检测来保证项目稳定前进，jest、instanbul等等，如果你需要编写e2e测试，那你可能还需要熟悉headless chrome。

决定添加自动化测试，或是遵循TDD/BDD的开发理念

### 大前端

BFF（Backend for Frontend）、SSR（服务端渲染）、nodejs、graphql、grpc、消息队列（mq）、授权与认证（oauth/JTW...）、nginx、数据库（SQL、mongoDB、redis、elastic search、TiDB/cockroachDB、TSDB、graphDB...）、日志管理、docker & k8s、微服务、service mesh（istio...）、serverless...

