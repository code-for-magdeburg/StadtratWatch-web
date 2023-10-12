import { PartyDto } from '../../app/model/Party';
import * as fs from 'fs';
import { Registry } from './model';
import { PARTIES_BASE_DIR } from './constants';


export function generatePartyFiles(registry: Registry) {

  console.log('Writing all-parties.json');
  const parties = registry.parties.map<PartyDto>(party => {
    const membersCount = registry.persons.filter(person => person.partyId === party.id).length;
    return {
      id: party.id,
      name: party.name,
      membersCount
    };
  });
  fs.writeFileSync(
    `${PARTIES_BASE_DIR}/all-parties.json`,
    JSON.stringify(parties, null, 2),
    'utf-8'
  );

  parties.forEach(party => {
    console.log(`Writing party file ${party.id}.json`);
    const data = JSON.stringify(party, null, 2);
    fs.writeFileSync(`${PARTIES_BASE_DIR}/${party.id}.json`, data, 'utf-8');
  });

}
