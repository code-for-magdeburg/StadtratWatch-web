# Which canvas library replaces `@gfx/canvas` on Bun/Node?

Date: 2026-10-13
Ticket: [#536](https://github.com/JensWinter/StadtratWatch-web/issues/536) (map: [#530](https://github.com/JensWinter/StadtratWatch-web/issues/530))
Scope: facts only. This note compares candidates; it does not pick one.

## 1. How we use `@gfx/canvas` today

`deno.json` pins `"@gfx/canvas": "jsr:@gfx/canvas@^0.5.8"`. It is imported in **two** scripts, not one:

| Script | File | APIs used |
|---|---|---|
| generate-image-assets | `src/scripts/generate-image-assets/images-generator.ts` | `createCanvas(w, h)`, types `Canvas`, `CanvasRenderingContext2D`; `getContext('2d')`; `fillStyle`, `fillRect`, `beginPath`, `roundRect(x, y, w, h, r)`, `fill`, `stroke`, `lineWidth`, `strokeStyle`, `fillStyle = 'transparent'`; `font` (`'14pt Verdana'`, `'italic 14pt Verdana'`, `'bold 18pt Verdana'`, `'bold 24pt Verdana'`), `textAlign = 'center'`, `fillText`, `measureText(...).width` (word wrapping); `drawImage(canvas, x, y)` (canvas onto canvas) |
| generate-image-assets | `src/scripts/generate-image-assets/image-assets-writer.ts` | `canvas.toDataURL()` → strip `data:image/png;base64,` → `decodeBase64` → `Deno.writeFileSync` (PNG export) |
| scan-voting-images | `src/scripts/scan-voting-images/voting-images-source.ts` | `Image.loadSync(filePath)` (synchronous PNG load, non-standard), `createCanvas`, `drawImage(image, 0, 0)` |
| scan-voting-images | `src/scripts/scan-voting-images/votes-recognizer.ts` | `ctx.getImageData(x, y, 3, 3).data` (pixel colour sampling) |

All of these are standard Canvas 2D API except `Image.loadSync` and the `createCanvas` factory.

**Fonts.** No font is registered in code. Text relies on the system font `Verdana`.
- Docker (`docker/generate-image-assets.Dockerfile`) installs `ttf-mscorefonts-installer` 3.8 + `fontconfig` and runs `fc-cache`.
- `@gfx/canvas` loads system fonts at import time unless `CANVAS_DISABLE_SYSTEM_FONTS=1` ([`src/font.ts`](https://github.com/DjDeveloperr/skia_canvas/blob/master/src/font.ts), lines 14–17).
- On macOS, Verdana ships in `/System/Library/Fonts/Supplemental/` (checked on the dev machine).

**Native library / platforms.** `@gfx/canvas` is a Deno FFI binding (C++ + Skia submodule, [repo](https://github.com/DjDeveloperr/skia_canvas)). Its loader downloads one binary per OS from GitHub releases ([`src/ffi.ts`](https://github.com/DjDeveloperr/skia_canvas/blob/master/src/ffi.ts) ~line 915: `aarch64`/`x86_64` dylib for macOS, a single `lib…so` for Linux, one `.dll` for Windows).
- Release 0.5.8 (2024-10-11, still the latest; last push to the repo 2024-10-11) has the assets `libnative_canvas.so`, `libnative_canvas.dylib`, `libnative_canvas_aarch64.dylib`, `native_canvas.dll`, `icudtl.dat`. There is **no Linux arm64 build**. The ELF header of `libnative_canvas.so` reads `x86-64` (checked with `file`).
- Both Dockerfiles (`generate-image-assets`, `scan-voting-images`) `wget` that x86-64 `.so` and set `DENO_SKIA_PATH`. So **today's Docker images only work on linux/amd64**.
- The library calls `Deno.dlopen` / `Deno.env`, so it cannot run on Bun or Node.

## 2. Candidates

### 2.1 `@napi-rs/canvas` (Skia via Rust + N-API)

- **Version:** 1.0.11, published 2026-10-10 (npm registry). The 1.0.x line has had frequent releases since 2026-06-24 (GitHub releases).
- **Engine:** Skia, badge "chrome/m156" ([README](https://github.com/Brooooooklyn/canvas)). "**0 System dependencies!**" (README).
- **Prebuilt binaries** are delivered as npm `optionalDependencies` (no install script): darwin-x64, darwin-arm64, linux-x64-gnu, linux-x64-musl, linux-arm64-gnu, linux-arm64-musl, linux-arm-gnueabihf, linux-riscv64-gnu, win32-x64, win32-arm64, android-arm64 (npm registry metadata for 1.0.11).
- **Requirements:** glibc ≥ 2.18. Linux arm64 needs a Cortex-A57 or newer CPU (README "Support matrix").
- **API vs. our usage:**
  - `createCanvas(w, h)`: same name and signature as today (`index.d.ts` line 845).
  - `roundRect`, `getImageData`, `measureText`, `drawImage(Image | Canvas, …)`: all present (`index.d.ts`).
  - `toDataURL()` is synchronous. There are also `toBuffer('image/png')` and `encodeSync('png')` (sync), plus `encode('png')` (async, libuv thread pool) (`index.d.ts` lines 813–836).
  - Image loading: `loadImage(source)` is async (accepts a path, Buffer, or URL). `Image.src` setter plus `onload`/`decode()`. There is **no documented `loadSync` equivalent**.
- **Fonts:**
  - `index.js` calls `GlobalFonts.loadSystemFonts()` at import (line 151). This recursively reads `/usr/share/fonts/` on Linux and `/System/Library/Fonts/` on macOS (`src/global_fonts.rs`), plus `~/Library/Fonts` on macOS (index.js line 159). The msttcorefonts package installs into `/usr/share/fonts/truetype/msttcorefonts`, so it is covered by the recursive scan.
  - It does not use fontconfig.
  - Explicit registration is possible: `GlobalFonts.registerFromPath(path, alias)` and `GlobalFonts.loadFontsFromDir(dir)`.
- **Bun:**
  - No Bun section in the README.
  - [Brooooooklyn/canvas#1312](https://github.com/Brooooooklyn/canvas/issues/1312): concurrent `encode('png')` segfaulted on Bun on Windows. Root cause: the async encode did not keep the Skia surface alive while JSC collected the canvas. Node could crash the same way. Fixed in **v1.0.6** (PR #1314, 2026-08-13).
  - [oven-sh/bun#15372](https://github.com/oven-sh/bun/issues/15372) (`fillText` crash, Windows) was fixed upstream in @napi-rs/canvas 0.1.64.
  - [oven-sh/bun#19719](https://github.com/oven-sh/bun/issues/19719) (illegal instruction on a Raspberry Pi arm64) was closed by Bun as an upstream CPU-target issue that also affects Node.
  - [oven-sh/bun#18718](https://github.com/oven-sh/bun/issues/18718) (crash after a benchmark, Windows, NVIDIA GL driver in the stack) is still open.
  - All reported Bun crashes found are on Windows or on exotic arm boards. None was found for macOS or Linux x64/arm64.

### 2.2 `skia-canvas` (Skia via Rust/skia-safe + N-API)

- **Version:** **4.0.0, published 2026-10-12**, the day before this note (npm, [GitHub release](https://github.com/samizdatco/skia-canvas/releases/tag/v4.0.0)). The previous release was 3.0.8 (2025-09-25).
- **Prebuilt binaries:**
  - Delivered via `@skia-canvas/*` optionalDependencies: darwin-x64, darwin-arm64, linux-x64-glibc, linux-x64-musl, linux-arm64-glibc, linux-arm64-musl, win32-x64, win32-arm64 (npm metadata for 4.0.0).
  - v4 release notes: "the package no longer uses an install script or needs network access aside from the npm registry". Up to 3.x an install script downloaded the binary.
  - Runtime dependencies: `detect-libc`, `follow-redirects`, `https-proxy-agent`.
- **Requirements:**
  - glibc ≥ 2.28 or musl. Node-API v8, Node ≥ 18 ([Getting Started](https://github.com/samizdatco/skia-canvas/blob/main/docs/getting-started.md)).
  - The docs' Docker section recommends Debian-based `node` images or `node:alpine`, and warns that `node_modules` must be installed for the target arch.
- **API vs. our usage:**
  - **No `createCanvas` factory.** Canvases are created with `new Canvas(w, h)` (`lib/index.d.ts` line 417).
  - `roundRect`, `getImageData`, and `measureText` are present.
  - `drawImage` accepts `Canvas | CanvasRenderingContext2D | Image | ImageData` (`CanvasDrawable`, line 552).
  - `toDataURL()` is now synchronous; `toDataURLSync` is deprecated (lines 467–472). Other exports: `toBufferSync('png')`, `toFileSync(path)`, and the async `toBuffer`/`toFile`/`.png`.
  - Image loading: `new Image(buffer)` creates an image **synchronously** from encoded bytes ([image docs](https://github.com/samizdatco/skia-canvas/blob/main/docs/api/image.md), "Loading synchronously"). `loadImage()` is async.
  - Rendering is deferred until export and cached (Getting Started, "Render Cache").
- **Fonts:**
  - Uses the system **fontconfig** settings in `/etc/fonts` if present. Otherwise it falls back to a bundled placeholder `fonts.conf` that searches common Linux font paths (Getting Started, "Linux").
  - `FontLibrary.use(...)` loads `.ttf`/`.otf`/`.woff`/`.woff2` files ([font-library docs](https://github.com/samizdatco/skia-canvas/blob/main/docs/api/font-library.md)).
- **Bun:**
  - No Bun section in the docs.
  - [oven-sh/bun#9915](https://github.com/oven-sh/bun/issues/9915) was closed 2026-07-25. Bun's explanation: skia-canvas ≤ 3.x needed its install script, which Bun blocks by default, and it works after `trustedDependencies`. They verified this on Bun 1.4.0, Linux x64, with skia-canvas 3.0.8. That cause no longer applies to v4, which has no install script.
  - [oven-sh/bun#27828/#27947](https://github.com/oven-sh/bun/issues/27947): a segfault on exit after `toBuffer` on Windows, fixed in Bun (PR #27829, 2026-03-06).
  - **No reports were found of v4.0.0 running on Bun.** The release is one day old.

### 2.3 `canvas` (node-canvas, Cairo + Pango)

- **Stable:** 3.2.3 (2026-03-31). Engine: Cairo ([README](https://github.com/Automattic/node-canvas)). Node `^18.12.0 || >= 20.9.0`.
  - It has an `install` script: `prebuild-install -r napi || node-gyp rebuild`. Prebuilt tarballs are on GitHub releases: darwin-arm64, darwin-x64, linux-arm64, linux-x64, win32-x64 ([v3.2.3 release assets](https://github.com/Automattic/node-canvas/releases/tag/v3.2.3)). The Linux tarballs do not name a libc.
  - If a prebuilt is missing, it falls back to a native build (needs Cairo/Pango dev packages).
- **Next:** `4.0.0-rc3` (2026-08-15, npm tag `next`). The README calls it "still in the pre-release phase". Changes in v4:
  - binaries via optionalDependencies (linux x64/arm64 gnu+musl, darwin, win32, …), no post-install script
  - many font-handling fixes
  - **minimum Node 22**
- **API vs. our usage:**
  - `createCanvas(w, h)`, `roundRect`, `getImageData`, `toDataURL()` (sync), `drawImage(Canvas | Image, …)`, and `loadImage()` (async) are all present (v3.2.3 `index.d.ts`).
  - `Image.src` accepts a path or Buffer, with an `onload` callback (README "Image#src"). There is no `loadSync`.
- **Fonts:** System fonts are resolved through Pango/fontconfig. `registerFont(path, {family})` (v3), or `fonts.add(new FontFace(...))` (README, v4).
- **Bun:**
  - [oven-sh/bun#5835](https://github.com/oven-sh/bun/issues/5835) "Support node-canvas" is **still open**. canvas 2.x relied on V8-specific APIs. The issue text says to use v3 (then `@next`).
  - The node-canvas thank-you issue [#2472](https://github.com/Automattic/node-canvas/issues/2472) reports 3.0.0-rc3 working on Bun.
  - `canvas` is on Bun's **default trusted-dependencies list** ([`default-trusted-dependencies.txt`](https://github.com/oven-sh/bun/blob/main/src/install/default-trusted-dependencies.txt)), so its install script runs under `bun install` without extra configuration ([Bun lifecycle docs](https://bun.com/docs/pm/lifecycle)).
  - Open reports on Windows: [node-canvas#2425](https://github.com/Automattic/node-canvas/issues/2425) ("Cannot find module '../build/Release/canvas.node'").

### 2.4 Not a candidate: `@gfx/canvas` itself

Deno-only (`Deno.dlopen`/`Deno.env`). Unmaintained since 2024-10. No linux-arm64 binary.

## 3. Bun's Node-API status (relevant to all three)

- [Bun docs, Node-API](https://bun.com/docs/runtime/node-api): "Bun implements this interface from scratch, so most existing Node-API extensions work with Bun out of the box." No compatibility percentage is given.
- All three candidates are Node-API addons: napi-rs, skia-canvas (N-API v8), and node-canvas 3+ (`binary.napi_versions: [7]`). None depends on the V8 C++ API, the thing that blocked node-canvas 2.x on Bun.
- Bun blocks lifecycle scripts unless a package is on its default list or in `trustedDependencies`. Defining `trustedDependencies` **replaces** the default list (Bun lifecycle docs). This matters only for node-canvas 3.x; @napi-rs/canvas and skia-canvas 4 have no install script.

## 4. Comparison

| | `@gfx/canvas` (today) | `@napi-rs/canvas` 1.0.11 | `skia-canvas` 4.0.0 | `canvas` 3.2.3 / 4.0.0-rc3 |
|---|---|---|---|---|
| Runtime | Deno FFI only | Node-API (Node ≥ 10 per `engines`) | Node-API v8, Node ≥ 18 | Node-API; v3: Node ≥ 18.12, v4: Node ≥ 22 |
| Rendering engine | Skia (2024 build) | Skia (chrome/m156) | Skia (skia-safe) | Cairo + Pango |
| Last release | 2024-10-11 | 2026-10-10 | 2026-10-12 (v4 major, 1 day old) | 3.2.3: 2026-03-31; 4.0.0-rc3: 2026-08-15 |
| macOS arm64 / x64 | yes / yes | yes / yes | yes / yes | yes / yes |
| Linux x64 glibc / musl | glibc only | yes / yes | yes / yes | v3: yes / not listed; v4: yes / yes |
| Linux **arm64** glibc / musl | **no** | yes / yes (Cortex-A57+) | yes / yes | v3: yes / not listed; v4: yes / yes |
| Binary delivery | runtime download from GitHub (we `wget` it in Docker) | npm optionalDependencies | npm optionalDependencies (v4) | v3: install script + GitHub tarball; v4: optionalDependencies |
| Min glibc | n/a | 2.18 | 2.28 | not stated |
| `createCanvas(w,h)` | yes | yes | **no**, `new Canvas(w,h)` | yes |
| `roundRect`, `measureText`, `getImageData`, `drawImage(canvas)` | yes | yes | yes | yes |
| Sync PNG export | `toDataURL()` | `toDataURL()`, `toBuffer('image/png')`, `encodeSync('png')` | `toDataURL()`, `toBufferSync('png')`, `toFileSync()` | `toDataURL()`, `toBuffer()` |
| Sync image load (replaces `Image.loadSync`) | `Image.loadSync` | not documented (async `loadImage` / `Image.src`) | `new Image(buffer)` | not documented (async `loadImage` / `Image.src` + `onload`) |
| System font discovery | loads system fonts at import | recursive scan of `/usr/share/fonts/` (Linux) / `/System/Library/Fonts/` + `~/Library/Fonts` (macOS) at import; no fontconfig | fontconfig (`/etc/fonts`), fallback config | Pango/fontconfig |
| Register font file | `Fonts` API | `GlobalFonts.registerFromPath` / `loadFontsFromDir` | `FontLibrary.use` | `registerFont` (v3), `fonts.add(FontFace)` (v4) |
| Bun status (evidence) | n/a | used on Bun; past Bun crashes (Windows) fixed in lib ≥ 0.1.64 and ≥ 1.0.6; one Windows crash issue open | 3.x worked on Bun once trusted (Bun on Linux x64); v4 untested publicly | Bun issue #5835 still open; user report of v3 working; on Bun's default trusted list |
| Expected parity with today's PNGs | baseline | same engine family (Skia), newer Skia | same engine family (Skia), different text stack integration | different engine (Cairo/Pango): text rasterisation/antialiasing will differ |

## 5. Notes on rendering parity (what is and isn't known)

- Today's output is produced by Skia. Both `@napi-rs/canvas` and `skia-canvas` are also Skia, but much newer builds with their own font-matching code. **Pixel-identical output is not claimed by any of the projects.** No source was found that measures parity against `@gfx/canvas`.
- `node-canvas` uses Cairo for drawing and Pango for text. Glyph positioning and antialiasing come from a different engine.
- The visible risk is text: the `pt` font sizes, Verdana lookup, and `measureText`-based word wrapping in `getWrappedLines` determine where lines break. A different width from a different text engine can change the number of subject lines.
- `scan-voting-images` only samples pixel colours via `getImageData` on decoded PNGs. That does not depend on text rendering.
- The only way to establish parity is to render a sample of existing votings with the candidate and diff them against the committed/published PNGs. That has not been done here.

## 6. Open points the decision has to settle (not answered here)

- `scan-voting-images` also depends on `@gfx/canvas` (`Image.loadSync`, `getImageData`). The replacement must cover both scripts, or that script needs another image decoder.
- The sync-vs-async image load for `scan-voting-images` (only skia-canvas documents a sync constructor).
- Whether to keep relying on system Verdana (msttcorefonts in Docker, macOS system font locally) or register the font file explicitly.
- Whether `skia-canvas` 4.0.0's one-day age matters versus its 3.x track record.

## Sources

- Repo: `src/scripts/generate-image-assets/images-generator.ts`, `image-assets-writer.ts`; `src/scripts/scan-voting-images/voting-images-source.ts`, `votes-recognizer.ts`; `docker/generate-image-assets.Dockerfile`, `docker/scan-voting-images.Dockerfile`; `deno.json`
- @gfx/canvas: https://github.com/DjDeveloperr/skia_canvas (README, `src/font.ts`, `src/ffi.ts`, release 0.5.8 assets); https://jsr.io/@gfx/canvas
- @napi-rs/canvas: https://github.com/Brooooooklyn/canvas (README, `index.d.ts`, `index.js`, `src/global_fonts.rs`, releases), https://registry.npmjs.org/@napi-rs/canvas, issues #1312 / PR #1314
- skia-canvas: https://github.com/samizdatco/skia-canvas (README, `docs/getting-started.md`, `docs/api/image.md`, `docs/api/font-library.md`, `lib/index.d.ts`, v4.0.0 release notes), https://registry.npmjs.org/skia-canvas
- node-canvas: https://github.com/Automattic/node-canvas (README, v3.2.3 `index.d.ts`, release assets, issues #2472, #2425), https://registry.npmjs.org/canvas
- Bun: https://bun.com/docs/runtime/node-api, https://bun.com/docs/pm/lifecycle, https://github.com/oven-sh/bun/blob/main/src/install/default-trusted-dependencies.txt, issues #5835, #9915, #15372, #18718, #19719, #27947, #37917
