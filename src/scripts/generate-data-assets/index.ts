import * as fs from 'fs';
import { generatePersonFiles } from './generate-person-files';
import { generateSessionFiles } from './generate-session-files';
import { generateFractionFiles } from './generate-fraction-files';
import { generatePartyFiles } from './generate-party-files';
import { REGISTRY_FILENAME } from './constants';
import { Registry } from './model';
import { generateMetadataFile } from './generate-metadata-file';


const registry = JSON.parse(fs.readFileSync(REGISTRY_FILENAME, 'utf-8')) as Registry;

const sessions = generateSessionFiles(registry);
generatePersonFiles(registry, sessions);
generateFractionFiles(registry);
generatePartyFiles(registry);
generateMetadataFile(registry, sessions);

console.log('Done.');
