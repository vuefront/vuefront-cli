import { Input } from '../commands';
import { AbstractAction } from './abstract.action';
import {VuefrontConfig} from '../lib/config'
export class InfoAction extends AbstractAction {
  public async handle(
    inputs: Input[],
    options: Input[],
    extraFlags: string[],
  ): Promise<void> {
    const typeComponent = this.getComponentType(inputs)
    const name = this.getComponentName(inputs)
    const vuefrontConfig = new VuefrontConfig('/Users/alexkrasny/Workspace/javascript/vuefront/vuefront-vite-starter-kit');

    await vuefrontConfig.load() 
    const componentType = vuefrontConfig.detectComponentType(typeComponent)
    if (!componentType) {
      console.error('Component type `'+name+'` not found ')
      throw new Error('Component type `'+name+'` not found ')
    }
    const component = vuefrontConfig.getComponent(componentType, name)
    if (!component){
      console.error('Component with name `'+name+'` not found ')
      throw new Error('Component with name `'+name+'` not found ')
    }
    console.log(component)
  }


  private getComponentName(inputs: Input[]): string {
    const nameInput: Input = inputs.find(
      (input) => input.name === 'name',
    ) as Input;

    if (!nameInput.value) {
      throw new Error('No name found in command input');
    }
    return nameInput.value as string;
  }

  private getComponentType(inputs: Input[]): VueFrontComponentKey {
    const typeInput: Input = inputs.find(
      (input) => input.name === 'typeComponent',
    ) as Input;

    if (!typeInput.value) {
      throw new Error('No type found in command input');
    }
    return typeInput.value as VueFrontComponentKey;
  }
}
