// Runs on Deno (gfx) and Bun (candidates): wraps every subject in data/ and writes the lines per voting.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
const [candidate, outputFile] = (globalThis as any).Deno ? (globalThis as any).Deno.args : process.argv.slice(2);
const module = candidate === 'gfx'
  ? await import('../../src/scripts/generate-image-assets/images-generator.ts')
  : await import(`./candidates/${candidate}.ts`);
const generator = new module.ImagesGenerator();
const lines: Record<string, string[]> = {};
for (const period of ['magdeburg-7', 'magdeburg-8']) {
  for (const session of readdirSync(`data/${period}`)) {
    const file = `data/${period}/${session}/session-scan-${session}.json`;
    if (!existsSync(file)) continue;
    for (const voting of JSON.parse(readFileSync(file, 'utf8'))) {
      lines[`${period}/${voting.votingFilename}`] = (generator as any).getWrappedLines(voting.votingSubject.title, 540);
    }
  }
}
writeFileSync(outputFile, JSON.stringify(lines, null, 1));
console.log(candidate, Object.keys(lines).length);
