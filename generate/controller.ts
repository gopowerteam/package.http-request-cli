import { compile } from 'handlebars'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { loadConfig } from '../utils'
import mkdirp from 'mkdirp'

const TEMPLATE_FOLDER = resolve(__dirname, '..', 'templates')

export const ENCODING = 'utf8'
export const controllerTemplatePath = `${TEMPLATE_FOLDER}/controller.template.hbs`
export const controllerDirectionPath = loadConfig().controllerDir

export function generateControllerFiles(service, controllers) {
    controllers.forEach((controller) =>
        generateControllerFile(service, controller)
    )
}

export function generateControllerFile(service, controller) {
    let templateSource = readFileSync(controllerTemplatePath, ENCODING)
    let template = compile(templateSource)
    let controllerFileContent = template(
        Object.assign(controller, { service: service.name })
    )
    writeControllerFile(service.key, controller, controllerFileContent).then(
        (filename) => {
            console.log(`${filename}-生成完成`)
        }
    )
}

/**
 * 生成控制器文件
 * @param service
 * @param param1
 * @param content
 */
export async function writeControllerFile(
    service,
    { controller, filename },
    content
) {
    const path = resolve(
        controllerDirectionPath,
        service,
        `${filename}.controller.ts`
    )
    await mkdirp.sync(dirname(path))
    await writeFileSync(path, content, ENCODING)
    return path
}
