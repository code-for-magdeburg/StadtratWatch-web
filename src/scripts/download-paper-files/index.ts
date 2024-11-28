import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { PaperFilesCollector } from './paper-files-collector.ts';
import { PaperFilesDownloader } from './paper-files-downloader.ts';
import { ScrapedSession } from '../shared/model/scraped-session.ts';


const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);


const downloader = new PaperFilesDownloader(args.papersDir);
const scrapedSession = JSON.parse(Deno.readTextFileSync(args.scrapedSessionFilename)) as ScrapedSession;
const collector = new PaperFilesCollector(scrapedSession, downloader);
await collector.collectFiles(parseInt(args.year))
console.log('Done.');
