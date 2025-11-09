import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { PaperFilesFileStore } from './paper-files-store.ts';
import { PaperAssetsGenerator } from './paper-assets-generator.ts';
import { PaperAssetsFileStore } from './paper-assets-store.ts';
import { OparlObjectsFileStore } from '../shared/oparl/oparl-objects-store.ts';

const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);

const paperFilesStore = new PaperFilesFileStore(args.papersDir);
const paperAssetsStore = new PaperAssetsFileStore(args.outputDir);
const oparlObjectsStore = new OparlObjectsFileStore(args.ratsinfoDir);

const generator = new PaperAssetsGenerator(
  paperFilesStore,
  oparlObjectsStore,
  paperAssetsStore,
);
generator.generatePaperAssets();

console.log('Done.');
