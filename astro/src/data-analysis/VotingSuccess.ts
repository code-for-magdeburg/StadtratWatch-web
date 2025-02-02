import type { SessionInput } from '../model/SessionInput.ts';
import type { RegistryFaction, RegistryParty, RegistryPerson } from '../model/registry.ts';
import type { SessionScanItem } from '../model/session-scan.ts';
import { VoteResult, VotingResult } from '../model/Session.ts';


export type HistoryDataPoint = {
  date: string;
  value: number;
};


export class VotingSuccess {


  constructor(private readonly sessions: SessionInput[]) {
  }


  public forFaction(faction: RegistryFaction): number | null {
    return this.calcFactionVotingSuccessRate(faction, this.sessions);
  }


  public historyForFaction(faction: RegistryFaction): HistoryDataPoint[] {

    return this.sessions
      .map(session => {
        const sessions = this.sessions.filter(s => s.config.date <= session.config.date);
        const value = this.calcFactionVotingSuccessRate(faction, sessions);
        return { date: session.config.date, value };
      })
      .filter(({ value }) => value !== null)
      .map(({ date, value }) => ({ date, value: value! }))
      .toSorted((a, b) => a.date.localeCompare(b.date));

  }


  public forParty(party: RegistryParty): number | null {
    return this.calcPartyVotingSuccessRate(party, this.sessions);
  }


  public historyForParty(party: RegistryParty): HistoryDataPoint[] {

    return this.sessions
      .map(session => {
        const sessions = this.sessions.filter(s => s.config.date <= session.config.date);
        const value = this.calcPartyVotingSuccessRate(party, sessions);
        return { date: session.config.date, value };
      })
      .filter(({ value }) => value !== null)
      .map(({ date, value }) => ({ date, value: value! }))
      .toSorted((a, b) => a.date.localeCompare(b.date));

  }


  public forPerson(person: RegistryPerson): number {

    const votingSuccess = this.sessions
      .filter(session => session.config.names.some(name => name.name === person.name))
      .flatMap(session => session.votings)
      .filter(voting =>
        // TODO: To be decided => Different results if the abstentions are counted as success or not
        //  or if the they are not counted at all
        voting.votes.some(vote => vote.name === person.name && vote.vote !== VoteResult.DID_NOT_VOTE)
      )
      .map(voting => {
        const personVote = voting.votes.find(vote => vote.name === person.name)!.vote;
        const votingResult = this.getVotingResult(voting);
        return personVote === VoteResult.VOTE_FOR && votingResult === VotingResult.PASSED
          || personVote === VoteResult.VOTE_AGAINST && votingResult === VotingResult.REJECTED;
      });

    if (votingSuccess.length === 0) {
      return 0;
    }

    const successCount = votingSuccess.filter(success => success).length;
    const totalCount = votingSuccess.length;

    return successCount / totalCount;

  }


  private calcFactionVotingSuccessRate(faction: RegistryFaction, sessions: SessionInput[]): number | null {

    const votingsSuccess = sessions
      .flatMap(session => {
        const persons = session.config.names.filter(name => name.faction === faction.name).map(name => name.name);
        const successfulVotings = session.votings.filter(voting => this.isPersonsVotingSuccessful(persons, voting));
        return { successfulVotings: successfulVotings.length, totalVotings: session.votings.length };
      })
      .reduce((acc, { successfulVotings, totalVotings }) => ({
        successfulVotings: acc.successfulVotings + successfulVotings,
        totalVotings: acc.totalVotings + totalVotings
      }));

    return votingsSuccess.totalVotings === 0
      ? null
      : votingsSuccess.successfulVotings / votingsSuccess.totalVotings;

  }


  private calcPartyVotingSuccessRate(party: RegistryParty, sessions: SessionInput[]): number | null {

    const votingsSuccess = sessions
      .flatMap(session => {
        const persons = session.config.names.filter(name => name.party === party.name).map(name => name.name);
        const successfulVotings = session.votings.filter(voting => this.isPersonsVotingSuccessful(persons, voting));
        return { successfulVotings: successfulVotings.length, totalVotings: session.votings.length };
      })
      .reduce((acc, { successfulVotings, totalVotings }) => ({
        successfulVotings: acc.successfulVotings + successfulVotings,
        totalVotings: acc.totalVotings + totalVotings
      }));

    return votingsSuccess.totalVotings === 0
      ? null
      : votingsSuccess.successfulVotings / votingsSuccess.totalVotings;

  }


  private isPersonsVotingSuccessful(persons: string[], voting: SessionScanItem): boolean {
    const votingResult = this.getVotingResult(voting);
    const personsVotingResult = this.calcPersonsVotingResult(persons, voting);

    return votingResult === personsVotingResult;
  }


  private calcPersonsVotingResult(persons: string[], voting: SessionScanItem): VotingResult {
    const personsVotes = voting.votes.filter(vote => persons.includes(vote.name));
    const votedFor = personsVotes.filter(vote => vote.vote === VoteResult.VOTE_FOR).length;
    const votedAgainst = personsVotes.filter(vote => vote.vote === VoteResult.VOTE_AGAINST).length;

    return personsVotes.length > 0 && votedFor > votedAgainst
      ? VotingResult.PASSED
      : VotingResult.REJECTED;
  }


  private getVotingResult(voting: SessionScanItem): VotingResult {
    const votedFor = voting.votes.filter(vote => vote.vote === VoteResult.VOTE_FOR).length;
    const votedAgainst = voting.votes.filter(vote => vote.vote === VoteResult.VOTE_AGAINST).length;
    return votedFor > votedAgainst ? VotingResult.PASSED : VotingResult.REJECTED;
  }


}
