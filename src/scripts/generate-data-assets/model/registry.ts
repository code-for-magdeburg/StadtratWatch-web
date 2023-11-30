export type Registry = {
  sessions: RegistrySession[];
  fractions: RegistryFraction[];
  parties: RegistryParty[];
  persons: RegistryPerson[];
};

export type RegistrySession = {
  id: string;
  date: string;
  meetingMinutesUrl: string;
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
  start: string;
  end: string;
};
