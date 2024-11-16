import * as path from 'path';
import * as fs from 'fs';


export type GenerateDataAssetsArgs = {
  inputDir: string;
  outputDir: string;
  scrapedSessionFilename: string;
};


export function parseArgs(args: string[]): GenerateDataAssetsArgs {
  const [_, __, inputDir, outputDir, scrapedSessionFilename] = args;
  return { inputDir, outputDir, scrapedSessionFilename };
}


export function checkArgs(args: GenerateDataAssetsArgs) {

  const { inputDir, outputDir, scrapedSessionFilename } = args;

  if (!inputDir || !outputDir || !scrapedSessionFilename) {
    console.error('Usage: node index.js <inputDir> <outputDir> <scrapedSessionFile>');
    process.exit(1);
  }

  const registryFilename = path.join(inputDir, 'registry.json');
  if (!fs.existsSync(registryFilename)) {
    console.error(`Registry file "${registryFilename}" does not exist or is not a file.`);
    process.exit(1);
  }

  if (!fs.existsSync(scrapedSessionFilename)) {
    console.error(`Scraped session file "${scrapedSessionFilename}" does not exist or is not a file.`);
    process.exit(1);
  }

}
