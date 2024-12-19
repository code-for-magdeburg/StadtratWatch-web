import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { AssetsWriter } from './assets-writer.ts';
import { SessionsDataGenerator } from './sessions-data-generator.ts';
import { PersonsDataGenerator } from './persons-data-generator.ts';
import { FactionsDataGenerator } from './factions-data-generator.ts';
import { PartiesDataGenerator } from './parties-data-generator.ts';
import { MetadataGenerator } from './metadata-generator.ts';
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


const sessionsDataGenerator = new SessionsDataGenerator();
const sessionsData = sessionsDataGenerator.generateSessionsData(sessionsInputData, registry, scrapedSession);

const personsDataGenerator = new PersonsDataGenerator();
const personsData = personsDataGenerator.generatePersonsData(registry, sessionsData.sessions);

const factionsDataGenerator = new FactionsDataGenerator();
const factionsData = factionsDataGenerator.generateFactionsData(registry, sessionsData.sessions);

const partiesDataGenerator = new PartiesDataGenerator();
const partiesData = partiesDataGenerator.generatePartiesData(registry, sessionsData.sessions);

const metadataGenerator = new MetadataGenerator();
const metadata = metadataGenerator.generateMetadata(registry, sessionsData.sessions);

const imagesGenerator = new ImagesGenerator();
const images = imagesGenerator.generateImages(registry, sessionsData.sessions);


const assetsWriter = new AssetsWriter(args.outputDir);
assetsWriter.writeAssetsData(
  sessionsData,
  personsData,
  factionsData,
  partiesData,
  metadata,
  images
);

console.log('Done.');
