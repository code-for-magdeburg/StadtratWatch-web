import * as fs from '@std/fs';
import * as path from '@std/path';
import { ScrapedFile, ScrapedMeeting, ScrapedSession } from '../shared/model/scraped-session.ts';
import { PaperDto, PapersDto } from '@scope/interfaces-web-assets';
import { checkArgs, parseArgs, printHelpText } from './cli.ts';


const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);


const scrapedSession = JSON.parse(Deno.readTextFileSync(args.scrapedSessionFilename)) as ScrapedSession;
run(scrapedSession, args.outputDir);

console.log('Done.');


function run(scrapedSession: ScrapedSession, outputDir: string) {

  const allPapers: PapersDto = [];

  scrapedSession.meetings
    .filter(
      meeting =>
        !meeting.cancelled
        && !!meeting.original_id
        && meeting.organization_name === 'Stadtrat'
      // && meeting.start >= '2019'
    )
    .forEach(meeting => {

      scrapedSession.agenda_items
        .filter(
          agendaItem =>
            agendaItem.meeting_id === meeting.original_id
            && !!agendaItem.paper_original_id
            && !allPapers.find(paper => paper.id === agendaItem.paper_original_id)
        )
        .forEach(agendaItem => {

          const files = scrapedSession.files
            .filter(file => file.paper_original_id === agendaItem.paper_original_id)
            .map(file => ({
              id: file.original_id,
              name: file.name,
              url: file.url,
              size: getFileSize(meeting, file),
            }));
          const paper = scrapedSession.papers.find(
            p => p.original_id === agendaItem.paper_original_id
          );
          allPapers.push({
            id: agendaItem.paper_original_id,
            reference: agendaItem.paper_reference,
            type: paper ? paper.paper_type : null,
            title: paper ? paper.name : '',
            files,
          });

        });

    });

  const flattened = allPapers.flat().sort((a, b) => a.id - b.id);
  console.log('Found papers: ', flattened.length);

  // Group papers (flattened) in batches of 1000.
  const grouped = flattened.reduce((acc, paper) => {
    const batchNo = `${Math.floor(paper.id / 1000)}`.padStart(4, '0');
    if (!acc[batchNo]) {
      acc[batchNo] = [];
    }
    acc[batchNo].push(paper);
    return acc;
  }, {} as { [batchNo: string]: PaperDto[] });

  for (const batchNo in grouped) {
    const filename = path.join(outputDir, `papers-${batchNo}.json`);
    Deno.writeTextFileSync(filename, JSON.stringify(grouped[batchNo], null, 2));
  }

}


function getFileSize(meeting: ScrapedMeeting, file: ScrapedFile): number | null {

  const year = meeting.start.split('-')[0];
  const paperFilename = path.join(args.papersDir, year, `${file.original_id}.pdf`);

  return fs.existsSync(paperFilename) ? Deno.statSync(paperFilename).size : null;

}
