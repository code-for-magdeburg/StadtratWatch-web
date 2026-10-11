import { createHash } from 'node:crypto';
import { describe, expect, test } from 'vitest';
import { shouldExposeAiTextAssessment } from './ai-text-assessment.ts';
import type { AiTextAssessment } from './ai-text-assessment.ts';
import type { SessionSpeech } from './session-speech.ts';

function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function createAssessment(
  overrides: Partial<AiTextAssessment> = {},
): AiTextAssessment {
  return {
    label: 'AI',
    fractionAi: 1,
    fractionAiAssisted: 0,
    fractionHuman: 0,
    segmentCounts: { ai: 1, aiAssisted: 0, human: 0 },
    nonHumanWordWeightedConfidenceDistribution: { High: 1, Medium: 0, Low: 0 },
    highConfidenceNonHuman: true,
    highConfidenceNonHumanRuleVersion: 'weakest-non-human-window@1',
    modelName: 'pangram-4',
    modelVersion: '4.0',
    checkedAt: '2026-10-11',
    transcriptSha256: sha256Hex('Transkribierter Text'),
    ...overrides,
  };
}

function createSpeech(overrides: Partial<SessionSpeech> = {}): SessionSpeech {
  return {
    speaker: 'Max Mustermann',
    start: 0,
    duration: 60,
    transcription: 'Transkribierter Text',
    ...overrides,
  };
}

describe('shouldExposeAiTextAssessment', () => {
  test('returns false when no assessment is present', () => {
    expect(shouldExposeAiTextAssessment(createSpeech())).toBe(false);
  });

  test('returns false when highConfidenceNonHuman is false', () => {
    const speech = createSpeech({
      aiTextAssessment: createAssessment({ highConfidenceNonHuman: false }),
    });

    expect(shouldExposeAiTextAssessment(speech)).toBe(false);
  });

  test('returns true when highConfidenceNonHuman is true and the hash matches the current transcription', () => {
    const speech = createSpeech({
      aiTextAssessment: createAssessment(),
    });

    expect(shouldExposeAiTextAssessment(speech)).toBe(true);
  });

  test('returns false when the transcript hash no longer matches the current transcription (drift)', () => {
    const speech = createSpeech({
      transcription: 'Korrigierter Transkriptionstext',
      aiTextAssessment: createAssessment(),
    });

    expect(shouldExposeAiTextAssessment(speech)).toBe(false);
  });
});
