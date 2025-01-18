import type { SessionConfig } from '../../../src/scripts/shared/model/session-config.ts';
import type { SessionScan } from '../../../src/scripts/shared/model/session-scan.ts';
import type { SessionSpeech } from '../../../src/scripts/shared/model/session-speech.ts';

export type SessionInput = {
  sessionId: string;
  config: SessionConfig;
  votings: SessionScan;
  speeches: SessionSpeech[];
}
