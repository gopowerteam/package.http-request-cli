#!/usr/bin/env node

import fetch from 'node-fetch'
import { registerHelper } from 'handlebars'
import { generateControllerFiles } from './generate/controller'
import { generateServiceFiles } from './generate/service'
import { loadConfig } from './utils'
import { Command } from 'commander'
import path from 'path'

const program = new Command();
program.version(require(path.join(__dirname, '../package.json')).version);

const config = loadConfig()
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
export function generateService({ gateway, services, version }) {
    if (services && Object.keys(services).length) {
        // 多服务模式
        return Object.entries(services).map(([key, service]) => ({
            key: key,
            name: service,
            url: `${gateway}/${service}/${version}/api-docs`
        }))
    } else {
        // 单服务模式
        return [{
            key: '',
            name: '',
            url: `${gateway}/${version}/api-docs`
        }]
    }
}

/**
 * 获取控制器名称
 */
export function getControllerName(path, currentTag, tags) {
    const [controller] = path.match(/(?<=\b\api\/).*(?=\/\b)/g);
    return controller.replace(/^\S/, s => s.toUpperCase())
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
    service: { key: string, name: string, url: string },
    controllers: any[],
    paths: { [keys: string]: any },
    tags: any[]
) {
    Object.entries(paths)
        .filter(([key]) => key.startsWith('/api') || key.startsWith(`/${service.name}`))
        .forEach(([key, config]: [string, { [keys: string]: any }]) => {
            // 接口路径
            const path = key
            // 接口行为
            Object.entries(config).forEach(
                ([
                    method,
                    {
                        summary,
                        tags: currentTag,
                        operationId
                    }
                ]) => {
                    const getController = config.getControllerResolver ? config.getControllerResolver : getControllerName
                    const controller = getController(path, currentTag, tags)
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
                generateControllers(service, controllers, paths, tags)
                // 生产文件
                generateControllerFiles(service, controllers)
                generateServiceFiles(service, controllers)
            }
        )
}


export async function startup() {
    program.option('-g, --generate', 'generate http request controller&service')
    program.parse(process.argv);
    const options = program.opts();

    if (options.generate) {
        generateService({
            gateway: config.gateway,
            services: config.services,
            version: config.apiVersion
        }).forEach(generate)
    }

}

startup()
