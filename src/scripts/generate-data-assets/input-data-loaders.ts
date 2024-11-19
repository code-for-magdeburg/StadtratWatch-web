import { Registry } from '../shared/model/registry.ts';
import * as path from '@std/path';
import { ScrapedSession } from '../shared/model/scraped-session.ts';
import { SessionInputData } from '../shared/model/session-input-data.ts';
import { SessionConfig } from '../shared/model/session-config.ts';
import { SessionScan } from '../shared/model/session-scan.ts';
import { SessionSpeech } from '../shared/model/session-speech.ts';


export function loadRegistry(inputDir: string): Registry {
  const registryFilename = path.join(inputDir, 'registry.json');
  return JSON.parse(Deno.readTextFileSync(registryFilename)) as Registry;
}


export function loadScrapedSession(scrapedSessionFilename: string): ScrapedSession {
  return JSON.parse(Deno.readTextFileSync(scrapedSessionFilename)) as ScrapedSession;
}


export function loadSessionsInputData(inputDir: string, registry: Registry): SessionInputData[] {

  return registry.sessions.map<SessionInputData>(session => {

    const sessionDir = path.join(inputDir, session.date);

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
