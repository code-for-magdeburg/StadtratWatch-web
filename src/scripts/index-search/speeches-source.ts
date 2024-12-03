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
      .flatMap<IndexableSpeech>(electoralPeriod => {
        const registry = this.getRegistry(electoralPeriod);
        return this
          .getSessions(electoralPeriod)
          .flatMap<IndexableSpeech>(session => {
            const config = this.getSessionConfig(electoralPeriod, session);
            return this
              .getSessionSpeeches(electoralPeriod, session)
              .map(speech => ({ electoralPeriod: registry.electoralPeriod, session, config, speech }));
          });
      });

  }


  private getElectoralPeriods(): string[] {
    return Array
      .from(Deno.readDirSync(this.electoralPeriodsBaseDir))
      .filter(entry => Deno.statSync(path.join(this.electoralPeriodsBaseDir, entry.name)).isDirectory)
      .filter(entry => fs.existsSync(path.join(this.electoralPeriodsBaseDir, entry.name, 'registry.json')))
      .map(entry => entry.name);
  }


  private getRegistry(electoralPeriod: string): Registry {
    const electoralPeriodDir = path.join(this.electoralPeriodsBaseDir, electoralPeriod);
    return JSON.parse(Deno.readTextFileSync(path.join(electoralPeriodDir, 'registry.json'))) as Registry;
  }


  private getSessions(electoralPeriod: string): string[] {
    const electoralPeriodDir = path.join(this.electoralPeriodsBaseDir, electoralPeriod);
    return Array
      .from(Deno.readDirSync(electoralPeriodDir))
      .filter(entry => Deno.statSync(path.join(electoralPeriodDir, entry.name)).isDirectory)
      .map(entry => entry.name)
      .filter(session => fs.existsSync(path.join(electoralPeriodDir, session, `config-${session}.json`)))
      .filter(session => fs.existsSync(path.join(electoralPeriodDir, session, `session-speeches-${session}.json`)));
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
