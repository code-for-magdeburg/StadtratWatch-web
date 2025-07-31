import { VoteResult, VotingResult } from '@models/Session.ts';
import type { SessionScanVote } from '@models/session-scan.ts';

export enum ApplicationResult {
  ACCEPTED = 'ACCEPTED',
  PARTIALLY_ACCEPTED = 'PARTIALLY_ACCEPTED',
  REJECTED = 'REJECTED',
}

export function getVotingResult(votes: SessionScanVote[]): VotingResult {
  const votedFor = votes.filter(
    (vote) => vote.vote === VoteResult.VOTE_FOR,
  ).length;
  const votedAgainst = votes.filter(
    (vote) => vote.vote === VoteResult.VOTE_AGAINST,
  ).length;
  return votedFor > votedAgainst ? VotingResult.PASSED : VotingResult.REJECTED;
}

export function getVotingId(votings: { votingId: number }[]): number {
  return votings.toSorted((a, b) => a.votingId - b.votingId)[0].votingId;
}

export function getMotionResult(votings: { votingResult: VotingResult }[]): ApplicationResult {
  const passedVotings = votings
    .filter(voting => voting.votingResult === VotingResult.PASSED)
    .length;
  return passedVotings === 0
    ? ApplicationResult.REJECTED
    : passedVotings === votings.length
      ? ApplicationResult.ACCEPTED
      : ApplicationResult.PARTIALLY_ACCEPTED;
}
