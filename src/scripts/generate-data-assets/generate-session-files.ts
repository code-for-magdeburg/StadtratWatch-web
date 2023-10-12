import {
  SessionDetailsDto,
  SessionFractionDto,
  SessionLightDto, SessionPartyDto, SessionPersonDto, SessionVotingDto,
  VoteResult,
  VotingResult
} from '../../app/model/Session';
import * as fs from 'fs';
import { SESSIONS_BASE_DIR } from './constants';
import { Registry, SessionConfig, SessionScan, SessionVote } from './model';
import { SESSIONS_CONFIGS_DIR } from './constants';


export function generateSessionFiles(registry: Registry): SessionDetailsDto[] {

  const personIdsByNameMap =
    new Map(registry.persons.map(person => [person.name, person.id]));

  const fractionsByNameMap =
    new Map(registry.fractions.map(fraction => [fraction.name, fraction.id]));

  const partiesByNameMap =
    new Map(registry.parties.map(party => [party.name, party.id]));

  const sessions: SessionDetailsDto[] = registry.sessions
    .map(session => {
      const sessionDir = `${SESSIONS_CONFIGS_DIR}/${session.date}`;
      const sessionConfig = JSON.parse(
        fs.readFileSync(`${sessionDir}/config-${session.date}.json`, 'utf-8')
      ) as SessionConfig;
      const sessionScan = JSON.parse(
        fs.readFileSync(`${sessionDir}/session-scan-${session.date}.json`, 'utf-8')
      ) as SessionScan;
      const sessionFractionNames = Array.from(new Set(
        sessionConfig.names.map(sessionConfigPerson => sessionConfigPerson.fraction)
      ));
      const sessionPartyNames = Array.from(new Set(
        sessionConfig.names.map(sessionConfigPerson => sessionConfigPerson.party)
      ));
      return {
        id: session.id,
        date: session.date,
        youtubeUrl: sessionConfig.youtubeUrl,
        fractions: sessionFractionNames.map<SessionFractionDto>(sessionFractionName => ({
          id: fractionsByNameMap.get(sessionFractionName) || '',
          name: sessionFractionName
        })),
        parties: sessionPartyNames.map<SessionPartyDto>(sessionPartyName => ({
          id: partiesByNameMap.get(sessionPartyName) || '',
          name: sessionPartyName
        })),
        persons: sessionConfig.names.map<SessionPersonDto>(sessionConfigPerson => ({
          id: personIdsByNameMap.get(sessionConfigPerson.name) || '',
          name: sessionConfigPerson.name,
          party: sessionConfigPerson.party,
          fraction: sessionConfigPerson.fraction
        })),
        votings: sessionScan.map<SessionVotingDto>(voting => ({
          id: +voting.votingFilename.substring(11, 14),
          videoTimestamp: voting.videoTimestamp,
          votingSubject: {
            agendaItem: voting.votingSubject.agendaItem,
            applicationId: voting.votingSubject.applicationId,
            title: voting.votingSubject.title,
            type: voting.votingSubject.type,
            authors: voting.votingSubject.authors
          },
          votes: voting.votes.map(vote => ({
            personId: personIdsByNameMap.get(vote.name) || '',
            vote: getVoteResult(vote.vote)
          })),
          votingResult: getVotingResult(voting.votes)
        }))
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  sessions.forEach(session => {
    console.log(`Writing session file ${session.id}.json`);
    const data = JSON.stringify(session, null, 2);
    fs.writeFileSync(`${SESSIONS_BASE_DIR}/${session.id}.json`, data, 'utf-8');
  });

  console.log('Writing all-sessions.json');
  const sessionsLight: SessionLightDto[] = registry.sessions.map(session => ({
    id: session.id,
    date: session.date,
    votingsCount: sessions.find(s => s.id === session.id)?.votings.length || 0,
  }));
  fs.writeFileSync(
    `${SESSIONS_BASE_DIR}/all-sessions.json`,
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
  const passed = votes.filter(vote => vote.vote === VoteResult.VOTE_FOR).length;
  const rejected = votes.filter(vote => vote.vote === VoteResult.VOTE_AGAINST).length;
  return passed > rejected ? VotingResult.PASSED : VotingResult.REJECTED;
}
