
export type PartyDto = {
  id: string;
  name: string;
  seats: number;
  votingsSuccessRate: number;
  uniformityScore: number;
  participationRate: number;
  abstentionRate: number;
  statsHistory: PartyStatsHistoryDto;
};


export type PartyStatsHistoryDto = {
  votingsSuccessRate: HistoryValue[];
  uniformityScore: HistoryValue[];
  participationRate: HistoryValue[];
  abstentionRate: HistoryValue[];
};


export type HistoryValue = {
  date: string;
  value: number | null;
};
