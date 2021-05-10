#!/usr/bin/env node

import fetch from 'node-fetch'
import { registerHelper } from 'handlebars'
import { generateControllerFile, generateControllerFiles } from './generate/controller'
import { generateServiceFiles } from './generate/service'
import { loadConfig } from './utils'

// 扩展模版命令toUpperCase
registerHelper('toUpperCase', function (str) {
    return str.toUpperCase()
})

// 扩展模版命令toLowerCase
registerHelper('toLowerCase', function (str) {
    return str.toLowerCase()
})

/**
 * 生成服务
 */
export function generateService({ gateway, services }) {
    if (services && Object.keys(services).length) {
        // 多服务模式
        return Object.entries(services).map(([key, service]) => ({
            key: key,
            name: service,
            url: `${gateway}/${service}/v2/api-docs`
        }))
    } else {
        // 单服务模式
        return [{
            key: '',
            name: '',
            url: `${gateway}/v2/api-docs`
        }]
    }
}

/**
 * 获取控制器名称
 */
export function getControllerName(tags, targetTag) {
    const tag = tags.find((x) => x.name === targetTag)
    return tag.description.replace(/\s/g, '').replace(/Controller$/, '')
}

/**
 * 获取行为器名称
 */
export function getActionName(operation) {
    return operation.replace(/Using.*?$/, '')
}

/**
 * 获取Action列表
 * @param paths
 */
export function generateControllers(
    controllers: any[],
    paths: { [keys: string]: any },
    tags: any[]
) {
    Object.entries(paths)
        .filter(([key]) => key.startsWith('/api'))
        .forEach(([key, config]: [string, { [keys: string]: any }]) => {
            // 接口路径
            const path = key
            // 接口行为
            Object.entries(config).forEach(
                ([
                    method,
                    {
                        summary,
                        tags: [targetTag],
                        operationId
                    }
                ]) => {
                    const controller = getControllerName(tags, targetTag)
                    const action = getActionName(operationId)
                    const filename = controller
                        .replace(/([A-Z])/g, '-$1')
                        .replace(/^-/g, '')
                        .toLowerCase()

                    // 查询并创建控制器
                    let target = controllers.find(
                        (x) => x.controller === filename
                    )

                    // 控制器不存在则自动创建
                    if (!target) {
                        target = {
                            controller: filename,
                            filename: filename,
                            controllerClass: `${controller}Controller`,
                            serviceClass: `${controller}Service`,
                            actions: []
                        }
                        controllers.push(target)
                    }

                    // 添加控制器行为
                    target.actions.push({
                        path,
                        controller,
                        action: (action || method).replace(/-(\w)/g, ($, $1) =>
                            $1.toUpperCase()
                        ),
                        defaultAction: !action,
                        method: method.replace(/^\S/, (s) => s.toUpperCase()),
                        summary
                    })
                }
            )
        })
}

/**
 * 生成配置文件
 * @param service
 */
export function generate(service) {
    fetch(service.url, { method: 'GET' })
        .then((res) => res.json()) // expecting a json response
        .then(
            ({
                tags,
                paths
            }: {
                tags: any[]
                paths: { [keys: string]: any }
            }) => {
                // 控制器列表
                const controllers: any = []
                // 填装控制器列表
                generateControllers(controllers, paths, tags)
                // 生产文件
                generateControllerFiles(service, controllers)
                generateServiceFiles(service, controllers)
            }
        )
}


export async function startup() {
    const config = loadConfig()
    generateService({ gateway: config.gateway, services: config.services }).forEach(generate)
}

startup()
