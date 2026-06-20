import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { PaperFilesFileStore } from './paper-files-store.ts';
import { PaperAssetsGenerator } from './paper-assets-generator.ts';
import { PaperAssetsFileWriter } from './paper-assets-writer.ts';
import { OparlObjectsFileStore } from '../shared/oparl/oparl-objects-store.ts';
import { PaperGraphAssetsFileWriter } from './paper-graph-assets-writer.ts';
import { SessionDataFileStore } from './session-data-store.ts';
import { tryGetGeneratePaperAssetsEnv } from './env.ts';

const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);

const { councilOrganizationId } = tryGetGeneratePaperAssetsEnv();

const paperFilesStore = new PaperFilesFileStore(args.papersDir);
const oparlObjectsStore = new OparlObjectsFileStore(args.ratsinfoDir);
const sessionDataStore = new SessionDataFileStore(args.dataDir);
const paperAssetsWriter = new PaperAssetsFileWriter(args.outputDir);
const paperGraphAssetsWriter = new PaperGraphAssetsFileWriter(args.outputDir);

const generator = new PaperAssetsGenerator(
  councilOrganizationId,
  paperFilesStore,
  oparlObjectsStore,
  sessionDataStore,
  paperAssetsWriter,
  paperGraphAssetsWriter,
);
generator.generatePaperAssets();

console.log('Done.');
