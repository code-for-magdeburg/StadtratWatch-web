export type VotesByFaction = {
  factionId: string;
  factionName: string;
  orderIndex: number;
  votes: { personName: string, vote: string }[];
};

export type VotingListItem = {
  id: number;
  agendaItem: string;
  applicationId: string;
  title: string;
  type: string | null;
  authors: string[];
  votesByFactions: VotesByFaction[];
  accepted: boolean;
};
