import { PartyDto, PartyStatsHistoryDto, SessionDetailsDto, SessionVotingDto, VoteResult } from '@scope/interfaces-web-assets';
import { Registry, RegistryParty, RegistryPerson } from '../shared/model/registry.ts';
import { calcPartyVotingSuccessRate } from './data-analysis/voting-success-rate.ts';
import { SessionPersonDto } from '../../interfaces/web-assets/Session.ts';


export type GeneratedPartiesData = {
  parties: PartyDto[];
};


export class PartiesDataGenerator {


  public generatePartiesData(registry: Registry, sessions: SessionDetailsDto[]): GeneratedPartiesData {

    const parties = registry.parties.map<PartyDto>(party => {
      const members = registry.persons.filter(person => person.partyId === party.id);
      const votingsSuccessRate = calcPartyVotingSuccessRate(party.id, sessions);
      const uniformityScore = this.calcUniformityScore(members, sessions) || 0;
      const participationRate = this.calcParticipationRate(party, sessions) || 0;
      const abstentionRate = this.calcAbstentionRate(members, sessions) || 0;
      const speakingTime = this.calcSpeakingTime(members, sessions) || 0;
      return {
        id: party.id,
        name: party.name,
        seats: party.seats,
        votingsSuccessRate,
        uniformityScore,
        participationRate,
        abstentionRate,
        speakingTime,
        statsHistory: this.calcStatsHistory(party, members, sessions)
      };
    });

    return { parties };

  }


  private calcUniformityScore(partyMembers: RegistryPerson[], sessions: SessionDetailsDto[]): number | null {

    const scores = sessions
      .flatMap(session => session.votings)
      .map(voting => this.calcUniformityScoreForVoting(partyMembers, voting))
      .filter(score => score !== null) as number[];
    return scores.length === 0
      ? null
      : scores.reduce((acc, val) => acc + val, 0) / scores.length;

  }


  private calcUniformityScoreForVoting(partyMembers: RegistryPerson[], voting: SessionVotingDto): number | null {

    let votesFor = 0;
    let votesAgainst = 0;
    let votesAbstained = 0;

    partyMembers.forEach(member => {
      const vote = voting.votes.find(vote => vote.personId === member.id)?.vote || VoteResult.DID_NOT_VOTE;
      switch (vote) {
        case VoteResult.VOTE_FOR:
          votesFor++;
          break;
        case VoteResult.VOTE_AGAINST:
          votesAgainst++;
          break;
        case VoteResult.VOTE_ABSTENTION:
          votesAbstained++;
          break;
      }
    });

    const totalVotes = votesFor + votesAgainst + votesAbstained;
    if (totalVotes === 0) {
      return null;
    }

    const max1 = Math.max(votesFor, votesAgainst, votesAbstained);
    const max2 = votesFor === max1
      ? (Math.max(votesAgainst, votesAbstained))
      : (votesAgainst === max1
        ? Math.max(votesFor, votesAbstained)
        : Math.max(votesFor, votesAgainst));

    return (max1 - max2 + Math.min(votesAbstained, max2)) / totalVotes;

  }


  private calcParticipationRate(party: RegistryParty, sessions: SessionDetailsDto[]): number | null {

    const votesPerSession = sessions.map(session => this.countVotesInSession(party, session));
    const votes = votesPerSession.reduce((a, b) => a + b, 0);

    const totalVotesPerSession = sessions.map(session => session.votings.length * party.seats);
    const totalVotes = totalVotesPerSession.reduce((a, b) => a + b, 0);

    return totalVotes === 0 ? null : votes / totalVotes;

  }


  private countVotesInSession(party: RegistryParty, session: SessionDetailsDto): number {

    const partyMembers = session.persons.filter(person => person.party === party.name);
    const participationPerVoting = session.votings.map(
      voting => this.countVotesInVoting(partyMembers, voting)
    );

    return participationPerVoting.reduce((a, b) => a + b, 0);

  }


  private countVotesInVoting(partyMembers: SessionPersonDto[], voting: SessionVotingDto): number {
    return voting.votes
      .filter(
        vote => partyMembers.some(member => member.id === vote.personId)
          && vote.vote !== VoteResult.DID_NOT_VOTE)
      .length;
  }


  private calcAbstentionRate(partyMembers: RegistryPerson[], sessions: SessionDetailsDto[]): number | null {
    const rates = sessions
      .flatMap(session => session.votings)
      .map(voting => this.calcAbstentionRateForVoting(partyMembers, voting))
      .filter(rate => rate !== null) as number[];

    return rates.length === 0
      ? null
      : rates.reduce((a, b) => a + b, 0) / rates.length;
  }


  private calcAbstentionRateForVoting(partyMembers: RegistryPerson[], voting: SessionVotingDto): number | null {

    const allVotes = voting.votes.filter(vote =>
      partyMembers.some(member => member.id === vote.personId) && vote.vote !== VoteResult.DID_NOT_VOTE
    );
    const abstentions = allVotes.filter(vote => vote.vote === VoteResult.VOTE_ABSTENTION);

    return allVotes.length === 0
      ? null
      : abstentions.length / allVotes.length;

  }


  private calcStatsHistory(party: RegistryParty, partyMembers: RegistryPerson[],
                            sessions: SessionDetailsDto[]): PartyStatsHistoryDto {

    return {
      votingsSuccessRate: sessions.map(session => ({
        date: session.date,
        value: calcPartyVotingSuccessRate(party.id, sessions.filter(s => s.date <= session.date))
      })),
      uniformityScore: sessions.map(session => ({
        date: session.date,
        value: this.calcUniformityScore(partyMembers, sessions.filter(s => s.date <= session.date))
      })),
      participationRate: sessions.map(session => ({
        date: session.date,
        value: this.calcParticipationRate(party, sessions.filter(s => s.date <= session.date))
      })),
      abstentionRate: sessions.map(session => ({
        date: session.date,
        value: this.calcAbstentionRate(partyMembers, sessions.filter(s => s.date <= session.date))
      }))
    };

  }


  private calcSpeakingTime(partyMembers: RegistryPerson[], sessions: SessionDetailsDto[]): number {
    return sessions
      .map(session => this.calcSpeakingTimeForSession(partyMembers, session))
      .reduce((a, b) => a + b, 0);
  }


  private calcSpeakingTimeForSession(partyMembers: RegistryPerson[], session: SessionDetailsDto): number {

    const partySpeeches = session.speeches.filter(speakingTime =>
      partyMembers.some(member => member.name === speakingTime.speaker)
    );

    return partySpeeches.reduce((a, b) => a + b.duration, 0);

  }


}
