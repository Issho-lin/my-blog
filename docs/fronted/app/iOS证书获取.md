---
title: iOS证书获取
sidebarDepth: 3
date: 2024-03-10
author: Issho Lin
tags:
 - app开发
categories:
 - App开发
---

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739435580192-24259208-e45d-4098-ae2d-39b9bb000597.png)

## Bundle ID
在Dcloud开发者中心，找到对应的应用，查看各平台信息列表，与包名保持一致

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739436042630-d2efea42-7a20-465f-921d-eddea7b0a06d.png)

## 证书
<font style="color:rgb(102, 102, 102);">登录</font>[<font style="color:#117CEE;">苹果开发者中心</font>](https://developer.apple.com/cn/develop/)<font style="color:rgb(102, 102, 102);">，找到证书选项，点击进去申请</font>

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739495751975-9821ca93-0244-40d8-8c98-d36f459800a5.png)

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739436402294-da822eb7-b0c5-4057-8230-327e47ca1c3e.png)

### identifiers  
点击identifiers   - 点击新增



![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739436542354-1d70af87-725b-48a4-964a-51bd116047be.png)



选择第一个选项 App IDs - 点击继续

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739436845588-1157a0d2-cb26-4a7b-9c45-0fd3ab56d88e.png)



选择App

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739436806057-ea234d0d-09f5-4324-a342-da54345ada90.png)



输入标识符的描述和Bundle ID（Bundle ID的格式最好是 com.domianname.appname）

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739437211575-4cbabae6-63bb-4850-84e2-d2c440a8a9fc.png)



记得在capabilities里选中自己需要的功能，例如需要推送功能，就选择push notifications

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739437255930-ebde6281-901d-4366-95b8-73d7fd140ea3.png)

所有都填好了，就回到顶部点击继续



再次确认信息，确认后点击registe

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739437574627-686714a9-60b3-4d64-9123-0b091ed97111.png)



这时候回到identifiers列表中就可以看到你注册的id了

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739437614207-ccf7a95c-86a2-46ea-8ce6-2772fc0d0494.png)



### <font style="color:rgb(79, 79, 79);">Certificates（私钥证书p2）</font>
<font style="color:rgb(77, 77, 77);">点击新增</font>

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739437845445-a2825b8d-c7a1-4980-86b7-6f6c009653b3.png)

<font style="color:rgb(77, 77, 77);">选择对应的是开发证书，还是生成正式证书</font>

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739437898968-45a7c195-31d1-4709-b411-bda51311e3b5.png)

<font style="color:rgb(77, 77, 77);">这时就进入填CSR文件的页面</font>

#### 生成CSR文件
在Mac电脑上操作，找到 【钥匙串访问】 应用，点击进去，选择 证书助力-从证书颁发机构请求证书

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739438091247-67530044-3ea9-4c66-93da-d84fd7181cc8.png)

填写好对应的信息

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739438112055-45073f15-a810-4ab6-a545-5166383e7aa9.png)

<font style="color:rgb(77, 77, 77);">这样就得到了CSR</font>

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739438204665-eddbae00-601e-4af3-98bb-6f531eebc527.png)



#### 获取cer文件
<font style="color:rgb(77, 77, 77);">将获取到csr上传</font>

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739438244721-1f8344e3-fc53-4cef-bc16-1003a68ce5b4.png)

<font style="color:rgb(77, 77, 77);">点击继续后就可以下载cer文件了</font>

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739438320402-08b75b15-1806-4c69-8337-be56a58fb8a0.png)

#### <font style="color:rgb(77, 77, 77);">生成对应的私钥文件 p12</font>
拿到cer文件在mac中点击打开 进入钥匙串访问

在【我的证书】选项中，选择你对应的cer文件 然后 右键选择导出

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739438432994-060691ce-6513-476c-ba5f-642976b3c892.png)

点击导出

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739438453799-ad4204ec-178f-4722-9c7b-0f232355bb6a.png)

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739438500012-8f8b5a19-4a1a-442a-879d-eaf331099e5f.png)

要记住这里输入的密码，这个密码就是<font style="color:#DF2A3F;">证书私钥密码</font> 

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739438547332-e575b396-2938-40cc-8286-f5d44f5f5792.png)

这里输入mac电脑锁屏密码 

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739438577833-e104f81b-3cfd-4f9d-8ee2-e8b3246614f4.png)

<font style="color:rgb(77, 77, 77);">点击允许后就获得了对应的p12 私钥文件了</font>

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739438611422-84630107-1af8-4413-979d-f2d80c574321.png)

### **<font style="color:rgb(77, 77, 77);">Profiles（证书profile文件）</font>**
点击新增

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739438657612-6449be85-9e93-44cb-b8bf-0e70f30e653a.png)

这里的appid就是前面创建的id

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739438695207-623af767-5aa3-4dff-a765-13d2e70b6527.png)

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739438730290-f0e20950-0c52-4c7f-9398-67a9d0cdc68f.png)

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739438751701-cf064946-e122-4d43-b0b9-e2dd87ea5603.png)

这样就获取成功了

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739438802330-f120ae20-d57e-4e9f-b117-1de2a1e00e9a.png)



打包时把对应的信息填写即可

![](https://cdn.nlark.com/yuque/0/2025/png/613071/1739439069787-fe52ce17-3dc9-4a60-9c63-aac1a0812e3b.png)

