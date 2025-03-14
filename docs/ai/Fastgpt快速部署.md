---
title: Fastgpt快速部署
sidebar: 'auto'
sidebarDepth: 2
date: 2023-6-07
author: Issho Lin
tags:
 - AI大模型
categories:
 - AI大模型
---

## 一、准备一台云服务器
这里以京东云的一台轻量服务器为例

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741662710738-da4f95a0-38c9-493f-b934-6163530fa040.png)

## 二、推荐配置
1. PgVector版本

非常轻量，适合知识库索引量在 5000 万以下。

| 环境 | 最低配置（单节点） | 推荐配置 |
| --- | --- | --- |
| 测试（可以把计算进程设置少一些） | 2c4g | 2c8g |
| 100w 组向量 | 4c8g 50GB | 4c16g 50GB |
| 500w 组向量 | 8c32g 200GB | 16c64g 200GB |


2. Milvus版本

对于亿级以上向量性能更优秀。

[点击查看 Milvus 官方推荐配置](https://milvus.io/docs/zh/prerequisite-docker.md)

| 环境 | 最低配置（单节点） | 推荐配置 |
| --- | --- | --- |
| 测试 | 2c8g | 4c16g |
| 100w 组向量 | 未测试 | |
| 500w 组向量 | | |


3. zilliz cloud版本

Milvus 的全托管服务，性能优于 Milvus 并提供 SLA，点击使用 Zilliz Cloud。

由于向量库使用了 Cloud，无需占用本地资源，无需太关注。

## 三、安装clash
下载[clash-linux.tar.gz](https://w1.v2free.net/ssr-download/clash-linux.tar.gz)到`<font style="color:#ED740C;">~/.config/mihomo/</font>`目录，解压

```powershell
tar xvf clash-linux.tar.gz
```

授权可执行权限

```powershell
chmod +x clash-linux
```

用wget下载clash配置文件（重复执行就是更新订阅更新节点），替换默认的配置文件。当然，你也可以用浏览器打开订阅链接，下载后拷贝或移动到`<font style="color:#ED740C;">~/.config/mihomo/</font>`目录替换覆盖`<font style="color:#DF2A3F;">config.yaml</font>`文件。

```powershell
wget -U "Mozilla/6.0" -O ~/.config/mihomo/config.yaml "https://v1.v2ai.top/link/n9AHyYjCf0dYnwoQ?clash=2"
# OR
wget -U "Mozilla/6.0" -O ~/.config/mihomo/config.yaml "https://w1.v2free.net/link/n9AHyYjCf0dYnwoQ?clash=2"
```

然后，启动clash【切记：不要加 sudo】

```powershell
./clash-linux
```

在Linux命令行中设置代理，可以通过设置环境变量http_proxy和https_proxy来实现：

```git
export http_proxy="http://127.0.0.1:7890"
export https_proxy="http://127.0.0.1:7890"
```

输入 `echo $http_proxy` 和 `echo $https_proxy` 命令，然后回车查看，以确保代理已经正确设置。

如果需要取消代理，可以使用以下命令：

```git
unset http_proxy
unset https_proxy
```

[下载Clash Dashboard](https://w1.v2free.net/ssr-download/clash-dashboard.tar.gz)，并解压代码到本地/etc/clash/目录：

```bash
mkdir /etc/clash/  && cd /etc/clash/
#下载并移动 clash-dashboard.tar.gz 到 /etc/clash/ 目录
tar zxvf clash-dashboard.tar.gz
```

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741673525763-85effaa1-e524-433f-b629-ab00b5c2e846.png)

修改 Clash 的配置文件：

一般情况下是没有配置 external-ui 和 secret 这两个配置，编辑配置文件进行查看，如果没有就加入配置，如果有的话查看 external-ui 的路径是否正确；还需要将 external-controller 的地址修改为：127.0.0.1:9090，如果你不是从本机访问，需要从其它机器访问这个Clash Dashboard ，则改为：0.0.0.0:9090

```bash
# 进入clash配置文件目录；
cd ~/.config/mihomo/ 
#编辑clash的配置文件；
vim config.yaml 
# 在配置文件中修改或增加以下内容；
external-controller: 0.0.0.0:9090 # 如果是本机访问Clash Dashboard，则改为127.0.0.1:9090
external-ui: /etc/clash/clash-dashboard # clash-dashboard的路径；
secret: "clash950918" # PaaRwW3B1Kj9 是登录web管理界面的密码，请自行设置你自己的,不要照抄教程中的密码；
# 重启clash；
```

Clash Dashboard 的本机访问地址是：127.0.0.1:9090/ui , 注意:本机访问浏览器地址栏和页面中的host字段都是 127.0.0.1 ,如果是从其它机器访问,则需要将 两处的 127.0.0.1 都改为Clash机器的IP。

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741674279918-0ec57b55-5491-4307-893d-872a203ce3d2.png)

## 四、准备 Docker 环境
```bash
# 安装 Docker
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
systemctl enable --now docker
# 安装 docker-compose
curl -L https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
# 验证安装
docker -v
docker-compose -v
```

## 五、开始部署
### 下载 docker-compose.yml
非 Linux 环境或无法访问外网环境，可手动创建一个目录，并下载配置文件和对应版本的docker-compose.yml，在这个文件夹中依据下载的配置文件运行docker，若作为本地开发使用推荐docker-compose-pgvector版本，并且自行拉取并运行sandbox和fastgpt，并在docker配置文件中注释掉sandbox和fastgpt的部分

+ [config.json](https://raw.githubusercontent.com/labring/FastGPT/refs/heads/main/projects/app/data/config.json)
+ [docker-compose.yml](https://github.com/labring/FastGPT/blob/main/deploy/docker) (注意，不同向量库版本的文件不一样)

> 所有 docker-compose.yml 配置文件中 MongoDB 为 5.x，需要用到AVX指令集，部分 CPU 不支持，需手动更改其镜像版本为 4.4.24**（需要自己在docker hub下载，阿里云镜像没做备份）
>

Linux 快速脚本

```bash
mkdir fastgpt
cd fastgpt
curl -O https://raw.githubusercontent.com/labring/FastGPT/main/projects/app/data/config.json

# pgvector 版本(测试推荐，简单快捷)
curl -o docker-compose.yml https://raw.githubusercontent.com/labring/FastGPT/main/deploy/docker/docker-compose-pgvector.yml
# milvus 版本
# curl -o docker-compose.yml https://raw.githubusercontent.com/labring/FastGPT/main/deploy/docker/docker-compose-milvus.yml
# zilliz 版本
# curl -o docker-compose.yml https://raw.githubusercontent.com/labring/FastGPT/main/deploy/docker/docker-compose-zilliz.yml
```

### 启动容器
在 docker-compose.yml 同级目录下执行。请确保docker-compose版本最好在2.17以上，否则可能无法执行自动化命令。

```bash
# 启动容器
docker-compose up -d
# 查看容器
docker ps
```

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741674860833-fe92da91-fd98-41c4-b711-c0cb327d5376.png)

### 访问 FastGPT
目前可以通过 ip:3000 直接访问(注意开放防火墙)。登录用户名为 root，密码为docker-compose.yml环境变量里设置的 DEFAULT_ROOT_PSW。

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741675088944-d98a833c-a225-4de0-a524-182c13b15004.png)

> 首次运行，会自动初始化 root 用户，密码为 123456（与环境变量中的DEFAULT_ROOT_PSW一致），日志可能会提示一次MongoServerError: Unable to read from a snapshot due to pending collection catalog changes; 可忽略。
>

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741675183646-24adac5e-3299-4956-9e6c-2bbd28d22c91.png)

## 六、配置文件介绍
打开`<font style="color:rgba(14, 116, 144, 0.95);">config.json</font>`文件，里面包含了系统参数和各个模型配置

```json
{
  "feConfigs": {
    "lafEnv": "https://laf.dev" // laf环境。 https://laf.run （杭州阿里云） ,或者私有化的laf环境。如果使用 Laf openapi 功能，需要最新版的 laf 。
  },
  "systemEnv": {
    "vectorMaxProcess": 15, // 向量处理线程数量
    "qaMaxProcess": 15, // 问答拆分线程数量
    "vlmMaxProcess": 15, // 图片理解模型最大处理进程
    "tokenWorkers": 50, // Token 计算线程保持数，会持续占用内存，不能设置太大。
    "pgHNSWEfSearch": 100, // 向量搜索参数。越大，搜索越精确，但是速度越慢。设置为100，有99%+精度。
  }
}
```

> 开发环境下，需要将示例配置文件 <font style="color:rgba(14, 116, 144, 0.95);">projects/app/data/config.json</font> 复制成 <font style="color:rgba(14, 116, 144, 0.95);">config.local.json</font> 文件才会生效。
>

## 七、模型配置
打开oneapi，`3001`端口

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741676195061-a35d7e0d-3f6b-4d86-aa4e-9730f82d073d.png)

初始密码在`docker-compose.yml`文件查看

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741676282858-73f22ada-c211-4f3a-8960-f44773987b06.png)

添加令牌

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741676347094-1b99b2cd-52e2-44a1-afff-548073492e5b.png)

复制令牌，在`<font style="color:#DF2A3F;">docker-compose.yml</font>`文件里替换环境变量`<font style="color:#117CEE;">CHAT_API_KEY</font>`![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741676646776-2eef1f67-6425-474a-87e5-1f93ff5f29ae.png)

> 本地开发，环境变量在`.env.local`文件里配置
>

然后新建模型渠道：

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741676859656-2e2216e4-1859-48aa-b11b-75997f100200.png)

在`config.json`中接入模型渠道，`llmModels`配置AI模型，`vectorModels`配置向量模型

```json
{
  "llmModels": [
    {
      "model": "gpt-3.5-turbo",
      "name": "gpt-3.5-turbo",
      "maxContext": 16000,
      "avatar": "/imgs/model/openai.svg",
      "maxResponse": 4000,
      "quoteMaxToken": 13000,
      "maxTemperature": 1.2,
      "charsPointsPrice": 0,
      "censor": false,
      "vision": false,
      "datasetProcess": true,
      "usedInClassify": true,
      "usedInExtractFields": true,
      "usedInToolCall": true,
      "usedInQueryExtension": true,
      "toolChoice": true,
      "functionCall": true,
      "customCQPrompt": "",
      "customExtractPrompt": "",
      "defaultSystemChatPrompt": "",
      "defaultConfig": {}
    },
    {
      "model": "ERNIE-3.5-8K",
      "name": "文心一言",
      "avatar": "/imgs/model/ernie.svg",
      "maxContext": 125000,
      "maxResponse": 4000,
      "quoteMaxToken": 120000,
      "maxTemperature": 1.2,
      "charsPointsPrice": 0,
      "censor": false,
      "vision": true,
      "datasetProcess": false,
      "usedInClassify": true,
      "usedInExtractFields": true,
      "usedInToolCall": true,
      "usedInQueryExtension": true,
      "toolChoice": true,
      "functionCall": false,
      "customCQPrompt": "",
      "customExtractPrompt": "",
      "defaultSystemChatPrompt": "",
      "defaultConfig": {}
    },
    {
      "model": "qwen-turbo",
      "name": "通义千问",
      "avatar": "/imgs/model/qwen.svg",
      "maxContext": 125000,
      "maxResponse": 4000,
      "quoteMaxToken": 120000,
      "maxTemperature": 1.2,
      "charsPointsPrice": 0,
      "censor": false,
      "vision": true,
      "datasetProcess": false,
      "usedInClassify": true,
      "usedInExtractFields": true,
      "usedInToolCall": true,
      "usedInQueryExtension": true,
      "toolChoice": true,
      "functionCall": false,
      "customCQPrompt": "",
      "customExtractPrompt": "",
      "defaultSystemChatPrompt": "",
      "defaultConfig": {}
    }
  ],
  "vectorModels": [
    {
      "model": "text-embedding-ada-002",
      "name": "text-embedding-ada-002",
      "avatar": "/imgs/model/openai.svg",
      "charsPointsPrice": 0,
      "defaultToken": 512,
      "maxToken": 3000,
      "weight": 100,
      "dbConfig": {},
      "queryConfig": {}
    },
    {
      "model": "Embedding-V1",
      "name": "Embedding-V1",
      "avatar": "/imgs/model/ernie.svg",
      "charsPointsPrice": 0,
      "defaultToken": 512,
      "maxToken": 3000,
      "weight": 100,
      "defaultConfig": {
        "dimensions": 1024
      }
    },
    {
      "model": "text-embedding-v1",
      "name": "text-embedding-v1",
      "avatar": "/imgs/model/qwen.svg",
      "charsPointsPrice": 0,
      "defaultToken": 512,
      "maxToken": 3000,
      "weight": 100
    }
  ]
}
```

配置后重启，在Fastgpt中就可以选择不同的模型啦

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741677231658-cbb1cf6e-bee1-4edf-804f-268d4ab3d09b.png)

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1741677260636-3a874cfa-63ed-4bb9-9036-adc9a31bb7b0.png)

## 八、快速链接
+ [WebTerm](https://ssh.mtab.cc/)
+ [百度智能云控制台](https://login.bce.baidu.com/)
+ [Moonshot开放平台](https://platform.moonshot.cn/console/api-keys)
+ [火山引擎控制台](https://console.volcengine.com/)
+ [DeepSeek开放平台](https://platform.deepseek.com/)
+ [阿里云百炼](https://bailian.console.aliyun.com/#/model-market)
+ [腾讯混元大模型](https://cloud.tencent.com/product/hunyuan)

