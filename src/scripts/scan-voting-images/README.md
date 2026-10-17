# scan-voting-images

## Purpose

Reads the screenshots of the voting boards of one session and its scan config (the image regions to read) and writes a
single `session-scan-<session>.json` with the agenda item, motion id, title, video timestamp and the votes per person of
every voting. It is the second step of the video processing (see the processing order in
[HOWTO](../../../docs/guides/HOWTO.md)).

The texts are read with Tesseract OCR; the `deu` language data is downloaded from the Tesseract CDN at runtime, so the
script needs network access. The votes are read from the color of each person's test pixel.

## Usage

From the repository root:

```bash
PARLIAMENT_PERIOD=magdeburg-8
SESSION=2025-09-25
bun src/scripts/scan-voting-images/index.ts \
  -c data/$PARLIAMENT_PERIOD/$SESSION/config-$SESSION.json \
  -i sessions-media-files/$SESSION \
  -o output/sessions-scan-results/$SESSION \
  -s $SESSION
```

| Flag                      | Description                                                      |
| ------------------------- | ---------------------------------------------------------------- |
| `-c, --scan-config-file`  | Scan config of the session (`config-<session>.json`).            |
| `-i, --voting-images-dir` | Directory containing the session's `.png` voting screenshots.    |
| `-o, --output-dir`        | Directory the JSON file is written to. It is created if missing. |
| `-s, --session`           | Session to process, in the format `YYYY-MM-DD`.                  |
| `-h, --help`              | Show the help text and exit.                                     |

## Docker

Build the image from the repository root:

```bash
docker build -t srw-scan-voting-images -f docker/scan-voting-images.Dockerfile .
```

Run it with the session as the only argument:

```bash
PARLIAMENT_PERIOD=magdeburg-8
SESSION=2025-09-25
docker run \
  --rm \
  -v $(pwd)/data/$PARLIAMENT_PERIOD/$SESSION/config-$SESSION.json:/app/scan-config.json:ro \
  -v $(pwd)/sessions-media-files/$SESSION:/app/voting-images:ro \
  -v $(pwd)/output/sessions-scan-results/$SESSION:/app/output \
  srw-scan-voting-images \
  $SESSION
```

The container runs as user `bun` (UID 1000). On a Linux host, the output directory must be writable by that user.
