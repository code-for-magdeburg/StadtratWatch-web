import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { ParsedFilesStore } from './parsed-files-store.ts';
import { RttmFilesStore } from './rttm-files-store.ts';
import { RttmFilesParser } from './rttm-files-parser.ts';

const args = parseArgs(Bun.argv.slice(2));

if (args.help) {
  printHelpText();
  process.exit(0);
}

checkArgs(args);

const rttmFilesStore = new RttmFilesStore(args.inputDir);
const parsedFileStore = new ParsedFilesStore(args.outputDir);
const rttmFileParser = new RttmFilesParser(rttmFilesStore, parsedFileStore);
await rttmFileParser.process(args.session);
console.log('Done.');
