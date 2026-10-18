# index-search

## Purpose

Imports the city council's papers and the transcribed speeches into one Typesense collection for the full-text search.
Papers come from the raw OParl data plus the text extracted from their PDFs, speeches from the
`session-speeches-{date}.json` files of every parliament period in `data/`. Documents are upserted, so a repeated run
updates the collection in place. It is the last step of the processing order (see
[HOWTO](../../../docs/guides/HOWTO.md)), after all paper, speech and asset data is available.

## Usage

The collection must exist before the first run; see [`typesense/README.md`](../../../typesense/README.md) for starting a
local Typesense server and creating the collection with `init-schema.sh`.

From the repository root:

```bash
TYPESENSE_SERVER_URL=http://localhost:8108 \
TYPESENSE_COLLECTION_NAME=papers-and-speeches-0001 \
TYPESENSE_API_KEY=abc123 \
OPARL_COUNCIL_ORGANIZATION_ID=https://ratsinfo.magdeburg.de/oparl/bodies/0001/organizations/gr/1 \
  bun --no-env-file src/scripts/index-search/index.ts -r data/oparl-magdeburg -c output/papers/all-extracted -p data
```

`--no-env-file` stops Bun from loading `.env` and `.env.local` by itself, so the run cannot pick up the production
Typesense connection from there by accident.

The papers content directory holds one `{file-id}.pdf.txt` per OParl file, as written by `tika-batch-extract`. Every
file linked to a council meeting must be there; a missing one stops the run before anything is imported.

| Flag                                | Description                                                                                                       |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `-r, --ratsinfo-dir`                | Directory with the raw OParl files (`meetings.json`, `papers.json`, `files.json`).                                |
| `-c, --papers-content-dir`          | Directory with the extracted paper texts (`{file-id}.pdf.txt`).                                                   |
| `-p, --parliament-periods-base-dir` | Directory with one subdirectory per parliament period (`registry.json` and the session directories), e.g. `data`. |
| `-h, --help`                        | Show the help text and exit.                                                                                      |

| Environment variable            | Description                                                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `TYPESENSE_SERVER_URL`          | URL of the Typesense server (e.g. `http://localhost:8108`).                                                                                      |
| `TYPESENSE_COLLECTION_NAME`     | Name of the collection the documents are imported into (e.g. `papers-and-speeches-0001`).                                                        |
| `TYPESENSE_API_KEY`             | API key with write access to the collection.                                                                                                     |
| `OPARL_COUNCIL_ORGANIZATION_ID` | OParl id of the city council (e.g. `https://ratsinfo.magdeburg.de/oparl/bodies/0001/organizations/gr/1`). Only this organization's papers count. |

## Docker

Build the image from the repository root:

```bash
docker build -t srw-index-search -f docker/index-search.Dockerfile .
```

Run it with the input directories mounted read-only. For a Typesense server on the host, use `host.docker.internal`:

```bash
docker run \
  --rm \
  -e TYPESENSE_SERVER_URL=http://host.docker.internal:8108 \
  -e TYPESENSE_COLLECTION_NAME=papers-and-speeches-0001 \
  -e TYPESENSE_API_KEY=abc123 \
  -e OPARL_COUNCIL_ORGANIZATION_ID=https://ratsinfo.magdeburg.de/oparl/bodies/0001/organizations/gr/1 \
  -v $(pwd)/output/papers/all-extracted:/app/papers-content:ro \
  -v $(pwd)/data:/app/parliament-periods:ro \
  -v $(pwd)/data/oparl-magdeburg:/app/oparl:ro \
  srw-index-search
```

The container runs as user `bun` (UID 1000). On a Linux host, the mounted directories must be readable by that user.
