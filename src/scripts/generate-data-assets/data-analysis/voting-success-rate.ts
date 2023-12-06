import {
  SessionDetailsDto,
  SessionPersonDto,
  SessionVotingDto,
  VoteResult,
  VotingResult
} from '../../../app/model/Session';
import { RegistryPerson } from '../model/registry';


type VotingsSuccessForSession = {
  successfulVotings: number;
  totalVotings: number;
};

type PersonVotingSuccessStats = {
  successCount: number;
  successRate: number | null;
};


export function calcFractionVotingSuccessRate(fractionId: string, sessions: SessionDetailsDto[]): number {

  const votingsSuccessPerSession = sessions.map(
    session => calcFractionVotingSuccessForSession(fractionId, session)
  );

  const successfulVotings = votingsSuccessPerSession.reduce((a, b) => a + b.successfulVotings, 0);
  const totalVotings = votingsSuccessPerSession.reduce((a, b) => a + b.totalVotings, 0);

  return totalVotings === 0 ? 0 : successfulVotings / totalVotings;

}


function calcFractionVotingSuccessForSession(fractionId: string, session: SessionDetailsDto): VotingsSuccessForSession {

  const fraction = session.fractions.find(
    fraction => fraction.id === fractionId
  );
  if (!fraction) {
    return { successfulVotings: 0, totalVotings: session.votings.length };
  }

  const fractionMembers = session.persons.filter(
    person => person.fraction === fraction.name
  );
  const successfulVotings = session.votings
    .filter(voting => calcVotingSuccess(fractionMembers, voting))
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


export function calcPersonVotingSuccess(sessions: SessionDetailsDto[], person: RegistryPerson): PersonVotingSuccessStats {

  const votingSuccess = sessions
    .flatMap(session => session.votings)
    .filter(voting =>
      // TODO: To be decided => Different results if the abstentions are counted as success or not
      //  or if the they are not counted at all
      voting.votes.some(vote => vote.personId === person.id && vote.vote !== VoteResult.DID_NOT_VOTE)
    )
    .map(voting => {
      const personVote = voting.votes.find(vote => vote.personId === person.id)!.vote;
      return personVote === VoteResult.VOTE_FOR && voting.votingResult === VotingResult.PASSED
        || personVote === VoteResult.VOTE_AGAINST && voting.votingResult === VotingResult.REJECTED;
    });

  if (votingSuccess.length === 0) {
    return { successCount: 0, successRate: null };
  }

  const successCount = votingSuccess
    .map(success => success ? 1 : 0)
    .reduce<number>((a, b) => a + b, 0);
  const successRate = successCount / votingSuccess.length;

  return { successCount, successRate };

}
