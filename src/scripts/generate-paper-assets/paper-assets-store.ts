import * as path from '@std/path';
import { PaperAssetDto, PaperGraphAssetDto } from './model.ts';

export interface PaperAssetsStore {
  writePaperAssets(papers: PaperAssetDto[]): void;
}

export interface PaperGraphAssetsStore {
  writePaperGraphAssets(paperGraphs: PaperGraphAssetDto[]): void;
}

export class PaperAssetsFileStore implements PaperAssetsStore, PaperGraphAssetsStore {
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
