export type ScrapedSession = {
  agenda_items: ScrapedAgendaItem[];
  files: ScrapedFile[];
  format_version: number;
  main_organization: ScrapedMainOrganization;
  meetings: ScrapedMeeting[];
  memberships: ScrapedMembership[];
  meta: ScrapedSessionMeta;
  organizations: ScrapedOrganization[];
  papers: ScrapedPaper[];
  persons: ScrapedPerson[];
};

export type ScrapedAgendaItem = {
  key: string;
  meeting_id: number;
  name: string;
  original_id: number;
  paper_original_id: number | null;
  paper_reference: string | null;
};

export type ScrapedFile = {
  name: string;
  original_id: number;
  paper_original_id: number;
  url: string;
};

export type ScrapedMainOrganization = {};

export type ScrapedMeeting = {
  cancelled: boolean;
  end: string;
  location: string;
  name: string;
  note: string | null;
  organization_name: string;
  original_id: number;
  start: string;
};

export type ScrapedMembership = {};

export type ScrapedSessionMeta = {};

export type ScrapedOrganization = {};

export type ScrapedPaper = {
  name: string;
  original_id: number;
  paper_type: string | null;
  reference: string;
  short_name: string;
  sort_date: string;
};

export type ScrapedPerson = {};
