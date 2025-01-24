import type { SessionInput } from '../model/SessionInput.ts';
import type { RegistryFaction } from '../model/registry.ts';
import { VoteResult, VotingResult } from '../model/Session.ts';
import type { SessionVote } from '../model/session-scan.ts';


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

    const applicationsPassed = factionApplications.filter(
      voting => this.getVotingResult(voting.voting.votes) === VotingResult.PASSED
    );

    return applicationsPassed.length / factionApplications.length;

  }


  public historyForFaction(faction: RegistryFaction): { date: string, value: number }[] {

    return this.sessions
      .map(session => {
        const sessions = this.sessions.filter(s => s.config.date <= session.config.date);
        const value = this.calcFactionApplicationSuccessRate(faction, sessions);
        return { date: session.config.date, value };
      })
      .toSorted((a, b) => a.date.localeCompare(b.date));

  }


  private calcFactionApplicationSuccessRate(faction: RegistryFaction, sessions: SessionInput[]): number {

    const applications = sessions
      .flatMap(session => session.votings)
      .filter(voting => voting.votingSubject.authors.includes(faction.name));

    if (applications.length === 0) {
      return 0;
    }

    const applicationsPassed = applications
      .filter(voting => this.getVotingResult(voting.votes) === VotingResult.PASSED)
      .length;

    return applicationsPassed / applications.length;

  }


  private getVotingResult(votes: SessionVote[]): VotingResult {
    const votedFor = votes.filter(vote => vote.vote === VoteResult.VOTE_FOR).length;
    const votedAgainst = votes.filter(vote => vote.vote === VoteResult.VOTE_AGAINST).length;
    return votedFor > votedAgainst ? VotingResult.PASSED : VotingResult.REJECTED;
  }


}
