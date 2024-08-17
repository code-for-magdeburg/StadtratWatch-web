import * as fs from 'fs';
import * as path from 'path';
import { ScrapedSession } from '../shared/model/scraped-session';


const scrapedSessionFilename = process.argv[2];
const outputDir = process.argv[3];
if (!scrapedSessionFilename || !outputDir) {
  console.error('Usage: node index.js <scrapedSessionFile> <outputDir>');
  process.exit(1);
}

if (!fs.existsSync(scrapedSessionFilename) || !fs.lstatSync(scrapedSessionFilename).isFile()) {
  console.error(`Scraped session file "${scrapedSessionFilename}" does not exist or is not a file.`);
  process.exit(1);
}


async function run(scrapedSession: ScrapedSession, outputDir: string): Promise<void> {

  const allPapers: { id: number, reference: string | null }[] = [];

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
          if (agendaItem.paper_original_id) {
            allPapers.push({
              id: agendaItem.paper_original_id,
              reference: agendaItem.paper_reference
            });
          }
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
  }, {} as { [batchNo: string]: any[] });

  for (const batchNo in grouped) {
    const filename = path.join(outputDir, `papers-${batchNo}.json`);
    fs.writeFileSync(filename, JSON.stringify(grouped[batchNo], null, 2));
  }

}


(async () => {

  const scrapedSession =
    JSON.parse(fs.readFileSync(scrapedSessionFilename, 'utf-8')) as ScrapedSession;
  await run(scrapedSession, outputDir);

  console.log('Done.');

})();
