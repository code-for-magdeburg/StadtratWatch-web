export type PartyListItem = {
  id: string;
  name: string;
  seats: number;
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
  partyId: string;
  label: string;
};
