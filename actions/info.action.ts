import { Input } from '../commands';
import { AbstractAction } from './abstract.action';
import loadConfig from '../lib/config'
export class InfoAction extends AbstractAction {
  public async handle(
    inputs: Input[],
    options: Input[],
    extraFlags: string[],
  ): Promise<void> {
    console.log(inputs);
    console.log(options);
    console.log(extraFlags);

    const config = await loadConfig(process.cwd())
    console.log(config)
    process.exit(0);
  }
}
