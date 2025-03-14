---
title: 微前端-qiankun接入流程
sidebarDepth: 3
date: 2022-03-01
author: Issho Lin
tags:
 - 微前端
categories:
 - 微前端
---

## 一、搭建主应用
1. 使用webpack搭建一个react应用，在`src`目录下添加一个`register.ts`文件，添加子应用的注册函数

```typescript
import { registerMicroApps, start } from "qiankun";

export default function () {
  registerMicroApps([
    {
      name: "vue-cli",
      entry: "http://localhost:8080",
      container: "#container",
      activeRule: "/micro-vcli",
    },
    {
      name: "create-react-app",
      entry: "http://localhost:3001",
      container: "#container",
      activeRule: "/micro-cra",
    },
    {
      name: "vite-vue",
      entry: "http://localhost:5173",
      container: "#container",
      activeRule: "/micro-viv",
    },
    {
      name: "vite-react",
      entry: "http://localhost:5174",
      container: "#container",
      activeRule: "/micro-vir",
    },
    {
      name: "umi-app",
      entry: "http://localhost:8000",
      container: "#container",
      activeRule: "/micro-umi",
    },
  ]);

  start();
}
```

`entry`是子应用的URL地址；`container`是子应用挂载的容器ID，全局唯一；`activeRule`是子应用在主应用里对应的路由，与主应用的路由配置保持一致。

2. 在主应用的入口文件处注册子应用

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import registerMicroApps from "./register";

registerMicroApps(); // 注册子应用

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
```

3. 配置主应用路由表，路由path对应子应用注册函数的activeRule

```typescript
import React from "react";
import { ReadOutlined, AntDesignOutlined } from "@ant-design/icons";

export default {
  route: {
    path: "/",
    routes: [
      {
        path: "/micro-vcli", // 对应activeRule
        name: "vue-cli子应用",
        icon: <ReadOutlined />,
      },
      {
        path: "/micro-cra",
        name: "cra子应用",
        icon: <AntDesignOutlined />,
      },
      {
        path: "/micro-viv",
        name: "vite-vue子应用",
        icon: <ReadOutlined />,
      },
      {
        path: "/micro-vir",
        name: "vite-react子应用",
        icon: <AntDesignOutlined />,
      },
      {
        path: "/micro-umi",
        name: "umi子应用",
        icon: <ReadOutlined />,
      },
    ],
  },
};
```

4. 放置子应用挂载容器，容器ID对应子应用注册函数的`container`

```typescript
import React, { useState, useEffect } from "react";
import { ProLayout } from "@ant-design/pro-components";
import { Link, useLocation } from "react-router-dom";
import menu from "./menu";

const Layout: React.FC = () => {
  const location = useLocation();
  const [pathname, setPathname] = useState("");
  useEffect(() => {
    setPathname(location.pathname);
  }, [location]);
  return (
    <div style={{ height: "100vh" }}>
      <ProLayout
        {...menu}
        logo="https://gw.alipayobjects.com/zos/antfincdn/upvrAjAPQX/Logo_Tech%252520UI.svg"
        title="微前端主应用"
        location={{ pathname }}
        menuItemRender={(item, dom) => {
          return <Link to={item.path || "/"}>{dom}</Link>;
        }}
      >
        // 主应用路由加载子应用挂载到这里
        <div id="container">{/* <Outlet /> */}</div>
      </ProLayout>
    </div>
  );
};

export default Layout;
```

## 二、子应用：vue-cli
1. 在`src`目录下新建一个`public-path.js`文件

```typescript
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

2. 配置路由，同时兼容作为子应用运行或独立运行，路由前缀需要与主应用中配置的路由一致

```typescript
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("./views/Home.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("./views/About.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(
    // 添加子应用路由前缀
    window.__POWERED_BY_QIANKUN__ ? "/micro-vcli" : "/"
  ),
  routes,
});

export default router;
```

3. 修改`src/main.js`，向主应用暴露一个`mount`方法和`unmount`方法

```typescript
import "./public-path";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

let app = null;

function render(props = {}) {
  const { container } = props;
  app = createApp(App);
  app.use(router).mount(container ? container.querySelector("#app") : "#app");
}

if (!window.__POWERED_BY_QIANKUN__) {
  render();
}
export async function bootstrap() {
  console.log("[micro-vcli] vue app bootstraped");
}
export async function mount(props) {
  console.log("[micro-vcli] vue app mount", props);
  render(props);
}
export async function unmount(props) {
  console.log("[micro-vcli] vue app unmount", props);
  app.unmount();
  app = null;
}
```

4. 运行结果

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1740994100237-7fe80a39-556d-49e9-a68e-3ad034c2cb6c.png)

## 三、子应用：create-react-app
1. 在`src`目录下新建一个`public-path.js`文件

```typescript
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

2. 配置路由，同时兼容作为子应用运行或独立运行，路由前缀需要与主应用中配置的路由一致

```typescript
import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom";
import logo from "./logo.svg";
import "./App.css";

function App() {
  return (
    <BrowserRouter
      // 添加子应用路由前缀
      basename={window.__POWERED_BY_QIANKUN__ ? "/micro-cra" : "/"}
    >
      <Routes>
        <Route
          path="/"
          element={
            <div className="App">
              <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <div>
                  <Link to="/home">首页</Link> |<Link to="/user">用户</Link>
                </div>
                <div>
                  <Outlet />
                </div>
              </header>
            </div>
          }
        >
          <Route path="/home" element={<div>这是首页</div>} />
          <Route path="/user" element={<div>这是用户中心</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

3. 修改`src/index.js`，向主应用暴露一个`mount`方法和`unmount`方法

```typescript
import "./public-path"; // 一定要写在最顶部
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./index.css";

let root = null;

function render(props) {
  const { container } = props;
  const dom = container
    ? container.querySelector("#app")
    : document.querySelector("#app");
  root = ReactDOM.createRoot(dom);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

if (!window.__POWERED_BY_QIANKUN__) {
  render({});
}

export async function bootstrap() {
  console.log("[micro-cra] react app bootstraped");
}

export async function mount(props) {
  console.log("[micro-cra] react app mount", props);
  render(props);
}

export async function unmount(props) {
  console.log("[micro-cra] react app unmount", props);
  root.unmount();
  root = null;
}
```

4. 运行结果

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1740994065457-2157405e-3bfb-42fc-8c04-c3b988e9faa1.png)

## 四、子应用：vite+vue
1. 安装插件`vite-plugin-qiankun`，示例版本`^1.0.15`

```bash
yarn add vite-plugin-qiankun -D
```

2. 在`vite.config.ts`中配置插件

```javascript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import qiankun from "vite-plugin-qiankun";

// https://vitejs.dev/config/
export default ({ mode }) => {
  const __DEV__ = mode === "development";
  return defineConfig({
    server: {
      port: 5173,
      origin: "//localhost:5173",
    },
    preview: {
      port: 4173,
    },
    base: __DEV__ ? "/" : "http://localhost:4173/",
    plugins: [
      vue(),
      // 配置qiankun插件
      qiankun("micro-viv", {
        useDevMode: true,
      }),
    ],
  });
};
```

3. 配置路由，同时兼容作为子应用运行或独立运行，路由前缀需要与主应用中配置的路由一致

```javascript
import { createRouter, createWebHistory } from "vue-router";
import { qiankunWindow } from "vite-plugin-qiankun/dist/helper";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("./views/Home.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("./views/About.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(
    // 添加子应用路由前缀
    qiankunWindow.__POWERED_BY_QIANKUN__ ? "/micro-viv" : "/"
  ),
  routes,
});

export default router;
```

4. 修改`src/main.js`，实现子应用挂载和卸载的方法

```javascript
import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import {
  renderWithQiankun,
  qiankunWindow,
} from "vite-plugin-qiankun/dist/helper";

let app: any = null;

function render(props: any = {}) {
  const { container } = props;
  app = createApp(App);
  app.use(router).mount(container ? container.querySelector("#app") : "#app");
}

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
}

renderWithQiankun({
  bootstrap() {
    console.log("[micro-viv] vue app bootstraped");
  },
  mount(props) {
    render(props);
    app.config.globalProperties.$onGlobalStateChange = props.onGlobalStateChange;
    app.config.globalProperties.$setGlobalState = props.setGlobalState;
    console.log("[micro-viv] vue app mount", props);
  },
  unmount(props) {
    console.log("[micro-viv] vue app unmount", props);
    app.unmount();
    app._container.innerHTML = "";
    app = null;
  },
  update() {
    console.log("[micro-viv] vue app update");
  },
});
```

5. 运行结果

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1740994040265-cb7b6fbb-5c48-4f3d-aa0c-fb7040eccfa0.png)

## 五、子应用：vite+react
1. 安装插件`vite-plugin-qiankun`，示例版本`^1.0.15`

```bash
yarn add vite-plugin-qiankun -D
```

2. 在`vite.config.ts`中配置插件

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import qiankun from "vite-plugin-qiankun";
import path from "path";

const useDevMode = true;
const reactPlugin = useDevMode ? [] : [react()];

// https://vitejs.dev/config/
export default ({ mode }) => {
  const __DEV__ = mode === "development";
  return defineConfig({
    server: {
      port: 5174,
      origin: "//localhost:5174",
    },
    preview: {
      port: 4174,
    },
    base: __DEV__ ? "/" : "http://localhost:4174/",
    plugins: [
      ...reactPlugin,
      // 配置qiankun插件
      qiankun("micro-vir", {
        useDevMode: true,
      }),
    ],
  });
};
```

3. 配置路由，同时兼容作为子应用运行或独立运行，路由前缀需要与主应用中配置的路由一致

```typescript
import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom";
import { qiankunWindow } from "vite-plugin-qiankun/dist/helper";
import "./App.css";

function App() {

  return (
    <BrowserRouter
      // 添加子应用路由前缀
      basename={qiankunWindow.__POWERED_BY_QIANKUN__ ? "/micro-vir" : "/"}
    >
      <Routes>
        <Route
          path="/"
          element={
            <div className="App">
              <div>
                <Link to="/home">首页666</Link> |<Link to="/user">用户</Link>
              </div>
              <div>
                <Outlet />
              </div>
            </div>
          }
        >
          <Route path="/home" element={<div>这是首页</div>} />
          <Route path="/user" element={<div>这是用户中心</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

4. 修改`src/main.js`，实现子应用挂载和卸载的方法

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import {
  renderWithQiankun,
  qiankunWindow,
} from "vite-plugin-qiankun/dist/helper";

let root: ReactDOM.Root | null = null;

function render(props: any) {
  const { container } = props;
  const dom = container
    ? container.querySelector("#app")
    : document.querySelector("#app");
  root = ReactDOM.createRoot(dom);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
}

renderWithQiankun({
  bootstrap() {
    console.log("[micro-vir] react app bootstraped");
  },
  mount(props) {
    console.log("[micro-vir] react app mount", props);
    render(props);
  },
  unmount(props) {
    console.log("[micro-vir] react app unmount", props);
    root?.unmount();
    root = null;
  },
  update() {
    console.log("[micro-vir] react app update");
  },
});
```

5. 运行结果

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1740994016086-a8c9a6df-3acd-45c4-b210-348de0510228.png)

## 六、子应用：umi
1. umi自带qiankun，只需要在`.umirc.ts`中开启即可，`name`与主应用路由前缀保持一致

```typescript
import { defineConfig } from 'umi';

// micro-umi
const { name } = require('./package.json');

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    {
      path: '/',
      component: '@/pages/index',
      routes: [
        {
          path: '/home',
          component: '@/pages/home',
        },
        {
          path: '/about',
          component: '@/pages/about',
        },
      ],
    },
  ],
  fastRefresh: {},
  publicPath: '/',
  runtimePublicPath: true,
  mountElementId: `${name}-id`,
  // 开启qiankun
  qiankun: {
    slave: {},
  },
});

```

2. 修改`src/app.ts`

```typescript
if (window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__?.iframeReady) {
  window.parent.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__MASTER__ = {
    iframeReady: window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__.iframeReady,
  };
}

export const qiankun = {
  // 应用加载之前
  async bootstrap(props: any) {
    console.log('umi app bootstrap', props);
  },
  // 应用 render 之前触发
  async mount(props: any) {
    console.log('umi app mount', props);
    window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ = {
      iframeReady:
        window.parent.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__MASTER__.iframeReady,
    };
  },
  // 应用卸载之后触发
  async unmount(props: any) {
    console.log('umi app unmount', props);
  },
};

```

3. 运行结果

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1740993988686-d2649b53-4a63-4b63-aebd-f090189d821f.png)

