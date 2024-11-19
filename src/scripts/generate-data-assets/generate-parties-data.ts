import { PartyDto, PartyStatsHistoryDto } from '../../interfaces/Party';
import { Registry, RegistryParty, RegistryPerson } from '../shared/model/registry';
import { SessionDetailsDto, SessionPersonDto, SessionVotingDto, VoteResult } from '../../interfaces/Session';
import { calcPartyVotingSuccessRate } from './data-analysis/voting-success-rate';


export type GeneratedPartiesData = {
  parties: PartyDto[];
};


export function generatePartiesData(registry: Registry, sessions: SessionDetailsDto[]): GeneratedPartiesData {

  const parties = registry.parties.map<PartyDto>(party => {
    const members = registry.persons.filter(person => person.partyId === party.id);
    const votingsSuccessRate = calcPartyVotingSuccessRate(party.id, sessions);
    const uniformityScore = calcUniformityScore(members, sessions) || 0;
    const participationRate = calcParticipationRate(party, sessions) || 0;
    const abstentionRate = calcAbstentionRate(members, sessions) || 0;
    const speakingTime = calcSpeakingTime(members, sessions) || 0;
    return {
      id: party.id,
      name: party.name,
      seats: party.seats,
      votingsSuccessRate,
      uniformityScore,
      participationRate,
      abstentionRate,
      speakingTime,
      statsHistory: calcStatsHistory(party, members, sessions)
    };
  });

  return { parties };

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


function calcStatsHistory(party: RegistryParty, partyMembers: RegistryPerson[],
                          sessions: SessionDetailsDto[]): PartyStatsHistoryDto {

  return {
    votingsSuccessRate: sessions.map(session => ({
      date: session.date,
      value: calcPartyVotingSuccessRate(party.id, sessions.filter(s => s.date <= session.date))
    })),
    uniformityScore: sessions.map(session => ({
      date: session.date,
      value: calcUniformityScore(partyMembers, sessions.filter(s => s.date <= session.date))
    })),
    participationRate: sessions.map(session => ({
      date: session.date,
      value: calcParticipationRate(party, sessions.filter(s => s.date <= session.date))
    })),
    abstentionRate: sessions.map(session => ({
      date: session.date,
      value: calcAbstentionRate(partyMembers, sessions.filter(s => s.date <= session.date))
    }))
  };

}


function calcSpeakingTime(partyMembers: RegistryPerson[], sessions: SessionDetailsDto[]): number {
  return sessions
    .map(session => calcSpeakingTimeForSession(partyMembers, session))
    .reduce((a, b) => a + b, 0);
}


function calcSpeakingTimeForSession(partyMembers: RegistryPerson[], session: SessionDetailsDto): number {

  const partySpeeches = session.speeches.filter(speakingTime =>
    partyMembers.some(member => member.name === speakingTime.speaker)
  );

  return partySpeeches.reduce((a, b) => a + b.duration, 0);

}
