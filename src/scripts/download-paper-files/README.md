# download-paper-files

## Purpose

Downloads the PDF documents linked to the city council's meetings of one year from the Ratsinformationssystem into a
local directory, one `{file-id}.pdf` per OParl file. Files that already exist are skipped. It runs after
[`scrape-oparl`](../scrape-oparl/README.md) and before `generate-paper-assets`, which reads the file sizes, in the
processing order (see [HOWTO](../../../docs/guides/HOWTO.md)).

## Usage

From the repository root:

```bash
OPARL_COUNCIL_ORGANIZATION_ID=https://ratsinfo.magdeburg.de/oparl/bodies/0001/organizations/gr/1 \
  bun src/scripts/download-paper-files/index.ts -r data/oparl-magdeburg -p output/papers/2026 -y 2026
```

| Flag                 | Description                                                                        |
| -------------------- | ---------------------------------------------------------------------------------- |
| `-r, --ratsinfo-dir` | Directory with the raw OParl files (`meetings.json`, `papers.json`, `files.json`). |
| `-p, --papers-dir`   | Directory the PDFs are written into.                                               |
| `-y, --year`         | Year of the council meetings whose files are downloaded.                           |
| `-h, --help`         | Show the help text and exit.                                                       |

| Environment variable            | Description                                                                                                                                        |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OPARL_COUNCIL_ORGANIZATION_ID` | OParl id of the city council (e.g. `https://ratsinfo.magdeburg.de/oparl/bodies/0001/organizations/gr/1`). Only this organization's meetings count. |

## Docker

Build the image from the repository root:

```bash
docker build -t srw-download-paper-files -f docker/download-paper-files.Dockerfile .
```

Run it with the OParl data mounted read-only and the target directory mounted writable. The last argument is the year;
without it, the image downloads `2025`:

```bash
docker run \
  --rm \
  -e OPARL_COUNCIL_ORGANIZATION_ID=https://ratsinfo.magdeburg.de/oparl/bodies/0001/organizations/gr/1 \
  -v $(pwd)/output/papers/2026:/app/papers \
  -v $(pwd)/data/oparl-magdeburg:/app/oparl:ro \
  srw-download-paper-files \
  2026
```

The container runs as user `bun` (UID 1000). On a Linux host, the mounted target directory must be writable by that
user.
