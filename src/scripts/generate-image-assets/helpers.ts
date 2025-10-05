import { Vote, VoteResult } from '../shared/model/session.ts';
import type { VotingPerFaction } from './model.ts';
import type { Registry, RegistryFaction, RegistryPerson, RegistrySession } from '@srw-astro/models/registry';


export function getPersonsOfSession(parliamentPeriod: Registry, session: RegistrySession): RegistryPerson[] {

  const isPersonInSession = (person: RegistryPerson, session: RegistrySession): boolean => {
    const sessionDate = session.date;
    return (person.start === null || person.start <= sessionDate) && (person.end === null || person.end >= sessionDate);
  };

  return parliamentPeriod.persons.filter(person => isPersonInSession(person, session))

}


export function getVotingForFactions(votes: Vote[], factions: RegistryFaction[],
                                     persons: RegistryPerson[]): VotingPerFaction[] {

  return factions.map(faction => {

    const factionPersons = persons.filter(person => person.factionId === faction.id);
    const votesFor = votes.filter(
      vote => vote.vote === VoteResult.VOTE_FOR && factionPersons.some(person => person.id === vote.personId)
    ).length;
    const votesAgainst = votes.filter(
      vote => vote.vote === VoteResult.VOTE_AGAINST && factionPersons.some(person => person.id === vote.personId)
    ).length;
    const abstentions = votes.filter(
      vote => vote.vote === VoteResult.VOTE_ABSTENTION && factionPersons.some(person => person.id === vote.personId)
    ).length;
    const notVoted = votes.filter(
      vote => vote.vote === VoteResult.DID_NOT_VOTE && factionPersons.some(person => person.id === vote.personId)
    ).length;

    return { faction: faction.name, votesFor, votesAgainst, abstentions, notVoted };

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
