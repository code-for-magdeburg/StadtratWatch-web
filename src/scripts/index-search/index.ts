import { OparlFilesInMemoryRepository } from '../shared/oparl/oparl-files-repository.ts';
import { OparlMeetingsInMemoryRepository } from '../shared/oparl/oparl-meetings-repository.ts';
import { OparlObjectsFileStore } from '../shared/oparl/oparl-objects-store.ts';
import { OparlPapersInMemoryRepository } from '../shared/oparl/oparl-papers-repository.ts';
import { BatchedDocumentsImporter } from './batched-documents-importer.ts';
import { checkArgs, parseCliArgs, printHelpText } from './cli.ts';
import { type IndexSearchEnv, tryGetIndexSearchEnv } from './env.ts';
import { PapersContentSource } from './papers-content-source.ts';
import { SearchIndexer } from './search-indexer.ts';
import { SpeechesSource } from './speeches-source.ts';
import { type IDocumentsImporter, TypesenseImporter } from './typesense-importer.ts';

const args = parseCliArgs(Bun.argv.slice(2));

if (args.help) {
  printHelpText();
  process.exit(0);
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
