import { ScrapedSession } from '@srw-astro/models/scraped-session';
import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { PaperFilesStore } from "./paper-files-store.ts";
import { PaperAssetsGenerator } from './paper-assets-generator.ts';
import { PaperAssetsStore } from './paper-assets-store.ts';


const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);


const paperFilesStore = new PaperFilesStore(args.papersDir);
const paperAssetsStore = new PaperAssetsStore(args.outputDir);
const generator = new PaperAssetsGenerator(paperFilesStore, paperAssetsStore);
const scrapedSession = JSON.parse(Deno.readTextFileSync(args.scrapedSessionFilename)) as ScrapedSession;
generator.generatePaperAssets(scrapedSession);

console.log('Done.');
