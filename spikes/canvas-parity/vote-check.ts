import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { VotesRecognizer } from '../../src/scripts/scan-voting-images/votes-recognizer.ts';

const [candidate, mediaDir, outputFile] = process.argv.slice(2);
const dataDir = new URL('../../data/magdeburg-8/', import.meta.url).pathname;

const rawPixels = (width: number, data: ArrayLike<number>) => ({
  getImageData: (x: number, y: number, w: number, h: number) => {
    const out = new Uint8ClampedArray(w * h * 4);
    for (let row = 0; row < h; row++) for (let column = 0; column < w; column++) for (let channel = 0; channel < 4; channel++) {
      out[(row * w + column) * 4 + channel] = data[((y + row) * width + x + column) * 4 + channel];
    }
    return { data: out };
  },
});

async function contextLoader(): Promise<(path: string) => Promise<any>> {
  if (candidate === 'napi-p3') {
    const { createCanvas, loadImage } = await import('@napi-rs/canvas');
    return async (path) => {
      const image = await loadImage(path); const context: any = createCanvas(image.width, image.height).getContext('2d'); context.drawImage(image, 0, 0);
      return { getImageData: (x: number, y: number, w: number, h: number) => context.getImageData(x, y, w, h, 'display-p3') };
    };
  }
  if (candidate === 'skia-p3') {
    const { Canvas, Image } = await import('skia-canvas');
    return async (path) => { const image = new (Image as any)(readFileSync(path)); const context = new Canvas(image.width, image.height).getContext('2d', { colorSpace: 'display-p3' } as any); context.drawImage(image, 0, 0); return context; };
  }
  if (candidate === 'fast-png') {
    const { decode } = await import('fast-png');
    return async (path) => { const png = decode(readFileSync(path)); return rawPixels(png.width, png.data as any); };
  }
  if (candidate === 'pngjs') {
    const { PNG } = await import('pngjs');
    return async (path) => { const png = PNG.sync.read(readFileSync(path)); return rawPixels(png.width, png.data); };
  }
  if (candidate === 'napi') {
    const { createCanvas, loadImage } = await import('@napi-rs/canvas');
    return async (path) => { const image = await loadImage(path); const context = createCanvas(image.width, image.height).getContext('2d'); context.drawImage(image, 0, 0); return context; };
  }
  if (candidate === 'skia') {
    const { Canvas, Image } = await import('skia-canvas');
    return async (path) => { const image = new (Image as any)(readFileSync(path)); const context = new Canvas(image.width, image.height).getContext('2d'); context.drawImage(image, 0, 0); return context; };
  }
  const { createCanvas, Image } = await import(candidate === 'node-rc' ? 'canvas-rc' : 'canvas');
  return async (path) => { const image = new Image(); image.src = readFileSync(path); const context = createCanvas(image.width, image.height).getContext('2d'); context.drawImage(image, 0, 0); return context; };
}

const load = await contextLoader();
const votes: Record<string, string> = {};
for (const session of readdirSync(mediaDir).filter((name) => /^\d{4}-\d{2}-\d{2}$/.test(name)).sort()) {
  const configFile = `${dataDir}${session}/config-${session}.json`;
  if (!existsSync(configFile)) continue;
  const config = JSON.parse(readFileSync(configFile, 'utf8'));
  for (const file of readdirSync(`${mediaDir}/${session}`).filter((name) => name.endsWith('.png')).sort()) {
    const context = await load(`${mediaDir}/${session}/${file}`);
    const recognizer = new VotesRecognizer({ loadVotingImage: () => context } as any);
    for (const vote of recognizer.getVotesForNames(file, config)) votes[`${file}/${vote.name}`] = vote.vote;
  }
}
writeFileSync(outputFile, JSON.stringify(votes));
console.log(candidate, Object.keys(votes).length, 'votes');
