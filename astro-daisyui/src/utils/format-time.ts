export type FormatSpeakingTimeOptions = {
  showZeroHours?: boolean;
};

export function formatSpeakingTime(
  speakingTime: number,
  options: FormatSpeakingTimeOptions = { showZeroHours: true },
): string {
  const hours = Math.floor(speakingTime / 3600);
  const minutes = Math.floor((speakingTime % 3600) / 60);
  const seconds = speakingTime % 60;

  return hours > 0 || options?.showZeroHours
    ? `${hours}h ${minutes}m ${seconds}s`
    : `${minutes}m ${seconds}s`;
}
