import { mkdir, readdir } from 'node:fs/promises';
import * as path from 'node:path';

import type { PaperGraphAssetDto } from './model.ts';

export interface PaperGraphAssetsWriter {
  writePaperGraphAssets(assets: PaperGraphAssetDto[]): Promise<void>;
}

export class PaperGraphAssetsFileWriter implements PaperGraphAssetsWriter {
  constructor(private readonly paperAssetsDir: string) {}

  async writePaperGraphAssets(assets: PaperGraphAssetDto[]): Promise<void> {
    await mkdir(this.paperAssetsDir, { recursive: true });

    const generatedFilenames = await this.writePaperGraphAssetFiles(assets);
    await this.removeStalePaperGraphAssetFiles(generatedFilenames);
  }

  private async writePaperGraphAssetFiles(assets: PaperGraphAssetDto[]): Promise<Set<string>> {
    const generatedFilenames = new Set<string>();
    for (const asset of assets) {
      const filename = `paper-graphs-${asset.batchNo}.json`;
      generatedFilenames.add(filename);
      const filePath = path.join(this.paperAssetsDir, filename);
      await Bun.write(filePath, JSON.stringify(asset.paperGraphs, null, 2));
    }
    return generatedFilenames;
  }

  private async removeStalePaperGraphAssetFiles(generatedFilenames: Set<string>): Promise<void> {
    for (const entry of await readdir(this.paperAssetsDir, { withFileTypes: true })) {
      const isStalePaperGraphAssetFile =
        entry.isFile() && /^paper-graphs-.*\.json$/.test(entry.name) && !generatedFilenames.has(entry.name);
      if (isStalePaperGraphAssetFile) {
        await Bun.file(path.join(this.paperAssetsDir, entry.name)).delete();
      }
    }
  }
}
