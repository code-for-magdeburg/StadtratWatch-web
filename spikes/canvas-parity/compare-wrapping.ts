import { readFileSync } from 'node:fs';
const [referencePath, candidatePath] = process.argv.slice(2);
const reference = JSON.parse(readFileSync(referencePath, 'utf8'));
const candidate = JSON.parse(readFileSync(candidatePath, 'utf8'));
let changed = 0;
for (const key of Object.keys(reference)) {
  if (JSON.stringify(reference[key]) === JSON.stringify(candidate[key])) continue;
  changed++;
  console.log(`  ${key}: ${reference[key].length} -> ${candidate[key].length} lines`);
  reference[key].forEach((line: string, i: number) => { if (line !== candidate[key][i]) console.log(`    - ${JSON.stringify(line)}\n    + ${JSON.stringify(candidate[key][i])}`); });
}
console.log(`  wrapping changed: ${changed} / ${Object.keys(reference).length}`);
