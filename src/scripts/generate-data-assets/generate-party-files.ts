import { PartyDto } from '../../app/model/Party';
import * as fs from 'fs';
import { PARTIES_BASE_DIR } from './constants';
import { Registry } from "./model/registry";


export function generatePartyFiles(registry: Registry) {

  console.log('Writing all-parties.json');
  const parties = registry.parties.map<PartyDto>(party => ({
    id: party.id,
    name: party.name,
    membersCount: party.seats
  }));
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
