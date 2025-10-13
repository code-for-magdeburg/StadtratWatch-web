export type PaperAssetFileDto = {
  id: number;
  name: string;
  url: string;
  size: number | null;
};

export type PaperAssetDto = {
  id: number;
  reference: string | null;
  type: string | null;
  title: string;
  files: PaperAssetFileDto[];
};
