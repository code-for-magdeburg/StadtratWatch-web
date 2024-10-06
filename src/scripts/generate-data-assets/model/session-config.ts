export type SessionConfig = {
  youtubeUrl: string;
  names: SessionConfigPerson[];
};

export type SessionConfigPerson = {
  name: string;
  party: string;
  faction: string;
};
