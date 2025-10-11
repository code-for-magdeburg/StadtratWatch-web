import * as fs from '@std/fs';
import * as path from '@std/path';


export interface IPaperFilesStore {
  getFileSize(year: string, fileId: number): number | null;
}


export class PaperFilesStore implements IPaperFilesStore {


  constructor(private readonly papersDir: string) {}


  getFileSize(year: string, fileId: number): number | null {

    const paperFilename = path.join(this.papersDir, `${year}`, `${fileId}.pdf`);

    return fs.existsSync(paperFilename) ? Deno.statSync(paperFilename).size : null;

  }


}
