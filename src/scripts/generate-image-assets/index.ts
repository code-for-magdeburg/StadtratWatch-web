import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { ImageAssetsWriter } from './image-assets-writer.ts';
import { SessionsDataGenerator } from './sessions-data-generator.ts';
import { ImagesGenerator } from './images-generator.ts';
import { InputDataLoaders } from './input-data-loaders.ts';
import type { Voting } from './model.ts';
import { getVotingForFactions } from './helpers.ts';


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
const sessions = sessionsDataGenerator.generateSessionsData(sessionsInputData, registry);


const factionNames = registry.factions
  .toSorted((a, b) => b.seats - a.seats)
  .map(faction => faction.name);

const votings = sessions.flatMap(
  session => session.votings.map<Voting>(sessionVoting => ({
    sessionId: session.id,
    votingId: sessionVoting.id,
    date: session.date,
    motionType: sessionVoting.votingSubject.type,
    motionId: sessionVoting.votingSubject.motionId,
    subjectTitle: sessionVoting.votingSubject.title,
    votes: getVotingForFactions(sessionVoting, factionNames, session.persons)
  }))
);

console.log('Generating images...');
const imagesGenerator = new ImagesGenerator();
const votingImages = imagesGenerator.generateVotingImages(votings);


const assetsWriter = new ImageAssetsWriter(args.outputDir);
assetsWriter.writeImageAssets(votingImages);

console.log('Done.');
