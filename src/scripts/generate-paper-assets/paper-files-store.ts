import * as fs from '@std/fs';

export interface PaperFilesStore {
  getFileSize(fileId: number): number | null;
}

export class PaperFilesFileStore implements PaperFilesStore {
  private filesDict: Map<string, number> = new Map<string, number>();

  constructor(private readonly papersDir: string) {
    for (const entry of fs.walkSync(papersDir)) {
      if (entry.isFile && entry.name.endsWith('.pdf')) {
        this.filesDict.set(entry.name, Deno.statSync(entry.path).size);
      }
    }
  }

  getFileSize(fileId: number): number | null {
    return this.filesDict.get(`${fileId}.pdf`) || null;
  }
}
