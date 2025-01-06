import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import type { Registry } from './model/registry.ts';
import type { SessionScan } from './model/session-scan.ts';
import type { SessionSpeech } from './model/session-speech.ts';
import type { SessionConfig } from './model/session-config.ts';


const electoralPeriods = defineCollection({
  loader: glob({
    pattern: '**/registry.json',
    base: '../data',
    generateId: options => options.data.id as string,
  }),
  schema: z.custom<Registry>()
});


const sessionScans = defineCollection({
  loader: glob({
    pattern: '**/session-scan-*.json',
    base: '../data',
    generateId: options => {
      const entryParts = options.entry.split('/');
      return `${entryParts[0]}/${entryParts[1]}`;
    }
  }),
  schema: z.custom<SessionScan>()
});


const sessionSpeeches = defineCollection({
  loader: glob({
    pattern: '**/session-speeches-*.json',
    base: '../data',
    generateId: options => {
      const entryParts = options.entry.split('/');
      return `${entryParts[0]}/${entryParts[1]}`;
    }
  }),
  schema: z.array(z.custom<SessionSpeech>())
});


const sessionConfigs = defineCollection({
  loader: glob({
    pattern: '**/config-*.json',
    base: '../data',
    generateId: options => {
      const entryParts = options.entry.split('/');
      return `${entryParts[0]}/${entryParts[1]}`;
    }
  }),
  schema: z.custom<SessionConfig>()
});


export const collections = { electoralPeriods, sessionScans, sessionSpeeches, sessionConfigs };
