import { checkArgs, parseCliArgs, printHelpText } from './cli.ts';
import { getGenerateOparlDerivativesEnvOrExit } from './env.ts';
import { OparlObjectsFileStore } from '../shared/oparl/oparl-objects-store.ts';
import { RegistryFileStore } from './registry-store.ts';
import { DerivativesFileWriter } from './derivatives-writer.ts';
import { OparlDerivativesGenerator } from './oparl-derivatives-generator.ts';

const args = parseCliArgs(Bun.argv.slice(2));

if (args.help) {
  printHelpText();
  process.exit(0);
}

checkArgs(args);

const env = getGenerateOparlDerivativesEnvOrExit();

const oparlObjectsStore = new OparlObjectsFileStore(args.oparlDir);
const registryStore = new RegistryFileStore(args.dataDir);
const writer = new DerivativesFileWriter(args.dataDir);

const generator = new OparlDerivativesGenerator(
  oparlObjectsStore,
  registryStore,
  writer,
  env.councilOrganizationId,
);
await generator.generate();

console.log('Done.');
