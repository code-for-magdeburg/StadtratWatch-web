import { readdirSync, existsSync, readFileSync } from 'node:fs';
const dir = 'data/magdeburg-8';
const all: { session: string; file: string; type: string; len: number; title: string }[] = [];
for (const s of readdirSync(dir)) {
  const f = `${dir}/${s}/session-scan-${s}.json`;
  if (!existsSync(f)) continue;
  for (const v of JSON.parse(readFileSync(f, 'utf8'))) {
    all.push({ session: s, file: v.votingFilename, type: v.votingSubject.type ?? 'Sonstige', len: v.votingSubject.title.length, title: v.votingSubject.title });
  }
}
all.sort((a, b) => a.len - b.len);
console.log('total', all.length, 'types', [...new Set(all.map((v) => v.type))]);
const picks = new Map<string, (typeof all)[0]>();
for (const p of [0, 0.1, 0.25, 0.5, 0.75, 0.85, 0.9, 0.95, 0.98, 1]) { const v = all[Math.min(all.length - 1, Math.floor(p * all.length))]; picks.set(v.file, v); }
for (const t of new Set(all.map((v) => v.type))) { const v = all.filter((x) => x.type === t).at(-1)!; picks.set(v.file, v); }
const umlaut = all.filter((v) => /[äöüßÄÖÜ„“–]/.test(v.title) && v.len > 120).at(-3); if (umlaut) picks.set(umlaut.file, umlaut);
for (const v of picks.values()) console.log(v.session, v.file, v.type, v.len, v.title.slice(0, 80));
await Bun.write('spikes/canvas-parity/sample.json', JSON.stringify([...picks.values()].map((v) => ({ session: v.session, file: v.file })), null, 2));
