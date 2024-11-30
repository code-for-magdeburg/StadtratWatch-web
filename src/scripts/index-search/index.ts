import { ScrapedSession } from '../shared/model/scraped-session.ts';
import { tryGetIndexSearchEnv } from './env.ts';
import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { SearchIndexer } from './search-indexer.ts';


const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);


const env = tryGetIndexSearchEnv();
const indexer = new SearchIndexer(
  env.typesenseServerUrl,
  env.typesenseCollectionName,
  env.typesenseApiKey
);

const scrapedSession = JSON.parse(Deno.readTextFileSync(args.scrapedSessionFilename)) as ScrapedSession;
await indexer.indexPapers(args.papersContentDir, scrapedSession);
await indexer.indexSpeeches(args.electoralPeriodsBaseDir);

console.log('Done.');
