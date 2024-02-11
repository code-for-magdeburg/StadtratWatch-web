import * as fs from 'fs';
import { generatePersonFiles } from './generate-person-files';
import { generateSessionFiles } from './generate-session-files';
import { generateFractionFiles } from './generate-fraction-files';
import { generatePartyFiles } from './generate-party-files';
import { generateMetadataFile } from './generate-metadata-file';
import { ScrapedSession } from '../shared/model/scraped-session';
import { Registry } from './model/registry';


const inputDir = process.argv[2];
const outputDir = process.argv[3];
if (!inputDir || !outputDir) {
  console.error('Usage: node index.js <inputDir> <outputDir>');
  process.exit(1);
}

const registryFilename = `${inputDir}/registry.json`;
if (!fs.existsSync(registryFilename) || !fs.lstatSync(registryFilename).isFile()) {
  console.error(`Registry file "${registryFilename}" does not exist or is not a file.`);
  process.exit(1);
}

const scrapedSessionFilename = `${inputDir}/Magdeburg.json`;
if (!fs.existsSync(scrapedSessionFilename) || !fs.lstatSync(scrapedSessionFilename).isFile()) {
  console.error(`Scraped session file "${scrapedSessionFilename}" does not exist or is not a file.`);
  process.exit(1);
}


const registry = JSON.parse(fs.readFileSync(registryFilename, 'utf-8')) as Registry;
const scrapedSession =
  JSON.parse(fs.readFileSync(scrapedSessionFilename, 'utf-8')) as ScrapedSession;


const sessions = generateSessionFiles(inputDir, `${outputDir}/sessions`, registry, scrapedSession);
generatePersonFiles(`${outputDir}/persons`, registry, sessions);
generateFractionFiles(`${outputDir}/fractions`, registry, sessions);
generatePartyFiles(`${outputDir}/parties`, registry, sessions);
generateMetadataFile(`${outputDir}/metadata.json`, registry, sessions);

console.log('Done.');
