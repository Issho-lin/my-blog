const themeConfig = require('./config/theme')

module.exports = {
    title: 'Issho lqb',
    description: 'web前端个人博客',
    head: [
        ['link', { rel: 'icon', href: '/assets/image/favicon.jpg' }],
        ['meta', { name: 'referrer', content: 'no-referrer' }]
    ],
    theme: 'reco',
    themeConfig,
    markdown: {
        extractHeaders: ['h2']
    },
    plugins: [
        ['image']
    ]
}