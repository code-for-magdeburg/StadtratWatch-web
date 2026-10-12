import type { AiTextAssessment } from '@srw-astro/models/ai-text-assessment';
import {
  PANGRAM_MODEL_NAME,
  type PangramConfidence,
  type PangramTaskResult,
  type PangramWindow,
} from './pangram-client.ts';
import { sha256Hex } from './transcript-hash.ts';

const NON_HUMAN_WINDOW_LABELS = ['AI-Generated', 'AI-Assisted'];
const HIGH_CONFIDENCE_NON_HUMAN_RULE_VERSION = 'weakest-non-human-window@1';

export async function buildAiTextAssessment(
  pangramResult: PangramTaskResult,
  transcript: string,
  checkedAt: string,
): Promise<AiTextAssessment> {
  const nonHumanWindows = pangramResult.windows.filter((window) => NON_HUMAN_WINDOW_LABELS.includes(window.label));
  const totalNonHumanWords = sumWordCounts(nonHumanWindows);

  const highConfidenceNonHuman =
    (pangramResult.predictionShort === 'AI' || pangramResult.predictionShort === 'Mixed') &&
    nonHumanWindows.length > 0 &&
    nonHumanWindows.every((window) => window.confidence === 'High');

  return {
    label: pangramResult.predictionShort,
    fractionAi: pangramResult.fractionAi,
    fractionAiAssisted: pangramResult.fractionAiAssisted,
    fractionHuman: pangramResult.fractionHuman,
    segmentCounts: {
      ai: pangramResult.numAiSegments,
      aiAssisted: pangramResult.numAiAssistedSegments,
      human: pangramResult.numHumanSegments,
    },
    nonHumanWordWeightedConfidenceDistribution: {
      High: wordWeightedShare(nonHumanWindows, 'High', totalNonHumanWords),
      Medium: wordWeightedShare(nonHumanWindows, 'Medium', totalNonHumanWords),
      Low: wordWeightedShare(nonHumanWindows, 'Low', totalNonHumanWords),
    },
    highConfidenceNonHuman,
    highConfidenceNonHumanRuleVersion: HIGH_CONFIDENCE_NON_HUMAN_RULE_VERSION,
    modelName: PANGRAM_MODEL_NAME,
    modelVersion: pangramResult.version,
    checkedAt,
    transcriptSha256: await sha256Hex(transcript),
  };
}

function sumWordCounts(windows: PangramWindow[]): number {
  return windows.reduce((sum, window) => sum + window.wordCount, 0);
}

function wordWeightedShare(windows: PangramWindow[], confidence: PangramConfidence, totalWords: number): number {
  if (totalWords === 0) {
    return 0;
  }

  const matchingWords = sumWordCounts(windows.filter((window) => window.confidence === confidence));
  return matchingWords / totalWords;
}
