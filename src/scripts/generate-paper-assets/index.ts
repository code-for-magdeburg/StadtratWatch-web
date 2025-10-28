import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { PaperFilesStore } from './paper-files-store.ts';
import { PaperAssetsGenerator } from './paper-assets-generator.ts';
import { PaperAssetsStore } from './paper-assets-store.ts';
import { OparlObjectsFileStore } from '../shared/oparl/oparl-objects-store.ts';
import { OparlMeetingsInMemoryRepository } from '../shared/oparl/oparl-meetings-repository.ts';
import { OparlPapersInMemoryRepository } from '../shared/oparl/oparl-papers-repository.ts';
import { OparlFilesInMemoryRepository } from '../shared/oparl/oparl-files-repository.ts';
import { OparlOrganizationsInMemoryRepository } from '../shared/oparl/oparl-organizations-repository.ts';
import { OparlAgendaItemsInMemoryRepository } from '../shared/oparl/oparl-agenda-items-repository.ts';

const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);

const paperFilesStore = new PaperFilesStore(args.papersDir);
const paperAssetsStore = new PaperAssetsStore(args.outputDir);
const oparlObjectsStore = new OparlObjectsFileStore(args.ratsinfoDir);
const meetingsRepository = new OparlMeetingsInMemoryRepository(oparlObjectsStore.loadMeetings());
const papersRepository = new OparlPapersInMemoryRepository(oparlObjectsStore.loadPapers());
const organizationsRepository = new OparlOrganizationsInMemoryRepository(oparlObjectsStore.loadOrganizations());
const agendaItemsRepository = new OparlAgendaItemsInMemoryRepository(oparlObjectsStore.loadAgendaItems());
const filesRepository = new OparlFilesInMemoryRepository(oparlObjectsStore.loadFiles(), papersRepository);
const generator = new PaperAssetsGenerator(
  meetingsRepository,
  papersRepository,
  organizationsRepository,
  agendaItemsRepository,
  filesRepository,
  paperFilesStore,
);
const paperAssets = generator.generatePaperAssets();

paperAssetsStore.writePaperAssets(paperAssets);

console.log('Done.');
