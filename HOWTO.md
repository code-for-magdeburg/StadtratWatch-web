
### Parse Speakers
This tool parses multiple rttm files (from one session) and generates a single json file containing all speakers data.

#### Build the docker image
```bash
docker build -t srw-parse-speakers -f docker/parse-speakers.Dockerfile .
```

#### Run the docker container
```bash
docker run \
  --rm \
  -v $(pwd)/sessions-media-files/2022-09-01:/app/input:ro \
  -v $(pwd)/output/sessions-scan-results/2022-09-01:/app/output \
  srw-parse-speakers \
  2022-09-01
```


### Scan voting images
This tool scans the voting images and generates a json file containing the voting data.

#### Build the docker image
```bash
docker build -t srw-scan-voting-images -f docker/scan-voting-images.Dockerfile .
```

#### Run the docker container
```bash
docker run \
	--rm \
	-v $(pwd)/data/magdeburg-7/2022-09-01/config-2022-09-01.json:/app/scan-config.json:ro \
	-v $(pwd)/sessions-media-files/2022-09-01:/app/voting-images:ro \
	-v $(pwd)/output/sessions-scan-results/2022-09-01:/app/output \
	srw-scan-voting-images \
	2022-09-01
```


### Speech transcriptions

#### Build the docker image
```bash
docker build -t srw-speech-to-text -f docker/speech-to-text.Dockerfile .
```

#### Run the docker container

OpenAI API key has to be provided by setting the following environment variable:
- `OPENAI_ORGANIZATION_ID`
- `OPENAI_PROJECT_ID`
- `OPENAI_API_KEY`

```shell
docker run \
	--rm \
	-e OPENAI_ORGANIZATION_ID=<OpenAI organization id> \
	-e OPENAI_PROJECT_ID=<OpenAI project id> \
	-e OPENAI_API_KEY=<OpenAI api key> \
	-v $(pwd)/output/sessions-scan-results/2022-09-01:/app/output \
	-v $(pwd)/output/speeches/2022-09-01:/app/speeches:ro \
	srw-speech-to-text \
	2022-09-01
```


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
  -v $(pwd)/output/papers/2025:/app/papers \
  -v $(pwd)/output/ratsinfosystem:/app/oparl:ro \
  srw-download-paper-files \
  2025
```


### Generate paper assets

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
  -v $(pwd)/data/papers:/app/generated \
  -v $(pwd)/output/ratsinfosystem:/app/oparl:ro \
  srw-generate-paper-assets
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
  -v $(pwd)/output/papers/2025:/input \
  -v $(pwd)/output/papers/2025-extracted:/output \
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


### Scrape OParl data

Running the OParl scraper requires to set the following environment variables:
- `SCRAPE_OPARL_FETCH_DELAY_MS` - Delay between requests to the OParl API in milliseconds (e.g. `2000`)
- `SCRAPE_OPARL_BODY_URL` - URL of the OParl body endpoint (e.g. `https://ratsinfo.magdeburg.de/oparl/bodies/0001`)


#### Scrape all data (full)
This command scrapes all data from the OParl API and stores it in the `output/ratsinfosystem` folder. It may take several hours to complete.
A date has to be specified (format: YYYY-MM-DD) to limit the amount of data to be scraped. Only objects that where created or modified since that date will be fetched.

```bash
deno run \
  --allow-net \
  --allow-read \
  --allow-write \
  src/scripts/scrape-oparl/scrape-oparl/index.ts \
  -m full \
  -d 2019-01-01 \
  -r output/ratsinfosystem
```

#### Scrape only new and updated data (incremental)
This command scrapes only new and updated data from the OParl API and stores it in the `output/ratsinfosystem` folder. It may take several minutes to complete.

Provide an optional `-d` parameter to limit the amount of data to be scraped. Only objects that where created or modified since that date will be fetched. If no date is provided, the tool will try to read the last modified date from a file named `scraper-metadata.txt` in the output folder. If the file does not exist, it will stop with an error message.

```bash
deno run \
  --allow-net \
  --allow-read \
  --allow-write \
  src/scripts/scrape-oparl/scrape-oparl/index.ts \
  -m incremental \
  -r output/ratsinfosystem
```
