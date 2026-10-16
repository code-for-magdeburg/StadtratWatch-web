import { RttmFilesParser } from './rttm-files-parser.ts';
import type { IRttmFilesStore } from './rttm-files-store.ts';
import type { IParsedFilesStore } from './parsed-files-store.ts';
import type { SpeakerWithSegments } from './types.ts';
import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';

const mockRttmFilesStore: IRttmFilesStore = {
  getRttmFiles(): Promise<string[]> {
    return Promise.resolve(['file-00.rttm', 'file-01.rttm', 'file-02.rttm']);
  },

  getRttmFileContent(rttmFile: string): Promise<string> {
    return Promise.resolve(rttmFileContent(rttmFile));
  },
};

function rttmFileContent(rttmFile: string): string {
  switch (rttmFile) {
    case 'file-00.rttm':
      return 'SPEAKER 2024-01-01-audio-01 1 456.528 10.119 <NA> <NA> SPEAKER_01 <NA> <NA>';
    case 'file-01.rttm':
      return `SPEAKER 2024-01-01-audio-02 1 467.462 2.424 <NA> <NA> SPEAKER_02 <NA> <NA>
SPEAKER 2024-01-01-audio-02 1 468.345 3.917 <NA> <NA> SPEAKER_02 <NA> <NA>`;
    case 'file-02.rttm':
      return `SPEAKER 2024-01-01-audio-03 1 480.462 1.234 <NA> <NA> SPEAKER_01 <NA> <NA>
SPEAKER 2024-01-01-audio-03 1 481.345 0.345 <NA> <NA> SPEAKER_03 <NA> <NA>`;
  }
  return '';
}

const mockParsedFilesStore: IParsedFilesStore = {
  writeSpeakerFile(_session: string, _speakers: SpeakerWithSegments[]): Promise<void> {
    return Promise.resolve();
  },
};

describe('RttmFilesParser', () => {
  afterEach(() => mock.restore());

  describe('process', () => {
    it('should filter and aggregate rttm files and write to json file', async () => {
      const writeSpeakerFileSpy = spyOn(mockParsedFilesStore, 'writeSpeakerFile');

      const parser = new RttmFilesParser(mockRttmFilesStore, mockParsedFilesStore);
      await parser.process('2024-01-01');

      expect(writeSpeakerFileSpy).toHaveBeenCalledTimes(1);
      expect(writeSpeakerFileSpy).toHaveBeenNthCalledWith(
        1,
        '2024-01-01',
        [
          {
            'speaker': '00_SPEAKER_01',
            'segments': [
              {
                'start': 456.528,
                'duration': 10.119,
              },
            ],
          },
          {
            'speaker': '01_SPEAKER_02',
            'segments': [
              {
                'start': 14867.462,
                'duration': 2.424,
              },
              {
                'start': 14868.345,
                'duration': 3.917,
              },
            ],
          },
          {
            'speaker': '02_SPEAKER_01',
            'segments': [
              {
                'start': 29280.462,
                'duration': 1.234,
              },
            ],
          },
        ],
      );
    });
  });
});
