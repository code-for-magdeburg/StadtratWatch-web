import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const [candidate, outputDir] = process.argv.slice(2);
const { ImagesGenerator } = await import(`./candidates/${candidate}.ts`);
const votings = JSON.parse(readFileSync(new URL('./votings.json', import.meta.url), 'utf8'));
mkdirSync(outputDir, { recursive: true });

const generator = new ImagesGenerator();
const wrappedLines = Object.fromEntries(
  votings.map((voting: any) => [`${voting.sessionId}-${voting.votingId}`, generator.getWrappedLines(voting.subjectTitle, 540)]),
);
writeFileSync(`${outputDir}/wrapped-lines.json`, JSON.stringify(wrappedLines, null, 2));

const started = performance.now();
const images = generator.generateVotingImages(votings);
const dataUrlIsSync = typeof images[0].canvas.toDataURL() === 'string';
for (const image of images) {
  const dataUrl = await image.canvas.toDataURL();
  const png = Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
  writeFileSync(`${outputDir}/${image.sessionId}-${image.votingId.toString().padStart(3, '0')}.png`, png);
}
console.log(JSON.stringify({ candidate, runtime: `bun ${Bun.version}`, platform: `${process.platform}-${process.arch}`, rendered: images.length, dataUrlIsSync, ms: Math.round(performance.now() - started) }));
