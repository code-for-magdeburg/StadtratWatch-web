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


  public forParty(party: RegistryParty): number {

    const allRates = this.sessions
      .flatMap(({ config, votings }) => {
        const partyMembers = config.names.filter(name => name.party === party.name).map(name => name.name);
        return votings.map(voting => this.calcAbstentionRate(partyMembers, voting));
      });

    return allRates.length === 0 ? 0 : allRates.reduce((a, b) => a + b, 0) / allRates.length;

  }


  private calcAbstentionRate(persons: string[], voting: SessionScanItem): number {
    const allVotes = voting.votes
      .filter(vote => persons.includes(vote.name))
      .filter(vote => vote.vote !== VoteResult.DID_NOT_VOTE);
    const abstentions = allVotes.filter(vote => vote.vote === VoteResult.VOTE_ABSTENTION).length;
    return allVotes.length === 0 ? 0 : abstentions / allVotes.length;
  }


}
