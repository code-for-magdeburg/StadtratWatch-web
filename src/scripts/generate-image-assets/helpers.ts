import { SessionPersonDto, VoteResult } from '../shared/model/session.ts';
import type { VotingPerFaction } from './model.ts';
import type { Vote } from '../shared/model/session.ts';
import { Registry, RegistryPerson, RegistrySession } from '@srw-astro/models/registry';


export function getPersonsOfSession(parliamentPeriod: Registry, session: RegistrySession): RegistryPerson[] {

  const isPersonInSession = (person: RegistryPerson, session: RegistrySession): boolean => {
    const sessionDate = session.date;
    return (person.start === null || person.start <= sessionDate) && (person.end === null || person.end >= sessionDate);
  };

  return parliamentPeriod.persons.filter(person => isPersonInSession(person, session))

}


export function getVotingForFactions(votes: Vote[], factionNames: string[],
  persons: SessionPersonDto[]): VotingPerFaction[] {

  return factionNames.map(faction => {

    const factionPersons = persons.filter(person => person.faction === faction);
    const votesFor = votes.filter(
      vote => vote.vote === 'J' && factionPersons.some(person => person.id === vote.personId)
    ).length;
    const votesAgainst = votes.filter(
      vote => vote.vote === 'N' && factionPersons.some(person => person.id === vote.personId)
    ).length;
    const abstentions = votes.filter(
      vote => vote.vote === 'E' && factionPersons.some(person => person.id === vote.personId)
    ).length;
    const notVoted = votes.filter(
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
