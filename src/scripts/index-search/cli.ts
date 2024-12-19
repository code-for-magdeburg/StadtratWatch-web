import * as fs from '@std/fs';
import { parseArgs as stdCliParseArgs } from '@std/cli/parse-args';


export type IndexSearchArgs = {
  help: boolean;
  papersContentDir: string;
  electoralPeriodsBaseDir: string;
  scrapedSessionFilename: string;
};


export function parseArgs(args: string[]): IndexSearchArgs {
  return stdCliParseArgs(args, {
    boolean: ['help'],
    string: ['papers-content-dir', 'electoral-periods-base-dir', 'scraped-session-filename'],
    alias: {
      help: 'h',
      'papers-content-dir': ['p', 'papersContentDir'],
      'electoral-periods-base-dir': ['e', 'electoralPeriodsBaseDir'],
      'scraped-session-filename': ['s', 'scrapedSessionFilename'],
    },
  }) as IndexSearchArgs;
}


export function checkArgs(args: IndexSearchArgs) {
  const { papersContentDir, electoralPeriodsBaseDir, scrapedSessionFilename } = args;

  if (!papersContentDir) {
    console.error('Missing papers content directory. See --help for usage.');
    Deno.exit(1);
  }

  if (!electoralPeriodsBaseDir) {
    console.error('Missing electoral periods base directory. See --help for usage.');
    Deno.exit(1);
  }

  if (!scrapedSessionFilename) {
    console.error('Missing scraped session file. See --help for usage.');
    Deno.exit(1);
  }

  if (!fs.existsSync(scrapedSessionFilename)) {
    console.error(`Scraped session file "${scrapedSessionFilename}" does not exist.`);
    Deno.exit(1);
  }
}


export function printHelpText() {
  console.log(`
Usage: deno run index.ts -i <papers-content-dir> -e <electoral-periods-base-dir> -s <scraped-session-filename>
-h, --help                          Show this help message and exit.
-p, --papers-content-dir            The papers content directory.
-e, --electoral-periods-base-dir    The electoral periods base directory. It contains subdirectories for each electoral period.
-s, --scraped-session-filename      The scraped session file.
  `);
}
