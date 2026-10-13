# Hält die Deno-Prämisse, und wie schneiden Bun und Node für unsere Skripte ab?

Datum: 2026-10-13
Ticket: #535 (Karte #530)
Frage: Was bedeutet die Ankündigung „Deno is joining Cloudflare“ für die Deno-Runtime? Und wie
vergleichen sich **Bun** und **Node 22+** (natives Type Stripping bzw. `tsx`) als Ziel für die
Skripte in `src/`? Hier stehen nur Fakten. Die Runtime wird im Grilling-Ticket gewählt.

Unser Ausgangsstand (aus dem Repo, Stand `main` @ 109f2391):

- 12 Skripte, rund 180 `Deno.*`-Aufrufe (vor allem `Deno.exit`, `readTextFileSync`, `env.get`,
  `args`, `writeTextFileSync`, `readDirSync`, `errors.NotFound`). Dazu zweimal `Deno.permissions.query`
  und zweimal `Deno.test`.
- `@std/{path,fs,cli,csv,encoding,crypto,assert,expect,testing}` aus JSR, die npm-Pakete `openai@^5`,
  `tesseract.js@^6` und `@aws-sdk/client-s3@^3`, dazu `@gfx/canvas@^0.5.8` aus JSR (`deno.json`).
- `"unstable": ["sloppy-imports"]` in `deno.json`. Alle relativen Imports in `src/` tragen aber
  schon die Endung `.ts` (grep: 0 Imports ohne Endung).
- Nicht löschbare TS-Syntax: 3 `enum`s (`astro/src/models/Session.ts:1,13`,
  `src/scripts/shared/oparl/oparl-snapshot.ts:8`) und 10 Konstruktoren mit Parameter-Properties
  (`constructor(private readonly …)`, z. B. `src/scripts/speech-to-text/speech-to-text.ts:13`).
- CI nutzt `denoland/setup-deno@v2` mit `deno-version: v2.x`, der Astro-Job nutzt Node 22
  (`.github/workflows/ci.yml:27-29,62`). 11 Dockerfiles bauen auf `denoland/deno:2.3.3`.

## Kurzfassung

1. **Die Prämisse hält, mit Frist.** Deno stellt die Entwicklung der Runtime ein, nicht nur Deploy.
   Noch ein Jahr gibt es monatliche Bugfix- und Security-Releases (ab 2026-10-09, also bis etwa
   Oktober 2027), danach endet die Entwicklung. Der Code bleibt Open Source. Deno Deploy schließt
   nach sechs Monaten, JSR läuft weiter.
2. **Node** führt `.ts` seit 22.18 bzw. 23.6 ohne Flag aus. Seit 24.12 bzw. 25.2 gilt das als stabil.
   Node entfernt aber nur Typen. `enum`s und Parameter-Properties (beide bei uns vorhanden) lehnt es
   ab, `tsconfig` ignoriert es. Wer den vollen TS-Umfang braucht, nimmt laut Node-Doku `tsx`.
3. **Bun** führt `.ts` samt `enum`s über den eigenen Transpiler aus. Bun prüft keine Typen. Bun 1.4
   (2026-08-20) ist der erste Release nach dem Umbau von Zig auf Rust. Bun gehört seit Dezember 2025
   zu Anthropic und bleibt unter MIT-Lizenz.
4. **Tests:** `node:test` ist stabil (describe/it, Hooks, Mocks, Snapshots). Es hat aber kein
   `expect`, und die Coverage ist noch experimentell. `bun test` ist Jest-kompatibel und bringt
   `expect` mit. `vi.fn`/`vi.mock`/`vi.spyOn` gibt es als Alias. Seit Bun 1.4 läuft auch echtes
   Vitest auf Bun. Das aktuelle Vitest verlangt Node ≥ 22.12.
5. **Abhängigkeiten:** `openai` nennt Node 22/24 und Bun 1.0+ offiziell als Ziel. `tesseract.js`
   nennt nur Node und Browser. `@std/*` aus JSR listet Node als kompatibel, `@std/testing` aber nur
   Deno. `@gfx/canvas` ist Deno-only, weil es über Deno-FFI läuft. Dafür gibt es ein eigenes Ticket.
6. **Berechtigungen:** Node hat mit `--permission` ein stabiles Modell für fs, Netz, Child-Prozesse
   und Addons. Für `env` gibt es keine Freigabe. Bun hat gar kein Berechtigungsmodell, der Wunsch
   (#6617) ist seit 2023 offen.
7. **Betrieb:** Beide haben offizielle Docker-Images (`node` als Docker Official Image, `oven/bun`)
   und offizielle GitHub Actions (`actions/setup-node`, `oven-sh/setup-bun@v2`).

---

## 1. Was die Deno/Cloudflare-Ankündigung bedeutet

Quelle: Ryan Dahl, „Deno is joining Cloudflare“, 2026-10-09, https://deno.com/blog/cloudflare.
Die Zitate sind wörtlich:

- „We will support the Deno runtime for another year with monthly releases containing bug fixes and
  security updates.“
- „After that year we will end our development of the Deno runtime.“
- „Deno will remain open source, and we welcome others who want to continue its development.“
- „Deno Deploy will continue operating for six months before shutting down.“ Zahlende Kunden
  bekommen Hilfe beim Umzug auf Cloudflare Workers.
- „JSR will continue operating, with its infrastructure moving to Cloudflare.“
- „We will continue supporting rusty_v8 and work toward integrating it into workerd.“

Es gibt eine Begleitnotiz von Kenton Varda und Ryan Dahl:
https://blog.cloudflare.com/deno-joins-cloudflare/. Das Team baut dort `workerd` und `celld` zu einer
selbst hostbaren Workers/Durable-Objects-Runtime zusammen. Für die Deno-Runtime verweist die Notiz
auf den Deno-Blog.

Folgerungen, die direkt aus dem Text kommen:

- Es geht nicht nur um das Hosting. **Die CLI-Runtime selbst wird nicht mehr weiterentwickelt.**
- Ein festes Datum steht nicht im Text, nur „another year“. Ab 2026-10-09 gerechnet endet die
  Wartung etwa im Oktober 2027. Das ist eine eigene Rechnung.
- Ein Nachfolger aus der Community ist möglich, aber nicht zugesagt.
- Für uns bleibt bis dahin alles lauffähig. Die aktuelle Version ist v2.9.7 vom 2026-09-17
  (`gh release list -R denoland/deno`). Unsere Docker-Images sind auf 2.3.3 gepinnt, die CI zieht
  `v2.x`. Sicherheitsupdates gibt es nur noch bis zum Ende des Jahres.
- JSR bleibt erhalten. Die `@std/*`-Pakete lassen sich also auch nach dem Wechsel weiter beziehen
  (siehe Abschnitt 4).

## 2. TypeScript ohne Build-Schritt

### Node (Type Stripping)

Quelle: https://nodejs.org/api/typescript.html

- Seit v22.6.0 hinter einem Flag. Ohne Flag ab **v23.6.0 und v22.18.0**. Keine Experimental-Warnung
  mehr ab v24.3.0 und v22.18.0. **Stabil** (Stability 2) ab **v25.2.0 und v24.12.0**.
- „Node.js will replace TypeScript syntax with whitespace, and **no type checking is performed**.“
- Nicht unterstützt, weil Code erzeugt werden müsste (Fehler `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`):
  **`enum`**, `namespace` mit Laufzeitcode, **Parameter-Properties** und Import-Aliase. Decorators
  führen zu einem Parserfehler. `--experimental-transform-types`, das `enum`s umgewandelt hat, wurde
  **in v26.0.0 entfernt**.
- „Node.js ignores `tsconfig.json` files“. `paths` funktioniert also nicht. Die Doku empfiehlt
  stattdessen Subpath-Imports (`#…`).
- Typ-Imports brauchen das Schlüsselwort `type`, sonst gibt es einen Laufzeitfehler. Dateiendungen
  sind Pflicht.
- „Node.js refuses to handle TypeScript files inside folders under a `node_modules` path.“ Das
  betrifft unser Model-Sharing, wenn `astro/src/models` als Paket unter `node_modules` eingebunden
  würde. Ob Symlinks von Workspaces hier zählen (Node löst Pfade standardmäßig zum echten Pfad auf),
  sagt die Doku nicht. Das wäre im Spike zu prüfen.
- Für den vollen TS-Umfang verweist die Doku auf `tsx` (`node --import=tsx file.ts`). Die Seite
  tsx.is ließ sich nicht abrufen (TLS-Fehler). Deshalb steht hier nichts Weiteres zu tsx.
- Bei uns betroffen: 3 `enum`s (eines davon im geteilten Modell `Session.ts`, das auch Astro nutzt)
  und 10 Parameter-Properties. TypeScript ab 5.8 hat die Compiler-Option `erasableSyntaxOnly`, die
  genau solche Stellen meldet
  (https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html).

Release-Zeitplan (https://github.com/nodejs/Release, `schedule.json`, und
https://nodejs.org/en/about/previous-releases):

| Linie | LTS ab | Maintenance ab | End of Life |
|---|---|---|---|
| 22 (Jod) | 2024-10-29 | 2025-10-21 | **2027-04-30** |
| 24 (Krypton) | 2025-10-28 | 2026-10-20 | 2028-04-30 |
| 26 | **2026-10-28** | 2027-10-20 | 2029-04-30 |

„Starting with Node.js 27, the release cycle will be annual and every major version will move to LTS
status after its six-month Current phase (and six additional months of Alpha phase).“ Der Astro-Job
läuft heute auf Node 22, dessen Support am 2027-04-30 endet.

### Bun

Quellen: https://bun.com/docs (Einstieg), https://bun.com/docs/runtime/typescript, Release-Notes

- „You can directly execute .jsx, .ts, and .tsx files; Bun's transpiler converts these to vanilla
  JavaScript before execution.“ Bun erlaubt außerdem Imports mit `.ts`-Endung.
- `enum`s werden unterstützt und sogar inline eingesetzt. Seit v1.1.18 mergt Bun auch Namespaces
  (https://bun.com/blog/release-notes/bun-v1.1.18). Decorators gehen in beiden Varianten, legacy und
  TC39 Stage 3, Letzteres seit v1.3.10 (https://bun.com/blog/bun-v1.3.10).
- **Parameter-Properties** erwähnt die Doku nicht ausdrücklich. Ein voller Transpiler kann sie
  üblicherweise, das sollte aber im Spike geprüft werden.
- Bun prüft keine Typen, dafür braucht es weiter `tsc --noEmit`. Typen für die Bun-APIs kommen aus
  `@types/bun`.

## 3. Test-Runner im Vergleich mit Vitest

| | `node:test` | `bun test` | Vitest (heute in `astro/`) |
|---|---|---|---|
| Stabilität | Stable seit v20.0.0 | Teil von Bun, „Jest-compatible … not everything is implemented“ | – |
| `describe`/`it`, Hooks | ja (`before`, `after`, `beforeEach`, `afterEach`) | ja | ja |
| `expect` | **nein**, nur `node:assert` / `t.assert` | ja (Jest-Matcher) | ja |
| Mocks | `mock.fn`, `mock.method`, `mock.module`, `mock.timers` | `mock()`, `jest.fn`, `spyOn`, `mock.module`, **`vi.fn`/`vi.spyOn`/`vi.mock`** | `vi.*` |
| Snapshots | stabil seit v23.4.0 | `toMatchSnapshot`, `--update-snapshots` | ja |
| Coverage | `--experimental-test-coverage` (Stability 1) | `--coverage` (text/lcov) | ja |
| Watch | `--watch` (Stability 1) | `--watch` | ja |
| `.ts`-Tests | ja, über Type Stripping (gleiche Grenzen wie oben) | ja | ja |

Quellen: https://nodejs.org/api/test.html, https://bun.com/docs/test,
https://bun.com/docs/test/mocks, https://bun.com/blog/release-notes/bun-v1.4.0

- Bun über Vitest: Bun legt `vi` seit v1.3.1 ohne Import bereit, und Imports aus `vitest` biegt Bun
  intern auf `bun:test` um. Das steht in Bun-Release-Notes, die wir nur per Websuche gesehen und nicht
  im Volltext gelesen haben. In der Mocks-Doku heißt es: „You can port tests from Vitest without
  rewriting your mocks.“
- **Echtes Vitest auf Bun:** In den Bun-1.4-Notes steht „vitest runs under Bun, including `--coverage`,
  with the threads and forks pools.“ Vitest selbst warnt aber: Wer Bun nutzt, soll `bun run test`
  aufrufen und nicht `bun test`, weil sonst Buns eigener Runner startet (https://vitest.dev/guide/).
  Laut derselben Seite braucht das aktuelle Vitest **Node ≥ 22.12.0**.
- `node:test` unter Bun: nur teilweise. Snapshots, `mock.module()` und Coverage fehlen. Bun empfiehlt
  `bun:test` (https://bun.com/docs/runtime/nodejs-compat).
- Unsere Tests stützen sich auf `@std/testing/bdd`, `@std/testing/mock` und `@std/expect`. Laut JSR
  ist `@std/testing` **nur für Deno** ausgewiesen (https://jsr.io/@std/testing). Die Test-Imports
  müssen also in jedem Fall umgestellt werden.

## 4. Kompatibilität mit unseren Abhängigkeiten

| Abhängigkeit | Node | Bun | Quelle |
|---|---|---|---|
| `node:fs`, `node:path` | nativ | 🟢 „fully implemented“ (fs-Testsuite zu 98 %) | https://bun.com/docs/runtime/nodejs-compat |
| `node:crypto` | nativ | 🟡 teilweise (BoringSSL, einige Kurven und Chiffren fehlen) | dito |
| `node:util` (`parseArgs`) | nativ | 🟢 (einzelne Funktionen fehlen, `parseArgs` nicht eigens erwähnt) | dito |
| `node:child_process`, `worker_threads` | nativ | 🟡 teilweise | dito |
| WebAssembly | nativ (V8) | 🟢 | dito |
| `openai` (README, aktuell) | „Node.js 22 and 24 LTS. Node.js 22 is the minimum“ | „Bun 1.0 or later“ | https://github.com/openai/openai-node |
| `tesseract.js` | offiziell: „on the server with Node.js“ (v7: Node ≥ 16, v6: Node ≥ 14) | nicht offiziell genannt | https://github.com/naptha/tesseract.js |
| `@aws-sdk/client-s3` | offizielles Ziel | kein offizielles Statement gefunden | – |
| `@std/path` u. a. (JSR) | JSR listet „Node.js“ als kompatibel | Bun nicht gelistet | https://jsr.io/@std/path |
| `@gfx/canvas` | – | – | Deno-only, „depends on the unstable FFI API“ (https://jsr.io/@gfx/canvas) |

Hinweise zu `tesseract.js` unter Bun, aus dem Bun-Issue-Tracker:

- „wasm-simd is not supported in bun“ (oven-sh/bun#10306), am 2025-02-10 als erledigt geschlossen.
  Ein Contributor schreibt: „I tried an example using Wasm SIMD and it worked fine.“ Das ist relevant,
  weil wir `tesseract-core-simd.wasm` laden (`docker/scan-voting-images.Dockerfile:26`).
- „tesseract.js recognize() uber slow“ (#11350), 2024-12-09 als erledigt geschlossen.
- Insgesamt gibt es Belege aus der Community, aber keine offizielle Zusage. Das ist ein Kandidat für
  einen Spike.

Native Addons (N-API), auf Ebene der Runtime. Der Ersatz für Canvas hat ein eigenes Ticket.

- Node: N-API ist Nodes eigene, stabile ABI. Das Permission-Modell kennt dafür `--allow-addons`.
- Bun: „Bun implements … from scratch“, und die meisten Addons sollen ohne Anpassung laufen.
  `.node`-Dateien lädt man über `require()` oder `process.dlopen` (https://bun.com/docs/runtime/node-api).
  Eine Liste der Lücken gibt es dort nicht. In Bun 1.4 wurde das Verhalten von N-API unter
  `bun test --isolate` korrigiert.
- `@gfx/canvas` nutzt Deno-FFI und kein N-API. Es läuft daher **weder unter Node noch unter Bun**,
  egal welche Runtime wir wählen. Am Rande: Bun 1.4 bringt mit `Bun.Image` eine neue eingebaute API
  (laut 1.4-Notes, Umfang nicht geprüft).

`Deno.*`-APIs: Weder Node noch Bun stellen sie bereit. Wir müssten sie auf `node:fs`, `process.env`,
`process.argv` und `process.exit` umstellen. Bun versteht diese `node:`-Module (siehe oben).

## 5. Berechtigungsmodell (nice-to-have)

**Node**, laut https://nodejs.org/api/permissions.html:

- Aktiviert mit `--permission`. **Stable** seit v23.5.0 und v22.13.0, eingeführt in v20.0.0.
- Freigaben: `--allow-fs-read` und `--allow-fs-write` (mit Pfaden und Wildcards), `--allow-net`,
  `--allow-child-process`, `--allow-worker`, `--allow-addons`, `--allow-wasi`, `--allow-ffi`.
- Für Umgebungsvariablen gibt es **keine Freigabe**. Das Gegenstück zu Denos `-E=` fehlt also.
- Node versteht das Modell ausdrücklich nicht als Sicherheitsgrenze: „It does not provide security
  guarantees in the presence of malicious code.“ Symlinks werden auch aus dem freigegebenen Bereich
  heraus verfolgt, und Zugriffe über bestehende File-Descriptors umgehen die Prüfung.

**Bun**: Es gibt **kein** Berechtigungsmodell.

- oven-sh/bun#6617 „Support sandboxing permissions“ ist **offen** seit 2023-10-20 (zuletzt aktualisiert
  2026-09-14).
- Der PR #25911 „Secure Mode: Deno & Node.js compatible permissions for Bun“ wurde **ohne Merge
  geschlossen**.
- Der Draft-PR #31906 betrifft nur eine Sandbox für Bun Shell (`$.sandbox`).

## 6. Docker, GitHub Actions, Wartung

| | Node | Bun |
|---|---|---|
| Docker-Image | `node` (Docker Official Image, gepflegt vom Node.js-Docker-Team), Varianten `bookworm`, `trixie`, `slim`, `alpine`. musl/amd64 hat die Support-Stufe „Experimental“ (https://github.com/nodejs/docker-node) | `oven/bun` vom Bun-Hersteller Oven, Varianten `debian`, `slim`, `alpine`, `distroless` (https://hub.docker.com/r/oven/bun) |
| GitHub Action | `actions/setup-node` (heute schon im Astro-Job) | `oven-sh/setup-bun@v2`, Version über `bun-version`, `bun-version-file` oder `packageManager` steuerbar, Binary wird gecacht (https://github.com/oven-sh/setup-bun) |
| Aktuelle Version | 26.11.1 (Current), 24.21.0 (LTS) | 1.4.3 (2026-10-10) |
| Träger / Ausblick | OpenJS Foundation. Fester LTS-Plan, ab v27 ein Major pro Jahr, jedes wird LTS | Seit 2025-12-02 Teil von Anthropic: „Bun stays open-source & MIT-licensed … same team“ (https://bun.com/blog/bun-joins-anthropic). Laut Blog ist Claude Code als Bun-Executable gebaut. Kein LTS-Konzept beschrieben |
| Reife-Signale | Type Stripping und Test-Runner stabil, Coverage und Watch noch experimentell | v1.4.0 (2026-08-20) ist der erste Release in Rust statt Zig. Der Umbau dauerte rund 11 Tage, laut Blog liefen dieselben Tests ohne Auslassungen durch, 19 Regressionen gefunden und behoben (https://bun.com/blog/bun-in-rust). „Bun is not 100% compatible with Node.js yet“ (1.4-Notes) |

## Offene Punkte für einen Spike (nicht recherchiert)

- `scan-voting-images` unter Bun und unter Node: Lädt tesseract.js@6 den SIMD-Kern, und wie schnell
  ist es?
- Parameter-Properties unter Bun ausprobieren und unter Node den Fehler mit `enum` bzw. die Umstellung
  auf `erasableSyntaxOnly` nachvollziehen.
- Model-Sharing: Funktionieren `.ts`-Dateien aus `astro/src/models` unter Node, wenn man sie per
  relativem Pfad, als Workspace-Symlink oder über `#`-Subpath-Imports einbindet?
- `@aws-sdk/client-s3` unter Bun: Upload und Streaming mit echten S3-Aufrufen.
