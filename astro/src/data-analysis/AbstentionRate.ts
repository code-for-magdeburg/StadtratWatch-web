import type { SessionInput } from '../model/SessionInput.ts';
import type { RegistryFaction, RegistryParty, RegistryPerson } from '../model/registry.ts';
import type { SessionScanItem } from '../model/session-scan.ts';
import { VoteResult } from '../model/Session.ts';


export type HistoryDataPoint = {
  date: string;
  value: number;
};


export class AbstentionRate {


  constructor(private readonly sessions: SessionInput[]) {
  }


  public forFaction(faction: RegistryFaction): number | null {
    return this.calcFactionAbstentionRate(faction, this.sessions);
  }


  public historyForFaction(faction: RegistryFaction): HistoryDataPoint[] {

    return this.sessions
      .map(session => {
        const sessions = this.sessions.filter(s => s.config.date <= session.config.date);
        const value = this.calcFactionAbstentionRate(faction, sessions);
        return { date: session.config.date, value };
      })
      .filter(({ value }) => value !== null)
      .map(({ date, value }) => ({ date, value: value! }))
      .toSorted((a, b) => a.date.localeCompare(b.date));

  }


  public forParty(party: RegistryParty): number | null {
    return this.calcPartyAbstentionRate(party, this.sessions);
  }


  public historyForParty(party: RegistryParty): HistoryDataPoint[] {

    return this.sessions
      .map(session => {
        const sessions = this.sessions.filter(s => s.config.date <= session.config.date);
        const value = this.calcPartyAbstentionRate(party, sessions);
        return { date: session.config.date, value };
      })
      .filter(({ value }) => value !== null)
      .map(({ date, value }) => ({ date, value: value! }))
      .toSorted((a, b) => a.date.localeCompare(b.date));

  }


  public forPerson(person: RegistryPerson): number | null {

    const abstentionRates = this.sessions
      .filter(session => session.config.names.find(name => name.name === person.name))
      .flatMap(session => session.votings)
      .filter(voting => voting.votes.some(vote => vote.name === person.name && vote.vote !== VoteResult.DID_NOT_VOTE))
      .map(voting => this.calcAbstentionRateForVoting([person.name], voting))
      .filter(rate => rate !== null)
      .map(rate => rate!);

    return abstentionRates.length === 0
      ? null
      : abstentionRates.reduce((a, b) => a + b, 0) / abstentionRates.length;

  }


  private calcFactionAbstentionRate(faction: RegistryFaction, sessions: SessionInput[]): number | null {

    const abstentionRates = sessions
      .flatMap(session => {
        const persons = session.config.names.filter(name => name.faction === faction.name).map(name => name.name);
        return session.votings.map(voting => this.calcAbstentionRateForVoting(persons, voting));
      })
      .filter(rate => rate !== null)
      .map(rate => rate!);

    return abstentionRates.length === 0
      ? null
      : abstentionRates.reduce((a, b) => a + b, 0) / abstentionRates.length;

  }


  private calcPartyAbstentionRate(party: RegistryParty, sessions: SessionInput[]): number | null {

    const abstentionRates = sessions
      .flatMap(session => {
        const persons = session.config.names.filter(name => name.party === party.name).map(name => name.name);
        return session.votings.map(voting => this.calcAbstentionRateForVoting(persons, voting));
      })
      .filter(rate => rate !== null)
      .map(rate => rate!);

    return abstentionRates.length === 0
      ? null
      : abstentionRates.reduce((a, b) => a + b, 0) / abstentionRates.length;

  }


  private calcAbstentionRateForVoting(persons: string[], voting: SessionScanItem): number | null {
    const allVotes = voting.votes
      .filter(vote => persons.includes(vote.name))
      .filter(vote => vote.vote !== VoteResult.DID_NOT_VOTE);
    const abstentions = allVotes.filter(vote => vote.vote === VoteResult.VOTE_ABSTENTION).length;
    return allVotes.length === 0 ? null : abstentions / allVotes.length;
  }


}
