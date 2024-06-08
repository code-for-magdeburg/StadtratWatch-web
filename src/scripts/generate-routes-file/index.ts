import * as fs from 'fs';
import { Registry } from '../shared/model/registry';


const dataDir = process.argv[2];
const outputDir = process.argv[3];
if (!dataDir || !outputDir) {
  console.error('Usage: node index.js <dataDir> <outputDir>');
  process.exit(1);
}


const electionPeriodDirs = fs.readdirSync(dataDir).filter(f => fs.lstatSync(`${dataDir}/${f}`).isDirectory());

const routes: string[] = [];

routes.push('/'); // because of redirect to current election period

for (const electionPeriodDir of electionPeriodDirs) {

  const registryFilename = `${dataDir}/${electionPeriodDir}/registry.json`;
  if (!fs.existsSync(registryFilename) || !fs.lstatSync(registryFilename).isFile()) {
    console.error(`Registry file "${registryFilename}" does not exist.`);
    process.exit(1);
  }

  const registry = JSON.parse(fs.readFileSync(registryFilename, 'utf-8')) as Registry;

  routes.push(`/ep/${registry.electionPeriod}`);
  routes.push(`/ep/${registry.electionPeriod}/parties`);
  routes.push(...registry.parties.map(party => `/ep/${registry.electionPeriod}/party/${party.id}`));
  routes.push(`/ep/${registry.electionPeriod}/factions`);
  routes.push(...registry.fractions.map(faction => `/ep/${registry.electionPeriod}/faction/${faction.id}`));
  routes.push(`/ep/${registry.electionPeriod}/persons`);
  routes.push(...registry.persons.map(person => `/ep/${registry.electionPeriod}/person/${person.id}`));

  routes.push(`/ep/${registry.electionPeriod}/sessions`);
  routes.push(...registry.sessions.map(session => `/ep/${registry.electionPeriod}/session/${session.id}`));
  for (const session of registry.sessions) {
    const sessionScanFilename = `${dataDir}/${electionPeriodDir}/${session.id}/session-scan-${session.id}.json`;
    const sessionScan = JSON.parse(fs.readFileSync(sessionScanFilename, 'utf-8')) as any[];
    const votingIds = sessionScan.map((_, index: number) => index + 1);
    routes.push(...votingIds.map(votingId => `/ep/${registry.electionPeriod}/session/${session.id}/voting/${votingId}`));
  }

}

fs.writeFileSync(`${outputDir}/routes.txt`, routes.join('\n'));

console.log('Done.');
