import { PartyDto } from '../../app/model/Party';
import * as fs from 'fs';
import { PARTIES_BASE_DIR } from './constants';
import { Registry, RegistryParty, RegistryPerson } from './model/registry';
import {
  SessionDetailsDto,
  SessionPersonDto,
  SessionVotingDto,
  VoteResult,
  VotingResult
} from '../../app/model/Session';


export function generatePartyFiles(registry: Registry, sessions: SessionDetailsDto[]) {

  console.log('Writing all-parties.json');
  const parties = registry.parties.map<PartyDto>(party => {
    const members = registry.persons.filter(person => person.partyId === party.id);
    const votingsSuccessRate = calcVotingsSuccessRate(members, sessions);
    const uniformityScore = calcUniformityScore(members, sessions) || 0;
    const participationRate = calcParticipationRate(party, sessions) || 0;
    const abstentionRate = calcAbstentionRate(members, sessions) || 0;
    return {
      id: party.id,
      name: party.name,
      seats: party.seats,
      votingsSuccessRate,
      uniformityScore,
      participationRate,
      abstentionRate,
    };
  });
  fs.writeFileSync(
    `${PARTIES_BASE_DIR}/all-parties.json`,
    JSON.stringify(parties, null, 2),
    'utf-8'
  );

  parties.forEach(party => {
    console.log(`Writing party file ${party.id}.json`);
    const data = JSON.stringify(party, null, 2);
    fs.writeFileSync(`${PARTIES_BASE_DIR}/${party.id}.json`, data, 'utf-8');
  });

}


function calcVotingsSuccessRate(partyMembers: RegistryPerson[], sessions: SessionDetailsDto[]): number {

  const allVotings = sessions.map(session => session.votings).flat();
  if (allVotings.length === 0) {
    return 0;
  }

  const relevantVotingsResults = allVotings
    .map(voting => {

      const partyVotes = voting.votes.filter(
        vote => partyMembers.some(member => member.id === vote.personId)
      );
      const votedFor = partyVotes.filter(vote => vote.vote === VoteResult.VOTE_FOR);
      const votedAgainst = partyVotes.filter(vote => vote.vote === VoteResult.VOTE_AGAINST);

      const partyResult = votedFor.length > votedAgainst.length
        ? VotingResult.PASSED
        : VotingResult.REJECTED;

      return { totalPartyVotes: partyVotes.length, votingResult: voting.votingResult, partyResult: partyResult };

    })
    .filter(voting => voting.totalPartyVotes > 0);

  const partySuccessfulVotings = relevantVotingsResults.filter(
    voting => voting.votingResult === voting.partyResult
  );

  return partySuccessfulVotings.length / relevantVotingsResults.length;

}


function calcUniformityScore(partyMembers: RegistryPerson[], sessions: SessionDetailsDto[]): number | null {
  const uniformityScoresPerSession = sessions
    .map(session => calcUniformityScoreForSession(partyMembers, session))
    .filter(score => score !== null) as number[];

  if (uniformityScoresPerSession.length === 0) {
    return null;
  }

  return uniformityScoresPerSession.reduce((a, b) => a + b, 0) / uniformityScoresPerSession.length;
}


function calcUniformityScoreForSession(partyMembers: RegistryPerson[], session: SessionDetailsDto): number | null {
  const relevantPartyMembers = partyMembers.filter(
    member => session.persons.some(person => person.id === member.id)
  );
  const uniformityScorePerVoting = session.votings
    .map(voting => calcUniformityScoreForVoting(relevantPartyMembers, voting))
    .filter(score => score !== null) as number[];

  if (uniformityScorePerVoting.length === 0) {
    return null;
  }

  return uniformityScorePerVoting.reduce((a, b) => a + b, 0) / uniformityScorePerVoting.length;
}


function calcUniformityScoreForVoting(partyMembers: RegistryPerson[], voting: SessionVotingDto): number | null {

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


function calcParticipationRate(party: RegistryParty, sessions: SessionDetailsDto[]): number | null {

  const votesPerSession = sessions.map(session => countVotesInSession(party, session));
  const votes = votesPerSession.reduce((a, b) => a + b, 0);

  const totalVotesPerSession = sessions.map(session => session.votings.length * party.seats);
  const totalVotes = totalVotesPerSession.reduce((a, b) => a + b, 0);

  return totalVotes === 0 ? null : votes / totalVotes;

}


function countVotesInSession(party: RegistryParty, session: SessionDetailsDto): number {

  const partyMembers = session.persons.filter(person => person.party === party.name);
  const participationPerVoting = session.votings.map(
    voting => countVotesInVoting(partyMembers, voting)
  );

  return participationPerVoting.reduce((a, b) => a + b, 0);

}


function countVotesInVoting(partyMembers: SessionPersonDto[], voting: SessionVotingDto): number {
  return voting.votes
    .filter(
      vote => partyMembers.some(member => member.id === vote.personId)
        && vote.vote !== VoteResult.DID_NOT_VOTE)
    .length;
}


function calcAbstentionRate(partyMembers: RegistryPerson[], sessions: SessionDetailsDto[]): number {
  const abstentionRatePerSession = sessions
    .map(session => calcAbstentionRateForSession(partyMembers, session))
    .filter(rate => rate !== null) as number[];

  if (abstentionRatePerSession.length === 0) {
    return 0;
  }

  return abstentionRatePerSession.reduce((a, b) => a + b, 0) / abstentionRatePerSession.length;
}


function calcAbstentionRateForSession(partyMembers: RegistryPerson[], session: SessionDetailsDto): number {
  const abstentionRatePerVoting = session.votings
    .map(voting => calcAbstentionRateForVoting(partyMembers, voting))
    .filter(rate => rate !== null) as number[];

  if (abstentionRatePerVoting.length === 0) {
    return 0;
  }

  return abstentionRatePerVoting.reduce((a, b) => a + b, 0) / abstentionRatePerVoting.length;
}


function calcAbstentionRateForVoting(partyMembers: RegistryPerson[], voting: SessionVotingDto): number {
  const allVotes = voting.votes.filter(vote =>
    partyMembers.some(member => member.id === vote.personId) && vote.vote !== VoteResult.DID_NOT_VOTE
  );
  const abstentions = allVotes.filter(vote => vote.vote === VoteResult.VOTE_ABSTENTION);

  if (allVotes.length === 0) {
    return 0;
  }

  return abstentions.length / allVotes.length;
}
