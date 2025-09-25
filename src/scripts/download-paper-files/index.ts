import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { PaperFilesCollector } from './paper-files-collector.ts';
import { PaperFilesDownloader } from './paper-files-downloader.ts';
import { ScrapedSession } from '@srw-astro/models/scraped-session';
import { OparlObjectsFileStore } from './oparl-objects-store.ts';


const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);


const scrapedSession = JSON.parse(Deno.readTextFileSync(args.scrapedSessionFilename)) as ScrapedSession;
const oparlObjectsStore = new OparlObjectsFileStore(scrapedSession);
const downloader = new PaperFilesDownloader(args.papersDir);
const collector = new PaperFilesCollector(oparlObjectsStore, downloader);
await collector.collectFiles(parseInt(args.year))
console.log('Done.');
