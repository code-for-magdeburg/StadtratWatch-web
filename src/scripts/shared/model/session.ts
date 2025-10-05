// TODO: Duplicate of astro/src/models/Session.ts - find a way to share this code
export enum VoteResult {
  VOTE_FOR = 'J',
  VOTE_AGAINST = 'N',
  VOTE_ABSTENTION = 'E',
  DID_NOT_VOTE = 'O'
}


// TODO: Duplicate of astro/src/models/Session.ts - find a way to share this code
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


export type SessionDetailsDto = {
  id: string;
  date: string;
  meetingMinutesUrl: string | null;
  youtubeUrl: string;
  factions: SessionFactionDto[];
  parties: SessionPartyDto[];
  persons: SessionPersonDto[];
  votings: SessionVotingDto[];
  speeches: SessionSpeechDto[];
};


export type SessionVotingDto = {
  id: number;
  videoTimestamp: number;
  votingSubject: {
    agendaItem: string;
    motionId: string;
    title: string;
    type: string;
    authors: string[];
    paperId: number | null;
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
  transcription?: string;
};


export type Vote = {
  personId: string;
  vote: VoteResult;
};
