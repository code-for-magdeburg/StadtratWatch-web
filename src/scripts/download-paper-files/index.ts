import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { PaperFilesCollector } from './paper-files-collector.ts';
import { PaperFilesDownloader } from './paper-files-downloader.ts';
import { OparlObjectsFileStore } from '../shared/oparl/oparl-objects-store.ts';
import { tryGetDownloadPaperFilesEnv } from './env.ts';


const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);


const env = tryGetDownloadPaperFilesEnv();
const oparlObjectsStore = new OparlObjectsFileStore(env.councilOrganizationId, args.ratsinfoDir);
const downloader = new PaperFilesDownloader(args.papersDir);
const collector = new PaperFilesCollector(oparlObjectsStore, downloader);
await collector.collectFiles(args.year)
console.log('Done.');
