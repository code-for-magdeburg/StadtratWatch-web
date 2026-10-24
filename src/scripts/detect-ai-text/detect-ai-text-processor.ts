import { isAiTextAssessmentCurrent } from '@srw-astro/models/ai-text-assessment';
import type { SessionSpeech } from '@srw-astro/models/session-speech';

import { buildAiTextAssessment } from './ai-text-assessment-mapper.ts';
import { countWords, type PangramClient } from './pangram-client.ts';

const USD_PER_100_WORDS = 0.05;

export type DetectAiTextPlan = {
  toAssess: SessionSpeech[];
  skippedExisting: SessionSpeech[];
  notFoundStarts: number[];
  totalWordCount: number;
  estimatedCostUsd: number;
};

export function planDetectAiTextRun(
  speeches: SessionSpeech[],
  starts: number[],
  skipExisting: boolean,
): DetectAiTextPlan {
  const toAssess: SessionSpeech[] = [];
  const skippedExisting: SessionSpeech[] = [];
  const notFoundStarts: number[] = [];

  for (const start of starts) {
    const speech = speeches.find((candidate) => candidate.start === start);
    if (!speech) {
      notFoundStarts.push(start);
      continue;
    }

    if (skipExisting && isAiTextAssessmentCurrent(speech)) {
      skippedExisting.push(speech);
      continue;
    }

    toAssess.push(speech);
  }

  const totalWordCount = toAssess.reduce((sum, speech) => sum + countWords(speech.transcription ?? ''), 0);
  const estimatedCostUsd = (totalWordCount / 100) * USD_PER_100_WORDS;

  return { toAssess, skippedExisting, notFoundStarts, totalWordCount, estimatedCostUsd };
}

export type DetectAiTextRunResult = {
  assessedCount: number;
  skippedTooShortCount: number;
  failedCount: number;
};

export async function executeDetectAiTextRun(
  toAssess: SessionSpeech[],
  pangramClient: PangramClient,
  checkedAtProvider: () => string,
): Promise<DetectAiTextRunResult> {
  let assessedCount = 0;
  let skippedTooShortCount = 0;
  let failedCount = 0;

  for (const speech of toAssess) {
    const transcript = speech.transcription ?? '';

    try {
      const outcome = await pangramClient.assessText(transcript);
      if (outcome.kind === 'skipped-too-short') {
        console.warn(`Skipping ${speech.speaker} at ${speech.start}: only ${outcome.wordCount} words.`);
        skippedTooShortCount++;
        continue;
      }

      speech.aiTextAssessment = buildAiTextAssessment(outcome.result, transcript, checkedAtProvider());
      assessedCount++;
    } catch (error) {
      console.error(`Failed to assess speech by ${speech.speaker} at ${speech.start}:`, error);
      failedCount++;
    }
  }

  return { assessedCount, skippedTooShortCount, failedCount };
}
