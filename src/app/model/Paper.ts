
export type PapersDto = PaperDto[];


export type PaperDto = {
  id: number;
  files: { id: number, name: string, url: string }[];
  reference: string | null;
};
