import type { Registry, RegistryFaction, RegistryParty, RegistryPerson, RegistrySession } from '@models/registry.ts';

function getPersonsOfSession(electoralPeriod: Registry, session: RegistrySession): RegistryPerson[] {
  return electoralPeriod.persons.filter(person => isPersonInSession(person, session))
}

export function getPersonsOfSessionAndParty(electoralPeriod: Registry, session: RegistrySession,
                                            party: RegistryParty): RegistryPerson[] {
  return getPersonsOfSession(electoralPeriod, session).filter(person => person.partyId === party.id);
}

export function getPersonsOfSessionAndFaction(electoralPeriod: Registry, session: RegistrySession,
                                              faction: RegistryFaction): RegistryPerson[] {
  return getPersonsOfSession(electoralPeriod, session).filter(person => person.factionId === faction.id);
}

export function isPersonInSession (person: RegistryPerson, session: RegistrySession): boolean {
  const sessionDate = session.date;
  return (person.start === null || person.start <= sessionDate) && (person.end === null || person.end >= sessionDate);
}

export function getPersonByName(electoralPeriod: Registry, session: RegistrySession,
                                personName: string): RegistryPerson | null {
  return getPersonsOfSession(electoralPeriod, session).find(person => person.name === personName) || null;
}

export function getFactionOfPerson(electoralPeriod: Registry, session: RegistrySession,
                                   person: RegistryPerson): RegistryFaction | null {
  return electoralPeriod.factions.find(
    faction => faction.id === person.factionId && isPersonInSession(person, session)
  ) || null;
}
