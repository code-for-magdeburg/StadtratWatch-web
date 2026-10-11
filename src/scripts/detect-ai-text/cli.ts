import { parseArgs as stdCliParseArgs } from '@std/cli/parse-args';

export type DetectAiTextArgs = {
  help: boolean;
  speechesFile: string;
  starts: number[];
  skipExisting: boolean;
};

export function parseArgs(args: string[]): DetectAiTextArgs {
  const parsed = stdCliParseArgs(args, {
    boolean: ['help', 'skip-existing'],
    string: ['speeches-file', 'starts'],
    default: { 'skip-existing': false },
    alias: {
      help: 'h',
      'speeches-file': ['f', 'speechesFile'],
      starts: 't',
      'skip-existing': ['x', 'skipExisting'],
    },
  });

  return {
    help: parsed.help as boolean,
    speechesFile: parsed.speechesFile as string,
    starts: parseStarts(parsed.starts as string | undefined),
    skipExisting: parsed.skipExisting as boolean,
  };
}

function parseStarts(value: string | undefined): number[] {
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
    Deno.exit(1);
  }

  if (args.starts.length === 0) {
    console.error('Missing or empty starts parameter. See --help for usage.');
    Deno.exit(1);
  }
}

export function printHelpText() {
  console.log(`
Usage: deno run index.ts -f <speeches-file> -t <start,start,...> [-x]
-h, --help                  Show this help message and exit.
-f, --speeches-file         Path to the session-speeches-*.json file to read and write in place.
-t, --starts                Comma-separated list of speech 'start' timestamps to assess.
-x, --skip-existing         Skip a speech if it already has an aiTextAssessment matching the
                            current transcript. A drifted transcript (hash mismatch) is
                            re-assessed regardless of this flag. (default: false)
  `);
}
