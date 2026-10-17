import { parseArgs } from 'node:util';

export type DownloadPaperFilesArgs = {
  help: boolean;
  ratsinfoDir?: string;
  papersDir?: string;
  year?: string;
};

export function parseCliArgs(args: string[]): DownloadPaperFilesArgs {
  const { values } = parseArgs({
    args,
    options: {
      help: { type: 'boolean', short: 'h', default: false },
      'ratsinfo-dir': { type: 'string', short: 'r' },
      'papers-dir': { type: 'string', short: 'p' },
      year: { type: 'string', short: 'y' },
    },
  });
  return {
    help: values.help,
    ratsinfoDir: values['ratsinfo-dir'],
    papersDir: values['papers-dir'],
    year: values.year,
  };
}

export function checkArgs(args: DownloadPaperFilesArgs): asserts args is Required<DownloadPaperFilesArgs> {
  const { ratsinfoDir, papersDir, year } = args;

  if (!ratsinfoDir) {
    console.error('Missing ratsinfo directory. See --help for usage.');
    process.exit(1);
  }

  if (!papersDir) {
    console.error('Missing papers directory. See --help for usage.');
    process.exit(1);
  }

  if (!year) {
    console.error('Missing year. See --help for usage.');
    process.exit(1);
  }

  if (Number.isNaN(Number.parseInt(year))) {
    console.error('Year must be a number.');
    process.exit(1);
  }
}

export function printHelpText() {
  console.log(`
Usage: bun index.ts -r <ratsinfo-dir> -p <papers-dir> -y <year>
-h, --help                  Show this help message and exit.
-r, --ratsinfo-dir          The directory containing the OParl files (meetings.json, papers.json, files.json).
-p, --papers-dir            The output directory.
-y, --year                  The year to process.
  `);
}
