import { SessionConfig } from './session-config.ts';
import { SessionScan } from './session-scan.ts';
import { SessionSpeech } from './session-speech.ts';


export type SessionInputData = {
  sessionId: string;
  config: SessionConfig,
  scan: SessionScan,
  speeches: SessionSpeech[]
}
