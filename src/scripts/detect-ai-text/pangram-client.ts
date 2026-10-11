export const PANGRAM_MODEL_NAME = 'pangram-4';
export const PANGRAM_MIN_WORD_COUNT = 50;

const PANGRAM_BASE_URL = 'https://text.external-api.pangram.com';
const MIN_REQUEST_INTERVAL_MS = 1000 / 5; // Pangram allows at most 5 requests/second.
const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 120_000;

export type PangramLabel = 'AI' | 'Mixed' | 'Human';
export type PangramConfidence = 'High' | 'Medium' | 'Low';
export type PangramWindowLabel = 'AI-Generated' | 'AI-Assisted' | 'Human Written';

export type PangramWindow = {
  label: PangramWindowLabel;
  confidence: PangramConfidence;
  wordCount: number;
};

export type PangramTaskResult = {
  version: string;
  predictionShort: PangramLabel;
  fractionAi: number;
  fractionAiAssisted: number;
  fractionHuman: number;
  numAiSegments: number;
  numAiAssistedSegments: number;
  numHumanSegments: number;
  windows: PangramWindow[];
};

export type PangramAssessmentOutcome =
  | { kind: 'assessed'; result: PangramTaskResult }
  | { kind: 'skipped-too-short'; wordCount: number };

export interface PangramClient {
  assessText(text: string): Promise<PangramAssessmentOutcome>;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

type RawPangramWindow = {
  label: string;
  confidence: string;
  word_count: number;
};

type RawPangramTaskResponse = {
  stage: string;
  version: string;
  headline: string;
  prediction_short: string;
  fraction_ai: number;
  fraction_ai_assisted: number;
  fraction_human: number;
  num_ai_segments: number;
  num_ai_assisted_segments: number;
  num_human_segments: number;
  windows: RawPangramWindow[];
};

export class PangramHttpClient implements PangramClient {
  private lastRequestAt = 0;

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string = PANGRAM_BASE_URL,
  ) {}

  public async assessText(text: string): Promise<PangramAssessmentOutcome> {
    const wordCount = countWords(text);
    if (wordCount < PANGRAM_MIN_WORD_COUNT) {
      console.warn(`Skipping text with ${wordCount} words (below the ${PANGRAM_MIN_WORD_COUNT}-word minimum).`);
      return { kind: 'skipped-too-short', wordCount };
    }

    const taskId = await this.submitTask(text);
    const rawResult = await this.pollTask(taskId);
    return { kind: 'assessed', result: toTaskResult(rawResult) };
  }

  private async submitTask(text: string): Promise<string> {
    await this.throttle();

    const response = await fetch(`${this.baseUrl}/task`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': this.apiKey },
      body: JSON.stringify({ text, model: PANGRAM_MODEL_NAME, public_dashboard_link: false }),
    });

    if (!response.ok) {
      throw new Error(`Pangram task submission failed: ${response.status} ${response.statusText}`);
    }

    const { task_id } = await response.json();
    return task_id;
  }

  private async pollTask(taskId: string): Promise<RawPangramTaskResponse> {
    const deadline = Date.now() + POLL_TIMEOUT_MS;

    while (Date.now() < deadline) {
      await this.throttle();

      const response = await fetch(`${this.baseUrl}/task/${taskId}`, {
        headers: { 'x-api-key': this.apiKey },
      });

      if (!response.ok) {
        throw new Error(`Pangram task polling failed: ${response.status} ${response.statusText}`);
      }

      const result: RawPangramTaskResponse = await response.json();
      if (result.stage === 'STAGE_SUCCESS') {
        return result;
      }
      if (result.stage === 'STAGE_FAILED') {
        throw new Error(`Pangram task failed: ${result.headline}`);
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    throw new Error(`Pangram task ${taskId} did not complete within ${POLL_TIMEOUT_MS}ms.`);
  }

  private async throttle(): Promise<void> {
    const elapsed = Date.now() - this.lastRequestAt;
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - elapsed));
    }
    this.lastRequestAt = Date.now();
  }
}

function toTaskResult(raw: RawPangramTaskResponse): PangramTaskResult {
  return {
    version: raw.version,
    predictionShort: raw.prediction_short as PangramLabel,
    fractionAi: raw.fraction_ai,
    fractionAiAssisted: raw.fraction_ai_assisted,
    fractionHuman: raw.fraction_human,
    numAiSegments: raw.num_ai_segments,
    numAiAssistedSegments: raw.num_ai_assisted_segments,
    numHumanSegments: raw.num_human_segments,
    windows: raw.windows.map((window) => ({
      label: window.label as PangramWindowLabel,
      confidence: window.confidence as PangramConfidence,
      wordCount: window.word_count,
    })),
  };
}
