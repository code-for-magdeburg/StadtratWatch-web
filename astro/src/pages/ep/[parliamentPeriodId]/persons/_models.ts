export type PersonListItem = {
  id: string;
  name: string;
  factionId: string;
  faction: string;
  partyId: string;
  party: string;
  participationRate: number | null;
  participationRateDisplay: string;
  votingSuccessRate: number | null;
  votingSuccessRateDisplay: string;
  abstentionRate: number | null;
  abstentionRateDisplay: string;
  speakingTime: number;
  speakingTimeDisplay: string;
};
