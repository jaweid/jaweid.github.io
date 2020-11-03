module.exports = {
    base:'/blog/',
    themeConfig: {
        nav: [
            { text: '首页', link: '/' },
            { text: '技术积累', link: '/articles/' },
            { text: '关于我', link: '/aboutme/' },
            { text: '架构之路', link: '/archite/' },
            { text: '掘金', link: 'https://juejin.im/' },
            {
                text: '语言',
                items: [
                    { text: '中文', link: '/language/chinese/' },
                    { text: 'Japanese', link: '/language/japanese/' }
                ]
            }
        ],
        sidebar: {
            '/articles/': [
                '',
                'js',
            ],
            '/archite/': [
                '',
                'knows'
            ]
        },
        lastUpdated: 'Last Updated', // string | boolean
        smoothScroll: true
    },
}