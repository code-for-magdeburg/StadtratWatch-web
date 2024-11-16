import { SessionDetailsDto, SessionLightDto } from '../../app/model/Session';
import * as fs from 'fs';
import * as path from 'path';
import { PersonDetailsDto, PersonLightDto } from '../../app/model/Person';
import { FactionDetailsDto, FactionLightDto } from '../../app/model/Faction';
import { PartyDto } from '../../app/model/Party';
import { MetadataDto } from '../../app/model/Metadata';
import { GeneratedVotingImage } from './generate-images';


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


  writeSessionFiles(sessions: SessionDetailsDto[]) {

    sessions.forEach(session => {
      console.log(`Writing session file ${session.id}.json`);
      const data = JSON.stringify(session, null, 2);
      fs.writeFileSync(path.join(this.sessionsOutputDir, `${session.id}.json`), data, 'utf-8');
    });

  }


  writeAllSessionsFile(sessions: SessionLightDto[]) {

    console.log('Writing all-sessions.json');
    sessions.sort((a, b) => a.date.localeCompare(b.date));
    fs.writeFileSync(
      path.join(this.sessionsOutputDir, 'all-sessions.json'),
      JSON.stringify(sessions, null, 2),
      'utf-8'
    );

  }


  writePersonFiles(persons: PersonDetailsDto[]) {

    persons.forEach(person => {
      console.log(`Writing person file ${person.id}.json`);
      const data = JSON.stringify(person, null, 2);
      fs.writeFileSync(path.join(this.personsOutputDir, `${person.id}.json`), data, 'utf-8');
    });

  }


  writeAllPersonsFile(persons: PersonLightDto[]) {

    console.log('Writing all-persons.json');
    persons.sort((a, b) => a.name.localeCompare(b.name));
    fs.writeFileSync(
      path.join(this.personsOutputDir, 'all-persons.json'),
      JSON.stringify(persons, null, 2),
      'utf-8'
    );

  }


  writePersonsForcesFile(personsForces: any) {

    console.log('Writing all-persons-forces.json');
    fs.writeFileSync(
      path.join(this.personsOutputDir, 'all-persons-forces.json'),
      JSON.stringify(personsForces, null, 2),
      'utf-8'
    );

  }


  writeFactionFiles(factions: FactionDetailsDto[]) {

    factions.forEach(faction => {
      console.log(`Writing faction file ${faction.id}.json`);
      const data = JSON.stringify(faction, null, 2);
      fs.writeFileSync(path.join(this.factionsOutputDir, `${faction.id}.json`), data, 'utf-8');
    });

  }


  writeAllFactionsFile(factions: FactionLightDto[]) {

    console.log('Writing all-factions.json');
    fs.writeFileSync(
      path.join(this.factionsOutputDir, 'all-factions.json'),
      JSON.stringify(factions, null, 2),
      'utf-8'
    );

  }


  writePartyFiles(parties: PartyDto[]) {

    parties.forEach(party => {
      console.log(`Writing party file ${party.id}.json`);
      const data = JSON.stringify(party, null, 2);
      fs.writeFileSync(path.join(this.partiesOutputDir, `${party.id}.json`), data, 'utf-8');
    });

  }


  writeAllPartiesFile(parties: PartyDto[]) {

    console.log('Writing all-parties.json');
    fs.writeFileSync(
      path.join(this.partiesOutputDir, 'all-parties.json'),
      JSON.stringify(parties, null, 2),
      'utf-8'
    );

  }


  writeMetadataFile(metadata: MetadataDto) {

    console.log('Writing metadata.json');
    fs.writeFileSync(
      path.join(this.outputDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2),
      `utf-8`
    );

  }


  writeVotingImagesFiles(votingImages: GeneratedVotingImage[]) {

    console.log('Writing votings images...');

    votingImages.forEach(votingImage => {

      const { sessionId, votingId, canvas } = votingImage;

      const sessionOutputDir = path.join(this.votingsImagesOutputDir, sessionId);
      this.ensureDirExists(sessionOutputDir);

      const buffer = canvas.toBuffer('image/png');
      const filename = `${sessionId}-${votingId.toString().padStart(3, '0')}.png`;
      fs.writeFileSync(path.join(sessionOutputDir, filename), buffer);

    });

  }


  private ensureOutputDirsExists() {
    this.ensureDirExists(this.outputDir);
    this.ensureDirExists(this.sessionsOutputDir);
    this.ensureDirExists(this.personsOutputDir);
    this.ensureDirExists(this.factionsOutputDir);
    this.ensureDirExists(this.partiesOutputDir);
    this.ensureDirExists(this.votingsImagesOutputDir);
  }


  private ensureDirExists(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }


}
