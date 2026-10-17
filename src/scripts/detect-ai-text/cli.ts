import { parseArgs } from 'node:util';

export type DetectAiTextArgs = {
  help: boolean;
  speechesFile: string;
  starts: number[];
  skipExisting: boolean;
};

export function parseCliArgs(args: string[]): DetectAiTextArgs {
  const { values } = parseArgs({
    args,
    options: {
      help: { type: 'boolean', short: 'h', default: false },
      'speeches-file': { type: 'string', short: 'f', default: '' },
      starts: { type: 'string', short: 't', default: '' },
      'skip-existing': { type: 'boolean', short: 'x', default: false },
    },
  });

  return {
    help: values.help,
    speechesFile: values['speeches-file'],
    starts: parseStarts(values.starts),
    skipExisting: values['skip-existing'],
  };
}

function parseStarts(value: string): number[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((start) => !Number.isNaN(start));
}

export function checkArgs(args: DetectAiTextArgs) {
  if (!args.speechesFile) {
    console.error('Missing speeches-file parameter. See --help for usage.');
    process.exit(1);
  }

  if (args.starts.length === 0) {
    console.error('Missing or empty starts parameter. See --help for usage.');
    process.exit(1);
  }
}

export function printHelpText() {
  console.log(`
Usage: bun index.ts -f <speeches-file> -t <start,start,...> [-x]
-h, --help                  Show this help message and exit.
-f, --speeches-file         Path to the session-speeches-*.json file to read and write in place.
-t, --starts                Comma-separated list of speech 'start' timestamps to assess.
-x, --skip-existing         Skip a speech if it already has an aiTextAssessment matching the
                            current transcript. A drifted transcript (hash mismatch) is
                            re-assessed regardless of this flag. (default: false)
  `);
}
