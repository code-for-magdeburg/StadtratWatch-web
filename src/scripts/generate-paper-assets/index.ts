import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { PaperFilesStore } from './paper-files-store.ts';
import { PaperAssetsGenerator } from './paper-assets-generator.ts';
import { PaperAssetsStore } from './paper-assets-store.ts';
import { OparlObjectsFileStore } from '../shared/oparl/oparl-objects-store.ts';
import { tryGetGeneratePaperAssetsEnv } from './env.ts';

const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);

const env = tryGetGeneratePaperAssetsEnv();
const paperFilesStore = new PaperFilesStore(args.papersDir);
const paperAssetsStore = new PaperAssetsStore(args.outputDir);
const oparlObjectsStore = new OparlObjectsFileStore(env.councilOrganizationId, args.ratsinfoDir);
const generator = new PaperAssetsGenerator(oparlObjectsStore, paperFilesStore);
const paperAssets = generator.generatePaperAssets();

paperAssetsStore.writePaperAssets(paperAssets);

console.log('Done.');
