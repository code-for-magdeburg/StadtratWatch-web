import { calcVotingMatrix } from './VotingMatrix.ts';
import type { Registry } from '@models/registry.ts';
import type { SessionInput } from '@models/SessionInput.ts';

export type PersonsForcesNode = {
  id: string;
  name: string;
  faction: string;
};

export type PersonsForcesLink = {
  source: string;
  target: string;
  value: number;
};

export type PersonsForces = {
  nodes: PersonsForcesNode[];
  links: PersonsForcesLink[];
};

export function calcPersonsForces(
  parliamentPeriod: Registry,
  sessions: SessionInput[],
): PersonsForces {
  const persons = parliamentPeriod.persons
    .filter((person) => !person.end)
    .map((person) => {
      const faction = parliamentPeriod.factions.find(
        (faction) => faction.id === person.factionId,
      )!.name;
      const votingMatrix = calcVotingMatrix(parliamentPeriod, person, sessions);
      return { ...person, faction, votingMatrix };
    })
    .toSorted((a, b) => a.name.localeCompare(b.name));

  const personPairs = [];
  const personsForces: PersonsForces = {
    nodes: [],
    links: [],
  };

  for (let i = 0; i < persons.length; i++) {
    const person1 = persons[i];
    personsForces.nodes.push({
      id: person1.id,
      name: person1.name,
      faction: person1.faction,
    });
    for (let j = i + 1; j < persons.length; j++) {
      const person2 = persons[j];
      const score = person1.votingMatrix.find(
        (v: any) => v.personId === person2.id,
      )?.comparisonScore!;
      personPairs.push({ person1, person2, score });
      personsForces.links.push({
        source: person1.id,
        target: person2.id,
        value: score,
      });
    }
  }

  return personsForces;
}
