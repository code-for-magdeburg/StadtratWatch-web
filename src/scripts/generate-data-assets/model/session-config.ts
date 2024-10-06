export type SessionConfig = {
  electoralPeriod: string;
  youtubeUrl: string;
  names: SessionConfigPerson[];
};

export type SessionConfigPerson = {
  name: string;
  party: string;
  faction: string;
};
