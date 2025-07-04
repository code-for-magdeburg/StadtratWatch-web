export type ScanConfig = {
  layout: ScanConfigLayout;
  names: ScanConfigPerson[];
};

export type ScanConfigLayout = {
  namesRowHeight: number;
  namesColumns: ScanConfigColumn[];
  videoTimestampRectangle: ScanConfigLayoutRectangle;
  votingSubjectIdRectangle: ScanConfigLayoutRectangle;
  votingSubjectTitleRectangle: ScanConfigLayoutRectangle;
};

export type ScanConfigPerson = {
  name: string;
  columnIndex: number;
  rowIndex: number;
};

export type ScanConfigColumn = {
  left: number;
  top: number;
  width: number;
  testPixelXOffset: number;
  testPixelYOffset: number;
};

export type ScanConfigLayoutRectangle = {
  left: number;
  top: number;
  width: number;
  height: number;
};
