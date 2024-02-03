import { ApplicationDto } from './Application';


export type FractionDetailsDto = {
  id: string;
  name: string;
  seats: number;
  applicationsSuccessRate: number;
  votingsSuccessRate: number;
  uniformityScore: number;
  participationRate: number;
  abstentionRate: number;
  statsHistory: StatsHistoryDto;
  applications: ApplicationDto[];
};


export type FractionLightDto = {
  id: string;
  name: string;
  seats: number;
  applicationsSuccessRate: number;
  votingsSuccessRate: number;
  uniformityScore: number;
  participationRate: number;
  abstentionRate: number;
};


export type StatsHistoryDto = {
  applicationsSuccessRate: HistoryValue[];
  votingsSuccessRate: HistoryValue[];
  uniformityScore: HistoryValue[];
  participationRate: HistoryValue[];
  abstentionRate: HistoryValue[];
};


export type HistoryValue = {
  date: string;
  value: number;
};
