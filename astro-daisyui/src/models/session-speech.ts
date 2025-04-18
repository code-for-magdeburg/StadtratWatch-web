export type SessionSpeech = {
  speaker: string;
  start: number;
  duration: number;
  isChairPerson?: boolean;
  onBehalfOf?: string;
  transcription?: string;
};
