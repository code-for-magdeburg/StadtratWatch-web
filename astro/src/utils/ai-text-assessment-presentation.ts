import {
  shouldExposeAiTextAssessment,
  type AssessedSessionSpeech,
} from '@models/ai-text-assessment';
import type { SessionSpeech } from '@models/session-speech';
import { isFeatureEnabled } from '@utils/feature-flags';

export const AI_TEXT_ASSESSMENT_BADGE_DESCRIPTION =
  'Dieser Redebeitrag enthält möglicherweise in Teilen KI-generierten Text.';

export function isAiTextAssessmentEnabled(): boolean {
  return isFeatureEnabled('ai-text-assessment');
}

export function isAiTextAssessmentVisible(
  speech: SessionSpeech,
): speech is AssessedSessionSpeech {
  return isAiTextAssessmentEnabled() && shouldExposeAiTextAssessment(speech);
}
