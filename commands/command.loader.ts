import * as chalk from 'chalk';
import { CommanderStatic } from 'commander';
import { MakeAction, InfoAction } from '../actions';
import { ERROR_PREFIX } from '../lib/ui';
import { MakeCommand } from './make.command';
import { InfoCommand } from './info.command';
export class CommandLoader {
  public static load(program: CommanderStatic): void {
    new MakeCommand(new MakeAction()).load(program);
    new InfoCommand(new InfoAction()).load(program);
    this.handleInvalidCommand(program);
  }

  private static handleInvalidCommand(program: CommanderStatic) {
    program.on('command:*', () => {
      console.error(
        `\n${ERROR_PREFIX} Invalid command: ${chalk.red('%s')}`,
        program.args.join(' '),
      );
      console.log(
        `See ${chalk.red('--help')} for a list of available commands.\n`,
      );
      process.exit(1);
    });
  }
}
