# generate-paper-assets

## Purpose

Reads the raw OParl data from `data/oparl-magdeburg/`, the downloaded PDFs and the period registries, and writes the
batched files behind the paper detail page: `papers-{batch}.json` (paper metadata) and `paper-graphs-{batch}.json` (the
related-papers graph). It runs after [`download-paper-files`](../download-paper-files/README.md) in the processing order
(see [HOWTO](../../../docs/guides/HOWTO.md)).

## Usage

From the repository root:

```bash
OPARL_COUNCIL_ORGANIZATION_ID=https://ratsinfo.magdeburg.de/oparl/bodies/0001/organizations/gr/1 \
  bun src/scripts/generate-paper-assets/index.ts \
    -r data/oparl-magdeburg/ \
    -p output/papers/ \
    -d data/ \
    -o output/paper-assets/
```

| Flag                 | Description                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `-r, --ratsinfo-dir` | Directory with the raw OParl files (`meetings.json`, `papers.json`, `files.json`, …).                      |
| `-p, --papers-dir`   | Directory with the downloaded PDFs, one subdirectory per year. Used for the file sizes.                    |
| `-d, --data-dir`     | Directory with the period registries, used to link consultations to their session pages. Default: `data/`. |
| `-o, --output-dir`   | Directory the `papers-{batch}.json` and `paper-graphs-{batch}.json` files are written into.                |
| `--push`             | After generating, publish the output directory to S3/CloudFront (see [below](#publish---push)).            |
| `--dry-run`          | Only with `--push`: print the diff without writing to S3 or invalidating CloudFront.                       |
| `-h, --help`         | Show the help text and exit.                                                                               |

| Environment variable            | Description                                                                                                                                   |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `OPARL_COUNCIL_ORGANIZATION_ID` | Required. OParl id of the council (Stadtrat) organization. Only consultations in council meetings are linked to a session page by their date. |

The batches belong next to the other web assets on S3/CloudFront under `web-assets/papers/`, from where the paper detail
page fetches them at runtime.

Output is batched by paper id (`batch = paperId / 100`). Batches the run no longer produces are removed from the output
directory. Generating the files does **not** publish them; see [below](#publish---push).

## Docker

Build the image from the repository root:

```bash
docker build -t srw-generate-paper-assets -f docker/generate-paper-assets.Dockerfile .
```

Run it with the OParl, papers and data directories mounted read-only and the output directory mounted writable:

```bash
docker run \
  --rm \
  -e OPARL_COUNCIL_ORGANIZATION_ID=https://ratsinfo.magdeburg.de/oparl/bodies/0001/organizations/gr/1 \
  -v $(pwd)/data/oparl-magdeburg:/app/oparl:ro \
  -v $(pwd)/output/papers:/app/papers:ro \
  -v $(pwd)/data:/app/data:ro \
  -v $(pwd)/output/paper-assets:/app/generated \
  srw-generate-paper-assets
```

The input and output directories are fixed to the mounted `/app/oparl`, `/app/papers`, `/app/data` and `/app/generated`.
Arguments after the image name are appended, e.g. `--push`; pass the AWS variables with `-e` as well.

The container runs as user `bun` (UID 1000). On a Linux host, the mounted output directory must be writable by that
user.

## Publish (`--push`)

Adding `--push` publishes the output directory to `web-assets/papers/` after generating. This is the only way to publish
this prefix (see [publishing-web-assets.md](../../../docs/guides/publishing-web-assets.md)). The output directory is the
authoritative picture of the prefix (the run prunes stale batches as it writes), so the push uploads new or changed
batches, **prunes** orphaned ones, sets `Cache-Control`, invalidates the touched paths, and then verifies the remote
prefix against the batches it produced, catching a silent upload failure.

```bash
bun --env-file=.env.local src/scripts/generate-paper-assets/index.ts \
  -r data/oparl-magdeburg/ \
  -p output/papers/ \
  -o output/paper-assets/ \
  --push
```

`OPARL_COUNCIL_ORGANIZATION_ID` is still required, because the push follows a fresh generate run. Use `--push --dry-run`
to print the upload/delete/invalidate diff without writing to S3 or invalidating CloudFront.

The push reads these environment variables, validated **only when `--push` is set** (see `.env.sample`):

| Environment variable                          | Description                                                  |
| --------------------------------------------- | ------------------------------------------------------------ |
| `AWS_S3_BUCKET`                               | Target S3 bucket (the existing bucket behind CloudFront).    |
| `AWS_REGION`                                  | Bucket region.                                               |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Credentials with write access to the bucket.                 |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID`              | CloudFront distribution whose touched paths are invalidated. |

**Never commit credentials**; provide them via the environment at runtime.
