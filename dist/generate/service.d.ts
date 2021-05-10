export declare const ENCODING = "utf8";
export declare const serviceTemplatePath: string;
export declare const serviceDirectionPath: any;
export declare function generateServiceFiles(service: any, controllers: any): void;
export declare function generateServiceFile(service: any, controller: any): void;
export declare function writeServiceFile(service: any, { controller, filename }: {
    controller: any;
    filename: any;
}, content: any): Promise<string>;
