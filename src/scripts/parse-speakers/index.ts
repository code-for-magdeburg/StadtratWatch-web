import * as fs from '@std/fs';
import * as path from '@std/path';
import { parse, ParseOptions } from '@std/csv';
import { checkArgs, parseArgs, printHelpText } from './cli.ts';


type Segment = {
  start: number;
  duration: number;
};

type SpeakerSegment = {
  speaker: string;
  start: number;
  duration: number;
};

type SpeakerWithSegments = {
  speaker: string;
  segments: Segment[];
};


const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);


processSession(args.session);
console.log('Done.');


function processSession(session: string) {

  const rttmFiles = Array
    .from(Deno.readDirSync(args.inputDir))
    .filter(entry => entry.isFile)
    .map((file) => file.name)
    .filter((file) => file.endsWith('.rttm'));

  fs.ensureDirSync(args.outputDir);

  const speakers = rttmFiles.map((rttmFile) => processRttmFile(rttmFile)).flat();
  console.log(`Writing session-speakers-${session}.json`);
  Deno.writeTextFileSync(
    path.join(args.outputDir, `session-speakers-${session}.json`),
    JSON.stringify(speakers, null, 4),
  );

}


function processRttmFile(rttmFile: string): SpeakerWithSegments[] {

  const filename = path.join(args.inputDir, rttmFile);
  const rttmFileContent = Deno.readTextFileSync(filename);
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
