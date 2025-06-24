import { SessionInput } from '@srw-astro/models/session-input';
import { Registry } from '@srw-astro/models/registry';
import { ScrapedSession } from '@srw-astro/models/scraped-session';
import { SessionDetailsDto, SessionFactionDto, SessionLightDto, SessionPartyDto, SessionPersonDto, SessionSpeechDto, SessionVotingDto, VoteResult, VotingResult } from '@srw-astro/models/session';
import { SessionVote } from '@srw-astro/models/session-scan';


export type GeneratedSessionsData = {
  sessions: SessionDetailsDto[];
  sessionsLight: SessionLightDto[];
};


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

    const factionsByNameMap =
      new Map(registry.factions.map(faction => [faction.name, faction.id]));

    const partiesByNameMap =
      new Map(registry.parties.map(party => [party.name, party.id]));

    const sessionDataMap = new Map(sessionsData.map(sessionData => [sessionData.sessionId, sessionData]));

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
        const sessionConfig = sessionData.config;
        const sessionScan = sessionData.votings;
        const sessionSpeeches = sessionData.speeches;

        const sessionFactionNames = Array.from(new Set(
          sessionConfig.names.map(sessionConfigPerson => sessionConfigPerson.faction)
        ));
        const sessionPartyNames = Array.from(new Set(
          sessionConfig.names.map(sessionConfigPerson => sessionConfigPerson.party)
        ));
        return {
          id: session.id,
          date: session.date,
          meetingMinutesUrl: session.meetingMinutesUrl,
          youtubeUrl: sessionConfig.youtubeUrl,
          factions: sessionFactionNames.map<SessionFactionDto>(sessionFactionName => ({
            id: factionsByNameMap.get(sessionFactionName) || '',
            name: sessionFactionName
          })),
          parties: sessionPartyNames.map<SessionPartyDto>(sessionPartyName => ({
            id: partiesByNameMap.get(sessionPartyName) || '',
            name: sessionPartyName
          })),
          persons: sessionConfig.names.map<SessionPersonDto>(sessionConfigPerson => ({
            id: personIdsByNameMap.get(sessionConfigPerson.name) || '',
            name: sessionConfigPerson.name,
            party: sessionConfigPerson.party,
            faction: sessionConfigPerson.faction
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
              const faction = sessionConfig.names.find(
                name => name.name === sessionSpeech.speaker
              )?.faction;
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


  private getVotingResult(votes: SessionVote[]): VotingResult {
    const votedFor = votes.filter(vote => vote.vote === VoteResult.VOTE_FOR).length;
    const votedAgainst = votes.filter(vote => vote.vote === VoteResult.VOTE_AGAINST).length;
    return votedFor > votedAgainst ? VotingResult.PASSED : VotingResult.REJECTED;
  }


}
