import * as path from '@std/path';


export interface IPapersContentSource {
  getContent(fileId: number): string;
}


export class PapersContentSource implements IPapersContentSource {


  constructor(private readonly directory: string) {
  }


  public getContent(fileId: number): string {
    const filename = `${fileId}.pdf.txt`;
    return Deno.readTextFileSync(path.join(this.directory, filename));
  }


}
