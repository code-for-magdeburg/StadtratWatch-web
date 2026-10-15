// Preload for Bun: resolves the Deno workspace package @srw-astro/models to its shims, and stubs the type-only @gfx/canvas import.
import { plugin } from 'bun';
const shims = new URL('../../src/deps/astro/', import.meta.url).pathname;
plugin({
  name: 'srw-models',
  setup(build) {
    build.onResolve({ filter: /^@srw-astro\/models\// }, (args) => ({ path: `${shims}${args.path.split('/').at(-1)}.ts` }));
    build.onResolve({ filter: /^@gfx\/canvas$/ }, () => ({ path: 'gfx-canvas-stub', namespace: 'stub' }));
    build.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export class CanvasRenderingContext2D {}', loader: 'js' }));
  },
});
