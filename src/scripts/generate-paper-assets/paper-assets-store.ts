import * as path from '@std/path';
import { PaperDto } from '@scope/interfaces-web-assets';


export interface IPaperAssetsStore {
  writePaperAssets(papers: PaperDto[]): unknown;
}


export class PaperAssetsStore implements IPaperAssetsStore {


  constructor(private readonly paperAssetsDir: string) {
  }


  writePaperAssets(papers: PaperDto[]): void {

    // Group papers in batches of 1000.
    const grouped = papers
      .sort((a, b) => a.id - b.id)
      .reduce((acc, paper) => {
        const batchNo = `${Math.floor(paper.id / 1000)}`.padStart(4, '0');
        if (!acc[batchNo]) {
          acc[batchNo] = [];
        }
        acc[batchNo].push(paper);
        return acc;
      }, {} as { [batchNo: string]: PaperDto[] });

    for (const batchNo in grouped) {
      const filename = path.join(this.paperAssetsDir, `papers-${batchNo}.json`);
      Deno.writeTextFileSync(filename, JSON.stringify(grouped[batchNo], null, 2));
    }

  }


}
