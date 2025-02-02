import type { SessionInput } from '../model/SessionInput.ts';
import type { RegistryFaction } from '../model/registry.ts';
import { VoteResult, VotingResult } from '../model/Session.ts';
import type { SessionVote } from '../model/session-scan.ts';


export type HistoryDataPoint = {
  date: string;
  value: number;
};


export class ApplicationsSuccess {


  constructor(private readonly sessions: SessionInput[]) {
  }


  public forFaction(faction: RegistryFaction): number | null {
    return this.calcFactionApplicationSuccessRate(faction, this.sessions);
  }


  public historyForFaction(faction: RegistryFaction): HistoryDataPoint[] {

    return this.sessions
      .map(session => {
        const sessions = this.sessions.filter(s => s.config.date <= session.config.date);
        const value = this.calcFactionApplicationSuccessRate(faction, sessions);
        return { date: session.config.date, value };
      })
      .filter(({ value }) => value !== null)
      .map(({ date, value }) => ({ date, value: value! }))
      .toSorted((a, b) => a.date.localeCompare(b.date));

  }


  private calcFactionApplicationSuccessRate(faction: RegistryFaction, sessions: SessionInput[]): number | null {

    const applications = sessions
      .flatMap(session => session.votings)
      .filter(voting => voting.votingSubject.authors.includes(faction.name));

    const applicationsPassed = applications.filter(
      voting => this.getVotingResult(voting.votes) === VotingResult.PASSED
    );

    return applications.length === 0
      ? null
      : applicationsPassed.length / applications.length;

  }


  private getVotingResult(votes: SessionVote[]): VotingResult {
    const votedFor = votes.filter(vote => vote.vote === VoteResult.VOTE_FOR).length;
    const votedAgainst = votes.filter(vote => vote.vote === VoteResult.VOTE_AGAINST).length;
    return votedFor > votedAgainst ? VotingResult.PASSED : VotingResult.REJECTED;
  }


}
