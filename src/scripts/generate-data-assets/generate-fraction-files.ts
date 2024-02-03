import { FractionDetailsDto, FractionLightDto, StatsHistoryDto } from '../../app/model/Fraction';
import * as fs from 'fs';
import { Registry, RegistryFraction, RegistryPerson } from './model/registry';
import { FRACTIONS_BASE_DIR } from './constants';
import {
  SessionDetailsDto,
  SessionPersonDto,
  SessionVotingDto,
  VoteResult,
  VotingResult
} from '../../app/model/Session';
import { calcFractionVotingSuccessRate } from './data-analysis/voting-success-rate';
import { ApplicationDto } from '../../app/model/Application';


export function generateFractionFiles(registry: Registry, sessions: SessionDetailsDto[]): void {
  console.log('Writing all-fractions.json');
  const fractions = registry.fractions.map<FractionLightDto>(fraction => {
    const members = registry.persons.filter(person => person.fractionId === fraction.id);
    const applicationsSuccessRate = calcApplicationsSuccessRate(fraction, sessions);
    const votingsSuccessRate = calcFractionVotingSuccessRate(fraction.id, sessions);
    const uniformityScore = calcUniformityScore(members, sessions) || 0;
    const participationRate = calcParticipationRate(fraction, sessions) || 0;
    const abstentionRate = calcAbstentionRate(members, sessions) || 0;
    return {
      id: fraction.id,
      name: fraction.name,
      seats: fraction.seats,
      applicationsSuccessRate,
      votingsSuccessRate,
      uniformityScore,
      participationRate,
      abstentionRate
    };
  });
  fs.writeFileSync(
    `${FRACTIONS_BASE_DIR}/all-fractions.json`,
    JSON.stringify(fractions, null, 2),
    'utf-8'
  );

  fractions.forEach(fraction => {
    console.log(`Writing fraction file ${fraction.id}.json`);
    const fractionDetails = {
      ...fraction,
      statsHistory: calcStatsHistory(registry, fraction, sessions),
      applications: getApplicationsOfFraction(fraction, sessions)
    } satisfies FractionDetailsDto;
    const data = JSON.stringify(fractionDetails, null, 2);
    fs.writeFileSync(`${FRACTIONS_BASE_DIR}/${fraction.id}.json`, data, 'utf-8');
  });

}


function calcApplicationsSuccessRate(fraction: RegistryFraction, sessions: SessionDetailsDto[]): number {
  const relevantApplications = sessions
    .map(session => session.votings)
    .flat()
    .filter(voting => voting.votingSubject.authors.includes(fraction.name));

  if (relevantApplications.length === 0) {
    return 0;
  }

  const applicationsPassed = relevantApplications
    .filter(voting => voting.votingResult === VotingResult.PASSED)
    .length;

  return applicationsPassed / relevantApplications.length;
}


function calcUniformityScore(fractionMembers: RegistryPerson[], sessions: SessionDetailsDto[]): number | null {
  const uniformityScoresPerSession = sessions
    .map(session => calcUniformityScoreForSession(fractionMembers, session))
    .filter(score => score !== null) as number[];

  if (uniformityScoresPerSession.length === 0) {
    return null;
  }

  return uniformityScoresPerSession.reduce((a, b) => a + b, 0) / uniformityScoresPerSession.length;
}


function calcUniformityScoreForSession(fractionMembers: RegistryPerson[], session: SessionDetailsDto): number | null {
  const relevantFractionMembers = fractionMembers.filter(
    member => session.persons.some(person => person.id === member.id)
  );
  const uniformityScorePerVoting = session.votings
    .map(voting => calcUniformityScoreForVoting(relevantFractionMembers, voting))
    .filter(score => score !== null) as number[];

  if (uniformityScorePerVoting.length === 0) {
    return null;
  }

  return uniformityScorePerVoting.reduce((a, b) => a + b, 0) / uniformityScorePerVoting.length;
}


function calcUniformityScoreForVoting(fractionMembers: RegistryPerson[], voting: SessionVotingDto): number | null {

  let votesFor = 0;
  let votesAgainst = 0;
  let votesAbstained = 0;

  fractionMembers.forEach(member => {
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


function calcParticipationRate(fraction: RegistryFraction, sessions: SessionDetailsDto[]): number | null {

  const votesPerSession = sessions.map(session => countVotesInSession(fraction, session));
  const votes = votesPerSession.reduce((a, b) => a + b, 0);

  const totalVotesPerSession = sessions.map(session => session.votings.length * fraction.seats);
  const totalVotes = totalVotesPerSession.reduce((a, b) => a + b, 0);

  return totalVotes === 0 ? null : votes / totalVotes;

}


function countVotesInSession(fraction: RegistryFraction, session: SessionDetailsDto): number {

  const fractionMembers = session.persons.filter(person => person.fraction === fraction.name);
  const participationPerVoting = session.votings.map(
    voting => countVotesInVoting(fractionMembers, voting)
  );

  return participationPerVoting.reduce((a, b) => a + b, 0);

}


function countVotesInVoting(fractionMembers: SessionPersonDto[], voting: SessionVotingDto): number {
  return voting.votes
    .filter(
      vote => fractionMembers.some(member => member.id === vote.personId)
        && vote.vote !== VoteResult.DID_NOT_VOTE)
    .length;
}


function calcAbstentionRate(fractionMembers: RegistryPerson[], sessions: SessionDetailsDto[]): number {
  const abstentionRatePerSession = sessions
    .map(session => calcAbstentionRateForSession(fractionMembers, session))
    .filter(rate => rate !== null) as number[];

  if (abstentionRatePerSession.length === 0) {
    return 0;
  }

  return abstentionRatePerSession.reduce((a, b) => a + b, 0) / abstentionRatePerSession.length;
}


function calcAbstentionRateForSession(fractionMembers: RegistryPerson[], session: SessionDetailsDto): number {
  const abstentionRatePerVoting = session.votings
    .map(voting => calcAbstentionRateForVoting(fractionMembers, voting))
    .filter(rate => rate !== null) as number[];

  if (abstentionRatePerVoting.length === 0) {
    return 0;
  }

  return abstentionRatePerVoting.reduce((a, b) => a + b, 0) / abstentionRatePerVoting.length;
}


function calcAbstentionRateForVoting(fractionMembers: RegistryPerson[], voting: SessionVotingDto): number {
  const allVotes = voting.votes.filter(vote =>
    fractionMembers.some(member => member.id === vote.personId) && vote.vote !== VoteResult.DID_NOT_VOTE
  );
  const abstentions = allVotes.filter(vote => vote.vote === VoteResult.VOTE_ABSTENTION);

  if (allVotes.length === 0) {
    return 0;
  }

  return abstentions.length / allVotes.length;
}


function calcStatsHistory(registry: Registry, fraction: FractionLightDto, sessions: SessionDetailsDto[]): StatsHistoryDto {

  const members = registry.persons.filter(person => person.fractionId === fraction.id);

  return {
    applicationsSuccessRate: sessions.map(session => ({
      date: session.date,
      value: calcApplicationsSuccessRate(fraction, sessions.filter(s => s.date <= session.date))
    })),
    votingsSuccessRate: sessions.map(session => ({
      date: session.date,
      value: calcFractionVotingSuccessRate(fraction.id, sessions.filter(s => s.date <= session.date))
    })),
    uniformityScore: sessions.map(session => ({
      date: session.date,
      value: calcUniformityScore(members, sessions.filter(s => s.date <= session.date))
    })),
    participationRate: sessions.map(session => ({
      date: session.date,
      value: calcParticipationRate(fraction, sessions.filter(s => s.date <= session.date))
    })),
    abstentionRate: sessions.map(session => ({
      date: session.date,
      value: calcAbstentionRate(members, sessions.filter(s => s.date <= session.date))
    }))
  };

}


function getApplicationsOfFraction(fraction: FractionLightDto, sessions: SessionDetailsDto[]): ApplicationDto[] {
  const fractionApplicationsVotings = sessions
    .map(session => ({
      votings: session.votings.map(voting => ({
        voting,
        sessionId: session.id,
        sessionDate: session.date
      }))
    }))
    .flatMap(session => session.votings)
    .filter(voting => !!voting.voting.votingSubject.applicationId)
    .filter(voting => voting.voting.votingSubject.authors.includes(fraction.name));

  const applicationsMap = fractionApplicationsVotings.reduce((acc, curr) => {
    const key = `${curr.voting.votingSubject.applicationId}-${curr.voting.votingSubject.type}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(curr);
    return acc;
  }, {} as Record<string, typeof fractionApplicationsVotings>);

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
