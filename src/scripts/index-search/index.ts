import { IndexSearchEnv, tryGetIndexSearchEnv } from './env.ts';
import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { SearchIndexer } from './search-indexer.ts';
import { IDocumentsImporter, TypesenseImporter } from './typesense-importer.ts';
import { BatchedDocumentsImporter } from './batched-documents-importer.ts';
import { PapersContentSource } from './papers-content-source.ts';
import { SpeechesSource } from './speeches-source.ts';
import { OparlObjectsFileStore } from '../shared/oparl/oparl-objects-store.ts';
import { OparlMeetingsInMemoryRepository } from '../shared/oparl/oparl-meetings-repository.ts';
import { OparlPapersInMemoryRepository } from '../shared/oparl/oparl-papers-repository.ts';
import { OparlFilesInMemoryRepository } from '../shared/oparl/oparl-files-repository.ts';

const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);

const env = tryGetIndexSearchEnv();
const importer = createImporter(env);
const oparlObjectsStore = new OparlObjectsFileStore(args.ratsinfoDir);
const meetingsRepository = new OparlMeetingsInMemoryRepository(oparlObjectsStore.loadMeetings());
const papersRepository = new OparlPapersInMemoryRepository(oparlObjectsStore.loadPapers());
const filesRepository = new OparlFilesInMemoryRepository(oparlObjectsStore.loadFiles(), papersRepository);
const indexer = new SearchIndexer(
  importer,
  meetingsRepository,
  papersRepository,
  filesRepository,
  env.councilOrganizationId,
);

const papersContentSource = new PapersContentSource(args.papersContentDir);
await indexer.indexPapers(papersContentSource);

const speechesSource = new SpeechesSource(args.parliamentPeriodsBaseDir);
await indexer.indexSpeeches(speechesSource);

console.log('Done.');

function createImporter(env: IndexSearchEnv): IDocumentsImporter {
  const typesenseImporter = new TypesenseImporter(
    env.typesenseServerUrl,
    env.typesenseCollectionName,
    env.typesenseApiKey,
  );
  return new BatchedDocumentsImporter(typesenseImporter, 100);
}
