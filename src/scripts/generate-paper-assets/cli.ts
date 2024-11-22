import * as fs from '@std/fs';
import { parseArgs as stdCliParseArgs } from '@std/cli/parse-args';


export type GeneratePaperAssetsArgs = {
  help: boolean;
  scrapedSessionFilename: string;
  papersDir: string;
  outputDir: string;
};


export function parseArgs(args: string[]): GeneratePaperAssetsArgs {
  return stdCliParseArgs(args, {
    boolean: ['help'],
    string: ['scraped-session-filename', 'papers-dir', 'output-dir'],
    alias: {
      help: 'h',
      'scraped-session-filename': ['s', 'scrapedSessionFilename'],
      'papers-dir': ['p', 'papersDir'],
      'output-dir': ['o', 'outputDir']
    },
  }) as GeneratePaperAssetsArgs;
}


export function checkArgs(args: GeneratePaperAssetsArgs) {
  const { scrapedSessionFilename, papersDir, outputDir } = args;

  if (!scrapedSessionFilename) {
    console.error('Missing scraped session file. See --help for usage.');
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

  if (!fs.existsSync(scrapedSessionFilename)) {
    console.error(`Scraped session file "${scrapedSessionFilename}" does not exist.`);
    Deno.exit(1);
  }
}


export function printHelpText() {
  console.log(`
Usage: deno run index.ts -i <input-dir> -o <output-dir> -s <scraped-session-file>
-h, --help                  Show this help message and exit.
-s, --scraped-session-file  The scraped session file.
-p, --papers-dir            The papers directory. It should contain directories with the paper files per year.
-o, --output-dir            The output directory. Json files with the papers data will be written here.
  `);
}
