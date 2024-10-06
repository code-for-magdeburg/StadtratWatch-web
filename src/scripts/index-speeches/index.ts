import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import { SessionSpeech } from '../generate-data-assets/model/session-speech';
import { SessionConfig } from '../generate-data-assets/model/session-config';


const inputDir = process.argv[2];
const typesenseServerUrl = process.argv[3];
const speechesCollectionName = process.argv[4];
const typesenseApiKey = process.argv[5];


const BATCH_SIZE = 100;


if (!inputDir || !typesenseServerUrl || !speechesCollectionName || !typesenseApiKey) {
  console.error('Usage: node index.js <inputDir> <typesenseServerUrl> <speechesCollectionName> <typesenseApiKey>');
  process.exit(1);
}


async function indexSpeeches(contentDir: string) {

  console.log('Importing speeches...');

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
    await indexSessionSpeeches(session, config, speeches);
  }

}


async function indexSessionSpeeches(session: string, config: SessionConfig, speeches: SessionSpeech[]) {

  console.log(`Indexing speeches for session ${session}...`);

  const speechesWithTranscriptions = speeches.filter(speech => speech.transcription);

  for (let i = 0; i < speechesWithTranscriptions.length; i += BATCH_SIZE) {

    const data = speechesWithTranscriptions
      .slice(i, i + BATCH_SIZE)
      .map(speech => {

        const person = config.names.find(name => name.name === speech.speaker);
        const party = person ? person.party : null;
        const faction = person ? person.faction : null;
        return {
          id: `${session}-${speech.start}`,
          electoral_period: config.electoralPeriod,
          session,
          start: speech.start,
          session_date: Date.parse(session),
          speaker: speech.speaker,
          party,
          faction,
          on_behalf_of: speech.onBehalfOf,
          transcription: speech.transcription
        };

      })
      .filter(documents => documents !== null)
      .map(document => JSON.stringify(document))
      .join('\n');
    const result = await axios.post(
      `${typesenseServerUrl}/collections/${speechesCollectionName}/documents/import`,
      data,
      {
        headers: {
          'X-TYPESENSE-API-KEY': typesenseApiKey,
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


(async () => {

  await indexSpeeches(inputDir);

  console.log('Done.');

})();
