import { ScrapedFile, ScrapedMeeting } from '../shared/model/scraped-session.ts';
import { PaperAssetsGenerator } from './paper-assets-generator.ts';
import { IPaperFilesStore } from './paper-files-store.ts';
import { IPaperAssetsStore } from './paper-assets-store.ts';
import { PaperDto } from '@srw-astro/models';
import { assertSpyCall, assertSpyCalls, spy } from '@std/testing/mock';
import { EMPTY_SCRAPED_SESSION, TEST_SCRAPED_SESSION } from '../shared/test-data/scraped-sessions.ts';


const mockPaperFilesStore: IPaperFilesStore = {
  getFileSize: function (_meeting: ScrapedMeeting, _file: ScrapedFile): number | null {
    return 1234;
  },
};


const mockAssetsStore: IPaperAssetsStore = {
  writePaperAssets: function (_papers: PaperDto[]): void {
    return;
  },
};


Deno.test('Write paper assets', () => {

  using writePaperAssetsSpy = spy(mockAssetsStore, 'writePaperAssets');

  const generator = new PaperAssetsGenerator(mockPaperFilesStore, mockAssetsStore);
  generator.generatePaperAssets(TEST_SCRAPED_SESSION);

  assertSpyCalls(writePaperAssetsSpy, 1);
  assertSpyCall(
    writePaperAssetsSpy,
    0,
    {
      args: [
        [
          {
            'id': 1,
            'reference': 'P01',
            'type': 'Antrag',
            'title': 'P01',
            'files': [
              {
                'id': 1,
                'name': 'F01',
                'url': 'http://file-0001.pdf',
                'size': 1234,
              },
            ],
          },
          {
            'id': 2,
            'reference': 'P02',
            'type': 'Änderungsantrag',
            'title': 'P02',
            'files': [
              {
                'id': 2,
                'name': 'F02',
                'url': 'http://file-0002.pdf',
                'size': 1234,
              },
            ],
          },
          {
            'id': 3,
            'reference': 'P03',
            'type': 'Beschlussvorlage',
            'title': 'P03',
            'files': [
              {
                'id': 3,
                'name': 'F03',
                'url': 'http://file-0003.pdf',
                'size': 1234,
              },
            ],
          },
          {
            'id': 4,
            'reference': 'P04',
            'type': null,
            'title': 'P04',
            'files': [
              {
                'id': 4,
                'name': 'F04',
                'url': 'http://file-0004.pdf',
                'size': 1234,
              },
              {
                'id': 5,
                'name': 'F05',
                'url': 'http://file-0005.pdf',
                'size': 1234,
              },
            ],
          },
          {
            'id': 5,
            'reference': 'P05',
            'type': null,
            'title': 'P05',
            'files': [],
          },
          {
            'id': 6,
            'reference': 'P06',
            'type': null,
            'title': 'P06',
            'files': [
              {
                'id': 6,
                'name': 'F06',
                'url': 'http://file-0006.pdf',
                'size': 1234,
              },
            ],
          },
        ],
      ],
    },
  );

});


Deno.test('No paper assets from empty scraped session', () => {

  using writePaperAssetsSpy = spy(mockAssetsStore, 'writePaperAssets');

  const generator = new PaperAssetsGenerator(mockPaperFilesStore, mockAssetsStore);
  generator.generatePaperAssets(EMPTY_SCRAPED_SESSION);

  assertSpyCalls(writePaperAssetsSpy, 1);
  assertSpyCall(writePaperAssetsSpy, 0, { args: [[]] });

});
