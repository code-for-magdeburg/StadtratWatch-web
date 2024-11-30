
export type PapersDto = PaperDto[];


export type PaperFileDto = {
  id: number;
  name: string;
  url: string;
  size: number | null;
};


export type PaperDto = {
  id: number;
  reference: string | null;
  type: string | null;
  title: string;
  files: PaperFileDto[];
};
