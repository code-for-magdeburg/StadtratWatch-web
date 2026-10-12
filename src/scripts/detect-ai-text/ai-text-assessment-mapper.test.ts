import { assertEquals } from '@std/assert';
import { describe, it } from '@std/testing/bdd';
import { buildAiTextAssessment } from './ai-text-assessment-mapper.ts';
import type { PangramLabel, PangramTaskResult, PangramWindow } from './pangram-client.ts';

function window(overrides: Partial<PangramWindow> = {}): PangramWindow {
  return { label: 'AI-Generated', confidence: 'High', wordCount: 100, ...overrides };
}

function pangramResult(label: PangramLabel, windows: PangramWindow[]): PangramTaskResult {
  return {
    version: '4.0',
    predictionShort: label,
    fractionAi: 1,
    fractionAiAssisted: 0,
    fractionHuman: 0,
    numAiSegments: windows.filter((w) => w.label === 'AI-Generated').length,
    numAiAssistedSegments: windows.filter((w) => w.label === 'AI-Assisted').length,
    numHumanSegments: windows.filter((w) => w.label === 'Human Written').length,
    windows,
  };
}

describe('buildAiTextAssessment', () => {
  it('marks an AI label with a single high-confidence non-human window as high-confidence', () => {
    const result = pangramResult('AI', [window({ label: 'AI-Generated', confidence: 'High' })]);

    const assessment = buildAiTextAssessment(result, 'Transkript', '2026-10-11');

    assertEquals(assessment.label, 'AI');
    assertEquals(assessment.highConfidenceNonHuman, true);
  });

  it('marks a Mixed label with all-high-confidence non-human windows as high-confidence', () => {
    const result = pangramResult('Mixed', [
      window({ label: 'AI-Assisted', confidence: 'High', wordCount: 50 }),
      window({ label: 'Human Written', confidence: 'Low', wordCount: 200 }),
    ]);

    const assessment = buildAiTextAssessment(result, 'Transkript', '2026-10-11');

    assertEquals(assessment.label, 'Mixed');
    assertEquals(assessment.highConfidenceNonHuman, true);
  });

  it('never marks a Human label as high-confidence, even with stray non-human windows', () => {
    const result = pangramResult('Human', [window({ label: 'AI-Generated', confidence: 'High' })]);

    const assessment = buildAiTextAssessment(result, 'Transkript', '2026-10-11');

    assertEquals(assessment.label, 'Human');
    assertEquals(assessment.highConfidenceNonHuman, false);
  });

  it('is false when a non-human window has non-high confidence', () => {
    const result = pangramResult('AI', [window({ label: 'AI-Generated', confidence: 'Medium' })]);

    const assessment = buildAiTextAssessment(result, 'Transkript', '2026-10-11');

    assertEquals(assessment.highConfidenceNonHuman, false);
  });

  it('is false when non-human windows have mixed confidence (one High, one Medium)', () => {
    const result = pangramResult('Mixed', [
      window({ label: 'AI-Generated', confidence: 'High', wordCount: 100 }),
      window({ label: 'AI-Assisted', confidence: 'Medium', wordCount: 50 }),
    ]);

    const assessment = buildAiTextAssessment(result, 'Transkript', '2026-10-11');

    assertEquals(assessment.highConfidenceNonHuman, false);
  });

  it('is false when there are no non-human windows at all', () => {
    const result = pangramResult('AI', []);

    const assessment = buildAiTextAssessment(result, 'Transkript', '2026-10-11');

    assertEquals(assessment.highConfidenceNonHuman, false);
  });

  it('always carries the weakest-non-human-window@1 rule version', () => {
    const result = pangramResult('Human', []);

    const assessment = buildAiTextAssessment(result, 'Transkript', '2026-10-11');

    assertEquals(assessment.highConfidenceNonHumanRuleVersion, 'weakest-non-human-window@1');
  });

  it('computes the word-weighted confidence distribution across non-human windows only', () => {
    const result = pangramResult('Mixed', [
      window({ label: 'AI-Generated', confidence: 'High', wordCount: 300 }),
      window({ label: 'AI-Assisted', confidence: 'Medium', wordCount: 100 }),
      window({ label: 'Human Written', confidence: 'Low', wordCount: 1000 }),
    ]);

    const assessment = buildAiTextAssessment(result, 'Transkript', '2026-10-11');

    assertEquals(assessment.nonHumanWordWeightedConfidenceDistribution, { High: 0.75, Medium: 0.25, Low: 0 });
  });

  it('computes transcriptSha256 from the given transcript', () => {
    const result = pangramResult('Human', []);

    const assessment = buildAiTextAssessment(result, 'Ein Transkript', '2026-10-11');
    const otherAssessment = buildAiTextAssessment(result, 'Ein anderes Transkript', '2026-10-11');

    assertEquals(assessment.transcriptSha256.length, 64);
    assertEquals(
      assessment.transcriptSha256 !== otherAssessment.transcriptSha256,
      true,
    );
  });

  it('carries the model name, model version, and checked-at date through', () => {
    const result = pangramResult('Human', []);

    const assessment = buildAiTextAssessment(result, 'Transkript', '2026-10-11');

    assertEquals(assessment.modelName, 'pangram-4');
    assertEquals(assessment.modelVersion, '4.0');
    assertEquals(assessment.checkedAt, '2026-10-11');
  });
});
