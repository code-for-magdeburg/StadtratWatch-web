import { IndexSearchEnv, tryGetIndexSearchEnv } from './env.ts';
import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { SearchIndexer } from './search-indexer.ts';
import { IDocumentsImporter, TypesenseImporter } from './typesense-importer.ts';
import { BatchedDocumentsImporter } from './batched-documents-importer.ts';
import { PapersContentSource } from './papers-content-source.ts';
import { SpeechesSource } from './speeches-source.ts';
import { OparlObjectsFileStore } from "../shared/oparl/oparl-objects-store.ts";


const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);


const env = tryGetIndexSearchEnv();
const importer = createImporter(env);
const oparlObjectsStore = new OparlObjectsFileStore(
  'https://ratsinfo.magdeburg.de/oparl/bodies/0001/organizations/gr/1',
  'output/ratsinfosystem'
);
const indexer = new SearchIndexer(importer, oparlObjectsStore);

const papersContentSource = new PapersContentSource(args.papersContentDir);
await indexer.indexPapers(papersContentSource);

const speechesSource = new SpeechesSource(args.parliamentPeriodsBaseDir);
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
