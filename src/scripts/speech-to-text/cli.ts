import { parseArgs } from 'node:util';

export type SpeechToTextArgs = {
  help: boolean;
  speechesDir: string;
  outputDir: string;
  session: string;
  skipExisting: boolean;
};

export function parseCliArgs(args: string[]): SpeechToTextArgs {
  const { values } = parseArgs({
    args,
    allowNegative: true,
    options: {
      help: { type: 'boolean', short: 'h', default: false },
      'speeches-dir': { type: 'string', short: 'i', default: '' },
      'output-dir': { type: 'string', short: 'o', default: '' },
      session: { type: 'string', short: 's', default: '' },
      'skip-existing': { type: 'boolean', short: 'x', default: true },
    },
  });
  return {
    help: values.help,
    speechesDir: values['speeches-dir'],
    outputDir: values['output-dir'],
    session: values.session,
    skipExisting: values['skip-existing'],
  };
}

export function checkArgs(args: SpeechToTextArgs) {
  const { speechesDir, outputDir, session } = args;

  if (!speechesDir) {
    console.error('Missing speeches-dir parameter. See --help for usage.');
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
}

export function printHelpText() {
  console.log(`
Usage: bun index.ts -i <speeches-dir> -o <output-dir> -s <session> [--no-skip-existing]
-h, --help                  Show this help message and exit.
-i, --speeches-dir          Specify the directory containing the speeches audio files to transcribe.
-o, --output-dir            Specify the output directory where the resulting JSON file will be saved.
-s, --session               Specify the session to process. Use the format 'YYYY-MM-DD'.
-x, --skip-existing         Skip a transcription if a text content already exists. (default: true)
    --no-skip-existing      Transcribe all speeches, including those that already have a transcription.
  `);
}
