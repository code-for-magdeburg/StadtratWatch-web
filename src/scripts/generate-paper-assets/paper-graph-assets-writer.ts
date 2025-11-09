import * as path from '@std/path';
import { PaperGraphAssetDto } from './model.ts';

export interface PaperGraphAssetsWriter {
  writePaperGraphAssets(paperGraphs: PaperGraphAssetDto[]): void;
}

export class PaperGraphAssetsFileWriter implements PaperGraphAssetsWriter {
  constructor(private readonly paperAssetsDir: string) {
  }

  writePaperGraphAssets(paperGraphs: PaperGraphAssetDto[]): void {
    // Group paper graphs in batches of 100.
    const grouped = paperGraphs
      .sort((a, b) => a.rootPaperId - b.rootPaperId)
      .reduce((acc, paperGraph) => {
        const batchNo = `${Math.floor(paperGraph.rootPaperId / 100)}`.padStart(4, '0');
        if (!acc[batchNo]) {
          acc[batchNo] = [];
        }
        acc[batchNo].push(paperGraph);
        return acc;
      }, {} as { [batchNo: string]: PaperGraphAssetDto[] });

    for (const batchNo in grouped) {
      const filename = path.join(this.paperAssetsDir, `paper-graphs-${batchNo}.json`);
      Deno.writeTextFileSync(filename, JSON.stringify(grouped[batchNo], null, 2));
    }
  }
}
