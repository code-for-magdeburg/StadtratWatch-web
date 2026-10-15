import { readFileSync, writeFileSync } from 'node:fs';
const [candidate, path, outputFile] = (globalThis as any).Deno ? (globalThis as any).Deno.args : process.argv.slice(2);
let width = 0, height = 0, data: Uint8ClampedArray;
if (candidate === 'gfx') {
  const { Image, createCanvas } = await import('@gfx/canvas');
  const image = Image.loadSync(path); width = image.width; height = image.height;
  const context = createCanvas(width, height).getContext('2d'); context.drawImage(image, 0, 0);
  data = context.getImageData(0, 0, width, height).data;
} else {
  const lib: any = await import(candidate === 'napi' ? '@napi-rs/canvas' : candidate === 'skia' ? 'skia-canvas' : 'canvas');
  let image: any;
  if (candidate === 'skia') image = new lib.Image(readFileSync(path)); else { image = new lib.Image(); image.src = readFileSync(path); }
  width = image.width; height = image.height;
  const canvas = candidate === 'skia' ? new lib.Canvas(width, height) : lib.createCanvas(width, height);
  const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
  data = context.getImageData(0, 0, width, height).data;
}
writeFileSync(outputFile, data!);
