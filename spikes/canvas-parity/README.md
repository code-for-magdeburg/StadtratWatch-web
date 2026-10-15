# Spike: canvas candidates vs. `@gfx/canvas`

Throwaway branch for [Render sample votings with each canvas candidate and diff against today's PNGs](https://github.com/JensWinter/StadtratWatch-web/issues/543). Never merged.

Candidates: `@napi-rs/canvas` 1.0.11 (`napi`), `skia-canvas` 4.0.0 (`skia`), `canvas` 3.2.3 (`node`), `canvas` 4.0.0-rc3 (`node-rc`). All run on **Bun 1.4.2** (the chosen runtime), not Node. Reference is today's code: Deno + `@gfx/canvas` 0.5.8.

Platforms: macOS arm64, and Linux amd64 in Docker (`oven/bun:1.4.2` plus msttcorefonts, mirroring `docker/generate-image-assets.Dockerfile`).

Raw numbers are in [`results.txt`](results.txt).

## What was compared

1. **Rendering**: 20 sample votings from `magdeburg-8` (`sample.json`). They cover every motion type, subject lengths from 0 to 257 characters, „“ quotes, and the one subject containing a newline. The drawing code is today's `images-generator.ts` with only the import line changed (`candidates/`).
2. **Wrapping**: `getWrappedLines` over **all 3,915 subjects** in `magdeburg-7` and `magdeburg-8`, per library, against `@gfx/canvas` on the same platform.
3. **Fonts**: system Verdana (msttcorefonts) vs. no MS fonts vs. Verdana TTFs registered explicitly (`register-fonts.ts`).
4. **Scan path**: the real `VotesRecognizer` fed by each library's decode of **652 voting screenshots** (14 sessions, 37,164 votes) from `sessions-media-files/`. It also compares a full RGBA hash per screenshot.

## Findings

- **The published PNGs are rendered on macOS.** They are pixel-identical to Deno + `@gfx/canvas` on macOS (20 of 20). The Docker/Linux render differs by about 0.2%: anti-aliasing only, with identical layout and wrapping.
- **Rendering parity is good for all candidates.** On the 19 normal samples the mean pixel diff is ≤ 0.32% and the maximum 0.44%, all anti-aliasing (see `out/sheets/`). On Linux, `@napi-rs/canvas` is effectively identical to `@gfx/canvas`: 0.00% at 2% fuzz, and 31–48 slightly different pixels without fuzz.
- **Wrapping is unchanged across all 3,915 subjects** for every candidate, given Verdana. The only exception is the newline subject (`2025-02-13-001`), whose `measureText` result differs for `napi` and `node`.
  - `@gfx/canvas` today draws that subject with overlapping lines (an existing bug, visible on the live site).
  - `napi` follows the HTML spec and renders `\n` as a space. Lines then overflow the 540 px column and get clipped.
  - `skia` breaks the line at `\n`, which renders correctly by accident.
  - `node` 3 overlaps like today, and its last line is hidden. `node-rc` wraps like `@gfx/canvas`.
  - Only 2 of 3,915 subjects contain a newline. Splitting the subject on `/\s+/` in `getWrappedLines` would fix this for any library.
- **Verdana must be provided.** Without msttcorefonts, all four libraries silently fall back to another font, and 200–205 of 3,915 subjects (≈ 5%) wrap differently.
  - Registering the Verdana TTFs explicitly works for all four. The output is pixel-identical to system-installed fonts.
  - The API differs per library: `GlobalFonts.registerFromPath` (napi), `FontLibrary.use` (skia), `registerFont` (node 3), and `FontFace` + `fonts.add` (node-rc, which removed `registerFont`).
  - `napi` found the system Verdana without fontconfig on both macOS and Linux.
- **Scan path: the Skia candidates change votes.** Every screenshot carries a **Display P3** ICC profile (652 of 652).
  - `@gfx/canvas` and `node-canvas` return the raw pixel values.
  - `@napi-rs/canvas` and `skia-canvas` convert P3 to sRGB on `getImageData` (up to 74 levels). That turns **63% of abstentions into votes against**: 1,407 and 1,412 of 37,164 votes on macOS, and 268 of 6,156 on Linux, all `E → N`.
  - Workarounds that restore 0 differing votes on both platforms:
    - `napi`: `getImageData(x, y, w, h, 'display-p3')`
    - `skia`: `getContext('2d', { colorSpace: 'display-p3' })`
    - a pure PNG decoder with no colour management (`pngjs`, `fast-png`)
  - The P3 workarounds assume P3-tagged screenshots. The pure decoders do not.
- **Sync image loading** (today's `Image.loadSync`):
  - `skia`: `new Image(buffer)` is synchronous.
  - `node` 3: `img.src = buffer` is synchronous. Its decode is byte-identical to `@gfx/canvas` (652 of 652).
  - `napi`: `img.src = buffer` reports `complete === true`, but `drawImage` then draws **nothing**, a silent all-transparent canvas. Correct pixels need `await loadImage()` or `await image.decode()`, so `loadVotingImage` would become async.
- **`node-canvas` 4.0.0-rc3 segfaults Bun 1.4.2 on macOS at import** (`dlopen`). On Linux x64 it loads and works.
- `toDataURL()` returns synchronously in all candidates, so `ImageAssetsWriter` ports unchanged. All four ports typecheck with only the import line changed; skia-canvas needs a `createCanvas` shim (`new Canvas(w, h)`).
- Timing on macOS (20 renders): napi 338 ms, node 437 ms, skia 496 ms. Decoding 652 screenshots: napi (async) about 7 s; skia, node and `@gfx/canvas` 24–27 s; pngjs about 40 s and fast-png about 105 s, both including the recognizer.

## Layout

- `select-sample.ts`: picks the 20 sample votings → `sample.json`
- `render-deno.ts`: today's pipeline (Deno + `@gfx/canvas`) → PNGs, `votings.json`, wrapped lines
- `render-candidate.ts`, `candidates/*.ts`: the same drawing code per candidate on Bun
- `wrap-all.ts`: wraps all subjects (runs on Deno for gfx, Bun for candidates)
- `compare-wrapping.ts`, `diff.sh`: wrapping and pixel comparison
- `register-fonts.ts`: preload that registers Verdana files per library
- `scan-hash.ts`, `dump-rgba.ts`, `napi-async-check.ts`, `colorspace-check.ts`: decode checks
- `vote-check.ts`, `vote-check-gfx.ts`: the real `VotesRecognizer` per library vs. `@gfx/canvas`
- `Dockerfile`: `oven/bun:1.4.2` amd64, with (`WITH_MS_FONTS=1`) or without msttcorefonts
- `out/`: Linux renders, diffs and side-by-side sheets; macOS, published and intermediate outputs are git-ignored (regenerable)
- `src/deps/astro/package.json` (outside this folder) only exists so Bun can resolve `@srw-astro/models` for `vote-check.ts`

## Re-running

```bash
# baselines (from repo root)
deno run -A --config deno.json --unstable-sloppy-imports spikes/canvas-parity/render-deno.ts data/magdeburg-8 spikes/canvas-parity/out/gfx-macos
docker build --platform linux/amd64 -f docker/generate-image-assets.Dockerfile -t srw-gfx-baseline .
# candidates (from spikes/canvas-parity)
bun install && bun render-candidate.ts napi out/napi-macos
docker build --platform linux/amd64 -t srw-canvas-parity .
./diff.sh out/gfx-linux out/napi-linux out/diff/napi-linux
```
