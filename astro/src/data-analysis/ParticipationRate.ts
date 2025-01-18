import type { SessionInput } from '../model/SessionInput.ts';
import type { RegistryFaction } from '../model/registry.ts';
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


  private calcParticipationRate(persons: string[], voting: SessionScanItem): number {
    const expectedVotes = persons.length;
    const actualVotes = voting.votes
      .filter(vote => persons.includes(vote.name))
      .filter(vote => vote.vote !== VoteResult.DID_NOT_VOTE)
      .length;
    return actualVotes / expectedVotes;
  }


}
