import * as path from 'node:path';

export interface IPapersContentSource {
  getContent(fileId: number): Promise<string>;
}

export class PapersContentSource implements IPapersContentSource {
  constructor(private readonly directory: string) {}

  public async getContent(fileId: number): Promise<string> {
    const filename = `${fileId}.pdf.txt`;
    return await Bun.file(path.join(this.directory, filename)).text();
  }
}
