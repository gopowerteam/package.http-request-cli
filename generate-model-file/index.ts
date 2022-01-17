import { existsSync, readFileSync, writeFileSync } from "fs";
import { compile } from "handlebars";
import { dirname, resolve } from "path";
import mkdirp from "mkdirp";

const TEMPLATE_FOLDER = resolve(__dirname, "..", "templates");

export const ENCODING = "utf8";
export const modelTemplatePath = `${TEMPLATE_FOLDER}/model.template.hbs`;
export const modelExtendTemplatePath = `${TEMPLATE_FOLDER}/model-extend.template.hbs`;

export async function generateModelFiles(service, definitions) {
  if (!service.config.model || !service.config.modelDir) {
    return;
  }

  const modelClassContent = getDefinitionItems(definitions)
    .map(({ className, properties }) =>
      generateModelContent(className, properties)
    )
    .join("\r\n");

  const modelImportContent = getImportContent();

  const modelFileContent = [modelImportContent, modelClassContent].join("\r\n");

  await writeModelFile(service, modelFileContent);
}

function getImportContent() {
  return [
    `import { Type } from 'class-transformer'`,
    `import { Model } from '@gopowerteam/http-request'`,
    "\r\n",
  ].join("\r\n");
}

function getDefinitionItems(definitions): any[] {
  return Object.entries(definitions)
    .map(([className, { type, properties }]: [string, any]) => ({
      className,
      type,
      properties,
    }))
    .filter(
      ({ className, type }) =>
        !className.startsWith("Map«") &&
        !className.startsWith("Page«") &&
        !className.startsWith("Iterable«") &&
        !className.startsWith("Pageable") &&
        !className.startsWith("Serializable") &&
        type == "object"
    );
}

function generateModelContent(className, properties) {
  const templateSource = readFileSync(modelTemplatePath, ENCODING);
  const template = compile(templateSource);

  return template({
    className: className,
    properties: getformatProperty(properties),
  });
}

function getformatProperty(properties) {
  return Object.entries(properties).map(
    ([propertyName, propertyConfig]: [string, any]) => {
      return {
        propertyName,
        propertyType: getPropertyType(propertyConfig),
        originalRef: getOriginalRef(propertyConfig),
        description: propertyConfig.description,
      };
    }
  );
}

function getOriginalRef(propertyConfig) {
  return propertyConfig?.originalRef || propertyConfig?.items?.originalRef;
}

function getPropertyType(config) {
  switch (true) {
    case !!config.originalRef:
      return config.originalRef;
    case config.type === "integer":
      return "number";
    case config.type === "array":
      return `${getPropertyType(config.items)}[]`;
  }

  return config.type;
}

/**
 * 生成控制器文件
 * @param service
 * @param param1
 * @param content
 */
export async function writeModelFile(service, content) {
  const modelDirectionPath = service.config.modelDir;

  const path = resolve(modelDirectionPath, `${service.key}.model.ts`);

  await mkdirp.sync(dirname(path));
  await writeFileSync(path, content, ENCODING);
}
