import type { OparlObject } from '@srw-astro/models/oparl';
import * as path from 'node:path';

export interface IOparlObjectFileStore {
  saveObjects(objects: OparlObject[], filename: string): Promise<void>;
  loadObjects(filename: string): Promise<OparlObject[]>;
}

export class OparlObjectsFileStore implements IOparlObjectFileStore {
  constructor(private readonly directory: string) {
  }

  public async saveObjects(objects: OparlObject[], filename: string): Promise<void> {
    await Bun.write(
      this.getObjectFilePath(filename),
      JSON.stringify(objects, null, 2),
    );
  }

  public async loadObjects(filename: string): Promise<OparlObject[]> {
    return await Bun.file(this.getObjectFilePath(filename)).json() as OparlObject[];
  }

  private getObjectFilePath(filename: string) {
    return path.join(this.directory, filename);
  }
}
