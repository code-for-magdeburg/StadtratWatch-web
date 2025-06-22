import { Registry } from '@srw-astro/models/registry';
import * as path from '@std/path';
import { ScrapedSession } from '@srw-astro/models/scraped-session';
import { SessionInput } from '@srw-astro/models/session-input';
import { SessionConfig } from '@srw-astro/models/session-config';
import { SessionScan } from '@srw-astro/models/session-scan';
import { SessionSpeech } from '@srw-astro/models/session-speech';


export type InputData = {
  registry: Registry;
  scrapedSession: ScrapedSession;
  sessionsInputData: SessionInput[];
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


  private loadSessionsInputData(registry: Registry): SessionInput[] {

    return registry.sessions.map<SessionInput>(session => {

      const sessionDir = path.join(this.inputDir, session.date);

      const config = JSON.parse(
        Deno.readTextFileSync(path.join(sessionDir, `config-${session.date}.json`))
      ) as SessionConfig;

      const votings = JSON.parse(
        Deno.readTextFileSync(path.join(sessionDir, `session-scan-${session.date}.json`))
      ) as SessionScan;

      const speeches = JSON.parse(
        Deno.readTextFileSync(path.join(sessionDir, `session-speeches-${session.date}.json`))
      ) as SessionSpeech[];

      return { sessionId: session.id, config, votings, speeches } satisfies SessionInput;

    });

  }


}
