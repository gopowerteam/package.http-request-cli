import path from "path";
import fs from "fs";

// 默认定义文件名
type service = {
  name: string;
  group: string;
  path: string;
};

type Option = {
  alias: string;
  dir: string;
};

let generatedServices: service[];

/**
 *
 * @param declaration
 * @param option
 */
export function generateUseRequestFile(filePath, option: Option) {
  if (!generatedServices) {
    generatedServices = generateServices(generateServicePaths(option));
  }

  if (generatedServices) {
    const file = generateFile(generatedServices);

    fs.writeFileSync(path.resolve(filePath), file, "utf-8");
  }
}

/**
 * 生成服务路径
 * @param option
 * @returns
 */
function generateServicePaths(option: Option) {
  // 服务文件列表
  const servicePaths: string[] = [];

  // 遍历服务目录
  const walk = (dir: string) => {
    fs.readdirSync(dir).forEach(function (file) {
      // 修正windows路径符号问题
      const fullpath = path.join(dir, file).replace(/\\/g, "/");
      const stat = fs.statSync(fullpath);

      if (stat.isFile() && fullpath.endsWith(".service.ts")) {
        servicePaths.push(fullpath);
      } else if (stat.isDirectory()) {
        const subdir = path.join(dir, file);
        walk(subdir);
      }
    });
  };

  walk(path.resolve(option.dir));

  // 返回服务文件路径
  return servicePaths.map((servicePath) =>
    servicePath.replace(
      path.resolve(option.dir).replace(/\\/g, "/"),
      option.alias
    )
  );
}

/**
 * 生成服务项
 * @param paths
 * @returns
 */
function generateServices(paths: string[]) {
  const toCaseString = (str = "") =>
    str
      .replace(/-(\w)/g, ($, $1: string) => $1.toUpperCase())
      .replace(/^\S/, (s) => s.toUpperCase());

  return paths.map((filePath) => {
    const [name] =
      /[^\\]+(?=\.service\.ts$)/.exec(toCaseString(path.basename(filePath))) ||
      [];

    const [group] =
      /(?<=^.\/http\/services\/)(.*?)(?=\/.*?\.service\.ts$)/.exec(filePath) ||
      [];
      
    return {
      name: `${toCaseString(name)}Service`,
      group: toCaseString(group),
      path: filePath,
    };
  });
}

/**
 * 生成导入代码
 * @param services
 * @param placeholder
 * @returns
 */
function generateImportCode(services: service[], placeholder = "") {
  const getImportName = (service: service) =>
    service.group
      ? `${service.name} as ${service.group}_${service.name}`
      : service.name;

  return services
    .map(
      (service) =>
        `import { ${getImportName(service)} } from '${service.path.replace(
          /\.ts$/g,
          ""
        )}'`
    )
    .join(`\r\n${placeholder}`);
}

/**
 * 生成服务列表
 * @param services
 * @param placeholder
 * @returns
 */
function generateServiceCode(services: service[], placeholder = "  ") {
  const generateServices = (items: any, placeholder: string) => {
    return `${Object.entries(items)
      .map(([key, name]) => `${key}:${name}`)
      .join(`,\r\n${placeholder}`)}`;
  };

  const generateGroups = () => {
    const groups = services.reduce((result, item) => {
      result[item.group] = result[item.group] || {};
      result[item.group][item.name] = `${item.group}_${item.name}`;
      return result;
    }, {} as any);

    return `${Object.entries(groups)
      .map(
        ([group, items]) => `${group}: {
    ${generateServices(items, " ".repeat(4))}
  }`
      )
      .join(",\r\n  ")} `;
  };

  if (services.some((service) => !!service.group)) {
    return `const serviceMap = {
  ${generateGroups()}
}`;
  } else {
    return `const serviceMap = {
  ${services.map((service) => service.name).join(`,\r\n${placeholder}`)}
}`;
  }
}

function generateFile(services: service[]) {
  const importCode = generateImportCode(services);
  const serviceCode = generateServiceCode(services);

  return `${importCode}

${serviceCode}
      
export function useRequest<T>(
  select: (services: typeof serviceMap) => { new (): T }
): T {
  const service = select(serviceMap)
  return new service()
}
  `.replace("\n", "");
}
