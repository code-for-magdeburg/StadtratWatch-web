export type OparlObject = {
  id: string;
  type: string;
  name: string;
  created?: string;
  modified?: string;
  deleted?: boolean;
};

export type OparlBody = OparlObject & {
  organization: string;
  person: string;
  meeting: string;
  paper: string;
  membership: string;
  locationList: string;
  agendaItem: string;
  consultations: string;
  files: string;
};

export type OparlMeeting = OparlObject & {
  cancelled?: boolean;
  start?: string;
  end?: string;
  organization?: string[];
  location?: string;
  participant?: string[];
  invitation?: string;
  resultsProtocol?: string;
  verbatimProtocol?: string;
};

export type OparlAgendaItem = OparlObject & {
  order: number;
  meeting?: string;
  number?: string;
  public?: boolean;
  consultation?: string;
  result?: string;
  auxiliaryFile?: string[];
};

export type OparlConsultation = OparlObject & {
  meeting?: string;
  paper?: string;
  organization?: string[];
  agendaItem?: string;
  role?: string;
  authoritative?: boolean;
};

export type OparlPaper = OparlObject & {
  consultation?: OparlConsultation[];
  reference?: string;
  paperType?: string;
  date?: string;
  body?: string;
  location?: string;
  auxiliaryFile?: string[];
  superordinatedPaper?: string[];
  subordinatedPaper?: string[];
  underDirectionOf?: string[];
};

export type OparlFile = OparlObject & {
  paper?: string[];
  meeting?: string;
  accessUrl: string;
  downloadUrl?: string;
  fileName?: string;
  mimeType?: string;
  date?: string;
};

export type OparlOrganization = OparlObject & {
  body?: string;
  classification?: string;
  location?: string;
  meeting?: string;
  membership?: string;
  shortName?: string;
  startDate?: string;
  endDate?: string;
};
