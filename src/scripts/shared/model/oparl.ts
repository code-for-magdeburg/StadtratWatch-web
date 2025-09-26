export type OparlObject = {
  id: string;
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
  name: string;
  cancelled: boolean;
  start: string;
  end: string;
  organization: string;
};


export type OparlAgendaItem = OparlObject & {
  consultation: string;
};


export type OparlConsultation = OparlObject & {
  meeting: string;
  paper: string;
};


export type OparlPaper = OparlObject & {

};


export type OparlFile = OparlObject & {
  paper: string[];
};
