#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startup = exports.generate = exports.generateControllers = exports.getActionName = exports.getControllerName = exports.generateService = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const handlebars_1 = require("handlebars");
const controller_1 = require("./generate/controller");
const service_1 = require("./generate/service");
const utils_1 = require("./utils");
// 扩展模版命令toUpperCase
handlebars_1.registerHelper('toUpperCase', function (str) {
    return str.toUpperCase();
});
// 扩展模版命令toLowerCase
handlebars_1.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase();
});
/**
 * 生成服务
 */
function generateService({ gateway, services }) {
    if (services && Object.keys(services).length) {
        // 多服务模式
        return Object.entries(services).map(([key, service]) => ({
            key: key,
            name: service,
            url: `${gateway}/${service}/v2/api-docs`
        }));
    }
    else {
        // 单服务模式
        return [{
                key: '',
                name: '',
                url: `${gateway}/v2/api-docs`
            }];
    }
}
exports.generateService = generateService;
/**
 * 获取控制器名称
 */
function getControllerName(tags, targetTag) {
    const tag = tags.find((x) => x.name === targetTag);
    return tag.description.replace(/\s/g, '').replace(/Controller$/, '');
}
exports.getControllerName = getControllerName;
/**
 * 获取行为器名称
 */
function getActionName(operation) {
    return operation.replace(/Using.*?$/, '');
}
exports.getActionName = getActionName;
/**
 * 获取Action列表
 * @param paths
 */
function generateControllers(controllers, paths, tags) {
    Object.entries(paths)
        .filter(([key]) => key.startsWith('/api'))
        .forEach(([key, config]) => {
        // 接口路径
        const path = key;
        // 接口行为
        Object.entries(config).forEach(([method, { summary, tags: [targetTag], operationId }]) => {
            const controller = getControllerName(tags, targetTag);
            const action = getActionName(operationId);
            const filename = controller
                .replace(/([A-Z])/g, '-$1')
                .replace(/^-/g, '')
                .toLowerCase();
            // 查询并创建控制器
            let target = controllers.find((x) => x.controller === filename);
            // 控制器不存在则自动创建
            if (!target) {
                target = {
                    controller: filename,
                    filename: filename,
                    controllerClass: `${controller}Controller`,
                    serviceClass: `${controller}Service`,
                    actions: []
                };
                controllers.push(target);
            }
            // 添加控制器行为
            target.actions.push({
                path,
                controller,
                action: (action || method).replace(/-(\w)/g, ($, $1) => $1.toUpperCase()),
                defaultAction: !action,
                method: method.replace(/^\S/, (s) => s.toUpperCase()),
                summary
            });
        });
    });
}
exports.generateControllers = generateControllers;
/**
 * 生成配置文件
 * @param service
 */
function generate(service) {
    node_fetch_1.default(service.url, { method: 'GET' })
        .then((res) => res.json()) // expecting a json response
        .then(({ tags, paths }) => {
        // 控制器列表
        const controllers = [];
        // 填装控制器列表
        generateControllers(controllers, paths, tags);
        // 生产文件
        controller_1.generateControllerFiles(service, controllers);
        service_1.generateServiceFiles(service, controllers);
    });
}
exports.generate = generate;
function startup() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = utils_1.loadConfig();
        generateService({ gateway: config.gateway, services: config.services }).forEach(generate);
    });
}
exports.startup = startup;
startup();
