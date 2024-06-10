import { FactionDetailsDto, FactionLightDto, StatsHistoryDto } from '../../app/model/Faction';
import * as fs from 'fs';
import { Registry, RegistryFaction, RegistryPerson } from '../shared/model/registry';
import {
  SessionDetailsDto,
  SessionPersonDto,
  SessionVotingDto,
  VoteResult,
  VotingResult
} from '../../app/model/Session';
import { calcFactionVotingSuccessRate } from './data-analysis/voting-success-rate';
import { ApplicationDto } from '../../app/model/Application';


export function generateFactionFiles(factionsOutputDir: string, registry: Registry, sessions: SessionDetailsDto[]): void {

  if (!fs.existsSync(factionsOutputDir)) {
    fs.mkdirSync(factionsOutputDir, { recursive: true });
  }

  console.log('Writing all-factions.json');
  const factions = registry.factions.map<FactionLightDto>(faction => {
    const members = registry.persons.filter(person => person.fractionId === faction.id);
    const applicationsSuccessRate = calcApplicationsSuccessRate(faction, sessions);
    const votingsSuccessRate = calcFactionVotingSuccessRate(faction.id, sessions);
    const uniformityScore = calcUniformityScore(members, sessions) || 0;
    const participationRate = calcParticipationRate(faction, sessions) || 0;
    const abstentionRate = calcAbstentionRate(members, sessions) || 0;
    const speakingTime = calcSpeakingTime(members, sessions) || 0;
    return {
      id: faction.id,
      name: faction.name,
      seats: faction.seats,
      applicationsSuccessRate,
      votingsSuccessRate,
      uniformityScore,
      participationRate,
      abstentionRate,
      speakingTime
    };
  });
  fs.writeFileSync(
    `${factionsOutputDir}/all-factions.json`,
    JSON.stringify(factions, null, 2),
    'utf-8'
  );

  factions.forEach(faction => {
    console.log(`Writing faction file ${faction.id}.json`);
    const factionDetails = {
      ...faction,
      statsHistory: calcStatsHistory(registry, faction, sessions),
      applications: getApplicationsOfFaction(faction, sessions)
    } satisfies FactionDetailsDto;
    const data = JSON.stringify(factionDetails, null, 2);
    fs.writeFileSync(`${factionsOutputDir}/${faction.id}.json`, data, 'utf-8');
  });

}


function calcApplicationsSuccessRate(faction: RegistryFaction, sessions: SessionDetailsDto[]): number {
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


function calcUniformityScore(factionMembers: RegistryPerson[], sessions: SessionDetailsDto[]): number | null {
  const uniformityScoresPerSession = sessions
    .map(session => calcUniformityScoreForSession(factionMembers, session))
    .filter(score => score !== null) as number[];

  if (uniformityScoresPerSession.length === 0) {
    return null;
  }

  return uniformityScoresPerSession.reduce((a, b) => a + b, 0) / uniformityScoresPerSession.length;
}


function calcUniformityScoreForSession(factionMembers: RegistryPerson[], session: SessionDetailsDto): number | null {
  const relevantFactionMembers = factionMembers.filter(
    member => session.persons.some(person => person.id === member.id)
  );
  const uniformityScorePerVoting = session.votings
    .map(voting => calcUniformityScoreForVoting(relevantFactionMembers, voting))
    .filter(score => score !== null) as number[];

  if (uniformityScorePerVoting.length === 0) {
    return null;
  }

  return uniformityScorePerVoting.reduce((a, b) => a + b, 0) / uniformityScorePerVoting.length;
}


function calcUniformityScoreForVoting(factionMembers: RegistryPerson[], voting: SessionVotingDto): number | null {

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


function calcParticipationRate(faction: RegistryFaction, sessions: SessionDetailsDto[]): number | null {

  const votesPerSession = sessions.map(session => countVotesInSession(faction, session));
  const votes = votesPerSession.reduce((a, b) => a + b, 0);

  const totalVotesPerSession = sessions.map(session => session.votings.length * faction.seats);
  const totalVotes = totalVotesPerSession.reduce((a, b) => a + b, 0);

  return totalVotes === 0 ? null : votes / totalVotes;

}


function countVotesInSession(faction: RegistryFaction, session: SessionDetailsDto): number {

  const factionMembers = session.persons.filter(person => person.faction === faction.name);
  const participationPerVoting = session.votings.map(
    voting => countVotesInVoting(factionMembers, voting)
  );

  return participationPerVoting.reduce((a, b) => a + b, 0);

}


function countVotesInVoting(factionMembers: SessionPersonDto[], voting: SessionVotingDto): number {
  return voting.votes
    .filter(
      vote => factionMembers.some(member => member.id === vote.personId)
        && vote.vote !== VoteResult.DID_NOT_VOTE)
    .length;
}


function calcAbstentionRate(factionMembers: RegistryPerson[], sessions: SessionDetailsDto[]): number {
  const abstentionRatePerSession = sessions
    .map(session => calcAbstentionRateForSession(factionMembers, session))
    .filter(rate => rate !== null) as number[];

  if (abstentionRatePerSession.length === 0) {
    return 0;
  }

  return abstentionRatePerSession.reduce((a, b) => a + b, 0) / abstentionRatePerSession.length;
}


function calcAbstentionRateForSession(factionMembers: RegistryPerson[], session: SessionDetailsDto): number {
  const abstentionRatePerVoting = session.votings
    .map(voting => calcAbstentionRateForVoting(factionMembers, voting))
    .filter(rate => rate !== null) as number[];

  if (abstentionRatePerVoting.length === 0) {
    return 0;
  }

  return abstentionRatePerVoting.reduce((a, b) => a + b, 0) / abstentionRatePerVoting.length;
}


function calcAbstentionRateForVoting(factionMembers: RegistryPerson[], voting: SessionVotingDto): number {
  const allVotes = voting.votes.filter(vote =>
    factionMembers.some(member => member.id === vote.personId) && vote.vote !== VoteResult.DID_NOT_VOTE
  );
  const abstentions = allVotes.filter(vote => vote.vote === VoteResult.VOTE_ABSTENTION);

  if (allVotes.length === 0) {
    return 0;
  }

  return abstentions.length / allVotes.length;
}


function calcStatsHistory(registry: Registry, faction: FactionLightDto, sessions: SessionDetailsDto[]): StatsHistoryDto {

  const members = registry.persons.filter(person => person.fractionId === faction.id);

  return {
    applicationsSuccessRate: sessions.map(session => ({
      date: session.date,
      value: calcApplicationsSuccessRate(faction, sessions.filter(s => s.date <= session.date))
    })),
    votingsSuccessRate: sessions.map(session => ({
      date: session.date,
      value: calcFactionVotingSuccessRate(faction.id, sessions.filter(s => s.date <= session.date))
    })),
    uniformityScore: sessions.map(session => ({
      date: session.date,
      value: calcUniformityScore(members, sessions.filter(s => s.date <= session.date))
    })),
    participationRate: sessions.map(session => ({
      date: session.date,
      value: calcParticipationRate(faction, sessions.filter(s => s.date <= session.date))
    })),
    abstentionRate: sessions.map(session => ({
      date: session.date,
      value: calcAbstentionRate(members, sessions.filter(s => s.date <= session.date))
    }))
  };

}


function getApplicationsOfFaction(faction: FactionLightDto, sessions: SessionDetailsDto[]): ApplicationDto[] {
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
    const applicationUrl = applicationVoting.voting.votingSubject.documents.applicationUrl;
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
      applicationUrl,
      votings
    };
  });
}


function calcSpeakingTime(factionMembers: RegistryPerson[], sessions: SessionDetailsDto[]): number {
  return sessions
    .map(session => calcSpeakingTimeForSession(factionMembers, session))
    .reduce((a, b) => a + b, 0);
}


function calcSpeakingTimeForSession(factionMembers: RegistryPerson[], session: SessionDetailsDto): number {

  const factionSpeeches = session.speeches.filter(speakingTime =>
    factionMembers.some(member => member.name === speakingTime.speaker)
  );

  return factionSpeeches.reduce((a, b) => a + b.duration, 0);

}
