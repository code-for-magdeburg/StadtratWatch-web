import { VoteResult } from './Session';


export type PersonDetailsDto = {
  id: string;
  name: string;
  fractionId: string;
  fraction: string;
  partyId: string;
  party: string;
  votes: PersonVoteDto[]
  votingAttendance: number;
  votingSuccessCount: number;
  votingSuccessRate: number;
  abstentionCount: number;
  abstentionRate: number;
};


export type PersonVoteDto = {
  sessionId: string;
  votingId: number;
  vote: VoteResult;
};


export type PersonLightDto = {
  id: string;
  name: string;
  fractionId: string;
  fraction: string;
  partyId: string;
  party: string;
  votingAttendance: number;
  votingSuccessRate: number;
  abstentionRate: number;
};
