import { checkArgs, parseCliArgs, printHelpText } from './cli.ts';
import { ImageAssetsWriter } from './image-assets-writer.ts';
import { VotingsImageDataGenerator } from './votings-image-data-generator.ts';
import { ImagesGenerator } from './images-generator.ts';
import { InputDataLoaders } from './input-data-loaders.ts';
import { pushImageAssetsFromEnv } from './push.ts';

const args = parseCliArgs(Bun.argv.slice(2));

if (args.help) {
  printHelpText();
  process.exit(0);
}

checkArgs(args);

const imagesGenerator = new ImagesGenerator();

const loader = new InputDataLoaders(args.inputDir);
const { registry, sessionsInput } = await loader.loadInputData();

const votingsImageDataGenerator = new VotingsImageDataGenerator();
const votingsImageData = votingsImageDataGenerator.generateVotingsImageData(registry, sessionsInput);

const votingImages = imagesGenerator.generateVotingImages(votingsImageData);

const assetsWriter = new ImageAssetsWriter(args.outputDir);
await assetsWriter.writeImageAssets(votingImages);

if (args.push) {
  await pushImageAssetsFromEnv(args.outputDir, registry.id, { dryRun: args.dryRun });
}

console.log('Done.');
