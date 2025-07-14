export type FactionListItem = {
  id: string;
  name: string;
  seats: number;
  applicationsSuccessRate: number | null;
  applicationsSuccessRateDisplay: string;
  votingSuccessRate: number | null;
  votingSuccessRateDisplay: string;
  uniformityScore: number | null;
  uniformityScoreDisplay: string;
  participationRate: number | null;
  participationRateDisplay: string;
  abstentionRate: number | null;
  abstentionRateDisplay: string;
  speakingTime: number;
  speakingTimeDisplay: string;
};

export type ChartDataPoint = {
  value: number;
  factionId: string;
  label: string;
};
