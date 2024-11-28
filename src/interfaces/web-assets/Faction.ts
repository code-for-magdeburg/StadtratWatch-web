import { ApplicationDto } from './Application';
import { HistoryValue } from './HistoryValue';


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
