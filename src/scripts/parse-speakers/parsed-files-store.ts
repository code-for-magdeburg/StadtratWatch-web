import * as path from 'node:path';

import type { SpeakerWithSegments } from './types.ts';

export interface IParsedFilesStore {
  writeSpeakerFile(session: string, speakers: SpeakerWithSegments[]): Promise<void>;
}

export class ParsedFilesStore implements IParsedFilesStore {
  constructor(private readonly directory: string) {}

  async writeSpeakerFile(session: string, speakers: SpeakerWithSegments[]): Promise<void> {
    console.log(`Writing session-speakers-${session}.json`);
    await Bun.write(path.join(this.directory, `session-speakers-${session}.json`), JSON.stringify(speakers, null, 4));
  }
}
