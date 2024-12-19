export type Segment = {
  start: number;
  duration: number;
};

export type SpeakerSegment = {
  speaker: string;
  start: number;
  duration: number;
};

export type SpeakerWithSegments = {
  speaker: string;
  segments: Segment[];
};
