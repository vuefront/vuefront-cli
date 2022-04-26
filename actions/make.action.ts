import { Input } from '../commands';
import { AbstractAction } from './abstract.action';
export class MakeAction extends AbstractAction {
  public handle(
    inputs?: Input[],
    options?: Input[],
    extraFlags?: string[],
  ): Promise<void> {
    console.log(inputs);
    console.log(options);
    console.log(extraFlags);
    process.exit(0);
  }
}
