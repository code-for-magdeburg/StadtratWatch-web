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

export type SessionFractionDto = {
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
  fraction: string;
};

export type VotingDocumentsDto = {
  applicationUrl: string | null;
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


export type SegmentDto = {
  start: number;
  duration: number;
};


export type SpeakingTimeDto = {
  speaker: string;
  segments: SegmentDto[];
};


export type SpeechDto = {
  speaker: string;
  start: number;
  duration: number;
};


export type SessionDetailsDto = {
  id: string;
  date: string;
  meetingMinutesUrl: string;
  youtubeUrl: string;
  fractions: SessionFractionDto[];
  parties: SessionPartyDto[];
  persons: SessionPersonDto[];
  votings: SessionVotingDto[];
  speakingTimes: SpeakingTimeDto[];
  speeches: SpeechDto[];
};


export type SessionLightDto = {
  id: string;
  date: string;
  votingsCount: number;
};
