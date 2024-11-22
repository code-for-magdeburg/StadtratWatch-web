import * as fs from '@std/fs';
import { parseArgs as stdCliParseArgs } from '@std/cli/parse-args';


export type DownloadPaperFilesArgs = {
  help: boolean;
  scrapedSessionFilename: string;
  outputDir: string;
  year: string;
};


export function parseArgs(args: string[]): DownloadPaperFilesArgs {
  return stdCliParseArgs(args, {
    boolean: ['help'],
    string: ['scraped-session-filename', 'output-dir', 'year'],
    alias: {
      help: 'h',
      'scraped-session-filename': ['s', 'scrapedSessionFilename'],
      'output-dir': ['o', 'outputDir'],
      'year': ['y'],
    },
  }) as DownloadPaperFilesArgs;
}


export function checkArgs(args: DownloadPaperFilesArgs) {
  const { scrapedSessionFilename, outputDir, year } = args;

  if (!scrapedSessionFilename) {
    console.error('Missing scraped session file. See --help for usage.');
    Deno.exit(1);
  }

  if (!outputDir) {
    console.error('Missing output directory. See --help for usage.');
    Deno.exit(1);
  }

  if (!year) {
    console.error('Missing year. See --help for usage.');
    Deno.exit(1);
  }

  if (!fs.existsSync(scrapedSessionFilename)) {
    console.error(`Scraped session file "${scrapedSessionFilename}" does not exist.`);
    Deno.exit(1);
  }

  if (isNaN(parseInt(year))) {
    console.error('Year must be a number.');
    Deno.exit(1);
  }
}


export function printHelpText() {
  console.log(`
Usage: deno run index.ts -i <input-dir> -o <output-dir> -s <scraped-session-file>
-h, --help                  Show this help message and exit.
-s, --scraped-session-file  The scraped session file.
-o, --output-dir            The output directory.
-y, --year                  The year to process.
  `);
}
