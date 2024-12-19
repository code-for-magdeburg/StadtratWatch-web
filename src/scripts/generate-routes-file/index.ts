import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { ElectoralPeriodsSource } from './electoral-periods-source.ts';
import { RoutesStore } from './routes-store.ts';
import { RoutesGenerator } from './routes-generator.ts';


const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);


const electoralPeriodsSource = new ElectoralPeriodsSource(args.dataDir);
const routesStore = new RoutesStore(args.outputDir);
const generator = new RoutesGenerator(electoralPeriodsSource, routesStore);
generator.generateRoutes();

console.log('Done.');
