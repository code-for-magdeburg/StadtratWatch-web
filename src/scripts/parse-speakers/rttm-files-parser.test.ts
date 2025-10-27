import { RttmFilesParser } from './rttm-files-parser.ts';
import type { IRttmFilesStore } from './rttm-files-store.ts';
import type { IParsedFilesStore } from './parsed-files-store.ts';
import type { SpeakerWithSegments } from './types.ts';
import { assertSpyCall, assertSpyCalls, spy } from '@std/testing/mock';
import { describe, it } from '@std/testing/bdd';

const mockRttmFilesStore: IRttmFilesStore = {
  getRttmFiles(): string[] {
    return ['file-00.rttm', 'file-01.rttm', 'file-02.rttm'];
  },

  getRttmFileContent(rttmFile: string): string {
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
  },
};

const mockParsedFilesStore: IParsedFilesStore = {
  writeSpeakerFile(_session: string, _speakers: SpeakerWithSegments[]) {
  },
};

describe('RttmFilesParser', () => {
  describe('process', () => {
    it('should filter and aggregate rttm files and write to json file', () => {
      using writeSpeakerFileSpy = spy(mockParsedFilesStore, 'writeSpeakerFile');

      const parser = new RttmFilesParser(mockRttmFilesStore, mockParsedFilesStore);
      parser.process('2024-01-01');

      assertSpyCalls(writeSpeakerFileSpy, 1);
      assertSpyCall(
        writeSpeakerFileSpy,
        0,
        {
          args: [
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
          ],
        },
      );
    });
  });
});
