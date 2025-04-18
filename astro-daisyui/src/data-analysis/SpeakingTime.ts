import type {
  RegistryFaction,
  RegistryParty,
  RegistryPerson,
} from '@models/registry.ts';
import type { SessionInput } from '@models/SessionInput.ts';

export function calcSpeakingTimeOfFaction(
  faction: RegistryFaction,
  sessions: SessionInput[],
): number {
  return sessions
    .flatMap((session) => {
      const persons = session.config.names
        .filter((name) => name.faction === faction.name)
        .map((name) => name.name);
      return calcSpeakingTime(persons, session);
    })
    .reduce((acc, duration) => acc + duration, 0);
}

export function calcSpeakingTimeOfParty(
  party: RegistryParty,
  sessions: SessionInput[],
): number {
  return sessions
    .flatMap((session) => {
      const persons = session.config.names
        .filter((name) => name.party === party.name)
        .map((name) => name.name);
      return calcSpeakingTime(persons, session);
    })
    .reduce((acc, duration) => acc + duration, 0);
}

export function calcSpeakingTimeOfPerson(
  person: RegistryPerson,
  sessions: SessionInput[],
): number {
  return sessions
    .filter((session) =>
      session.config.names.some((name) => name.name === person.name),
    )
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
