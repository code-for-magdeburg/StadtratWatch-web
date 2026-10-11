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

function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

export function shouldExposeAiTextAssessment(speech: SessionSpeech): boolean {
  const assessment = speech.aiTextAssessment;
  if (!assessment || !assessment.highConfidenceNonHuman) {
    return false;
  }

  return assessment.transcriptSha256 === sha256Hex(speech.transcription ?? '');
}
