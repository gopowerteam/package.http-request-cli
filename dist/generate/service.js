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
exports.writeServiceFile = exports.generateServiceFile = exports.generateServiceFiles = exports.serviceDirectionPath = exports.serviceTemplatePath = exports.ENCODING = void 0;
const handlebars_1 = require("handlebars");
const fs_1 = require("fs");
const path_1 = require("path");
const utils_1 = require("../utils");
const mkdirp_1 = __importDefault(require("mkdirp"));
const TEMPLATE_FOLDER = path_1.resolve(__dirname, '..', 'templates');
exports.ENCODING = 'utf8';
exports.serviceTemplatePath = `${TEMPLATE_FOLDER}/service.template.hbs`;
exports.serviceDirectionPath = utils_1.loadConfig().serviceDir;
function generateServiceFiles(service, controllers) {
    controllers.forEach((controller) => generateServiceFile(service, controller));
}
exports.generateServiceFiles = generateServiceFiles;
function generateServiceFile(service, controller) {
    let templateSource = fs_1.readFileSync(exports.serviceTemplatePath, exports.ENCODING);
    let template = handlebars_1.compile(templateSource);
    let serviceFileContent = template(Object.assign(controller, { service: service.key, controllerDir: [utils_1.loadConfig().controllerAlias, service.key].filter(x => x).join('/') }));
    writeServiceFile(service.key, controller, serviceFileContent).then((filename) => {
        console.log(`${filename}-生成完成`);
    });
}
exports.generateServiceFile = generateServiceFile;
function writeServiceFile(service, { controller, filename }, content) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = path_1.resolve(exports.serviceDirectionPath, service, `${filename}.service.ts`);
        yield mkdirp_1.default.sync(path_1.dirname(path));
        yield fs_1.writeFileSync(path, content, exports.ENCODING);
        return path;
    });
}
exports.writeServiceFile = writeServiceFile;
