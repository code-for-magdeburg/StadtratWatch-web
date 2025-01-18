import type { RegistryFaction } from '../model/registry.ts';
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


}
