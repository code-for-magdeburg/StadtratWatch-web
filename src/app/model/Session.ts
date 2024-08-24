export enum VoteResult {
  VOTE_FOR = 'J',
  VOTE_AGAINST = 'N',
  VOTE_ABSTENTION = 'E',
  DID_NOT_VOTE = 'O'
}

export enum VotingResult {
  PASSED = 'PASSED',
  REJECTED = 'REJECTED'
}

export type SessionFactionDto = {
  id: string;
  name: string;
};

export type SessionPartyDto = {
  id: string;
  name: string;
};

export type SessionPersonDto = {
  id: string;
  name: string;
  party: string;
  faction: string;
};

export type VotingDocumentsDto = {
  paperId: number | null;
};

export type Vote = {
  personId: string;
  vote: VoteResult;
};

export type SessionVotingDto = {
  id: number;
  videoTimestamp: string;
  votingSubject: {
    agendaItem: string;
    applicationId: string;
    title: string;
    type: string;
    authors: string[];
    documents: VotingDocumentsDto;
  },
  votes: Vote[]
  votingResult: VotingResult
};


export type SessionSpeechDto = {
  speaker: string;
  start: number;
  duration: number;
  faction?: string;
  onBehalfOf?: string;
};


export type SessionDetailsDto = {
  id: string;
  date: string;
  meetingMinutesUrl: string;
  youtubeUrl: string;
  factions: SessionFactionDto[];
  parties: SessionPartyDto[];
  persons: SessionPersonDto[];
  votings: SessionVotingDto[];
  speeches: SessionSpeechDto[];
};


export type SessionLightDto = {
  id: string;
  date: string;
  votingsCount: number;
  speechesCount: number;
  totalSpeakingTime: number;
};
