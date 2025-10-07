import type { SessionInput } from '@srw-astro/models/session-input';
import type { Registry, RegistryPerson, RegistryFaction } from '@srw-astro/models/registry';
import type { Voting, VotingPerFaction } from './model.ts';
import { type Vote, VoteResult } from '../shared/model/session.ts';


function getPersonsOfSession(persons: RegistryPerson[], sessionDate: string): RegistryPerson[] {
  return persons.filter(person =>
    (person.start === null || person.start <= sessionDate)
    && (person.end === null || person.end >= sessionDate)
  );
}


function getVotingForFactions(votes: Vote[], factions: RegistryFaction[],
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


function getVoteResult(vote: string): VoteResult {
  return vote === 'J'
    ? VoteResult.VOTE_FOR
    : vote === 'N'
      ? VoteResult.VOTE_AGAINST
      : vote === 'E'
        ? VoteResult.VOTE_ABSTENTION
        : VoteResult.DID_NOT_VOTE;
}


export class VotingsImageDataGenerator {


  public generateVotingsImageData(parliamentPeriod: Registry, sessionsInput: SessionInput[]): Voting[] {

    const { persons, factions } = parliamentPeriod;

    return sessionsInput.flatMap(sessionInput => {

      const sessionId = sessionInput.session.id;
      const date = sessionInput.session.date;
      const personsOfSession = getPersonsOfSession(persons, date);

      return sessionInput.votings.map<Voting>(sessionVoting => {
        const allVotes = sessionVoting.votes.map<Vote>(vote => ({
          personId: personsOfSession.find(p => p.name === vote.name)?.id || '',
          vote: getVoteResult(vote.vote)
        }));
        const votes = getVotingForFactions(allVotes, factions, personsOfSession);
        return {
          sessionId,
          votingId: +sessionVoting.votingFilename.substring(11, 14),
          date,
          motionType: sessionVoting.votingSubject.type || 'Sonstige',
          motionId: sessionVoting.votingSubject.motionId,
          subjectTitle: sessionVoting.votingSubject.title,
          votes
        };
      });

    });

  }


}
