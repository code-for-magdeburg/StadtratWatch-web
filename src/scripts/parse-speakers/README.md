# parse-speakers

## Purpose

Reads the RTTM files of one session (the speaker diarization output, one file per 4-hour audio part) and writes a single
`session-speakers-<session>.json` with all speakers and their segments. It is the first step of the video processing
(see the processing order in [HOWTO](../../../docs/guides/HOWTO.md)).

## Usage

From the repository root:

```bash
SESSION=2025-09-25
bun src/scripts/parse-speakers/index.ts \
  -i sessions-media-files/$SESSION \
  -o output/sessions-scan-results/$SESSION \
  -s $SESSION
```

| Flag               | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| `-i, --input-dir`  | Directory containing the session's `.rttm` files.                |
| `-o, --output-dir` | Directory the JSON file is written to. It is created if missing. |
| `-s, --session`    | Session to process, in the format `YYYY-MM-DD`.                  |
| `-h, --help`       | Show the help text and exit.                                     |

## Docker

Build the image from the repository root:

```bash
docker build -t srw-parse-speakers -f docker/parse-speakers.Dockerfile .
```

Run it with the session as the only argument:

```bash
SESSION=2025-09-25
docker run \
  --rm \
  -v $(pwd)/sessions-media-files/$SESSION:/app/input:ro \
  -v $(pwd)/output/sessions-scan-results/$SESSION:/app/output \
  srw-parse-speakers \
  $SESSION
```

The container runs as user `bun` (UID 1000). On a Linux host, the output directory must be writable by that user.
