"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const CONFIG_FILE = 'http-request-cli.config.json';
let CONFIG_DATA = null;
/**
 * 加载配置信息
 * @returns
 */
function loadConfig() {
    if (CONFIG_DATA)
        return CONFIG_DATA;
    const configText = fs_1.default.readFileSync(path_1.default.resolve('./', CONFIG_FILE), { encoding: 'utf-8' });
    const configJson = JSON.parse(configText);
    CONFIG_DATA = Object.assign(Object.assign({}, configJson), { base: path_1.default.resolve(configJson.base), controllerAlias: configJson.controllerDir.alias, controllerDir: path_1.default.resolve(configJson.controllerDir.path), serviceAlias: configJson.serviceDir.alias, serviceDir: path_1.default.resolve(configJson.serviceDir.path) });
    return CONFIG_DATA;
}
exports.loadConfig = loadConfig;
