import * as path from '@std/path';
import { PaperAssetDto } from './model.ts';

export interface PaperAssetsWriter {
  writePaperAssets(papers: PaperAssetDto[]): void;
}

export class PaperAssetsFileWriter implements PaperAssetsWriter {
  constructor(private readonly paperAssetsDir: string) {
  }

  writePaperAssets(papers: PaperAssetDto[]): void {
    // Group papers in batches of 100.
    const grouped = papers
      .sort((a, b) => a.id - b.id)
      .reduce((acc, paper) => {
        const batchNo = `${Math.floor(paper.id / 100)}`.padStart(4, '0');
        if (!acc[batchNo]) {
          acc[batchNo] = [];
        }
        acc[batchNo].push(paper);
        return acc;
      }, {} as { [batchNo: string]: PaperAssetDto[] });

    for (const batchNo in grouped) {
      const filename = path.join(this.paperAssetsDir, `papers-${batchNo}.json`);
      Deno.writeTextFileSync(filename, JSON.stringify(grouped[batchNo], null, 2));
    }
  }
}
