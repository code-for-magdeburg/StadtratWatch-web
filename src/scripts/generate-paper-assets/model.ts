export type PaperFileDto = {
  id: number;
  name: string;
  url: string;
  size: number | null;
};

export type PaperConsultationDto = {
  meeting: string;
  date: string | null;
  role: string | null;
  organization: string;
  agendaItem: string | null;
  result: string | null;
};

export type PaperVoteDto = {
  personName: string;
  vote: string;
};

export type PaperVotesByFactionDto = {
  factionId: string;
  factionName: string;
  votes: PaperVoteDto[];
};

export type PaperVotingDto = {
  parliamentPeriodId: string;
  sessionId: string;
  votingId: number;
  date: string;
  agendaItem: string;
  motionId: string;
  title: string;
  type: string | null;
  authors: string[];
  accepted: boolean;
  votesByFactions: PaperVotesByFactionDto[];
};

export type PaperDto = {
  id: number;
  reference: string | null;
  type: string | null;
  title: string;
  files: PaperFileDto[];
  consultations: PaperConsultationDto[];
  votings: PaperVotingDto[];
  rootPaperId: number;
};

export type PaperAssetDto = {
  batchNo: string;
  papers: PaperDto[];
};

export type PaperGraphDto = {
  rootPaperId: number;
  papers: PaperDto[];
};

export type PaperGraphAssetDto = {
  batchNo: string;
  paperGraphs: PaperGraphDto[];
};
