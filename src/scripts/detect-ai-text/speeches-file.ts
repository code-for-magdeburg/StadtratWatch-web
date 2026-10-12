import type { SessionSpeech } from '@srw-astro/models/session-speech';

export function serializeSpeeches(speeches: SessionSpeech[]): string {
  return `${JSON.stringify(speeches, null, 2)}\n`;
}
