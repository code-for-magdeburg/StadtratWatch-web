import type { RegistryFaction, RegistryParty, RegistryPerson } from '../model/registry.ts';
import type { SessionInput } from '../model/SessionInput.ts';


export class SpeakingTime {


  constructor(private readonly sessions: SessionInput[]) {
  }


  public forFaction(faction: RegistryFaction): number {
    return this.sessions
      .flatMap(session => {
        const persons = session.config.names.filter(name => name.faction === faction.name).map(name => name.name);
        return this.calcSpeakingTimeForSession(persons, session);
      })
      .reduce((acc, duration) => acc + duration, 0);
  }


  public forParty(party: RegistryParty): number {
    return this.sessions
      .flatMap(session => {
        const persons = session.config.names.filter(name => name.party === party.name).map(name => name.name);
        return this.calcSpeakingTimeForSession(persons, session);
      })
      .reduce((acc, duration) => acc + duration, 0);
  }


  public forPerson(person: RegistryPerson): number {
    return this.sessions
      .filter(session => session.config.names.some(name => name.name === person.name))
      .flatMap(session => this.calcSpeakingTimeForSession([person.name], session))
      .reduce((acc, duration) => acc + duration, 0);
  }


  private calcSpeakingTimeForSession(persons: string[], session: SessionInput): number {
    return session.speeches
      .filter(speech => persons.includes(speech.speaker))
      .filter(speech => !speech.isChairPerson)
      .map(speech => Math.round(speech.duration / 10) * 10)
      .reduce((acc, duration) => acc + duration, 0);
  }


}
