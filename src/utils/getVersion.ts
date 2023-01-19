import { resolve } from 'path'
import { readFileSync } from 'fs'

export const getVersion = () => {
    const pathToPackageJson = resolve('package.json')
    const packageJson = readFileSync(pathToPackageJson, 'utf8')

    return JSON.parse(packageJson).version
}
