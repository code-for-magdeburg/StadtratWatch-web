import { parseArgs as stdCliParseArgs } from '@std/cli/parse-args';


export type GenerateRoutesFileArgs = {
  help: boolean;
  dataDir: string;
  outputDir: string;
};


export function parseArgs(args: string[]): GenerateRoutesFileArgs {
  return stdCliParseArgs(args, {
    boolean: ['help'],
    string: ['data-dir', 'output-dir'],
    alias: {
      help: 'h',
      'data-dir': ['d', 'dataDir'],
      'output-dir': ['o', 'outputDir']
    },
  }) as GenerateRoutesFileArgs;
}


export function checkArgs(args: GenerateRoutesFileArgs) {
  const { dataDir, outputDir } = args;

  if (!dataDir) {
    console.error('Missing data directory. See --help for usage.');
    Deno.exit(1);
  }

  if (!outputDir) {
    console.error('Missing output directory. See --help for usage.');
    Deno.exit(1);
  }
}


export function printHelpText() {
  console.log(`
Usage: deno run index.ts -d <data-dir> -o <output-dir> -s <scraped-session-file>
-h, --help                  Show this help message and exit.
-d, --data-dir              The data directory. It must contain the registry.json file.
-o, --output-dir            The output directory.
  `);
}
