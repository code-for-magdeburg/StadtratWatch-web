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
  consultation?: string;
};


export type OparlConsultation = OparlObject & {
  meeting?: string;
  paper?: string;
  organization?: string[];
  agendaItem?: string;
};


export type OparlPaper = OparlObject & {
  consultation?: OparlConsultation[];
  reference?: string;
  paperType?: string;
};


export type OparlFile = OparlObject & {
  paper?: string[];
  accessUrl: string;
};
