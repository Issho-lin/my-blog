---
title: 开发并发布一个最简单的vscode插件
sidebarDepth: 2
date: 2021-07-22
author: Issho Lin
tags:
 - vscode
categories:
 - 其他
---

 
## 安装 VSCode 插件官方脚手架
```bash
npm install -g yo generator-code
```
新建插件项目
```bash
yo code
```
![image.png](https://cdn.nlark.com/yuque/0/2021/png/613071/1626941379000-5c8545df-6388-4ee3-89cb-2d51719566b8.png)

## 运行和调试
```bash
yarn watch
```
打开 `\src\extension.ts`，按下`F5`或启动调试，选择`VS Code Extension Development`

这时会开启另一个带有扩展开发宿主字样的 vscode 窗口

![image.png](https://cdn.nlark.com/yuque/0/2021/png/613071/1626942375149-7b8f668a-e2a2-43a4-891f-4bd1cb115c18.png)

在扩展开发宿主窗口中按下`ctrl+shift+p`，输入`Hello World`命令

回车之后，就可以看到插件工程代码里输出的信息了

![image.png](https://cdn.nlark.com/yuque/0/2021/png/613071/1626942717185-9d182bc5-5970-4f8b-8371-80d3a7787c66.png)

## 开发插件

入口文件为`\src\extension.ts`，简单开发一个查询城市天气的功能
```js
import * as vscode from 'vscode';
import axios from 'axios';

// 插件激活时执行
export function activate(context: vscode.ExtensionContext) {
	// 注册命令
	const cityWeather = vscode.commands.registerCommand('myextension.fetchCityWeather', () => {
		// 输入内容
		vscode.window.showInputBox({
			ignoreFocusOut: true,
			password: false,
			prompt: '请输入城市名称 (eg.北京)'
		}).then(val => {
    	// 接收输入的内容
			if (!val || !val.trim()) {
				vscode.window.showInformationMessage('请输入城市名称');
			} else {
				const cityName = val.trim();
				axios.get(encodeURI(`https://way.jd.com/jisuapi/weather?city=${cityName}&appkey=40e91431e978390daf06b07704a9523c`)).then(res => {
					const { code, result } = res.data;
					if (code !== '10000') {
						vscode.window.showInformationMessage('请重试');
						return;
					}
					if (result.status !== 0) {
						vscode.window.showInformationMessage(result.msg);
						return;
					}
					const { result: data } = result;
					vscode.window.showInformationMessage(`${data.city} ${data.weather} 气温${data.templow}~${data.temphigh}℃ 空气湿度${data.humidity} ${data.winddirect} 风力${data.windpower}`);
				});
			}
		});
	});

	context.subscriptions.push(cityWeather);
}

// 插件被停用时执行
export function deactivate() {}
```

在`package.json`中配置命令

![image.png](https://cdn.nlark.com/yuque/0/2021/png/613071/1626943192925-51b994dd-c632-4b1b-95c0-8b40e866797e.png)

## 申请令牌
- 注册一个[微软账号](https://login.live.com/)
- 打开 [azure开发者中心](https://aka.ms/SignupAzureDevOps) ，新建一个organization。

![image.png](https://cdn.nlark.com/yuque/0/2021/png/613071/1626944766714-0db1c615-e1a9-445a-96b8-c975f999b837.png)

- 进入建好的organization，新建一个project。

![image.png](https://cdn.nlark.com/yuque/0/2021/png/613071/1626944844410-70e597f4-46e7-417a-9472-f3a2a3f5840a.png)

- 进入project，新建 `access token`

![image.png](https://cdn.nlark.com/yuque/0/2021/png/613071/1626945180534-71c960fa-f896-4cfc-8ab7-ecb7edb7e139.png)
![image.png](https://cdn.nlark.com/yuque/0/2021/png/613071/1626945465799-650b0842-6dce-4b0c-b8ec-c9677a615f28.png)

> 这里organization要选择 All accessible organizations

- 这步之后，记得要复制并保存好令牌字符串。之后只能新建，是找不到的

![image.png](https://cdn.nlark.com/yuque/0/2021/png/613071/1626945323737-65a1b4fa-197f-461e-8fff-b3b1ccb17713.png)

## 创建插件发行账户
填写发布者名称

![image.png](https://cdn.nlark.com/yuque/0/2021/png/613071/1626946392784-ee0dc22d-c404-4bf0-817a-7679a4c9b819.png)

也可以使用vsce命令来创建发布者
```bash
vsce create-publisher [publisher name]
```

## 打包插件
安装官方打包工具
```bash
npm i vsce -g
```
在`package.json`文件添加`publisher`
```json
{
	"publisher": "00828",
}
```
修改一下`README.md`
```markdown
# 我的第一个vscode插件
```
打包成`.vsix`文件
```bash
vsce package
```

![image.png](https://cdn.nlark.com/yuque/0/2021/png/613071/1626946659126-35477755-5f63-44a0-8ea2-77f37544ec2e.png)

发布插件
```bash
vsce publish
```

![image.png](https://cdn.nlark.com/yuque/0/2021/png/613071/1626946823240-c8974625-9211-4e2a-817b-879eddae410f.png)

发布成功，这时就可以在插件管理平台看到刚刚发布的插件啦

![image.png](https://cdn.nlark.com/yuque/0/2021/png/613071/1626946926352-fca67368-b71e-4ce3-aefe-00616703860e.png)

但此时可能在vscode的插件市场中还搜不到，一般等个5-10分钟就有了。

![image.png](https://cdn.nlark.com/yuque/0/2021/png/613071/1626947021058-bc87084e-d4f7-4798-89b2-07e67fd4faaf.png)

安装后就可以使用啦！