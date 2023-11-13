import { SessionDetailsDto, SessionVotingDto, VoteResult, VotingResult } from '../../app/model/Session';
import { PersonDetailsDto, PersonLightDto, PersonVoteDto, PersonVotingComparison } from '../../app/model/Person';
import * as fs from 'fs';
import { RegistryPerson } from './model/registry';
import { PERSONS_BASE_DIR } from './constants';
import { Registry } from "./model/registry";


export function generatePersonFiles(registry: Registry, sessions: SessionDetailsDto[]) {

  console.log('Writing all-persons.json');
  const personsLight = registry.persons
    .map<PersonLightDto>(person => {

      const fraction = registry.fractions.find(fraction => fraction.id === person.fractionId);
      const party = registry.parties.find(party => party.id === person.partyId);
      const votingAttendance = calcVotingAttendance(sessions, person);
      const votingSuccessStats = calcVotingSuccessStats(sessions, person);
      const abstentionStats = calcAbstentionStats(sessions, person);
      return {
        id: person.id,
        name: person.name,
        fractionId: fraction?.id || '',
        fraction: fraction?.name || '',
        partyId: party?.id || '',
        party: party?.name || '',
        votingAttendance,
        votingSuccessRate: votingSuccessStats.successRate,
        abstentionRate: abstentionStats.abstentionRate,
      };

    })
    .sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFileSync(
    `${PERSONS_BASE_DIR}/all-persons.json`,
    JSON.stringify(personsLight, null, 2),
    'utf-8'
  );

  const votings = sessions.flatMap(session => session.votings);

  const persons = registry.persons.map<PersonDetailsDto>(person => {

    const fraction = registry.fractions.find(fraction => fraction.id === person.fractionId);
    const party = registry.parties.find(party => party.id === person.partyId);
    const votes = sessions.flatMap<PersonVoteDto>(
      session => session.votings.map(voting => ({
        sessionId: session.id,
        votingId: voting.id,
        vote: voting.votes.find(vote => vote.personId === person.id)?.vote || VoteResult.DID_NOT_VOTE
      }))
    );
    const votingMatrix = calcVotingMatrix(registry, votings, person);
    const votingAttendance = calcVotingAttendance(sessions, person);
    const votingSuccess = calcVotingSuccessStats(sessions, person);
    const abstentionStats = calcAbstentionStats(sessions, person);
    return {
      id: person.id,
      fractionId: person.fractionId,
      fraction: fraction?.name || '',
      partyId: person.partyId,
      party: party?.name || '',
      name: person.name,
      votes,
      votingMatrix,
      votingAttendance,
      votingSuccessCount: votingSuccess.successCount,
      votingSuccessRate: votingSuccess.successRate,
      abstentionCount: abstentionStats.abstentionCount,
      abstentionRate: abstentionStats.abstentionRate,
    };
  });
  persons.forEach(person => {
    console.log(`Writing person file ${person.id}.json`);
    const data = JSON.stringify(person, null, 2);
    fs.writeFileSync(`${PERSONS_BASE_DIR}/${person.id}.json`, data, 'utf-8');
  });

}


function calcVotingMatrix(registry: Registry, votings: SessionVotingDto[],
                          person: RegistryPerson): PersonVotingComparison[] {

  const otherPersons = registry.persons.filter(
    otherPerson => otherPerson.id !== person.id
  );
  return otherPersons.map<PersonVotingComparison>(otherPerson => ({
    personId: otherPerson.id,
    personName: otherPerson.name,
    fraction: registry.fractions.find(fraction => fraction.id === otherPerson.fractionId)?.name || '',
    party: registry.parties.find(party => party.id === otherPerson.partyId)?.name || '',
    comparisonScore: calcVotingComparisonScore(votings, person, otherPerson)
  }));

}


function calcVotingComparisonScore(votings: SessionVotingDto[], person: RegistryPerson, otherPerson: RegistryPerson) {
  const relevantVotings = votings.filter(
    voting =>
      voting.votes.some((vote: any) => vote.personId === person.id && vote.vote !== VoteResult.DID_NOT_VOTE) &&
      voting.votes.some((vote: any) => vote.personId === otherPerson.id && vote.vote !== VoteResult.DID_NOT_VOTE)
  );
  const equalVotes = relevantVotings.filter(voting => {
    const personVote = voting.votes.find((vote: any) => vote.personId === person.id)!;
    const otherPersonVote = voting.votes.find((vote: any) => vote.personId === otherPerson.id)!;
    return personVote.vote === otherPersonVote.vote;
  });
  return equalVotes.length / relevantVotings.length;
}


function calcVotingAttendance(sessions: SessionDetailsDto[], person: RegistryPerson): number {

  const votingsAttended = sessions
    .map(session =>
      session.votings.filter(
        voting => voting.votes.find(
          vote => vote.personId === person.id && vote.vote !== VoteResult.DID_NOT_VOTE
        )
      ).length
    )
    .reduce((a, b) => a + b, 0);
  const votingsTotal = sessions.flatMap(session => session.votings).length;

  return votingsAttended / votingsTotal;
}


function calcVotingSuccessStats(sessions: SessionDetailsDto[], person: RegistryPerson): {
  successCount: number,
  successRate: number
} {

  const votingSuccess = sessions
    .map(session => {
      // TODO: To be decided => Different results if the abstentions are counted as success or not
      //  or if the they are not counted at all
      const attendedVotings = session.votings.filter(voting =>
        voting.votes.some(vote => vote.personId === person.id && vote.vote !== VoteResult.DID_NOT_VOTE)
      );
      return attendedVotings.map(voting => {
        const personVote = voting.votes.find(vote => vote.personId === person.id)!.vote;
        return personVote === VoteResult.VOTE_FOR && voting.votingResult === VotingResult.PASSED
          || personVote === VoteResult.VOTE_AGAINST && voting.votingResult === VotingResult.REJECTED;
      });
    })
    .flat();
  const successCount = votingSuccess
    .map(success => success ? 1 : 0)
    .reduce<number>((a, b) => a + b, 0);
  const successRate = successCount / votingSuccess.length;
  return { successCount, successRate };

}


function calcAbstentionStats(sessions: SessionDetailsDto[], person: RegistryPerson): {
  abstentionCount: number,
  abstentionRate: number
} {

  const abstentions = sessions
    .map(session => {
      const attendedVotings = session.votings.filter(voting =>
        voting.votes.some(vote => vote.personId === person.id && vote.vote !== VoteResult.DID_NOT_VOTE)
      );
      return attendedVotings.map(voting => {
        const personVoteResult = voting.votes.find(vote => vote.personId === person.id)!.vote;
        return personVoteResult === VoteResult.VOTE_ABSTENTION;
      });
    })
    .flat();
  const abstentionCount = abstentions
    .map(abstention => abstention ? 1 : 0)
    .reduce<number>((a, b) => a + b, 0);
  const abstentionRate = abstentionCount / abstentions.length;
  return { abstentionCount, abstentionRate };

}
