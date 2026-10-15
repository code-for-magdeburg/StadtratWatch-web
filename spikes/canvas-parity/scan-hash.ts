// Runs on Deno (gfx) and Bun (candidates): loads each screenshot synchronously, draws it and hashes the full RGBA buffer.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const [candidate, mediaDir, outputFile] = (globalThis as any).Deno ? (globalThis as any).Deno.args : process.argv.slice(2);

async function loadSync(): Promise<(path: string) => { width: number; height: number; data: Uint8ClampedArray }> {
  const read = (createCanvas: any, image: any) => {
    const context = createCanvas(image.width, image.height).getContext('2d');
    context.drawImage(image, 0, 0);
    return { width: image.width, height: image.height, data: context.getImageData(0, 0, image.width, image.height).data };
  };
  if (candidate === 'gfx') {
    const { Image, createCanvas } = await import('@gfx/canvas');
    return (path) => read(createCanvas, Image.loadSync(path));
  }
  if (candidate === 'napi') {
    const { Image, createCanvas } = await import('@napi-rs/canvas');
    return (path) => { const image = new Image(); image.src = readFileSync(path); return read(createCanvas, image); };
  }
  if (candidate === 'skia') {
    const { Image, Canvas } = await import('skia-canvas');
    return (path) => read((w: number, h: number) => new Canvas(w, h), new (Image as any)(readFileSync(path)));
  }
  const { Image, createCanvas } = await import(candidate === 'node-rc' ? 'canvas-rc' : 'canvas');
  return (path) => { const image = new Image(); image.src = readFileSync(path); return read(createCanvas, image); };
}

const load = await loadSync();
const hashes: Record<string, string> = {};
const started = performance.now();
for (const session of readdirSync(mediaDir).filter((name) => /^\d{4}-\d{2}-\d{2}$/.test(name)).sort()) {
  for (const file of readdirSync(`${mediaDir}/${session}`).filter((name) => name.endsWith('.png')).sort()) {
    const { width, height, data } = load(`${mediaDir}/${session}/${file}`);
    hashes[file] = `${width}x${height}:${createHash('sha256').update(data).digest('hex').slice(0, 16)}`;
  }
}
writeFileSync(outputFile, JSON.stringify(hashes, null, 1));
console.log(candidate, Object.keys(hashes).length, 'images', Math.round(performance.now() - started), 'ms');
