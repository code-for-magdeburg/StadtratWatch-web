import * as fs from '@std/fs';
import * as path from '@std/path';
import { PartyDto, MetadataDto, PersonDetailsDto, PersonLightDto, PersonsForcesDto, SessionDetailsDto, SessionLightDto, FactionDetailsDto, FactionLightDto } from '@scope/interfaces-web-assets';
import { decodeBase64 } from '@std/encoding';
import { GeneratedSessionsData } from './sessions-data-generator.ts';
import { GeneratedPersonsData } from './persons-data-generator.ts';
import { GeneratedFactionsData } from "./factions-data-generator.ts";
import { GeneratedPartiesData } from './parties-data-generator.ts';
import { GeneratedImages, GeneratedVotingImage } from './images-generator.ts';


export class AssetsWriter {


  private readonly sessionsOutputDir: string;
  private readonly personsOutputDir: string;
  private readonly factionsOutputDir: string;
  private readonly partiesOutputDir: string;
  private readonly votingsImagesOutputDir: string;


  constructor(private readonly outputDir: string) {
    this.sessionsOutputDir = path.join(outputDir, 'sessions');
    this.personsOutputDir = path.join(outputDir, 'persons');
    this.factionsOutputDir = path.join(outputDir, 'factions');
    this.partiesOutputDir = path.join(outputDir, 'parties');
    this.votingsImagesOutputDir = path.join(this.outputDir, 'images', 'votings');
    this.ensureOutputDirsExists();
  }


  public writeAssetsData(sessionsData: GeneratedSessionsData, personsData: GeneratedPersonsData,
                         factionsData: GeneratedFactionsData, partiesData: GeneratedPartiesData,
                         metadata: MetadataDto, images: GeneratedImages) {

    this.writeSessionFiles(sessionsData.sessions);
    this.writeAllSessionsFile(sessionsData.sessionsLight);
    this.writePersonFiles(personsData.persons);
    this.writeAllPersonsFile(personsData.personsLight);
    this.writePersonsForcesFile(personsData.personsForces);
    this.writeFactionFiles(factionsData.factions);
    this.writeAllFactionsFile(factionsData.factionsLight);
    this.writePartyFiles(partiesData.parties);
    this.writeAllPartiesFile(partiesData.parties);
    this.writeMetadataFile(metadata);
    this.writeVotingImagesFiles(images.votingImages);
  }


  private writeSessionFiles(sessions: SessionDetailsDto[]) {

    sessions.forEach(session => {
      console.log(`Writing session file ${session.id}.json`);
      const data = JSON.stringify(session, null, 2);
      Deno.writeTextFileSync(path.join(this.sessionsOutputDir, `${session.id}.json`), data);
    });

  }


  private writeAllSessionsFile(sessions: SessionLightDto[]) {

    console.log('Writing all-sessions.json');
    sessions.sort((a, b) => a.date.localeCompare(b.date));
    Deno.writeTextFileSync(
      path.join(this.sessionsOutputDir, 'all-sessions.json'),
      JSON.stringify(sessions, null, 2)
    );

  }


  private writePersonFiles(persons: PersonDetailsDto[]) {

    persons.forEach(person => {
      console.log(`Writing person file ${person.id}.json`);
      const data = JSON.stringify(person, null, 2);
      Deno.writeTextFileSync(path.join(this.personsOutputDir, `${person.id}.json`), data);
    });

  }


  private writeAllPersonsFile(persons: PersonLightDto[]) {

    console.log('Writing all-persons.json');
    persons.sort((a, b) => a.name.localeCompare(b.name));
    Deno.writeTextFileSync(
      path.join(this.personsOutputDir, 'all-persons.json'),
      JSON.stringify(persons, null, 2)
    );

  }


  private writePersonsForcesFile(personsForces: PersonsForcesDto) {

    console.log('Writing all-persons-forces.json');
    Deno.writeTextFileSync(
      path.join(this.personsOutputDir, 'all-persons-forces.json'),
      JSON.stringify(personsForces, null, 2)
    );

  }


  private writeFactionFiles(factions: FactionDetailsDto[]) {

    factions.forEach(faction => {
      console.log(`Writing faction file ${faction.id}.json`);
      const data = JSON.stringify(faction, null, 2);
      Deno.writeTextFileSync(path.join(this.factionsOutputDir, `${faction.id}.json`), data);
    });

  }


  private writeAllFactionsFile(factions: FactionLightDto[]) {

    console.log('Writing all-factions.json');
    Deno.writeTextFileSync(
      path.join(this.factionsOutputDir, 'all-factions.json'),
      JSON.stringify(factions, null, 2)
    );

  }


  private writePartyFiles(parties: PartyDto[]) {

    parties.forEach(party => {
      console.log(`Writing party file ${party.id}.json`);
      const data = JSON.stringify(party, null, 2);
      Deno.writeTextFileSync(path.join(this.partiesOutputDir, `${party.id}.json`), data);
    });

  }


  private writeAllPartiesFile(parties: PartyDto[]) {

    console.log('Writing all-parties.json');
    Deno.writeTextFileSync(
      path.join(this.partiesOutputDir, 'all-parties.json'),
      JSON.stringify(parties, null, 2)
    );

  }


  private writeMetadataFile(metadata: MetadataDto) {

    console.log('Writing metadata.json');
    Deno.writeTextFileSync(
      path.join(this.outputDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

  }


  private writeVotingImagesFiles(votingImages: GeneratedVotingImage[]) {

    console.log('Writing votings images...');

    votingImages.forEach(votingImage => {

      const { sessionId, votingId, canvas } = votingImage;

      const sessionOutputDir = path.join(this.votingsImagesOutputDir, sessionId);
      fs.ensureDirSync(sessionOutputDir);

      const imageBase64Encoded = canvas.toDataURL().replace(/^data:image\/png;base64,/, '');
      const image = decodeBase64(imageBase64Encoded);
      const filename = `${sessionId}-${votingId.toString().padStart(3, '0')}.png`;
      Deno.writeFileSync(path.join(sessionOutputDir, filename), image);

    });

  }


  private ensureOutputDirsExists() {
    fs.ensureDirSync(this.outputDir);
    fs.ensureDirSync(this.sessionsOutputDir);
    fs.ensureDirSync(this.personsOutputDir);
    fs.ensureDirSync(this.factionsOutputDir);
    fs.ensureDirSync(this.partiesOutputDir);
    fs.ensureDirSync(this.votingsImagesOutputDir);
  }


}
