import { CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input';
export class MakeCommand extends AbstractCommand {
  public load(program: CommanderStatic): void {
    program
      .command('make <type> [name]')
      .description('Generate VueFront Component.')
      .action(async (type: string, name: string) => {
        type NewType = Input;
        const options: NewType[] = [];
        const inputs: Input[] = [];
        inputs.push({ name: 'name', value: name });
        inputs.push({ name: 'type', value: type });

        await this.action.handle(inputs, options);
      });
  }
}
