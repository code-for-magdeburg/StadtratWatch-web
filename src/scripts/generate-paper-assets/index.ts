import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { PaperFilesFileStore } from './paper-files-store.ts';
import { PaperAssetsGenerator } from './paper-assets-generator.ts';
import { PaperAssetsFileWriter, PaperGraphAssetsFileWriter } from './paper-assets-writer.ts';
import { OparlObjectsFileStore } from '../shared/oparl/oparl-objects-store.ts';

const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);

const paperFilesStore = new PaperFilesFileStore(args.papersDir);
const oparlObjectsStore = new OparlObjectsFileStore(args.ratsinfoDir);
const paperAssetsWriter = new PaperAssetsFileWriter(args.outputDir);
const paperGraphAssetsWriter = new PaperGraphAssetsFileWriter(args.outputDir);

const generator = new PaperAssetsGenerator(
  paperFilesStore,
  oparlObjectsStore,
  paperAssetsWriter,
  paperGraphAssetsWriter,
);
generator.generatePaperAssets();

console.log('Done.');
