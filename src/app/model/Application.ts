import { VotingResult } from './Session';


export type ApplicationDto = {
  applicationId: string;
  title: string;
  type: string;
  sessionId: string;
  sessionDate: string;
  applicationUrl: string | null;
  votings: ApplicationVotingDto[];
};


export type ApplicationVotingDto = {
  votingId: number;
  votingResult: VotingResult;
};
