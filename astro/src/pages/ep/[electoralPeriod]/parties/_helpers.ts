import { VotingSuccess } from '../../../../data-analysis/VotingSuccess.ts';
import { UniformityScore } from '../../../../data-analysis/UniformityScore.ts';
import { SpeakingTime } from '../../../../data-analysis/SpeakingTime.ts';
import type { RegistryFaction } from '../../../../model/registry.ts';
import type { SessionInput } from '../../../../model/SessionInput.ts';

export function getPartyVotingSuccessRate(faction: RegistryFaction, sessions: SessionInput[]): number | null {
  const votingSuccess = new VotingSuccess(sessions);
  return votingSuccess.forParty(faction);
}

export function getPartyUniformityScore(faction: RegistryFaction, sessions: SessionInput[]): number | null {
  const uniformityScore = new UniformityScore(sessions);
  return uniformityScore.forParty(faction);
}

export function getPartySpeakingTime(faction: RegistryFaction, sessions: SessionInput[]): number {
  const speakingTime = new SpeakingTime(sessions);
  return speakingTime.forParty(faction);
}

export function formatVotingSuccessRate(votingSuccessRate: number): string {
  return (votingSuccessRate * 100).toLocaleString(
    'de-DE',
    { minimumFractionDigits: 1, maximumFractionDigits: 1 }
  );
}

export function formatUniformityScore(uniformityScore: number): string {
  return uniformityScore.toLocaleString(
    'de-DE',
    { minimumFractionDigits: 3, maximumFractionDigits: 3 }
  );
}

export function formatParticipationRate(participationRate: number): string {
  return (participationRate * 100).toLocaleString(
    'de-DE',
    { minimumFractionDigits: 1, maximumFractionDigits: 1 }
  );
}

export function formatAbstentionRate(abstentionRate: number): string {
  return (abstentionRate * 100).toLocaleString(
    'de-DE',
    { minimumFractionDigits: 1, maximumFractionDigits: 1 }
  );
}

export function formatSpeakingTime(speakingTime: number): string {
  const hours = Math.floor(speakingTime / 3600);
  const minutes = Math.floor((speakingTime % 3600) / 60);
  const seconds = speakingTime % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}
