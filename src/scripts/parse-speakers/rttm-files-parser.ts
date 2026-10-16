import type { IParsedFilesStore } from './parsed-files-store.ts';
import type { IRttmFilesStore } from './rttm-files-store.ts';
import type { Segment, SpeakerSegment, SpeakerWithSegments } from './types.ts';

export class RttmFilesParser {
  constructor(private readonly rttmFilesStore: IRttmFilesStore, private readonly parsedFilesStore: IParsedFilesStore) {
  }

  public async process(session: string) {
    const rttmFiles = await this.rttmFilesStore.getRttmFiles();
    const speakersPerFile = await Promise.all(rttmFiles.map((rttmFile) => this.processRttmFile(rttmFile)));
    await this.parsedFilesStore.writeSpeakerFile(session, speakersPerFile.flat());
  }

  private async processRttmFile(rttmFile: string): Promise<SpeakerWithSegments[]> {
    const rttmFileContent = await this.rttmFilesStore.getRttmFileContent(rttmFile);
    const rttmLines = parseRttmLines(rttmFileContent);

    const part = rttmFile.replace('.rttm', '').split('-').pop()!;
    const speakerSegments = rttmLines
      .filter((line) => !!line[7])
      .filter((line) => Number.parseFloat(line[4]) > 1)
      .map<SpeakerSegment>((line) => {
        const startOffset = +part * 4 * 60 * 60;
        return {
          speaker: `${part}_${line[7]}`,
          start: startOffset + Number.parseFloat(line[3]),
          duration: Number.parseFloat(line[4]),
        };
      })
      .sort((a, b) => a.speaker.localeCompare(b.speaker));

    const bySpeaker = speakerSegments.reduce((acc, line) => {
      if (!acc[line.speaker]) {
        acc[line.speaker] = [];
      }
      acc[line.speaker].push({ start: line.start, duration: line.duration });
      return acc;
    }, {} as Record<string, Segment[]>);

    return Object
      .keys(bySpeaker)
      .map((speaker) => ({ speaker, segments: bySpeaker[speaker] }));
  }
}

function parseRttmLines(rttmFileContent: string): string[][] {
  return rttmFileContent
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '')
    .map((line) => line.trim().split(/\s+/));
}
