import { SessionPersonDto, SessionVotingDto, VoteResult, VotingResult, ApplicationDto, FactionDetailsDto, FactionLightDto, SessionDetailsDto, StatsHistoryDto } from '@scope/interfaces-web-assets';
import { Registry, RegistryFaction, RegistryPerson } from '../shared/model/registry.ts';
import { calcFactionVotingSuccessRate } from './data-analysis/voting-success-rate.ts';


export type GeneratedFactionsData = {
  factions: FactionDetailsDto[];
  factionsLight: FactionLightDto[];
};


export class FactionsDataGenerator {


  public generateFactionsData(registry: Registry, sessions: SessionDetailsDto[]): GeneratedFactionsData {

    const factions = registry.factions.map<FactionDetailsDto>(faction => {
      const members = registry.persons.filter(person => person.factionId === faction.id);
      const applicationsSuccessRate = this.calcApplicationsSuccessRate(faction, sessions);
      const votingsSuccessRate = calcFactionVotingSuccessRate(faction.id, sessions);
      const uniformityScore = this.calcUniformityScore(members, sessions) || 0;
      const participationRate = this.calcParticipationRate(faction, sessions) || 0;
      const abstentionRate = this.calcAbstentionRate(members, sessions) || 0;
      const speakingTime = this.calcSpeakingTime(members, sessions) || 0;
      return {
        id: faction.id,
        name: faction.name,
        seats: faction.seats,
        applicationsSuccessRate,
        votingsSuccessRate,
        uniformityScore,
        participationRate,
        abstentionRate,
        speakingTime,
        statsHistory: this.calcStatsHistory(registry, faction, sessions),
        applications: this.getApplicationsOfFaction(faction, sessions)
      } satisfies FactionDetailsDto;
    });

    const factionsLight = factions.map<FactionLightDto>(faction => {
      return {
        id: faction.id,
        name: faction.name,
        seats: faction.seats,
        applicationsSuccessRate: faction.applicationsSuccessRate,
        votingsSuccessRate: faction.votingsSuccessRate,
        uniformityScore: faction.uniformityScore,
        participationRate: faction.participationRate,
        abstentionRate: faction.abstentionRate,
        speakingTime: faction.speakingTime
      } satisfies FactionLightDto;
    });

    return { factions, factionsLight };

  }


  private calcApplicationsSuccessRate(faction: RegistryFaction, sessions: SessionDetailsDto[]): number {

    const relevantApplications = sessions
      .map(session => session.votings)
      .flat()
      .filter(voting => voting.votingSubject.authors.includes(faction.name));

    if (relevantApplications.length === 0) {
      return 0;
    }

    const applicationsPassed = relevantApplications
      .filter(voting => voting.votingResult === VotingResult.PASSED)
      .length;

    return applicationsPassed / relevantApplications.length;

  }


  private calcUniformityScore(factionMembers: RegistryPerson[], sessions: SessionDetailsDto[]): number | null {

    const uniformityScoresPerSession = sessions
      .map(session => this.calcUniformityScoreForSession(factionMembers, session))
      .filter(score => score !== null) as number[];

    if (uniformityScoresPerSession.length === 0) {
      return null;
    }

    return uniformityScoresPerSession.reduce((a, b) => a + b, 0) / uniformityScoresPerSession.length;

  }


  private calcUniformityScoreForSession(factionMembers: RegistryPerson[], session: SessionDetailsDto): number | null {
    const relevantFactionMembers = factionMembers.filter(
      member => session.persons.some(person => person.id === member.id)
    );
    const uniformityScorePerVoting = session.votings
      .map(voting => this.calcUniformityScoreForVoting(relevantFactionMembers, voting))
      .filter(score => score !== null) as number[];

    if (uniformityScorePerVoting.length === 0) {
      return null;
    }

    return uniformityScorePerVoting.reduce((a, b) => a + b, 0) / uniformityScorePerVoting.length;
  }


  private calcUniformityScoreForVoting(factionMembers: RegistryPerson[], voting: SessionVotingDto): number | null {

    let votesFor = 0;
    let votesAgainst = 0;
    let votesAbstained = 0;

    factionMembers.forEach(member => {
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


  private calcParticipationRate(faction: RegistryFaction, sessions: SessionDetailsDto[]): number | null {

    const votesPerSession = sessions.map(session => this.countVotesInSession(faction, session));
    const votes = votesPerSession.reduce((a, b) => a + b, 0);

    const totalVotesPerSession = sessions.map(session => session.votings.length * faction.seats);
    const totalVotes = totalVotesPerSession.reduce((a, b) => a + b, 0);

    return totalVotes === 0 ? null : votes / totalVotes;

  }


  private countVotesInSession(faction: RegistryFaction, session: SessionDetailsDto): number {

    const factionMembers = session.persons.filter(person => person.faction === faction.name);
    const participationPerVoting = session.votings.map(
      voting => this.countVotesInVoting(factionMembers, voting)
    );

    return participationPerVoting.reduce((a, b) => a + b, 0);

  }


  private countVotesInVoting(factionMembers: SessionPersonDto[], voting: SessionVotingDto): number {
    return voting.votes
      .filter(
        vote => factionMembers.some(member => member.id === vote.personId)
          && vote.vote !== VoteResult.DID_NOT_VOTE)
      .length;
  }


  private calcAbstentionRate(factionMembers: RegistryPerson[], sessions: SessionDetailsDto[]): number {
    const abstentionRatePerSession = sessions
      .map(session => this.calcAbstentionRateForSession(factionMembers, session))
      .filter(rate => rate !== null) as number[];

    if (abstentionRatePerSession.length === 0) {
      return 0;
    }

    return abstentionRatePerSession.reduce((a, b) => a + b, 0) / abstentionRatePerSession.length;
  }


  private calcAbstentionRateForSession(factionMembers: RegistryPerson[], session: SessionDetailsDto): number {
    const abstentionRatePerVoting = session.votings
      .map(voting => this.calcAbstentionRateForVoting(factionMembers, voting))
      .filter(rate => rate !== null) as number[];

    if (abstentionRatePerVoting.length === 0) {
      return 0;
    }

    return abstentionRatePerVoting.reduce((a, b) => a + b, 0) / abstentionRatePerVoting.length;
  }


  private calcAbstentionRateForVoting(factionMembers: RegistryPerson[], voting: SessionVotingDto): number {
    const allVotes = voting.votes.filter(vote =>
      factionMembers.some(member => member.id === vote.personId) && vote.vote !== VoteResult.DID_NOT_VOTE
    );
    const abstentions = allVotes.filter(vote => vote.vote === VoteResult.VOTE_ABSTENTION);

    if (allVotes.length === 0) {
      return 0;
    }

    return abstentions.length / allVotes.length;
  }


  private calcStatsHistory(registry: Registry, faction: RegistryFaction, sessions: SessionDetailsDto[]): StatsHistoryDto {

    const members = registry.persons.filter(person => person.factionId === faction.id);

    return {
      applicationsSuccessRate: sessions.map(session => ({
        date: session.date,
        value: this.calcApplicationsSuccessRate(faction, sessions.filter(s => s.date <= session.date))
      })),
      votingsSuccessRate: sessions.map(session => ({
        date: session.date,
        value: calcFactionVotingSuccessRate(faction.id, sessions.filter(s => s.date <= session.date))
      })),
      uniformityScore: sessions.map(session => ({
        date: session.date,
        value: this.calcUniformityScore(members, sessions.filter(s => s.date <= session.date))
      })),
      participationRate: sessions.map(session => ({
        date: session.date,
        value: this.calcParticipationRate(faction, sessions.filter(s => s.date <= session.date))
      })),
      abstentionRate: sessions.map(session => ({
        date: session.date,
        value: this.calcAbstentionRate(members, sessions.filter(s => s.date <= session.date))
      }))
    };

  }


  private getApplicationsOfFaction(faction: RegistryFaction, sessions: SessionDetailsDto[]): ApplicationDto[] {
    const factionApplicationsVotings = sessions
      .map(session => ({
        votings: session.votings.map(voting => ({
          voting,
          sessionId: session.id,
          sessionDate: session.date
        }))
      }))
      .flatMap(session => session.votings)
      .filter(voting => !!voting.voting.votingSubject.applicationId)
      .filter(voting => voting.voting.votingSubject.authors.includes(faction.name));

    const applicationsMap = factionApplicationsVotings.reduce((acc, curr) => {
      const key = `${curr.voting.votingSubject.applicationId}-${curr.voting.votingSubject.type}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(curr);
      return acc;
    }, {} as Record<string, typeof factionApplicationsVotings>);

    const applications = Object.values(applicationsMap);

    return applications.map(applicationVotings => {
      const applicationVoting = applicationVotings[0];
      const applicationId = applicationVoting.voting.votingSubject.applicationId;
      const applicationType = applicationVoting.voting.votingSubject.type;
      const applicationTitle = applicationVoting.voting.votingSubject.title;
      const paperId = applicationVoting.voting.votingSubject.paperId;
      const sessionId = applicationVoting.sessionId;
      const sessionDate = applicationVoting.sessionDate;
      const votings = applicationVotings.map(
        applicationVoting => ({
          votingId: applicationVoting.voting.id,
          votingResult: applicationVoting.voting.votingResult,
        })
      );
      return {
        applicationId,
        type: applicationType,
        title: applicationTitle,
        sessionId,
        sessionDate,
        paperId,
        votings
      } satisfies ApplicationDto;
    });
  }


  private calcSpeakingTime(factionMembers: RegistryPerson[], sessions: SessionDetailsDto[]): number {
    return sessions
      .map(session => this.calcSpeakingTimeForSession(factionMembers, session))
      .reduce((a, b) => a + b, 0);
  }


  private calcSpeakingTimeForSession(factionMembers: RegistryPerson[], session: SessionDetailsDto): number {

    const factionSpeeches = session.speeches.filter(speakingTime =>
      factionMembers.some(member => member.name === speakingTime.speaker)
    );

    return factionSpeeches.reduce((a, b) => a + b.duration, 0);

  }


}
