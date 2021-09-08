import { compile } from "handlebars";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { loadConfig, log } from "../utils";
import mkdirp from "mkdirp";

const TEMPLATE_FOLDER = resolve(__dirname, "..", "templates");

export const ENCODING = "utf8";
export const serviceTemplatePath = `${TEMPLATE_FOLDER}/service.template.hbs`;
// export const serviceDirectionPath = loadConfig().serviceDir

export function generateServiceFiles(service, controllers) {
  controllers.forEach((controller) => generateServiceFile(service, controller));
}

export function generateServiceFile(service, controller) {
  let templateSource = readFileSync(serviceTemplatePath, ENCODING);
  let template = compile(templateSource);

  const schemas = [
    ...new Set(
      controller.actions
        .map((action) => action.schema && action.schema.replace("[]", ""))
        .filter((x) => !!x)
    ),
  ];
  let serviceFileContent = template(
    Object.assign(controller, {
      service: service.key,
      controllerDir: [service.config.controllerAlias, service.key]
        .filter((x) => x)
        .join("/"),
      modelDir: [service.config.modelAlias].filter((x) => x).join("/"),
      schemas: schemas.length ? schemas : undefined,
    })
  );
  writeServiceFile(
    service.key,
    controller,
    serviceFileContent,
    service.config
  ).then((filename) => {
    log(`Service File Generate`, filename);
  });
}

export async function writeServiceFile(
  service,
  { controller, filename },
  content,
  config
) {
  const serviceDirectionPath = config.serviceDir;
  const path = resolve(serviceDirectionPath, service, `${filename}.service.ts`);
  await mkdirp.sync(dirname(path));
  await writeFileSync(path, content, ENCODING);
  return path;
}
