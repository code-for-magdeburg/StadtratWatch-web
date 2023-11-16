import * as fs from 'fs';
import { GENERATED_ASSETS_DIR } from './constants';
import { SessionDetailsDto, Vote, VoteResult } from '../../app/model/Session';
import { MetadataDto } from '../../app/model/Metadata';
import { Registry } from './model/registry';


export function generateMetadataFile(registry: Registry, sessions: SessionDetailsDto[]) {
  const votingsCount = getVotingsCount(sessions);
  const votesCount = getVotesCount(sessions);

  const metadata: MetadataDto = {
    lastUpdatedTimestamp: new Date().toISOString(),
    sessionsPeriodFrom: sessions[0]?.date ?? '',
    sessionsPeriodUntil: sessions[sessions.length - 1]?.date ?? '',
    votingsCount,
    votesCount,
    sessionsCount: registry.sessions.length,
    fractionsCount: registry.fractions.length,
    partiesCount: registry.parties.length,
    personsCount: registry.persons.length
  };

  fs.writeFileSync(
    `${GENERATED_ASSETS_DIR}/metadata.json`,
    JSON.stringify(metadata, null, 2),
    `utf-8`
  );

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
