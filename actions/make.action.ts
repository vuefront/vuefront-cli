import { Input } from '../commands';
import { AbstractAction } from './abstract.action';
import loadConfig from '../lib/config'
export class MakeAction extends AbstractAction {
  public async handle(
    inputs: Input[],
    options: Input[],
    extraFlags: string[],
  ): Promise<void> {
    const type = this.getComponentType(inputs)
    const name = this.getComponentName(inputs)
    console.log(type);
    console.log(name);
    console.log(extraFlags);

    const config = await loadConfig(process.cwd())
    console.log(config)
    process.exit(0);
  }

  private getComponentName(inputs: Input[]): string {
    const nameInput: Input = inputs.find(
      (input) => input.name === 'name',
    ) as Input;
    console.log('nameInput')
    console.log(nameInput)
    if (!nameInput.value) {
      throw new Error('No name found in command input');
    }
    return nameInput.value as string;
  }

  private getComponentType(inputs: Input[]): string {
    const typeInput: Input = inputs.find(
      (input) => input.name === 'type',
    ) as Input;

    if (!typeInput.value) {
      throw new Error('No type found in command input');
    }
    return typeInput.value as string;
  }
}
