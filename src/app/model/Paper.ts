
export type PapersDto = PaperDto[];


export type PaperDto = {
  id: number;
  reference: string | null;
  type: string | null;
  title: string;
  files: { id: number, name: string, url: string, size: number | null }[];
};
