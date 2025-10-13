import * as fs from '@std/fs';
import * as path from '@std/path';
import { SpeakerWithSegments } from './types.ts';

export interface IParsedFilesStore {
  writeSpeakerFile(session: string, speakers: SpeakerWithSegments[]): void;
}

export class ParsedFilesStore implements IParsedFilesStore {
  constructor(private readonly directory: string) {
  }

  writeSpeakerFile(session: string, speakers: SpeakerWithSegments[]): void {
    console.log(`Writing session-speakers-${session}.json`);
    fs.ensureDirSync(this.directory);
    Deno.writeTextFileSync(
      path.join(this.directory, `session-speakers-${session}.json`),
      JSON.stringify(speakers, null, 4),
    );
  }
}
