import { type SessionInput } from '@srw-astro/models/session-input';
import { type Registry } from '@srw-astro/models/registry';
import { type Voting } from './model.ts';
import { getVotingForFactions, getVoteResult } from './helpers.ts';
import { type Vote } from '../shared/model/session.ts';
import { getPersonsOfSession } from './helpers.ts';


export class VotingsImageDataGenerator {


  public generateVotingsImageData(parliamentPeriod: Registry, sessionsInput: SessionInput[]): Voting[] {

    return sessionsInput.flatMap(sessionInput => {

      const sessionId = sessionInput.session.id;
      const factions = parliamentPeriod.factions;
      const date = sessionInput.session.date;
      const persons = getPersonsOfSession(parliamentPeriod, date);

      return sessionInput.votings.map<Voting>(sessionVoting => {
        const allVotes = sessionVoting.votes.map<Vote>(vote => ({
          personId: persons.find(p => p.name === vote.name)?.id || '',
          vote: getVoteResult(vote.vote)
        }));
        const votes = getVotingForFactions(allVotes, factions, persons);
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
