import { getVoteCounts } from '@srw/models/voting-breakdown';

const counts = getVoteCounts({ votes: [{ name: 'a', vote: 'J' }] } as never);
console.log(JSON.stringify({ probe: 'workspace-symlink-enum', counts }));
