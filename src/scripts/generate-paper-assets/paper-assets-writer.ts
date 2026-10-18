import * as path from 'node:path';
import { mkdir, readdir } from 'node:fs/promises';
import type { PaperAssetDto } from './model.ts';

export interface PaperAssetsWriter {
  writePaperAssets(papers: PaperAssetDto[]): Promise<void>;
}

export class PaperAssetsFileWriter implements PaperAssetsWriter {
  constructor(private readonly paperAssetsDir: string) {
  }

  async writePaperAssets(assets: PaperAssetDto[]): Promise<void> {
    await mkdir(this.paperAssetsDir, { recursive: true });

    const generatedFilenames = await this.writePaperAssetFiles(assets);
    await this.removeStalePaperAssetFiles(generatedFilenames);
  }

  private async writePaperAssetFiles(assets: PaperAssetDto[]): Promise<Set<string>> {
    const generatedFilenames = new Set<string>();
    for (const asset of assets) {
      const filename = `papers-${asset.batchNo}.json`;
      generatedFilenames.add(filename);
      const filePath = path.join(this.paperAssetsDir, filename);
      await Bun.write(filePath, JSON.stringify(asset.papers, null, 2));
    }
    return generatedFilenames;
  }

  private async removeStalePaperAssetFiles(generatedFilenames: Set<string>): Promise<void> {
    for (const entry of await readdir(this.paperAssetsDir, { withFileTypes: true })) {
      const isStalePaperAssetFile = entry.isFile() &&
        /^papers-.*\.json$/.test(entry.name) &&
        !generatedFilenames.has(entry.name);
      if (isStalePaperAssetFile) {
        await Bun.file(path.join(this.paperAssetsDir, entry.name)).delete();
      }
    }
  }
}
