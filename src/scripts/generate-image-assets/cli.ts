import { existsSync } from 'node:fs';
import * as path from 'node:path';
import { parseArgs } from 'node:util';

export type GenerateImageAssetsArgs = {
  help: boolean;
  inputDir?: string;
  outputDir?: string;
  push: boolean;
  dryRun: boolean;
};

export function parseCliArgs(args: string[]): GenerateImageAssetsArgs {
  const { values } = parseArgs({
    args,
    options: {
      help: { type: 'boolean', short: 'h', default: false },
      'input-dir': { type: 'string', short: 'i' },
      'output-dir': { type: 'string', short: 'o' },
      push: { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
    },
  });
  return {
    help: values.help,
    inputDir: values['input-dir'],
    outputDir: values['output-dir'],
    push: values.push,
    dryRun: values['dry-run'],
  };
}

export function checkArgs(args: GenerateImageAssetsArgs): asserts args is Required<GenerateImageAssetsArgs> {
  const { inputDir, outputDir } = args;

  if (!inputDir) {
    console.error('Missing input directory. See --help for usage.');
    process.exit(1);
  }

  if (!outputDir) {
    console.error('Missing output directory. See --help for usage.');
    process.exit(1);
  }

  const registryFilename = path.join(inputDir, 'registry.json');
  if (!existsSync(registryFilename)) {
    console.error(`Registry file "${registryFilename}" does not exist.`);
    process.exit(1);
  }
}

export function printHelpText() {
  console.log(`
Usage: bun index.ts -i <input-dir> -o <output-dir> [--push [--dry-run]]
-h, --help                  Show this help message and exit.
-i, --input-dir             The input directory.
-o, --output-dir            The output directory.
    --push                  After generating, publish the output directory to
                            web-assets/parliament-periods/{period}/ on
                            S3/CloudFront: upload new or changed images, prune
                            orphaned ones, set Cache-Control, invalidate the
                            touched paths, and verify the result. Requires
                            AWS_S3_BUCKET (the target bucket) plus AWS
                            credentials/configuration (AWS_REGION,
                            AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
                            AWS_CLOUDFRONT_DISTRIBUTION_ID). See .env.sample.
    --dry-run               Only meaningful with --push: report the upload/delete/
                            invalidate diff without mutating S3.
  `);
}
