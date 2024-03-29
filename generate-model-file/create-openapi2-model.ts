import { readFileSync, writeFileSync } from "fs";
import { compile } from "handlebars";
import { dirname, resolve } from "path";
import mkdirp from "mkdirp";
import { log } from "../utils";

const TEMPLATE_FOLDER = resolve(__dirname, "..", "templates");

export const ENCODING = "utf8";
export const modelTemplatePath = `${TEMPLATE_FOLDER}/model.template.hbs`;
export const modelExtendTemplatePath = `${TEMPLATE_FOLDER}/model-extend.template.hbs`;

export async function generateModelFiles(service, definitions) {
  if (!service.config.model || !service.config.modelDir || !definitions) {
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
  return Object.entries(definitions || {})
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
  const template = compile(templateSource, { noEscape: true });

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
  const ref = propertyConfig?.originalRef || propertyConfig?.items?.originalRef;

  if (ref && ref.startsWith("Map«")) {
    return;
  }

  return ref;
}

function getPropertyType(config) {
  switch (true) {
    case !!config.originalRef:
      return config.originalRef
        .replace(/^Map«/g, "Record<")
        .replace(/»$/g, ">");
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

  const name = service.key ? `${service.key}.model.ts` : "index.ts";
  const path = resolve(modelDirectionPath, name);

  await mkdirp.sync(dirname(path));
  await writeFileSync(path, content, ENCODING);

  log("Model File Generate", `${path}`);
}
