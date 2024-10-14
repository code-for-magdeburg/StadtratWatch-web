import { ScrapedPaper, ScrapedSession } from '../shared/model/scraped-session';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';


const BATCH_SIZE = 100;


export async function indexPapers(contentDir: string, scrapedSession: ScrapedSession) {

  console.log('Importing papers...');

  const { TYPESENSE_SERVER_URL, TYPESENSE_COLLECTION_NAME, TYPESENSE_API_KEY } = process.env;

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
          id: `paper-${paper.original_id}`,
          type: 'paper',

          paper_name: paper.name || '',
          paper_type: paper.paper_type || '',
          paper_reference: paper.reference || '',
          paper_files_content: files_content,

          speech_electoral_period: '',
          speech_session: '',
          speech_start: 0,
          speech_session_date: 0,
          speech_speaker: '',
          speech_faction: null,
          speech_party: null,
          speech_on_behalf_of: null,
          speech_transcription: ''
        };

      })
      .filter(documents => documents !== null)
      .map(document => JSON.stringify(document))
      .join('\n');
    const result = await axios.post(
      `${TYPESENSE_SERVER_URL}/collections/${TYPESENSE_COLLECTION_NAME}/documents/import`,
      data,
      {
        headers: {
          'X-TYPESENSE-API-KEY': TYPESENSE_API_KEY,
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
