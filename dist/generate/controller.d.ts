export declare const ENCODING = "utf8";
export declare const controllerTemplatePath: string;
export declare const controllerDirectionPath: any;
export declare function generateControllerFiles(service: any, controllers: any): void;
export declare function generateControllerFile(service: any, controller: any): void;
/**
 * 生成控制器文件
 * @param service
 * @param param1
 * @param content
 */
export declare function writeControllerFile(service: any, { controller, filename }: {
    controller: any;
    filename: any;
}, content: any): Promise<string>;
