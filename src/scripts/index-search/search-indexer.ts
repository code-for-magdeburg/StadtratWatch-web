import { ScrapedPaper, ScrapedSession } from '@srw-astro/models/scraped-session';
import { IDocumentsImporter, IndexedPaper, IndexedSpeech } from './typesense-importer.ts';
import { IPapersContentSource } from './papers-content-source.ts';
import { ISpeechesSource } from './speeches-source.ts';
import { Registry, RegistryFaction, RegistryPerson, RegistrySession } from '@srw-astro/models/registry';


function isPersonInSession (person: RegistryPerson, session: RegistrySession): boolean {
  const sessionDate = session.date;
  return (person.start === null || person.start <= sessionDate) && (person.end === null || person.end >= sessionDate);
}

function getPersonsOfSession(electoralPeriod: Registry, session: RegistrySession): RegistryPerson[] {
  return electoralPeriod.persons.filter(person => isPersonInSession(person, session))
}

function getPersonByName(electoralPeriod: Registry, session: RegistrySession,
                         personName: string): RegistryPerson | null {
  return getPersonsOfSession(electoralPeriod, session).find(person => person.name === personName) || null;
}

function getFactionOfPerson(electoralPeriod: Registry, session: RegistrySession,
                            person: RegistryPerson): RegistryFaction | null {
  return electoralPeriod.factions.find(
    faction => faction.id === person.factionId && isPersonInSession(person, session)
  ) || null;
}

function getPartyOfPerson(electoralPeriod: Registry, session: RegistrySession,
                          person: RegistryPerson): RegistryFaction | null {
  return electoralPeriod.parties.find(
    party => party.id === person.partyId && isPersonInSession(person, session)
  ) || null;
}


export class SearchIndexer {


  constructor(private readonly importer: IDocumentsImporter) {
  }


  public async indexPapers(contentSource: IPapersContentSource, scrapedSession: ScrapedSession) {

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
        const content = scrapedSession.files
          .filter(file => file.paper_original_id === paper.original_id)
          .map(file => contentSource.getContent(file.original_id));
        return {
          id: `paper-${paper.original_id}`,
          content,

          paper_name: paper.name || '',
          paper_type: paper.paper_type || '',
          paper_reference: paper.reference || ''
        };
      });

    if (!await this.importer.importPapers(papers)) {
      console.error('Failed to import papers.');
    }

  }


  public async indexSpeeches(speechesSource: ISpeechesSource) {

    const speechesWithTranscriptions = speechesSource
      .getSpeeches()
      .filter(indexableSpeech => indexableSpeech.speech.transcription)
      .map<IndexedSpeech>(indexableSpeech => {
        const { electoralPeriod, session, speech } = indexableSpeech;

        const person = getPersonByName(electoralPeriod, session, speech.speaker);
        const party = person ? getPartyOfPerson(electoralPeriod, session, person) : null;
        const faction = person ? getFactionOfPerson(electoralPeriod, session, person) : null;

        return {
          id: `speech-${session}-${speech.start}`,
          content: speech.transcription ? [speech.transcription] : [],

          speech_electoral_period: electoralPeriod.id,
          speech_session: session.id,
          speech_start: speech.start,
          speech_session_date: Date.parse(session.date),
          speech_speaker: speech.speaker,
          speech_faction: faction ? faction.name : null,
          speech_party: party ? party.name : null,
          speech_on_behalf_of: speech.onBehalfOf || null
        };
      });

    if (!await this.importer.importSpeeches(speechesWithTranscriptions)) {
      console.error('Failed to import speeches.');
    }

  }


}
