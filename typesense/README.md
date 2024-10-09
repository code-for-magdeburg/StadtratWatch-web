
### Start Typesense Server

By starting a docker container:

Bash:
```bash
docker run \
  --rm \
  -d \
  -p 8108:8108 \
  -v ${pwd}/data:/data \
  typesense/typesense:27.0 \
  --data-dir /data \
  --api-key <API KEY> \
  --enable-cors
```

Powershell:
```powershell
docker run `
  --rm `
  -d `
  -p 8108:8108 `
  -v ${pwd}/data:/data `
  typesense/typesense:27.0 `
  --data-dir /data `
  --api-key <API KEY> `
  --enable-cors
```

### Set up the papers and files collections

#### Purpose
The `init-schema.ps1` PowerShell script is used to initialize the schema for two collections (`papers` and `speeches`) in a Typesense server. This script sets up the necessary fields and configurations for these collections to store and index documents.

#### Usage
To run the script, you need to provide the following arguments:
1. `TypesenseServerUrl`: The URL of the Typesense server.
2. `PapersCollectionName`: The name of the collection for storing paper documents.
3. `SpeechesCollectionName`: The name of the collection for storing speech transcriptions.
4. `ApiKey`: The API key for authenticating with the Typesense server.

#### Example
```powershell
.\init-schema.ps1 "http://localhost:8108" "papers" "speeches" "your-api-key"
```

This command will initialize the `papers` and `speeches` collections on the Typesense server running at `http://localhost:8108` using the provided API key.

  
### Import data into Typesense

#### Papers

```bash
npm run index-papers -- <Path to directory containing text files> <Scraped Session file> <Typesense server url> <Papers collection name> <Api key>
```

Example
```bash
npm run index-papers -- ./output/papers/all-extracted ./data/Magdeburg.json http://localhost:8108 papers-0001 abc123
```

#### Speeches

```bash
npm run index-speeches -- <Path to directory electorial period folders> <Typesense server url> <Speeches collection name> <Api key>
```

Example
```bash
npm run index-speeches -- ./data/electoral-period-8 http://localhost:8108 speeches-0001 abc123
```
