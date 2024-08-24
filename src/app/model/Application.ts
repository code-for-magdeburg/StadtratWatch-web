import { VotingResult } from './Session';


export type ApplicationDto = {
  applicationId: string;
  title: string;
  type: string;
  sessionId: string;
  sessionDate: string;
  paperId: number | null;
  votings: ApplicationVotingDto[];
};


export type ApplicationVotingDto = {
  votingId: number;
  votingResult: VotingResult;
};
