---
title: webpack基础
date: 2020-03-16
author: Issho Lin
tags:
 - 基础
categories:
 - webpack
---

## 一、项目初始化及 webpack 安装
```
mkdir webpack-demo && cd webpack-demo
npm init -y
npm install webpack webpack-cli --save-dev
```
初始化完成之后项目会有一个 `package.json` 和一个 `node_modules` 文件夹
## 二、基本使用
在根目录下新建一个 `index.html` 和 `src` 目录，在 `src` 目录下新建一个 `index.js`
```
+ src
   + index.js
+ index.html
```
在 `index.js` 文件中写入 js 代码
```
const h = document.createElement('h1')
h.innerHTML = 'webpack'
document.body.appendChild(h)
```
然后执行 webpack 打包
```
npx webpack
```
这时根目录会生成一个 `dist` 目录
```
+ dist
    + main.js
```
把打包生成的 `main.js` 在 `index.html` 中引用
```
<script src="./dist/main.js"></script>
```
可以看到，浏览器页面上能够正常显示 `index.js` 执行的结果
![image.png](https://upload-images.jianshu.io/upload_images/19423820-428dd90f99641b01.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这是 webpack 的默认配置，入口文件为 `src/index.js`，输出文件目录为 `dist/main.js`。webpack 也支持我们自定义配置。
## 三、自定义配置
把刚刚打包生成的 `dist` 目录删掉，在根目录下新建一个 `webpack.config.js`

```
- dist
    - main.js
+ webpack.config.js
```
首先修改入口文件和输出目录及文件名
```
const path = require('path')
module.exports = {
    entry: './path/main.js',
    output: {
        // node.js拼接绝对路径
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js'
    }
}
```
在根目录下新增一个 `path/main.js` 作为修改配置后的入口文件
```
+ path
    + main.js
```
重新写入 js 代码 
```
import '../src'
const a = document.createElement('a')
a.innerHTML = '修改了入口文件和打包输入目录'
a.setAttribute('href', 'javascript:;')
document.body.appendChild(a)
```
此时再次执行 `npx webpack` 打包，可以看到根目录输出的目录不再是`dist`，而是我们刚刚配置的 `build` 目录
```
+ build
    + bundle.js
```
把 `index.html` 中 引入的 js 文件修改为 `build/bundle.js`
```
<script src="./build/bundle.js"></script>
```
此时再查看浏览器执行结果，已经变成了 `path/main.js` 中的执行结果
![image.png](https://upload-images.jianshu.io/upload_images/19423820-dae7f3c6e752303a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 四、生产开发多个配置文件
webpack 支持一个项目有多个配置文件，只不过默认执行的是 `webpack.config.js` 文件，但是我们也可以指定执行其他的配置文件。
在根目录下新建一个 `webpack.dev.config.js`，并删掉刚刚打包生成的`build` 目录
```
- build
    - bundle.js
+ webpack.dev.config.js
```
在 `webpack.dev.confi.js` 写入我们的另一套配置（后面我们的操作介绍基本都以这个文件的配置为例子）
```
const path = require('path')
module.exports = {
    entry: './path/main.js',
    output: {
        path: path.resolve(__dirname, 'dev'),
        filename: 'bundle.js'
    }
}
```
此时再执行 webpack 打包，需要我们手动去指定执行的配置文件
```
npx webpack --config webpack.dev.config.js
```
可以看到根目录下输出了一个 `dev` 目录
```
+ dev
    + bundle.js
```
把 `dev/bundle.js` 引入到 ```index.html``` 也可以看到 ```path/main.js``` 的正常执行结果
## 五、配置 npm 脚本
如果每次执行自定义的配置文件都要去手动指定版本，这样比较麻烦，我们可以在 `package.json` 文件中，添加一个 `npm script` 脚本，就可以通过 `npm run` 来执行相应的命令了。
```
"scripts": {
    "dev": "webpack --config webpack.dev.config.js",
  }
```
此时只需要执行 npm 命令，就可以看到效果和原来的一致
```
npm run dev
```
但是，直到目前为止，我们都可以看到 webpack 一直给我们报了一个 warning
![image.png](https://upload-images.jianshu.io/upload_images/19423820-7ff564a085284db8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这是因为webpack需要我们提供一个`mode` 配置选项来告知 webpack 使用相应模式的内置优化。mode选项有两个值`development` 和`production` ，顾名思义就是开发模式和生产模式，它会将 `process.env.NODE_ENV` 设为相应的值
现在，我们在 `webpack.dev.config.js` 中加上 `mode`  配置
```
const path = require('path')
module.exports = {
    mode: 'development'
}
```
然后再执行 `npm run dev` 会发现，warning 已经消失了
![image.png](https://upload-images.jianshu.io/upload_images/19423820-97d0eb514f30746e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
☆`mode` 设为 `production` 打包后的 js 文件会被压缩，一般在打上线版本的时候才会使用，所以一般我们会有两套 webpack 配置，一套针对开发环境，一套针对生产环境

## 六、配置样式 loader
在 webpack 中，任何文件模块都是在 js 文件中导入的，否则就失去了使用 webpack 的意义，下面我们可以来看一下，传统的样式文件引入和使用了 webpack 之后有什么区别。
首先，在根目录下新建一个 `style` 目录
```
+ style
    + index.css
```
在 `index.css` 中写入样式
```
h1 {
    color: red;
}
```
然后在 `path/main.js` 中引入，然后执行打包，当然这时候是不能打包成功的，webpack会报错提示你需要 `loader` 来解析 css 文件
![image.png](https://upload-images.jianshu.io/upload_images/19423820-bee493f8b6256d7a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
所以我们需要先安装解析 css 的 loader
```
npm install style-loader css-loader -D
```
☆ 因为 loader 只是在开发时需要用到，在打包后生成生产项目的时候已经不需要用到了，所以只要 `-D` 就好，而不需要 `-S`
安装完成后，需要在 webpack 的配置文件中进行配置，这里我们就使用 `webpack.dev.config.js` 来配置
```
module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }

        ]
    }
}
```
此时再 `npm run dev` 执行打包，可以看到，webpack 已经不报错了，而且浏览器上也可以看到样式生效了
![image.png](https://upload-images.jianshu.io/upload_images/19423820-44a3a8bba55c551e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
那使用 webpack 和直接在 HTML 文件中引入 css 有什么区别呢？
打开浏览器的开发者工具，可以看到 `network` 里面，在使用了 webpack 之后，只请求了一个 bundle.js 文件
![image.png](https://upload-images.jianshu.io/upload_images/19423820-904a7daf4b386ec2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
而直接在HTML文件中引入，浏览器会单独再去请求css文件，也就是说，你引入几个文件，浏览器就会有几个请求
![image.png](https://upload-images.jianshu.io/upload_images/19423820-54611a447bded8d8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 七、配置 css 预处理器 loader
样式处理 css，还有常用的预处理器 less 和 sass，在 webpack 中要想使用这两个预处理器，也需要配置相应的 loader
首先分别安装 less 和 sass 的loader
```
npm install less less-loader -D
npm install sass-loader node-sass -D
```
然后，分别在 `webpack.dev.config.js` 中进行配置
```
module.exports = {
    module: {
        rules: [
           {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader',
                ]
            }, {
                test: /\.s(a|c)ss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }

        ]
    }
}
```
分别在 `style` 目录下新增一个 `index.less` 、`index.scss` 、`index.sass`
```
+ style
    + index.css
    + index.less
    + index.scss
    + index.sass
```
然后分别写入样式打包验证一下
```
// index.less
h1 {
    font-size: 50px;
}

// index.scss
a {
    color: yellowgreen;
}

// index.sass
a
    font-size: 20px
```
然后在 `path/main.js` 中引入，并执行 `npm run dev` 打包
```
// path/main.js
import '../style/index.less'
import '../style/index.scss'
import '../style/index.sass'
```
可以看到，样式都已经生效了
![image.png](https://upload-images.jianshu.io/upload_images/19423820-4c5bb8d4631d5ce1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 八、配置文件loader（字体图标和图片文件）
安装 `file-loader`
```
npm install file-loader -D
```
在 `webpack.dev.config.js` 配置
```
module.exports = {
    module: {
        rules: [
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: 'file-loader'
            }, {
                test: /\.(png|svg|jpg|gif)$/,
                use: 'file-loader'
            }
        ]
    }
}
```
在 `style` 目录下新建一个 `iconfont.css` 文件 （样式可以在[阿里图库](https://www.iconfont.cn)下一份）
```
  style
    + iconfont.css
```
然后在 `path/main.js` 中引入使用，并执行 `npm run dev` 打包验证
```
// path/main.js
import '../style/iconfont.css'
const i = document.createElement('i')
i.classList.add('iconfont', 'icon-smile')
document.body.appendChild(i)
```
可以看到，字体图标已经可以在浏览器正常显示
![image.png](https://upload-images.jianshu.io/upload_images/19423820-7011faa1960c899a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
在 `src` 目录下新增一个 `img` 目录，放入一张图片
```
  src
    + img
        + logo.svg
```
在  `src/index.js` 和 `style/index.less` 中分别写入代码
```
// src/index.js
import icon from './img/logo.svg'
const img = new Image()
img.src = icon
document.body.appendChild(img)

// style/index.less
h1 {
    font-size: 50px;
    background-image: url('../src/img/logo.svg');
}

img {
    width: 200px;
}
```
执行 `npm run dev` 打包后发现 `dev` 目录里生成了一个 `hash` 命名的图片文件，但是浏览器上图片却无法正常显示
![image.png](https://upload-images.jianshu.io/upload_images/19423820-01db2fd2128801f7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这是因为打包后的图片引用路径，是以 `index.html` 所在的位置为根目录的，但是实际上打包生成的图片文件与 `index.html` 不在同一个目录下，导致引用路径错误，这意味着我们需要手动把 `index.html` 移动到打包后生成的 `dev` 目录下，图片才能正常显示，这是一件非常麻烦的事情。正常来说，我们希望打包后的输出目录应该是一个完整的可以上线使用的项目，而不是每次都要手动去修改。
这里介绍一个插件 `html-webpack-plugin` ，它能在打包后自动生成一个 `index.html` 文件输入到打包目录，并自动帮我们引入 `bundle.js`，下面来看一下怎么使用
首先，安装这个插件
```
npm install html-webpack-plugin -D
```
接着回到 `webpack.dev.config.js` 中配置
```
const HTMLWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    plugins: [
        new HTMLWebpackPlugin({
            // 输出的文件名，默认就是 index.html
            filename: 'index.html',
            // 以指定的index.html为模板
            template: './index.html'
        })
    ]
}
```
此时再执行 `npm run dev` 能够看到，在 `dev` 目录下已经生成了一个 `index.html` 文件，并且会自动引入 `dev` 下的 `bundle.js` 文件，我们已经不需要在原来的 `index.html` 手动去引入了。
在浏览器上打开 `dev` 下的 `index.html`，可以看到图片已经能够正常显示了，并且还可以在样式文件中作为背景图片使用。
![image.png](https://upload-images.jianshu.io/upload_images/19423820-4aebe58f846519da.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这个插件是不是很好用？后面还会继续用到，它的强大之处不只如此。
## 九、配置 url-loader
图片除了上面介绍的 `file-loader` 之外，还有一个更为强大的 `url-loader`，同样的，先安装
```
npm install url-loader -D
```
然后回到 `webpack.dev.config.js` 中配置
```
module.exports = {
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 5 * 1024, // 小于5kb转base64
                        outputPath: 'media/images', // 自定义打包后的图片输出路径
                        name: '[name]-[hash:4].[ext]' // 自定义打包后的图片名字,hash:n,n为hash长度
                    }
                }
            }
        ]
    }
}
```
使用这个 loader 我们可以自定义图片打包后的输入路径以及文件名，并且它默认会将图片转为 `base64` ，但是我们也可以通过 `limit` 属性限制图片小于某个特定值再转为 base64，如果大于这个特定值，就沿用普通的 url。
☆ 如果是采用转成 base64的方式，则打包后不会有图片目录及文件输出
执行 `npm run dev` 验证一下，可以看到，`dev` 目录下已经生成了一个 `media` 目录，并且浏览器也还是可以正常显示的
```
dev
   + media
     + images
       + logo-cd0b.svg
```
## 十、使用自动编译的开发工具
webpack 提供了几个开发工具，可以帮助我们在代码发生变化后自动编译，而不需要我们每次都手动去执行 打包命令。
### 观察模式：watch
watch 相当于是在代码发生改变后自动帮我们执行打包命令，并输出打包后的目录及文件。它有两种启动方式，一种是直接通过命令
```
npx webpack --watch --config webpack.dev.config.js
```
我们同样可以在 `package.json` 中把它配置成 `npm script` 脚本
```
"scripts": {
    "watch": "webpack --watch --config webpack.dev.config.js",
  }
```
这样我们就可以直接通过执行 `npm run watch` 来进入观察模式。
另一种是直接在 `webpack.dev.config.js` 中配置
```
module.exports = {
    watch: true
}
```
这样其实我们只需要执行 `npm run dev` 也能得到同样的效果
### webpack-dev-server
`webpack-dev-server` 其实就是提供了一个简单的 web 服务器，并且能够实时重新加载。这也是 webpack 最推荐的一种方式。
首先需要先安装 `webpack-dev-server`
```
npm install webpack-dev-server -D
```
同样的，它也可以通过命令和配置 `webpack.dev.config.js` 的方式来启动
```
npx webpack-dev-server
```
把它配置成 `npm script` 脚本
```
"scripts": {
    "server": "webpack-dev-server --config webpack.dev.config.js"
  }
```
执行 `npm run server`，可以看到 `webpack-dev-server` 为我们开了一个端口为`8080` 的服务
![image.png](https://upload-images.jianshu.io/upload_images/19423820-4ccd693f36ed7b6b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
在浏览器打开本机 `8080` 端口服务，可以看到页面正常显示
![image.png](https://upload-images.jianshu.io/upload_images/19423820-bbb59168049bc499.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
它与`watch` 模式不同的是，你可以先暂且简单地理解为它帮我们开启了一个服务器，并且把自动打包后的文件映射到服务器的内存根目录上，而不是输出到本地项目的根目录。这里其实也是借助了我们前面使用到的 `html-webpack-plugin` 插件。
`webpack-dev-server` 还为我们提供了其他的配置项，下面我们通过在 `webpack.dev.config.js` 里面配置看一下究竟
```
module.exports = {
    devServer: {
        // 自动打开浏览器
        open: true,
        // 热更新
        hot: true,
        // 文件压缩
        compress: true,
        // 自定义端口
        port: 3000,
        // 自定义映射的根目录
        contentBase: './src'
    }
}
```
配置成 `npm script` 脚本
```
"scripts": {
    "server": "webpack-dev-server --hot --compress --port 3000 --open --contentBase src --config webpack.dev.config.js"
}
```
### webpack-dev-middleware
webpack-dev-middleware 相当于一个内存型的文件系统，它会把 webpack 处理后的文件输出到服务器的内存根目录上。webpack 会根据我们的配置文件自动梳理出 entry 和 output 模块的关系脉络，然后 webpack-dev-middle 就在这个基础上形成一个文件映射系统，如果匹配到程序请求的文件，就会把内存中缓存的对应结果以文件的格式返回，否则就进入下一个中间件。webpack-dev-server 的实现其实也是在内部使用了它。
webpack-dev-server 实际上就相当于启用了一个 express 的 http 服务器并调用 webpack-dev-middleware。这个 http 服务器和 client 使用了 websocket 通讯协议，当源文件发生改变时，webpack-dev-server 就使用 webpack 进行实时编译，然后再用 webpack-dev-middleware 将 webpack 编译后文件会输出到内存中。
总的来说，webpack-dev-server 是封装好的，比较适合纯前端项目；而 webpack-dev-middle 只是一个中间件，我们可以定制自己的后端服务进行整合。所以对于我们前端人员来说，大多数场景下基本使用的都是 webpack-dev-server。
下面我们来看一下 webpack-dev-middle 具体怎么使用
首先，安装 `express` 和 `webpack-dev-middleware`
```
npm install --save-dev express webpack-dev-middleware
```
在 `webpack.dev.config.js` 中添加一个 `publicPath`
```
module.exports = {
    output: {
        publicPath: '/'
    }
}
```
在根目录下新建一个 `server.js `
```
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const config = require('./webpack.dev.config.js');
const compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath
}));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!\n');
});
```
使用 node 执行 server.js
```
node server.js
```
此时，打开浏览器对应的端口，应该可以看到程序已经运行了。
☆ 同样的，使用 `webpack-dev-middleware` 必须使用 `html-webpack-plugin` ，否则 HTML 文件无法正确输出到 `express` 服务器的根目录。
## 十一、JS 高级语法兼容
尽管现在新版本的浏览器已经能够识别大部分的 `es6` 语法，但是大部分时候我们还是要考虑一些低版本浏览器的兼容性，况且 js 的语法也一直在更新。所以为了让我们能够在项目中使用更多更高级的 js 语法，我们就需要有一个转换器来把高版本语法转为低版本语法，`babel` 就是这样的一个转换器。
我们可以来测试一下
首先在 `path/main.js` 中写入一段 es6 代码
```
const fn = () => console.log('这是es6的箭头函数')

fn()

class Person {
    constructor(name) {
        this.name = name
    }
}

const name = new Person('林').name
console.log(name)
```
这时，运行 `npm run dev` 打包后发现谷歌浏览器是可以正常执行的，没有任何问题，我们打开 `dev/bundle.js` ，可以看到，这两段 es6 代码还是原来的样子，webpack 并没有帮我们做任何转换
![image.png](https://upload-images.jianshu.io/upload_images/19423820-5c1fabf15b3a9729.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)但是如果是更高级的语法呢？我们再来看看下面这段代码
```
class Dog {
    name = 'Tom'
    static color = 'yellow'
}

const dog = new Dog()
console.log(dog.name)
console.log(Dog.color)
```
再次运行 `npm run dev` ，这时你可以看到，webpack 已经报错了，它并不能识别这一段代码
![image.png](https://upload-images.jianshu.io/upload_images/19423820-8f4a0ba5a6985cec.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
接着，我们来看一下配置 babel 之后是什么效果
首先，安装 `babel`
```
npm install babel-loader @babel/core @babel/preset-env -D
npm install @babel/plugin-proposal-class-properties -D
```
然后在 `webpack.dev.config.js` 中添加配置
```
module.exports = {
    module: {
        rules: [
             {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/env'],
                        plugins: [
                            '@babel/plugin-proposal-class-properties',
                        ],
                    }
                },
                // 排除被转换的目录
                exclude: /node_modules/
            }
        ]
    }
}
```
此时，再执行 `npm run dev` 可以看到浏览器的运行结果是一样的，但是我们再次打开 `dev/bundle.js` 可以看到我们刚刚添加的 es6 语法已经被转换成低版本的 js 语法
![image.png](https://upload-images.jianshu.io/upload_images/19423820-79339c8d4532b42e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
下面我们再来看一下这段代码，`generator` 语法
```
function *func() { 
    yield 1
    yield 2
    return 3
 }
 let newFn = func()
 console.log(newFn.next())
 console.log(newFn.next())
 console.log(newFn.next())
 console.log(newFn.next())
```
我们先把刚刚在 `webpack.dev.config.js` 中添加的 `babel` 配置注释掉，然后执行 `npm run dev`，可以看到，程序不依赖 babel 也能够正常执行
![image.png](https://upload-images.jianshu.io/upload_images/19423820-ddbd9cc8c6541511.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
但是当我们把 babel 的配置加上，却发现打包正常，但是程序执行会报错
![image.png](https://upload-images.jianshu.io/upload_images/19423820-4ea34cc31091ab3a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
为了解决因为 babel 转换导致的 generator 语法报错，我们需要再安装两个插件
```
npm install @babel/plugin-transform-runtime -D
npm install @babel/runtime -S
```
并且在 `webpack.dev.config.js` 中添加配置
```
module.exports = {
    module: {
        rules: [
             {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/env'],
                        plugins: [
                            '@babel/plugin-proposal-class-properties',
                            // 解决generator语法报错
                            '@babel/plugin-transform-runtime'
                        ],
                    }
                },
                // 排除被转换的目录
                exclude: /node_modules/
            }
        ]
    }
}
```
这样就能在使用 babel 的同时使用 generator 语法，并且代码也做了相应的语法转换
![image.png](https://upload-images.jianshu.io/upload_images/19423820-44837cbf881198bf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
那对于高版本的原型方法，babel 默认会不会转换呢？我们再来看一段
```
let arr = []
console.log(arr.includes('a'))

let str = '123'
console.log(str.includes('1'))
```
打包后可以看到，代码并没有被转换
![image.png](https://upload-images.jianshu.io/upload_images/19423820-3fff29a18d84e6e3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
也就是说，babel 默认是不会对高版本的原型方法做转换的，同样的，babel 提供了另外一个插件
```
npm install @babel/polyfill -S
```
安装后，在需要用到高版本原型方法的地方引入即可
```
import '@babel/polyfill'
```
或者在 `webpack.dev.config.js` 中的入口做配置
```
module.exports = {
    entry: ['@babel/polyfill', './path/main.js']
}
```
再次打包，可以看到代码已经被做了转换处理，这里转换后的代码比较长，我就不贴了。简的来说，就是引入了 es6 的语法包，然后再自定义了这个方法。
## 十二、source map的使用
在开发的过程中，我们经常需要通过在控制台查看报错信息或打印输出日志来追踪错误和警告在源代码中的原始位置，但是因为我们使用 babel 等转换器把源代码进行了转换，导致控制台输出的行数位置和我们实际的代码不一致，造成了代码调试的困难。`source map` 的作用就是为了解决这个问题，并且使用非常简单，只需要在 `webpack.dev.config.js` 中添加一句配置就可以将编译后的代码映射回原始源代码
```
module.exports = {
    devtool: 'cheap-module-eval-source-map'
}
```
`devtool` 有很多的值（详见 webpack 官网），这些值怎么来选择呢？
1、我们需要的是映射原始源代码的，而不是打包后的代码
2、带 `cheap` 关键字的表示开销很少的，也就是说这种模式下打包出来的 source map 会很小，因为source map 会占用额外的资源，所以我们要尽可能地减少它的开支
3、带 `eval` 关键字的更推荐使用，因为 source map 的原理是额外生成一个映射文件，如果不带 eval 的全部会单独生成一个文件，而带 eval 的不会生成额外的映射文件，而是通过 eval 函数在代码内部来实现的，也就是说 source map 的部分也会被打包进 `bundle.js` 中。
我们来验证一下，分别使用 `cheap-module-eval-source-map` 和 `cheap-module-source-map` 两种模式进行打包
![image.png](https://upload-images.jianshu.io/upload_images/19423820-3380695d0f247737.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![image.png](https://upload-images.jianshu.io/upload_images/19423820-69d6ad66f01b5378.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
对比可以看到，使用 `cheap-module-source-map` 打包后额外生成了一个 `.map` 文件，而 `cheap-module-eval-source-map` 却没有。但细心的朋友可以发现，后者虽然没有额外生成一个映射文件，但是 `bundle.js` 却比前者大了将近一倍多，那是不是意味着使用额外生成 `.map` 文件的反而比较好呢？其实不然，对于生产环境来说一倍的体积还是非常重要的，而 source map 更多是在开发环境使用的，开发时 500kb 或是 1m 对于我们本地服务来说影响可以说是微乎其微的，但是少了一个文件，却可以减少一次额外的请求。

综上，推荐选择使用 `cheap-module-eval-source-map`
☆ 注： 使用 source map 需要浏览器能够支持 JavaScript 的 source map 功能，并且确保该功能开启
## 十三、插件
webpack 有很多的插件，主要是用来解决一些 loader 无法完美实现的一些其他的事情，以方便我们的开发。前面我们已经用到了`HTMLWebpackPlugin` 这个插件， 这里再给大家介绍两个比较常用的
### clean-webpack-plugin
这个插件可以在我们执行打包的时候自动清除上一次打包后的目录，然后再重新生成。
首先安装插件
```
npm install clean-webpack-plugin -D
```
然后在 `webpack.dev.config.js` 的 `plugins` 选项中配置即可
```
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
module.exports = {
    plugins: [
        new CleanWebpackPlugin()
    ]
}
```
### BannerPlugin
这个插件主要用于为每个 `chunk` 文件头部添加版权注释信息，这是 webpack 的内置插件，所以不需要装包就可以直接在 `webpack.dev.config.js` 中使用
```
module.exports = {
    plugins: [
        new webpack.BannerPlugin({
            banner: '版权注释信息'
        })
        // 或 new webpack.BannerPlugin('版权注释信息')
    ]
}
```
### CopyWebpackPlugin
这个插件主要是在我们项目中有不需要参与打包的静态资源时，能够将静态资源文件原封不动的复制到打包输出的指定目录下，以保证静态资源的正常引用
同样地，先装包
```
npm install copy-webpack-plugin -D
```
然后再 `webpack.dev.config.js` 的 `plugins` 选项中做配置
```
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
module.exports = {
    plugins: [
        new new CopyWebpackPlugin([
            {
                // from: 源，从哪里拷贝，可以是相对路径或绝对路径，推荐绝对路径
                from: path.join(__dirname, 'assets'),
                // to: 目标，拷贝到哪里去，相对于 output 的路径，同样可以是相对路径或绝对路径，但是更推荐相对路径
                to: 'assets'
             }
        ])
    ]
}
```
## 十四、HTML 中 img 标签的图片资源处理 ⭐️
前面我们介绍了 `file-loader` 和 `url-loader` 这两种 loader 来处理图片资源，但这些图片是在 js 文件中引用的，但是还有一种情况，就是如果图片资源直接在 `index.html` 中引用的话，前面这两个 loader 都是不会对我们引用的图片进行打包处理的，甚至是我们刚刚介绍的 `CopyWebpackPlugin` 插件也只是通过把图片拷贝到打包目录下来辅助我们的使用，并没有真正通过 webpack 进行打包。下面就来介绍一下在 webpack 中如何真正地处理在 html 中通过 img 标签引用的图片。
首先安装 `html-withimg-loader`
```
npm install html-withimg-loader -D
```
然后在 `webpack.dev.config.js` 中配置即可
```
module.exports = {
    module: {
        rules: [
             {
                test: /\.(png|svg|jpg|gif)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        esModule: false
                    }
                }
             },
             {
                test: /\.(htm|html)$/i,
                use: 'html-withimg-loader'
              }
        ]
    }
}
```
☆ 需要注意的是，`html-withimg-loader` 同样需要搭配 ` file-loader` 或 `url-loader` 来使用，并且需要把 `options` 选项里的 `esModule` 设为 `false`
执行 `npm run dev` ，可以看到图片已经被打包，并且 `index.html ` 里 `img` 标签的 `src` 路径已经被替换成打包后的图片了
![image.png](https://upload-images.jianshu.io/upload_images/19423820-2edf8adefa314723.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 十五、多页应用的打包
当前 SPA 的开发模式似乎已经是前端应用的一个主流，特别是三大框架的出现，让前端开发者可以非常方便实现一个单页面应用，那么如何使用 webpack 来处理一个多页应用呢？下面我们就来简单看一下。
首先，我们在 `src` 目录下新建两个 html 和两个 js
```
src
  + index.html
  + other.html
  + index.js
  + other.js
```
然后修改 `webpack.dev.config.js` 的入口、出口和 `HTMLWebpackPlugin` 插件配置
```
module.exports = {
    entry: {
        index: './src/index.js',
        other: './src/other.js'
    },
    output: {
        path: path.resolve(__dirname, 'dev'),
        // 多入口无法对应一个固定的出口，所以按原始文件名输出
        filename: '[name].js',
    },
    plugins: [
        new HTMLWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
            // 对应 entry 的入口命名，指定打包后的 html 应该引入哪些 js 文件
            chunks: ['index']
        }),
        new HTMLWebpackPlugin({
            filename: 'other.html',
            template: './src/other.html',
            chunks: ['other']
        })
    ]
}
```
打包后可以看到，`dev` 目录下已经生成了多个 html 文件和 js 文件，并且 html 文件也可以正确引入我们指定的 js 文件
![image.png](https://upload-images.jianshu.io/upload_images/19423820-0c2c38e03dbb10ab.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
打开浏览器验证一下，可以看到已经实现了多页面的跳转 
![image.png](https://upload-images.jianshu.io/upload_images/19423820-74deffc6641cc7c8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 十六、引入第三方库
常用的第三方库引用方式就是在每个需要用到的模块通过 `import` 或 `require` 进行导入，但是如果希望能够在全局使用而不需要在每个模块进行单独的导入呢？这里介绍两种比较方便的引入方式，一种通过 `expose-loader` 进行全局变量的注入，另一种是使用内置插件 `webpack.ProvidePlugin` 对每个模块的闭包空间，注入一个变量，自动加载模块，这样就不需要在每个模块里面进行 import 或 require
### expose-loader 将库引入到全局作用域
安装 `expose-loader`
```
npm install expose-loader -D
```
在 `webpack.dev.config.js` 中配置
```
module.exports = {
    module: {
        rules: [
             {
                test: require.resolve('jquery'),
                use: {
                    loader: 'expose-loader',
                    options: '$'
                }
             }
        ]
    }
}
```
☆ `require.resolve` 用来获取模块的绝对路径，所以这里的 loader 只会作用于 jquery 模块，并且只在 bundle 中使用到它时，才进行处理
### webpack.ProvidePlugin 将库自动加载到每个模块
在 `webpack.dev.config.js` 中创建插件对象，把变量指向对应的 node 模块
```
module.exports = {
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })
    ]
}
```
## 十七、区分环境配置文件打包
前面我们也说到过，webpack 支持一个项目有多个配置文件。项目开发时一般需要使用两套配置文件，用于开发阶段打包（不压缩代码，不优化代码，增加效率）和上线阶段打包（压缩代码、优化代码，打包后直接上线使用），一般情况下，我们会抽取成三个配置文件：`webpack.base.js`、`webpack.prod.js`、`webpack.dev.js`。
首先，将开发环境和生产环境公用的配置放入 base 中，不同的配置各自放入 prod 或 dev 文件中（例如：mode）；然后，在 dev 和 prod 中使用 `webpack-merge` 把自己的配置与 base 的配置进行合并后导出；最后，在 `package.json` 中配置 `npm script` 脚本，通过 `--config` 手动指定特定的配置文件。
```
// ----------------------------------webpack.base.js----------------------------------
// 一般包括入口、出口、插件以及loader的配置
 const path = require('path')
 const HTMLWebpackPlugin = require('html-webpack-plugin')
 const { CleanWebpackPlugin } = require('clean-webpack-plugin')

 module.exports = {
    entry: {
        index: './src/index.js',
        other: './src/other.js'
    },
    output: {
        path: path.resolve(__dirname, 'dev'),
        filename: '[name].js',
    },
    plugins: [
        new HTMLWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
            chunks: ['index']
        }),
        new HTMLWebpackPlugin({
            filename: 'other.html',
            template: './src/other.html',
            chunks: ['other']
        }),
        new CleanWebpackPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }, {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader',
                ]
            }, {
                test: /\.s(a|c)ss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }, {
                test: /\.(png|svg|jpg|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        esModule: false,
                        limit: 2 * 1024, // 小于5kb转base64
                        outputPath: 'media/images', // 自定义打包后的图片输出路径
                        name: '[name]-[hash:4].[ext]' // 自定义打包后的图片名字,hash:n,n为hash长度
                    }
                }
            }, {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: 'file-loader'
            }, {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/env'],
                        plugins: [
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-transform-runtime'
                        ],
                    }
                },
                exclude: /node_modules/
            }, {
                test: /\.(htm|html)$/i,
                use: 'html-withimg-loader'
            }
        ]
    }
 }

// ----------------------------------webpack.dev.js ----------------------------------
// 一般包括 mode、source-map以及开发服务器 dev-server 的配置
 const merge = require('webpack-merge')
 module.exports = merge(require('./webpack.base.js'), {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    devServer: {
        // 自动打开浏览器
        open: true,
        // 热更新
        hot: true,
        // 文件压缩
        compress: true,
        // 自定义端口
        port: 3001,
        // 自定义根目录
        contentBase: './src'
    }
 })

// ----------------------------------webpack.prod.js----------------------------------
// 配置mode
const merge = require('webpack-merge')
module.exports = merge(require('./webpack.base'), {
    mode: 'production'
})
```
配置两个 `npm script` 脚本
```
"scripts": {
    "start": "webpack-dev-server --config webpack.dev.js",
    "build": "webpack --config webpack.prod.js"
}
```
一般情况下，我们不会把所有配置文件放在根目录下，而是把它们统一归类到一个 `config` 文件夹里
```
+ config
    webpack.base.js
    webpack.dev.js
    webpack.prod.js
```
配置文件和 `npm script` 脚本也要做相应的修改，否则执行的时候会有文件路径问题
☆ 在 webpack 的配置文件中，相对路径是一直以根目录为基准的，但是绝对路径的 `__dirname` 指的是当前配置文件所在目录
```
// ----------------------------------webpack.base.js----------------------------------
 const path = require('path')
 module.exports = {
    output: {
        // 如果使用了相对路径则不需要修改，绝对路径需要拼接正确的路径，..代表往上一级目录
        path: path.resolve(__dirname, '..', 'dev'),
        filename: '[name].js',
    }
 }

// ----------------------------------npm script 脚本----------------------------------
"scripts": {
    "start": "webpack-dev-server --config ./config/webpack.dev.js",
    "build": "webpack --config ./config/webpack.prod.js"
 }
```
这样我们就可以将配置文件统一归类到 `config` 目录下，在开发阶段直接执行 `npm run start` 打开 `dev-server` 服务器调试项目，在上线阶段执行 `npm run build` 进行文件打包
## 十八、定义环境变量
某些情况下我们需要在业务代码中区分当前项目是处于开发阶段还是上线阶段，比如当后端在开发环境和生产环境提供两个不同的 API 地址时。
webpack 提供了一个内置插件 `DefinePlugin` 来让我们定义一个环境变量，最终可以实现开发阶段与上线阶段的 api 地址自动切换。
```
// ----------------------------------webpack.dev.js----------------------------------
 const webpack = require('webpack')
 module.exports = {
    plugins: [
        new webpack.DefinePlugin({
            NODE_ENV: '"dev"'
        })
    ],
 }

// ----------------------------------webpack.prod.js----------------------------------
 const webpack = require('webpack')
 module.exports = {
    plugins: [
        new webpack.DefinePlugin({
            NODE_ENV: '"prod"'
        })
    ],
 }
```
这样我们就可以在项目每个模块的业务代码中使用 NODE_ENV 变量，需要注意的是定义的时候变量的值需要加引号，引号里的内容会被解析成表达式，当成 JS 代码执行，有点类似于 eval 函数
## 十九、http-proxy 解决跨域
前端开发者都知道，由于浏览器的同源策略，在向后端请求数据的时候，会遇到跨域的问题。目前解决跨域的主要方案有：jsonp、cors、http-proxy
jsonp 是一种非官方推荐的解决方案，它其实就是创建了 script 标签，实现了去其他域获取 js 脚本，请求的 js 脚本会返回一个函数调用，函数的实参就包含了需要从后台获取的数据。说白了就是利用浏览器的漏洞变相实现了跨域。由于它不是 ajax 请求，所以无法设置请求的方法，默认只支持 get 请求。jsonp 在早期还是比较常用的，但是慢慢地就被 cors 的方案给代替了。
cors 即跨域资源共享，应该是目前最主流的跨域解决方案了，就是在数据接口服务器在响应数据的时候添加一个响应头信息去信任请求的客户端，很明显这是后端开发者的工作。那如果没有后端配合呢？这时候就需要用到 http-proxy 了。
http-proxy 其实就是 http 请求代理，原理很简单，就是客户端浏览器直接访问本域服务器，proxy 再将 ajax 请求转发给数据接口服务器。
这里要介绍的 devServer 解决跨域，其原理就是 http-proxy。也就是将所有 ajax 请求发送给 devServer 服务器，再由 devServer 服务器做一次转发，发送给数据接口服务器。由于 ajax 是发送给 devServer 服务器的，所以不存在跨域，而 devServer 是用 node 平台发送的 http 请求，自然也不涉及到跨域问题。
使用 `devServer` 来配置 http 转发只需要在开发环境的配置文件中添加 `proxy`
```
// ----------------------------------webpack.dev.js ----------------------------------
 const merge = require('webpack-merge')
 module.exports = merge(require('./webpack.base.js'), {
    devServer: {
        // 自动打开浏览器
        open: true,
        // 热更新
        hot: true,
        // 文件压缩
        compress: true,
        // 自定义端口
        port: 3001,
        // 自定义根目录
        contentBase: './src',
        // http 代理
        proxy: {
            // 当前端请求本域以 /api 开头的地址时，会将请求转发到 http://10.8.20.28:8080
            '/api': 'http://10.8.20.28:8080'
        }
    }
 })
```
在业务代码中使用请求，注意接口地址不需要再拼接域名
```
axios.get('/api/getInfo').then(res => console.log(res))
```
如果后端 api 地址不是固定以 /api 开头的呢？我们也同样可以自定义一个 /api，然后再把地址进行重写
```
// ----------------------------------webpack.dev.js ----------------------------------
 const merge = require('webpack-merge')
 module.exports = merge(require('./webpack.base.js'), {
    devServer: {
        // http 代理
        proxy: {
            // 此时 /api 是前端自己加的，只是为了统一代理转发
            '/api': {
                target: 'http://10.8.20.28:8080',
                // 重写地址，把前端自己加的 /api 消除
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    }
 })
```
## 二十、HMR 的简单使用
HMR 即模块热替换，就是通过 `module.hot.accept` 方法进行文件监视，从而对某个模块进行热更新。只要模块内容发生变化，就会触发回调函数，从而可以重新读取模块内容，做对应的操作
我们可以新建一个 `hotmodule.js` 作为监视的文件，然后在 `index.js` 中写入下面的代码对 `hotmodule.js` 进行监听，当 `hotmodule.js` 被修改了，可以看到浏览器不会刷新，但是控制台会打印输出最新的信息
```
if (module.hot) {
    module.hot.accept('./hotmodule.js', () => {
        console.log('hotmodule.js更新了')
        let hot = require('./hotmodule.js')
        console.log(hot)
    })
}
```