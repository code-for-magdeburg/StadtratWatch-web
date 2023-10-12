import { FractionDto } from '../../app/model/Fraction';
import * as fs from 'fs';
import { Registry } from './model';
import { FRACTIONS_BASE_DIR } from './constants';


export function generateFractionFiles(registry: Registry) {

  console.log('Writing all-fractions.json');
  const fractions = registry.fractions.map<FractionDto>(fraction => {
    const membersCount = registry.persons
      .filter(person => person.fractionId === fraction.id)
      .length;
    return {
      id: fraction.id,
      name: fraction.name,
      membersCount
    };
  });
  fs.writeFileSync(
    `${FRACTIONS_BASE_DIR}/all-fractions.json`,
    JSON.stringify(fractions, null, 2),
    'utf-8'
  );

  fractions.forEach(fraction => {
    console.log(`Writing fraction file ${fraction.id}.json`);
    const data = JSON.stringify(fraction, null, 2);
    fs.writeFileSync(`${FRACTIONS_BASE_DIR}/${fraction.id}.json`, data, 'utf-8');
  });

}
