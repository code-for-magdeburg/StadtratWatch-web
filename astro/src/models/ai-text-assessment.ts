import { createHash } from 'node:crypto';
import type { SessionSpeech } from './session-speech.ts';

export type AiTextAssessmentLabel = 'AI' | 'Mixed' | 'Human';

export type AiTextAssessmentConfidence = 'High' | 'Medium' | 'Low';

export type AiTextAssessmentSegmentCounts = {
  ai: number;
  aiAssisted: number;
  human: number;
};

export type AiTextAssessmentConfidenceDistribution = Record<
  AiTextAssessmentConfidence,
  number
>;

export type HighConfidenceNonHumanRuleVersion = 'weakest-non-human-window@1';

export type AiTextAssessment = {
  label: AiTextAssessmentLabel;
  fractionAi: number;
  fractionAiAssisted: number;
  fractionHuman: number;
  segmentCounts: AiTextAssessmentSegmentCounts;
  nonHumanWordWeightedConfidenceDistribution: AiTextAssessmentConfidenceDistribution;
  highConfidenceNonHuman: boolean;
  highConfidenceNonHumanRuleVersion: HighConfidenceNonHumanRuleVersion;
  modelName: string;
  modelVersion: string;
  checkedAt: string;
  transcriptSha256: string;
};

export function hashTranscript(transcription: string): string {
  return createHash('sha256').update(transcription, 'utf8').digest('hex');
}

export type AssessedSessionSpeech = SessionSpeech & {
  aiTextAssessment: AiTextAssessment;
};

export function isAiTextAssessmentCurrent(
  speech: SessionSpeech,
): speech is AssessedSessionSpeech {
  return (
    speech.aiTextAssessment?.transcriptSha256 ===
    hashTranscript(speech.transcription ?? '')
  );
}

export function shouldExposeAiTextAssessment(
  speech: SessionSpeech,
): speech is AssessedSessionSpeech {
  return (
    isAiTextAssessmentCurrent(speech) &&
    speech.aiTextAssessment.highConfidenceNonHuman
  );
}
