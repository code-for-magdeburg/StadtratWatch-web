import * as fs from '@std/fs';
import { parseArgs as stdCliParseArgs } from '@std/cli/parse-args';


export type GeneratePaperAssetsArgs = {
  help: boolean;
  ratsinfoDir: string;
  papersDir: string;
  outputDir: string;
};


export function parseArgs(args: string[]): GeneratePaperAssetsArgs {
  return stdCliParseArgs(args, {
    boolean: ['help'],
    string: ['ratsinfoDir', 'papers-dir', 'output-dir'],
    alias: {
      help: 'h',
      'ratsinfo-dir': ['r', 'ratsinfoDir'],
      'papers-dir': ['p', 'papersDir'],
      'output-dir': ['o', 'outputDir']
    },
  }) as GeneratePaperAssetsArgs;
}


export function checkArgs(args: GeneratePaperAssetsArgs) {
  const { ratsinfoDir, papersDir, outputDir } = args;

  if (!ratsinfoDir) {
    console.error('Missing ratsinfo directory. See --help for usage.');
    Deno.exit(1);
  }

  if (!papersDir) {
    console.error('Missing papers directory. See --help for usage.');
    Deno.exit(1);
  }

  if (!outputDir) {
    console.error('Missing output directory. See --help for usage.');
    Deno.exit(1);
  }
}


export function printHelpText() {
  console.log(`
Usage: deno run index.ts -r <ratsinfo-dir> -p <papers-dir> -o <output-dir>
-h, --help                  Show this help message and exit.
-r, --ratsinfo-dir          The directory containing the OParl files (meetings.json, papers.json, files.json).
-p, --papers-dir            The papers directory. It should contain directories with the paper files per year.
-o, --output-dir            The output directory. Json files with the papers data will be written here.
  `);
}
