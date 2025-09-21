import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { tryGetScrapeOparlEnv } from './env.ts';
import { OparlObjectsFileStore, OparlScraper, OparlSystemClient, ScraperMetadataFileStore } from './scrape-oparl.ts';


const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);


const env = tryGetScrapeOparlEnv();
const oparlSystemClient = new OparlSystemClient(+env.fetchDelayMs);
const oparlObjectsStore = new OparlObjectsFileStore(args.ratsinfosystemDir);
const scrapeOparl = new OparlScraper(oparlSystemClient, oparlObjectsStore);

switch (args.mode) {
  case 'full':
    await scrapeOparl.fetchFull(env.bodyUrl, args.date!);
    setLastSuccessfulRunDate(new Date().toISOString());
    break;

  case 'incremental':
    if (args.date) {
      await scrapeOparl.fetchIncremental(env.bodyUrl, args.date);
    } else {
      const modifiedSince = tryGetLastSuccessfulRunDate();
      await scrapeOparl.fetchIncremental(env.bodyUrl, modifiedSince);
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
