import type { SessionInput } from '../model/SessionInput.ts';
import type { RegistryFaction, RegistryParty, RegistryPerson } from '../model/registry.ts';
import type { SessionScanItem, SessionVote } from '../model/session-scan.ts';
import { VoteResult, VotingResult } from '../model/Session.ts';


type VotingsSuccessForSession = {
  successfulVotings: number;
  totalVotings: number;
};


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


  public historyForFaction(faction: RegistryFaction): { date: string, value: number }[] {

    return this.sessions
      .map(session => {
        const sessions = this.sessions.filter(s => s.config.date <= session.config.date);
        const value = this.calcFactionVotingSuccessRate(faction, sessions);
        return { date: session.config.date, value };
      })
      .toSorted((a, b) => a.date.localeCompare(b.date));

  }


  public forParty(party: RegistryParty): number {

    const allVotings = this.sessions.flatMap(
      ({ config, votings }) => {
        const partyMembers = config.names.filter(name => name.party === party.name).map(name => name.name);
        return votings.map(voting => ({ voting, partyMembers }));
      });
    const successfulVotings = allVotings.filter(
      voting => this.isPersonsVotingSuccessful(voting.partyMembers, voting.voting)
    );

    return allVotings.length === 0 ? 0 : successfulVotings.length / allVotings.length;

  }


  public historyForParty(party: RegistryParty): { date: string, value: number }[] {

    return this.sessions
      .map(session => {
        const sessions = this.sessions.filter(s => s.config.date <= session.config.date);
        const value = this.calcPartyVotingSuccessRate(party, sessions);
        return { date: session.config.date, value };
      })
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
        const votingResult = this.getVotingResult(voting.votes);
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


  private isPersonsVotingSuccessful(persons: string[], voting: SessionScanItem): boolean {
    const votingResult = this.calcVotingResult(voting);
    const personsVotingResult = this.calcPersonsVotingResult(persons, voting);

    return votingResult === personsVotingResult;
  }


  private calcFactionVotingSuccessRate(faction: RegistryFaction, sessions: SessionInput[]): number {

    const votingsSuccessPerSession = sessions.map(session => this.calcFactionVotingSuccessForSession(faction, session));

    const successfulVotings = votingsSuccessPerSession.reduce((a, b) => a + b.successfulVotings, 0);
    const totalVotings = votingsSuccessPerSession.reduce((a, b) => a + b.totalVotings, 0);

    return totalVotings === 0 ? 0 : successfulVotings / totalVotings;

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


  private calcFactionVotingSuccessForSession(faction: RegistryFaction, session: SessionInput): VotingsSuccessForSession {

    const persons = session.config.names
      .filter(name => name.faction === faction.name)
      .map(name => name.name);

    const successfulVotings = session.votings
      .filter(voting => this.isPersonsVotingSuccessful(persons, voting))
      .length;

    return { successfulVotings, totalVotings: session.votings.length };

  }


  private calcPartyVotingSuccessRate(party: RegistryParty, sessions: SessionInput[]): number {

    const votingsSuccessPerSession = sessions.map(session => this.calcPartyVotingSuccessForSession(party, session));

    const successfulVotings = votingsSuccessPerSession.reduce((a, b) => a + b.successfulVotings, 0);
    const totalVotings = votingsSuccessPerSession.reduce((a, b) => a + b.totalVotings, 0);

    return totalVotings === 0 ? 0 : successfulVotings / totalVotings;

  }


  private calcPartyVotingSuccessForSession(party: RegistryParty, session: SessionInput): VotingsSuccessForSession {

    const persons = session.config.names
      .filter(name => name.party === party.name)
      .map(name => name.name);

    const successfulVotings = session.votings
      .filter(voting => this.isPersonsVotingSuccessful(persons, voting))
      .length;

    return { successfulVotings, totalVotings: session.votings.length };

  }


  private getVotingResult(votes: SessionVote[]): VotingResult {
    const votedFor = votes.filter(vote => vote.vote === VoteResult.VOTE_FOR).length;
    const votedAgainst = votes.filter(vote => vote.vote === VoteResult.VOTE_AGAINST).length;
    return votedFor > votedAgainst ? VotingResult.PASSED : VotingResult.REJECTED;
  }


}
