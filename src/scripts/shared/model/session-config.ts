export type SessionConfig = {
  title: string;
  youtubeUrl: string;
  layout: SessionConfigLayout;
  names: SessionConfigPerson[];
};

export type SessionConfigLayout = {
  namesRowHeight: number;
  namesColumns: SessionConfigColumn[];
  videoTimestampRectangle: SessionConfigLayoutRectangle;
  votingSubjectIdRectangle: SessionConfigLayoutRectangle;
  votingSubjectTitleRectangle: SessionConfigLayoutRectangle;
};

export type SessionConfigPerson = {
  name: string;
  columnIndex: number;
  rowIndex: number;
  party: string;
  faction: string;
};

export type SessionConfigColumn = {
  left: number;
  top: number;
  width: number;
  testPixelXOffset: number;
  testPixelYOffset: number;
};

export type SessionConfigLayoutRectangle = {
  left: number;
  top: number;
  width: number;
  height: number;
};
