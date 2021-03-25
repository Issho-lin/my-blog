const nav = require('./nav')
const blogConfig = require('./blog')

module.exports = {
    type: 'blog',
    logo: '/assets/image/logo.jpg',
    nav,
    blogConfig,
    sidebar: 'auto',
    authorAvatar: '/assets/image/logo.jpg',
    lastUpdated: 'Last Updated',
    author: '林琦彬',
    startYear: '2020'
}