import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { PaperFilesCollector } from './paper-files-collector.ts';
import { PaperFilesDownloader } from './paper-files-downloader.ts';
import { OparlObjectsFileStore } from '../shared/oparl/oparl-objects-store.ts';
import { tryGetDownloadPaperFilesEnv } from './env.ts';
import { OparlMeetingsInMemoryRepository } from '../shared/oparl/oparl-meetings-repository.ts';
import { OparlFilesInMemoryRepository } from '../shared/oparl/oparl-files-repository.ts';
import { OparlPapersInMemoryRepository } from '../shared/oparl/oparl-papers-repository.ts';

const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);

const env = tryGetDownloadPaperFilesEnv();
const oparlObjectsStore = new OparlObjectsFileStore(args.ratsinfoDir);
const meetingsRepository = new OparlMeetingsInMemoryRepository(oparlObjectsStore.loadMeetings());
const papersRepository = new OparlPapersInMemoryRepository(oparlObjectsStore.loadPapers());
const filesRepository = new OparlFilesInMemoryRepository(oparlObjectsStore.loadFiles(), papersRepository);
const downloader = new PaperFilesDownloader(args.papersDir);
const collector = new PaperFilesCollector(meetingsRepository, filesRepository, downloader, env.councilOrganizationId);
await collector.collectFiles(args.year);
console.log('Done.');
