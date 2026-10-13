import { toPaperBatchNo } from '#models/paper-batch';
import { hashTranscript } from '#models/ai-text-assessment';

console.log(JSON.stringify({ probe: 'subpath-imports-erasable', batchNo: toPaperBatchNo(1234), hash: hashTranscript('x').slice(0, 8) }));
