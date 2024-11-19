import { generatePersonsData } from './generate-persons-data.ts';
import { generateSessionsData } from './generate-sessions-data.ts';
import { generateFactionsData } from './generate-factions-data.ts';
import { generatePartiesData } from './generate-parties-data.ts';
import { generateMetadata } from './generate-metadata.ts';
import { GeneratedVotingImage, generateImages } from './generate-images.ts';
import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { loadRegistry, loadScrapedSession, loadSessionsInputData } from './input-data-loaders.ts';
import { AssetsWriter } from './assets-writer.ts';
import { SessionDetailsDto, SessionLightDto } from '@scope/interfaces-web-assets';
import { PersonDetailsDto, PersonLightDto, PersonsForcesDto } from '@scope/interfaces-web-assets';
import { FactionDetailsDto, FactionLightDto } from '@scope/interfaces-web-assets';
import { PartyDto } from '@scope/interfaces-web-assets';
import { MetadataDto } from '@scope/interfaces-web-assets';


const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);


const registry = loadRegistry(args.inputDir);
const scrapedSession = loadScrapedSession(args.scrapedSessionFilename);
const sessionsInputData = loadSessionsInputData(args.inputDir, registry);

const { sessions, sessionsLight } = generateSessionsData(sessionsInputData, registry, scrapedSession);
const { persons, personsLight, personsForces } = generatePersonsData(registry, sessions);
const { factions, factionsLight } = generateFactionsData(registry, sessions);
const { parties } = generatePartiesData(registry, sessions);
const metadata = generateMetadata(registry, sessions);
const { votingImages } = generateImages(registry, sessions);

writeSessionFiles(sessions, sessionsLight);
writePersonFiles(persons, personsLight, personsForces);
writeFactionFiles(factions, factionsLight);
writePartyFiles(parties);
writeMetadataFile(metadata);
writeVotingImagesFiles(votingImages);

console.log('Done.');


function writeSessionFiles(sessionsDetails: SessionDetailsDto[], sessionsLight: SessionLightDto[]) {
  const assetsWriter = new AssetsWriter(args.outputDir);
  assetsWriter.writeSessionFiles(sessionsDetails);
  assetsWriter.writeAllSessionsFile(sessionsLight);
}


function writePersonFiles(persons: PersonDetailsDto[], personsLight: PersonLightDto[],
                          personsForces: PersonsForcesDto) {
  const assetsWriter = new AssetsWriter(args.outputDir);
  assetsWriter.writePersonFiles(persons);
  assetsWriter.writeAllPersonsFile(personsLight);
  assetsWriter.writePersonsForcesFile(personsForces);
}


function writeFactionFiles(factions: FactionDetailsDto[], factionsLight: FactionLightDto[]) {
  const assetsWriter = new AssetsWriter(args.outputDir);
  assetsWriter.writeFactionFiles(factions);
  assetsWriter.writeAllFactionsFile(factionsLight);
}


function writePartyFiles(parties: PartyDto[]) {
  const assetsWriter = new AssetsWriter(args.outputDir);
  assetsWriter.writePartyFiles(parties);
  assetsWriter.writeAllPartiesFile(parties);
}


function writeMetadataFile(metadata: MetadataDto) {
  const assetsWriter = new AssetsWriter(args.outputDir);
  assetsWriter.writeMetadataFile(metadata);
}


function writeVotingImagesFiles(votingImages: GeneratedVotingImage[]) {
  const assetsWriter = new AssetsWriter(args.outputDir);
  assetsWriter.writeVotingImagesFiles(votingImages);
}
