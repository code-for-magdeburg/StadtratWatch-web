import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { VotesRecognizer } from '../../src/scripts/scan-voting-images/votes-recognizer.ts';
import { VotingImagesSource } from '../../src/scripts/scan-voting-images/voting-images-source.ts';

const [mediaDir, outputFile] = Deno.args;
const votes: Record<string, string> = {};
for (const session of readdirSync(mediaDir).filter((name) => /^\d{4}-\d{2}-\d{2}$/.test(name)).sort()) {
  const configFile = `data/magdeburg-8/${session}/config-${session}.json`;
  if (!existsSync(configFile)) continue;
  const config = JSON.parse(readFileSync(configFile, 'utf8'));
  const recognizer = new VotesRecognizer(new VotingImagesSource(`${mediaDir}/${session}`));
  for (const file of readdirSync(`${mediaDir}/${session}`).filter((name) => name.endsWith('.png')).sort()) {
    for (const vote of recognizer.getVotesForNames(`${mediaDir}/${session}/${file}`, config)) votes[`${file}/${vote.name}`] = vote.vote;
  }
}
writeFileSync(outputFile, JSON.stringify(votes));
console.log('gfx', Object.keys(votes).length, 'votes');
