import { SessionDetailsDto, SessionVotingDto, VoteResult } from '@scope/interfaces-web-assets';
import {
  PersonDetailsDto, PersonsForcesDto,
  PersonLightDto, PersonSpeechDto,
  PersonStatsHistoryDto,
  PersonVoteDto,
  PersonVotingComparison
} from '@scope/interfaces-web-assets';
import { Registry } from '../shared/model/registry.ts';
import { calcPersonVotingSuccess } from './data-analysis/voting-success-rate.ts';


export type GeneratedPersonsData = {
  persons: PersonDetailsDto[];
  personsLight: PersonLightDto[];
  personsForces: PersonsForcesDto;
};


export function generatePersonsData(registry: Registry, sessions: SessionDetailsDto[]): GeneratedPersonsData {

  const votings = sessions.flatMap(session => session.votings);

  const persons = registry.persons.map<PersonDetailsDto>(person => {

    const relevantSessions = sessions.filter(
      session => session.persons.some(sessionPerson => sessionPerson.id === person.id)
    );
    const faction = registry.factions.find(faction => faction.id === person.factionId);
    const party = registry.parties.find(party => party.id === person.partyId);
    const votes = relevantSessions.flatMap<PersonVoteDto>(
      session => session.votings.map(voting => ({
        sessionId: session.id,
        votingId: voting.id,
        vote: voting.votes.find(vote => vote.personId === person.id)?.vote || VoteResult.DID_NOT_VOTE
      }))
    );
    const votingMatrix = calcVotingMatrix(registry, votings, person.id);
    const votingAttendance = calcVotingAttendance(relevantSessions, person.id);
    const votingSuccess = calcPersonVotingSuccess(relevantSessions, person.id);
    const abstentionStats = calcAbstentionStats(relevantSessions, person.id);
    const speeches: PersonSpeechDto[] = relevantSessions.flatMap(
      session => session.speeches
        .filter(speech => speech.speaker === person.name)
        .map(speech => ({
          sessionId: session.id,
          sessionDate: session.date,
          youtubeUrl: session.youtubeUrl,
          start: speech.start,
          duration: speech.duration,
          onBehalfOf: speech.onBehalfOf
        }))
    );

    return {
      id: person.id,
      name: person.name,
      factionId: person.factionId,
      faction: faction?.name || '',
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
      statsHistory: calcStatsHistory(relevantSessions, person.id),
      speeches
    };
  });

  const personsLight = persons.map<PersonLightDto>(person => ({
    id: person.id,
    name: person.name,
    factionId: person.factionId,
    faction: person.faction,
    partyId: person.partyId,
    party: person.party,
    councilorUntil: person.councilorUntil,
    votingAttendance: person.votingAttendance,
    votingSuccessRate: person.votingSuccessRate,
    abstentionRate: person.abstentionRate,
    speakingTime: calcSpeakingTime(person),
  }));

  const personsForForceData = persons.filter(person => !person.councilorUntil);
  personsForForceData.sort((a, b) => a.name.localeCompare(b.name));

  const personPairs = [];
  const personsForces: PersonsForcesDto = {
    nodes: [],
    links: []
  };
  for (let i = 0; i < personsForForceData.length; i++) {
    const person1 = personsForForceData[i];
    personsForces.nodes.push({ id: person1.id, name: person1.name, faction: person1.faction })
    for (let j = i + 1; j < personsForForceData.length; j++) {
      const person2 = personsForForceData[j];
      const score = person1.votingMatrix
        .find(v => v.personId === person2.id)
        ?.comparisonScore!;
      personPairs.push({ person1, person2, score });
      personsForces.links.push({
        source: person1.id,
        target: person2.id,
        value: score,
      });
    }
  }

  return { persons, personsLight, personsForces };

}


function calcVotingMatrix(registry: Registry, votings: SessionVotingDto[], personId: string): PersonVotingComparison[] {

  const otherPersons = registry.persons.filter(
    otherPerson => otherPerson.id !== personId
  );
  return otherPersons.map<PersonVotingComparison>(otherPerson => ({
    personId: otherPerson.id,
    personName: otherPerson.name,
    faction: registry.factions.find(faction => faction.id === otherPerson.factionId)?.name || '',
    party: registry.parties.find(party => party.id === otherPerson.partyId)?.name || '',
    comparisonScore: calcVotingComparisonScore(votings, personId, otherPerson.id)
  }));

}


function calcVotingComparisonScore(votings: SessionVotingDto[], personId: string,
                                   otherPersonId: string) {
  const relevantVotings = votings.filter(
    voting =>
      voting.votes.some(vote => vote.personId === personId && vote.vote !== VoteResult.DID_NOT_VOTE) &&
      voting.votes.some(vote => vote.personId === otherPersonId && vote.vote !== VoteResult.DID_NOT_VOTE)
  );
  const equalVotes = relevantVotings.filter(voting => {
    const personVote = voting.votes.find(vote => vote.personId === personId)!;
    const otherPersonVote = voting.votes.find(vote => vote.personId === otherPersonId)!;
    return personVote.vote === otherPersonVote.vote;
  });
  return equalVotes.length / relevantVotings.length;
}


function calcVotingAttendance(sessions: SessionDetailsDto[], personId: string): number {

  const relevantSessions = sessions.filter(
    session => session.persons.some(sessionPerson => sessionPerson.id === personId)
  );
  const votingsAttended = relevantSessions
    .map(session =>
      session.votings.filter(
        voting => voting.votes.find(
          vote => vote.personId === personId && vote.vote !== VoteResult.DID_NOT_VOTE
        )
      ).length
    )
    .reduce((a, b) => a + b, 0);
  const votingsTotal = relevantSessions.flatMap(session => session.votings).length;

  return votingsAttended / votingsTotal;

}


function calcAbstentionStats(sessions: SessionDetailsDto[], personId: string): {
  abstentionCount: number,
  abstentionRate: number
} {

  const abstentions = sessions
    .map(session => {
      const attendedVotings = session.votings.filter(voting =>
        voting.votes.some(vote => vote.personId === personId && vote.vote !== VoteResult.DID_NOT_VOTE)
      );
      return attendedVotings.map(voting => {
        const personVoteResult = voting.votes.find(vote => vote.personId === personId)!.vote;
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


function calcStatsHistory(sessions: SessionDetailsDto[], personId: string): PersonStatsHistoryDto {

  return {
    votingAttendance: sessions.map(session => ({
      date: session.date,
      value: calcVotingAttendance(sessions.filter(s => s.date <= session.date), personId)
    })),
    votingSuccessRate: sessions.map(session => ({
      date: session.date,
      value: calcPersonVotingSuccess(sessions.filter(s => s.date <= session.date), personId).successRate
    })),
    abstentionRate: sessions.map(session => ({
      date: session.date,
      value: calcAbstentionStats(sessions.filter(s => s.date <= session.date), personId).abstentionRate
    }))
  };

}


function calcSpeakingTime(person: PersonDetailsDto): number {
  return person.speeches.reduce((totalTime, speech) => totalTime + speech.duration, 0);
}
