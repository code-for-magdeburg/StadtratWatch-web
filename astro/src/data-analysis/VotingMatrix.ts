import type { Registry, RegistryPerson } from '../model/registry.ts';
import type { SessionScanItem } from '../model/session-scan.ts';
import type { SessionInput } from '../model/SessionInput.ts';
import { VoteResult } from '../model/Session.ts';


export function calcVotingMatrix(electoralPeriod: Registry, person: RegistryPerson, sessions: SessionInput[]): any {

  const otherPersons = electoralPeriod.persons.filter(otherPerson => otherPerson.name !== person.name);
  const votings = sessions.flatMap(session => session.votings);

  return otherPersons.map(otherPerson => ({
    personId: otherPerson.id,
    personName: otherPerson.name,
    faction: electoralPeriod.factions.find(faction => faction.id === otherPerson.factionId)?.name || '',
    party: electoralPeriod.parties.find(party => party.id === otherPerson.partyId)?.name || '',
    comparisonScore: calcVotingComparisonScore(votings, person, otherPerson)
  }));

}


function calcVotingComparisonScore(votings: SessionScanItem[], person: RegistryPerson, otherPerson: RegistryPerson): number {

  const relevantVotings = votings.filter(
    voting =>
      voting.votes.some(vote => vote.name === person.name && vote.vote !== VoteResult.DID_NOT_VOTE) &&
      voting.votes.some(vote => vote.name === otherPerson.name && vote.vote !== VoteResult.DID_NOT_VOTE)
  );
  const equalVotes = relevantVotings.filter(voting => {
    const personVote = voting.votes.find(vote => vote.name === person.name)!;
    const otherPersonVote = voting.votes.find(vote => vote.name === otherPerson.name)!;
    return personVote.vote === otherPersonVote.vote;
  });

  return equalVotes.length / relevantVotings.length;

}
