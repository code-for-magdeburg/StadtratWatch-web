import { getVoteCounts } from '../../astro/src/models/voting-breakdown.ts';

const counts = getVoteCounts({ votes: [{ name: 'a', vote: 'J' }] } as never);
console.log(JSON.stringify({ probe: 'relative-enum', counts }));
