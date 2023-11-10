import * as fs from 'fs';
import { generatePersonFiles } from './generate-person-files';
import { generateSessionFiles } from './generate-session-files';
import { generateFractionFiles } from './generate-fraction-files';
import { generatePartyFiles } from './generate-party-files';
import { REGISTRY_FILENAME, SCRAPED_SESSION_FILENAME } from './constants';
import { Registry } from './model';
import { generateMetadataFile } from './generate-metadata-file';
import { ScrapedSession } from './scraped-session';


const registry = JSON.parse(fs.readFileSync(REGISTRY_FILENAME, 'utf-8')) as Registry;
const scrapedSession =
  JSON.parse(fs.readFileSync(SCRAPED_SESSION_FILENAME, 'utf-8')) as ScrapedSession;


const sessions = generateSessionFiles(registry, scrapedSession);
generatePersonFiles(registry, sessions);
generateFractionFiles(registry, sessions);
generatePartyFiles(registry);
generateMetadataFile(registry, sessions);

console.log('Done.');
