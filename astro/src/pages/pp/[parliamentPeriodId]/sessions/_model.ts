export type EntryType = {
  type: 'month' | 'session';
};

export type MonthEntry = {
  month: number;
  year: number;
  label: string;
};

export type SessionEntry = {
  sessionId: string;
  date: string;
  dateDisplay: string;
  title: string;
};

export type TimelineEntry = EntryType & (MonthEntry | SessionEntry);
