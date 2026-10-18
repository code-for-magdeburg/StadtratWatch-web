import { checkArgs, parseCliArgs, printHelpText } from './cli.ts';
import { PaperFilesFileStore } from './paper-files-store.ts';
import { PaperAssetsGenerator } from './paper-assets-generator.ts';
import { PaperAssetsFileWriter } from './paper-assets-writer.ts';
import { OparlObjectsFileStore } from '../shared/oparl/oparl-objects-store.ts';
import { PaperGraphAssetsFileWriter } from './paper-graph-assets-writer.ts';
import { SessionIndexFileStore } from './session-index.ts';
import { getGeneratePaperAssetsEnvOrExit } from './env.ts';
import { pushPaperAssetsFromEnv } from './push.ts';

const args = parseCliArgs(Bun.argv.slice(2));

if (args.help) {
  printHelpText();
  process.exit(0);
}

checkArgs(args);

const { councilOrganizationId } = getGeneratePaperAssetsEnvOrExit();

const paperFilesStore = await PaperFilesFileStore.load(args.papersDir);
const oparlObjectsStore = new OparlObjectsFileStore(args.ratsinfoDir);
const sessionIndexStore = new SessionIndexFileStore(args.dataDir);
const paperAssetsWriter = new PaperAssetsFileWriter(args.outputDir);
const paperGraphAssetsWriter = new PaperGraphAssetsFileWriter(args.outputDir);

const generator = new PaperAssetsGenerator(
  paperFilesStore,
  oparlObjectsStore,
  sessionIndexStore,
  councilOrganizationId,
  paperAssetsWriter,
  paperGraphAssetsWriter,
);
await generator.generatePaperAssets();

if (args.push) {
  await pushPaperAssetsFromEnv(args.outputDir, { dryRun: args.dryRun });
}

console.log('Done.');
