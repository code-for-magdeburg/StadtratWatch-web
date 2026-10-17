import * as path from 'node:path';
import type { SessionScan } from '@srw-astro/models/session-scan';

export interface ISessionScanStore {
  writeSessionScan(session: string, summary: SessionScan): Promise<void>;
}

export class SessionScanStore implements ISessionScanStore {
  constructor(private readonly directory: string) {
  }

  async writeSessionScan(session: string, summary: SessionScan): Promise<void> {
    await Bun.write(
      path.join(this.directory, `session-scan-${session}.json`),
      JSON.stringify(summary, null, 4),
    );
  }
}
