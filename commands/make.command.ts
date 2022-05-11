import { CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input';
export class MakeCommand extends AbstractCommand {
  public load(program: CommanderStatic): void {
    program
      .command('make <typeComponent> [name]')
      .description('Generate VueFront Component.')
      .action(async (typeComponent: string, name: string) => {
        type NewType = Input;
        const options: NewType[] = [];
        const inputs: Input[] = [];
        inputs.push({ name: 'name', value: name });
        inputs.push({ name: 'typeComponent', value: typeComponent });
        try {
          await this.action.handle(inputs, options);
        } catch(err) {
          process.exit(1);
        }
      });
  }
}
