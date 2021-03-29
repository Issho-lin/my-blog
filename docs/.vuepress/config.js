const themeConfig = require('./config/theme')

module.exports = {
    title: 'Issho lqb',
    description: '林琦彬 linqibin Issho web前端 个人网站',
    head: [
        ['link', { rel: 'icon', href: '/assets/image/favicon.jpg' }],
        ['meta', { name: 'referrer', content: 'no-referrer' }]
    ],
    theme: 'reco',
    themeConfig,
    markdown: {
        extractHeaders: ['h2']
    }
}