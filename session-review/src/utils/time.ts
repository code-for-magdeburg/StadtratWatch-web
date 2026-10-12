export function secondsToTimestamp(value: number): string {
  const seconds = Math.floor(value);
  const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const remaining = (seconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${remaining}`;
}

export function secondsToDuration(value: number): string {
  const seconds = Math.floor(value);
  const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const remaining = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}m ${remaining}s`;
}

// Parse "HH:MM:SS" → total seconds. Returns null if not 3 parts.
export function timestampToSeconds(timestamp: string): number | null {
  const parts = timestamp.split(':');
  if (parts.length !== 3) return null;
  return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
}