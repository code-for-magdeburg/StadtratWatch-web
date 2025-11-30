import * as path from '@std/path';
import { PaperGraphAssetDto } from './model.ts';

export interface PaperGraphAssetsWriter {
  writePaperGraphAssets(assets: PaperGraphAssetDto[]): void;
}

export class PaperGraphAssetsFileWriter implements PaperGraphAssetsWriter {
  constructor(private readonly paperAssetsDir: string) {
  }

  writePaperGraphAssets(assets: PaperGraphAssetDto[]): void {
    for (const asset of assets) {
      const filename = path.join(this.paperAssetsDir, `paper-graphs-${asset.batchNo}.json`);
      Deno.writeTextFileSync(filename, JSON.stringify(asset.paperGraphs, null, 2));
    }
  }
}
