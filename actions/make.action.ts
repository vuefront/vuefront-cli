import { Input } from '../commands';
import { AbstractAction } from './abstract.action';
import {VuefrontConfig} from '../lib/config'
import {VueFrontGenerator} from '../lib/generator'
export class MakeAction extends AbstractAction {
  public async handle(
    inputs: Input[],
    options: Input[],
    extraFlags: string[],
  ): Promise<void> {
    const typeComponent = this.getComponentType(inputs)
    const name = this.getComponentName(inputs)
    const generator = new VueFrontGenerator()
    await generator.generateComponent(typeComponent, name);
    process.exit(0);
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
