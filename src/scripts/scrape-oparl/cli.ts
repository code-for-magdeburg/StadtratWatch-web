import { parseArgs as stdCliParseArgs } from '@std/cli/parse-args';


export type ScrapeOparlArgs = {
  help: boolean;
  mode: 'full' | 'incremental';
  date?: string;
  ratsinfosystemDir: string;
};


export function parseArgs(args: string[]): ScrapeOparlArgs {
  return stdCliParseArgs(args, {
    boolean: ['help'],
    string: ['mode', 'date', 'ratsinfosystemDir'],
    default: { date: undefined },
    alias: {
      help: 'h',
      mode: 'm',
      date: 'd',
      'ratsinfosystem-dir': ['r', 'ratsinfosystemDir'],
    },
  }) as ScrapeOparlArgs;
}


export function checkArgs(args: ScrapeOparlArgs) {
  const { ratsinfosystemDir } = args;

  if (args.mode !== 'full' && args.mode !== 'incremental') {
    console.error('Invalid mode parameter. Allowed values are "full" or "incremental". See --help for usage.');
    Deno.exit(1);
  }

  if (args.mode === 'full' && !args.date) {
    console.error('Missing date parameter for "full" mode. See --help for usage.');
    Deno.exit(1);
  }

  if (!ratsinfosystemDir) {
    console.error('Missing ratsinfosystem-dir parameter. See --help for usage.');
    Deno.exit(1);
  }
}


export function printHelpText() {
  console.log(`
Usage: deno run index.ts
-h, --help                  Show this help message and exit.
-m, --mode                  Specify the mode of operation: 'full' to fetch all data, 'incremental' to fetch only changes. (default: 'full')
-d, --date                  Specify the date from which to fetch changes when in 'incremental' mode created objects in 'full' mode. Use the format 'YYYY-MM-DD'.
-r, --ratsinfosystem-dir    Specify the directory where the ratsinfosystem data will be stored.
  `);
}
