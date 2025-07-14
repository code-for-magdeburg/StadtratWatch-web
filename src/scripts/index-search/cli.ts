import * as fs from '@std/fs';
import { parseArgs as stdCliParseArgs } from '@std/cli/parse-args';


export type IndexSearchArgs = {
  help: boolean;
  papersContentDir: string;
  parliamentPeriodsBaseDir: string;
  scrapedSessionFilename: string;
};


export function parseArgs(args: string[]): IndexSearchArgs {
  return stdCliParseArgs(args, {
    boolean: ['help'],
    string: ['papers-content-dir', 'parliament-periods-base-dir', 'scraped-session-filename'],
    alias: {
      help: 'h',
      'papers-content-dir': ['c', 'papersContentDir'],
      'parliament-periods-base-dir': ['p', 'parliamentPeriodsBaseDir'],
      'scraped-session-filename': ['s', 'scrapedSessionFilename'],
    },
  }) as IndexSearchArgs;
}


export function checkArgs(args: IndexSearchArgs) {
  const { papersContentDir, parliamentPeriodsBaseDir, scrapedSessionFilename } = args;

  if (!papersContentDir) {
    console.error('Missing papers content directory. See --help for usage.');
    Deno.exit(1);
  }

  if (!parliamentPeriodsBaseDir) {
    console.error('Missing parliament periods base directory. See --help for usage.');
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
Usage: deno run index.ts -c <papers-content-dir> -p <parliament-periods-base-dir> -s <scraped-session-filename>
-h, --help                          Show this help message and exit.
-c, --papers-content-dir            The papers content directory.
-p, --parliament-periods-base-dir   The parliament periods base directory. It contains subdirectories for each parliament period.
-s, --scraped-session-filename      The scraped session file.
  `);
}
