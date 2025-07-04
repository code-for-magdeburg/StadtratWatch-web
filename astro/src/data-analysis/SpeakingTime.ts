import type {
  Registry,
  RegistryFaction,
  RegistryParty,
  RegistryPerson,
} from '@models/registry.ts';
import type { SessionInput } from '@models/SessionInput.ts';
import { getPersonsOfSessionAndFaction, getPersonsOfSessionAndParty, isPersonInSession } from '@utils/session-utils.ts';

export function calcSpeakingTimeOfFaction(
  electoralPeriod: Registry,
  faction: RegistryFaction,
  sessions: SessionInput[],
): number {
  return sessions
    .flatMap((session) => {
      const persons = getPersonsOfSessionAndFaction(electoralPeriod, session.session, faction)
        .map((person) => person.name);
      return calcSpeakingTime(persons, session);
    })
    .reduce((acc, duration) => acc + duration, 0);
}

export function calcSpeakingTimeOfParty(
  electoralPeriod: Registry,
  party: RegistryParty,
  sessions: SessionInput[],
): number {
  return sessions
    .flatMap((session) => {
      const persons = getPersonsOfSessionAndParty(electoralPeriod, session.session, party)
        .map((person) => person.name);
      return calcSpeakingTime(persons, session);
    })
    .reduce((acc, duration) => acc + duration, 0);
}

export function calcSpeakingTimeOfPerson(
  person: RegistryPerson,
  sessions: SessionInput[],
): number {
  return sessions
    .filter((session) => isPersonInSession(person, session.session))
    .flatMap((session) => calcSpeakingTime([person.name], session))
    .reduce((acc, duration) => acc + duration, 0);
}

export function calcSpeakingTimeOfSessions(sessions: SessionInput[]): number {
  return sessions
    .map((session) =>
      calcSpeakingTime(
        session.speeches.flatMap((speech) => speech.speaker),
        session,
      ),
    )
    .reduce((acc, duration) => acc + duration, 0);
}

function calcSpeakingTime(persons: string[], session: SessionInput): number {
  return session.speeches
    .filter((speech) => persons.includes(speech.speaker))
    .filter((speech) => !speech.isChairPerson)
    .map((speech) => Math.round(speech.duration / 10) * 10)
    .reduce((acc, duration) => acc + duration, 0);
}
