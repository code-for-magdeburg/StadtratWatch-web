import {
  SessionDetailsDto,
  SessionPersonDto,
  SessionVotingDto,
  VoteResult,
  VotingResult
} from '../../../interfaces/Session';


type VotingsSuccessForSession = {
  successfulVotings: number;
  totalVotings: number;
};

type PersonVotingSuccessStats = {
  successCount: number;
  successRate: number;
};


export function calcFactionVotingSuccessRate(factionId: string, sessions: SessionDetailsDto[]): number {

  const votingsSuccessPerSession = sessions.map(
    session => calcFactionVotingSuccessForSession(factionId, session)
  );

  const successfulVotings = votingsSuccessPerSession.reduce((a, b) => a + b.successfulVotings, 0);
  const totalVotings = votingsSuccessPerSession.reduce((a, b) => a + b.totalVotings, 0);

  return totalVotings === 0 ? 0 : successfulVotings / totalVotings;

}


function calcFactionVotingSuccessForSession(factionId: string, session: SessionDetailsDto): VotingsSuccessForSession {

  const faction = session.factions.find(
    faction => faction.id === factionId
  );
  if (!faction) {
    return { successfulVotings: 0, totalVotings: session.votings.length };
  }

  const factionMembers = session.persons.filter(
    person => person.faction === faction.name
  );
  const successfulVotings = session.votings
    .filter(voting => calcVotingSuccess(factionMembers, voting))
    .length;

  return { successfulVotings, totalVotings: session.votings.length };

}


export function calcPartyVotingSuccessRate(partyId: string, sessions: SessionDetailsDto[]): number {

  const votingsSuccessPerSession = sessions.map(
    session => calcPartyVotingSuccessForSession(partyId, session)
  );

  const successfulVotings = votingsSuccessPerSession.reduce((a, b) => a + b.successfulVotings, 0);
  const totalVotings = votingsSuccessPerSession.reduce((a, b) => a + b.totalVotings, 0);

  return totalVotings === 0 ? 0 : successfulVotings / totalVotings;

}


function calcPartyVotingSuccessForSession(partyId: string, session: SessionDetailsDto): VotingsSuccessForSession {

  const party = session.parties.find(party => party.id === partyId);
  if (!party) {
    return { successfulVotings: 0, totalVotings: session.votings.length };
  }

  const partyMembers = session.persons.filter(
    person => person.party === party.name
  );
  const successfulVotings = session.votings
    .filter(voting => calcVotingSuccess(partyMembers, voting))
    .length;

  return { successfulVotings, totalVotings: session.votings.length };

}


function calcVotingSuccess(persons: SessionPersonDto[], voting: SessionVotingDto): boolean {

  const votes = voting.votes.filter(vote =>
    persons.some(person => person.id === vote.personId) && vote.vote !== VoteResult.DID_NOT_VOTE
  );
  const votedFor = votes.filter(vote => vote.vote === VoteResult.VOTE_FOR).length;
  const votedAgainst = votes.filter(vote => vote.vote === VoteResult.VOTE_AGAINST).length;

  return votes.length > 0
    && (
      (votedFor > votedAgainst && voting.votingResult === VotingResult.PASSED) ||
      (votedFor <= votedAgainst && voting.votingResult === VotingResult.REJECTED)
    );

}


export function calcPersonVotingSuccess(sessions: SessionDetailsDto[], personId: string): PersonVotingSuccessStats {

  const votingSuccess = sessions
    .flatMap(session => session.votings)
    .filter(voting =>
      // TODO: To be decided => Different results if the abstentions are counted as success or not
      //  or if the they are not counted at all
      voting.votes.some(vote => vote.personId === personId && vote.vote !== VoteResult.DID_NOT_VOTE)
    )
    .map(voting => {
      const personVote = voting.votes.find(vote => vote.personId === personId)!.vote;
      return personVote === VoteResult.VOTE_FOR && voting.votingResult === VotingResult.PASSED
        || personVote === VoteResult.VOTE_AGAINST && voting.votingResult === VotingResult.REJECTED;
    });

  if (votingSuccess.length === 0) {
    return { successCount: 0, successRate: 0 };
  }

  const successCount = votingSuccess
    .map(success => success ? 1 : 0)
    .reduce<number>((a, b) => a + b, 0);
  const successRate = successCount / votingSuccess.length;

  return { successCount, successRate };

}
