export type SessionScan = SessionScanItem[];

export type SessionScanItem = {
  votingFilename: string;
  videoTimestamp: string;
  votingSubject: SessionScanVotingSubject;
  votes: SessionScanVote[];
};

export type SessionScanVotingSubject = {
  agendaItem: string;
  applicationId: string;
  title: string;
  type: string | null; // TODO: remove null?
  authors: string[];
};

export type SessionScanVote = {
  name: string;
  vote: string;
};
