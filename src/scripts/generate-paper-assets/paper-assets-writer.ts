import * as path from '@std/path';
import { PaperAssetDto } from './model.ts';

export interface PaperAssetsWriter {
  writePaperAssets(papers: PaperAssetDto[]): void;
}

export class PaperAssetsFileWriter implements PaperAssetsWriter {
  constructor(private readonly paperAssetsDir: string) {
  }

  writePaperAssets(assets: PaperAssetDto[]): void {
    for (const asset of assets) {
      const filename = path.join(this.paperAssetsDir, `papers-${asset.batchNo}.json`);
      Deno.writeTextFileSync(filename, JSON.stringify(asset.papers, null, 2));
    }
  }
}
