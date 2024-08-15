import {
  SessionDetailsDto,
  SessionFactionDto,
  SessionLightDto, SessionPartyDto, SessionPersonDto, SessionVotingDto,
  VoteResult,
  VotingResult
} from '../../app/model/Session';
import * as fs from 'fs';
import { SessionScan, SessionVote } from './model/session-scan';
import { ScrapedSession } from '../shared/model/scraped-session';
import { Registry } from '../shared/model/registry';
import { SessionConfig } from './model/session-config';
import { SessionSpeech } from './model/session-speech';


export function generateSessionFiles(sessionsDataDir: string, sessionsOutputDir: string, registry: Registry, scrapedSession: ScrapedSession): SessionDetailsDto[] {

  if (!fs.existsSync(sessionsOutputDir)) {
    fs.mkdirSync(sessionsOutputDir, { recursive: true });
  }

  const scrapedStadtratMeetings = scrapedSession.meetings
    .filter(meeting => meeting.organization_name === 'Stadtrat')
    .map<{ start: string, original_id: number | null }>(meeting => ({
      start: meeting.start ? meeting.start.slice(0, 10) : '',
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

  const sessions: SessionDetailsDto[] = registry.sessions
    .map(session => {
      const scrapedStadtratMeeting = scrapedStadtratMeetings.find(
        meeting => meeting.start.slice(0, 10) === session.date
      );
      if (!scrapedStadtratMeeting) {
        console.warn('No scraped meeting found for session', session.date);
      }

      const sessionDir = `${sessionsDataDir}/${session.date}`;
      const sessionConfig = JSON.parse(
        fs.readFileSync(`${sessionDir}/config-${session.date}.json`, 'utf-8')
      ) as SessionConfig;
      const sessionScan = JSON.parse(
        fs.readFileSync(`${sessionDir}/session-scan-${session.date}.json`, 'utf-8')
      ) as SessionScan;
      const sessionSpeeches = JSON.parse(
        fs.readFileSync(`${sessionDir}/session-speeches-${session.date}.json`, 'utf-8')
      ) as SessionSpeech[];
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
            videoTimestamp: voting.videoTimestamp,
            votingSubject: {
              agendaItem: voting.votingSubject.agendaItem,
              applicationId: voting.votingSubject.applicationId,
              title: voting.votingSubject.title,
              type: voting.votingSubject.type,
              authors: voting.votingSubject.authors,
              documents: {
                paperId: paper?.original_id || null,
                applicationUrl: files.length > 0 ? files[0].url : null,
              }
            },
            votes: voting.votes.map(vote => ({
              personId: personIdsByNameMap.get(vote.name) || '',
              vote: getVoteResult(vote.vote)
            })),
            votingResult: getVotingResult(voting.votes)
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
              onBehalfOf: sessionSpeech.onBehalfOf
            };
          })
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  sessions.forEach(session => {
    console.log(`Writing session file ${session.id}.json`);
    const data = JSON.stringify(session, null, 2);
    fs.writeFileSync(`${sessionsOutputDir}/${session.id}.json`, data, 'utf-8');
  });

  console.log('Writing all-sessions.json');
  const sessionsLight: SessionLightDto[] = registry.sessions.map(session => ({
    id: session.id,
    date: session.date,
    votingsCount: sessions.find(s => s.id === session.id)?.votings.length || 0,
    speechesCount: sessions.find(s => s.id === session.id)?.speeches.length || 0,
    totalSpeakingTime: sessions.find(s => s.id === session.id)?.speeches.reduce(
      (total, speech) => total + speech.duration,
      0
    ) || 0
  }));
  fs.writeFileSync(
    `${sessionsOutputDir}/all-sessions.json`,
    JSON.stringify(sessionsLight, null, 2),
    'utf-8'
  );

  return sessions;

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


function getVotingResult(votes: SessionVote[]): VotingResult {
  const votedFor = votes.filter(vote => vote.vote === VoteResult.VOTE_FOR).length;
  const votedAgainst = votes.filter(vote => vote.vote === VoteResult.VOTE_AGAINST).length;
  return votedFor > votedAgainst ? VotingResult.PASSED : VotingResult.REJECTED;
}
