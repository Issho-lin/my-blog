/*
 * @Author: linqibin
 * @Date: 2025-03-14 08:41:36
 * @LastEditors: linqibin
 * @LastEditTime: 2025-03-14 10:14:12
 * @Description: 
 * 
 * Copyright (c) 2025 by 智慧空间研究院/金地空间科技, All Rights Reserved. 
 */
const themeConfig = require('./config/theme')

module.exports = {
    title: 'linqibin个人博客',
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