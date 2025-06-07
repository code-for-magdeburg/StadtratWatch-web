export type SessionScan = SessionScanItem[];

export type SessionScanItem = {
  votingFilename: string;
  videoTimestamp: string;
  votingSubject: SessionScanVotingSubject;
  votes: SessionVote[];
};

export type SessionScanVotingSubject = {
  agendaItem: string;
  applicationId: string;
  title: string;
  type: string | null; // TODO: remove null?
  authors: string[];
};

export type SessionVote = {
  name: string;
  vote: string;
};
