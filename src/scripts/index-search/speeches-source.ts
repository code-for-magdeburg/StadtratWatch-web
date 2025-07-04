import * as fs from '@std/fs';
import * as path from '@std/path';
import { Registry, RegistrySession } from '@srw-astro/models/registry';
import { SessionSpeech } from '@srw-astro/models/session-speech';


export type IndexableSpeech = {
  electoralPeriod: Registry;
  session: RegistrySession;
  speech: SessionSpeech;
};


export interface ISpeechesSource {
  getSpeeches(): IndexableSpeech[];
}


export class SpeechesSource implements ISpeechesSource {


  constructor(private readonly electoralPeriodsBaseDir: string) {
  }


  public getSpeeches(): IndexableSpeech[] {

    return this
      .getElectoralPeriods()
      .flatMap<IndexableSpeech>(registry => {
        return registry.sessions
          .flatMap<IndexableSpeech>(session => this
            .getSessionSpeeches(registry, session)
            .map(speech => ({ electoralPeriod: registry, session, speech }))
          );
      });

  }


  private getElectoralPeriods(): Registry[] {
    return Array
      .from(Deno.readDirSync(this.electoralPeriodsBaseDir))
      .filter(entry => Deno.statSync(path.join(this.electoralPeriodsBaseDir, entry.name)).isDirectory)
      .filter(entry => fs.existsSync(path.join(this.electoralPeriodsBaseDir, entry.name, 'registry.json')))
      .map((entry) => {
        const registryFilename = path.join(this.electoralPeriodsBaseDir, entry.name, 'registry.json');
        return JSON.parse(Deno.readTextFileSync(registryFilename)) as Registry;
      });
  }


  private getSessionSpeeches(electoralPeriod: Registry, session: RegistrySession): SessionSpeech[] {
    return JSON.parse(
      Deno.readTextFileSync(
        path.join(this.electoralPeriodsBaseDir, electoralPeriod.id, session.id, `session-speeches-${session.id}.json`)
      )
    ) as SessionSpeech[];
  }


}
