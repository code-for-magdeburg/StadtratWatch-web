import { PaperFilesCollector } from './paper-files-collector.ts';
import type { IOparlObjectsStore } from '../shared/oparl/oparl-objects-store.ts';
import type { IPaperFilesDownloader } from './paper-files-downloader.ts';
import type { OparlFile, OparlMeeting } from '../shared/model/oparl.ts';
import { assertSpyCall, assertSpyCalls, spy } from '@std/testing/mock';
import { describe, it } from '@std/testing/bdd';

const mockMeetings: OparlMeeting[] = [
  {
    id: 'https://example.com/meeting/1',
    type: 'https://schema.oparl.org/1.1/Meeting',
    start: '2024-01-15T10:00:00',
    name: 'Meeting 2024-01',
    organization: ['org-1'],
    cancelled: false,
  },
  {
    id: 'https://example.com/meeting/2',
    type: 'https://schema.oparl.org/1.1/Meeting',
    start: '2024-03-20T14:00:00',
    name: 'Meeting 2024-03',
    organization: ['org-1'],
    cancelled: false,
  },
  {
    id: 'https://example.com/meeting/3',
    type: 'https://schema.oparl.org/1.1/Meeting',
    start: '2023-12-10T09:00:00',
    name: 'Meeting 2023-12',
    organization: ['org-1'],
    cancelled: false,
  },
  {
    id: 'https://example.com/meeting/4',
    type: 'https://schema.oparl.org/1.1/Meeting',
    start: '2024-06-05T11:00:00',
    name: 'Meeting 2024-06 (no files)',
    organization: ['org-1'],
    cancelled: false,
  },
];

const mockFiles: Record<string, OparlFile[]> = {
  'https://example.com/meeting/1': [
    {
      id: 'https://example.com/file/101',
      type: 'https://schema.oparl.org/1.1/File',
      name: 'Document 101.pdf',
      accessUrl: 'https://example.com/files/101.pdf',
    },
    {
      id: 'https://example.com/file/102',
      type: 'https://schema.oparl.org/1.1/File',
      name: 'Document 102.pdf',
      accessUrl: 'https://example.com/files/102.pdf',
    },
  ],
  'https://example.com/meeting/2': [
    {
      id: 'https://example.com/file/201',
      type: 'https://schema.oparl.org/1.1/File',
      name: 'Document 201.pdf',
      accessUrl: 'https://example.com/files/201.pdf',
    },
  ],
  'https://example.com/meeting/3': [
    {
      id: 'https://example.com/file/301',
      type: 'https://schema.oparl.org/1.1/File',
      name: 'Document 301.pdf',
      accessUrl: 'https://example.com/files/301.pdf',
    },
  ],
  'https://example.com/meeting/4': [],
};

const mockOparlObjectsStore: IOparlObjectsStore = {
  getMeetings(): OparlMeeting[] {
    return mockMeetings;
  },

  getAgendaItems(_meetingId: string) {
    return [];
  },

  getConsultations(_meetingId: string) {
    return [];
  },

  getPapers(_meetingId: string) {
    return [];
  },

  getFiles(meetingId: string): OparlFile[] {
    return mockFiles[meetingId] || [];
  },
};

const mockDownloader: IPaperFilesDownloader = {
  async downloadFile(_fileId: string): Promise<void> {
    // Mock implementation
  },
};

describe('PaperFilesCollector', () => {
  describe('collectFiles', () => {
    it('should not download any files when no meetings exist for the year', async () => {
      using downloadFileSpy = spy(mockDownloader, 'downloadFile');

      const collector = new PaperFilesCollector(mockOparlObjectsStore, mockDownloader);
      await collector.collectFiles('2025');

      assertSpyCalls(downloadFileSpy, 0);
    });

    it('should download files for a single meeting in the specified year', async () => {
      using downloadFileSpy = spy(mockDownloader, 'downloadFile');

      const collector = new PaperFilesCollector(mockOparlObjectsStore, mockDownloader);
      await collector.collectFiles('2023');

      assertSpyCalls(downloadFileSpy, 1);
      assertSpyCall(downloadFileSpy, 0, {
        args: ['https://example.com/file/301'],
      });
    });

    it('should download files for all meetings in the specified year', async () => {
      using downloadFileSpy = spy(mockDownloader, 'downloadFile');

      const collector = new PaperFilesCollector(mockOparlObjectsStore, mockDownloader);
      await collector.collectFiles('2024');

      assertSpyCalls(downloadFileSpy, 3);
      assertSpyCall(downloadFileSpy, 0, {
        args: ['https://example.com/file/101'],
      });
      assertSpyCall(downloadFileSpy, 1, {
        args: ['https://example.com/file/102'],
      });
      assertSpyCall(downloadFileSpy, 2, {
        args: ['https://example.com/file/201'],
      });
    });

    it('should handle meetings without files gracefully', async () => {
      using downloadFileSpy = spy(mockDownloader, 'downloadFile');

      // Create a custom store that returns only the meeting without files
      const customStore: IOparlObjectsStore = {
        ...mockOparlObjectsStore,
        getMeetings(): OparlMeeting[] {
          return [mockMeetings[3]]; // Meeting 4 has no files
        },
      };

      const collector = new PaperFilesCollector(customStore, mockDownloader);
      await collector.collectFiles('2024');

      assertSpyCalls(downloadFileSpy, 0);
    });

    it('should only process meetings that start with the specified year', async () => {
      using getMeetingsSpy = spy(mockOparlObjectsStore, 'getMeetings');
      using downloadFileSpy = spy(mockDownloader, 'downloadFile');

      const collector = new PaperFilesCollector(mockOparlObjectsStore, mockDownloader);
      await collector.collectFiles('2024');

      assertSpyCalls(getMeetingsSpy, 1);

      // Should download files from meetings 1, 2, and 4 (all from 2024), but meeting 4 has no files
      // So total downloads: 2 files from meeting 1 + 1 file from meeting 2 = 3 downloads
      assertSpyCalls(downloadFileSpy, 3);
    });

    it('should process meetings in sequence', async () => {
      const downloadOrder: string[] = [];

      const trackingDownloader: IPaperFilesDownloader = {
        downloadFile(fileId: string) {
          downloadOrder.push(fileId);
        },
      };

      const collector = new PaperFilesCollector(mockOparlObjectsStore, trackingDownloader);
      await collector.collectFiles('2024');

      // Verify files are downloaded in order: meeting 1, then meeting 2, then meeting 4 (no files)
      if (downloadOrder.length !== 3) {
        throw new Error(`Expected 3 downloads, got ${downloadOrder.length}`);
      }

      if (downloadOrder[0] !== 'https://example.com/file/101') {
        throw new Error(`Expected first download to be file 101, got ${downloadOrder[0]}`);
      }

      if (downloadOrder[1] !== 'https://example.com/file/102') {
        throw new Error(`Expected second download to be file 102, got ${downloadOrder[1]}`);
      }

      if (downloadOrder[2] !== 'https://example.com/file/201') {
        throw new Error(`Expected third download to be file 201, got ${downloadOrder[2]}`);
      }
    });
  });
});
