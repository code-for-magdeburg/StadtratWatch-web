import type { SessionScan } from './session-scan.ts';
import type { SessionSpeech } from './session-speech.ts';
import type { RegistrySession } from './registry.ts';

export type SessionInput = {
  session: RegistrySession;
  votings: SessionScan;
  speeches: SessionSpeech[];
};
