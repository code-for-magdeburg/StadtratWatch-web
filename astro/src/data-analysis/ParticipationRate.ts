import type { SessionInput } from '../model/SessionInput.ts';
import type { RegistryFaction, RegistryParty, RegistryPerson } from '../model/registry.ts';
import type { SessionScanItem } from '../model/session-scan.ts';
import { VoteResult } from '../model/Session.ts';


export type HistoryDataPoint = {
  date: string;
  value: number;
};


export function calcParticipationRateOfFaction(faction: RegistryFaction, sessions: SessionInput[]): number | null {

  const participationRates = sessions
    .flatMap(session => {
      const persons = session.config.names.filter(name => name.faction === faction.name).map(name => name.name);
      return session.votings.map(voting => calcParticipationRate(persons, voting));
    })
    .filter(rate => rate !== null)
    .map(rate => rate!);

  return participationRates.length === 0
    ? null
    : participationRates.reduce((a, b) => a + b, 0) / participationRates.length;

}


export function calcParticipationRateHistoryOfFaction(faction: RegistryFaction, sessions: SessionInput[]): HistoryDataPoint[] {

  return sessions
    .map(session => {
      const pastSessions = sessions.filter(s => s.config.date <= session.config.date);
      const value = calcParticipationRateOfFaction(faction, pastSessions);
      return { date: session.config.date, value };
    })
    .filter(({ value }) => value !== null)
    .map(({ date, value }) => ({ date, value: value! }))
    .toSorted((a, b) => a.date.localeCompare(b.date));

}


export function calcParticipationRateOfParty(party: RegistryParty, sessions: SessionInput[]): number | null {

  const participationRates = sessions
    .flatMap(session => {
      const persons = session.config.names.filter(name => name.party === party.name).map(name => name.name);
      return session.votings.map(voting => calcParticipationRate(persons, voting));
    })
    .filter(rate => rate !== null)
    .map(rate => rate!);

  return participationRates.length === 0
    ? null
    : participationRates.reduce((a, b) => a + b, 0) / participationRates.length;

}


export function calcParticipationRateHistoryOfParty(party: RegistryParty, sessions: SessionInput[]): HistoryDataPoint[] {

  return sessions
    .map(session => {
      const pastSessions = sessions.filter(s => s.config.date <= session.config.date);
      const value = calcParticipationRateOfParty(party, pastSessions);
      return { date: session.config.date, value };
    })
    .filter(({ value }) => value !== null)
    .map(({ date, value }) => ({ date, value: value! }))
    .toSorted((a, b) => a.date.localeCompare(b.date));

}


export function calcParticipationRateOfPerson(person: RegistryPerson, sessions: SessionInput[]): number | null {

  const participationRates = sessions
    .filter(session => session.config.names.find(name => name.name === person.name))
    .flatMap(session => session.votings)
    .map(voting => calcParticipationRate([person.name], voting))
    .filter(rate => rate !== null)
    .map(rate => rate!);

  return participationRates.length === 0
    ? null
    : participationRates.reduce((a, b) => a + b, 0) / participationRates.length;

}


function calcParticipationRate(persons: string[], voting: SessionScanItem): number | null {
  const votes = voting.votes
    .filter(vote => persons.includes(vote.name))
    .filter(vote => vote.vote !== VoteResult.DID_NOT_VOTE);
  return persons.length === 0 ? null : votes.length / persons.length;
}
