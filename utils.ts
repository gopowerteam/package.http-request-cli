import fs from 'fs'
import path from 'path'

const CONFIG_FILE = 'http-request-cli.config.js'
let CONFIG_DATA: any = null

/**
 * 加载配置信息
 * @returns 
 */
export function loadConfig() {
    if (CONFIG_DATA) return CONFIG_DATA

    const configJson = require(path.resolve('./', CONFIG_FILE))
    CONFIG_DATA = {
        ...configJson,
        controllerAlias: configJson.controllerDir.alias,
        controllerDir: path.resolve(configJson.controllerDir.path),
        serviceAlias: configJson.serviceDir.alias,
        serviceDir: path.resolve(configJson.serviceDir.path),
        apiVersion: configJson.apiVersion || 'v2'
    }

    return CONFIG_DATA
}