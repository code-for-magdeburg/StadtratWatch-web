import { createCanvas, Image, loadImage } from '@napi-rs/canvas';
import { readFileSync } from 'node:fs';
const path = process.argv[2];
const reference = readFileSync(new URL('./out/rgba-gfx.bin', import.meta.url));
const pixels = (image: any) => {
  const context = createCanvas(image.width, image.height).getContext('2d');
  context.drawImage(image, 0, 0);
  return Buffer.from(context.getImageData(0, 0, image.width, image.height).data);
};
const report = (label: string, data: Buffer) => {
  let differing = 0, max = 0;
  for (let i = 0; i < data.length; i++) { const d = Math.abs(data[i] - reference[i]); if (d) { differing++; max = Math.max(max, d); } }
  console.log(label.padEnd(26), 'differing channels', `${(100 * differing / data.length).toFixed(2)}%`, 'max', max, 'sample', [...data.subarray(0, 4)].join(','));
};
const syncImage = new Image(); syncImage.src = readFileSync(path);
report('src=Buffer, no await', pixels(syncImage));
const decodedImage = new Image(); decodedImage.src = readFileSync(path); await decodedImage.decode();
report('src=Buffer + decode()', pixels(decodedImage));
report('await loadImage(path)', pixels(await loadImage(path)));
const onloadImage = await new Promise((resolve) => { const image = new Image(); image.onload = () => resolve(image); image.src = readFileSync(path); });
report('onload', pixels(onloadImage));
