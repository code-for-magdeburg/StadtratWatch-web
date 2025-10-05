// TODO: Duplicate of astro/src/models/Session.ts - find a way to share this code
export enum VoteResult {
  VOTE_FOR = 'J',
  VOTE_AGAINST = 'N',
  VOTE_ABSTENTION = 'E',
  DID_NOT_VOTE = 'O'
}


export type SessionPersonDto = {
  id: string;
  faction: string;
};


export type SessionDetailsDto = {
  id: string;
  date: string;
  persons: SessionPersonDto[];
  votings: SessionVotingDto[];
};


export type SessionVotingDto = {
  id: number;
  votingSubject: {
    motionId: string;
    title: string;
    type: string;
  },
  votes: Vote[]
};


export type Vote = {
  personId: string;
  vote: VoteResult;
};
