import type { SessionInput } from '../model/SessionInput.ts';
import type { RegistryFaction, RegistryParty } from '../model/registry.ts';
import type { SessionScanItem } from '../model/session-scan.ts';
import { VoteResult } from '../model/Session.ts';

export class ParticipationRate {


  constructor(private readonly sessions: SessionInput[]) {
  }


  public forFaction(faction: RegistryFaction): number {

    const allRates = this.sessions
      .flatMap(({ config, votings }) => {
        const factionMembers = config.names.filter(name => name.faction === faction.name).map(name => name.name);
        return votings.map(voting => this.calcParticipationRate(factionMembers, voting));
      });

    return allRates.length === 0 ? 0 : allRates.reduce((a, b) => a + b, 0) / allRates.length;

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


  public forParty(party: RegistryParty): number {

    const allRates = this.sessions
      .flatMap(({ config, votings }) => {
        const persons = config.names.filter(name => name.party === party.name).map(name => name.name);
        return votings.map(voting => this.calcParticipationRate(persons, voting));
      });

    return allRates.length === 0 ? 0 : allRates.reduce((a, b) => a + b, 0) / allRates.length;

  }


  private calcParticipationRate(persons: string[], voting: SessionScanItem): number {
    return this.countVotesInVoting(persons, voting) / persons.length;
  }


  private calcFactionParticipationRate(faction: RegistryFaction, sessions: SessionInput[]): number | null {

    const votesPerSession = sessions.map(session => this.countVotesInSession(faction, session));
    const votes = votesPerSession.reduce((a, b) => a + b, 0);

    const totalVotesPerSession = sessions.map(session => session.votings.length * faction.seats);
    const totalVotes = totalVotesPerSession.reduce((a, b) => a + b, 0);

    return totalVotes === 0 ? null : votes / totalVotes;

  }


  private countVotesInSession(faction: RegistryFaction, session: SessionInput): number {
    const persons = session.config.names.filter(name => name.faction === faction.name).map(name => name.name);
    return session.votings
      .map(voting => this.countVotesInVoting(persons, voting))
      .reduce((a, b) => a + b, 0);
  }


  private countVotesInVoting(persons: string[], voting: SessionScanItem): number {
    return voting.votes
      .filter(vote => persons.includes(vote.name))
      .filter(vote => vote.vote !== VoteResult.DID_NOT_VOTE)
      .length;
  }


}
