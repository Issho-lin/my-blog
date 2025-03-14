---
title: 通过魔数(Magic Number)检测文件类型
sidebarDepth: 3
date: 2023-5-07
author: Issho Lin
tags:
 - 文件上传
categories:
 - 项目
---

## 一、魔数基础知识
文件魔术数字（Magic Number）是文件开头的特定字节序列，用于唯一标识文件类型。与文件扩展名不同，魔数直接反映文件内容的二进制特征，因此更可靠。例如：

+ **JPEG**：前3字节为 `FF D8 FF`
+ **PNG**：前8字节为 `89 50 4E 47 0D 0A 1A 0A`
+ **PDF**：前4字节为 `25 50 44 46`（对应ASCII字符`%PDF`）

## 二、JavaScript前端实现步骤
### 读取文件二进制数据
通过`FileReader`读取文件的前N个字节（根据目标文件类型的魔数长度决定）：

```javascript
function readFileHeader(file, bytesToRead = 8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = reject;
    reader.readAsArrayBuffer(file.slice(0, bytesToRead));
  });
}
```

### <font style="color:rgba(0, 0, 0, 0.9);background-color:rgb(252, 252, 252);">魔数比对函数</font>
<font style="color:rgba(0, 0, 0, 0.9);background-color:rgb(252, 252, 252);">创建通用比对函数，支持偏移量检测：</font>

```javascript
function createMagicNumberChecker(magicBytes, offset = 0) {
  return (buffer) => 
    magicBytes.every((byte, index) => byte === buffer[offset + index]);
}

// 示例：检测PNG
const isPNG = createMagicNumberChecker(
  [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
);
```

### <font style="color:rgba(0, 0, 0, 0.9);background-color:rgb(252, 252, 252);">整合检测逻辑</font>
```javascript
async function checkFileType(file) {
  const headerBytes = await readFileHeader(file, 8);
  return {
    isJPEG: createMagicNumberChecker([0xFF, 0xD8, 0xFF])(headerBytes),
    isPNG: isPNG(headerBytes),
    isPDF: createMagicNumberChecker(Array.from("%PDF").map(c => c.charCodeAt(0)))(headerBytes)
  };
}
```

## <font style="color:rgba(0, 0, 0, 0.9);background-color:rgb(252, 252, 252);">三、Node.js后端实现方案</font>
### 使用file-type库
```javascript
import {fileTypeFromFile} from 'file-type';

async function detectFileType(filePath) {
  const type = await fileTypeFromFile(filePath);
  return type?.ext || 'unknown';
}
```

> 该库支持超过150种文件类型检测，结合魔数和其他特征
>

### 手动实现核心逻辑
```javascript
const fs = require('fs');

async function checkMagicNumber(filePath, expectedMagic) {
  const fd = await fs.promises.open(filePath, 'r');
  const buffer = Buffer.alloc(expectedMagic.length);
  await fd.read(buffer, 0, expectedMagic.length, 0);
  await fd.close();
  return buffer.equals(Buffer.from(expectedMagic));
}

// 示例：检测ZIP文件（魔数：50 4B 03 04）
const isZip = await checkMagicNumber('./file', [0x50, 0x4B, 0x03, 0x04]);
```

## 四、完整检测方案建议
1. 多层验证：
+ 前端初步验证：<font style="color:rgba(0, 0, 0, 0.9);background-color:rgb(243, 243, 243);"><input accept="image/*"></font> + 魔数检测
+ 后端深度验证：魔数检测 + MIME类型验证 + 文件签名分析
2. 常用文件魔数表：

| 文件类型 | 魔数（HEX） | 字节长度 |
| --- | --- | --- |
| ZIP | 50 4B 03 04 | 4 |
| GIF | 47 49 46 38 | 4 |
| BMP | 42 4D | 2 |
| MP4 | 00 00 00 18 66 74 79 70 | 8 |
| JPEG/JPG | FF D8 FF | 3 |
| PNG | 89 50 4E 47 0D 0A 1A 0A | 8 |
| PDF | 25 50 44 46 | 4 |
| RAR | 52 61 72 21 | 4 |
| 7Z | 37 7A BC AF 27 | 5 |
| GZIP | 1F 8B 08 | 3 |


3. 异常处理：

```javascript
try {
  const result = await checkFileType(file);
} catch (error) {
  console.error('文件读取失败:', error);
  // 返回安全默认值或终止处理流程
}
```

## <font style="color:rgba(0, 0, 0, 0.9);background-color:rgb(252, 252, 252);">五、注意事项</font>
1. 魔数长度差异：不同文件类型的魔数长度不同（如BMP仅需2字节，MP4需要8字节）
2. 复合格式处理：如Office文档（.docx）本质是ZIP压缩包，需递归检测
3. 性能优化：大文件只需读取头部字节，避免全文件加载

