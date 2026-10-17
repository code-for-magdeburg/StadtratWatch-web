import { existsSync } from 'node:fs';
import { parseArgs } from 'node:util';

export type ScanVotingImagesArgs = {
  help: boolean;
  scanConfigFile: string;
  votingImagesDir: string;
  outputDir: string;
  session: string;
};

export function parseCliArgs(args: string[]): ScanVotingImagesArgs {
  const { values } = parseArgs({
    args,
    options: {
      help: { type: 'boolean', short: 'h', default: false },
      'scan-config-file': { type: 'string', short: 'c', default: '' },
      'voting-images-dir': { type: 'string', short: 'i', default: '' },
      'output-dir': { type: 'string', short: 'o', default: '' },
      session: { type: 'string', short: 's', default: '' },
    },
  });
  return {
    help: values.help,
    scanConfigFile: values['scan-config-file'],
    votingImagesDir: values['voting-images-dir'],
    outputDir: values['output-dir'],
    session: values.session,
  };
}

export function checkArgs(args: ScanVotingImagesArgs) {
  const { scanConfigFile, votingImagesDir, outputDir, session } = args;

  if (!scanConfigFile) {
    console.error('Missing scan-config-file parameter. See --help for usage.');
    process.exit(1);
  }

  if (!votingImagesDir) {
    console.error('Missing voting-images-dir parameter. See --help for usage.');
    process.exit(1);
  }

  if (!outputDir) {
    console.error('Missing output-dir parameter. See --help for usage.');
    process.exit(1);
  }

  if (!session) {
    console.error('Missing session parameter. See --help for usage.');
    process.exit(1);
  }

  if (!existsSync(scanConfigFile)) {
    console.error(`Scan config file "${scanConfigFile}" does not exist.`);
    process.exit(1);
  }

  if (!existsSync(votingImagesDir)) {
    console.error(`Voting images directory "${votingImagesDir}" does not exist.`);
    process.exit(1);
  }
}

export function printHelpText() {
  console.log(`
Usage: bun index.ts -c <scan-config-file> -i <voting-images-dir> -o <output-dir> -s <session>
-h, --help                  Show this help message and exit.
-c, --scan-config-file      Specify the scan config file.
-i, --voting-images-dir     Specify the directory containing the voting images.
-o, --output-dir            Specify the output directory where the resulting JSON file will be saved.
-s, --session               Specify the session to process. Use the format 'YYYY-MM-DD'.
  `);
}
