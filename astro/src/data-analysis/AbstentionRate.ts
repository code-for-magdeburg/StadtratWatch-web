import type { SessionInput } from '../model/SessionInput.ts';
import type { RegistryFaction, RegistryParty } from '../model/registry.ts';
import type { SessionScanItem } from '../model/session-scan.ts';
import { VoteResult } from '../model/Session.ts';


export class AbstentionRate {


  constructor(private readonly sessions: SessionInput[]) {
  }


  public forFaction(faction: RegistryFaction): number {

    const allRates = this.sessions
      .flatMap(({ config, votings }) => {
        const factionMembers = config.names.filter(name => name.faction === faction.name).map(name => name.name);
        return votings.map(voting => this.calcAbstentionRate(factionMembers, voting));
      });

    return allRates.length === 0 ? 0 : allRates.reduce((a, b) => a + b, 0) / allRates.length;

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


  public forParty(party: RegistryParty): number {

    const allRates = this.sessions
      .flatMap(({ config, votings }) => {
        const partyMembers = config.names.filter(name => name.party === party.name).map(name => name.name);
        return votings.map(voting => this.calcAbstentionRate(partyMembers, voting));
      });

    return allRates.length === 0 ? 0 : allRates.reduce((a, b) => a + b, 0) / allRates.length;

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


  private calcAbstentionRate(persons: string[], voting: SessionScanItem): number {
    const allVotes = voting.votes
      .filter(vote => persons.includes(vote.name))
      .filter(vote => vote.vote !== VoteResult.DID_NOT_VOTE);
    const abstentions = allVotes.filter(vote => vote.vote === VoteResult.VOTE_ABSTENTION).length;
    return allVotes.length === 0 ? 0 : abstentions / allVotes.length;
  }


  private calcFactionAbstentionRate(faction: RegistryFaction, sessions: SessionInput[]): number | null {

    const abstentionRatePerSession = sessions
      .map(session => this.calcFactionAbstentionRateForSession(faction, session))
      .filter(rate => rate !== null)
      .map(rate => rate!);

    if (abstentionRatePerSession.length === 0) {
      return null;
    }

    return abstentionRatePerSession.reduce((a, b) => a + b, 0) / abstentionRatePerSession.length;

  }


  private calcFactionAbstentionRateForSession(faction: RegistryFaction, session: SessionInput): number | null {

    const persons = session.config.names.filter(name => name.faction === faction.name).map(name => name.name);
    const abstentionRatePerVoting = session.votings
      .map(voting => this.calcAbstentionRate(persons, voting))
      .filter(rate => rate !== null)
      .map(rate => rate!);

    if (abstentionRatePerVoting.length === 0) {
      return null;
    }

    return abstentionRatePerVoting.reduce((a, b) => a + b, 0) / abstentionRatePerVoting.length;

  }


  private calcPartyAbstentionRate(party: RegistryParty, sessions: SessionInput[]): number | null {

    const abstentionRatePerSession = sessions
      .map(session => this.calcPartyAbstentionRateForSession(party, session))
      .filter(rate => rate !== null)
      .map(rate => rate!);

    if (abstentionRatePerSession.length === 0) {
      return null;
    }

    return abstentionRatePerSession.reduce((a, b) => a + b, 0) / abstentionRatePerSession.length;

  }


  private calcPartyAbstentionRateForSession(party: RegistryParty, session: SessionInput): number | null {

    const persons = session.config.names.filter(name => name.party === party.name).map(name => name.name);
    const abstentionRatePerVoting = session.votings
      .map(voting => this.calcAbstentionRate(persons, voting))
      .filter(rate => rate !== null)
      .map(rate => rate!);

    if (abstentionRatePerVoting.length === 0) {
      return null;
    }

    return abstentionRatePerVoting.reduce((a, b) => a + b, 0) / abstentionRatePerVoting.length;

  }


}
