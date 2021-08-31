import chalk from "chalk";
import path from "path";

const CONFIG_FILE = "http-request-cli.config.js";
let CONFIG_DATA: any = null;

/**
 * 加载配置信息
 * @returns
 */
export function loadConfig() {
  if (CONFIG_DATA) return CONFIG_DATA;

  const configJson = require(path.resolve("./", CONFIG_FILE));

  const getConfig = (config) => ({
    ...config,
    controllerAlias: config.controllerDir.alias,
    controllerDir: path.resolve(config.controllerDir.path),
    serviceAlias: config.serviceDir.alias,
    serviceDir: path.resolve(config.serviceDir.path),
  });

  if (Array.isArray(configJson)) {
    CONFIG_DATA = configJson.map(getConfig);
  } else {
    CONFIG_DATA = getConfig(configJson);
  }

  return CONFIG_DATA;
}

export function log(type, message) {
  console.log(chalk`{blue.bold [${type}]} {gray ${message}}`);
}

export function info(type, message = "") {
  console.log(chalk`{red.bold ${type}} {green.bold ${message}}`);
}
