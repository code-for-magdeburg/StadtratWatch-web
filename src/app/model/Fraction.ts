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
