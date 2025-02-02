import type { SessionInput } from '../model/SessionInput.ts';
import type { RegistryFaction, RegistryParty, RegistryPerson } from '../model/registry.ts';
import type { SessionScanItem } from '../model/session-scan.ts';
import { VoteResult } from '../model/Session.ts';


export class ParticipationRate {


  constructor(private readonly sessions: SessionInput[]) {
  }


  public forFaction(faction: RegistryFaction): number | null {
    return this.calcFactionParticipationRate(faction, this.sessions);
  }


  public historyForFaction(faction: RegistryFaction): { date: string, value: number }[] {

    return this.sessions
      .map(session => {
        const sessions = this.sessions.filter(s => s.config.date <= session.config.date);
        const value = this.calcFactionParticipationRate(faction, sessions);
        return { date: session.config.date, value };
      })
      .filter(({ value }) => value !== null)
      .map(({ date, value }) => ({ date, value: value! }))
      .toSorted((a, b) => a.date.localeCompare(b.date));

  }


  public forParty(party: RegistryParty): number | null {
    return this.calcPartyParticipationRate(party, this.sessions);
  }


  public historyForParty(party: RegistryParty): { date: string, value: number }[] {

    return this.sessions
      .map(session => {
        const sessions = this.sessions.filter(s => s.config.date <= session.config.date);
        const value = this.calcPartyParticipationRate(party, sessions);
        return { date: session.config.date, value };
      })
      .filter(({ value }) => value !== null)
      .map(({ date, value }) => ({ date, value: value! }))
      .toSorted((a, b) => a.date.localeCompare(b.date));

  }


  public forPerson(person: RegistryPerson): number | null {

    const participationRates = this.sessions
      .filter(session => session.config.names.find(name => name.name === person.name))
      .flatMap(session => session.votings)
      .map(voting => this.calcParticipationRateForVoting([person.name], voting))
      .filter(rate => rate !== null)
      .map(rate => rate!);

    return participationRates.length === 0
      ? null
      : participationRates.reduce((a, b) => a + b, 0) / participationRates.length;

  }


  private calcFactionParticipationRate(faction: RegistryFaction, sessions: SessionInput[]): number | null {

    const participationRates = sessions
      .flatMap(session => {
        const persons = session.config.names.filter(name => name.faction === faction.name).map(name => name.name);
        return session.votings.map(voting => this.calcParticipationRateForVoting(persons, voting));
      })
      .filter(rate => rate !== null)
      .map(rate => rate!);

    return participationRates.length === 0
      ? null
      : participationRates.reduce((a, b) => a + b, 0) / participationRates.length;
  }


  private calcPartyParticipationRate(party: RegistryParty, sessions: SessionInput[]): number | null {

    const participationRates = sessions
      .flatMap(session => {
        const persons = session.config.names.filter(name => name.party === party.name).map(name => name.name);
        return session.votings.map(voting => this.calcParticipationRateForVoting(persons, voting));
      })
      .filter(rate => rate !== null)
      .map(rate => rate!);

    return participationRates.length === 0
      ? null
      : participationRates.reduce((a, b) => a + b, 0) / participationRates.length;

  }


  private calcParticipationRateForVoting(persons: string[], voting: SessionScanItem): number | null {
    const votes = voting.votes
      .filter(vote => persons.includes(vote.name))
      .filter(vote => vote.vote !== VoteResult.DID_NOT_VOTE);
    return persons.length === 0 ? null : votes.length / persons.length;
  }


}
