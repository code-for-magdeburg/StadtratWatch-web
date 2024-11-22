import * as fs from '@std/fs';
import { Registry } from '../shared/model/registry.ts';
import { checkArgs, parseArgs, printHelpText } from './cli.ts';


const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);


const electoralPeriodDirs = Array
  .from(Deno.readDirSync(args.dataDir))
  .filter(f => Deno.statSync(`${args.dataDir}/${f.name}`).isDirectory)
  .map(d => d.name);

const routes: string[] = [];

routes.push('/'); // because of redirect to current electoral period

for (const electoralPeriodDir of electoralPeriodDirs) {

  const registryFilename = `${args.dataDir}/${electoralPeriodDir}/registry.json`;
  if (!fs.existsSync(registryFilename) || !Deno.statSync(registryFilename).isFile) {
    console.error(`Registry file "${registryFilename}" does not exist.`);
    Deno.exit(1);
  }

  const registry = JSON.parse(Deno.readTextFileSync(registryFilename)) as Registry;

  routes.push(`/ep/${registry.electoralPeriod}`);
  routes.push(`/ep/${registry.electoralPeriod}/parties`);
  routes.push(...registry.parties.map(party => `/ep/${registry.electoralPeriod}/party/${party.id}`));
  routes.push(`/ep/${registry.electoralPeriod}/factions`);
  routes.push(...registry.factions.map(faction => `/ep/${registry.electoralPeriod}/faction/${faction.id}`));
  routes.push(`/ep/${registry.electoralPeriod}/persons`);
  routes.push(...registry.persons.map(person => `/ep/${registry.electoralPeriod}/person/${person.id}`));

  routes.push(`/ep/${registry.electoralPeriod}/sessions`);
  routes.push(...registry.sessions.map(session => `/ep/${registry.electoralPeriod}/session/${session.id}`));
  for (const session of registry.sessions) {
    const sessionScanFilename = `${args.dataDir}/${electoralPeriodDir}/${session.id}/session-scan-${session.id}.json`;
    const sessionScan = JSON.parse(Deno.readTextFileSync(sessionScanFilename)) as Record<symbol, never>[];
    const votingIds = sessionScan.map((_, index: number) => index + 1);
    routes.push(...votingIds.map(votingId => `/ep/${registry.electoralPeriod}/session/${session.id}/voting/${votingId}`));
  }

}

// Workaround ahead!
// Outdated faction and party routes will be added as they have been already indexed by search engines.
// Without this workaround, the netlify server function will raise an error.
routes.push('/ep/7/faction/gruene-future');
routes.push('/ep/7/faction/fdp-tierschutzpartei');
routes.push('/ep/7/faction/spd');
routes.push('/ep/7/faction/afd');
routes.push('/ep/7/faction/die-linke');
routes.push('/ep/7/faction/cdu');
routes.push('/ep/7/faction/gartenpartei-tierschutzallianz');
routes.push('/ep/7/faction/oberbuergermeisterin');

routes.push('/ep/7/party/buendnis-90-die-gruenen');
routes.push('/ep/7/party/future-magdeburg');
routes.push('/ep/7/party/cdu');
routes.push('/ep/7/party/spd');
routes.push('/ep/7/party/afd');
routes.push('/ep/7/party/die-linke');
routes.push('/ep/7/party/gartenpartei');
routes.push('/ep/7/party/tierschutzpartei');
routes.push('/ep/7/party/tierschutzallianz');
routes.push('/ep/7/party/fdp');
routes.push('/ep/7/party/parteilos-01');

Deno.writeTextFileSync(`${args.outputDir}/routes.txt`, routes.join('\n'));

console.log('Done.');
