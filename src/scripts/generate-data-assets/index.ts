import { generatePersonsData } from './generate-persons-data';
import { generateSessionsData } from './generate-sessions-data';
import { generateFactionsData } from './generate-factions-data';
import { generatePartiesData } from './generate-parties-data';
import { generateMetadata } from './generate-metadata';
import { GeneratedVotingImage, generateImages } from './generate-images';
import { checkArgs, parseArgs } from './cli';
import { loadRegistry, loadScrapedSession, loadSessionsInputData } from './input-data-loaders';
import { AssetsWriter } from './assets-writer';
import { SessionDetailsDto, SessionLightDto } from '../../app/model/Session';
import { PersonDetailsDto, PersonLightDto, PersonsForcesDto } from '../../app/model/Person';
import { FactionDetailsDto, FactionLightDto } from '../../app/model/Faction';
import { PartyDto } from '../../app/model/Party';
import { MetadataDto } from '../../app/model/Metadata';


const args = parseArgs(process.argv);

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
