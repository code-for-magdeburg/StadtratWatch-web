export type VotingListItem = {
  id: number;
  agendaItem: string;
  applicationId: string;
  title: string;
  type: string | null;
  authors: string[];
  accepted: boolean;
};
