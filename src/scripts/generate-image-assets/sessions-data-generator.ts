import { type SessionInput } from '@srw-astro/models/session-input';
import { type Registry } from '@srw-astro/models/registry';
import { type Voting } from './model.ts';
import { getVotingForFactions, getVoteResult } from './helpers.ts';
import { type Vote } from '../shared/model/session.ts';
import { getPersonsOfSession } from './helpers.ts';


export class SessionsDataGenerator {


  public generateVotingsImageData(registry: Registry, sessionsInput: SessionInput[]): Voting[] {

    const personIdsByNameMap = new Map(
      registry.persons.map(person => [person.name, person.id])
    );

    return sessionsInput.flatMap(sessionInput => {
      const persons = getPersonsOfSession(registry, sessionInput.session);
      return sessionInput.votings.map<Voting>(sessionVoting => {
        const allVotes = sessionVoting.votes.map<Vote>(vote => ({
          personId: personIdsByNameMap.get(vote.name) || '',
          vote: getVoteResult(vote.vote)
        }));
        return {
          sessionId: sessionInput.session.id,
          votingId: +sessionVoting.votingFilename.substring(11, 14),
          date: sessionInput.session.date,
          motionType: sessionVoting.votingSubject.type || 'Sonstige',
          motionId: sessionVoting.votingSubject.motionId,
          subjectTitle: sessionVoting.votingSubject.title,
          votes: getVotingForFactions(allVotes, registry.factions, persons)
        };
      });
    });

  }


}
