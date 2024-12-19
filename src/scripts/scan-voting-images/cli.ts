import * as fs from '@std/fs';
import { parseArgs as stdCliParseArgs } from '@std/cli/parse-args';


export type ScanVotingImagesArgs = {
  help: boolean;
  sessionConfigFile: string;
  votingImagesDir: string;
  outputDir: string;
  session: string;
};


export function parseArgs(args: string[]): ScanVotingImagesArgs {
  return stdCliParseArgs(args, {
    boolean: ['help'],
    string: ['sessionConfigFile', 'votingImagesDir', 'outputDir', 'session'],
    alias: {
      help: 'h',
      'session-config-file': ['c', 'sessionConfigFile'],
      'voting-images-dir': ['i', 'votingImagesDir'],
      'output-dir': ['o', 'outputDir'],
      'session': ['s'],
    },
  }) as ScanVotingImagesArgs;
}


export function checkArgs(args: ScanVotingImagesArgs) {
  const { sessionConfigFile, votingImagesDir, outputDir, session } = args;

  if (!sessionConfigFile) {
    console.error('Missing session-config-file parameter. See --help for usage.');
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

  if (!fs.existsSync(sessionConfigFile)) {
    console.error(`Session config file "${sessionConfigFile}" does not exist.`);
    Deno.exit(1);
  }

  if (!fs.existsSync(votingImagesDir)) {
    console.error(`Voting images directory "${votingImagesDir}" does not exist.`);
    Deno.exit(1);
  }
}


export function printHelpText() {
  console.log(`
Usage: deno run index.ts -c <session-config-file> -o <output-dir> -s <session>
-h, --help                  Show this help message and exit.
-c, --session-config-file   Specify the session config file.
-i, --voting-images-dir     Specify the directory containing the voting images.
-o, --output-dir            Specify the output directory where the resulting JSON file will be saved.
-s, --session               Specify the session to process. Use the format 'YYYY-MM-DD'.
  `);
}
