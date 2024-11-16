import { SessionConfig } from './session-config';
import { SessionScan } from './session-scan';
import { SessionSpeech } from './session-speech';


export type SessionInputData = {
  sessionId: string;
  config: SessionConfig,
  scan: SessionScan,
  speeches: SessionSpeech[]
}
