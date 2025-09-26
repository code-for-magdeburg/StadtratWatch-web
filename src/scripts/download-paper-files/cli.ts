import { parseArgs as stdCliParseArgs } from '@std/cli/parse-args';


export type DownloadPaperFilesArgs = {
  help: boolean;
  ratsinfoDir: string;
  papersDir: string;
  year: string;
};


export function parseArgs(args: string[]): DownloadPaperFilesArgs {
  return stdCliParseArgs(args, {
    boolean: ['help'],
    string: ['ratsinfoDir', 'papers-dir', 'year'],
    alias: {
      help: 'h',
      'ratsinfo-dir': ['r', 'ratsinfoDir'],
      'papers-dir': ['p', 'papersDir'],
      'year': ['y'],
    },
  }) as DownloadPaperFilesArgs;
}


export function checkArgs(args: DownloadPaperFilesArgs) {
  const { ratsinfoDir, papersDir, year } = args;

  if (!ratsinfoDir) {
    console.error('Missing ratsinfo directory. See --help for usage.');
    Deno.exit(1);
  }

  if (!papersDir) {
    console.error('Missing papers directory. See --help for usage.');
    Deno.exit(1);
  }

  if (!year) {
    console.error('Missing year. See --help for usage.');
    Deno.exit(1);
  }

  if (isNaN(parseInt(year))) {
    console.error('Year must be a number.');
    Deno.exit(1);
  }
}


export function printHelpText() {
  console.log(`
Usage: deno run index.ts -r <ratsinfo-dir> -p <papers-dir> -y <year>
-h, --help                  Show this help message and exit.
-r, --ratsinfo-dir          The directory containing the OParl files (meetings.json, papers.json, files.json).
-p, --papers-dir            The output directory.
-y, --year                  The year to process.
  `);
}
