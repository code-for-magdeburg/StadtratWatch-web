import type { SessionVote } from '../../../../../model/session-scan.ts';
import { VoteResult, VotingResult } from '../../../../../model/Session.ts';
import { AbstentionRate } from '../../../../../data-analysis/AbstentionRate.ts';
import type { SessionInput } from '../../../../../model/SessionInput.ts';
import type { RegistryFaction } from '../../../../../model/registry.ts';
import { ParticipationRate } from '../../../../../data-analysis/ParticipationRate.ts';
import { UniformityScore } from '../../../../../data-analysis/UniformityScore.ts';
import { VotingSuccess } from '../../../../../data-analysis/VotingSuccess.ts';
import { ApplicationsSuccess } from '../../../../../data-analysis/ApplicationsSuccess.ts';

export enum ApplicationResult {
  ACCEPTED = 'ACCEPTED',
  PARTIALLY_ACCEPTED = 'PARTIALLY_ACCEPTED',
  REJECTED = 'REJECTED',
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

export function formatVotingDate(date: string): string {
  return new Date(date).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function getApplicationSuccessRateHistory(faction: RegistryFaction, sessionInputs: SessionInput[]): { x: string, y: number }[] {
  const applicationSuccessRate = new ApplicationsSuccess(sessionInputs);
  return applicationSuccessRate
    .historyForFaction(faction)
    .map(({ date, value }) => ({ x: date, y: value }));
}

export function getVotingsSuccessRateHistory(faction: RegistryFaction, sessionInputs: SessionInput[]): { x: string, y: number }[] {
  const votingSuccessRate = new VotingSuccess(sessionInputs);
  return votingSuccessRate
    .historyForFaction(faction)
    .map(({ date, value }) => ({ x: date, y: value }));
}

export function getUniformityScoreHistory(faction: RegistryFaction, sessionInputs: SessionInput[]): { x: string, y: number }[] {
  const uniformityScore = new UniformityScore(sessionInputs);
  return uniformityScore
    .historyForFaction(faction)
    .map(({ date, value }) => ({ x: date, y: value }));
}

export function getParticipationRateHistory(faction: RegistryFaction, sessionInputs: SessionInput[]): { x: string, y: number }[] {
  const participationRate = new ParticipationRate(sessionInputs);
  return participationRate
    .historyForFaction(faction)
    .map(({ date, value }) => ({ x: date, y: value }));
}

export function getAbstentionRateHistory(faction: RegistryFaction, sessionInputs: SessionInput[]): { x: string, y: number }[] {
  const abstentionRate = new AbstentionRate(sessionInputs);
  return abstentionRate
    .historyForFaction(faction)
    .map(({ date, value }) => ({ x: date, y: value }));
}
