export type SessionScan = {
  votingFilename: string;
  videoTimestamp: string;
  votingSubject: SessionScanVotingSubject
  votes: SessionVote[];
}[];

export type SessionScanVotingSubject = {
  agendaItem: string;
  applicationId: string;
  title: string;
  type: string;
  authors: string[];
};

export type SessionVote = {
  name: string;
  vote: string;
};
