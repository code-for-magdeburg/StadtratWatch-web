import type { SessionInput } from '../model/SessionInput.ts';
import type { RegistryFaction } from '../model/registry.ts';
import type { SessionScanItem } from '../model/session-scan.ts';
import { VoteResult, VotingResult } from '../model/Session.ts';


export class VotingSuccess {


  constructor(private readonly sessions: SessionInput[]) {
  }


  public forFaction(faction: RegistryFaction): number {

    const allVotings = this.sessions.flatMap(
      ({ config, votings }) => {
        const factionMembers = config.names.filter(name => name.faction === faction.name).map(name => name.name);
        return votings.map(voting => ({ voting, factionMembers }));
      });
    const successfulVotings = allVotings.filter(
      voting => this.isPersonsVotingSuccessful(voting.factionMembers, voting.voting)
    );

    return allVotings.length === 0 ? 0 : successfulVotings.length / allVotings.length;

  }


  private isPersonsVotingSuccessful(persons: string[], voting: SessionScanItem): boolean {
    const votingResult = this.calcVotingResult(voting);
    const personsVotingResult = this.calcPersonsVotingResult(persons, voting);

    return votingResult === personsVotingResult;
  }


  private calcVotingResult(voting: SessionScanItem): VotingResult {
    const votedFor = voting.votes.filter(vote => vote.vote === VoteResult.VOTE_FOR).length;
    const votedAgainst = voting.votes.filter(vote => vote.vote === VoteResult.VOTE_AGAINST).length;

    return votedFor > votedAgainst
      ? VotingResult.PASSED
      : VotingResult.REJECTED;
  }


  private calcPersonsVotingResult(persons: string[], voting: SessionScanItem): VotingResult {
    const personsVotes = voting.votes.filter(vote => persons.includes(vote.name));
    const votedFor = personsVotes.filter(vote => vote.vote === VoteResult.VOTE_FOR).length;
    const votedAgainst = personsVotes.filter(vote => vote.vote === VoteResult.VOTE_AGAINST).length;

    return personsVotes.length > 0 && votedFor > votedAgainst
      ? VotingResult.PASSED
      : VotingResult.REJECTED;
  }


}
