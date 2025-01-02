import { Registry } from '../shared/model/registry.ts';
import { MetadataDto, SessionDetailsDto, Vote, VoteResult } from '@scope/interfaces-web-assets';


export class MetadataGenerator {


  public generateMetadata(registry: Registry, sessions: SessionDetailsDto[]): MetadataDto {

    const votingsCount = this.getVotingsCount(sessions);
    const votesCount = this.getVotesCount(sessions);
    const speakingTime = this.getTotalSpeakingTime(sessions);

    return {
      lastUpdatedTimestamp: registry.lastUpdate,
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


  private getVotingsCount(sessions: SessionDetailsDto[]) {
    return sessions.reduce((acc, session) => acc + session.votings.length, 0);
  }


  private getVotesCount(sessions: SessionDetailsDto[]) {
    const onlyVoted = (votes: Vote[]): Vote[] => votes.filter(vote => vote.vote !== VoteResult.DID_NOT_VOTE);
    return sessions.reduce(
      (acc, session) => acc + session.votings.reduce(
        (acc, voting) => acc + onlyVoted(voting.votes).length, 0
      ), 0
    );
  }


  private getTotalSpeakingTime(sessions: SessionDetailsDto[]) {
    return sessions
      .flatMap(session => session.speeches)
      .reduce((acc, speech) => acc + speech.duration, 0);
  }


}
