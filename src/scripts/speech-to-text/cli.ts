import { parseArgs as stdCliParseArgs } from '@std/cli/parse-args';

export type SpeechToTextArgs = {
  help: boolean;
  speechesDir: string;
  outputDir: string;
  session: string;
  skipExisting: boolean;
};

export function parseArgs(args: string[]): SpeechToTextArgs {
  return stdCliParseArgs(args, {
    boolean: ['help', 'skipExisting'],
    string: ['speechesDir', 'outputDir', 'session'],
    default: { skipExisting: true },
    alias: {
      help: 'h',
      'speeches-dir': ['i', 'speechesDir'],
      'output-dir': ['o', 'outputDir'],
      'skip-existing': ['x', 'skipExisting'],
      'session': ['s'],
    },
  }) as SpeechToTextArgs;
}

export function checkArgs(args: SpeechToTextArgs) {
  const { speechesDir, outputDir, session } = args;

  if (!speechesDir) {
    console.error('Missing speeches-dir parameter. See --help for usage.');
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
Usage: deno run index.ts -i <speeches-dir> -o <output-dir> -s <session> -x true
-h, --help                  Show this help message and exit.
-i, --speeches-dir          Specify the directory containing the speeches audio files to transcribe.
-o, --output-dir            Specify the output directory where the resulting JSON file will be saved.
-s, --session               Specify the session to process. Use the format 'YYYY-MM-DD'.
-x, --skip-existing         Skip a transcription if a text content already exists. (default: true)
  `);
}
