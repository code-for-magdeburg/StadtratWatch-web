# scrape-oparl

## Purpose

Fetches the parliamentary data (organizations, persons, meetings, papers, memberships, locations, agenda items,
consultations, files) from the city council's OParl API and writes it as raw OParl objects into `data/oparl-magdeburg/`.
It is the first step of the processing order (see [HOWTO](../../../docs/guides/HOWTO.md)); on a machine without a local
snapshot, run [`fetch-oparl`](../fetch-oparl/README.md) first.

## Usage

From the repository root.

Scrape all data (full). This may take several hours. A date (format `YYYY-MM-DD`) is required to limit the amount of
data: only objects created since that date are fetched.

```bash
bun --env-file=.env.local src/scripts/scrape-oparl/index.ts -m full -d 2019-01-01 -r data/oparl-magdeburg
```

Scrape only new and updated data (incremental). This may take several minutes. Only objects modified since the given
date are fetched and merged into the existing files. Without `-d`, the date is read from
`<ratsinfosystem-dir>/scraper-metadata.txt`; if that file does not exist, the run stops with an error.

```bash
bun --env-file=.env.local src/scripts/scrape-oparl/index.ts -m incremental -r data/oparl-magdeburg
```

Every successful run writes the time it finished to `scraper-metadata.txt`, so the next incremental run resumes from
there.

| Flag                       | Description                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `-m, --mode`               | `full` (all objects created since `--date`) or `incremental` (only changes).        |
| `-d, --date`               | Date in `YYYY-MM-DD` format. Required for `full`, optional for `incremental`.       |
| `-r, --ratsinfosystem-dir` | Directory the OParl objects are written to (usually `data/oparl-magdeburg`).        |
| `-p, --push`               | After scraping, upload the snapshot to S3 (see [below](#publish---push)). Optional. |
| `-h, --help`               | Show the help text and exit.                                                        |

| Environment variable          | Description                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| `SCRAPE_OPARL_BODY_URL`       | URL of the OParl body endpoint (e.g. `https://ratsinfo.magdeburg.de/oparl/bodies/0001`). |
| `SCRAPE_OPARL_FETCH_DELAY_MS` | Delay between requests to the OParl API in milliseconds (e.g. `2000`).                   |

## Docker

Build the image from the repository root:

```bash
docker build -t srw-scrape-oparl -f docker/scrape-oparl.Dockerfile .
```

Run it with the OParl directory mounted. `SCRAPE_OPARL_BODY_URL` and `SCRAPE_OPARL_FETCH_DELAY_MS` must be set in your
shell. Without arguments, the container runs an incremental scrape that resumes from `scraper-metadata.txt`:

```bash
docker run \
  --rm \
  -e SCRAPE_OPARL_BODY_URL \
  -e SCRAPE_OPARL_FETCH_DELAY_MS \
  -v $(pwd)/data/oparl-magdeburg:/app/data/oparl-magdeburg \
  srw-scrape-oparl
```

Arguments after the image name replace the default `-m incremental`, e.g. `srw-scrape-oparl -m full -d 2019-01-01`. The
target directory is fixed to the mounted `/app/data/oparl-magdeburg`.

The container runs as user `bun` (UID 1000). On a Linux host, the mounted directory must be writable by that user.

## Publish (`--push`)

Pass `-p` / `--push` to upload the scraped snapshot to S3 after writing it locally. This is the **only authenticated**
OParl step and is meant for the maintainer; without the flag, `scrape-oparl` just writes local files. When pushing, each
of the snapshot files is gzipped and uploaded as a content-hashed, immutable blob (`oparl/<file>.<sha>.json.gz`),
followed by a short-TTL `oparl/manifest.json`. Because blob names are content-addressed, no CloudFront invalidation is
ever needed. The manifest also carries a `lastSync` timestamp (read from the local `scraper-metadata.txt`), so other
machines can resume incremental scrapes via `fetch-oparl`.

```bash
bun --env-file=.env.local src/scripts/scrape-oparl/index.ts -m incremental -r data/oparl-magdeburg --push
```

The push reads these additional environment variables, validated **only when `--push` is set**:

| Environment variable                          | Description                                               |
| --------------------------------------------- | --------------------------------------------------------- |
| `AWS_S3_BUCKET`                               | Target S3 bucket (the existing bucket behind CloudFront). |
| `AWS_S3_OPARL_PREFIX`                         | Key prefix. Optional, default `oparl`.                    |
| `AWS_REGION`                                  | Bucket region.                                            |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Credentials with write access to the bucket.              |

**Never commit credentials**; provide them via the environment at runtime.

With Docker, pass the AWS variables with `-e` as well and append `-m incremental --push` after the image name.
