---
title: Taro富文本（支持video）
sidebarDepth: 3
date: 2024-07-06
author: Issho Lin
tags:
 - app开发
categories:
 - App开发
---

## 一、添加插件
在微信公众平台找到[插件管理](https://mp.weixin.qq.com/wxamp/basicprofile/thirdauth?token=2022628898&lang=zh_CN)，点击添加插件，搜索wxParser或 <font style="color:rgb(51, 51, 51);background-color:rgb(247, 247, 247);">wx9d4d4ffa781ff3ac</font>，搜索到该插件，并点击添加

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739775194658-ff2a12ac-8243-49df-bd7f-ef691d3802cb.png)

## 二、声明插件
在app.config.ts中声明插件引入，目前插件版本为 0.1.0，provider 为该插件的 APPID，wxparserPlugin 为自定义的插件名称。

```typescript
export default defineAppConfig({
  plugins: {
    wxparserPlugin: {
      version: '0.4.0',
      provider: 'wx9d4d4ffa781ff3ac',
    },
  }
})
```

在需要使用到该插件的小程序页面的index.config.ts 配置文件中，做如下配置：

```typescript
export default definePageConfig({
  usingComponents: {
    wxparser: 'plugin://wxparserPlugin/wxparser',
  },
})

```

## 三、使用插件
由于微信小程序插件的限制，目前无法在插件中使用 wx.navigato 等跳转链接接口，需要使用监听事件自己实现

```typescript
<wxparser rich-text={html} onTapLink={onTapLink} bindtapLink />
```

taro中使用原生模块，绑定事件遵循以下原则，因此onTapLink事件必须搭配bindtapLink进行 hack 处理

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739776126724-6f4ee69c-c66d-4bd9-8a22-c9af343ecbcc.png)

