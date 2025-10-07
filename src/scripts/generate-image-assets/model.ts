
export type Voting = {
  sessionId: string;
  votingId: number;
  date: string;
  motionType: string;
  motionId: string;
  subjectTitle: string;
  votes: VotingPerFaction[]
};


export type VotingPerFaction = {
  faction: string;
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  notVoted: number;
};
