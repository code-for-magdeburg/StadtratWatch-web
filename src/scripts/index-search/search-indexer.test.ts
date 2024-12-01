import { assertSpyCall, assertSpyCalls, spy } from '@std/testing/mock';
import { SearchIndexer } from './search-indexer.ts';
import { IDocumentsImporter, IndexedPaper, IndexedSpeech } from './typesense-importer.ts';
import { EMPTY_SCRAPED_SESSION, TEST_SCRAPED_SESSION } from '../shared/test-data/scraped-sessions.ts';
import { IPapersContentSource } from './papers-content-source.ts';


const mockImporter: IDocumentsImporter = {
  importPapers: (_papers: IndexedPaper[]): Promise<boolean> => Promise.resolve(true),
  importSpeeches: (_speeches: IndexedSpeech[]): Promise<boolean> => Promise.resolve(true),
};


class PapersContentSourceStub implements IPapersContentSource {
  getContent(_fileId: number): string {
    return 'lorem ipsum';
  }
}


Deno.test('Paper contents are indexed', async () => {

  using importPapersSpy = spy(mockImporter, 'importPapers');

  const searchIndex = new SearchIndexer(mockImporter);
  const contentSourceStub = new PapersContentSourceStub();
  await searchIndex.indexPapers(contentSourceStub, TEST_SCRAPED_SESSION);

  assertSpyCalls(importPapersSpy, 1);
  assertSpyCall(importPapersSpy, 0, {
    args: [
      [
        {
          "id": "paper-1",
          "content": [
            "lorem ipsum"
          ],
          "paper_name": "P01",
          "paper_type": "",
          "paper_reference": "P01"
        },
        {
          "id": "paper-2",
          "content": [
            "lorem ipsum"
          ],
          "paper_name": "P02",
          "paper_type": "",
          "paper_reference": "P02"
        },
        {
          "id": "paper-3",
          "content": [
            "lorem ipsum"
          ],
          "paper_name": "P03",
          "paper_type": "",
          "paper_reference": "P03"
        },
        {
          "id": "paper-4",
          "content": [
            "lorem ipsum",
            "lorem ipsum"
          ],
          "paper_name": "P04",
          "paper_type": "",
          "paper_reference": "P04"
        },
        {
          "id": "paper-5",
          "content": [],
          "paper_name": "P05",
          "paper_type": "",
          "paper_reference": "P05"
        },
        {
          "id": "paper-6",
          "content": [
            "lorem ipsum"
          ],
          "paper_name": "P06",
          "paper_type": "",
          "paper_reference": "P06"
        }
      ]
    ]
  });

});


Deno.test('No paper contents are indexed from empty scraped session', async () => {

  using importPapersSpy = spy(mockImporter, 'importPapers');

  const searchIndex = new SearchIndexer(mockImporter);
  const contentSourceStub = new PapersContentSourceStub();
  await searchIndex.indexPapers(contentSourceStub, EMPTY_SCRAPED_SESSION);

  assertSpyCalls(importPapersSpy, 1);
  assertSpyCall(importPapersSpy, 0, { args: [[]] });

});
