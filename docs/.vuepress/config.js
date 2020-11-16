module.exports = {
    title:'青年家威',
    themeConfig: {
        nav: [
            { text: '首页', link: '/' },
            { text: '关于我', link: '/aboutme/' },
            { text: '架构之路', link: '/archite/' },
            { text: '技术积累', link: '/foundation/' },
            { text: '掘金', link: 'https://juejin.im/user/4300945220716103/posts' },
            { text: 'CSDN', link: 'https://blog.csdn.net/liujiawei00' },
        ],
        sidebar: {
            '/aboutme/':[
                '',
                'frontend',
                'node',
                'ops',
                'backend'
            ],
            '/archite/': [
                '',
                'node',
                'microfrontend'
            ],
            '/foundation/':[
                '',
                'js',
                'framework',
                'css'
            ]
        },
        lastUpdated: '最近更新', // string | boolean
        smoothScroll: true
    },
}