import { FractionDto } from '../../app/model/Fraction';
import * as fs from 'fs';
import { Registry, RegistryPerson } from './model';
import { FRACTIONS_BASE_DIR } from './constants';
import { SessionDetailsDto, SessionVotingDto, VoteResult } from '../../app/model/Session';


export function generateFractionFiles(registry: Registry, sessions: SessionDetailsDto[]) {
  console.log('Writing all-fractions.json');
  const fractions = registry.fractions.map<FractionDto>(fraction => {
    const members = registry.persons.filter(person => person.fractionId === fraction.id);
    const uniformityScore = calcUniformityScore(members, sessions);
    return {
      id: fraction.id,
      name: fraction.name,
      membersCount: members.length,
      uniformityScore
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


function calcUniformityScore(fractionMembers: RegistryPerson[], sessions: SessionDetailsDto[]): number {
  const uniformityScoresPerSession = sessions
    .map(session => calcUniformityScoreForSession(fractionMembers, session))
    .filter(score => score !== null) as number[];

  if (uniformityScoresPerSession.length === 0) {
    return 0;
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
