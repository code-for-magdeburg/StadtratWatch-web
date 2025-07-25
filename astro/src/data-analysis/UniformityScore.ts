import type { Registry, RegistryFaction, RegistryParty } from '@models/registry.ts';
import type { SessionInput } from '@models/SessionInput.ts';
import type { SessionScanItem } from '@models/session-scan.ts';
import { VoteResult } from '@models/Session.ts';
import { getPersonsOfSessionAndFaction, getPersonsOfSessionAndParty } from '@utils/session-utils.ts';

export type HistoryDataPoint = {
  date: string;
  value: number;
};

export function calcUniformityScoreOfFaction(
  parliamentPeriod: Registry,
  faction: RegistryFaction,
  sessions: SessionInput[],
): number | null {
  const uniformityScores = sessions
    .flatMap((session) => {
      const persons = getPersonsOfSessionAndFaction(parliamentPeriod, session.session, faction)
        .map((person) => person.name);
      return session.votings.map((voting) => calcUniformityScore(persons, voting));
    })
    .filter((score) => score !== null)
    .map((score) => score!);

  return uniformityScores.length === 0
    ? null
    : uniformityScores.reduce((a, b) => a + b, 0) / uniformityScores.length;
}

export function calcUniformityScoreHistoryOfFaction(
  parliamentPeriod: Registry,
  faction: RegistryFaction,
  sessions: SessionInput[],
): HistoryDataPoint[] {
  return sessions
    .map((session) => {
      const pastSessions = sessions.filter(
        (s) => s.session.date <= session.session.date,
      );
      const value = calcUniformityScoreOfFaction(parliamentPeriod, faction, pastSessions);
      return { date: session.session.date, value };
    })
    .filter(({ value }) => value !== null)
    .map(({ date, value }) => ({ date, value: value! }))
    .toSorted((a, b) => a.date.localeCompare(b.date));
}

export function calcUniformityScoreOfParty(
  parliamentPeriod: Registry,
  party: RegistryParty,
  sessions: SessionInput[],
): number | null {
  const uniformityScores = sessions
    .flatMap((session) => {
      const persons = getPersonsOfSessionAndParty(parliamentPeriod, session.session, party)
        .map((person) => person.name);
      return session.votings.map((voting) => calcUniformityScore(persons, voting));
    })
    .filter((score) => score !== null)
    .map((score) => score!);

  return uniformityScores.length === 0
    ? null
    : uniformityScores.reduce((a, b) => a + b, 0) / uniformityScores.length;
}

export function calcUniformityScoreHistoryOfParty(
  parliamentPeriod: Registry,
  party: RegistryParty,
  sessions: SessionInput[],
): HistoryDataPoint[] {
  return sessions
    .map((session) => {
      const pastSessions = sessions.filter(
        (s) => s.session.date <= session.session.date,
      );
      const value = calcUniformityScoreOfParty(parliamentPeriod, party, pastSessions);
      return { date: session.session.date, value };
    })
    .filter(({ value }) => value !== null)
    .map(({ date, value }) => ({ date, value: value! }))
    .toSorted((a, b) => a.date.localeCompare(b.date));
}

function calcUniformityScore(
  persons: string[],
  voting: SessionScanItem,
): number | null {
  const votesFor = voting.votes
    .filter((vote) => persons.includes(vote.name))
    .filter((vote) => vote.vote === VoteResult.VOTE_FOR).length;
  const votesAgainst = voting.votes
    .filter((vote) => persons.includes(vote.name))
    .filter((vote) => vote.vote === VoteResult.VOTE_AGAINST).length;
  const votesAbstained = voting.votes
    .filter((vote) => persons.includes(vote.name))
    .filter((vote) => vote.vote === VoteResult.VOTE_ABSTENTION).length;

  const totalVotes = votesFor + votesAgainst + votesAbstained;
  if (totalVotes === 0) {
    return null;
  }

  const max1 = Math.max(votesFor, votesAgainst, votesAbstained);
  const max2 =
    votesFor === max1
      ? Math.max(votesAgainst, votesAbstained)
      : votesAgainst === max1
        ? Math.max(votesFor, votesAbstained)
        : Math.max(votesFor, votesAgainst);

  return (max1 - max2 + Math.min(votesAbstained, max2)) / totalVotes;
}
