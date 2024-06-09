export type Registry = {
  electionPeriod: number;
  sessions: RegistrySession[];
  factions: RegistryFaction[];
  parties: RegistryParty[];
  persons: RegistryPerson[];
};

export type RegistrySession = {
  id: string;
  date: string;
  meetingMinutesUrl: string;
};

export type RegistryFaction = {
  id: string;
  name: string;
  seats: number;
};

export type RegistryParty = {
  id: string;
  name: string;
  seats: number;
};

export type RegistryPerson = {
  id: string;
  name: string;
  fractionId: string;
  partyId: string;
  start: string | null;
  end: string | null;
};
