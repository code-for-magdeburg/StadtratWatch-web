import { parse, ParseOptions } from '@std/csv';
import { IParsedFilesStore } from './parsed-files-store.ts';
import { IRttmFilesStore } from './rttm-files-store.ts';
import { Segment, SpeakerSegment, SpeakerWithSegments } from './types.ts';

export class RttmFilesParser {
  constructor(private readonly rttmFilesStore: IRttmFilesStore, private readonly parsedFilesStore: IParsedFilesStore) {
  }

  public process(session: string) {
    const rttmFiles = this.rttmFilesStore.getRttmFiles();
    const speakers = rttmFiles.map((rttmFile) => this.processRttmFile(rttmFile)).flat();
    this.parsedFilesStore.writeSpeakerFile(session, speakers);
  }

  private processRttmFile(rttmFile: string): SpeakerWithSegments[] {
    const rttmFileContent = this.rttmFilesStore.getRttmFileContent(rttmFile);
    const parseOptions: ParseOptions = { separator: ' ' };
    const parsed = parse(rttmFileContent, parseOptions) as string[][];

    const part = rttmFile.replace('.rttm', '').split('-').pop()!;
    const speakerSegments = parsed
      .filter((line) => !!line[7])
      .filter((line) => parseFloat(line[4]) > 1)
      .map<SpeakerSegment>((line) => {
        const startOffset = +part * 4 * 60 * 60;
        return {
          speaker: `${part}_${line[7]}`,
          start: startOffset + parseFloat(line[3]),
          duration: parseFloat(line[4]),
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
