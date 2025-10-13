import { parseArgs as stdCliParseArgs } from '@std/cli/parse-args';

export type IndexSearchArgs = {
  help: boolean;
  ratsinfoDir: string;
  papersContentDir: string;
  parliamentPeriodsBaseDir: string;
};

export function parseArgs(args: string[]): IndexSearchArgs {
  return stdCliParseArgs(args, {
    boolean: ['help'],
    string: ['ratsinfoDir', 'papers-content-dir', 'parliament-periods-base-dir'],
    alias: {
      help: 'h',
      'ratsinfo-dir': ['r', 'ratsinfoDir'],
      'papers-content-dir': ['c', 'papersContentDir'],
      'parliament-periods-base-dir': ['p', 'parliamentPeriodsBaseDir'],
    },
  }) as IndexSearchArgs;
}

export function checkArgs(args: IndexSearchArgs) {
  const { ratsinfoDir, papersContentDir, parliamentPeriodsBaseDir } = args;

  if (!ratsinfoDir) {
    console.error('Missing ratsinfo directory. See --help for usage.');
    Deno.exit(1);
  }

  if (!papersContentDir) {
    console.error('Missing papers content directory. See --help for usage.');
    Deno.exit(1);
  }

  if (!parliamentPeriodsBaseDir) {
    console.error('Missing parliament periods base directory. See --help for usage.');
    Deno.exit(1);
  }
}

export function printHelpText() {
  console.log(`
Usage: deno run index.ts -r <ratsinfo-dir> -c <papers-content-dir> -p <parliament-periods-base-dir>
-h, --help                          Show this help message and exit.
-r, --ratsinfo-dir                  The directory containing the OParl files (meetings.json, papers.json, files.json).
-c, --papers-content-dir            The papers content directory.
-p, --parliament-periods-base-dir   The parliament periods base directory. It contains subdirectories for each parliament period.
  `);
}
