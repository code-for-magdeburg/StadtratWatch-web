import type { RegistryFaction, RegistryParty } from '../model/registry.ts';
import type { SessionInput } from '../model/SessionInput.ts';
import type { SessionScanItem } from '../model/session-scan.ts';
import { VoteResult } from '../model/Session.ts';


export type HistoryDataPoint = {
  date: string;
  value: number;
};


export function calcUniformityScoreOfFaction(faction: RegistryFaction, sessions: SessionInput[]): number | null {

  const uniformityScores = sessions
    .flatMap(session => {
      const persons = session.config.names.filter(name => name.faction === faction.name).map(name => name.name);
      return session.votings.map(voting => calcUniformityScore(persons, voting));
    })
    .filter(score => score !== null)
    .map(score => score!);

  return uniformityScores.length === 0
    ? null
    : uniformityScores.reduce((a, b) => a + b, 0) / uniformityScores.length;

}


export function calcUniformityScoreHistoryOfFaction(faction: RegistryFaction, sessions: SessionInput[]): HistoryDataPoint[] {

  return sessions
    .map(session => {
      const pastSessions = sessions.filter(s => s.config.date <= session.config.date);
      const value = calcUniformityScoreOfFaction(faction, pastSessions);
      return { date: session.config.date, value };
    })
    .filter(({ value }) => value !== null)
    .map(({ date, value }) => ({ date, value: value! }))
    .toSorted((a, b) => a.date.localeCompare(b.date));

}


export function calcUniformityScoreOfParty(party: RegistryParty, sessions: SessionInput[]): number | null {

  const uniformityScores = sessions
    .flatMap(session => {
      const persons = session.config.names.filter(name => name.party === party.name).map(name => name.name);
      return session.votings.map(voting => calcUniformityScore(persons, voting));
    })
    .filter(score => score !== null)
    .map(score => score!);

  return uniformityScores.length === 0
    ? null
    : uniformityScores.reduce((a, b) => a + b, 0) / uniformityScores.length;

}


export function calcUniformityScoreHistoryOfParty(party: RegistryParty, sessions: SessionInput[]): HistoryDataPoint[] {

  return sessions
    .map(session => {
      const pastSessions = sessions.filter(s => s.config.date <= session.config.date);
      const value = calcUniformityScoreOfParty(party, pastSessions);
      return { date: session.config.date, value };
    })
    .filter(({ value }) => value !== null)
    .map(({ date, value }) => ({ date, value: value! }))
    .toSorted((a, b) => a.date.localeCompare(b.date));

}



function calcUniformityScore(persons: string[], voting: SessionScanItem): number | null {

  const votesFor = voting.votes
    .filter(vote => persons.includes(vote.name))
    .filter(vote => vote.vote === VoteResult.VOTE_FOR)
    .length;
  const votesAgainst = voting.votes
    .filter(vote => persons.includes(vote.name))
    .filter(vote => vote.vote === VoteResult.VOTE_AGAINST)
    .length;
  const votesAbstained = voting.votes
    .filter(vote => persons.includes(vote.name))
    .filter(vote => vote.vote === VoteResult.VOTE_ABSTENTION)
    .length;

  const totalVotes = votesFor + votesAgainst + votesAbstained;
  if (totalVotes === 0) {
    return null;
  }

  const max1 = Math.max(votesFor, votesAgainst, votesAbstained);
  const max2 = votesFor === max1
    ? (Math.max(votesAgainst, votesAbstained))
    : (votesAgainst === max1
      ? Math.max(votesFor, votesAbstained)
      : Math.max(votesFor, votesAgainst));

  return (max1 - max2 + Math.min(votesAbstained, max2)) / totalVotes;

}
