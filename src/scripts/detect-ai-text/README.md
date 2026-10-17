# detect-ai-text

## Purpose

Sends selected speeches of one session to [Pangram](https://www.pangram.com) to check whether their corrected
transcripts may be AI-generated or AI-assisted. It reads and writes the `session-speeches-*.json` file in place and only
adds or overwrites the `aiTextAssessment` field of the selected speeches. It is an optional, manual step after the
transcripts are corrected and before the session data is committed (see the processing order in
[HOWTO](../../../docs/guides/HOWTO.md)).

## Usage

Before calling Pangram, the script prints a cost estimate (word count × $0.05 per 100 words) and asks for a y/n
confirmation; the confirmation needs an interactive terminal. With `--skip-existing`, a speech is skipped only if its
existing `aiTextAssessment` still matches the current transcript (`transcriptSha256`); a speech whose transcript was
corrected since the last check is re-assessed. Speeches with fewer than 50 words are skipped without a request. A failed
request for a single speech is logged and the run continues.

Run from the repository root:

```bash
PARLIAMENT_PERIOD=magdeburg-8
SESSION=2025-12-04
PANGRAM_API_KEY=<pangram api key> \
bun src/scripts/detect-ai-text/index.ts \
  -f data/$PARLIAMENT_PERIOD/$SESSION/session-speeches-$SESSION.json \
  -t 120,980 \
  --skip-existing
```

| Flag                  | Description                                                               |
| --------------------- | ------------------------------------------------------------------------- |
| `-f, --speeches-file` | The `session-speeches-*.json` file to read and write in place.            |
| `-t, --starts`        | Comma-separated list of the `start` timestamps of the speeches to assess. |
| `-x, --skip-existing` | Skip a speech whose existing assessment matches the current transcript.   |
| `-h, --help`          | Show the help text and exit.                                              |

| Environment variable | Description                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| `PANGRAM_API_KEY`    | Pangram API key. Only read after the confirmation, so a run with nothing to assess needs none. |

Bun loads `.env.local` from the working directory automatically, so the key can also live there.

## Docker

Build the image from the repository root:

```bash
docker build -t srw-detect-ai-text -f docker/detect-ai-text.Dockerfile .
```

Run it with the starts as the first argument. `-it` is required so the y/n cost confirmation works:

```bash
PARLIAMENT_PERIOD=magdeburg-8
SESSION=2025-12-04
docker run \
  -it \
  --rm \
  -e PANGRAM_API_KEY=<pangram api key> \
  -v $(pwd)/data/$PARLIAMENT_PERIOD/$SESSION/session-speeches-$SESSION.json:/app/session-speeches.json \
  srw-detect-ai-text \
  120,980 \
  --skip-existing
```

The container runs as user `bun` (UID 1000). On a Linux host, the speeches file must be writable by that user.
