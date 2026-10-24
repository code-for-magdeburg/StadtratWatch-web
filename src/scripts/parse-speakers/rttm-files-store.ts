import { readdir } from 'node:fs/promises';
import * as path from 'node:path';

export interface IRttmFilesStore {
  getRttmFiles(): Promise<string[]>;
  getRttmFileContent(rttmFile: string): Promise<string>;
}

export class RttmFilesStore implements IRttmFilesStore {
  constructor(private readonly directory: string) {}

  public async getRttmFiles(): Promise<string[]> {
    const entries = await readdir(this.directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((file) => file.name)
      .filter((file) => file.endsWith('.rttm'));
  }

  public getRttmFileContent(rttmFile: string): Promise<string> {
    return Bun.file(path.join(this.directory, rttmFile)).text();
  }
}
