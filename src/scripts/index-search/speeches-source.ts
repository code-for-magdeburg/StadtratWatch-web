import * as fs from '@std/fs';
import * as path from '@std/path';
import { Registry } from '../shared/model/registry.ts';
import { SessionConfig } from '../shared/model/session-config.ts';
import { SessionSpeech } from '../shared/model/session-speech.ts';


export type IndexableSpeech = {
  electoralPeriod: string;
  session: string;
  config: SessionConfig;
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
          .map(session => session.id)
          .flatMap<IndexableSpeech>(session => {
            const config = this.getSessionConfig(registry.electoralPeriod, session);
            return this
              .getSessionSpeeches(registry.electoralPeriod, session)
              .map(speech => ({ electoralPeriod: registry.electoralPeriod, session, config, speech }));
          });
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


  private getSessionConfig(electoralPeriod: string, session: string): SessionConfig {
    return JSON.parse(
      Deno.readTextFileSync(path.join(this.electoralPeriodsBaseDir, electoralPeriod, session, `config-${session}.json`))
    ) as SessionConfig;
  }


  private getSessionSpeeches(electoralPeriod: string, session: string): SessionSpeech[] {
    return JSON.parse(
      Deno.readTextFileSync(
        path.join(this.electoralPeriodsBaseDir, electoralPeriod, session, `session-speeches-${session}.json`)
      )
    ) as SessionSpeech[];
  }


}
