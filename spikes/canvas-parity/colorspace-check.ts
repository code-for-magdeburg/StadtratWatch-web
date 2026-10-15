import { readFileSync } from 'node:fs';
const path = process.argv[2];
const reference = readFileSync(new URL('./out/rgba-gfx.bin', import.meta.url));
const report = (label: string, data: ArrayLike<number>) => {
  let differing = 0, max = 0;
  for (let i = 0; i < reference.length; i++) { const d = Math.abs(data[i] - reference[i]); if (d) { differing++; max = Math.max(max, d); } }
  console.log(label.padEnd(48), `${(100 * differing / reference.length).toFixed(2)}% channels differ, max ${max}`);
};
const napi = await import('@napi-rs/canvas');
const napiImage = await napi.loadImage(path);
for (const contextSpace of ['srgb', 'display-p3'] as const) for (const readSpace of [undefined, 'srgb', 'display-p3'] as const) {
  const context = napi.createCanvas(napiImage.width, napiImage.height).getContext('2d', { colorSpace: contextSpace });
  context.drawImage(napiImage, 0, 0);
  report(`napi context=${contextSpace} getImageData=${readSpace ?? 'default'}`, (context as any).getImageData(0, 0, napiImage.width, napiImage.height, readSpace).data);
}
const skia: any = await import('skia-canvas');
const skiaImage = new skia.Image(readFileSync(path));
for (const contextSpace of ['srgb', 'display-p3']) for (const readSpace of [undefined, 'srgb', 'display-p3']) {
  const context = new skia.Canvas(skiaImage.width, skiaImage.height).getContext('2d', { colorSpace: contextSpace });
  context.drawImage(skiaImage, 0, 0);
  report(`skia context=${contextSpace} getImageData=${readSpace ?? 'default'}`, context.getImageData(0, 0, skiaImage.width, skiaImage.height, readSpace ? { colorSpace: readSpace } : undefined).data);
}
const { decode } = await import('fast-png');
const decoded = decode(readFileSync(path));
console.log('fast-png channels', decoded.channels, 'depth', decoded.depth, 'iccEmbeddedProfile' in decoded ? 'has icc field' : '');
report('fast-png decode (raw)', decoded.data);
const { PNG } = await import('pngjs');
report('pngjs PNG.sync.read (raw)', PNG.sync.read(readFileSync(path)).data);
