import { parseArgs as stdCliParseArgs } from '@std/cli/parse-args';

export type ParseSpeakersArgs = {
  help: boolean;
  inputDir: string;
  outputDir: string;
  session: string;
};

export function parseArgs(args: string[]): ParseSpeakersArgs {
  return stdCliParseArgs(args, {
    boolean: ['help'],
    string: ['input-dir', 'output-dir', 'session'],
    alias: {
      help: 'h',
      'input-dir': ['i', 'inputDir'],
      'output-dir': ['o', 'outputDir'],
      'session': ['s'],
    },
  }) as ParseSpeakersArgs;
}

export function checkArgs(args: ParseSpeakersArgs) {
  const { inputDir, outputDir, session } = args;

  if (!inputDir) {
    console.error('Missing input-dir parameter. See --help for usage.');
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
}

export function printHelpText() {
  console.log(`
Usage: deno run index.ts -s <session>
-h, --help          Show this help message and exit.
-i, --input-dir     Specify the input directory. It has to contain the RTTM files.
-o, --output-dir    Specify the output directory where the resulting JSON file will be saved.
-s, --session       Specify the session to process. Use the format 'YYYY-MM-DD'.
  `);
}
