import type { RegistryFaction, RegistryParty } from '../model/registry.ts';
import type { SessionInput } from '../model/SessionInput.ts';
import type { SessionScanItem } from '../model/session-scan.ts';
import { VoteResult } from '../model/Session.ts';


export class UniformityScore {


   constructor(private readonly sessions: SessionInput[]) {
   }


   public forFaction(faction: RegistryFaction): number {

     const allScores = this.sessions
       .flatMap(({ config, votings }) => {
         const factionMembers = config.names.filter(name => name.faction === faction.name).map(name => name.name);
         return votings.map(voting => this.calcUniformityScore(factionMembers, voting));
       })
       .filter(score => score !== null) as number[];

      return allScores.length === 0 ? 0 : allScores.reduce((a, b) => a + b, 0) / allScores.length;

   }


  public historyForFaction(faction: RegistryFaction): { date: string, value: number }[] {

    return this.sessions
      .map(session => {
        const sessions = this.sessions.filter(s => s.config.date <= session.config.date);
        const value = this.calcFactionUniformityScore(faction, sessions);
        return { date: session.config.date, value };
      })
      .filter(({ value }) => value !== null)
      .map(({ date, value }) => ({ date, value: value! }))
      .toSorted((a, b) => a.date.localeCompare(b.date));

  }


  public forParty(party: RegistryParty): number {

     const allScores = this.sessions
       .flatMap(({ config, votings }) => {
         const partyMembers = config.names.filter(name => name.party === party.name).map(name => name.name);
         return votings.map(voting => this.calcUniformityScore(partyMembers, voting));
       })
       .filter(score => score !== null) as number[];

      return allScores.length === 0 ? 0 : allScores.reduce((a, b) => a + b, 0) / allScores.length;

   }


   public historyForParty(party: RegistryParty): { date: string, value: number }[] {

     return this.sessions
       .map(session => {
         const sessions = this.sessions.filter(s => s.config.date <= session.config.date);
         const value = this.calcPartyUniformityScore(party, sessions);
         return { date: session.config.date, value };
       })
       .filter(({ value }) => value !== null)
       .map(({ date, value }) => ({ date, value: value! }))
       .toSorted((a, b) => a.date.localeCompare(b.date));

   }


   private calcUniformityScore(persons: string[], voting: SessionScanItem): number | null {

     let votesFor = 0;
     let votesAgainst = 0;
     let votesAbstained = 0;

     voting.votes
       .filter(vote => persons.includes(vote.name))
       .map(vote => vote.vote)
       .forEach(vote => {
         switch (vote) {
           case VoteResult.VOTE_FOR:
             votesFor++;
             break;
           case VoteResult.VOTE_AGAINST:
             votesAgainst++;
             break;
           case VoteResult.VOTE_ABSTENTION:
             votesAbstained++;
             break;
         }
       });

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


   private calcFactionUniformityScore(faction: RegistryFaction, sessions: SessionInput[]): number | null {

     const uniformityScoresPerSession = sessions
       .map(session => this.calcFactionUniformityScoreForSession(faction, session))
       .filter(score => score !== null) as number[];

     if (uniformityScoresPerSession.length === 0) {
       return null;
     }

     return uniformityScoresPerSession.reduce((a, b) => a + b, 0) / uniformityScoresPerSession.length;

   }


   private calcFactionUniformityScoreForSession(faction: RegistryFaction, session: SessionInput): number | null {

     const persons = session.config.names
       .filter(name => name.faction === faction.name)
       .map(name => name.name);

     const uniformityScorePerVoting = session.votings
       .map(voting => this.calcUniformityScore(persons, voting))
       .filter(score => score !== null) as number[];

      if (uniformityScorePerVoting.length === 0) {
        return null;
      }

      return uniformityScorePerVoting.reduce((a, b) => a + b, 0) / uniformityScorePerVoting.length;

   }


   private calcPartyUniformityScore(party: RegistryParty, sessions: SessionInput[]): number | null {

     const uniformityScoresPerSession = sessions
       .map(session => this.calcPartyUniformityScoreForSession(party, session))
       .filter(score => score !== null) as number[];

     if (uniformityScoresPerSession.length === 0) {
       return null;
     }

     return uniformityScoresPerSession.reduce((a, b) => a + b, 0) / uniformityScoresPerSession.length;

   }


   private calcPartyUniformityScoreForSession(party: RegistryParty, session: SessionInput): number | null {

     const persons = session.config.names
       .filter(name => name.party === party.name)
       .map(name => name.name);

     const uniformityScorePerVoting = session.votings
       .map(voting => this.calcUniformityScore(persons, voting))
       .filter(score => score !== null) as number[];

      if (uniformityScorePerVoting.length === 0) {
        return null;
      }

      return uniformityScorePerVoting.reduce((a, b) => a + b, 0) / uniformityScorePerVoting.length;

   }


}
