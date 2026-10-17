import { parseArgs } from 'node:util';

export type FetchOparlArgs = {
  help: boolean;
  dir: string;
};

export function parseCliArgs(args: string[]): FetchOparlArgs {
  const { values } = parseArgs({
    args,
    options: {
      help: { type: 'boolean', short: 'h', default: false },
      dir: { type: 'string', short: 'd', default: 'data/oparl-magdeburg/' },
    },
  });
  return { help: values.help, dir: values.dir };
}

export function checkArgs(args: FetchOparlArgs) {
  if (!args.dir) {
    console.error('Missing dir parameter. See --help for usage.');
    process.exit(1);
  }
}

export function printHelpText() {
  console.log(`
Usage: bun index.ts [-d <dir>]

Mirrors the published OParl snapshot into <dir>. It reads the remote manifest, compares each file's
content hash against the local copy and downloads only the blobs that changed or are missing
(idempotent — if everything matches it does nothing). The remote base URL and prefix come from the
environment (AWS_CLOUDFRONT_BASE_URL, AWS_S3_OPARL_PREFIX).

-h, --help    Show this help message and exit.
-d, --dir     Directory the snapshot is materialised into. Default: data/oparl-magdeburg/
  `);
}
