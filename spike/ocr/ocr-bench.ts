import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createWorker } from 'tesseract.js';

type Rectangle = { left: number; top: number; width: number; height: number };
type Layout = {
  videoTimestampRectangle: Rectangle;
  votingSubjectIdRectangle: Rectangle;
  votingSubjectTitleRectangle: Rectangle;
};

const [configPath, imagesDir, outputPath, limitArgument] = process.argv.slice(2);
const runtime = 'Bun' in globalThis ? 'bun' : 'Deno' in globalThis ? 'deno' : 'node';
const layout: Layout = JSON.parse(readFileSync(configPath, 'utf8')).layout;
const filenames = readdirSync(imagesDir).filter((name) => name.endsWith('.png')).sort()
  .slice(0, limitArgument ? Number(limitArgument) : undefined);

const workerStart = performance.now();
const worker = await createWorker('deu');
const workerReadyMs = performance.now() - workerStart;

const recognizeStart = performance.now();
const results = [];
for (const filename of filenames) {
  const filepath = join(imagesDir, filename);
  const timestamp = await worker.recognize(filepath, { rectangle: layout.videoTimestampRectangle });
  const subjectId = await worker.recognize(filepath, { rectangle: layout.votingSubjectIdRectangle });
  const subjectTitle = await worker.recognize(filepath, { rectangle: layout.votingSubjectTitleRectangle });
  results.push({
    filename,
    timestamp: timestamp.data.text.trim(),
    subjectId: subjectId.data.text.trim(),
    subjectTitle: subjectTitle.data.text.trim(),
  });
}
const recognizeMs = performance.now() - recognizeStart;
await worker.terminate();

writeFileSync(outputPath, JSON.stringify(results, null, 2));
console.log(JSON.stringify({
  runtime,
  version: process.version,
  images: filenames.length,
  workerReadyMs: Math.round(workerReadyMs),
  recognizeMs: Math.round(recognizeMs),
  msPerImage: Math.round(recognizeMs / filenames.length),
}));
