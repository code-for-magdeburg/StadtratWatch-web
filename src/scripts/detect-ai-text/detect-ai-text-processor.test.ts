import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { hashTranscript } from '@srw-astro/models/ai-text-assessment';
import type { SessionSpeech } from '@srw-astro/models/session-speech';
import { executeDetectAiTextRun, planDetectAiTextRun } from './detect-ai-text-processor.ts';
import type { PangramAssessmentOutcome, PangramClient, PangramTaskResult } from './pangram-client.ts';

function speech(overrides: Partial<SessionSpeech> = {}): SessionSpeech {
  return {
    speaker: 'Max Mustermann',
    start: 0,
    duration: 60,
    transcription: 'Ein ausreichend langes Transkript fuer diesen Redebeitrag.',
    ...overrides,
  };
}

const AI_RESULT: PangramTaskResult = {
  version: '4.0',
  predictionShort: 'AI',
  fractionAi: 1,
  fractionAiAssisted: 0,
  fractionHuman: 0,
  numAiSegments: 1,
  numAiAssistedSegments: 0,
  numHumanSegments: 0,
  windows: [{ label: 'AI-Generated', confidence: 'High', wordCount: 100 }],
};

class FakePangramClient implements PangramClient {
  public readonly requestedTexts: string[] = [];

  constructor(private readonly outcomeFor: (text: string) => PangramAssessmentOutcome | Error) {}

  assessText(text: string): Promise<PangramAssessmentOutcome> {
    this.requestedTexts.push(text);
    const outcome = this.outcomeFor(text);
    if (outcome instanceof Error) {
      return Promise.reject(outcome);
    }
    return Promise.resolve(outcome);
  }
}

describe('planDetectAiTextRun', () => {
  it('selects speeches whose start matches the requested list', () => {
    const speeches = [speech({ start: 100 }), speech({ start: 200 }), speech({ start: 300 })];

    const plan = planDetectAiTextRun(speeches, [100, 300], false);

    expect(plan.toAssess.map((s) => s.start)).toEqual([100, 300]);
  });

  it('reports a requested start that does not exist in the file', () => {
    const speeches = [speech({ start: 100 })];

    const plan = planDetectAiTextRun(speeches, [999], false);

    expect(plan.toAssess).toEqual([]);
    expect(plan.notFoundStarts).toEqual([999]);
  });

  it('skips a speech with a matching existing assessment when skip-existing is set', () => {
    const transcription = 'Ein ausreichend langes Transkript fuer diesen Redebeitrag.';
    const existing = speech({
      start: 100,
      transcription,
      aiTextAssessment: {
        label: 'Human',
        fractionAi: 0,
        fractionAiAssisted: 0,
        fractionHuman: 1,
        segmentCounts: { ai: 0, aiAssisted: 0, human: 1 },
        nonHumanWordWeightedConfidenceDistribution: { High: 0, Medium: 0, Low: 0 },
        highConfidenceNonHuman: false,
        highConfidenceNonHumanRuleVersion: 'weakest-non-human-window@1',
        modelName: 'pangram-4',
        modelVersion: '4.0',
        checkedAt: '2026-10-01',
        transcriptSha256: hashTranscript(transcription),
      },
    });

    const plan = planDetectAiTextRun([existing], [100], true);

    expect(plan.toAssess).toEqual([]);
    expect(plan.skippedExisting).toEqual([existing]);
  });

  it('treats a drifted transcript (hash mismatch) as unassessed and re-selects it', () => {
    const existing = speech({
      start: 100,
      transcription: 'Der korrigierte Text nach der Transkriptkorrektur.',
      aiTextAssessment: {
        label: 'Human',
        fractionAi: 0,
        fractionAiAssisted: 0,
        fractionHuman: 1,
        segmentCounts: { ai: 0, aiAssisted: 0, human: 1 },
        nonHumanWordWeightedConfidenceDistribution: { High: 0, Medium: 0, Low: 0 },
        highConfidenceNonHuman: false,
        highConfidenceNonHumanRuleVersion: 'weakest-non-human-window@1',
        modelName: 'pangram-4',
        modelVersion: '4.0',
        checkedAt: '2026-10-01',
        transcriptSha256: hashTranscript('Der urspruengliche, nicht korrigierte Text.'),
      },
    });

    const plan = planDetectAiTextRun([existing], [100], true);

    expect(plan.toAssess).toEqual([existing]);
    expect(plan.skippedExisting).toEqual([]);
  });

  it('estimates the cost from the total word count of the selected speeches', () => {
    const speeches = [speech({ start: 100, transcription: Array(200).fill('wort').join(' ') })];

    const plan = planDetectAiTextRun(speeches, [100], false);

    expect(plan.totalWordCount).toEqual(200);
    expect(plan.estimatedCostUsd).toEqual(0.1);
  });
});

describe('executeDetectAiTextRun', () => {
  afterEach(() => mock.restore());

  it('writes the resulting assessment onto the speech', async () => {
    const target = speech({ start: 100 });
    const client = new FakePangramClient(() => ({ kind: 'assessed', result: AI_RESULT }));

    const result = await executeDetectAiTextRun([target], client, () => '2026-10-11');

    expect(result).toEqual({ assessedCount: 1, skippedTooShortCount: 0, failedCount: 0 });
    expect(target.aiTextAssessment?.label).toEqual('AI');
    expect(target.aiTextAssessment?.highConfidenceNonHuman).toEqual(true);
  });

  it('continues with the next speech when one Pangram request fails', async () => {
    const failing = speech({ start: 100, speaker: 'Failing Speaker', transcription: 'Transkript A' });
    const succeeding = speech({ start: 200, speaker: 'Succeeding Speaker', transcription: 'Transkript B' });
    const client: PangramClient = {
      assessText: (text: string) =>
        text === failing.transcription
          ? Promise.reject(new Error('Pangram request failed'))
          : Promise.resolve({ kind: 'assessed', result: AI_RESULT }),
    };
    const consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});

    const result = await executeDetectAiTextRun([failing, succeeding], client, () => '2026-10-11');

    expect(result).toEqual({ assessedCount: 1, skippedTooShortCount: 0, failedCount: 1 });
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(failing.aiTextAssessment).toEqual(undefined);
    expect(succeeding.aiTextAssessment?.label).toEqual('AI');
  });

  it('counts a too-short outcome as skipped without writing an assessment', async () => {
    const target = speech({ start: 100 });
    const client = new FakePangramClient(() => ({ kind: 'skipped-too-short', wordCount: 10 }));

    const result = await executeDetectAiTextRun([target], client, () => '2026-10-11');

    expect(result).toEqual({ assessedCount: 0, skippedTooShortCount: 1, failedCount: 0 });
    expect(target.aiTextAssessment).toEqual(undefined);
  });
});
