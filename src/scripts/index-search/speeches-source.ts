import { readdir } from 'node:fs/promises';
import * as path from 'node:path';

import type { Registry, RegistrySession } from '@srw-astro/models/registry';
import type { SessionSpeech } from '@srw-astro/models/session-speech';

export type IndexableSpeech = {
  parliamentPeriod: Registry;
  session: RegistrySession;
  speech: SessionSpeech;
};

export interface ISpeechesSource {
  getSpeeches(): Promise<IndexableSpeech[]>;
}

export class SpeechesSource implements ISpeechesSource {
  constructor(private readonly parliamentPeriodsBaseDir: string) {}

  public async getSpeeches(): Promise<IndexableSpeech[]> {
    const speeches: IndexableSpeech[] = [];

    for (const registry of await this.getParliamentPeriods()) {
      for (const session of registry.sessions) {
        const sessionSpeeches = await this.getSessionSpeeches(registry, session);
        speeches.push(...sessionSpeeches.map((speech) => ({ parliamentPeriod: registry, session, speech })));
      }
    }

    return speeches;
  }

  private async getParliamentPeriods(): Promise<Registry[]> {
    const registries: Registry[] = [];

    for (const entryName of await readdir(this.parliamentPeriodsBaseDir)) {
      const registryFile = Bun.file(path.join(this.parliamentPeriodsBaseDir, entryName, 'registry.json'));
      if (!(await registryFile.exists())) {
        continue;
      }

      registries.push((await registryFile.json()) as Registry);
    }

    return registries;
  }

  private async getSessionSpeeches(parliamentPeriod: Registry, session: RegistrySession): Promise<SessionSpeech[]> {
    const sessionSpeechesFile = Bun.file(
      path.join(this.parliamentPeriodsBaseDir, parliamentPeriod.id, session.id, `session-speeches-${session.id}.json`),
    );
    return (await sessionSpeechesFile.exists()) ? ((await sessionSpeechesFile.json()) as SessionSpeech[]) : [];
  }
}
