import { CommanderStatic } from 'commander';
import { AbstractCommand } from './abstract.command';
import { Input } from './command.input';
export class NewCommand extends AbstractCommand {
  public load(program: CommanderStatic): void {
    program
    .command('new [out-dir]')
      .description('Generate in a custom directory or current directory')
      .action(async (outDir = '.') => {
        type NewType = Input
        const options: NewType[] = [];
        const inputs: Input[] = [];
        inputs.push({ name: 'outDir', value: outDir });
        try {
          await this.action.handle(inputs, options);
        } catch(err) {
          process.exit(1);
        }
      });
  }
}
