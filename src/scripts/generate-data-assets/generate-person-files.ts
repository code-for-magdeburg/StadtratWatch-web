import { SessionDetailsDto, SessionVotingDto, VoteResult } from '../../app/model/Session';
import {
  PersonDetailsDto,
  PersonLightDto,
  PersonStatsHistoryDto,
  PersonVoteDto,
  PersonVotingComparison
} from '../../app/model/Person';
import * as fs from 'fs';
import { RegistryPerson } from './model/registry';
import { Registry } from './model/registry';
import { calcPersonVotingSuccess } from './data-analysis/voting-success-rate';
import * as path from 'path';


export function generatePersonFiles(personsOutputDir: string, registry: Registry, sessions: SessionDetailsDto[]) {

  if (!fs.existsSync(personsOutputDir)) {
    fs.mkdirSync(personsOutputDir, { recursive: true });
  }

  console.log('Writing all-persons.json');
  const personsLight = registry.persons
    .map<PersonLightDto>(person => {

      const fraction = registry.fractions.find(fraction => fraction.id === person.fractionId);
      const party = registry.parties.find(party => party.id === person.partyId);
      const votingAttendance = calcVotingAttendance(sessions, person);
      const votingSuccessStats = calcPersonVotingSuccess(sessions, person);
      const abstentionStats = calcAbstentionStats(sessions, person);
      return {
        id: person.id,
        name: person.name,
        fractionId: fraction?.id || '',
        fraction: fraction?.name || '',
        partyId: party?.id || '',
        party: party?.name || '',
        councilorUntil: person.end,
        votingAttendance,
        votingSuccessRate: votingSuccessStats.successRate,
        abstentionRate: abstentionStats.abstentionRate,
      };

    })
    .sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFileSync(
    `${personsOutputDir}/all-persons.json`,
    JSON.stringify(personsLight, null, 2),
    'utf-8'
  );

  const votings = sessions.flatMap(session => session.votings);

  const persons = registry.persons.map<PersonDetailsDto>(person => {

    const relevantSessions = sessions.filter(
      session => session.persons.some(sessionPerson => sessionPerson.id === person.id)
    );
    const fraction = registry.fractions.find(fraction => fraction.id === person.fractionId);
    const party = registry.parties.find(party => party.id === person.partyId);
    const votes = relevantSessions.flatMap<PersonVoteDto>(
      session => session.votings.map(voting => ({
        sessionId: session.id,
        votingId: voting.id,
        vote: voting.votes.find(vote => vote.personId === person.id)?.vote || VoteResult.DID_NOT_VOTE
      }))
    );
    const votingMatrix = calcVotingMatrix(registry, votings, person);
    const votingAttendance = calcVotingAttendance(relevantSessions, person);
    const votingSuccess = calcPersonVotingSuccess(relevantSessions, person);
    const abstentionStats = calcAbstentionStats(relevantSessions, person);
    return {
      id: person.id,
      name: person.name,
      fractionId: person.fractionId,
      fraction: fraction?.name || '',
      partyId: person.partyId,
      party: party?.name || '',
      councilorUntil: person.end,
      votes,
      votingMatrix,
      votingAttendance,
      votingSuccessCount: votingSuccess.successCount,
      votingSuccessRate: votingSuccess.successRate,
      abstentionCount: abstentionStats.abstentionCount,
      abstentionRate: abstentionStats.abstentionRate,
      statsHistory: calcStatsHistory(relevantSessions, person)
    };
  });

  persons.forEach(person => {
    console.log(`Writing person file ${person.id}.json`);
    const data = JSON.stringify(person, null, 2);
    fs.writeFileSync(`${personsOutputDir}/${person.id}.json`, data, 'utf-8');
  });

  console.log('Writing all-persons-forces.json');

  const personsForForceData = persons.filter(person => !person.councilorUntil);
  personsForForceData.sort((a, b) => a.name.localeCompare(b.name));

  const personPairs = [];
  const nodes = [];
  const links = [];
  for (let i = 0; i < personsForForceData.length; i++) {
    const person1 = personsForForceData[i];
    nodes.push({ id: `${person1.name} (${person1.party})` , group: person1.fraction })
    for (let j = i + 1; j < personsForForceData.length; j++) {
      const person2 = personsForForceData[j];
      const score = person1.votingMatrix.find(v => v.personId === person2.id)?.comparisonScore!;
      personPairs.push({ person1, person2, score });
      links.push({
        source: `${person1.name} (${person1.party})`,
        target: `${person2.name} (${person2.party})`,
        value: score,
      });
    }
  }

  const forceData = { nodes, links };
  fs.writeFileSync(
    path.join(personsOutputDir, 'all-persons-forces.json'),
    JSON.stringify(forceData, null, 2),
    'utf-8'
  );

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

  const relevantSessions = sessions.filter(
    session => session.persons.some(sessionPerson => sessionPerson.id === person.id)
  );
  const votingsAttended = relevantSessions
    .map(session =>
      session.votings.filter(
        voting => voting.votes.find(
          vote => vote.personId === person.id && vote.vote !== VoteResult.DID_NOT_VOTE
        )
      ).length
    )
    .reduce((a, b) => a + b, 0);
  const votingsTotal = relevantSessions.flatMap(session => session.votings).length;

  return votingsAttended / votingsTotal;

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


function calcStatsHistory(sessions: SessionDetailsDto[], person: RegistryPerson): PersonStatsHistoryDto {

  return {
    votingAttendance: sessions.map(session => ({
      date: session.date,
      value: calcVotingAttendance(sessions.filter(s => s.date <= session.date), person)
    })),
    votingSuccessRate: sessions.map(session => ({
      date: session.date,
      value: calcPersonVotingSuccess(sessions.filter(s => s.date <= session.date), person).successRate
    })),
    abstentionRate: sessions.map(session => ({
      date: session.date,
      value: calcAbstentionStats(sessions.filter(s => s.date <= session.date), person).abstentionRate
    }))
  };

}
