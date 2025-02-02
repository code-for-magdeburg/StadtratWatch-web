import { VoteResult } from './Session';
import { HistoryValue } from './HistoryValue';


export type PersonDetailsDto = {
  id: string;
  name: string;
  factionId: string;
  faction: string;
  partyId: string;
  party: string;
  councilorUntil: string | null;
  votes: PersonVoteDto[];
  votingMatrix: PersonVotingComparison[];
  votingAttendance: number;
  votingSuccessCount: number;
  votingSuccessRate: number;
  abstentionCount: number;
  abstentionRate: number;
  statsHistory: PersonStatsHistoryDto;
  speeches: PersonSpeechDto[];
};


export type PersonVoteDto = {
  sessionId: string;
  votingId: number;
  vote: VoteResult;
};


export type PersonVotingComparison = {
  personId: string;
  personName: string;
  faction: string;
  party: string;
  comparisonScore: number;
};


export type PersonStatsHistoryDto = {
  votingAttendance: HistoryValue[];
  votingSuccessRate: HistoryValue[];
  abstentionRate: HistoryValue[];
};


export type PersonSpeechDto = {
  sessionId: string;
  sessionDate: string;
  youtubeUrl: string;
  start: number;
  duration: number;
  onBehalfOf?: string;
};


export type PersonLightDto = {
  id: string;
  name: string;
  factionId: string;
  faction: string;
  partyId: string;
  party: string;
  councilorUntil: string | null;
  votingAttendance: number;
  votingSuccessRate: number;
  abstentionRate: number;
  speakingTime: number;
};


export type PersonsForcesDto = {
  nodes: Array<{ id: string; name: string; faction: string }>;
  links: Array<{ source: string; target: string; value: number }>;
};
