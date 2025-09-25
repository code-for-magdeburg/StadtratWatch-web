import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { tryGetScrapeOparlEnv } from './env.ts';
import { ScraperMetadataFileStore } from './scraper-metadata-store.ts';
import { OparlScraper } from './oparl-scraper.ts';
import { OparlClient } from './oparl-client.ts';
import { OparlObjectsFileStore } from './oparl-file-store.ts';


const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);


const env = tryGetScrapeOparlEnv();
const oparlClient = new OparlClient(+env.fetchDelayMs);
const oparlObjectsStore = new OparlObjectsFileStore(args.ratsinfosystemDir);
const oparlScraper = new OparlScraper(oparlClient, oparlObjectsStore);

switch (args.mode) {
  case 'full':
    await oparlScraper.fetchFull(env.bodyUrl, args.date!);
    setLastSuccessfulRunDate(new Date().toISOString());
    break;

  case 'incremental':
    if (args.date) {
      await oparlScraper.fetchIncremental(env.bodyUrl, args.date);
    } else {
      const modifiedSince = tryGetLastSuccessfulRunDate();
      await oparlScraper.fetchIncremental(env.bodyUrl, modifiedSince);
    }
    setLastSuccessfulRunDate(new Date().toISOString());
    break;
}


function tryGetLastSuccessfulRunDate(): string {
  const scraperMetadataStore = new ScraperMetadataFileStore(args.ratsinfosystemDir);
  const modifiedSince = scraperMetadataStore.getLastSuccessfulRunDate();

  if (!modifiedSince) {
    console.error('No previous successful run date found. Please provide a date using the --date parameter.');
    Deno.exit(1);
  }

  return modifiedSince;
}


function setLastSuccessfulRunDate(date: string): void {
  const scraperMetadataStore = new ScraperMetadataFileStore(args.ratsinfosystemDir);
  scraperMetadataStore.setLastSuccessfulRunDate(date);
}


console.log('Done.');
