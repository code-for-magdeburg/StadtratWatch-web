import { toPaperBatchNo } from '../../astro/src/models/paper-batch.ts';
import { hashTranscript } from '../../astro/src/models/ai-text-assessment.ts';

console.log(JSON.stringify({ probe: 'relative-erasable', batchNo: toPaperBatchNo(1234), hash: hashTranscript('x').slice(0, 8) }));
