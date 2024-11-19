import { Registry } from '../shared/model/registry';
import * as path from 'path';
import * as fs from 'fs';
import { ScrapedSession } from '../shared/model/scraped-session';
import { SessionInputData } from '../shared/model/session-input-data';
import { SessionConfig } from '../shared/model/session-config';
import { SessionScan } from '../shared/model/session-scan';
import { SessionSpeech } from '../shared/model/session-speech';


export function loadRegistry(inputDir: string): Registry {
  const registryFilename = path.join(inputDir, 'registry.json');
  return JSON.parse(fs.readFileSync(registryFilename, 'utf-8')) as Registry;
}


export function loadScrapedSession(scrapedSessionFilename: string): ScrapedSession {
  return JSON.parse(fs.readFileSync(scrapedSessionFilename, 'utf-8')) as ScrapedSession;
}


export function loadSessionsInputData(inputDir: string, registry: Registry): SessionInputData[] {

  return registry.sessions.map<SessionInputData>(session => {

    const sessionDir = path.join(inputDir, session.date);

    const config = JSON.parse(
      fs.readFileSync(path.join(sessionDir, `config-${session.date}.json`), 'utf-8')
    ) as SessionConfig;

    const scan = JSON.parse(
      fs.readFileSync(path.join(sessionDir, `session-scan-${session.date}.json`), 'utf-8')
    ) as SessionScan;

    const speeches = JSON.parse(
      fs.readFileSync(path.join(sessionDir, `session-speeches-${session.date}.json`), 'utf-8')
    ) as SessionSpeech[];

    return { sessionId: session.id, config, scan, speeches } satisfies SessionInputData;

  });

}
