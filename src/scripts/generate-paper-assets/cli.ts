import { parseArgs } from 'node:util';

export type GeneratePaperAssetsArgs = {
  help: boolean;
  ratsinfoDir?: string;
  papersDir?: string;
  dataDir: string;
  outputDir?: string;
  push: boolean;
  dryRun: boolean;
};

export function parseCliArgs(args: string[]): GeneratePaperAssetsArgs {
  const { values } = parseArgs({
    args,
    options: {
      help: { type: 'boolean', short: 'h', default: false },
      'ratsinfo-dir': { type: 'string', short: 'r' },
      'papers-dir': { type: 'string', short: 'p' },
      'data-dir': { type: 'string', short: 'd', default: 'data/' },
      'output-dir': { type: 'string', short: 'o' },
      push: { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
    },
  });
  return {
    help: values.help,
    ratsinfoDir: values['ratsinfo-dir'],
    papersDir: values['papers-dir'],
    dataDir: values['data-dir'],
    outputDir: values['output-dir'],
    push: values.push,
    dryRun: values['dry-run'],
  };
}

export function checkArgs(args: GeneratePaperAssetsArgs): asserts args is Required<GeneratePaperAssetsArgs> {
  const { ratsinfoDir, papersDir, dataDir, outputDir } = args;

  if (!ratsinfoDir) {
    console.error('Missing ratsinfo directory. See --help for usage.');
    process.exit(1);
  }

  if (!papersDir) {
    console.error('Missing papers directory. See --help for usage.');
    process.exit(1);
  }

  if (!dataDir) {
    console.error('Missing data directory. See --help for usage.');
    process.exit(1);
  }

  if (!outputDir) {
    console.error('Missing output directory. See --help for usage.');
    process.exit(1);
  }
}

export function printHelpText() {
  console.log(`
Usage: bun index.ts -r <ratsinfo-dir> -p <papers-dir> [-d <data-dir>] -o <output-dir> [--push [--dry-run]]
-h, --help                  Show this help message and exit.
-r, --ratsinfo-dir          The directory containing the OParl files (meetings.json, papers.json, files.json).
-p, --papers-dir            The papers directory. It should contain directories with the paper files per year.
-d, --data-dir              The data directory containing the parliament period registries. Used to link
                            consultations to their session pages by date. Default: data/
-o, --output-dir            The output directory. Json files with the papers data will be written here.
    --push                  After generating, publish the output directory to web-assets/papers/ on
                            S3/CloudFront: upload new or changed batches, prune orphaned ones, set
                            Cache-Control, invalidate the touched paths, and verify the result.
                            Requires AWS_S3_BUCKET (the target bucket) plus AWS credentials/
                            configuration (AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
                            AWS_CLOUDFRONT_DISTRIBUTION_ID). See .env.sample.
    --dry-run               Only meaningful with --push: report the upload/delete/invalidate diff
                            without mutating S3.
  `);
}
