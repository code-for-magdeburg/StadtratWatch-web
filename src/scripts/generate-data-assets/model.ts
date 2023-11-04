export type Registry = {
  sessions: RegistrySession[];
  fractions: RegistryFraction[];
  parties: RegistryParty[];
  persons: RegistryPerson[];
};

export type RegistrySession = {
  id: string;
  date: string;
  linkInvitation: string | null;
  linkMinutes: string | null;
};

export type RegistryFraction = {
  id: string;
  name: string;
};

export type RegistryParty = {
  id: string;
  name: string;
};

export type RegistryPerson = {
  id: string;
  name: string;
  fractionId: string;
  partyId: string;
};

export type SessionConfig = {
  youtubeUrl: string;
  names: {
    name: string;
    party: string;
    fraction: string;
  }[];
};

export type SessionVote = {
  name: string;
  vote: string;
};

export type SessionScan = {
  votingFilename: string;
  videoTimestamp: string;
  votingSubject: {
    agendaItem: string;
    applicationId: string;
    title: string;
    type: string;
    authors: string[];
  };
  votes: SessionVote[];
}[];
