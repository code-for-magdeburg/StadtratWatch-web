import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import type { RegistrySession } from './model/registry.ts';


const electoralPeriods = defineCollection({
  loader: glob({
    pattern: '**/registry.json',
    base: '../data',
    generateId: options => options.data.id as string,
  }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    lastUpdate: z.string(),
    sessions: z.array(z.custom<RegistrySession>()),
    factions: z.array(z.object({
      id: z.string(),
      name: z.string(),
      seats: z.number()
    })),
    parties: z.array(z.object({
      id: z.string(),
      name: z.string(),
      seats: z.number()
    })),
    persons: z.array(z.object({
      id: z.string(),
      name: z.string(),
      factionId: z.string(),
      partyId: z.string(),
      start: z.string().nullable(),
      end: z.string().nullable()
    }))
  })
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
  schema: z.array(z.object({
    votingFilename: z.string(),
    videoTimestamp: z.string(),
    votingSubject: z.object({
      agendaItem: z.string(),
      applicationId: z.string(),
      title: z.string(),
      type: z.string(),
      authors: z.array(z.string())
    }),
    votes: z.array(z.object({
      name: z.string(),
      vote: z.string()
    }))
  }))
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
  schema: z.array(z.object({
    speaker: z.string(),
    start: z.number(),
    duration: z.number(),
    isChairPerson: z.boolean().optional(),
    onBehalfOf: z.string().optional(),
    transcription: z.string().nullable()
  }))
});


export const collections = { electoralPeriods, sessionScans, sessionSpeeches };
