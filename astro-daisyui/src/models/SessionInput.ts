import type { SessionConfig } from './session-config.ts';
import type { SessionScan } from './session-scan.ts';
import type { SessionSpeech } from './session-speech.ts';

export type SessionInput = {
  sessionId: string;
  config: SessionConfig;
  votings: SessionScan;
  speeches: SessionSpeech[];
};
