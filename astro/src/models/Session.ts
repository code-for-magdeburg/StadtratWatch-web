export enum VoteResult {
  VOTE_FOR = 'J',
  VOTE_AGAINST = 'N',
  VOTE_ABSTENTION = 'E',
  DID_NOT_VOTE = 'O',
}

export type Vote = {
  personId: string;
  vote: VoteResult;
};

export enum VotingResult {
  PASSED = 'PASSED',
  REJECTED = 'REJECTED',
}
