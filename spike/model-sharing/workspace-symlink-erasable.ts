import { toPaperBatchNo } from '@srw/models/paper-batch';
import { hashTranscript } from '@srw/models/ai-text-assessment';

console.log(JSON.stringify({ probe: 'workspace-symlink-erasable', batchNo: toPaperBatchNo(1234), hash: hashTranscript('x').slice(0, 8) }));
