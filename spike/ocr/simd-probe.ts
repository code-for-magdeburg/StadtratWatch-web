import { relaxedSimd, simd } from 'wasm-feature-detect';

const runtime = 'Bun' in globalThis ? 'bun' : 'Deno' in globalThis ? 'deno' : 'node';
console.log(JSON.stringify({ runtime, simd: await simd(), relaxedSimd: await relaxedSimd() }));
