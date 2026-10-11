import {
  shouldExposeAiTextAssessment,
  type AssessedSessionSpeech,
} from '@models/ai-text-assessment';
import type { SessionSpeech } from '@models/session-speech';
import { isFeatureEnabled } from '@utils/feature-flags';

export function isAiTextAssessmentVisible(
  speech: SessionSpeech,
): speech is AssessedSessionSpeech {
  return (
    isFeatureEnabled('ai-text-assessment') &&
    shouldExposeAiTextAssessment(speech)
  );
}
