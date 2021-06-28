import { compile } from 'handlebars'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { loadConfig, log } from '../utils'
import mkdirp from 'mkdirp'

const TEMPLATE_FOLDER = resolve(__dirname, '..', 'templates')

export const ENCODING = 'utf8'
export const serviceTemplatePath = `${TEMPLATE_FOLDER}/service.template.hbs`
export const serviceDirectionPath = loadConfig().serviceDir

export function generateServiceFiles(service, controllers) {
    controllers.forEach((controller) =>
        generateServiceFile(service, controller)
    )
}

export function generateServiceFile(service, controller) {
    let templateSource = readFileSync(serviceTemplatePath, ENCODING)
    let template = compile(templateSource)
    let serviceFileContent = template(
        Object.assign(controller, { service: service.key, controllerDir: [loadConfig().controllerAlias, service.key].filter(x => x).join('/') })
    )
    writeServiceFile(service.key, controller, serviceFileContent).then(
        (filename) => {
            log(`Service File Generate`, filename)
        }
    )
}

export async function writeServiceFile(
    service,
    { controller, filename },
    content
) {
    const path = resolve(
        serviceDirectionPath,
        service,
        `${filename}.service.ts`
    )
    await mkdirp.sync(dirname(path))
    await writeFileSync(path, content, ENCODING)
    return path
}
