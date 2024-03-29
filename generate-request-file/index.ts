#!/usr/bin/env node

import fetch from "node-fetch";
import { registerHelper } from "handlebars";
import { generateControllerFiles } from "./controller";
import { generateServiceFiles } from "./service";
import { info, loadConfig } from "../utils";
import {
  generateOpenAPI2ModelFiles,
  generateOpenAPI3ModelFiles,
} from "../generate-model-file";
import { existsSync } from "fs";
import { generateUseRequestFile } from "../generate-use-request-file";
import rimraf from "rimraf";

const configJson = loadConfig();

// 扩展模版命令toUpperCase
registerHelper("toUpperCase", function (str) {
  return str.toUpperCase();
});

// 扩展模版命令toLowerCase
registerHelper("toLowerCase", function (str) {
  return str.toLowerCase();
});

registerHelper("replace", function (context, findStr, replaceStr) {
  return context.replace(findStr, replaceStr);
});
/**
 * 生成服务
 */
export function generateService(config) {
  if (config.serviceDir && existsSync(config.serviceDir)) {
    rimraf.sync(config.serviceDir);
  }

  if (config.controllerDir && existsSync(config.controllerDir)) {
    rimraf.sync(config.controllerDir);
  }

  if (config.modelDir && existsSync(config.modelDir)) {
    rimraf.sync(config.modelDir);
  }

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
      gateway: config.name,
      config,
    }));
  } else {
    info("服务模式", "单服务");
    // 单服务模式
    return [
      {
        key: "",
        name: "",
        gateway: config.name,
        url: `${gateway}/${swagger}`,
        config,
      },
    ];
  }
}

/**
 * 获取控制器名称
 */
export function getControllerName(path, currentTag, tags) {
  try {
    const [controller]: [string] =
      path.match(/(?<=\b\api\/).*?(?=\/)/g) ||
      path.match(/(?<=\b\api\/).*/g) ||
      path.match(/(?<=\/).*?(?=\/)/g) ||
      path.match(/(?<=\/).*/g);
    return controller
      .split("/")
      .map((x) => x.replace(/^\S/, (s) => s.toUpperCase()))
      .join("");
  } catch (a) {
    throw new Error(`路径:${path}不符合规范`);
  }
}

/**
 * 获取行为器名称
 */
export function getActionName(operation) {
  return operation.replace(/Using.*?$/, "");
}

function getAliasName(config, service, key) {
  if (!config.alias) {
    return;
  }

  if (Array.isArray(config.alias)) {
    const target = config.alias.find(
      (x) => x.service === service && x.from === key
    );

    if (target) {
      return target.to;
    }
  } else {
    if (config.alias.from === key) {
      return config.alias.to;
    }
  }
}

function getPropertyTypeOpenAPI2(schema) {
  switch (true) {
    case !!schema.originalRef:
      if (schema.originalRef.startsWith("Map«")) return;

      return schema.originalRef
        .replace(/^Page«/, "")
        .replace(/^Iterable«/, "")
        .replace(/»$/, "[]");

    case schema.type === "array":
      const type = getPropertyTypeOpenAPI2(schema.items);
      return type && `${type}[]`;
  }
}

function getPropertyTypeOpenAPI3(schema) {
  switch (true) {
    case !!schema.$ref:
      const ref = schema.$ref.replace("#/components/schemas/", "");
      if (ref.startsWith("Map")) return;
      return ref.startsWith("Page")
        ? ref.replace(/^Page/, "").replace(/$/, "[]")
        : ref;
    case schema.type === "array":
      const type = getPropertyTypeOpenAPI3(schema.items);
      return type && `${type}[]`;
  }
}

function getActionReponseShema(service, responses) {
  if (!service.config.model) {
    return;
  }

  const response = responses["200"];

  if (response && response.schema) {
    return getPropertyTypeOpenAPI2(response.schema);
  }

  if (
    response &&
    response.content &&
    response.content["application/json"] &&
    response.content["application/json"]["schema"]
  ) {
    return getPropertyTypeOpenAPI3(
      response.content["application/json"]["schema"]
    );
  }
}

/**
 * 获取Action列表
 * @param paths
 */
export function createControllers(
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
        ([
          method,
          { summary, description, tags: currentTag, operationId, responses },
        ]) => {
          // 获取Controller Name
          const getController = service.config.controllerResolver
            ? service.config.controllerResolver
            : getControllerName;
          const controllerName = getController(path, currentTag, tags);

          const aliasName = getAliasName(
            service.config,
            service.key,
            controllerName
          );

          const controller = aliasName || controllerName;

          // 获取Action Name
          const getAction = service.config.actionResolver
            ? service.config.actionResolver
            : getActionName;
          const action = getAction(operationId, method, path);

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
            schema: getActionReponseShema(service, responses),
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
  return fetch(service.url, { method: "GET" })
    .then((res) => res.json()) // expecting a json response
    .then(
      async ({
        tags,
        paths,
        definitions,
        components,
      }: {
        tags: any[];
        paths: { [keys: string]: any };
        definitions: any[];
        components: any[];
      }) => {
        info("-------------------------");
        info("服务名称", service.name || "无");
        info("服务路径", service.url);
        info("-------------------------");
        // 控制器列表
        const controllers: any = [];
        // 填装控制器列表
        createControllers(service, controllers, paths, tags);
        // 生产文件
        generateControllerFiles(service, controllers);
        generateServiceFiles(service, controllers);

        if (definitions && service?.config?.model) {
          generateOpenAPI2ModelFiles(service, definitions);
        }

        if (components && service?.config?.model) {
          generateOpenAPI3ModelFiles(service, components);
        }
      }
    );
}

export async function generateRequestFile() {
  if (!configJson) {
    throw new Error("无法找到配置文件");
  }

  const generateGatewayFile = (config) => generateService(config).map(generate);

  // 多网关处理

  const configList = Array.isArray(configJson) ? configJson : [configJson];

  await Promise.all(
    configList.map(generateGatewayFile).reduce((r, i) => r.concat(i), [])
  );

  configList.forEach((config) => {
    if (!!config.useRequestFile) {
      generateUseRequestFile(config.useRequestFile, {
        dir: config.serviceDir,
        alias: config.serviceAlias,
      });

      info("更新use-request文件完成");
    }
  });
}
