import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { ImageAssetsWriter } from './image-assets-writer.ts';
import { SessionsDataGenerator } from './sessions-data-generator.ts';
import { ImagesGenerator } from './images-generator.ts';
import { InputDataLoaders } from './input-data-loaders.ts';


const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);


const loader = new InputDataLoaders(args.inputDir);
const { registry, sessionsInputData } = loader.loadInputData();


// TODO: SessionsDataGenerator is legacy stuff. Should be removed in the future.
const sessionsDataGenerator = new SessionsDataGenerator();
const sessionsData = sessionsDataGenerator.generateSessionsData(sessionsInputData, registry);


const factionNames = registry.factions
  .toSorted((a, b) => b.seats - a.seats)
  .map(faction => faction.name);

const imagesGenerator = new ImagesGenerator();
const images = imagesGenerator.generateImages(factionNames, sessionsData);


const assetsWriter = new ImageAssetsWriter(args.outputDir);
assetsWriter.writeImageAssets(images);

console.log('Done.');
