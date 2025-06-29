import type { SessionInput } from '@models/SessionInput.ts';
import type {
  RegistryFaction,
  RegistryParty,
  RegistryPerson,
} from '@models/registry.ts';
import type { SessionScanItem } from '@models/session-scan.ts';
import { VoteResult } from '@models/Session.ts';

export type HistoryDataPoint = {
  date: string;
  value: number;
};

export function calcAbstentionRateOfFaction(
  faction: RegistryFaction,
  sessions: SessionInput[],
): number | null {
  const abstentionRates = sessions
    .flatMap((session) => {
      const persons = session.config.names
        .filter((name) => name.faction === faction.name)
        .map((name) => name.name);
      return session.votings.map((voting) =>
        calcAbstentionRate(persons, voting),
      );
    })
    .filter((rate) => rate !== null)
    .map((rate) => rate!);

  return abstentionRates.length === 0
    ? null
    : abstentionRates.reduce((a, b) => a + b, 0) / abstentionRates.length;
}

export function calcAbstentionRateHistoryOfFaction(
  faction: RegistryFaction,
  sessions: SessionInput[],
): HistoryDataPoint[] {
  return sessions
    .map((session) => {
      const pastSessions = sessions.filter(
        (s) => s.session.date <= session.session.date,
      );
      const value = calcAbstentionRateOfFaction(faction, pastSessions);
      return { date: session.session.date, value };
    })
    .filter(({ value }) => value !== null)
    .map(({ date, value }) => ({ date, value: value! }))
    .toSorted((a, b) => a.date.localeCompare(b.date));
}

export function calcAbstentionRateOfParty(
  party: RegistryParty,
  sessions: SessionInput[],
): number | null {
  const abstentionRates = sessions
    .flatMap((session) => {
      const persons = session.config.names
        .filter((name) => name.party === party.name)
        .map((name) => name.name);
      return session.votings.map((voting) =>
        calcAbstentionRate(persons, voting),
      );
    })
    .filter((rate) => rate !== null)
    .map((rate) => rate!);

  return abstentionRates.length === 0
    ? null
    : abstentionRates.reduce((a, b) => a + b, 0) / abstentionRates.length;
}

export function calcAbstentionRateHistoryOfParty(
  party: RegistryParty,
  sessions: SessionInput[],
): HistoryDataPoint[] {
  return sessions
    .map((session) => {
      const pastSessions = sessions.filter(
        (s) => s.session.date <= session.session.date,
      );
      const value = calcAbstentionRateOfParty(party, pastSessions);
      return { date: session.session.date, value };
    })
    .filter(({ value }) => value !== null)
    .map(({ date, value }) => ({ date, value: value! }))
    .toSorted((a, b) => a.date.localeCompare(b.date));
}

export function calcAbstentionRateOfPerson(
  person: RegistryPerson,
  sessions: SessionInput[],
): number | null {
  const abstentionRates = sessions
    .filter((session) =>
      session.config.names.find((name) => name.name === person.name),
    )
    .flatMap((session) => session.votings)
    .filter((voting) =>
      voting.votes.some(
        (vote) =>
          vote.name === person.name && vote.vote !== VoteResult.DID_NOT_VOTE,
      ),
    )
    .map((voting) => calcAbstentionRate([person.name], voting))
    .filter((rate) => rate !== null)
    .map((rate) => rate!);

  return abstentionRates.length === 0
    ? null
    : abstentionRates.reduce((a, b) => a + b, 0) / abstentionRates.length;
}

export function calcAbstentionRateHistoryOfPerson(
  person: RegistryPerson,
  sessions: SessionInput[],
): HistoryDataPoint[] {
  return sessions
    .map((session) => {
      const pastSessions = sessions.filter(
        (s) => s.session.date <= session.session.date,
      );
      const value = calcAbstentionRateOfPerson(person, pastSessions);
      return { date: session.session.date, value };
    })
    .filter(({ value }) => value !== null)
    .map(({ date, value }) => ({ date, value: value! }))
    .toSorted((a, b) => a.date.localeCompare(b.date));
}

function calcAbstentionRate(
  persons: string[],
  voting: SessionScanItem,
): number | null {
  const allVotes = voting.votes
    .filter((vote) => persons.includes(vote.name))
    .filter((vote) => vote.vote !== VoteResult.DID_NOT_VOTE);
  const abstentions = allVotes.filter(
    (vote) => vote.vote === VoteResult.VOTE_ABSTENTION,
  ).length;
  return allVotes.length === 0 ? null : abstentions / allVotes.length;
}
