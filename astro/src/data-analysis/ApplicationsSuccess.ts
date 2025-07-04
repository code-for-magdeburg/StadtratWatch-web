import type { SessionInput } from '@models/SessionInput.ts';
import type { RegistryFaction } from '@models/registry.ts';
import { VoteResult, VotingResult } from '@models/Session.ts';
import type { SessionScanVote } from '@models/session-scan.ts';

export type HistoryDataPoint = {
  date: string;
  value: number;
};

export function calcApplicationsSuccessRateOfFaction(
  faction: RegistryFaction,
  sessions: SessionInput[],
): number | null {
  const applications = sessions
    .flatMap((session) => session.votings)
    .filter((voting) => voting.votingSubject.authors.includes(faction.name));

  const applicationsPassed = applications.filter(
    (voting) => getVotingResult(voting.votes) === VotingResult.PASSED,
  );

  return applications.length === 0
    ? null
    : applicationsPassed.length / applications.length;
}

export function calcApplicationsSuccessRateHistoryOfFaction(
  faction: RegistryFaction,
  sessions: SessionInput[],
): HistoryDataPoint[] {
  return sessions
    .map((session) => {
      const pastSessions = sessions.filter(
        (s) => s.session.date <= session.session.date,
      );
      const value = calcApplicationsSuccessRateOfFaction(faction, pastSessions);
      return { date: session.session.date, value };
    })
    .filter(({ value }) => value !== null)
    .map(({ date, value }) => ({ date, value: value! }))
    .toSorted((a, b) => a.date.localeCompare(b.date));
}

function getVotingResult(votes: SessionScanVote[]): VotingResult {
  const votedFor = votes.filter(
    (vote) => vote.vote === VoteResult.VOTE_FOR,
  ).length;
  const votedAgainst = votes.filter(
    (vote) => vote.vote === VoteResult.VOTE_AGAINST,
  ).length;
  return votedFor > votedAgainst ? VotingResult.PASSED : VotingResult.REJECTED;
}
