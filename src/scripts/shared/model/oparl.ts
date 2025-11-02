export type OparlObject = {
  id: string;
  type: string;
  name: string;
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
};

export type OparlAgendaItem = OparlObject & {
  order: number;
  meeting?: string;
  number?: string;
  isPublic?: boolean;
  consultation?: string;
  result?: string;
};

export type OparlConsultation = OparlObject & {
  agendaItem?: string;
  meeting?: string;
  organization?: string[];
  paper?: string;
  role?: string;
};

export type OparlPaper = OparlObject & {
  consultation?: OparlConsultation[];
  reference?: string;
  paperType?: string;
  deleted?: boolean;
};

export type OparlFile = OparlObject & {
  paper?: string[];
  accessUrl: string;
};

export type OparlOrganization = OparlObject;
