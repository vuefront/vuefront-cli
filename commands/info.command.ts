import { CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input';
export class InfoCommand extends AbstractCommand {
  public load(program: CommanderStatic): void {
    program
      .command('info  <typeComponent> [name]')
      .description('Info')
      .action(async (typeComponent: string, name: string) => {
        type NewType = Input;

        const options: NewType[] = [];
        const inputs: Input[] = [];
        inputs.push({ name: 'name', value: name });
        inputs.push({ name: 'typeComponent', value: typeComponent });

        await this.action.handle(inputs, options);
      });
  }
}
