import { ScrapedSession } from '../model/scraped-session.ts';


// Sessions with meetings:
// M01 => 2024-01-01 (Stadtrat)
// M02 => 2024-02-01 (Stadtrat)
// M03 => 2024-03-01 (Stadtrat)
// M04 => 2024-04-01 (Stadtrat)
// M05 => 2024-05-01 (Stadtrat)
// M06 => 2025-01-01 (Stadtrat)
// M07 => 2024-01-01 (Ausschuss)

// Meetings with agenda items:
// M1 => A01, A02, A03
// M2 => A04, A05
// M3 => A06
// M4 => A07
// M5 => (no agenda items)
// M6 => A08
// M7 => A09

// Agenda items with papers and files:
// A01 => P01 (F01)
// A02 => P02 (F02)
// A03 => P03 (F03)
// A04 => P03 (F03)
// A05 => P04 (F04, F05)
// A06 => (no papers, no files)
// A07 => P05 (no files)
// A08 => P06 (F06)
// A09 => P07 (F07)

export const TEST_SCRAPED_SESSION: ScrapedSession = {
  agenda_items: [
    {
      key: 'A01',
      meeting_id: 1,
      name: 'A01',
      original_id: 1,
      paper_original_id: 1,
      paper_reference: 'P01'
    },
    {
      key: 'A02',
      meeting_id: 1,
      name: 'A02',
      original_id: 2,
      paper_original_id: 2,
      paper_reference: 'P02'
    },
    {
      key: 'A03',
      meeting_id: 1,
      name: 'A03',
      original_id: 3,
      paper_original_id: 3,
      paper_reference: 'P03'
    },
    {
      key: 'A04',
      meeting_id: 2,
      name: 'A04',
      original_id: 4,
      paper_original_id: 3,
      paper_reference: 'P03'
    },
    {
      key: 'A05',
      meeting_id: 2,
      name: 'A05',
      original_id: 5,
      paper_original_id: 4,
      paper_reference: 'P04'
    },
    {
      key: 'A06',
      meeting_id: 3,
      name: 'A06',
      original_id: 6,
      paper_original_id: null,
      paper_reference: null
    },
    {
      key: 'A07',
      meeting_id: 4,
      name: 'A07',
      original_id: 7,
      paper_original_id: 5,
      paper_reference: 'P05'
    },
    {
      key: 'A08',
      meeting_id: 6,
      name: 'A08',
      original_id: 8,
      paper_original_id: 6,
      paper_reference: 'P06'
    },
    {
      key: 'A09',
      meeting_id: 7,
      name: 'A09',
      original_id: 9,
      paper_original_id: 7,
      paper_reference: 'P07'
    },
  ],
  files: [
    {
      name: 'F01',
      original_id: 1,
      paper_original_id: 1,
      url: 'http://file-0001.pdf'
    },
    {
      name: 'F02',
      original_id: 2,
      paper_original_id: 2,
      url: 'http://file-0002.pdf'
    },
    {
      name: 'F03',
      original_id: 3,
      paper_original_id: 3,
      url: 'http://file-0003.pdf'
    },
    {
      name: 'F04',
      original_id: 4,
      paper_original_id: 4,
      url: 'http://file-0004.pdf'
    },
    {
      name: 'F05',
      original_id: 5,
      paper_original_id: 4,
      url: 'http://file-0005.pdf'
    },
    {
      name: 'F06',
      original_id: 6,
      paper_original_id: 6,
      url: 'http://file-0006.pdf'
    },
    {
      name: 'F07',
      original_id: 7,
      paper_original_id: 7,
      url: 'http://file-0007.pdf'
    },
  ],
  format_version: 0,
  main_organization: {},
  meetings: [
    {
      cancelled: false,
      end: '',
      location: '',
      name: 'M01',
      note: 'Stadtratssitzung 2024 (mit drei Agenda Items)',
      organization_name: 'Stadtrat',
      original_id: 1,
      start: '2024-01-01T00:00:00Z',
    },
    {
      cancelled: false,
      end: '',
      location: '',
      name: 'M02',
      note: 'Stadtratssitzung 2024 (mit zwei Agenda Items)',
      organization_name: 'Stadtrat',
      original_id: 2,
      start: '2024-02-01T00:00:00Z',
    },
    {
      cancelled: false,
      end: '',
      location: '',
      name: 'M03',
      note: 'Stadtratssitzung 2024 (ohne Papers)',
      organization_name: 'Stadtrat',
      original_id: 3,
      start: '2024-03-01T00:00:00Z',
    },
    {
      cancelled: false,
      end: '',
      location: '',
      name: 'M04',
      note: 'Stadtratssitzung 2024 (ohne Files)',
      organization_name: 'Stadtrat',
      original_id: 4,
      start: '2024-04-01T00:00:00Z',
    },
    {
      cancelled: false,
      end: '',
      location: '',
      name: 'M05',
      note: 'Stadtratssitzung 2024 (ohne alles)',
      organization_name: 'Stadtrat',
      original_id: 5,
      start: '2024-05-01T00:00:00Z',
    },
    {
      cancelled: false,
      end: '',
      location: '',
      name: 'M06',
      note: 'Stadtratssitzung 2025',
      organization_name: 'Stadtrat',
      original_id: 6,
      start: '2025-01-01T00:00:00Z',
    },
    {
      cancelled: false,
      end: '',
      location: '',
      name: 'M07',
      note: 'Ausschussitzung 2024',
      organization_name: 'Ausschuss',
      original_id: 7,
      start: '2024-01-01T00:00:00Z',
    }
  ],
  memberships: [],
  meta: {},
  organizations: [],
  papers: [
    {
      name: 'P01',
      original_id: 1,
      paper_type: null,
      reference: 'P01',
      short_name: '',
      sort_date: '2023-01-01'
    },
    {
      name: 'P01',
      original_id: 1,
      paper_type: null,
      reference: 'P01',
      short_name: '',
      sort_date: '2024-01-01'
    },
    {
      name: 'P02',
      original_id: 2,
      paper_type: null,
      reference: 'P02',
      short_name: '',
      sort_date: '2023-01-01'
    },
    {
      name: 'P02',
      original_id: 2,
      paper_type: null,
      reference: 'P02',
      short_name: '',
      sort_date: '2024-01-01'
    },
    {
      name: 'P03',
      original_id: 3,
      paper_type: null,
      reference: 'P03',
      short_name: '',
      sort_date: '2023-01-01'
    },
    {
      name: 'P03',
      original_id: 3,
      paper_type: null,
      reference: 'P03',
      short_name: '',
      sort_date: '2024-01-01'
    },
    {
      name: 'P04',
      original_id: 4,
      paper_type: null,
      reference: 'P04',
      short_name: '',
      sort_date: '2023-01-01'
    },
    {
      name: 'P04',
      original_id: 4,
      paper_type: null,
      reference: 'P04',
      short_name: '',
      sort_date: '2024-01-01'
    },
    {
      name: 'P05',
      original_id: 5,
      paper_type: null,
      reference: 'P05',
      short_name: '',
      sort_date: '2023-01-01'
    },
    {
      name: 'P05',
      original_id: 5,
      paper_type: null,
      reference: 'P05',
      short_name: '',
      sort_date: '2024-01-01'
    },
    {
      name: 'P06',
      original_id: 6,
      paper_type: null,
      reference: 'P06',
      short_name: '',
      sort_date: '2024-01-01'
    },
    {
      name: 'P06',
      original_id: 6,
      paper_type: null,
      reference: 'P06',
      short_name: '',
      sort_date: '2025-01-01'
    },
    {
      name: 'P07',
      original_id: 7,
      paper_type: null,
      reference: 'P07',
      short_name: '',
      sort_date: '2023-01-01'
    },
    {
      name: 'P07',
      original_id: 7,
      paper_type: null,
      reference: 'P07',
      short_name: '',
      sort_date: '2024-01-01'
    }
  ],
  persons: []
};


export const EMPTY_SCRAPED_SESSION: ScrapedSession = {
  agenda_items: [],
  files: [],
  format_version: 0,
  main_organization: {},
  meetings: [],
  memberships: [],
  meta: {},
  organizations: [],
  papers: [],
  persons: []
};
