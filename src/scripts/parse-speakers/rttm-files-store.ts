import * as path from '@std/path';


export interface IRttmFilesStore {
  getRttmFiles(): string[];
  getRttmFileContent(rttmFile: string): string;
}


export class RttmFilesStore implements IRttmFilesStore {


  constructor(private readonly directory: string) {
  }


  public getRttmFiles(): string[] {
    return Array
      .from(Deno.readDirSync(this.directory))
      .filter(entry => entry.isFile)
      .map((file) => file.name)
      .filter((file) => file.endsWith('.rttm'));
  }


  public getRttmFileContent(rttmFile: string): string {
    return Deno.readTextFileSync(path.join(this.directory, rttmFile));
  }


}
