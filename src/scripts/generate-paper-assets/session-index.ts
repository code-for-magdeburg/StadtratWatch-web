import { readdir } from 'node:fs/promises';
import * as path from 'node:path';

import type { Registry } from '@srw-astro/models/registry';

export type SessionLocation = {
  parliamentPeriodId: string;
  sessionId: string;
};

// Maps a session date (YYYY-MM-DD) to the parliament period and session it
// belongs to. Session dates are unique across all periods, so the date is a
// safe key for resolving whether a consultation has a session page.
export type SessionIndex = { [sessionDate: string]: SessionLocation };

export interface SessionIndexStore {
  loadSessionIndex(): Promise<SessionIndex>;
}

export class SessionIndexFileStore implements SessionIndexStore {
  constructor(private readonly dataDir: string) {}

  public async loadSessionIndex(): Promise<SessionIndex> {
    const sessionIndex: SessionIndex = {};

    for (const entry of await readdir(this.dataDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }

      const registry = await this.readRegistry(path.join(this.dataDir, entry.name, 'registry.json'));
      if (!registry) {
        continue;
      }

      for (const session of registry.sessions) {
        sessionIndex[session.date] = {
          parliamentPeriodId: registry.id,
          sessionId: session.id,
        };
      }
    }

    return sessionIndex;
  }

  private async readRegistry(filePath: string): Promise<Registry | null> {
    const registryFile = Bun.file(filePath);
    if (!(await registryFile.exists())) {
      return null;
    }
    return (await registryFile.json()) as Registry;
  }
}
