import * as fs from '@std/fs';
import * as path from '@std/path';
import { Registry, RegistrySession } from '../shared/model/registry.ts';
import { SessionScan } from '../shared/model/session-scan.ts';


export interface IElectoralPeriodsSource {
  getElectoralPeriods(): { registry: Registry, electoralPeriodDir: string }[];
  getSessionScan(session: RegistrySession, electoralPeriodDir: string): SessionScan;
}


export class ElectoralPeriodsSource implements IElectoralPeriodsSource {


  constructor(private readonly directory: string) {
  }


  getElectoralPeriods(): { registry: Registry; electoralPeriodDir: string }[] {
    return Array
      .from(Deno.readDirSync(this.directory))
      .filter((entry) => Deno.statSync(path.join(this.directory, entry.name)).isDirectory)
      .filter((entry) => fs.existsSync(path.join(this.directory, entry.name, 'registry.json')))
      .map((entry) => {
        const registryFilename = path.join(this.directory, entry.name, 'registry.json');
        const registry = JSON.parse(Deno.readTextFileSync(registryFilename)) as Registry;
        return { registry, electoralPeriodDir: entry.name };
      });
  }


  getSessionScan(session: RegistrySession, electoralPeriodDir: string): SessionScan {
    const sessionScanFilename = path.join(
      this.directory,
      electoralPeriodDir,
      session.id,
      `session-scan-${session.id}.json`,
    );
    return JSON.parse(Deno.readTextFileSync(sessionScanFilename)) as SessionScan;
  }


}
