import { SessionInput } from '@srw-astro/models/session-input';
import { Registry, RegistryPerson, RegistrySession } from '@srw-astro/models/registry';
import { SessionDetailsDto, SessionPersonDto, SessionVotingDto } from '../shared/model/session.ts';
import { type Voting } from './model.ts';
import { getVotingForFactions, getVoteResult } from './helpers.ts';


function getPersonsOfSession(parliamentPeriod: Registry, session: RegistrySession): RegistryPerson[] {

  const isPersonInSession = (person: RegistryPerson, session: RegistrySession): boolean => {
    const sessionDate = session.date;
    return (person.start === null || person.start <= sessionDate) && (person.end === null || person.end >= sessionDate);
  };

  return parliamentPeriod.persons.filter(person => isPersonInSession(person, session))
}


export class SessionsDataGenerator {


  public generateVotingsImageData(registry: Registry, sessionsInput: SessionInput[]): Voting[] {

    const personIdsByNameMap = new Map(
      registry.persons.map(person => [person.name, person.id])
    );

    const factionNamesByIdMap = new Map(
      registry.factions.map(faction => [faction.id, faction.name])
    );

    const factionNames = registry.factions
      .toSorted((a, b) => b.seats - a.seats)
      .map(faction => faction.name);

    return sessionsInput
      .map<SessionDetailsDto>(sessionInput => ({
        id: sessionInput.session.id,
        date: sessionInput.session.date,
        persons: getPersonsOfSession(registry, sessionInput.session).map<SessionPersonDto>(person => ({
          id: person.id,
          faction: factionNamesByIdMap.get(person.factionId) || '',
        })),
        votings: sessionInput.votings.map<SessionVotingDto>(voting => ({
          id: +voting.votingFilename.substring(11, 14),
          votingSubject: {
            motionId: voting.votingSubject.motionId,
            title: voting.votingSubject.title,
            type: voting.votingSubject.type || 'Sonstige',
          },
          votes: voting.votes.map(vote => ({
            personId: personIdsByNameMap.get(vote.name) || '',
            vote: getVoteResult(vote.vote)
          })),
        }))
      }))
      .flatMap(session =>
        session.votings.map<Voting>(sessionVoting => ({
          sessionId: session.id,
          votingId: sessionVoting.id,
          date: session.date,
          motionType: sessionVoting.votingSubject.type,
          motionId: sessionVoting.votingSubject.motionId,
          subjectTitle: sessionVoting.votingSubject.title,
          votes: getVotingForFactions(sessionVoting, factionNames, session.persons)
        }))
      );

  }


}
