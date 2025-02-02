import type { SessionInput } from '../../../../../model/SessionInput.ts';
import type { RegistryParty } from '../../../../../model/registry.ts';
import { UniformityScore } from '../../../../../data-analysis/UniformityScore.ts';
import { VotingSuccess } from '../../../../../data-analysis/VotingSuccess.ts';

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

export function getVotingsSuccessRate(party: RegistryParty, sessionInputs: SessionInput[]): number | null {
  const votingSuccessRate = new VotingSuccess(sessionInputs);
  return votingSuccessRate.forParty(party);
}

export function getVotingsSuccessRateHistory(party: RegistryParty, sessionInputs: SessionInput[]): { x: string, y: number }[] {
  const votingSuccessRate = new VotingSuccess(sessionInputs);
  return votingSuccessRate
    .historyForParty(party)
    .map(({ date, value }) => ({ x: date, y: value }));
}

export function getUniformityScore(party: RegistryParty, sessionInputs: SessionInput[]): number | null {
  const uniformityScore = new UniformityScore(sessionInputs);
  return uniformityScore.forParty(party);
}

export function getUniformityScoreHistory(party: RegistryParty, sessionInputs: SessionInput[]): { x: string, y: number }[] {
  const uniformityScore = new UniformityScore(sessionInputs);
  return uniformityScore
    .historyForParty(party)
    .map(({ date, value }) => ({ x: date, y: value }));
}
