import * as path from 'node:path';
import { readdir } from 'node:fs/promises';

export interface PaperFilesStore {
  getFileSize(fileId: number): number | null;
}

export class PaperFilesFileStore implements PaperFilesStore {
  private constructor(private readonly fileSizesByName: Map<string, number>) {
  }

  static async load(papersDir: string): Promise<PaperFilesFileStore> {
    const fileSizesByName = new Map<string, number>();
    for (const entry of await readdir(papersDir, { recursive: true, withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.pdf')) {
        fileSizesByName.set(entry.name, Bun.file(path.join(entry.parentPath, entry.name)).size);
      }
    }
    return new PaperFilesFileStore(fileSizesByName);
  }

  getFileSize(fileId: number): number | null {
    return this.fileSizesByName.get(`${fileId}.pdf`) || null;
  }
}
