---
title: vite+react企业项目配置
sidebarDepth: 2
date: 2023-6-13
author: Issho Lin
tags:
 - 项目配置
categories:
 - 前端工程化
---

## 一、环境变量
使用多环境变量配置（.env.local、.env.dev、.env.test、.env.prod等），配置了不同环境的API接口地址，支持开发、测试、生产等多环境部署。

在项目根目录下新建`.env.xxx`文件，然后定义需要的环境变量

```plain
VITE_APP_ENV=local
VITE_APP_IP=http://10.245.1.52:9081
```

接着在`package.json`文件中配置对应的脚本，执行不同的脚本应用不同的环境变量。

`--mode`后面带上对应的`.env`文件的后缀即可：

```json
{
  "scripts": {
    "build:xxx": "vite build --mode xxx",
    "dev": "vite --host"
  },
}
```

> 本地开发执行dev脚本，默认应用.env.local文件
>

利用这个执行机制，可以利用nodejs脚本动态写入环境变量，这样在打包时就可以通过终端命令动态指定API接口地址

```bash
yarn build:cmd --ip=http://10.245.1.52:9081
```

实现步骤：

+ 获取命令行参数
+ 创建`.env.cmd`文件
+ 将参数按照环境变量的格式写入文件
+ `package.json`配置执行`.env.cmd`的脚本
+ 执行脚本命令

代码如下：

```javascript
const { spawn } = require('child_process')
const fs = require('fs')

const args = process.argv.find((arg) => arg.startsWith('--ip='))

if (!args) {
  console.warn('请使用--ip=xxx指定ip地址')
  return
}

const ip = args.split('=')[1]
const VITE_APP_IP = `${ip.startsWith('http') ? ip : 'http://' + ip}`

console.log(`ip=${VITE_APP_IP}`)

const filePath = './.env.cmd'
const content = `
VITE_APP_ENV=prod
VITE_APP_IP=${VITE_APP_IP}
`

fs.access(filePath, (err) => {
  if (err) {
    console.log(`文件${filePath}不存在，将创建文件并写入内容`)
    fs.writeFile(filePath, content, (err) => {
      if (err) throw err
      console.log(`文件${filePath}创建并写入成功`)
    })
  } else {
    console.log(`文件${filePath}已存在，将写入内容`)
    fs.writeFile(filePath, content, (err) => {
      if (err) throw err
      console.log(`文件${filePath}写入成功`)
    })
  }
})

const command = (...args) => {
  return new Promise((resolve) => {
    const proc = spawn(...args)
    proc.stdout.pipe(process.stdout)
    proc.stderr.pipe(process.stderr)
    proc.on('close', () => resolve())
  })
}

command(process.platform === 'win32' ? 'yarn.cmd' : 'yarn', [
  'run',
  'build:runcmd',
])
```

```json
{
  "scripts": {
    "build:cmd": "node build.cjs",
    "build:runcmd": "vite build --mode cmd",
  }
}
```

## 二、开发服务代理
把API接口地址转发到env环境变量配置的地址，解决跨域；顺便把服务地址添加到响应头里，便于和后端扯皮。

```typescript
import { defineConfig, loadEnv } from 'vite'
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return defineConfig({
    server: {
      proxy: {
        '/api': {
          target: env.VITE_APP_IP,
          changeOrigin: true,
          secure: false,
          rewrite: (url: string) => url.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              proxyRes.headers['x-real-url'] = env.VITE_APP_IP
            })
          },
        },
      },
      hmr: {
        protocol: 'ws',
        host: 'localhost',
      },
    }
  })
}
```

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741854049513-e6a1b43e-cef9-498a-a02f-de21908df32f.png)

## 三、路径别名
配置路径别名，方便模块导入

```typescript
import path from 'path'
export default ({ mode }) => {
  return defineConfig({
    resolve: {
      alias: [
        {
          find: '@store',
          replacement: path.resolve(__dirname, 'src', 'store'),
        },
        {
          find: '@',
          replacement: path.resolve(__dirname, 'src'),
        }
      ],
    }
  })
}
```

导入模块时，直接使用路径别名

```typescript
import { useUserStore } from '@store/user'
import { Form, Icon } from '@/components'
```

## 四、支持响应式布局
开发可视化大屏时，需要使用响应式布局，把css文件的`px`单位自动转成`vw`，同时要跟其他的文件区分开。

借助插件`postcss-px-to-viewport-8-plugin`可以将约定后缀为`.vw.module.less`的文件进行单位转换。

```typescript
import pptv from 'postcss-px-to-viewport-8-plugin'
const load_pptv: any = pptv({
  unitToConvert: 'px',
  viewportWidth: 1920,
  unitPrecision: 3,
  propList: ['*'],
  viewportUnit: 'vw',
  fontViewportUnit: 'vw',
  minPixelValue: 1,
  mediaQuery: true,
  replace: true,
  // include: [/src/],
  exclude: [/^((?!\.vw.module.less).)*$/],
  // include: [/\/src\/pages\/\/home/],
  // exclude: [/node_modules/],
  landscape: false,
})
export default ({ mode }) => {
  return defineConfig({
    css: {
      postcss: {
        plugins: [load_pptv],
      }
    }
  })
}
```

## 五、文件分包
分包之前可以先借助插件`rollup-plugin-visualizer`查看一下项目依赖的大小关系

```typescript
import { visualizer } from 'rollup-plugin-visualizer'
export default ({ mode }) => {
  return defineConfig({
    plugins: [
      visualizer()
    ]
  })
}
```

执行打包后，会在根目录下生成一个`stats.html`文件，浏览器打开就可以看到项目下各种包的大小和依赖关系

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741855653899-ecf11430-04f1-40e0-88f8-31fa1fb8a08e.png)

然后就可以根据项目情况，对项目进行分包。

`manualChunks`函数会处理每个被解析的模块，参数为模块绝对路径，如果函数返回字符串，那么该模块及其所有依赖将被添加到以返回字符串命名的自定义 chunk 中。

`chunkFileNames`可以用来划分文件到子目录，并对文件名添加哈希。

```typescript
export default ({ mode }) => {
  return defineConfig({
    build: {
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString()
            }
            if (id.includes('/routes/')) {
              return 'routes'
            }
            if (id.includes('/src/router/')) {
              console.log(id)
              return 'router'
            }
            if (id.includes('/src/locales/')) {
              return 'locales'
            }
            if (id.includes('/src/api/')) {
              return 'api'
            }
            if (id.includes('/src/hooks/')) {
              return 'hooks'
            }
            if (id.includes('/src/components/')) {
              return 'components'
            }
          },
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId.split('/')
              : []
            const fileName = facadeModuleId[facadeModuleId.length - 2] || '[name]'
            return `js/${fileName}/[name].[hash].js`
          },
        },
      }
    }
  })
}
```

打包后效果如下：

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741856670056-28a6b930-b4ef-4433-a92f-cc4d4a3397c1.png)

## 六、代码规范控制
+ ESLint：继承@umijs/fabric配置
+ Prettier：基于@umijs/fabric配置
+ StyleLint：使用@umijs/fabric的样式规范

```bash
yarn add @umijs/fabric prettier -D
```

```javascript
module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'no-multi-spaces': ['error'],
    'keyword-spacing': ['error', { before: true }],
    'key-spacing': ['error', { afterColon: true }],
    'comma-spacing': ['error', { before: false, after: true }],
    'arrow-spacing': ['error', { before: true, after: true }],
    'block-spacing': ['error'],
    'object-curly-spacing': ['error', 'always'],
    'space-infix-ops': ['error'],
    'space-before-blocks': ['error'],
    'global-require': 0,
    eqeqeq: ['error', 'always'],
    'no-spaced-func': ['error'],
    'no-empty': ['error', { allowEmptyCatch: true }],
    'use-isnan': ['error'],
    'default-case': ['error'],
    'no-empty-function': ['error'],
    'no-eval': ['error'],
    'no-fallthrough': ['error'],
    'no-global-assign': ['error'],
    'prefer-promise-reject-errors': ['error'],
    radix: ['error'],
    'require-await': ['error'],
    'brace-style': ['error'],
    'jsx-quotes': ['error'],
    'max-depth': ['error', 4],
    'max-nested-callbacks': ['error', 4],
    'dot-notation': 'off',
    '@typescript-eslint/dot-notation': 'off',
  },
}
```

```javascript
const fabric = require('@umijs/fabric')

module.exports = {
  ...fabric.prettier,
  semi: false,
  eslintIntegration: true,
}
```

```javascript
module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/stylelint')],
}
```

## 七、代码提交规范
1. gitHooks + lint-staged 实现代码提交前自动prettier格式化

```bash
yarn add yorkie lint-staged -D
```

```bash
{
  "gitHooks": {
    "pre-commit": "lint-staged"
  },
  "lint-staged": {
    "*.{js,jsx,less,md,json}": [
      "prettier --write"
    ],
    "*.ts?(x)": [
      "prettier --parser=typescript --write"
    ]
  }
}
```

2. gitHooks + commitlint 实现代码commit日志规范

```bash
yarn add @commitlint/cli @commitlint/cz-commitlint commitizen commitlint-config-cz cz-git -D
```

```bash
{
  "gitHooks": {
    "commit-msg": "commitlint --edit"
  },
  "config": {
    "commitizen": {
      "path": "node_modules/cz-git"
    }
  },
  "scripts": {
    "commit": "git-cz"
  }
}
```

在根目录下新建一个`.commitlintrc.cjs`文件

```javascript
/** @type {import('cz-git').UserConfig} */
module.exports = {
  rules: {
    "header-max-length": [0, "always", 72],
  },
  prompt: {
    types: [
      { value: '✨feat', name: 'feat:   添加新的功能开发' },
      { value: '🐛fix', name: 'fix:    修复一个Bug' },
      { value: '📝docs', name: 'docs:   变更的只有文档' },
      { value: '💄style', name: 'style:    仅添加或更新UI和样式文件' },
      { value: '💡comments ', name: 'comments:    添加或更新注释' },
      { value: '♻️refactor', name: 'refactor:   代码重构' },
      { value: '⚡️perf', name: 'perf:   提升性能' },
      { value: '✅test', name: 'test:   添加一个测试' },
      { value: '🔧config', name: 'config:   添加或更新配置文件' },
      { value: '⏪revert', name: 'revert:    代码回退' },
      { value: '🎉begin', name: 'begin:    开始新项目' },
      { value: '🔨ci', name: 'ci:   添加或更新开发脚本' },
      { value: '🔥remove', name: 'remove:   仅删除代码或文件' },
      { value: '🔖release', name: 'release:    版本/标签' },
      { value: '➕install', name: 'install:    安装依赖' },
      { value: '➖uninstall', name: 'uninstall:    删除依赖' },
      { value: '⬆️upgrade', name: 'upgrade:   升级依赖' },
      { value: '⬇️downgrade', name: 'downgrade:   降级依赖' },
      { value: '🏷️type', name: 'type:   仅添加或更新ts类型' },
    ],
    messages: {
      type: '选择一种你的提交类型:',
      // scope: '选择一个scope (可选):',
      customScope: 'Denote the SCOPE of this change:',
      subject: '短说明:\n',
      body: '长说明，使用"|"换行(可选)：\n',
      breaking: '非兼容性说明 (可选):\n',
      footer: '关联关闭的issue，例如：#31, #34(可选):\n',
      confirmCommit: '确定提交说明?(yes/no)',
    },
    allowCustomScopes: false,
    allowBreakingChanges: ['feat', 'fix'],
    maxSubjectLength: 100,
  }
}

```

代码提交时，用`yarn commit`代替`git commit -m`

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741858430239-88cad6a6-951c-4304-b6ec-43e85366f595.png)

日志效果如下：

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741858526653-04506e23-68e1-4eef-90a1-3bdd0fe5c920.png)

