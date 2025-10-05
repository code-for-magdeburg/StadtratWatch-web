import { SessionInput } from '@srw-astro/models/session-input';
import { Registry, RegistryPerson, RegistrySession } from '@srw-astro/models/registry';
import { SessionDetailsDto, SessionPersonDto, SessionVotingDto, VoteResult } from '../shared/model/session.ts';


function getPersonsOfSession(parliamentPeriod: Registry, session: RegistrySession): RegistryPerson[] {

  const isPersonInSession = (person: RegistryPerson, session: RegistrySession): boolean => {
    const sessionDate = session.date;
    return (person.start === null || person.start <= sessionDate) && (person.end === null || person.end >= sessionDate);
  };

  return parliamentPeriod.persons.filter(person => isPersonInSession(person, session))
}


export class SessionsDataGenerator {


  public generateSessionsData(sessionsData: SessionInput[], registry: Registry): SessionDetailsDto[] {

    const personIdsByNameMap =
      new Map(registry.persons.map(person => [person.name, person.id]));

    const factionsByIdMap = new Map(
      registry.factions.map(faction => [faction.id, faction])
    );

    const sessionDataMap = new Map(sessionsData.map(sessionData => [sessionData.session.id, sessionData]));

    return registry.sessions
      .filter(session => sessionDataMap.has(session.id))
      .map(session => {

        const sessionData = sessionDataMap.get(session.id)!;
        const sessionScan = sessionData.votings;

        return {
          id: session.id,
          date: session.date,
          persons: getPersonsOfSession(registry, session).map<SessionPersonDto>(person => ({
            id: person.id,
            faction: factionsByIdMap.get(person.factionId)?.name || '',
          })),
          votings: sessionScan.map<SessionVotingDto>(voting => {

            return {
              id: +voting.votingFilename.substring(11, 14),
              votingSubject: {
                motionId: voting.votingSubject.motionId,
                title: voting.votingSubject.title,
                type: voting.votingSubject.type || 'Sonstige',
              },
              votes: voting.votes.map(vote => ({
                personId: personIdsByNameMap.get(vote.name) || '',
                vote: this.getVoteResult(vote.vote)
              })),
            };
          })
        } satisfies SessionDetailsDto;
      });

  }


  private getVoteResult(vote: string): VoteResult {
    return vote === 'J'
      ? VoteResult.VOTE_FOR
      : vote === 'N'
        ? VoteResult.VOTE_AGAINST
        : vote === 'E'
          ? VoteResult.VOTE_ABSTENTION
          : VoteResult.DID_NOT_VOTE;
  }


}
