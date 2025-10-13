import { type OparlObject } from '../shared/model/oparl.ts';
import * as path from '@std/path';

export interface IOparlObjectFileStore {
  saveObjects(objects: OparlObject[], filename: string): void;
  loadObjects(filename: string): OparlObject[];
}

export class OparlObjectsFileStore implements IOparlObjectFileStore {
  constructor(private readonly directory: string) {
  }

  public saveObjects(objects: OparlObject[], filename: string): void {
    Deno.writeTextFileSync(
      this.getObjectFilePath(filename),
      JSON.stringify(objects, null, 2),
    );
  }

  public loadObjects(filename: string): OparlObject[] {
    const objectsJson = Deno.readTextFileSync(this.getObjectFilePath(filename));
    return JSON.parse(objectsJson) as OparlObject[];
  }

  private getObjectFilePath(filename: string) {
    return path.join(this.directory, filename);
  }
}
