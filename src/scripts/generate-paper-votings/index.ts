import { checkArgs, parseCliArgs, printHelpText } from './cli.ts';
import { PeriodDataFileStore } from './period-data-store.ts';
import { PaperVotingsGenerator } from './paper-votings-generator.ts';
import { PaperVotingsFileWriter } from './paper-votings-writer.ts';
import { pushPaperVotingsFromEnv } from './push.ts';

const args = parseCliArgs(Bun.argv.slice(2));

if (args.help) {
  printHelpText();
  process.exit(0);
}

checkArgs(args);

const periodDataStore = new PeriodDataFileStore(args.dataDir);
const paperVotingsWriter = new PaperVotingsFileWriter(args.outputDir);

const generator = new PaperVotingsGenerator(periodDataStore, paperVotingsWriter);
await generator.generatePaperVotings();

if (args.push) {
  await pushPaperVotingsFromEnv(args.outputDir, { dryRun: args.dryRun });
}

console.log('Done.');
