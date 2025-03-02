
### Parse Speakers
This tool parses multiple rttm files (from one session) and generates a single json file containing all speakers data.

#### Build the docker image
```shell
docker build -t srw-parse-speakers -f docker\parse-speakers.Dockerfile .
```

#### Run the docker container
```shell
docker run \
  --rm \
  -v %cd%\sessions-media-files\2022-09-01:/app/input:ro \
  -v %cd%\output\sessions-scan-results\2022-09-01:/app/output \
  srw-parse-speakers \
  2022-09-01
```


### Scan voting images
This tool scans the voting images and generates a json file containing the voting data.

#### Build the docker image
```shell
docker build -t srw-scan-voting-images -f docker\scan-voting-images.Dockerfile .
```

#### Run the docker container
```shell
docker run \
	--rm \
	-v %cd%\data\magdeburg-7\2022-09-01\config-2022-09-01.json:/app/session-config.json:ro \
	-v %cd%\sessions-media-files\2022-09-01:/app/voting-images:ro \
	-v %cd%\output\sessions-scan-results\2022-09-01:/app/output \
	srw-scan-voting-images \
	2022-09-01
```


### Speech transcriptions

#### Build the docker image
```shell
docker build -t srw-speech-to-text -f docker\speech-to-text.Dockerfile .
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
	-v %cd%\output\sessions-scan-results\2022-09-01:/app/output \
	-v %cd%\output\speeches\2022-09-01:/app/speeches:ro \
	srw-speech-to-text \
	2022-09-01
```


### Generate data assets

#### Build the docker image
```shell
docker build -t srw-generate-data-assets -f docker\generate-data-assets.Dockerfile .
```

#### Run the docker container
```shell
docker run \
  --rm \
  -v %cd%\data\magdeburg-8:/app/input-dir:ro \
  -v %cd%\src\assets\electoral-periods\magdeburg-8:/app/output-dir \
  -v %cd%\data\Magdeburg.json:/app/Magdeburg.json:ro \
  srw-generate-data-assets
```


### Generate routes file

#### Build the docker image
```shell
docker build -t srw-generate-routes-file -f docker\generate-routes-file.Dockerfile .
```

#### Run the docker container
```shell
docker run \
  --rm \
  -v %cd%\data:/app/data:ro \
  -v %cd%:/app/generated \
  srw-generate-routes-file
```


### Download paper files

#### Build the docker image
```shell
docker build -t srw-download-paper-files -f docker\download-paper-files.Dockerfile .
```

#### Run the docker container
```shell
docker run \
  --rm \
  -v %cd%\output\papers\2025:/app/papers \
  -v %cd%\data\Magdeburg.json:/app/Magdeburg.json:ro \
  srw-download-paper-files \
  2024
```


### Generate paper assets

#### Build the docker image
```shell
docker build -t srw-generate-paper-assets -f docker\generate-paper-assets.Dockerfile .
```

#### Run the docker container
```shell
docker run \
  --rm \
  -v %cd%\data\Magdeburg.json:/app/Magdeburg.json:ro \
  -v %cd%\output\papers:/app/papers:ro \
  -v %cd%\src\assets\papers:/app/generated \
  srw-generate-paper-assets
```


### Extract text from paper files

#### Build the tika tool docker image 
```shell
docker build -t srw-tika -f docker\tika-batch-extract.Dockerfile .
```

#### Run the docker container
When running the container, the input and output folders have to be provided as volume mounts. The input folder should contain the pdf files to be processed. The output folder will contain the extracted text files.
```shell 
docker run \
  --rm \
  -v %cd%\output\papers\2023:/input \
  -v %cd%\output\papers\2023-extracted:/output \
  srw-tika
```


### Index Typesense search data

#### Build the docker image
```shell
docker build -t srw-index-search -f docker\index-search.Dockerfile .
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
	-v %cd%\data\Magdeburg.json:/app/Magdeburg.json:ro \
	-v %cd%\output\papers\all-extracted:/app/papers-content:ro \
	-v %cd%\data:/app/electoral-periods:ro \
	srw-index-search
```


### Web App

#### Build the docker image
```shell
docker build -t srw-stadtratwatch-web -f docker\stadtrat-watch-web.Dockerfile .
```

#### Run the docker container
```shell
docker run --rm -p 8080:80 srw-stadtratwatch-web
```
