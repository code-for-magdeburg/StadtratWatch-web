import type { SessionInput } from '../model/SessionInput.ts';
import type { RegistryFaction, RegistryParty, RegistryPerson } from '../model/registry.ts';
import type { SessionScanItem } from '../model/session-scan.ts';
import { VoteResult } from '../model/Session.ts';


export class AbstentionRate {


  constructor(private readonly sessions: SessionInput[]) {
  }


  public forFaction(faction: RegistryFaction): number | null {

    const allRates = this.sessions
      .flatMap(({ config, votings }) => {
        const factionMembers = config.names.filter(name => name.faction === faction.name).map(name => name.name);
        return votings.map(voting => this.calcAbstentionRate(factionMembers, voting));
      })
      .filter(rate => rate !== null)
      .map(rate => rate!);

    return allRates.length === 0 ? null : allRates.reduce((a, b) => a + b, 0) / allRates.length;

  }


  public historyForFaction(faction: RegistryFaction): { date: string, value: number }[] {

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

    const allRates = this.sessions
      .flatMap(({ config, votings }) => {
        const partyMembers = config.names.filter(name => name.party === party.name).map(name => name.name);
        return votings.map(voting => this.calcAbstentionRate(partyMembers, voting));
      })
      .filter(rate => rate !== null)
      .map(rate => rate!);

    return allRates.length === 0 ? null : allRates.reduce((a, b) => a + b, 0) / allRates.length;

  }


  public historyForParty(party: RegistryParty): { date: string, value: number }[] {

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
      .map(voting => this.calcAbstentionRate([person.name], voting))
      .filter(rate => rate !== null)
      .map(rate => rate!);
    return abstentionRates.length === 0
      ? null
      : abstentionRates.reduce((a, b) => a + b, 0) / abstentionRates.length;

  }


  private calcFactionAbstentionRate(faction: RegistryFaction, sessions: SessionInput[]): number | null {

    const abstentionRatePerSession = sessions
      .map(session => {
        const persons = session.config.names.filter(name => name.faction === faction.name).map(name => name.name);
        return this.calcAbstentionRateForSession(persons, session);
      })
      .filter(rate => rate !== null)
      .map(rate => rate!);

    if (abstentionRatePerSession.length === 0) {
      return null;
    }

    return abstentionRatePerSession.reduce((a, b) => a + b, 0) / abstentionRatePerSession.length;

  }


  private calcPartyAbstentionRate(party: RegistryParty, sessions: SessionInput[]): number | null {

    const abstentionRatePerSession = sessions
      .map(session => {
        const persons = session.config.names.filter(name => name.party === party.name).map(name => name.name);
        return this.calcAbstentionRateForSession(persons, session);
      })
      .filter(rate => rate !== null)
      .map(rate => rate!);

    if (abstentionRatePerSession.length === 0) {
      return null;
    }

    return abstentionRatePerSession.reduce((a, b) => a + b, 0) / abstentionRatePerSession.length;

  }


  private calcAbstentionRateForSession(persons: string[], session: SessionInput): number | null {

    const abstentionRatePerVoting = session.votings
      .map(voting => this.calcAbstentionRate(persons, voting))
      .filter(rate => rate !== null)
      .map(rate => rate!);

    if (abstentionRatePerVoting.length === 0) {
      return null;
    }

    return abstentionRatePerVoting.reduce((a, b) => a + b, 0) / abstentionRatePerVoting.length;

  }


  private calcAbstentionRate(persons: string[], voting: SessionScanItem): number | null {
    const allVotes = voting.votes
      .filter(vote => persons.includes(vote.name))
      .filter(vote => vote.vote !== VoteResult.DID_NOT_VOTE);
    const abstentions = allVotes.filter(vote => vote.vote === VoteResult.VOTE_ABSTENTION).length;
    return allVotes.length === 0 ? null : abstentions / allVotes.length;
  }


}
