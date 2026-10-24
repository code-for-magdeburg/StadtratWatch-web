import { checkArgs, parseCliArgs, printHelpText } from './cli.ts';
import { tryGetScrapeOparlEnv, tryGetScrapeOparlPushEnv } from './env.ts';
import { OparlClient } from './oparl-client.ts';
import { OparlObjectsFileStore } from './oparl-file-store.ts';
import { publishOparlSnapshot } from './oparl-s3-publisher.ts';
import { OparlScraper } from './oparl-scraper.ts';
import { ScraperMetadataFileStore } from './scraper-metadata-store.ts';

const args = parseCliArgs(Bun.argv.slice(2));

if (args.help) {
  printHelpText();
  process.exit(0);
}

checkArgs(args);

const env = tryGetScrapeOparlEnv();
const oparlClient = new OparlClient(+env.fetchDelayMs);
const oparlObjectsStore = new OparlObjectsFileStore(args.ratsinfosystemDir);
const oparlScraper = new OparlScraper(oparlClient, oparlObjectsStore);

switch (args.mode) {
  case 'full':
    await oparlScraper.fetchFull(env.bodyUrl, args.date!);
    await setLastSuccessfulRunDate(new Date().toISOString());
    break;

  case 'incremental':
    if (args.date) {
      await oparlScraper.fetchIncremental(env.bodyUrl, args.date);
    } else {
      const modifiedSince = await tryGetLastSuccessfulRunDate();
      await oparlScraper.fetchIncremental(env.bodyUrl, modifiedSince);
    }
    await setLastSuccessfulRunDate(new Date().toISOString());
    break;
}

if (args.push) {
  console.log('Pushing snapshot to S3...');
  const pushEnv = tryGetScrapeOparlPushEnv();
  await publishOparlSnapshot(args.ratsinfosystemDir, pushEnv);
}

async function tryGetLastSuccessfulRunDate(): Promise<string> {
  const scraperMetadataStore = new ScraperMetadataFileStore(args.ratsinfosystemDir);
  const modifiedSince = await scraperMetadataStore.getLastSuccessfulRunDate();

  if (!modifiedSince) {
    console.error('No previous successful run date found. Please provide a date using the --date parameter.');
    process.exit(1);
  }

  return modifiedSince;
}

async function setLastSuccessfulRunDate(date: string): Promise<void> {
  const scraperMetadataStore = new ScraperMetadataFileStore(args.ratsinfosystemDir);
  await scraperMetadataStore.setLastSuccessfulRunDate(date);
}

console.log('Done.');
