import { getVoteCounts } from '#models/voting-breakdown';

const counts = getVoteCounts({ votes: [{ name: 'a', vote: 'J' }] } as never);
console.log(JSON.stringify({ probe: 'subpath-imports-enum', counts }));
