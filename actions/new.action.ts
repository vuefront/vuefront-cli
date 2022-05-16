import { Input } from '../commands';
import { AbstractAction } from './abstract.action';
import {VuefrontConfig} from '../lib/config'
import {VueFrontGenerator} from '../lib/generator'
import * as path from 'path'
import * as fs from 'fs'
import * as chalk from 'chalk';
// @ts-ignore
import * as sao from "sao"
export class NewAction extends AbstractAction {
  public async handle(
    inputs: Input[],
    options: Input[],
    extraFlags: string[],
  ): Promise<void> {
    const outDir = this.getOutDir(inputs)
    const overwriteDir = this.getOverwriteDir(options)
    const verbose = this.getVerbose(options)
    const answers = this.getAnswers(options)
    if (fs.existsSync(outDir) && fs.readdirSync(outDir).length && !overwriteDir) {
      const baseDir = outDir === '.' ? path.basename(process.cwd()) : outDir
      return console.error(chalk.red(
        `Could not create project in ${chalk.bold(baseDir)} because the directory is not empty.`))
    }
    console.log(chalk`✨  Generating VueFront project in {cyan ${outDir}}`)
    const logLevel =verbose ? 4 : 2
    const generator = path.resolve(__dirname, '../node_modules/create-vuefront-app/lib')
    await sao({ generator, outDir, logLevel, verbose, answers }).run()
    process.exit(0);
  }

  private getAnswers(inputs: Input[]): string | null {
    const nameInput: Input = inputs.find(
      (input) => input.name === 'answers',
    ) as Input;

    if (!nameInput) {
      return null
    }
    return nameInput.value as string;
  }
  private getOverwriteDir(inputs: Input[]): string | null {
    const nameInput: Input = inputs.find(
      (input) => input.name === 'overwriteDir',
    ) as Input;

    if (!nameInput) {
      return null
    }
    return nameInput.value as string;
  }
  private getVerbose(inputs: Input[]): string | null {
    const nameInput: Input = inputs.find(
      (input) => input.name === 'verbose',
    ) as Input;

    if (!nameInput) {
      return null
    }
    return nameInput.value as string;
  }

  private getOutDir(inputs: Input[]): string {
    const nameInput: Input = inputs.find(
      (input) => input.name === 'outDir',
    ) as Input;

    if (!nameInput) {
      throw new Error('No output directory found in command input');
    }
    return nameInput.value as string;
  }
}
