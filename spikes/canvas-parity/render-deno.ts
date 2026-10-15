import { VotingsImageDataGenerator } from '../../src/scripts/generate-image-assets/votings-image-data-generator.ts';
import { ImagesGenerator } from '../../src/scripts/generate-image-assets/images-generator.ts';
import { InputDataLoaders } from '../../src/scripts/generate-image-assets/input-data-loaders.ts';
import { decodeBase64 } from '@std/encoding';

const [inputDir, outputDir] = Deno.args;
const sample: { file: string }[] = JSON.parse(Deno.readTextFileSync(new URL('./sample.json', import.meta.url)));
const wanted = new Set(sample.map((s) => s.file.replace('.png', '')));
const { registry, sessionsInput } = new InputDataLoaders(inputDir).loadInputData();
const votings = new VotingsImageDataGenerator().generateVotingsImageData(registry, sessionsInput)
  .filter((v) => wanted.has(`${v.sessionId}-${v.votingId.toString().padStart(3, '0')}`));
Deno.mkdirSync(outputDir, { recursive: true });
Deno.writeTextFileSync(new URL('./votings.json', import.meta.url), JSON.stringify(votings, null, 2));
const generator = new ImagesGenerator();
// deno-lint-ignore no-explicit-any
const wrappedLines = Object.fromEntries(votings.map((v) => [`${v.sessionId}-${v.votingId}`, (generator as any).getWrappedLines(v.subjectTitle, 540)]));
Deno.writeTextFileSync(`${outputDir}/wrapped-lines.json`, JSON.stringify(wrappedLines, null, 2));
for (const image of generator.generateVotingImages(votings)) {
  const name = `${image.sessionId}-${image.votingId.toString().padStart(3, '0')}.png`;
  Deno.writeFileSync(`${outputDir}/${name}`, decodeBase64(image.canvas.toDataURL().replace(/^data:image\/png;base64,/, '')));
}
console.log('rendered', votings.length);
