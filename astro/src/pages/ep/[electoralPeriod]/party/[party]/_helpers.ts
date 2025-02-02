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
