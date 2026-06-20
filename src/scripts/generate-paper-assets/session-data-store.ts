import * as path from '@std/path';
import { Registry } from '@srw-astro/models/registry';
import { SessionScan } from '@srw-astro/models/session-scan';

export type SessionData = {
  sessionId: string;
  date: string;
  scan: SessionScan;
};

export type ParliamentPeriodData = {
  registry: Registry;
  sessions: SessionData[];
};

export interface SessionDataStore {
  loadParliamentPeriods(): ParliamentPeriodData[];
}

/**
 * Reads parliament period data (registries and voting scans) from the repository `data/` root.
 *
 * Expected layout:
 *   <dataDir>/<period-id>/registry.json
 *   <dataDir>/<period-id>/<session-date>/session-scan-<session-date>.json
 *
 * Directories without a registry.json (e.g. `papers`, `oparl-magdeburg`) are skipped.
 */
export class SessionDataFileStore implements SessionDataStore {
  constructor(private readonly dataDir: string) {}

  public loadParliamentPeriods(): ParliamentPeriodData[] {
    const periods: ParliamentPeriodData[] = [];

    for (const entry of Deno.readDirSync(this.dataDir)) {
      if (!entry.isDirectory) {
        continue;
      }

      const registryPath = path.join(this.dataDir, entry.name, 'registry.json');
      let registry: Registry;
      try {
        registry = JSON.parse(Deno.readTextFileSync(registryPath)) as Registry;
      } catch {
        // Not a parliament period directory (no registry.json) - skip.
        continue;
      }

      const sessions = registry.sessions
        .map<SessionData | null>((session) => {
          const scanPath = path.join(
            this.dataDir,
            entry.name,
            session.id,
            `session-scan-${session.id}.json`,
          );
          let scan: SessionScan;
          try {
            scan = JSON.parse(Deno.readTextFileSync(scanPath)) as SessionScan;
          } catch {
            // No voting scan for this session yet - skip it.
            return null;
          }
          return { sessionId: session.id, date: session.date, scan };
        })
        .filter((session): session is SessionData => session !== null);

      periods.push({ registry, sessions });
    }

    return periods;
  }
}
