# fetch-oparl

## Purpose

Mirrors the published OParl snapshot from CloudFront into the local `data/oparl-magdeburg/` directory, downloading only
the files whose content hash differs from the local copy. It is a **maintainer step** that runs before `scrape-oparl` on
a machine without a local snapshot (see the processing order in [HOWTO](../../../docs/guides/HOWTO.md)). The raw
snapshot is only needed to (re)generate the committed OParl derivates via `generate-oparl-derivatives`; the Astro build
reads the derivates.

## Usage

From the repository root:

```bash
bun --env-file=.env.local src/scripts/fetch-oparl/index.ts -d data/oparl-magdeburg
```

| Flag         | Description                                                                |
| ------------ | -------------------------------------------------------------------------- |
| `-d, --dir`  | Directory the snapshot is mirrored into. Default: `data/oparl-magdeburg/`. |
| `-h, --help` | Show the help text and exit.                                               |

It needs only the public base URL; no AWS credentials are involved.

| Environment variable      | Description                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `AWS_CLOUDFRONT_BASE_URL` | Base URL of the public CloudFront distribution (also used by the Astro build, see `astro/astro.config.mjs`).      |
| `AWS_S3_OPARL_PREFIX`     | Key prefix the snapshot lives under. Optional, default `oparl`; must match the prefix `scrape-oparl --push` uses. |

The run reads `oparl/manifest.json` and is idempotent: if every local file matches, it downloads nothing. Downloads go
into a staging copy of the target directory, which replaces the target only once every file has arrived, so a failed run
leaves the current snapshot intact.

If the manifest is unreachable, the run warns and keeps the local copy as long as every file exists locally; if a file
is missing, it fails. The manifest's `lastSync` timestamp is written to `<dir>/scraper-metadata.txt`, so an incremental
`scrape-oparl` on a fresh clone resumes from the last published snapshot.

## Docker

Build the image from the repository root:

```bash
docker build -t srw-fetch-oparl -f docker/fetch-oparl.Dockerfile .
```

Run it with the `data/` directory mounted. `AWS_CLOUDFRONT_BASE_URL` (and optionally `AWS_S3_OPARL_PREFIX`) must be set
in your shell:

```bash
docker run \
  --rm \
  -e AWS_CLOUDFRONT_BASE_URL \
  -e AWS_S3_OPARL_PREFIX \
  -v $(pwd)/data:/app/data \
  srw-fetch-oparl
```

The snapshot is written to `data/oparl-magdeburg/`. Mount its parent directory, not `oparl-magdeburg/` itself: the run
creates the staging copy next to the target directory and then swaps the two by renaming, so both must be on the mounted
volume.

The container runs as user `bun` (UID 1000). On a Linux host, the mounted directory must be writable by that user.
