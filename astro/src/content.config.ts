import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import type { Registry } from '@models/registry.ts';
import type { SessionScan } from '@models/session-scan.ts';
import type { SessionSpeech } from '@models/session-speech.ts';
import type {
  ScrapedAgendaItem,
  ScrapedFile,
  ScrapedMeeting,
  ScrapedPaper,
  ScrapedSession,
} from '@models/scraped-session.ts';
import * as fs from 'fs';

const parliamentPeriods = defineCollection({
  loader: glob({
    pattern: '**/registry.json',
    base: '../data',
    generateId: (options) => options.data.id as string,
  }),
  schema: z.custom<Registry>(),
});

const sessionScans = defineCollection({
  loader: glob({
    pattern: '**/session-scan-*.json',
    base: '../data',
    generateId: (options) => {
      const entryParts = options.entry.split('/');
      return `${entryParts[0]}/${entryParts[1]}`;
    },
  }),
  schema: z.custom<SessionScan>(),
});

const sessionSpeeches = defineCollection({
  loader: glob({
    pattern: '**/session-speeches-*.json',
    base: '../data',
    generateId: (options) => {
      const entryParts = options.entry.split('/');
      return `${entryParts[0]}/${entryParts[1]}`;
    },
  }),
  schema: z.array(z.custom<SessionSpeech>()),
});

const magdeburg = JSON.parse(
  fs.readFileSync('../data/Magdeburg.json', 'utf8'),
) as ScrapedSession;

const meetings = magdeburg.meetings
  .filter((meeting) => meeting.organization_name === 'Stadtrat')
  .filter((meeting) => meeting.start > '2019');
const agendaItems = magdeburg.agenda_items
  .filter((agendaItem) => agendaItem.key.startsWith('Ö'))
  .filter((agendaItem) =>
    meetings.some((meeting) => meeting.original_id === agendaItem.meeting_id),
  );
const papers = magdeburg.papers.filter((paper) =>
  agendaItems.some(
    (agendaItem) => agendaItem.paper_original_id === paper.original_id,
  ),
);
const files = magdeburg.files.filter((file) =>
  papers.some((paper) => paper.original_id === file.paper_original_id),
);

const scrapedMeetings = defineCollection({
  loader: () =>
    meetings.map((meeting) => ({ ...meeting, id: `${meeting.original_id}` })),
  schema: z.custom<ScrapedMeeting>(),
});

const scrapedAgendaItems = defineCollection({
  loader: () =>
    agendaItems.map((agenda_item) => ({
      ...agenda_item,
      id: `${agenda_item.meeting_id}-${agenda_item.key}`,
    })),
  schema: z.custom<ScrapedAgendaItem>(),
});

const scrapedPapers = defineCollection({
  loader: () =>
    papers.map((paper) => ({ ...paper, id: `${paper.original_id}` })),
  schema: z.custom<ScrapedPaper>(),
});

const scrapedFiles = defineCollection({
  loader: () => files.map((file) => ({ ...file, id: `${file.original_id}` })),
  schema: z.custom<ScrapedFile>(),
});

export const collections = {
  parliamentPeriods,
  sessionScans,
  sessionSpeeches,
  scrapedMeetings,
  scrapedAgendaItems,
  scrapedPapers,
  scrapedFiles,
};
