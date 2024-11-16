import { SessionDetailsDto, Vote, VoteResult } from '../../app/model/Session';
import { MetadataDto } from '../../app/model/Metadata';
import { Registry } from '../shared/model/registry';


export function generateMetadata(registry: Registry, sessions: SessionDetailsDto[]): MetadataDto {

  const votingsCount = getVotingsCount(sessions);
  const votesCount = getVotesCount(sessions);
  const speakingTime = getTotalSpeakingTime(sessions);

  return {
    lastUpdatedTimestamp: new Date().toISOString(),
    sessionsPeriodFrom: sessions[0]?.date ?? '',
    sessionsPeriodUntil: sessions[sessions.length - 1]?.date ?? '',
    votingsCount,
    votesCount,
    sessionsCount: registry.sessions.length,
    factionsCount: registry.factions.length,
    partiesCount: registry.parties.length,
    personsCount: registry.persons.length,
    speakingTime,
  };

}


function getVotingsCount(sessions: SessionDetailsDto[]) {
  return sessions.reduce((acc, session) => acc + session.votings.length, 0);
}


function getVotesCount(sessions: SessionDetailsDto[]) {
  const onlyVoted = (votes: Vote[]): Vote[] => votes.filter(vote => vote.vote !== VoteResult.DID_NOT_VOTE);
  return sessions.reduce(
    (acc, session) => acc + session.votings.reduce(
      (acc, voting) => acc + onlyVoted(voting.votes).length, 0
    ), 0
  );
}


function getTotalSpeakingTime(sessions: SessionDetailsDto[]) {
  return sessions
    .flatMap(session => session.speeches)
    .reduce((acc, speech) => acc + speech.duration, 0);
}
