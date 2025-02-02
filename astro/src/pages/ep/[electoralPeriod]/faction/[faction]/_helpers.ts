import type { SessionVote } from '../../../../../model/session-scan.ts';
import { VoteResult, VotingResult } from '../../../../../model/Session.ts';

export enum ApplicationResult {
  ACCEPTED = 'ACCEPTED',
  PARTIALLY_ACCEPTED = 'PARTIALLY_ACCEPTED',
  REJECTED = 'REJECTED',
}

export function formatNumber(value: number, digits: number): string {
  return value.toLocaleString(
    'de-DE',
    { minimumFractionDigits: digits, maximumFractionDigits: digits }
  );
}

export function formatPercent(value: number): string {
  return `${(value * 100).toLocaleString(
    'de-DE',
    { minimumFractionDigits: 1, maximumFractionDigits: 1 }
  )}%`;
}

export function formatVotingDate(date: string): string {
  return new Date(date).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function getVotingResult(votes: SessionVote[]): VotingResult {
  const votedFor = votes.filter(vote => vote.vote === VoteResult.VOTE_FOR).length;
  const votedAgainst = votes.filter(vote => vote.vote === VoteResult.VOTE_AGAINST).length;
  return votedFor > votedAgainst ? VotingResult.PASSED : VotingResult.REJECTED;
}

export function getVotingId(votings: { votingId: number }[]): number {
  return votings.toSorted((a, b) => a.votingId - b.votingId)[0].votingId;
}

export function getApplicationResult(votings: { votingResult: VotingResult }[]): ApplicationResult {
  const passedVotings = votings
    .filter(voting => voting.votingResult === VotingResult.PASSED)
    .length;
  return passedVotings === 0
    ? ApplicationResult.REJECTED
    : passedVotings === votings.length
      ? ApplicationResult.ACCEPTED
      : ApplicationResult.PARTIALLY_ACCEPTED;
}
