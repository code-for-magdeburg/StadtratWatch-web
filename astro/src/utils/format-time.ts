export function formatSpeakingTime(
  speakingTime: number,
  showZeroHours = true,
  showSeconds = true,
): string {
  const hours = Math.floor(speakingTime / 3600);
  const minutes = Math.floor((speakingTime % 3600) / 60);
  const seconds = speakingTime % 60;

  if (showSeconds) {
    return hours > 0 || showZeroHours
      ? `${hours}h ${minutes}m ${seconds}s`
      : `${minutes}m ${seconds}s`;
  }

  return hours > 0 || showZeroHours ? `${hours}h ${minutes}m` : `${minutes}m`;
}
