import { mkdir, readdir } from 'node:fs/promises';
import * as path from 'node:path';

import type { PaperVotingsAssetDto } from './model.ts';

export interface PaperVotingsWriter {
  writePaperVotings(assets: PaperVotingsAssetDto[]): Promise<void>;
}

export class PaperVotingsFileWriter implements PaperVotingsWriter {
  constructor(private readonly paperVotingsDir: string) {}

  async writePaperVotings(assets: PaperVotingsAssetDto[]): Promise<void> {
    await mkdir(this.paperVotingsDir, { recursive: true });

    const generatedFilenames = await this.writePaperVotingFiles(assets);
    await this.removeStalePaperVotingsFiles(generatedFilenames);
  }

  private async writePaperVotingFiles(assets: PaperVotingsAssetDto[]): Promise<Set<string>> {
    const generatedFilenames = new Set<string>();
    for (const asset of assets) {
      const filename = `paper-votings-${asset.batchNo}.json`;
      generatedFilenames.add(filename);
      const filePath = path.join(this.paperVotingsDir, filename);
      await Bun.write(filePath, JSON.stringify(asset.paperVotings, null, 2));
    }
    return generatedFilenames;
  }

  private async removeStalePaperVotingsFiles(generatedFilenames: Set<string>): Promise<void> {
    for (const entry of await readdir(this.paperVotingsDir, { withFileTypes: true })) {
      const isStalePaperVotingsFile =
        entry.isFile() && /^paper-votings-.*\.json$/.test(entry.name) && !generatedFilenames.has(entry.name);
      if (isStalePaperVotingsFile) {
        await Bun.file(path.join(this.paperVotingsDir, entry.name)).delete();
      }
    }
  }
}
