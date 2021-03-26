#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e
# 生成静态文
yarn run build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME
# npm run list

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:Issho-lin/Issho-lin.github.io.git master

cd -
