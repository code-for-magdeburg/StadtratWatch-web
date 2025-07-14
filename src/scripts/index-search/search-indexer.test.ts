import { assertSpyCall, assertSpyCalls, spy } from '@std/testing/mock';
import { SearchIndexer } from './search-indexer.ts';
import { IDocumentsImporter, IndexedPaper, IndexedSpeech } from './typesense-importer.ts';
import { EMPTY_SCRAPED_SESSION, TEST_SCRAPED_SESSION } from '../shared/test-data/scraped-sessions.ts';
import { IPapersContentSource } from './papers-content-source.ts';
import { IndexableSpeech, ISpeechesSource } from './speeches-source.ts';
import { Registry } from "@srw-astro/models/registry"
import { RegistryFaction, RegistryParty, RegistryPerson, RegistrySession } from '../../../astro/src/models/registry.ts';


const mockImporter: IDocumentsImporter = {
  importPapers: (_papers: IndexedPaper[]): Promise<boolean> => Promise.resolve(true),
  importSpeeches: (_speeches: IndexedSpeech[]): Promise<boolean> => Promise.resolve(true),
};


class PapersContentSourceStub implements IPapersContentSource {
  getContent(_fileId: number): string {
    return 'lorem ipsum';
  }
}


class SpeechesSourceStub implements ISpeechesSource {
  getSpeeches(): IndexableSpeech[] {

    const factions: RegistryFaction[] = [
      {
        id: 'Faction-01',
        name: 'Faction-01',
        seats: 10
      },
      {
        id: 'Faction-02',
        name: 'Faction-02',
        seats: 20
      },
      {
        id: 'Faction-03',
        name: 'Faction-03',
        seats: 30
      }
    ];
    const parties: RegistryParty[] = [
      {
        id: 'Party-01',
        name: 'Party-01',
        seats: 10
      },
      {
        id: 'Party-02',
        name: 'Party-02',
        seats: 20
      },
      {
        id: 'Party-03',
        name: 'Party-03',
        seats: 30
      }
    ];
    const persons: RegistryPerson[] = [
      {
        id: 'Speaker-01',
        name: 'Speaker-01',
        factionId: 'Faction-01',
        partyId: 'Party-01',
        start: null,
        end: null
      },
      {
        id: 'Speaker-02',
        name: 'Speaker-02',
        factionId: 'Faction-02',
        partyId: 'Party-02',
        start: null,
        end: null
      },
      {
        id: 'Speaker-03',
        name: 'Speaker-03',
        factionId: 'Faction-02',
        partyId: 'Party-03',
        start: null,
        end: null
      },
      {
        id: 'Speaker-05',
        name: 'Speaker-05',
        factionId: 'Faction-03',
        partyId: 'Party-02',
        start: null,
        end: null
      }
    ];
    const parliamentPeriodEP01: Registry = {
      id: 'EP01',
      name: 'Parliament Period 01',
      lastUpdate: '2000-01-01',
      sessions: [],
      factions,
      parties,
      persons
    };
    const parliamentPeriodEP02: Registry = {
      id: 'EP02',
      name: 'Parliament Period 02',
      lastUpdate: '2001-01-01',
      sessions: [],
      factions,
      parties,
      persons
    };
    const parliamentPeriodEP03: Registry = {
      id: 'EP03',
      name: 'Parliament Period 03',
      lastUpdate: '2002-01-01',
      sessions: [],
      factions,
      parties,
      persons
    };
    const session20000101: RegistrySession = {
      id: '2000-01-01',
      date: '2000-01-01',
      title: 'Session 2000-01-01',
      youtubeUrl: 'https://youtube.com/session-2000-01-01',
      meetingMinutesUrl: 'https://example.com/minutes/2000-01-01'
    };
    const session20000201: RegistrySession = {
      id: '2000-02-01',
      date: '2000-02-01',
      title: 'Session 2000-02-01',
      youtubeUrl: 'https://youtube.com/session-2000-02-01',
      meetingMinutesUrl: 'https://example.com/minutes/2000-02-01'
    };
    const session20010101: RegistrySession = {
      id: '2001-01-01',
      date: '2001-01-01',
      title: 'Session 2001-01-01',
      youtubeUrl: 'https://youtube.com/session-2001-01-01',
      meetingMinutesUrl: 'https://example.com/minutes/2001-01-01'
    };
    const session20020101: RegistrySession = {
      id: '2002-01-01',
      date: '2002-01-01',
      title: 'Session 2002-01-01',
      youtubeUrl: 'https://youtube.com/session-2002-01-01',
      meetingMinutesUrl: 'https://example.com/minutes/2002-01-01'
    };
    return [
      {
        parliamentPeriod: parliamentPeriodEP01,
        session: session20000101,
        speech: {
          speaker: 'Speaker-01',
          start: 0,
          duration: 10,
          transcription: 'lorem ipsum 01',
        }
      },
      {
        parliamentPeriod: parliamentPeriodEP01,
        session: session20000101,
        speech: {
          speaker: 'Speaker-02',
          start: 1,
          duration: 10,
          transcription: 'lorem ipsum 02',
        },
      },
      {
        parliamentPeriod: parliamentPeriodEP01,
        session: session20000201,
        speech: {
          speaker: 'Speaker-03',
          start: 1,
          duration: 10,
          transcription: 'lorem ipsum 03',
        },
      },
      {
        parliamentPeriod: parliamentPeriodEP01,
        session: session20000201,
        speech: {
          speaker: 'Speaker-04',
          start: 10,
          duration: 20,
          transcription: undefined,
        },
      },
      {
        parliamentPeriod: parliamentPeriodEP02,
        session: session20010101,
        speech: {
          speaker: 'Speaker-05',
          start: 10,
          duration: 20,
          transcription: 'lorem ipsum 04',
        }
      },
      {
        parliamentPeriod: parliamentPeriodEP02,
        session: session20010101,
        speech: {
          speaker: 'Speaker-06',
          start: 10,
          duration: 20,
          transcription: 'lorem ipsum 05',
        },
      },
      {
        parliamentPeriod: parliamentPeriodEP03,
        session: session20020101,
        speech: {
          speaker: 'Speaker-07',
          start: 10,
          duration: 20,
        },
      },
      {
        parliamentPeriod: parliamentPeriodEP03,
        session: session20020101,
        speech: {
          speaker: 'Speaker-01',
          start: 10,
          duration: 20,
          transcription: 'lorem ipsum 06',
          onBehalfOf: 'Some Body'
        },
      }
    ];

  }
}


Deno.test('Paper contents are indexed', async () => {

  using importPapersSpy = spy(mockImporter, 'importPapers');

  const searchIndex = new SearchIndexer(mockImporter);
  const contentSourceStub = new PapersContentSourceStub();
  await searchIndex.indexPapers(contentSourceStub, TEST_SCRAPED_SESSION);

  assertSpyCalls(importPapersSpy, 1);
  assertSpyCall(importPapersSpy, 0, {
    args: [
      [
        {
          "id": "paper-1",
          "content": [
            "lorem ipsum"
          ],
          "paper_name": "P01",
          "paper_type": "Stellungnahme",
          "paper_reference": "P01"
        },
        {
          "id": "paper-2",
          "content": [
            "lorem ipsum"
          ],
          "paper_name": "P02",
          "paper_type": "Anfrage",
          "paper_reference": "P02"
        },
        {
          "id": "paper-3",
          "content": [
            "lorem ipsum"
          ],
          "paper_name": "P03",
          "paper_type": "",
          "paper_reference": "P03"
        },
        {
          "id": "paper-4",
          "content": [
            "lorem ipsum",
            "lorem ipsum"
          ],
          "paper_name": "P04",
          "paper_type": "",
          "paper_reference": "P04"
        },
        {
          "id": "paper-5",
          "content": [],
          "paper_name": "P05",
          "paper_type": "",
          "paper_reference": "P05"
        },
        {
          "id": "paper-6",
          "content": [
            "lorem ipsum"
          ],
          "paper_name": "P06",
          "paper_type": "",
          "paper_reference": "P06"
        }
      ]
    ]
  });

});


Deno.test('No paper contents are indexed from empty scraped session', async () => {

  using importPapersSpy = spy(mockImporter, 'importPapers');

  const searchIndex = new SearchIndexer(mockImporter);
  const contentSourceStub = new PapersContentSourceStub();
  await searchIndex.indexPapers(contentSourceStub, EMPTY_SCRAPED_SESSION);

  assertSpyCalls(importPapersSpy, 1);
  assertSpyCall(importPapersSpy, 0, { args: [[]] });

});


Deno.test('Speech transcriptions are indexed', async () => {

  using importSpeechesSpy = spy(mockImporter, 'importSpeeches');

  const searchIndex = new SearchIndexer(mockImporter);
  const speechesSourceStub = new SpeechesSourceStub();
  await searchIndex.indexSpeeches(speechesSourceStub);

  assertSpyCalls(importSpeechesSpy, 1);
  assertSpyCall(importSpeechesSpy, 0, {
    args: [
      [
        {
          "id": "speech-2000-01-01-0",
          "content": [
            "lorem ipsum 01"
          ],
          "speech_parliament_period": "EP01",
          "speech_session": "2000-01-01",
          "speech_start": 0,
          "speech_session_date": 946684800000,
          "speech_speaker": "Speaker-01",
          "speech_faction": "Faction-01",
          "speech_party": "Party-01",
          "speech_on_behalf_of": null
        },
        {
          "id": "speech-2000-01-01-1",
          "content": [
            "lorem ipsum 02"
          ],
          "speech_parliament_period": "EP01",
          "speech_session": "2000-01-01",
          "speech_start": 1,
          "speech_session_date": 946684800000,
          "speech_speaker": "Speaker-02",
          "speech_faction": "Faction-02",
          "speech_party": "Party-02",
          "speech_on_behalf_of": null
        },
        {
          "id": "speech-2000-02-01-1",
          "content": [
            "lorem ipsum 03"
          ],
          "speech_parliament_period": "EP01",
          "speech_session": "2000-02-01",
          "speech_start": 1,
          "speech_session_date": 949363200000,
          "speech_speaker": "Speaker-03",
          "speech_faction": "Faction-02",
          "speech_party": "Party-03",
          "speech_on_behalf_of": null
        },
        {
          "id": "speech-2001-01-01-10",
          "content": [
            "lorem ipsum 04"
          ],
          "speech_parliament_period": "EP02",
          "speech_session": "2001-01-01",
          "speech_start": 10,
          "speech_session_date": 978307200000,
          "speech_speaker": "Speaker-05",
          "speech_faction": "Faction-03",
          "speech_party": "Party-02",
          "speech_on_behalf_of": null
        },
        {
          "id": "speech-2001-01-01-10",
          "content": [
            "lorem ipsum 05"
          ],
          "speech_parliament_period": "EP02",
          "speech_session": "2001-01-01",
          "speech_start": 10,
          "speech_session_date": 978307200000,
          "speech_speaker": "Speaker-06",
          "speech_faction": null,
          "speech_party": null,
          "speech_on_behalf_of": null
        },
        {
          "id": "speech-2002-01-01-10",
          "content": [
            "lorem ipsum 06"
          ],
          "speech_parliament_period": "EP03",
          "speech_session": "2002-01-01",
          "speech_start": 10,
          "speech_session_date": 1009843200000,
          "speech_speaker": "Speaker-01",
          "speech_faction": "Faction-01",
          "speech_party": "Party-01",
          "speech_on_behalf_of": "Some Body"
        }
      ]
    ]
  });

});
