---
title: 从0到1用Node构建一个CLI工具
sidebar: 'auto'
date: 2020-12-18
author: Issho Lin
tags:
 - 工程化
categories:
 - node
---

## 创建工程
- 新建一个项目并初始化
```bash
mkdir my-cli
cd my-cli
npm init
```
- 创建一个bin目录和入口文件
```bash
mkdir bin
cd bin
touch cli.js
```
- 在入口文件头指定node为解析器
```js
#!/usr/bin/env node
```
- 在 `package.json` 配置命令
```json
{
  "bin": {
    "mycli": "./bin/cli.js"
  },
}
```
- 在终端执行 `npm link`，把包链接到全局

![image.png](https://upload-images.jianshu.io/upload_images/19423820-30b40689cfe45793.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 在 `cli.js` 中写入node代码，并执行命令 `mycli`
```js
#!/usr/bin/env node
console.log('这是我的cli工具');
```
- 如果 `cli.js`中的代码能正常执行，则至此，工程的创建就完成了

## 定制终端命令
- 安装 `commander` 库
```bash
npm install commander
```
- 在 `cli.js` 中通过js代码来定制命令

我们首先来配置一个查看版本号和初始化项目的命令
```js
#!/usr/bin/env node

const program = require('commander')
// 查看版本号
program.version(require('../package.json').version)
// 初试化项目
program.command('init <name>').description('init project').action(name => {
  console.log('初始化项目的逻辑写在这里：' + name)
})
// ！！重点，不加上这句，前面的命令都没效果
program.parse(process.argv)
```
执行一下看看效果

![image.png](https://upload-images.jianshu.io/upload_images/19423820-e4adeead1123c81d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

ok，这样我们就算完成简单的定制命令了，接着让我们来丰富一下命令的功能
- 在根目录新建一个文件来写我们的命令逻辑
```bash
mkdir lib
cd lib
touch init.js
```
- 第一步，我们来打印一个好看的欢迎界面

文字效果我们借助一个 `figlet` 包
```bash
npm install figlet
```
这个figlet包本身是一个异步的回调方法，我们用`promisify`来做一个封装；
`init.js`:
```js
const { promisify } = require('util')
const figlet = promisify(require('figlet'))

module.exports = async name => {
  const data = await figlet(`Welcome ${name}`)
  console.log(data)
}
```
回到 `cli.js` 把代码导入到命令逻辑
```js
program.command('init <name>').description('init project').action(require('../lib/init'))
```
ok，在终端输入定制命令看一下效果

![image.png](https://upload-images.jianshu.io/upload_images/19423820-1df7f6a9f432e514.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

打印之前最好先清屏，这样效果好一点，我们借助另一个 `clear` 包，它就相当于你在终端手动的输入 `clear` 命令

要想生活过得去，身边总得带点绿，草原转移大法，那我们就用一个 `chalk` 包给文字加上好看可爱的绿色吧 🐶 ～
```bash
npm install clear chalk
```
稍微把`init.js`修改一下:
```js
const { promisify } = require('util')
const figlet = promisify(require('figlet'))
const clear  = require('clear')
const chalk = require('chalk')

const log = content => console.log(chalk.green(content));

module.exports = async name => {
  clear()
  const data = await figlet(`Welcome ${name}`)
  log(data)
}
```
再来看看效果，嚯，好看的草原出来了🌿

![image.png](https://upload-images.jianshu.io/upload_images/19423820-7c31cf941b20f1d6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240) 

## 下载项目模板
>类似于`creat-react-app`和`vue-cli`，脚手架初始化项目其实就是通过定制命令行把GitHub或gitee上事先配置好的项目模板down下来，这里我是用webpack做了一个简单的SPA配置，仓库地址是`https://github.com/Issho-lin/my-webpack-config-spa`
- 在 lib 目录下新建一个 `download.js`
```bash
cd lib
touch download.js
```
- 把GitHub上的项目模板代码down下来

我们需要借助一个`download-git-repo`库，然后通过js代码从GitHub上下载东西
```bash
npm install download-git-repo
```
下载需要有一个loading，我们通过`ora`库来实现
```bash
npm install ora
```
git clone从网络上下载资源这个过程是一个IO操作，所以是一个异步回调的方式，我们还是用 `promisify` 封装一波
`download.js`
```js
const { promisify } = require('util')
const ora = require('ora')
const download = promisify(require('download-git-repo'))
/**
 * @param {string} repo 资源地址
 * @param {string} desc 下载到哪
 */
module.exports.clone = async (repo, desc) => {
  const process = ora(`clonning from ${repo}`)
  process.start()
  await download(repo, desc)
  process.succeed()
}
```
回到`init.js`，增强初始化命令
```js
const { clone }  = require('./download')
module.exports = async name => {
  //...
  await clone('github:Issho-lin/my-webpack-config-spa', name)
}
```
项目模板克隆下来之后，需要安装依赖并启动。接下来我们就运用`child_process`模块来封装一个执行终端命令的方法
`download.js`；

```js
const { promisify } = require('util')
const ora = require('ora')
const { spawn } = require('child_process')

const download = promisify(require('download-git-repo'))

const _spawn = async (...args) => {
  return new Promise(resolve => {
    const proc = spawn(...args)
    proc.stdout.pipe(process.stdout)
    proc.stderr.pipe(process.stderr)
    proc.on('close', () => resolve())
  })
}

/**
 * @param {string} repo 资源地址
 * @param {string} desc 下载到哪
 */
module.exports.clone = async (repo, desc) => {
  let process = ora(`clonning from ${repo}`)
  process.start()
  await download(repo, desc)
  process.succeed()
  // // 自动安装依赖
  process = ora('installing dependencies')
  process.start()
  await _spawn('npm', ['install'], { cwd: `./${desc}` })
  process.succeed()
  // 启动
  await _spawn('npm', ['run', 'server'], { cwd: `./${desc}` })
}
```
至此，一个简单的CLI工具就完成了，接下来就是完善开发自己的项目模版了，大家有什么想法不妨试试看，构建一个属于自己的CLI工具吧

![image.png](https://upload-images.jianshu.io/upload_images/19423820-bc2ac385d1d30a2e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)