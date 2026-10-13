# Spike: run the risky scripts on Bun and Node

Throwaway branch for [Spike: run the risky scripts on Bun and Node](https://github.com/JensWinter/StadtratWatch-web/issues/542). Never merge it.

Measured 2026-10-13 on macOS arm64 with Bun 1.4.2, Node 22.19.0 and 25.2.1, Deno 2.9.7, tsx 4.23.15.

## Setup

```bash
cd spike && npm install
# simulate an npm workspace symlink for the model-sharing probes
mkdir -p node_modules/@srw && ln -sfn ../../model-sharing/models-package node_modules/@srw/models
```

The root `package.json` (only an `imports` map) and `src/spike-model-sharing/` belong to the spike too.

## 1. tesseract.js (scan-voting-images)

`ocr/simd-probe.ts` calls the same `wasm-feature-detect` check tesseract.js 6 uses to pick its core. `ocr/ocr-bench.ts` runs the
three `recognize` calls of `TextRecognizer` (timestamp, subject id, subject title) over all 64 images of 2026-08-31.

| Runtime     | SIMD | Worker ready | ms per image (2 runs) | Output                  |
| ----------- | ---- | ------------ | --------------------- | ----------------------- |
| Deno 2.9.7  | yes  | ~100 ms      | 596 / 602             | reference               |
| Node 22.19  | yes  | ~90 ms       | 369 / 382             | byte-identical to Deno  |
| Node 25.2   | yes  | ~90 ms       | 326                   | byte-identical to Deno  |
| Bun 1.4.2   | yes  | ~100 ms      | 300 / 306             | byte-identical to Deno  |

Vote detection (`votes-recognizer`) needs `@gfx/canvas` and is not measured here; the canvas parity task covers it.
With the default OEM, tesseract.js 6 loads `tesseract-core-simd-lstm`, not the `tesseract-core-simd.wasm` (core 5.1.1) the
Deno Dockerfile grants read access to.

## 2. Enums and parameter properties

`syntax/non-erasable.ts`:

- Bun, Deno, tsx: run.
- Node 22 and 25: `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` for enums and, separately, for parameter properties.

`tsc --erasableSyntaxOnly` over `src/` and `astro/src/models` (`syntax/tsconfig.erasable.json`, list in
`out/erasable-syntax-errors.txt`): 74 × TS1294 = 3 enums (`Session.ts` ×2, `oparl-snapshot.ts`) + 71 parameter
properties in 45 files.

## 3. Model sharing

Each mechanism imports an erasable model (`paper-batch.ts`, `ai-text-assessment.ts`) and one that reaches the
`Session.ts` enums (`voting-breakdown.ts`).

| Mechanism                                          | Bun | Deno | tsx | Node 22/25 erasable | Node 22/25 enum |
| -------------------------------------------------- | --- | ---- | --- | ------------------- | --------------- |
| relative path `../../astro/src/models/x.ts`        | ok  | ok   | ok  | ok                  | enum error      |
| workspace symlink `@srw/models/x` (exports map)    | ok  | ok   | ok  | ok                  | enum error      |
| `#models/*` subpath imports (root `package.json`)  | ok  | ok   | ok  | ok                  | enum error      |

- The symlink works on Node only because Node resolves symlinks to the real path, which is outside `node_modules`.
  With `--preserve-symlinks`: `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`.
- `tsc` (NodeNext, `allowImportingTsExtensions`) resolves `#models/*`.

## 4. @aws-sdk/client-s3 3.1151.0

`s3/s3-probe.ts`: PutObject of 8 MiB random bytes under `spike/bun-s3-probe/`, GetObject consumed as Node `Readable`
and via `transformToWebStream()`, SHA-256 compared, object deleted. Two runs each:

| Runtime | Put        | Get (stream) | Readable hash | Web stream hash |
| ------- | ---------- | ------------ | ------------- | --------------- |
| Bun     | 6.4–6.7 s  | 1.36–1.42 s  | match         | match           |
| Node 22 | 6.6–6.7 s  | 1.33–1.36 s  | match         | match           |
| Deno    | 6.6–6.9 s  | 1.32–1.34 s  | match         | match           |

Side notes: the `svc-scrape-oparl` user needed a temporary grant for `spike/*`. `.env.local` has CRLF line endings, so a
sourced `AWS_REGION` carries `\r` and the SDK rejects it ("Region not accepted").
