export function formatMotionsSuccessRate(
  motionsSuccessRate: number | null,
): string {
  return formatPercentage(motionsSuccessRate);
}

export function formatVotingSuccessRate(
  votingSuccessRate: number | null,
): string {
  return formatPercentage(votingSuccessRate);
}

export function formatUniformityScore(uniformityScore: number | null): string {
  return formatScore(uniformityScore);
}

export function formatParticipationRate(
  participationRate: number | null,
): string {
  return formatPercentage(participationRate);
}

export function formatAbstentionRate(abstentionRate: number | null): string {
  return formatPercentage(abstentionRate);
}

export function formatPercentage(value: number | null): string {
  return value === null
    ? 'n/a'
    : `${(value * 100).toLocaleString('de-DE', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}%`;
}

export function formatScore(value: number | null): string {
  return value === null
    ? 'n/a'
    : value.toLocaleString('de-DE', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
}

export function formatNumber(value: number): string {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
