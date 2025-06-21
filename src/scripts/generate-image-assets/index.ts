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


const loader = new InputDataLoaders(args.inputDir, args.scrapedSessionFilename);
const { registry, scrapedSession, sessionsInputData } = loader.loadInputData();


// TODO: SessionsDataGenerator is legacy stuff. Should be removed in the future.
// (only used as a temporary input for the ImagesGenerator)
// Best to take care if it in #299
const sessionsDataGenerator = new SessionsDataGenerator();
const sessionsData = sessionsDataGenerator.generateSessionsData(
  sessionsInputData,
  registry,
  scrapedSession
);

const imagesGenerator = new ImagesGenerator();
const images = imagesGenerator.generateImages(registry, sessionsData.sessions);


const assetsWriter = new ImageAssetsWriter(args.outputDir);
assetsWriter.writeImageAssets(images);

console.log('Done.');
