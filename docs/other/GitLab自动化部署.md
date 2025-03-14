---
title: GitLab CI/CD自动化部署
sidebarDepth: 2
date: 2021-10-25
author: Issho Lin
tags:
 - 自动化部署
categories:
 - 前端工程化
---
### 官方步骤
[前往查看](https://about.gitlab.com/install/#centos-7)

### 服务器配置
- CentOS 7.9 64位
- 2核4GB
> 官方建议RAM最低不小于4GB

### 安装ssh
```bash
sudo yum install -y curl policycoreutils-python openssh-server perl
```

### 设置SSH服务开机自启动
```bash
sudo systemctl enable sshd
```

### 启动SSH服务
```bash
sudo systemctl start sshd
```

### 安装防火墙
```bash
yum install firewalld systemd -y
```

### 开启防火墙
```bash
service firewalld start
```

### 添加http/https服务到firewalld
```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
```
> pemmanent表示永久生效

### 选定一个可访问的端口，查询端口是否被占用
```bash
netstat -nap | grep 8888
```
> 如果没有输出任何信息，则说明端口没有被占用

### 防火墙开放端口
```bash
firewall-cmd --zone=public --add-port=8888/tcp --permanent
```

### 重启防火墙
```bash
sudo systemctl reload firewalld
```

### 安装Postfix以发送通知邮件
```bash
sudo yum install postfix
sudo systemctl enable postfix
sudo systemctl start postfix
```

### 安装wget 用于从外网上下载插件
```bash
yum -y install wget
```

### 安装vim编辑器
```bash
yum install vim -y
```

### 添加GitLab镜像源
```bash
wget https://mirrors.tuna.tsinghua.edu.cn/gitlab-ce/yum/el7/gitlab-ce-13.7.3-ce.0.el7.x86_64.rpm --no-check-certificate
```
> 官方镜像太慢了，这里使用了清华源，要加上`--no-check-certificate`才可以

### 安装GitLab服务器
```bash
rpm -i gitlab-ce-13.7.3-ce.0.el7.x86_64.rpm
```

### 修改GitLab配置文件指定服务器ip和自定义端口
```bash
vim /etc/gitlab/gitlab.rb
```

![image.png](https://upload-images.jianshu.io/upload_images/19423820-44830168f115c3c0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 更新GitLab配置
```bash
gitlab-ctl reconfigure
```

### 启动GitLab
```bash
gitlab-ctl restart
```

### 首次访问需要设置管理员密码，用户名是root
![image.png](https://upload-images.jianshu.io/upload_images/19423820-5490628f2213280e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 安装node
```bash
curl -sL https://rpm.nodesource.com/setup_14.x | sudo bash -
sudo yum install -y nodejs
```

### 安装yarn
```bash
curl -sL https://dl.yarnpkg.com/rpm/yarn.repo | sudo tee /etc/yum.repos.d/yarn.repo
sudo yum install yarn
```

### 安装git
```
sudo yum install git
```

### 安装gitlab-runner
```bash
sudo curl -L --output /usr/local/bin/gitlab-runner https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-linux-amd64
```

### 设置安装目录可执行
```bash
sudo chmod +x /usr/local/bin/gitlab-runner
```

### 添加软链接
```bash
ln -s -f /usr/local/bin/gitlab-runner /usr/bin/gitlab-runner
```

### 使用 root 用户权限运行 gitlab-runner
```bash
sudo gitlab-runner install --user=root --working-directory=/home/gitlab-runner
```

### 启动runner
```bash
sudo gitlab-runner start
```

### 查看版本
```bash
gitlab-runner -v
```

### 查看token，注册runner的时候要用到
![image.png](https://upload-images.jianshu.io/upload_images/19423820-1de92280fc6b0ee9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 注册gitlab-runner
```bash
gitlab-runner register
```
![image.png](https://upload-images.jianshu.io/upload_images/19423820-ec34079d0f70a67e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 连接runner
```bash
gitlab-runner verify
```

### 运行runner
```bash
gitlab-runner run
```
> 终端运行runner才会自动触发CI/CD，不然会一直处于pending状态，有待研究