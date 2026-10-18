import { parseArgs } from 'node:util';

export type IndexSearchArgs = {
  help: boolean;
  ratsinfoDir?: string;
  papersContentDir?: string;
  parliamentPeriodsBaseDir?: string;
};

export function parseCliArgs(args: string[]): IndexSearchArgs {
  const { values } = parseArgs({
    args,
    options: {
      help: { type: 'boolean', short: 'h', default: false },
      'ratsinfo-dir': { type: 'string', short: 'r' },
      'papers-content-dir': { type: 'string', short: 'c' },
      'parliament-periods-base-dir': { type: 'string', short: 'p' },
    },
  });
  return {
    help: values.help,
    ratsinfoDir: values['ratsinfo-dir'],
    papersContentDir: values['papers-content-dir'],
    parliamentPeriodsBaseDir: values['parliament-periods-base-dir'],
  };
}

export function checkArgs(args: IndexSearchArgs): asserts args is Required<IndexSearchArgs> {
  const { ratsinfoDir, papersContentDir, parliamentPeriodsBaseDir } = args;

  if (!ratsinfoDir) {
    console.error('Missing ratsinfo directory. See --help for usage.');
    process.exit(1);
  }

  if (!papersContentDir) {
    console.error('Missing papers content directory. See --help for usage.');
    process.exit(1);
  }

  if (!parliamentPeriodsBaseDir) {
    console.error('Missing parliament periods base directory. See --help for usage.');
    process.exit(1);
  }
}

export function printHelpText() {
  console.log(`
Usage: bun index.ts -r <ratsinfo-dir> -c <papers-content-dir> -p <parliament-periods-base-dir>
-h, --help                          Show this help message and exit.
-r, --ratsinfo-dir                  The directory containing the OParl files (meetings.json, papers.json, files.json).
-c, --papers-content-dir            The papers content directory.
-p, --parliament-periods-base-dir   The parliament periods base directory. It contains subdirectories for each parliament period.
  `);
}
