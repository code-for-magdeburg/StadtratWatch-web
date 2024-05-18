import * as fs from 'fs';
import { Registry } from '../shared/model/registry';

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

const registry = JSON.parse(fs.readFileSync(registryFilename, 'utf-8')) as Registry;

const routes: string[] = [];
routes.push(...registry.parties.map(party => `/party/${party.id}`));
routes.push(...registry.fractions.map(fraction => `/fraction/${fraction.id}`));
routes.push(...registry.sessions.map(session => `/session/${session.id}`));
routes.push(...registry.persons.map(person => `/person/${person.id}`));

fs.writeFileSync(`${outputDir}/routes.txt`, routes.join('\n'));

console.log('Done.');
