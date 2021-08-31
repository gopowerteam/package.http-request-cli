#!/usr/bin/env node

import fetch from "node-fetch";
import { registerHelper } from "handlebars";
import { generateControllerFiles } from "./generate/controller";
import { generateServiceFiles } from "./generate/service";
import { info, loadConfig } from "./utils";
import { Command } from "commander";
export { default as requestPlugin } from "./vite.plugin";

const program = new Command();

const configJson = loadConfig();

// 扩展模版命令toUpperCase
registerHelper("toUpperCase", function (str) {
  return str.toUpperCase();
});

// 扩展模版命令toLowerCase
registerHelper("toLowerCase", function (str) {
  return str.toLowerCase();
});

/**
 * 生成服务
 */
export function generateService(config) {
  const { gateway, services, swagger } = config;
  info("-------------------------");
  info("Gatewat地址", gateway);
  info("Swagger地址", swagger);
  if (services && Object.keys(services).length) {
    info("服务模式", "多服务");
    // 多服务模式
    return Object.entries(services).map(([key, service]) => ({
      key: key,
      name: service,
      url: `${gateway}/${service}/${swagger}`,
      gateway,
      config,
    }));
  } else {
    info("服务模式", "单服务");
    // 单服务模式
    return [
      {
        key: "",
        name: "",
        url: `${gateway}/${swagger}`,
        gateway,
        config,
      },
    ];
  }
}

/**
 * 获取控制器名称
 */
export function getControllerName(path, currentTag, tags) {
  // 无法解析
  try {
    const [controller] =
      path.match(/(?<=\b\api\/).*(?=\/\b)/g) ??
      path.match(/(?<=\/).*(?=\/\b)/g);
    return controller.replace(/^\S/, (s) => s.toUpperCase());
  } catch {
    throw new Error(`路径:${path}不符合规范`);
  }
}

/**
 * 获取行为器名称
 */
export function getActionName(operation) {
  return operation.replace(/Using.*?$/, "");
}

/**
 * 获取Action列表
 * @param paths
 */
export function generateControllers(
  service: {
    key: string;
    name: string;
    url: string;
    gateway: string;
    config: any;
  },
  controllers: any[],
  paths: { [keys: string]: any },
  tags: any[]
) {
  Object.entries(paths)
    .filter(
      ([key]) => key.startsWith("/api") || key.startsWith(`/${service.name}`)
    )
    .map(([key, config]: [string, { [keys: string]: any }]) => ({
      path: key.replace(new RegExp(`^\/${service.name}\/`), "/"),
      config,
    }))
    .forEach(({ path, config }) => {
      // 接口行为
      Object.entries(config).forEach(
        ([method, { summary, description, tags: currentTag, operationId }]) => {
          const getController = service.config.controllerResolver
            ? service.config.controllerResolver
            : getControllerName;
          const controller = getController(path, currentTag, tags);
          const action = getActionName(operationId);
          const filename = controller
            .replace(/([A-Z])/g, "-$1")
            .replace(/^-/g, "")
            .toLowerCase();

          // 查询并创建控制器
          let target = controllers.find((x) => x.controller === filename);

          // 控制器不存在则自动创建
          if (!target) {
            target = {
              gateway: service.gateway,
              controller: filename,
              filename: filename,
              controllerClass: `${controller}Controller`,
              serviceClass: `${controller}Service`,
              actions: [],
            };
            controllers.push(target);
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
            comment: summary ?? description,
          });
        }
      );
    });
}

/**
 * 生成配置文件
 * @param service
 */
export function generate(service) {
  fetch(service.url, { method: "GET" })
    .then((res) => res.json()) // expecting a json response
    .then(
      ({ tags, paths }: { tags: any[]; paths: { [keys: string]: any } }) => {
        info("-------------------------");
        info("服务名称", service.name || "无");
        info("服务路径", service.url);
        info("-------------------------");
        // 控制器列表
        const controllers: any = [];
        // 填装控制器列表
        generateControllers(service, controllers, paths, tags);
        // 生产文件
        generateControllerFiles(service, controllers);
        generateServiceFiles(service, controllers);
      }
    );
}

function generateRequestFile() {
  if (!configJson) {
    throw new Error("无法找到配置文件");
  }

  const generateGatewayFile = (config) =>
    generateService(config).forEach(generate);
  // 多网关处理
  if (Array.isArray(configJson)) {
    configJson.forEach(generateGatewayFile);
  } else {
    generateGatewayFile(configJson);
  }
}

export async function startup() {
  program
    .description("a cli program for http-request-cli")
    .option("-g, --generate", "generate http request controller&service");

  program.parse(process.argv);
  const options = program.opts();

  if (options.generate) {
    generateRequestFile();
  }
}

startup();
