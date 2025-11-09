export type PaperAssetFileDto = {
  id: number;
  name: string;
  url: string;
  size: number | null;
};

export type PaperAssetConsultationDto = {
  meeting: string;
  date: string | null;
  role: string | null;
  organization: string;
  agendaItem: string | null;
  result: string | null;
};

export type PaperAssetDto = {
  id: number;
  reference: string | null;
  type: string | null;
  title: string;
  files: PaperAssetFileDto[];
  consultations: PaperAssetConsultationDto[];
  paperGroupId: number;
};

export type PaperGraphAssetDto = {
  rootPaperId: number;
};
