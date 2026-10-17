# speech-to-text

## Purpose

Reads a session's `session-speeches-<session>.json` and the speech audio files (one MP3 per speech, cut by
`extract-speeches`) and transcribes each speech with OpenAI. It writes
`session-speeches-with-transcriptions-<session>.json` next to the input file. It is the third step of the video
processing (see the processing order in [HOWTO](../../../docs/guides/HOWTO.md)).

If `session-speeches-with-transcriptions-<session>.json` already exists, the script continues from that file, so an
interrupted run can be resumed. Speeches of the chairperson get no transcription.

## Usage

From the repository root:

```bash
SESSION=2025-09-25
bun --env-file=.env.local src/scripts/speech-to-text/index.ts \
  -i output/speeches/$SESSION \
  -o output/sessions-scan-results/$SESSION \
  -s $SESSION
```

| Flag                  | Description                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `-i, --speeches-dir`  | Directory containing the speech MP3 files, named `<start, 6 digits>-<speaker>.mp3`.          |
| `-o, --output-dir`    | Directory containing `session-speeches-<session>.json`. The result is written there as well. |
| `-s, --session`       | Session to process, in the format `YYYY-MM-DD`.                                              |
| `-x, --skip-existing` | Skip speeches that already have a transcription. On by default.                              |
| `--no-skip-existing`  | Transcribe all speeches, including those that already have a transcription.                  |
| `-h, --help`          | Show the help text and exit.                                                                 |

| Environment variable     | Description             |
| ------------------------ | ----------------------- |
| `OPENAI_ORGANIZATION_ID` | OpenAI organization ID. |
| `OPENAI_PROJECT_ID`      | OpenAI project ID.      |
| `OPENAI_API_KEY`         | OpenAI API key.         |

## Docker

Build the image from the repository root:

```bash
docker build -t srw-speech-to-text -f docker/speech-to-text.Dockerfile .
```

Run it with the session as the only argument. The OpenAI environment variables must be set in your shell:

```bash
SESSION=2025-09-25
docker run \
  --rm \
  -e OPENAI_ORGANIZATION_ID \
  -e OPENAI_PROJECT_ID \
  -e OPENAI_API_KEY \
  -v $(pwd)/output/speeches/$SESSION:/app/speeches:ro \
  -v $(pwd)/output/sessions-scan-results/$SESSION:/app/output \
  srw-speech-to-text \
  $SESSION
```

The container runs as user `bun` (UID 1000). On a Linux host, the output directory must be writable by that user.
