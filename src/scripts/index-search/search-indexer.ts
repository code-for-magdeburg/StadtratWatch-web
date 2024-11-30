import { ScrapedPaper, ScrapedSession } from '../shared/model/scraped-session.ts';
import * as path from '@std/path';
import * as fs from '@std/fs';
import { Registry } from '../shared/model/registry.ts';
import { SessionConfig } from '../shared/model/session-config.ts';
import { SessionSpeech } from '../shared/model/session-speech.ts';
import { IndexedPaper, IndexedSpeech, IDocumentsImporter } from './typesense-importer.ts';


export class SearchIndexer {


  constructor(private readonly importer: IDocumentsImporter) {
  }


  public async indexPapers(contentDir: string, scrapedSession: ScrapedSession) {

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

    const papers = Array
      .from(paperMap.values())
      .map<IndexedPaper>(paper => {
        const files = scrapedSession.files.filter(
          file => file.paper_original_id === paper.original_id
        );
        const files_content = files.map(file => {
          const filename = `${file.original_id}.pdf.txt`;
          return Deno.readTextFileSync(path.join(contentDir, filename));
        });
        return {
          id: `paper-${paper.original_id}`,
          content: files_content,

          paper_name: paper.name || '',
          paper_type: paper.paper_type || '',
          paper_reference: paper.reference || ''
        };
      });

    if (!await this.importer.importPapers(papers)) {
      console.error('Failed to import papers.');
    }

  }


  public async indexSpeeches(electoralPeriodsBaseDir: string) {

    const electoralPeriods = Array
      .from(Deno.readDirSync(electoralPeriodsBaseDir))
      .filter(entry => Deno.statSync(path.join(electoralPeriodsBaseDir, entry.name)).isDirectory)
      .filter(entry => fs.existsSync(path.join(electoralPeriodsBaseDir, entry.name, 'registry.json')))
      .map(entry => entry.name);

    for (const electoralPeriod of electoralPeriods) {
      const electoralPeriodDir = path.join(electoralPeriodsBaseDir, electoralPeriod);
      const registry = JSON.parse(Deno.readTextFileSync(path.join(electoralPeriodDir, 'registry.json')));
      await this.indexSpeechesForElectoralPeriod(electoralPeriodDir, registry);
    }

  }


  private async indexSpeechesForElectoralPeriod(contentDir: string, registry: Registry) {

    console.log(`Importing speeches for ${registry.electoralPeriod}`);

    const sessions = Array
      .from(Deno.readDirSync(contentDir))
      .filter(entry => Deno.statSync(path.join(contentDir, entry.name)).isDirectory)
      .map(entry => entry.name)
      .filter(session => fs.existsSync(path.join(contentDir, session, `config-${session}.json`)))
      .filter(session => fs.existsSync(path.join(contentDir, session, `session-speeches-${session}.json`)));

    for (const session of sessions) {
      const config = JSON.parse(
        Deno.readTextFileSync(path.join(contentDir, session, `config-${session}.json`))
      ) as SessionConfig;
      const speeches = JSON.parse(
        Deno.readTextFileSync(path.join(contentDir, session, `session-speeches-${session}.json`))
      ) as SessionSpeech[];
      await this.indexSessionSpeeches(registry, session, config, speeches);
    }

  }


  private async indexSessionSpeeches(registry: Registry, session: string, config: SessionConfig,
                       speeches: SessionSpeech[]) {

    console.log(`Indexing speeches for session ${session}...`);

    const speechesWithTranscriptions = speeches
      .filter(speech => speech.transcription)
      .map<IndexedSpeech>(speech => {
        const person = config.names.find(name => name.name === speech.speaker);
        const party = person ? person.party : null;
        const faction = person ? person.faction : null;
        return {
          id: `speech-${session}-${speech.start}`,
          content: speech.transcription ? [speech.transcription] : [],

          speech_electoral_period: registry.electoralPeriod,
          speech_session: session,
          speech_start: speech.start,
          speech_session_date: Date.parse(session),
          speech_speaker: speech.speaker,
          speech_faction: faction,
          speech_party: party,
          speech_on_behalf_of: speech.onBehalfOf || null
        };
      });


    if (!await this.importer.importSpeeches(speechesWithTranscriptions)) {
      console.error('Failed to import speeches.');
    }

  }


}
