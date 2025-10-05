import { SessionVotingDto, SessionPersonDto, VoteResult } from '../shared/model/session.ts';
import type { VotingPerFaction } from './model.ts';


export function getVotingForFactions(sessionVoting: SessionVotingDto, factionNames: string[],
  persons: SessionPersonDto[]): VotingPerFaction[] {

  return factionNames.map(faction => {

    const factionPersons = persons.filter(person => person.faction === faction);
    const votesFor = sessionVoting.votes.filter(
      vote => vote.vote === 'J' && factionPersons.some(person => person.id === vote.personId)
    ).length;
    const votesAgainst = sessionVoting.votes.filter(
      vote => vote.vote === 'N' && factionPersons.some(person => person.id === vote.personId)
    ).length;
    const abstentions = sessionVoting.votes.filter(
      vote => vote.vote === 'E' && factionPersons.some(person => person.id === vote.personId)
    ).length;
    const notVoted = sessionVoting.votes.filter(
      vote => vote.vote === 'O' && factionPersons.some(person => person.id === vote.personId)
    ).length;

    return { faction, votesFor, votesAgainst, abstentions, notVoted };

  });

}


export function getVoteResult(vote: string): VoteResult {
  return vote === 'J'
    ? VoteResult.VOTE_FOR
    : vote === 'N'
      ? VoteResult.VOTE_AGAINST
      : vote === 'E'
        ? VoteResult.VOTE_ABSTENTION
        : VoteResult.DID_NOT_VOTE;
}
