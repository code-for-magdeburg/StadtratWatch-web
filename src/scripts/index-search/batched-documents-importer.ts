import { IDocumentsImporter, IndexedPaper, IndexedSpeech } from './typesense-importer.ts';


export class BatchedDocumentsImporter implements IDocumentsImporter {


  constructor(private readonly importer: IDocumentsImporter, private readonly maxBatchSize: number) {
  }


  public async importPapers(papers: IndexedPaper[]): Promise<boolean> {

    for (let i = 0; i < papers.length; i += this.maxBatchSize) {
      const papersBatch = papers.slice(i, i + this.maxBatchSize);
      if (!await this.importer.importPapers(papersBatch)) {
        return false;
      }
    }

    return true;

  }


  public async importSpeeches(speeches: IndexedSpeech[]): Promise<boolean> {

    for (let i = 0; i < speeches.length; i += this.maxBatchSize) {
      const speechesBatch = speeches.slice(i, i + this.maxBatchSize);
      if (!await this.importer.importSpeeches(speechesBatch)) {
        return false;
      }
    }

    return true;

  }


}
