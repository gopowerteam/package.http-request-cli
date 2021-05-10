#!/usr/bin/env node
/**
 * 生成服务
 */
export declare function generateService({ gateway, services }: {
    gateway: any;
    services: any;
}): {
    key: string;
    name: unknown;
    url: string;
}[];
/**
 * 获取控制器名称
 */
export declare function getControllerName(tags: any, targetTag: any): any;
/**
 * 获取行为器名称
 */
export declare function getActionName(operation: any): any;
/**
 * 获取Action列表
 * @param paths
 */
export declare function generateControllers(controllers: any[], paths: {
    [keys: string]: any;
}, tags: any[]): void;
/**
 * 生成配置文件
 * @param service
 */
export declare function generate(service: any): void;
export declare function startup(): Promise<void>;
