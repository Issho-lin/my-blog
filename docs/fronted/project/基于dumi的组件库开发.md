---
title: 基于dumi的组件库开发
sidebarDepth: 2
date: 2021-10-25
author: Issho Lin
tags:
 - 组件库
categories:
 - 前端工程化
---

## 一、搭建项目
1. 使用 npx 命令初始化一个新的 dumi 组件库项目

```bash
npx create-dumi --yes
```

2. 项目选择了以下配置：
+ 选择了 React Library 模板
+ 包管理工具选择了 pnpm
+ 项目名称，作为后期npm发布的包名
+ 项目描述，自定义
+ 项目作者，自定义

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741075715380-374650d8-baf5-4a27-9cf8-98f6902ec429.png)

3. 项目结构包括：
+ dumi 配置文件 (.dumirc.ts)
+ 代码规范配置 (.eslintrc.js, .prettierrc.js, .stylelintrc)
+ TypeScript 配置 (tsconfig.json)
+ 构建配置 (.fatherrc.ts)
+ Git Hooks 配置 (.husky)
+ 示例组件 (src/Foo)
+ 文档目录 (docs)

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741075868623-5f30e89a-48a0-4a7e-9258-185d7d9921d7.png)

4. npm命令解释
+ start/dev：启动开发服务器
+ build：构建组件库
+ build:watch：监听模式构建
+ docs:build：构建文档
+ docs:preview：预览文档
+ prepare：安装git hooks和设置环境
+ doctor：项目健康检查
+ lint相关：代码规范检查
+ prepublishOnly：发布前检查和构建

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741076125051-b532e7dc-0c80-4beb-b799-728ba4b0e6b6.png)

## 二、组件开发
1. 启动开发服务器

```bash
pnpm start
```

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741076404432-8228eb6a-91b6-490a-b460-64149331f239.png)

2. 开发新组件
    1. 在`src`目录下添加组件目录，例如`Button`，然后分别新建一个`.tsx`、`.less`以及`.md`文件

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741076844616-02802612-bf05-4a9d-9afc-11357408f7e1.png)

    2. `.tsx`和`.less`负责开发组件，就跟平时封装组件一样，注意规范开发就行了

```typescript
import React from 'react';
import './index.less';

export interface ButtonProps {
  /**
   * @description 按钮类型
   * @default 'default'
   */
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
  /**
   * @description 按钮大小
   * @default 'middle'
   */
  size?: 'large' | 'middle' | 'small';
  /**
   * @description 是否禁用
   * @default false
   */
  disabled?: boolean;
  /**
   * @description 按钮内容
   */
  children?: React.ReactNode;
  /**
   * @description 点击事件
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<ButtonProps> = ({
  type = 'default',
  size = 'middle',
  disabled = false,
  children,
  onClick,
}) => {
  const classes = ['gdesign-btn', `gdesign-btn-${type}`, `gdesign-btn-${size}`];
  if (disabled) {
    classes.push('gdesign-btn-disabled');
  }

  return (
    <button
      type="button"
      className={classes.join(' ')}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
export default Button;
```

```less
.gdesign-btn {
  outline: none;
  position: relative;
  display: inline-block;
  font-weight: 400;
  white-space: nowrap;
  text-align: center;
  background-image: none;
  background-color: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  user-select: none;
  touch-action: manipulation;
  padding: 4px 15px;
  border-radius: 2px;

  &:focus {
    outline: none;
  }

  &-large {
    padding: 6px 20px;
    font-size: 16px;
  }

  &-small {
    padding: 2px 10px;
    font-size: 12px;
  }

  &-primary {
    color: #fff;
    background-color: #1890ff;
    border-color: #1890ff;

    &:hover {
      background-color: #40a9ff;
      border-color: #40a9ff;
    }
  }

  &-default {
    background-color: #fff;
    border-color: #d9d9d9;
    color: rgba(0, 0, 0, 0.85);

    &:hover {
      color: #40a9ff;
      border-color: #40a9ff;
    }
  }

  &-dashed {
    background-color: #fff;
    border-color: #d9d9d9;
    border-style: dashed;
    color: rgba(0, 0, 0, 0.85);

    &:hover {
      color: #40a9ff;
      border-color: #40a9ff;
    }
  }

  &-text {
    border-color: transparent;
    color: rgba(0, 0, 0, 0.85);

    &:hover {
      background-color: rgba(0, 0, 0, 0.018);
    }
  }

  &-link {
    border-color: transparent;
    color: #1890ff;

    &:hover {
      color: #40a9ff;
    }
  }

  &-disabled {
    cursor: not-allowed;
    color: rgba(0, 0, 0, 0.25);
    background-color: #f5f5f5;
    border-color: #d9d9d9;

    &:hover {
      color: rgba(0, 0, 0, 0.25);
      background-color: #f5f5f5;
      border-color: #d9d9d9;
    }
  }
}
```
3. `.md`文件负责生成组件说明文档，支持markdown语法，`jsx` 和`tsx` 的代码块将会被 dumi 解析为 React 组件
4. 写`.md`文件之前记得先导出组件

```typescript
export { default as Button } from './Button'
```

```markdown
# Button 按钮

按钮是一种常用的交互组件，用于触发操作。

## 代码演示

## 按钮类型

按钮有五种类型：主按钮、次按钮、虚线按钮、文本按钮和链接按钮。

``tsx
import React from 'react';
import { Button } from 'gdesign';

export default () => (
  <div style={{ display: 'flex', gap: '8px' }}>
    <Button type="primary">Primary Button</Button>
    <Button>Default Button</Button>
    <Button type="dashed">Dashed Button</Button>
    <Button type="text">Text Button</Button>
    <Button type="link">Link Button</Button>
  </div>
);
``

## 按钮尺寸

按钮有三种尺寸：大、中、小。

``tsx
import React from 'react';
import { Button } from 'gdesign';

export default () => (
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
    <Button size="large">Large Button</Button>
    <Button>Default Button</Button>
    <Button size="small">Small Button</Button>
  </div>
);
``

## 禁用状态

按钮不可用状态。

``tsx
import React from 'react';
import { Button } from 'gdesign';

export default () => (
  <div style={{ display: 'flex', gap: '8px' }}>
    <Button type="primary" disabled>
      Primary(disabled)
    </Button>
    <Button disabled>Default(disabled)</Button>
    <Button type="dashed" disabled>
      Dashed(disabled)
    </Button>
    <Button type="text" disabled>
      Text(disabled)
    </Button>
    <Button type="link" disabled>
      Link(disabled)
    </Button>
  </div>
);
``

## API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 按钮类型 | `'primary'` \| `'default'` \| `'dashed'` \| `'text'` \| `'link'` | `'default'` |
| size | 按钮大小 | `'large'` \| `'middle'` \| `'small'` | `'middle'` |
| disabled | 是否禁用 | `boolean` | `false` |
| onClick | 点击按钮时的回调 | `(event) => void` | - |
```

5. 以上代码块将会被渲染成

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741077310513-5717b173-634a-4446-b205-6c8d4d4aa362.png)

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741077344201-aa7aaba6-7230-4b1d-be7b-1e69c53bac9b.png)

## 三、文档导航
配置导航栏，需要在 `.dumirc.ts` 文件中的 `themeConfig` 中添加相关配置。我们可以设置导航栏的logo、菜单项、链接等内容，还可以配置是否显示搜索框、Github链接等功能

```typescript
import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'gdesign',
    nav: [
      { title: '指南', link: '/guide' },
      { title: '组件', link: '/components/button' },
      { title: '其他', link: 'xxxx' }
    ],
    socialLinks: {
      github: 'https://github.com/your-username/gdesign'
    },
    footer: 'Made with ❤️ by GDesign Team',
    showSearch: true,
  },
});
```

## 四、打包发布
1. 首先需要在package.json中配置正确的包名和版本号，然后使用father进行组件库打包。

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741078522741-5bf1cabf-ea82-4e85-9605-f67a90091de2.png)

```bash
pnpm run build
```

2. 打包完成后，产物在`dist`目录，可以通过`<font style="color:#DF2A3F;">npm publish</font>`发布到npm仓库。

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741078779133-2453cf66-5669-4ac6-9a09-40f38be49171.png)

3. 发布前需要确认 package.json 中的配置：
+ name: "gdesign"
+ version: "0.0.1"
+ files："dist”
+ publishConfig.access: "public"
+ 入口文件：dist/index.js
+ 类型文件：dist/index.d.ts

> npm 具体发布流程参考另一篇文章[《npm包发布流程》](https://linqibin.yuque.com/dt76dr/hly35a/gfo1bgklu92q9xg2)
>

4. 在其他项目中可以通过npm install安装并引入使用组件。

```bash
npm install gdesign
# or
pnpm add gdesign
```

```typescript
import { Button } from 'gdesign';

....

<Button type="primary">按钮</Button>
```

## 五、文档部署
首先执行docs:build命令来构建文档站点，这将生成静态文件到docs-dist目录。

```bash
pnpm run docs:build
```

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741080519716-9f1c80e2-283c-428d-8e82-a053277d004e.png)

文档构建完成后，生成的静态文件位于 docs-dist 目录中。你可以将这些文件部署到以下任一平台：

1. GitHub Pages
+ 创建一个 GitHub 仓库
+ 将 docs-dist 目录下的文件推送到 gh-pages 分支
2. Netlify
+ 连接你的 GitHub 仓库
+ 设置构建命令为 npm run docs:build
+ 设置发布目录为 docs-dist
3. Vercel
+ 导入你的 GitHub 仓库
+ 平台会自动检测到 dumi 配置
+ 自动部署文档站点

部署完成后，你就可以通过公网访问组件库文档了。选择这些平台的任意一个，都能获得：

+ 自动化的部署流程
+ HTTPS 支持
+ 自定义域名选项
+ CDN 加速

