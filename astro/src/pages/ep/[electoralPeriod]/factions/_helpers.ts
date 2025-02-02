import type { RegistryFaction } from '../../../../model/registry.ts';
import type { SessionInput } from '../../../../model/SessionInput.ts';
import { VotingSuccess } from '../../../../data-analysis/VotingSuccess.ts';
import { UniformityScore } from '../../../../data-analysis/UniformityScore.ts';
import { SpeakingTime } from '../../../../data-analysis/SpeakingTime.ts';

export function getFactionVotingSuccessRate(faction: RegistryFaction, sessions: SessionInput[]): number | null {
  const votingSuccess = new VotingSuccess(sessions);
  return votingSuccess.forFaction(faction);
}

export function getFactionUniformityScore(faction: RegistryFaction, sessions: SessionInput[]): number | null {
  const uniformityScore = new UniformityScore(sessions);
  return uniformityScore.forFaction(faction);
}

export function getFactionSpeakingTime(faction: RegistryFaction, sessions: SessionInput[]): number {
  const speakingTime = new SpeakingTime(sessions);
  return speakingTime.forFaction(faction);
}

export function formatApplicationsSuccessRate(applicationSuccessRate: number): string {
  return (applicationSuccessRate * 100).toLocaleString(
    'de-DE',
    { minimumFractionDigits: 1, maximumFractionDigits: 1 }
  );
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
