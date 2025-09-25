import { assertSpyCall, assertSpyCalls, spy } from '@std/testing/mock';
import { PaperFilesCollector } from './paper-files-collector.ts';
import { IPaperFilesDownloader } from './paper-files-downloader.ts';
import { TEST_SCRAPED_SESSION } from '../shared/test-data/scraped-sessions.ts';
import { OparlObjectsFileStore } from './oparl-objects-store.ts';


const mockDownloader: IPaperFilesDownloader = {
  async downloadFile(_url: string, _id: number): Promise<void> {
  }
};


Deno.test('Download all Stadtrat 2024 files', async () => {

  const mockOparlObjectsStore = new OparlObjectsFileStore(TEST_SCRAPED_SESSION) ;
  using downloadFileSpy = spy(mockDownloader, 'downloadFile');

  const collector = new PaperFilesCollector(mockOparlObjectsStore, mockDownloader);
  await collector.collectFiles(2024);

  assertSpyCall(downloadFileSpy, 0, { args: ['http://file-0001.pdf', 1] });
  assertSpyCall(downloadFileSpy, 1, { args: ['http://file-0002.pdf', 2] });
  assertSpyCall(downloadFileSpy, 2, { args: ['http://file-0003.pdf', 3] });
  assertSpyCall(downloadFileSpy, 3, { args: ['http://file-0003.pdf', 3] });
  assertSpyCall(downloadFileSpy, 4, { args: ['http://file-0004.pdf', 4] });
  assertSpyCall(downloadFileSpy, 5, { args: ['http://file-0005.pdf', 5] });
  assertSpyCalls(downloadFileSpy, 6);

});


Deno.test('Download all Stadtrat 2025 files', async () => {

  const mockOparlObjectsStore = new OparlObjectsFileStore(TEST_SCRAPED_SESSION) ;
  using downloadFileSpy = spy(mockDownloader, 'downloadFile');

  const collector = new PaperFilesCollector(mockOparlObjectsStore, mockDownloader);
  await collector.collectFiles(2025);

  assertSpyCall(downloadFileSpy, 0, { args: ['http://file-0006.pdf', 6] });
  assertSpyCalls(downloadFileSpy, 1);

});


Deno.test('Download no 2026 files', async () => {

  const mockOparlObjectsStore = new OparlObjectsFileStore(TEST_SCRAPED_SESSION) ;
  using downloadFileSpy = spy(mockDownloader, 'downloadFile');

  const collector = new PaperFilesCollector(mockOparlObjectsStore, mockDownloader);
  await collector.collectFiles(2026);

  assertSpyCalls(downloadFileSpy, 0);

});
