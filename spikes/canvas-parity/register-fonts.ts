// Preloaded via `bun --preload`: registers the Verdana files under out/fonts with the candidate named in CANVAS_CANDIDATE.
const directory = new URL('./out/fonts/', import.meta.url).pathname;
const files = ['Verdana.ttf', 'Verdana_Bold.ttf', 'Verdana_Italic.ttf', 'Verdana_Bold_Italic.ttf'].map((file) => directory + file);
const candidate = process.env.CANVAS_CANDIDATE;
if (candidate === 'napi') {
  const { GlobalFonts } = await import('@napi-rs/canvas');
  files.forEach((file) => GlobalFonts.registerFromPath(file, 'Verdana'));
} else if (candidate === 'skia') {
  const { FontLibrary } = await import('skia-canvas');
  FontLibrary.use('Verdana', files);
} else if (candidate === 'node-rc') {
  const { FontFace, fonts } = await import('canvas-rc');
  const { readFileSync } = await import('node:fs');
  const descriptors = [{}, { weight: 'bold' }, { style: 'italic' }, { weight: 'bold', style: 'italic' }];
  files.forEach((file, index) => fonts.add(new FontFace('Verdana', readFileSync(file), descriptors[index])));
} else {
  const { registerFont } = await import('canvas');
  registerFont(files[0], { family: 'Verdana' });
  registerFont(files[1], { family: 'Verdana', weight: 'bold' });
  registerFont(files[2], { family: 'Verdana', style: 'italic' });
  registerFont(files[3], { family: 'Verdana', weight: 'bold', style: 'italic' });
}
