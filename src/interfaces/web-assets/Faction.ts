import { ApplicationDto } from './Application.ts';


export type FactionDetailsDto = {
  id: string;
  name: string;
  seats: number;
  applicationsSuccessRate: number;
  votingsSuccessRate: number;
  uniformityScore: number;
  participationRate: number;
  abstentionRate: number;
  speakingTime: number;
  statsHistory: StatsHistoryDto;
  applications: ApplicationDto[];
};


export type FactionLightDto = {
  id: string;
  name: string;
  seats: number;
  applicationsSuccessRate: number;
  votingsSuccessRate: number;
  uniformityScore: number;
  participationRate: number;
  abstentionRate: number;
  speakingTime: number;
};


export type StatsHistoryDto = {
  applicationsSuccessRate: HistoryValue[];
  votingsSuccessRate: HistoryValue[];
  uniformityScore: HistoryValue[];
  participationRate: HistoryValue[];
  abstentionRate: HistoryValue[];
};


type HistoryValue = {
  date: string;
  value: number | null;
};
