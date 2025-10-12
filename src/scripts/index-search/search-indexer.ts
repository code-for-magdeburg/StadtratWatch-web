import { ScrapedSession } from '@srw-astro/models/scraped-session';
import { IDocumentsImporter, IndexedPaper, IndexedSpeech } from './typesense-importer.ts';
import { IPapersContentSource } from './papers-content-source.ts';
import { ISpeechesSource } from './speeches-source.ts';
import { Registry, RegistryFaction, RegistryPerson, RegistrySession } from '@srw-astro/models/registry';
import { IOparlObjectsStore } from '../shared/oparl/oparl-objects-store.ts';


function isPersonInSession (person: RegistryPerson, session: RegistrySession): boolean {
  const sessionDate = session.date;
  return (person.start === null || person.start <= sessionDate) && (person.end === null || person.end >= sessionDate);
}

function getPersonsOfSession(parliamentPeriod: Registry, session: RegistrySession): RegistryPerson[] {
  return parliamentPeriod.persons.filter(person => isPersonInSession(person, session))
}

function getPersonByName(parliamentPeriod: Registry, session: RegistrySession,
                         personName: string): RegistryPerson | null {
  return getPersonsOfSession(parliamentPeriod, session).find(person => person.name === personName) || null;
}

function getFactionOfPerson(parliamentPeriod: Registry, session: RegistrySession,
                            person: RegistryPerson): RegistryFaction | null {
  return parliamentPeriod.factions.find(
    faction => faction.id === person.factionId && isPersonInSession(person, session)
  ) || null;
}

function getPartyOfPerson(parliamentPeriod: Registry, session: RegistrySession,
                          person: RegistryPerson): RegistryFaction | null {
  return parliamentPeriod.parties.find(
    party => party.id === person.partyId && isPersonInSession(person, session)
  ) || null;
}


export class SearchIndexer {


  constructor(private readonly importer: IDocumentsImporter, private readonly oparlObjectsStore: IOparlObjectsStore) {
  }


  public async indexPapers(contentSource: IPapersContentSource, scrapedSession: ScrapedSession) {

    console.log('Importing papers...');

    const processedPaperIds: string[] = [];
    const papers: IndexedPaper[] = [];
    const meetings = this.oparlObjectsStore.getMeetings();
    meetings.forEach(meeting => {

      if (!meeting.start)
        return;

      console.log(`Indexing papers for meeting ${meeting.id} (${meeting.start})`);

      const meetingPapers = this.oparlObjectsStore
        .getPapers(meeting.id)
        .filter(paper => processedPaperIds.every(id => id !== paper.id));
      const meetingFiles = this.oparlObjectsStore.getFiles(meeting.id);

      papers.push(...meetingPapers.map<IndexedPaper>(paper => {
        const content = meetingFiles
          .filter(file => file.paper && file.paper.includes(paper.id))
          .map(file => contentSource.getContent(+file.id.split('/').pop()!));
        return {
          id: `paper-${paper.id.split('/').pop()!}`,
          content,

          paper_name: paper.name,
          paper_type: paper.paperType || '',
          paper_reference: paper.reference || ''
        };
      }));

      processedPaperIds.push(...meetingPapers.map(paper => paper.id));

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
        const { parliamentPeriod, session, speech } = indexableSpeech;

        const person = getPersonByName(parliamentPeriod, session, speech.speaker);
        const party = person ? getPartyOfPerson(parliamentPeriod, session, person) : null;
        const faction = person ? getFactionOfPerson(parliamentPeriod, session, person) : null;

        return {
          id: `speech-${session.id}-${speech.start}`,
          content: speech.transcription ? [speech.transcription] : [],

          speech_parliament_period: parliamentPeriod.id,
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
