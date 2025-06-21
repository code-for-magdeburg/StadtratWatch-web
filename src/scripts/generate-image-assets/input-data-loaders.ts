import { Registry } from '../shared/model/registry.ts';
import * as path from '@std/path';
import { ScrapedSession } from '../shared/model/scraped-session.ts';
import { SessionInputData } from '../shared/model/session-input-data.ts';
import { SessionConfig } from '../shared/model/session-config.ts';
import { SessionScan } from '../shared/model/session-scan.ts';
import { SessionSpeech } from '../shared/model/session-speech.ts';


export type InputData = {
  registry: Registry;
  scrapedSession: ScrapedSession;
  sessionsInputData: SessionInputData[];
};


export class InputDataLoaders {


  constructor(private readonly inputDir: string, private readonly scrapedSessionFilename: string) {
  }


  public loadInputData(): InputData {
    const registry = this.loadRegistry();
    const scrapedSession = this.loadScrapedSession();
    const sessionsInputData = this.loadSessionsInputData(registry);
    return { registry, scrapedSession, sessionsInputData };
  }


  private loadRegistry(): Registry {
    const registryFilename = path.join(this.inputDir, 'registry.json');
    return JSON.parse(Deno.readTextFileSync(registryFilename)) as Registry;
  }


  private loadScrapedSession(): ScrapedSession {
    return JSON.parse(Deno.readTextFileSync(this.scrapedSessionFilename)) as ScrapedSession;
  }


  private loadSessionsInputData(registry: Registry): SessionInputData[] {

    return registry.sessions.map<SessionInputData>(session => {

      const sessionDir = path.join(this.inputDir, session.date);

      const config = JSON.parse(
        Deno.readTextFileSync(path.join(sessionDir, `config-${session.date}.json`))
      ) as SessionConfig;

      const scan = JSON.parse(
        Deno.readTextFileSync(path.join(sessionDir, `session-scan-${session.date}.json`))
      ) as SessionScan;

      const speeches = JSON.parse(
        Deno.readTextFileSync(path.join(sessionDir, `session-speeches-${session.date}.json`))
      ) as SessionSpeech[];

      return { sessionId: session.id, config, scan, speeches } satisfies SessionInputData;

    });

  }


}
