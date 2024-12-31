import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';


const electoralPeriods = defineCollection({
  loader: glob({
    pattern: '**/registry.json',
    base: '../data',
    generateId: options => options.data.electoralPeriod as string,
  }),
  schema: z.object({
    electoralPeriod: z.string(),
    title: z.string(),
    lastUpdatedTimestamp: z.string(),
    sessions: z.array(z.object({
      id: z.string(),
      date: z.string(),
      meetingMinutesUrl: z.string()
    })),
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


export const collections = { electoralPeriods };
