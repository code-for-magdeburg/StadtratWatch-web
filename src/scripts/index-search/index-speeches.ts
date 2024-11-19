import * as fs from 'fs';
import * as path from 'path';
import { Registry } from '../shared/model/registry';
import { SessionConfig } from '../shared/model/session-config';
import { SessionSpeech } from '../shared/model/session-speech';
import axios from 'axios';


const BATCH_SIZE = 100;


async function indexSpeechesForElectoralPeriod(contentDir: string, registry: Registry) {

  console.log(`Importing speeches for ${registry.electoralPeriod}`);

  const sessions = fs
    .readdirSync(contentDir)
    .filter(session => fs.lstatSync(path.join(contentDir, session)).isDirectory())
    .filter(session => fs.existsSync(path.join(contentDir, session, `config-${session}.json`)))
    .filter(session => fs.existsSync(path.join(contentDir, session, `session-speeches-${session}.json`)));

  for (const session of sessions) {
    const config = JSON.parse(
      fs.readFileSync(path.join(contentDir, session, `config-${session}.json`), 'utf-8')
    ) as SessionConfig;
    const speeches = JSON.parse(
      fs.readFileSync(path.join(contentDir, session, `session-speeches-${session}.json`), 'utf-8')
    ) as SessionSpeech[];
    await indexSessionSpeeches(registry, session, config, speeches);
  }

}


async function indexSessionSpeeches(registry: Registry, session: string, config: SessionConfig,
                                    speeches: SessionSpeech[]) {

  console.log(`Indexing speeches for session ${session}...`);

  const { TYPESENSE_SERVER_URL, TYPESENSE_COLLECTION_NAME, TYPESENSE_API_KEY } = process.env;

  const speechesWithTranscriptions = speeches.filter(speech => speech.transcription);

  for (let i = 0; i < speechesWithTranscriptions.length; i += BATCH_SIZE) {

    const data = speechesWithTranscriptions
      .slice(i, i + BATCH_SIZE)
      .map(speech => {

        const person = config.names.find(name => name.name === speech.speaker);
        const party = person ? person.party : null;
        const faction = person ? person.faction : null;
        return {
          id: `speech-${session}-${speech.start}`,
          type: 'speech',
          content: [speech.transcription],

          paper_name: '',
          paper_type: '',
          paper_reference: '',

          speech_electoral_period: registry.electoralPeriod,
          speech_session: session,
          speech_start: speech.start,
          speech_session_date: Date.parse(session),
          speech_speaker: speech.speaker,
          speech_faction: faction,
          speech_party: party,
          speech_on_behalf_of: speech.onBehalfOf
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
      console.error(`Failed to import speech transcriptions: ${result.data}`);
    } else {
      console.log(`Imported ${i + BATCH_SIZE} speech transcriptions.`);
    }

  }

}


export async function indexSpeeches(electoralPeriodsBaseDir: string) {

  const electoralPeriods = fs
    .readdirSync(electoralPeriodsBaseDir)
    .filter(electoralPeriod => fs.lstatSync(path.join(electoralPeriodsBaseDir, electoralPeriod)).isDirectory())
    .filter(electoralPeriod => fs.existsSync(path.join(electoralPeriodsBaseDir, electoralPeriod, 'registry.json')));

  for (const electoralPeriod of electoralPeriods) {
    const electoralPeriodDir = path.join(electoralPeriodsBaseDir, electoralPeriod);
    const registry = JSON.parse(fs.readFileSync(path.join(electoralPeriodDir, 'registry.json'), 'utf-8'));
    await indexSpeechesForElectoralPeriod(electoralPeriodDir, registry);
  }

}
