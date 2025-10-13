import * as fs from '@std/fs';
import { parseArgs as stdCliParseArgs } from '@std/cli/parse-args';

export type ScanVotingImagesArgs = {
  help: boolean;
  scanConfigFile: string;
  votingImagesDir: string;
  outputDir: string;
  session: string;
};

export function parseArgs(args: string[]): ScanVotingImagesArgs {
  return stdCliParseArgs(args, {
    boolean: ['help'],
    string: ['scanConfigFile', 'votingImagesDir', 'outputDir', 'session'],
    alias: {
      help: 'h',
      'scan-config-file': ['c', 'scanConfigFile'],
      'voting-images-dir': ['i', 'votingImagesDir'],
      'output-dir': ['o', 'outputDir'],
      'session': ['s'],
    },
  }) as ScanVotingImagesArgs;
}

export function checkArgs(args: ScanVotingImagesArgs) {
  const { scanConfigFile, votingImagesDir, outputDir, session } = args;

  if (!scanConfigFile) {
    console.error('Missing scan-config-file parameter. See --help for usage.');
    Deno.exit(1);
  }

  if (!votingImagesDir) {
    console.error('Missing voting-images-dir parameter. See --help for usage.');
    Deno.exit(1);
  }

  if (!outputDir) {
    console.error('Missing output-dir parameter. See --help for usage.');
    Deno.exit(1);
  }

  if (!session) {
    console.error('Missing session parameter. See --help for usage.');
    Deno.exit(1);
  }

  if (!fs.existsSync(scanConfigFile)) {
    console.error(`Scan config file "${scanConfigFile}" does not exist.`);
    Deno.exit(1);
  }

  if (!fs.existsSync(votingImagesDir)) {
    console.error(`Voting images directory "${votingImagesDir}" does not exist.`);
    Deno.exit(1);
  }
}

export function printHelpText() {
  console.log(`
Usage: deno run index.ts -c <scan-config-file> -o <output-dir> -s <session>
-h, --help                  Show this help message and exit.
-c, --scan-config-file      Specify the scan config file.
-i, --voting-images-dir     Specify the directory containing the voting images.
-o, --output-dir            Specify the output directory where the resulting JSON file will be saved.
-s, --session               Specify the session to process. Use the format 'YYYY-MM-DD'.
  `);
}
