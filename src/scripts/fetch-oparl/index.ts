import { checkArgs, parseCliArgs, printHelpText } from './cli.ts';
import { getFetchOparlEnvOrExit } from './env.ts';
import { createHttpSnapshotSource } from './snapshot-source.ts';
import { createFileSnapshotStore } from './snapshot-store.ts';
import { syncOparlSnapshot } from './sync-snapshot.ts';

const args = parseCliArgs(Bun.argv.slice(2));

if (args.help) {
  printHelpText();
  process.exit(0);
}

checkArgs(args);

const env = getFetchOparlEnvOrExit();
const source = createHttpSnapshotSource(env.baseUrl, env.prefix);
const store = createFileSnapshotStore(args.dir);
const log = { info: (message: string) => console.log(message), warn: (message: string) => console.warn(message) };

try {
  await syncOparlSnapshot(source, store, log);
} catch (error) {
  console.error(`fetch-oparl failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
