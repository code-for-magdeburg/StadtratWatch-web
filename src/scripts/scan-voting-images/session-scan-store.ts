import * as path from '@std/path';
import { SessionScan } from '@srw-astro/models/session-scan';


export interface ISessionScanStore {
  writeSessionScan(session: string, summary: SessionScan): void;
}


export class SessionScanStore implements ISessionScanStore {


  constructor(private readonly directory: string) {
  }


  writeSessionScan(session: string, summary: SessionScan): void {
    Deno.writeTextFileSync(
      path.join(this.directory, `session-scan-${session}.json`),
      JSON.stringify(summary, null, 4),
    );
  }


}
