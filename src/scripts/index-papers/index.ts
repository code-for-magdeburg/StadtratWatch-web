import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import { ScrapedPaper, ScrapedSession } from '../shared/model/scraped-session';


const inputDir = process.argv[2];
const scrapedSessionFilename = process.argv[3];
const typesenseServerUrl = process.argv[4];
const papersCollectionName = process.argv[5];
const typesenseApiKey = process.argv[6];


const BATCH_SIZE = 100;


if (!inputDir || !scrapedSessionFilename || !typesenseServerUrl || !typesenseApiKey) {
  console.error('Usage: node index.js <inputDir> <scrapedSessionFile> <typesenseServerUrl> <papersCollectionName> <typesenseApiKey>');
  process.exit(1);
}


if (!fs.existsSync(scrapedSessionFilename) || !fs.lstatSync(scrapedSessionFilename).isFile()) {
  console.error(`Scraped session file "${scrapedSessionFilename}" does not exist or is not a file.`);
  process.exit(1);
}


async function runImportPapers(contentDir: string, scrapedSession: ScrapedSession) {

  console.log('Importing papers...');

  const councilMeetings = scrapedSession.meetings.filter(
    meeting => meeting.organization_name === 'Stadtrat'
  );
  const agendaItems = scrapedSession.agenda_items.filter(
    agendaItem => councilMeetings.some(meeting => meeting.original_id === agendaItem.meeting_id)
  );

  const relevantPapers = scrapedSession.papers.filter(
    paper => agendaItems.some(
      agendaItem => agendaItem.paper_original_id === paper.original_id
    )
  );

  // Papers can be duplicated in the scraped session, so we need to deduplicate them.
  // Duplicate entries can differ in the sort_date property, so we keep the one with the
  // highest sort_date.
  const paperMap = new Map<number, ScrapedPaper>();
  for (const paper of relevantPapers) {
    if (!paperMap.has(paper.original_id) || paperMap.get(paper.original_id)!.sort_date < paper.sort_date) {
      paperMap.set(paper.original_id, paper);
    }
  }

  const papers = Array.from(paperMap.values());

  for (let i = 0; i < papers.length; i += BATCH_SIZE) {

    const data = papers
      .slice(i, i + BATCH_SIZE)
      .map(paper => {

        const files = scrapedSession.files.filter(
          file => file.paper_original_id === paper.original_id
        );
        const files_content = files.map(file => {
          const filename = `${file.original_id}.pdf.txt`;
          return fs.readFileSync(path.join(contentDir, filename), 'utf-8');
        });
        return {
          id: `${paper.original_id}`,
          name: paper.name || '',
          type: paper.paper_type || '',
          reference: paper.reference || '',
          sort_date: Date.parse(paper.sort_date),
          files_content
        };

      })
      .filter(documents => documents !== null)
      .map(document => JSON.stringify(document))
      .join('\n');
    const result = await axios.post(
      `${typesenseServerUrl}/collections/${papersCollectionName}/documents/import`,
      data,
      {
        headers: {
          'X-TYPESENSE-API-KEY': typesenseApiKey,
          'Content-Type': 'text/plain'
        },
        params: { action: 'upsert' }
      });

    if (result.status !== 200) {
      console.error(`Failed to import paper documents: ${result.data}`);
    } else {
      console.log(`Imported ${i + BATCH_SIZE} paper documents.`);
    }

  }

}


(async () => {

  const scrapedSession =
    JSON.parse(fs.readFileSync(scrapedSessionFilename, 'utf-8')) as ScrapedSession;
  await runImportPapers(inputDir, scrapedSession);

  console.log('Done.');

})();
