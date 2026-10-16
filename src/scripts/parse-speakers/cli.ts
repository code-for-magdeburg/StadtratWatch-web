import { parseArgs as nodeParseArgs } from 'node:util';

export type ParseSpeakersArgs = {
  help: boolean;
  inputDir: string;
  outputDir: string;
  session: string;
};

export function parseArgs(args: string[]): ParseSpeakersArgs {
  const { values } = nodeParseArgs({
    args,
    options: {
      help: { type: 'boolean', short: 'h', default: false },
      'input-dir': { type: 'string', short: 'i', default: '' },
      'output-dir': { type: 'string', short: 'o', default: '' },
      session: { type: 'string', short: 's', default: '' },
    },
  });
  return {
    help: values.help,
    inputDir: values['input-dir'],
    outputDir: values['output-dir'],
    session: values.session,
  };
}

export function checkArgs(args: ParseSpeakersArgs) {
  const { inputDir, outputDir, session } = args;

  if (!inputDir) {
    console.error('Missing input-dir parameter. See --help for usage.');
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
Usage: bun index.ts -i <input-dir> -o <output-dir> -s <session>
-h, --help          Show this help message and exit.
-i, --input-dir     Specify the input directory. It has to contain the RTTM files.
-o, --output-dir    Specify the output directory where the resulting JSON file will be saved.
-s, --session       Specify the session to process. Use the format 'YYYY-MM-DD'.
  `);
}
