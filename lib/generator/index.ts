import * as fs from 'fs'
import * as _ from 'lodash'
import * as path from 'path'
import { VuefrontConfig } from '../config';
export class VueFrontGenerator {
    public async generateComponent(typeComponent: VueFrontComponentKey, name: string) {
        const vuefrontConfig = new VuefrontConfig();
        await vuefrontConfig.load();
        const componentType = vuefrontConfig.detectComponentType(typeComponent)
        if (!componentType) {
            console.error('Component type `'+name+'` not found ')
            throw new Error('Component type `'+name+'` not found ')
        }
        const component = vuefrontConfig.getComponent(componentType, name)
        const componentsFolder = vuefrontConfig.getComponentsFolder()
        let componentName = name
        if (component) {
            const componentPath = vuefrontConfig.getComponentFullPath(component as VueFrontComponent)
            if (!componentPath) {
                console.error('Component `'+componentPath+'` not found ')
                throw new Error('Component `'+componentPath+'` not found ')
            }
            const fileName = path.basename(componentPath, '.vue')
            componentName = fileName
            fs.mkdirSync(componentsFolder + '/' + componentType + '/' + fileName, {recursive: true})
            fs.copyFileSync(componentPath, componentsFolder + '/' + componentType + '/' + fileName + '/' + fileName + '.vue')
        } else {
            fs.mkdirSync(componentsFolder + '/' + componentType + '/' + componentName, {recursive: true})
            fs.writeFileSync(componentsFolder + '/' + componentType + '/' + name + '/' + name + '.vue', '<template>\n  <div></div>\n</template>\n');
        }

        await vuefrontConfig.addComponentToLocalConfig(componentType, name, componentsFolder + '/' + componentType + '/' + componentName + '/' + componentName + '.vue')
    }
}