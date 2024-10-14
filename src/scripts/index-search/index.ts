import * as fs from 'fs';
import { ScrapedSession } from '../shared/model/scraped-session';
import { indexPapers } from './index-papers';
import { indexSpeeches } from './index-speeches';
import * as dotenv from 'dotenv';


dotenv.config({ path: '.env.local' });

const { TYPESENSE_SERVER_URL, TYPESENSE_COLLECTION_NAME, TYPESENSE_API_KEY } = process.env;
if (!TYPESENSE_SERVER_URL || !TYPESENSE_COLLECTION_NAME || !TYPESENSE_API_KEY) {
  console.error('Environment variables TYPESENSE_SERVER_URL, TYPESENSE_COLLECTION_NAME and TYPESENSE_API_KEY must be set.');
  process.exit(1);
}

const papersContentDir = process.argv[2];
const electoralPeriodsBaseDir = process.argv[3];
const scrapedSessionFilename = process.argv[4];

if (!papersContentDir || !electoralPeriodsBaseDir || !scrapedSessionFilename) {
  console.error('Usage: node index.js <papersContentDir> <electoralPeriodsBaseDir> <scrapedSessionFile>');
  process.exit(1);
}


if (!fs.existsSync(scrapedSessionFilename) || !fs.lstatSync(scrapedSessionFilename).isFile()) {
  console.error(`Scraped session file "${scrapedSessionFilename}" does not exist or is not a file.`);
  process.exit(1);
}


(async () => {

  const scrapedSession =
    JSON.parse(fs.readFileSync(scrapedSessionFilename, 'utf-8')) as ScrapedSession;
  await indexPapers(papersContentDir, scrapedSession);

  await indexSpeeches(electoralPeriodsBaseDir);

  console.log('Done.');

})();
