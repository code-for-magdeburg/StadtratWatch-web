import type { AiTextAssessment } from './ai-text-assessment.ts';

export type { AiTextAssessment };

export type SessionSpeech = {
  speaker: string;
  start: number;
  duration: number;
  isChairPerson?: boolean;
  onBehalfOf?: string;
  transcription?: string;
  aiTextAssessment?: AiTextAssessment;
};
