## Mandatory processing order

Run the processing pipeline in this order. The script sections below document individual tools, but this sequence is mandatory because later steps depend on files produced by earlier steps.

1. [`scrape-oparl`](../../src/scripts/scrape-oparl/README.md) - fetch current OParl data. On a machine without a local snapshot, run
   [`fetch-oparl`](../../src/scripts/fetch-oparl/README.md) first: it mirrors the published snapshot into
   `data/oparl-magdeburg/`, so the incremental scrape resumes from it.
2. `generate-paper-assets` - convert scraped OParl data into the internal paper assets.
3. [`generate-oparl-derivatives`](../../src/scripts/generate-oparl-derivatives/README.md) - precompile the committed OParl derivates (`voting-paper-map.json`, `paper-index.json`) the Astro build consumes.
4. Video processing steps:
   1. [`parse-speakers`](../../src/scripts/parse-speakers/README.md) - combine speaker diarization data for the session.
   2. [`scan-voting-images`](../../src/scripts/scan-voting-images/README.md) - extract voting results from session screenshots.
   3. [`speech-to-text`](../../src/scripts/speech-to-text/README.md) - generate speech transcriptions.
   4. [`detect-ai-text`](../../src/scripts/detect-ai-text/README.md) - optional, manual step: after transcripts are corrected and before committing
      session data, run a Pangram-based AI-text check on redaction-selected speeches.
5. `generate-image-assets` - create voting visualization image assets from processed session data.
6. `generate-paper-votings` - reverse the voting-paper-map against the session scans into the per-paper voting assets. Needs both the OParl derivates (step 3) and the scanned votings (step 4.2).
7. `index-search` - rebuild the Typesense search index after all paper, speech, and asset data is available.

### Generate image assets

#### Build the docker image
```bash
docker build -t srw-generate-image-assets -f docker/generate-image-assets.Dockerfile .
```

#### Run the docker container
```bash
docker run \
  --rm \
  -v $(pwd)/data/magdeburg-8:/app/input-dir:ro \
  -v $(pwd)/output/image-assets/magdeburg-8:/app/output-dir \
  srw-generate-image-assets
```

#### Publish to S3/CloudFront (`--push`)
Adding `--push` publishes the generated output directory to
`web-assets/parliament-periods/{period}/` after generating — this is the only way to publish this
prefix (see [publishing-web-assets.md](publishing-web-assets.md)). The period
is read from the input registry's `id`, and the nested `images/votings/{sessionId}/` sub-tree is
mirrored as-is under the period prefix. The output directory is the authoritative picture of the
period prefix, so the push uploads new or changed images, **prunes** orphaned ones, sets
`Cache-Control`, invalidates the touched paths, and then verifies the remote prefix against the
images it produced — catching a silent upload failure.

Pushing needs `AWS_S3_BUCKET` (the target bucket) plus the AWS credentials and
`AWS_CLOUDFRONT_DISTRIBUTION_ID` (see `.env.sample`); a plain generate run needs none of them. Use
`--push --dry-run` to print the upload/delete/invalidate diff without writing to S3 or invalidating
CloudFront.

```shell
deno run -A \
  src/scripts/generate-image-assets/index.ts \
  -i=data/magdeburg-8 \
  -o=output/image-assets/magdeburg-8 \
  --push
```


### Download paper files

#### Build the docker image
```bash
docker build -t srw-download-paper-files -f docker/download-paper-files.Dockerfile .
```

#### Run the docker container
```shell
docker run \
  --rm \
  -e OPARL_COUNCIL_ORGANIZATION_ID=https://ratsinfo.magdeburg.de/oparl/bodies/0001/organizations/gr/1 \
  -v $(pwd)/output/papers/2026:/app/papers \
  -v $(pwd)/data/oparl-magdeburg:/app/oparl:ro \
  srw-download-paper-files \
  2026
```


### Generate paper assets
This tool converts OParl data into the internal paper asset format and generates the batched
metadata files behind the paper detail page: `papers-{batch}.json` (paper metadata) and
`paper-graphs-{batch}.json` (the related-papers graph). It writes them to the output directory; the
web build does **not** read them from disk — they belong next to the other web assets on S3/CloudFront
under `web-assets/papers/`, from where the paper detail page fetches them at runtime. The committed
derivate the build actually consumes is `data/paper-index.json` (see
[`generate-oparl-derivatives`](../../src/scripts/generate-oparl-derivatives/README.md)), not
these batches, so `data/papers/` is no longer committed.

The council organization id is read from the `OPARL_COUNCIL_ORGANIZATION_ID` environment variable (e.g. `https://ratsinfo.magdeburg.de/oparl/bodies/0001/organizations/gr/1`). It is used to link consultations to their session pages only for council (Stadtrat) meetings.

#### Using the deno script
```shell
OPARL_COUNCIL_ORGANIZATION_ID=https://ratsinfo.magdeburg.de/oparl/bodies/0001/organizations/gr/1 \
  deno run \
    -R=data,data/oparl-magdeburg,output/papers,output/paper-assets \
    -W=output/paper-assets \
    -E=OPARL_COUNCIL_ORGANIZATION_ID \
    src/scripts/generate-paper-assets/index.ts \
    -r=data/oparl-magdeburg/ \
    -p=output/papers/ \
    -d=data/ \
    -o=output/paper-assets/
```

`-d`/`--data-dir` defaults to `data/`, so it can be omitted when run from the repository root. The
`data` directory holds the parliament period registries; it lets the generator link consultations to
their session pages when a council session exists for the meeting's date.

#### Publish to S3/CloudFront (`--push`)
Adding `--push` publishes `output/paper-assets/` to `web-assets/papers/` after generating — this is
the only way to publish this prefix (see [publishing-web-assets.md](publishing-web-assets.md)). The
output directory is the authoritative picture of the prefix (the run prunes stale
batches as it writes), so the push uploads new or changed batches, **prunes** orphaned ones, sets
`Cache-Control`, invalidates the touched paths, and then verifies the remote prefix against the
batches it produced — catching a silent upload failure.

Pushing needs `AWS_S3_BUCKET` (the target bucket) plus the AWS credentials and
`AWS_CLOUDFRONT_DISTRIBUTION_ID` (see `.env.sample`); a plain generate run needs none of them. Use
`--push --dry-run` to print the upload/delete/invalidate diff without writing to S3 or invalidating
CloudFront.

```shell
deno run -A \
  src/scripts/generate-paper-assets/index.ts \
  -r=data/oparl-magdeburg/ \
  -p=output/papers/ \
  -o=output/paper-assets/ \
  --push
```

#### Build the docker image
```bash
docker build -t srw-generate-paper-assets -f docker/generate-paper-assets.Dockerfile .
```

#### Run the docker container
```shell
docker run \
  --rm \
  -e OPARL_COUNCIL_ORGANIZATION_ID=https://ratsinfo.magdeburg.de/oparl/bodies/0001/organizations/gr/1 \
  -v $(pwd)/output/papers:/app/papers:ro \
  -v $(pwd)/output/paper-assets:/app/generated \
  -v $(pwd)/data/oparl-magdeburg:/app/oparl:ro \
  -v $(pwd)/data:/app/data:ro \
  srw-generate-paper-assets
```


### Generate paper votings
This tool builds the web assets behind the »Abstimmungen« tab on the paper detail page. The link from a voting to a paper only exists forwards (`{period}/voting-paper-map.json`: session date → agenda item → paper id), so this tool reverses it at build time and resolves each vote to its person and faction against the period's `registry.json` — the same breakdown the session detail page renders.

It scans `<data-dir>` for `{period-id}/registry.json` and intersects each period's `voting-paper-map.json` with the session scans: only agenda items that were **actually scanned** produce a voting, so papers that were never voted on do not appear in the output at all (which is what disables the tab). A paper voted on in several parliament periods collects the votings of all of them, each joined against its own registry.

Output is batched by paper id (`paper-votings-{batch}.json`, `batch = paperId / 100`), stably sorted (session date descending, then voting id ascending), so a repeated run produces no diff. The files belong next to the other web assets on S3/CloudFront under `web-assets/paper-votings/`; generating them does **not** publish them — see [publishing-web-assets.md](publishing-web-assets.md).

Run this **after** the OParl derivates (`voting-paper-map.json`) and the video processing (`session-scan-*.json`) exist.

#### Using the deno script
```shell
deno run \
  -R=data,output/paper-votings \
  -W=output/paper-votings \
  src/scripts/generate-paper-votings/index.ts \
  -d=data/ \
  -o=output/paper-votings/
```

`-d`/`--data-dir` defaults to `data/`, so it can be omitted when run from the repository root.

#### Publish to S3/CloudFront (`--push`)
Adding `--push` publishes `output/paper-votings/` to `web-assets/paper-votings/` after generating —
this is the only way to publish this prefix (see
[publishing-web-assets.md](publishing-web-assets.md)). The output directory is the authoritative
picture of the prefix (the run prunes empty batches), so the push uploads new or changed batches,
**prunes** orphaned ones, sets `Cache-Control`, invalidates the touched paths, and then verifies the
remote prefix against the batches it produced — catching a silent upload failure.

Pushing needs `AWS_S3_BUCKET` (the target bucket) plus the AWS credentials and
`AWS_CLOUDFRONT_DISTRIBUTION_ID` (see `.env.sample`); a plain generate run needs none of them. Use
`--push --dry-run` to print the upload/delete/invalidate diff without writing to S3 or invalidating
CloudFront.

```shell
deno run -A \
  src/scripts/generate-paper-votings/index.ts \
  -o=output/paper-votings/ \
  --push
```

#### Build the docker image
```bash
docker build -t srw-generate-paper-votings -f docker/generate-paper-votings.Dockerfile .
```

#### Run the docker container
```shell
docker run \
  --rm \
  -v $(pwd)/data:/app/data:ro \
  -v $(pwd)/output/paper-votings:/app/generated \
  srw-generate-paper-votings
```


### Extract text from paper files

#### Build the tika tool docker image 
```bash
docker build -t srw-tika -f docker\tika-batch-extract.Dockerfile .
```

#### Run the docker container
When running the container, the input and output folders have to be provided as volume mounts. The input folder should contain the pdf files to be processed. The output folder will contain the extracted text files.
```shell 
docker run \
  --rm \
  -v $(pwd)/output/papers/2026:/input \
  -v $(pwd)/output/papers/2026-extracted:/output \
  srw-tika
```


### Index Typesense search data

#### Build the docker image
```bash
docker build -t srw-index-search -f docker/index-search.Dockerfile .
```

#### Run the docker container

Typesense connection information have to be provided by setting the following environment variables:
- `TYPESENSE_SERVER_URL`
- `TYPESENSE_API_KEY`
- `TYPESENSE_COLLECTION_NAME`

```shell
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


### Web App

#### Build the docker image
```bash
docker build -t srw-stadtratwatch-web -f docker/stadtrat-watch-web.Dockerfile .
```

#### Run the docker container
```bash
docker run --rm -p 8080:80 srw-stadtratwatch-web
```
