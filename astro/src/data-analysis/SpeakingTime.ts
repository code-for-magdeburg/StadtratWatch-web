import type { RegistryFaction, RegistryParty } from '../model/registry.ts';
import type { SessionInput } from '../model/SessionInput.ts';


export class SpeakingTime {


  constructor(private readonly sessions: SessionInput[]) {
  }


  public forFaction(faction: RegistryFaction): number {

    return this.sessions
      .flatMap(({ config, speeches }) => {
        const factionMembers = config.names.filter(name => name.faction === faction.name).map(name => name.name);
        return speeches
          .filter(speech => !speech.isChairPerson)
          .filter(speech => factionMembers.includes(speech.speaker))
          .map(speech => Math.round(speech.duration / 10) * 10);
      })
      .reduce((a, b) => a + b, 0);

  }


  public forParty(party: RegistryParty): number {

    return this.sessions
      .flatMap(({ config, speeches }) => {
        const partyMembers = config.names.filter(name => name.party === party.name).map(name => name.name);
        return speeches
          .filter(speech => !speech.isChairPerson)
          .filter(speech => partyMembers.includes(speech.speaker))
          .map(speech => Math.round(speech.duration / 10) * 10);
      })
      .reduce((a, b) => a + b, 0);

  }


}
