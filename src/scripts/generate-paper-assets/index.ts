import * as fs from 'fs';
import * as path from 'path';
import { ScrapedFile, ScrapedMeeting, ScrapedSession } from '../shared/model/scraped-session';
import { PaperDto, PapersDto } from '../../interfaces/web-assets/Paper';


const scrapedSessionFilename = process.argv[2];
const papersDir = process.argv[3];
const outputDir = process.argv[4];
if (!scrapedSessionFilename || !papersDir || !outputDir) {
  console.error('Usage: node index.js <scrapedSessionFile> <papersDir> <outputDir>');
  process.exit(1);
}

if (!fs.existsSync(scrapedSessionFilename) || !fs.lstatSync(scrapedSessionFilename).isFile()) {
  console.error(`Scraped session file "${scrapedSessionFilename}" does not exist or is not a file.`);
  process.exit(1);
}


async function run(scrapedSession: ScrapedSession, outputDir: string): Promise<void> {

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
    fs.writeFileSync(filename, JSON.stringify(grouped[batchNo], null, 2));
  }

}


function getFileSize(meeting: ScrapedMeeting, file: ScrapedFile): number | null {

  const year = meeting.start.split('-')[0];
  const paperFilename = path.join(papersDir, year, `${file.original_id}.pdf`);

  return fs.existsSync(paperFilename) ? fs.statSync(paperFilename).size : null;

}


(async () => {

  const scrapedSession =
    JSON.parse(fs.readFileSync(scrapedSessionFilename, 'utf-8')) as ScrapedSession;
  await run(scrapedSession, outputDir);

  console.log('Done.');

})();
