export type SessionSpeaker = {
  speaker: string;
  segments: SpeakerSegment[];
};

export type SpeakerSegment = {
  start: number;
  duration: number;
};
