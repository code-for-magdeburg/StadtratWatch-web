import type { SessionInput } from '../model/SessionInput.ts';
import type { RegistryFaction } from '../model/registry.ts';
import { VoteResult } from '../model/Session.ts';


export class ApplicationsSuccess {


  constructor(private readonly sessions: SessionInput[]) {
  }


  public forFaction(faction: RegistryFaction): number {

    const factionApplications = this.sessions.flatMap(
      ({ sessionId, votings }) => votings
        .filter(voting => voting.votingSubject.authors.includes(faction.name))
        .map(voting => ({ sessionId, voting }))
    );

    if (factionApplications.length === 0) {
      return 0;
    }

    const applicationsPassed = factionApplications.filter(voting => {
      const votedFor = voting.voting.votes.filter(vote => vote.vote === VoteResult.VOTE_FOR).length;
      const votedAgainst = voting.voting.votes.filter(vote => vote.vote === VoteResult.VOTE_AGAINST).length;
      return votedFor > votedAgainst;
    });

    return applicationsPassed.length / factionApplications.length;

  }


}
