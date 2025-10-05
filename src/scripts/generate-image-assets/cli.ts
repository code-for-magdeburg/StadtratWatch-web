import * as fs from '@std/fs';
import * as path from '@std/path';
import { parseArgs as stdCliParseArgs } from '@std/cli/parse-args';


export type GenerateDataAssetsArgs = {
  help: boolean;
  inputDir: string;
  outputDir: string;
};


export function parseArgs(args: string[]): GenerateDataAssetsArgs {
  return stdCliParseArgs(args, {
    boolean: ['help'],
    string: ['input-dir', 'output-dir'],
    alias: {
      help: 'h',
      'input-dir': ['i', 'inputDir'],
      'output-dir': ['o', 'outputDir'],
    },
  }) as GenerateDataAssetsArgs;
}


export function checkArgs(args: GenerateDataAssetsArgs) {
  const { inputDir, outputDir } = args;

  if (!inputDir) {
    console.error('Missing input directory. See --help for usage.');
    Deno.exit(1);
  }

  if (!outputDir) {
    console.error('Missing output directory. See --help for usage.');
    Deno.exit(1);
  }

  const registryFilename = path.join(inputDir, 'registry.json');
  if (!fs.existsSync(registryFilename)) {
    console.error(`Registry file "${registryFilename}" does not exist.`);
    Deno.exit(1);
  }
}


export function printHelpText() {
  console.log(`
Usage: deno run index.ts -i <input-dir> -o <output-dir>
-h, --help                  Show this help message and exit.
-i, --input-dir             The input directory.
-o, --output-dir            The output directory.
  `);
}
