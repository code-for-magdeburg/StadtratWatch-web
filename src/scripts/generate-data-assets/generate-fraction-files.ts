import { FractionDto } from '../../app/model/Fraction';
import * as fs from 'fs';
import { Registry, RegistryFraction, RegistryPerson } from './model/registry';
import { FRACTIONS_BASE_DIR } from './constants';
import { SessionDetailsDto, SessionVotingDto, VoteResult, VotingResult } from '../../app/model/Session';


export function generateFractionFiles(registry: Registry, sessions: SessionDetailsDto[]) {
  console.log('Writing all-fractions.json');
  const fractions = registry.fractions.map<FractionDto>(fraction => {
    const members = registry.persons.filter(person => person.fractionId === fraction.id);
    const applicationsSuccessRate = calcApplicationsSuccessRate(fraction, sessions);
    const votingsSuccessRate = calcVotingsSuccessRate(members, sessions);
    const uniformityScore = calcUniformityScore(members, sessions) || 0;
    const participationRate = calcParticipationRate(members, sessions) || 0;
    return {
      id: fraction.id,
      name: fraction.name,
      membersCount: members.length,
      applicationsSuccessRate,
      votingsSuccessRate,
      uniformityScore,
      participationRate
    };
  });
  fs.writeFileSync(
    `${FRACTIONS_BASE_DIR}/all-fractions.json`,
    JSON.stringify(fractions, null, 2),
    'utf-8'
  );

  fractions.forEach(fraction => {
    console.log(`Writing fraction file ${fraction.id}.json`);
    const data = JSON.stringify(fraction, null, 2);
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


function calcVotingsSuccessRate(fractionMembers: RegistryPerson[], sessions: SessionDetailsDto[]): number {

  const allVotings = sessions.map(session => session.votings).flat();
  if (allVotings.length === 0) {
    return 0;
  }

  const relevantVotingsResults = allVotings
    .map(voting => {
      const fractionVotes = voting.votes.filter(
        vote => fractionMembers.some(member => member.id === vote.personId)
      );
      const votedFor = fractionVotes.filter(vote => vote.vote === VoteResult.VOTE_FOR);
      const votedAgainstOrAbstained = fractionVotes.filter(
        vote => vote.vote === VoteResult.VOTE_AGAINST || vote.vote === VoteResult.VOTE_ABSTENTION
      );

      const fractionResult = votedFor.length > votedAgainstOrAbstained.length
        ? VotingResult.PASSED
        : VotingResult.REJECTED;
      return { totalFractionVotes: fractionVotes.length, votingResult: voting.votingResult, fractionResult };
    })
    .filter(voting => voting.totalFractionVotes > 0);

  const fractionSuccessfulVotings = relevantVotingsResults.filter(
    voting => voting.votingResult === voting.fractionResult
  );

  return fractionSuccessfulVotings.length / relevantVotingsResults.length;

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
  const uniformityScorePerVoting = session.votings
    .map(voting => calcUniformityScoreForVoting(fractionMembers, voting))
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


function calcParticipationRate(fractionMembers: RegistryPerson[], sessions: SessionDetailsDto[]): number | null {
  const participationRatesPerSession = sessions
    .map(session => calcParticipationRateForSession(fractionMembers, session))
    .filter(rate => rate !== null) as number[];

  if (participationRatesPerSession.length === 0) {
    return null;
  }

  return participationRatesPerSession.reduce((a, b) => a + b, 0) / participationRatesPerSession.length;
}


function calcParticipationRateForSession(fractionMembers: RegistryPerson[], session: SessionDetailsDto): number | null {
  const participationRatesPerVoting = session.votings
    .map(voting => calcParticipationRateForVoting(fractionMembers, voting))
    .filter(rate => rate !== null) as number[];

  if (participationRatesPerVoting.length === 0) {
    return null;
  }

  return participationRatesPerVoting.reduce((a, b) => a + b, 0) / participationRatesPerVoting.length;
}


function calcParticipationRateForVoting(fractionMembers: RegistryPerson[], voting: SessionVotingDto): number {
  const votes = fractionMembers.filter(member =>
    voting.votes.some(vote => vote.personId === member.id && vote.vote !== VoteResult.DID_NOT_VOTE)
  );

  return votes.length / fractionMembers.length;
}
