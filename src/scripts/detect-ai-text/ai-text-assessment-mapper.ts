import {
  type AiTextAssessment,
  type AiTextAssessmentConfidence,
  type AiTextAssessmentConfidenceDistribution,
  type AiTextAssessmentLabel,
  hashTranscript,
  type HighConfidenceNonHumanRuleVersion,
} from '@srw-astro/models/ai-text-assessment';
import {
  PANGRAM_MODEL_NAME,
  type PangramConfidence,
  type PangramLabel,
  type PangramTaskResult,
  type PangramWindow,
} from './pangram-client.ts';

const NON_HUMAN_WINDOW_LABELS = ['AI-Generated', 'AI-Assisted'];
const HIGH_CONFIDENCE_NON_HUMAN_RULE_VERSION: HighConfidenceNonHumanRuleVersion = 'weakest-non-human-window@1';

const ASSESSMENT_LABEL_BY_PANGRAM_LABEL: Record<PangramLabel, AiTextAssessmentLabel> = {
  AI: 'AI',
  Mixed: 'Mixed',
  Human: 'Human',
};

const ASSESSMENT_CONFIDENCE_BY_PANGRAM_CONFIDENCE: Record<PangramConfidence, AiTextAssessmentConfidence> = {
  High: 'High',
  Medium: 'Medium',
  Low: 'Low',
};

export function buildAiTextAssessment(
  pangramResult: PangramTaskResult,
  transcript: string,
  checkedAt: string,
): AiTextAssessment {
  const nonHumanWindows = pangramResult.windows.filter((window) => NON_HUMAN_WINDOW_LABELS.includes(window.label));

  const highConfidenceNonHuman =
    (pangramResult.predictionShort === 'AI' || pangramResult.predictionShort === 'Mixed') &&
    nonHumanWindows.length > 0 &&
    nonHumanWindows.every((window) => window.confidence === 'High');

  return {
    label: ASSESSMENT_LABEL_BY_PANGRAM_LABEL[pangramResult.predictionShort],
    fractionAi: pangramResult.fractionAi,
    fractionAiAssisted: pangramResult.fractionAiAssisted,
    fractionHuman: pangramResult.fractionHuman,
    segmentCounts: {
      ai: pangramResult.numAiSegments,
      aiAssisted: pangramResult.numAiAssistedSegments,
      human: pangramResult.numHumanSegments,
    },
    nonHumanWordWeightedConfidenceDistribution: wordWeightedConfidenceDistribution(nonHumanWindows),
    highConfidenceNonHuman,
    highConfidenceNonHumanRuleVersion: HIGH_CONFIDENCE_NON_HUMAN_RULE_VERSION,
    modelName: PANGRAM_MODEL_NAME,
    modelVersion: pangramResult.version,
    checkedAt,
    transcriptSha256: hashTranscript(transcript),
  };
}

function wordWeightedConfidenceDistribution(windows: PangramWindow[]): AiTextAssessmentConfidenceDistribution {
  const wordCountByConfidence: AiTextAssessmentConfidenceDistribution = { High: 0, Medium: 0, Low: 0 };
  for (const window of windows) {
    wordCountByConfidence[ASSESSMENT_CONFIDENCE_BY_PANGRAM_CONFIDENCE[window.confidence]] += window.wordCount;
  }

  const totalWords = windows.reduce((sum, window) => sum + window.wordCount, 0);
  if (totalWords === 0) {
    return wordCountByConfidence;
  }

  return {
    High: wordCountByConfidence.High / totalWords,
    Medium: wordCountByConfidence.Medium / totalWords,
    Low: wordCountByConfidence.Low / totalWords,
  };
}
