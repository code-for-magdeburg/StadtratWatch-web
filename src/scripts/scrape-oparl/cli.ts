import { parseArgs } from 'node:util';

export type ScrapeOparlArgs = {
  help: boolean;
  mode: 'full' | 'incremental';
  date?: string;
  ratsinfosystemDir: string;
  push: boolean;
};

export function parseCliArgs(args: string[]): ScrapeOparlArgs {
  const { values } = parseArgs({
    args,
    options: {
      help: { type: 'boolean', short: 'h', default: false },
      mode: { type: 'string', short: 'm' },
      date: { type: 'string', short: 'd' },
      'ratsinfosystem-dir': { type: 'string', short: 'r', default: '' },
      push: { type: 'boolean', short: 'p', default: false },
    },
  });
  return {
    help: values.help,
    mode: values.mode as ScrapeOparlArgs['mode'],
    date: values.date,
    ratsinfosystemDir: values['ratsinfosystem-dir'],
    push: values.push,
  };
}

export function checkArgs(args: ScrapeOparlArgs) {
  const { ratsinfosystemDir } = args;

  if (args.mode !== 'full' && args.mode !== 'incremental') {
    console.error('Invalid mode parameter. Allowed values are "full" or "incremental". See --help for usage.');
    process.exit(1);
  }

  if (args.mode === 'full' && !args.date) {
    console.error('Missing date parameter for "full" mode. See --help for usage.');
    process.exit(1);
  }

  if (!ratsinfosystemDir) {
    console.error('Missing ratsinfosystem-dir parameter. See --help for usage.');
    process.exit(1);
  }
}

export function printHelpText() {
  console.log(`
Usage: bun index.ts
-h, --help                  Show this help message and exit.
-m, --mode                  Specify the mode of operation: 'full' to fetch all data, 'incremental' to fetch only changes. (default: 'full')
-d, --date                  Specify the date from which to fetch changes when in 'incremental' mode created objects in 'full' mode. Use the format 'YYYY-MM-DD'.
-r, --ratsinfosystem-dir    Specify the directory where the ratsinfosystem data will be stored.
-p, --push                  After scraping, upload the snapshot to S3. (default: false)
  `);
}
