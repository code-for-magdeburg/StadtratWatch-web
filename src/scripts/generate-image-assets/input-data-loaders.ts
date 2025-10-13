import { Registry } from '@srw-astro/models/registry';
import * as path from '@std/path';
import { SessionInput } from '@srw-astro/models/session-input';
import { SessionScan } from '@srw-astro/models/session-scan';
import { SessionSpeech } from '@srw-astro/models/session-speech';
import { existsSync } from '@std/fs';

export type InputData = {
  registry: Registry;
  sessionsInput: SessionInput[];
};

export class InputDataLoaders {
  constructor(private readonly inputDir: string) {
  }

  public loadInputData(): InputData {
    const registry = this.loadRegistry();
    const sessionsInput = this.loadSessionsInputData(registry);
    return { registry, sessionsInput };
  }

  private loadRegistry(): Registry {
    const registryFilename = path.join(this.inputDir, 'registry.json');
    return JSON.parse(Deno.readTextFileSync(registryFilename)) as Registry;
  }

  private loadSessionsInputData(registry: Registry): SessionInput[] {
    return registry.sessions.map<SessionInput>((session) => {
      const sessionDir = path.join(this.inputDir, session.date);

      const sessionScanFilename = path.join(sessionDir, `session-scan-${session.date}.json`);
      const votings = existsSync(sessionScanFilename)
        ? JSON.parse(Deno.readTextFileSync(sessionScanFilename)) as SessionScan
        : [];

      const sessionSpeechesFilename = path.join(sessionDir, `session-speeches-${session.date}.json`);
      const speeches = existsSync(sessionSpeechesFilename)
        ? JSON.parse(Deno.readTextFileSync(sessionSpeechesFilename)) as SessionSpeech[]
        : [];

      return { session, votings, speeches } satisfies SessionInput;
    });
  }
}
