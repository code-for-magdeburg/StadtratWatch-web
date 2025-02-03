export function formatPercent(value: number): string {
  return `${(value * 100).toLocaleString(
    'de-DE',
    { minimumFractionDigits: 1, maximumFractionDigits: 1 }
  )}%`;
}

export function formatComparisonScore(value: number): string {
  return (value * 100).toLocaleString(
    'de-DE',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  );
}
