export type SessionScan = SessionScanItem[];

export type SessionScanItem = {
  votingFilename: string;
  videoTimestamp: string;
  votingSubject: SessionScanVotingSubject
  votes: SessionVote[];
  confirmations: {
    videoTimestamp: boolean;
    agendaItem: boolean;
    applicationId: boolean;
    title: boolean;
    votes: boolean;
    context: boolean;
  };
};

export type SessionScanVotingSubject = {
  agendaItem: string;
  applicationId: string;
  title: string;
  type: string | null;
  authors: string[];
};

export type SessionVote = {
  name: string;
  vote: string;
};
