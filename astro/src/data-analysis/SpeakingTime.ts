import type { RegistryFaction, RegistryParty, RegistryPerson } from '../model/registry.ts';
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


  public forPerson(person: RegistryPerson): number {
    return this.sessions
      .filter(session => session.config.names.some(name => name.name === person.name))
      .flatMap(session => session.speeches)
      .filter(speech => speech.speaker === person.name)
      .filter(speech => !speech.isChairPerson)
      .map(speech => Math.round(speech.duration / 10) * 10)
      .reduce((acc, duration) => acc + duration, 0);
  }


}
