import { SessionInput } from '@srw-astro/models/session-input';
import { Registry, RegistryPerson, RegistrySession } from '@srw-astro/models/registry';
import { ScrapedSession } from '@srw-astro/models/scraped-session';
import { SessionDetailsDto, SessionPersonDto, SessionVotingDto, VoteResult } from '../shared/model/session.ts';


function getPersonsOfSession(parliamentPeriod: Registry, session: RegistrySession): RegistryPerson[] {

  const isPersonInSession = (person: RegistryPerson, session: RegistrySession): boolean => {
    const sessionDate = session.date;
    return (person.start === null || person.start <= sessionDate) && (person.end === null || person.end >= sessionDate);
  };

  return parliamentPeriod.persons.filter(person => isPersonInSession(person, session))
}


export class SessionsDataGenerator {


  public generateSessionsData(sessionsData: SessionInput[], registry: Registry,
                              scrapedSession: ScrapedSession): SessionDetailsDto[] {

    const scrapedStadtratMeetings = scrapedSession.meetings
      .filter(meeting => meeting.organization_name === 'Stadtrat')
      .map<{ date: string | null, original_id: number | null }>(meeting => ({
        date: meeting.start ? meeting.start.slice(0, 10) : null,
        original_id: meeting.original_id
      }));
    const scrapedAgendaItems = scrapedSession.agenda_items;
    const scrapedFiles = scrapedSession.files;

    const personIdsByNameMap =
      new Map(registry.persons.map(person => [person.name, person.id]));

    const factionsByIdMap = new Map(
      registry.factions.map(faction => [faction.id, faction])
    );

    const sessionDataMap = new Map(sessionsData.map(sessionData => [sessionData.session.id, sessionData]));

    return registry.sessions
      .filter(session => sessionDataMap.has(session.id))
      .map(session => {
        const scrapedStadtratMeeting = scrapedStadtratMeetings.find(
          meeting => meeting.date === session.date
        );
        if (!scrapedStadtratMeeting) {
          console.warn('No scraped meeting found for session', session.date);
        }

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
            const agendaItem = scrapedAgendaItems.find(
              agendaItem =>
                scrapedStadtratMeeting?.original_id &&
                agendaItem.key === `Ö ${voting.votingSubject.agendaItem}` &&
                agendaItem.meeting_id === scrapedStadtratMeeting.original_id
            );
            if (!agendaItem) {
              console.warn('No scraped agenda item found for voting', session.date, voting.votingSubject.agendaItem);
            }
            const scrapedPaperOriginalId = agendaItem?.paper_original_id;
            if (!scrapedPaperOriginalId) {
              console.warn('No scraped paper original id found for voting', session.date, voting.votingSubject.agendaItem);
            }
            const files = scrapedPaperOriginalId
              ? scrapedFiles.filter(file => file.paper_original_id === scrapedPaperOriginalId)
              : [];
            if (files.length === 0) {
              console.warn('No scraped file found for voting', session.date, voting.votingSubject.agendaItem);
            }

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
