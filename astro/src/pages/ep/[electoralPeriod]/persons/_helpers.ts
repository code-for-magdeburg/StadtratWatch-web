import type { RegistryPerson } from '../../../../model/registry.ts';
import type { SessionInput } from '../../../../model/SessionInput.ts';
import { VotingSuccess } from '../../../../data-analysis/VotingSuccess.ts';

export function getVotingsSuccessRate(person: RegistryPerson, sessions: SessionInput[]): number {
  const votingSuccess = new VotingSuccess(sessions);
  return votingSuccess.forPerson(person);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toLocaleString(
    'de-DE',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  )}%`;
}

export function formatSpeakingTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const sec = seconds % 60;
  return `${hours}h ${minutes}m ${sec}s`;
}
