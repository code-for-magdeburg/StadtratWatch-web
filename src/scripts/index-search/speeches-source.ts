import * as fs from '@std/fs';
import * as path from '@std/path';
import { Registry, RegistrySession } from '@srw-astro/models/registry';
import { SessionSpeech } from '@srw-astro/models/session-speech';


export type IndexableSpeech = {
  parliamentPeriod: Registry;
  session: RegistrySession;
  speech: SessionSpeech;
};


export interface ISpeechesSource {
  getSpeeches(): IndexableSpeech[];
}


export class SpeechesSource implements ISpeechesSource {


  constructor(private readonly parliamentPeriodsBaseDir: string) {
  }


  public getSpeeches(): IndexableSpeech[] {

    return this
      .getParliamentPeriods()
      .flatMap<IndexableSpeech>(registry => {
        return registry.sessions
          .flatMap<IndexableSpeech>(session => this
            .getSessionSpeeches(registry, session)
            .map(speech => ({ parliamentPeriod: registry, session, speech }))
          );
      });

  }


  private getParliamentPeriods(): Registry[] {
    return Array
      .from(Deno.readDirSync(this.parliamentPeriodsBaseDir))
      .filter(entry => Deno.statSync(path.join(this.parliamentPeriodsBaseDir, entry.name)).isDirectory)
      .filter(entry => fs.existsSync(path.join(this.parliamentPeriodsBaseDir, entry.name, 'registry.json')))
      .map((entry) => {
        const registryFilename = path.join(this.parliamentPeriodsBaseDir, entry.name, 'registry.json');
        return JSON.parse(Deno.readTextFileSync(registryFilename)) as Registry;
      });
  }


  private getSessionSpeeches(parliamentPeriod: Registry, session: RegistrySession): SessionSpeech[] {
    const sessionSpeechesFilename = path.join(
      this.parliamentPeriodsBaseDir, parliamentPeriod.id, session.id, `session-speeches-${session.id}.json`);
    return fs.existsSync(sessionSpeechesFilename)
      ? JSON.parse(Deno.readTextFileSync(sessionSpeechesFilename)) as SessionSpeech[]
      : [];
  }


}
