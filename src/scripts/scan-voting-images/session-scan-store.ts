import * as path from '@std/path';
import { SessionScan } from '../shared/model/session-scan.ts';


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