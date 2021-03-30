---
title: 怎样发布一个 npm 包
sidebar: 'auto'
date: 2020-03-01
author: Issho Lin
tags:
 - 组件
categories:
 - npm
---

## 一、注册npm账号
[点击此处前往npm官网注册](https://www.npmjs.com/signup)

注册后需要去邮箱中确认一下

![image.png](https://upload-images.jianshu.io/upload_images/19423820-f776d17f75624249.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

点击邮件中的认证按钮，然后跟着提示一步步确认即可

## 二、电脑本地npm登录
- 打开终端输入命令：`npm adduser`，依次输入刚刚注册 `Username`、`Password` 、`Email`，当终端输出如下图的信息时，说明已经登录成功

![image.png](https://upload-images.jianshu.io/upload_images/19423820-c3c802c648d70b8c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


- 查看 npm 登录信息，在终端输入`npm config ls`，在输出的信息中找到`userconfig`，复制后面的路径，然后在终端打开这个文件，就可以看到npm登录的信息

![image.png](https://upload-images.jianshu.io/upload_images/19423820-3066ffdb0bcf7a5f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 退出 npm 的用户登陆：终端输入`npm logout`

![image.png](https://upload-images.jianshu.io/upload_images/19423820-701b975caa77cc30.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 三、创建npm包
> 这里采用Rollup来构建，仅仅只是因为小编一直用的webpack，还没用过Rollup，顺便学习一下；另一方面，毕竟社区流传着【webpack更适合应用层级的WebApp，而Rollup更适合使用在独立的JavaScript的模块库上】的结论，哈哈~
1. 新建一个项目，并初始化 `package.json`
```
yarn init
```
2. 安装Roolup
```
yarn add rollup --dev
```
3. 项目配置

和webpack一样，es6转es5需要 `babel` 的支持，rollup 同样支持插件来实现代码压缩等
```bash
yarn add @babel/core @babel/preset-env -D
yarn add rollup-plugin-babel rollup-plugin-uglify -D
```
`.babelrc`：

```json
{
    "presets": [
        "@babel/preset-env"
    ]
}
```
`rollup.config.js`：
```js
import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'

export default {
    input: 'main.js',
    output: {
        file: './dist/bundle.js',
        format: 'cjs'
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        }),
        uglify()
    ]
}
```
在 `package.json` 配置构建脚本
```json
{
    "scripts": {
        "build": "npx rollup --config"
    }
}
```

4. 撰写说明文档

`README.md`：
```md
## 这是npm包的说明文档
```

5. npm 包信息说明

`package.json`：
```json
{
  "name": "", // 发布的npm包名字
  "version": "1.0.0", // npm包版本
  "description": "", // 包描述
  "main": "./dist/bundle.js", // 指定组件或函数的主入口文件
  "author": "",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/Issho-lin/lunar-date.git"
  }
}
```

6. 文件发布忽略声明
> 类似于`.gitignore`，声明发布npm包时需要忽略的文件，如果项目中没有`.npmignore`文件，但有`.gitignore`文件，则发布时会采用`.gitignore`的声明

`.npmignore`：
```
.*
*.md
node_modules/
rollup.config.js
src/
```

## 四、构建一个js工具函数包
- 在入口文件`export`一个提供给用户使用的函数
```js
import { GetLunarDay } from './src/tool'
/**
 * 获取当前农历日期
 * @param {Boolean} withYear 是否显示农历年
 */
export const lunarCalendarDate = withYear => {
    let D = new Date()
    let yy = D.getFullYear()
    let mm = D.getMonth() + 1
    let dd = D.getDate()
    if (yy < 100) yy = '19' + yy
    return GetLunarDay(yy, mm, dd, withYear)
}
```
- 执行构建脚本
```
yarn build
```

## 五、发布 npm 包
- 发布之前有几个注意点：
1. 在发包之前，先到[npm官网](https://www.npmjs.com/)搜索一下，避免有同名的包存在

![image.png](https://upload-images.jianshu.io/upload_images/19423820-774fde698b8417b7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2. 一个版本只能发布一次，每一次迭代需要修改版本号
```bash
假设初始版本为1.0.0
➜ npm version preminor
v1.0.0-0
➜ npm version prepatch
v1.0.1-0
➜ npm version patch
v1.0.1
```
3. 确保 npm 切换到官方镜像源
```bash
npm config get registry
npm config set registry https://registry.npmjs.org
```
4. 确保本地电脑 npm 已登录
```bash
npm config ls
```
- 确认没问题就执行 `npm publish` 正式发布

![image.png](https://upload-images.jianshu.io/upload_images/19423820-806b805acde966bd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)