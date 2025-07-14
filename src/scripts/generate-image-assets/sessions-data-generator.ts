import { SessionInput } from '@srw-astro/models/session-input';
import { Registry, RegistryFaction, RegistryPerson, RegistrySession } from '@srw-astro/models/registry';
import { ScrapedSession } from '@srw-astro/models/scraped-session';
import { SessionDetailsDto, SessionLightDto, SessionPersonDto, SessionSpeechDto, SessionVotingDto, VoteResult, VotingResult } from '@srw-astro/models/session';
import { SessionScanVote } from '@srw-astro/models/session-scan';


export type GeneratedSessionsData = {
  sessions: SessionDetailsDto[];
  sessionsLight: SessionLightDto[];
};


function isPersonInSession (person: RegistryPerson, session: RegistrySession): boolean {
  const sessionDate = session.date;
  return (person.start === null || person.start <= sessionDate) && (person.end === null || person.end >= sessionDate);
}

function getPersonsOfSession(parliamentPeriod: Registry, session: RegistrySession): RegistryPerson[] {
  return parliamentPeriod.persons.filter(person => isPersonInSession(person, session))
}

function getPersonByName(parliamentPeriod: Registry, session: RegistrySession,
                         personName: string): RegistryPerson | null {
  return getPersonsOfSession(parliamentPeriod, session).find(person => person.name === personName) || null;
}

function getFactionOfPerson(parliamentPeriod: Registry, session: RegistrySession,
                            person: RegistryPerson): RegistryFaction | null {
  return parliamentPeriod.factions.find(
    faction => faction.id === person.factionId && isPersonInSession(person, session)
  ) || null;
}


export class SessionsDataGenerator {


  public generateSessionsData(sessionsData: SessionInput[], registry: Registry,
                              scrapedSession: ScrapedSession): GeneratedSessionsData {

    const scrapedStadtratMeetings = scrapedSession.meetings
      .filter(meeting => meeting.organization_name === 'Stadtrat')
      .map<{ date: string | null, original_id: number | null }>(meeting => ({
        date: meeting.start ? meeting.start.slice(0, 10) : null,
        original_id: meeting.original_id
      }));
    const scrapedAgendaItems = scrapedSession.agenda_items;
    const scrapedPapers = scrapedSession.papers;
    const scrapedFiles = scrapedSession.files;

    const personIdsByNameMap =
      new Map(registry.persons.map(person => [person.name, person.id]));

    const factionsByIdMap = new Map(
      registry.factions.map(faction => [faction.id, faction])
    );
    const factions = Array.from(factionsByIdMap.values());

    const partiesByIdMap = new Map(
      registry.parties.map(party => [party.id, party])
    );
    const parties = Array.from(partiesByIdMap.values());

    const sessionDataMap = new Map(sessionsData.map(sessionData => [sessionData.session.id, sessionData]));

    const sessions = registry.sessions
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
        const sessionSpeeches = sessionData.speeches;

        return {
          id: session.id,
          date: session.date,
          meetingMinutesUrl: session.meetingMinutesUrl,
          youtubeUrl: session.youtubeUrl,
          factions,
          parties,
          persons: getPersonsOfSession(registry, session).map<SessionPersonDto>(person => ({
            id: person.id,
            name: person.name,
            party: partiesByIdMap.get(person.partyId)?.name || '',
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
            const paper = scrapedPaperOriginalId
              ? scrapedPapers.find(paper => paper.original_id === scrapedPaperOriginalId) || null
              : null;
            const files = scrapedPaperOriginalId
              ? scrapedFiles.filter(file => file.paper_original_id === scrapedPaperOriginalId)
              : [];
            if (files.length === 0) {
              console.warn('No scraped file found for voting', session.date, voting.votingSubject.agendaItem);
            }

            return {
              id: +voting.votingFilename.substring(11, 14),
              videoTimestamp: this.convertVideoTimestampToSeconds(voting.videoTimestamp),
              votingSubject: {
                agendaItem: voting.votingSubject.agendaItem,
                applicationId: voting.votingSubject.applicationId,
                title: voting.votingSubject.title,
                type: voting.votingSubject.type || 'Sonstige',
                authors: voting.votingSubject.authors,
                paperId: paper?.original_id || null
              },
              votes: voting.votes.map(vote => ({
                personId: personIdsByNameMap.get(vote.name) || '',
                vote: this.getVoteResult(vote.vote)
              })),
              votingResult: this.getVotingResult(voting.votes)
            };
          }),
          speeches: sessionSpeeches
            .filter(sessionSpeech => !sessionSpeech.isChairPerson)
            .map(sessionSpeech => {
              const person = getPersonByName(registry, session, sessionSpeech.speaker);
              const faction = person ? getFactionOfPerson(registry, session, person)?.name || '' : '';
              return {
                speaker: sessionSpeech.speaker,
                start: sessionSpeech.start,
                duration: sessionSpeech.duration,
                faction,
                onBehalfOf: sessionSpeech.onBehalfOf,
                transcription: sessionSpeech.transcription
              } satisfies SessionSpeechDto;
            })
        } satisfies SessionDetailsDto;
      });

    const sessionsLight = sessions.map(session => ({
      id: session.id,
      date: session.date,
      votingsCount: session.votings.length || 0,
      speechesCount: session.speeches.length || 0,
      totalSpeakingTime: session.speeches.reduce((total, speech) => total + speech.duration, 0) || 0
    }));

    return { sessions, sessionsLight };

  }


  private convertVideoTimestampToSeconds(videoTimestamp: string): number {

    const timeParts = videoTimestamp.split(':');
    switch (timeParts.length) {
      case 1:
        return parseInt(timeParts[0] || '0');
      case 2:
        return parseInt(timeParts[0] || '0') * 60 + parseInt(timeParts[1] || '0');
      case 3:
        return parseInt(timeParts[0] || '0') * 3600 + parseInt(timeParts[1] || '0') * 60 + parseInt(timeParts[2] || '0');
      default:
        return 0;
    }

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


  private getVotingResult(votes: SessionScanVote[]): VotingResult {
    const votedFor = votes.filter(vote => vote.vote === VoteResult.VOTE_FOR).length;
    const votedAgainst = votes.filter(vote => vote.vote === VoteResult.VOTE_AGAINST).length;
    return votedFor > votedAgainst ? VotingResult.PASSED : VotingResult.REJECTED;
  }


}
