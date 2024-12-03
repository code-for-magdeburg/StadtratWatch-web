import { ScrapedSession } from '../shared/model/scraped-session.ts';
import { IndexSearchEnv, tryGetIndexSearchEnv } from './env.ts';
import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { SearchIndexer } from './search-indexer.ts';
import { IDocumentsImporter, TypesenseImporter } from './typesense-importer.ts';
import { BatchedDocumentsImporter } from './batched-documents-importer.ts';
import { PapersContentSource } from './papers-content-source.ts';
import { SpeechesSource } from './speeches-source.ts';


const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);


const env = tryGetIndexSearchEnv();
const importer = createImporter(env);
const indexer = new SearchIndexer(importer);

const papersContentSource = new PapersContentSource(args.papersContentDir);
const scrapedSession = JSON.parse(Deno.readTextFileSync(args.scrapedSessionFilename)) as ScrapedSession;
await indexer.indexPapers(papersContentSource, scrapedSession);

const speechesSource = new SpeechesSource(args.electoralPeriodsBaseDir);
await indexer.indexSpeeches(speechesSource);

console.log('Done.');


function createImporter(env: IndexSearchEnv): IDocumentsImporter {
  const typesenseImporter = new TypesenseImporter(
    env.typesenseServerUrl,
    env.typesenseCollectionName,
    env.typesenseApiKey
  );
  return new BatchedDocumentsImporter(typesenseImporter, 100);
}
