import { Registry } from './model';
import * as fs from 'fs';
import { GENERATED_ASSETS_DIR } from './constants';
import { SessionDetailsDto } from '../../app/model/Session';
import { MetadataDto } from '../../app/model/Metadata';


export function generateMetadataFile(registry: Registry, sessions: SessionDetailsDto[]) {

  const metadata: MetadataDto = {
    lastUpdatedTimestamp: new Date().toISOString(),
    sessionsPeriodFrom: sessions[0]?.date ?? '',
    sessionsPeriodUntil: sessions[sessions.length - 1]?.date ?? '',
    sessionsCount: registry.sessions.length,
    fractionsCount: registry.fractions.length,
    partiesCount: registry.parties.length,
    personsCount: registry.persons.length
  };

  fs.writeFileSync(`${GENERATED_ASSETS_DIR}/metadata.json`, JSON.stringify(metadata, null, 2), `utf-8`);

}
