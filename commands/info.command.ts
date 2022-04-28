import { CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input';
export class MakeCommand extends AbstractCommand {
  public load(program: CommanderStatic): void {
    program
      .command('info')
      .description('Info')
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
