### @gopowerteam/http-request-cli
---

[![npm version](https://img.shields.io/npm/v/@gopowerteam/http-request-cli.svg?style=flat-square)](https://www.npmjs.org/package/@gopowerteam/http-request-cli)
[![install size](https://packagephobia.now.sh/badge?p=@gopowerteam/http-request-cli)](https://packagephobia.now.sh/result?p=@gopowerteam/http-request-cli)


基于`@gopowerteam/http-request`的接口请求配置代码生成器

## 目录
---

  - [安装](#安装)
  - [示例](#示例)
  - [配置](#配置)
  

## 安装
---

```shell
// yarn use
# yarn add @gopowerteam/http-request-cli

// npm use
# npm install @gopowerteam/http-request-cli --save
```

## 示例
---

在根目录下创建`http-request-cli.config.json`配置文件

```json
{
  "gateway": "http://gateway.xxx.com",
  "controllerDir": {
    "alias": "../controller",   // 控制器目录名别
    "path": "./src/controller"  // 控制器目录路径
  },
  "serviceDir": {
    "alias": "@/http/services", // 服务目录名别
    "path": "./src/services" // 服务目录名别
  }
}

```

```shell
# npx http-request-cli
```

执行后会在对应目录下生成配置文件,之后按照[@gopowerteam/http-request](https://www.npmjs.com/package/@gopowerteam/http-request)文档中配置使用即可.

## 配置


|        名称         |            描述            | 必填  |
| :-----------------: | :------------------------: | :---: |
|       gateway       |      服务器/网管地址       |  是   |
| controllerDir.alias | 接口controller目录别名配置 |  是   |
| controllerDir.path  | 接口controller目录路径配置 |  是   |
|  serviceDir.alias   |  接口service目录别名配置   |  是   |
|   serviceDir.path   |  接口service目录路径配置   |  是   |
|      services       |         多服务配置         |  否   |


> 多服务配置需要添加服务数组`services`

```json
services:{
    "service-1":"service-1",
    "service-2":"service-2",
    "service-3":"service-3"
}

// key为生成service目录名称
// value为请求调用的service名称
```
