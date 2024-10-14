
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

### Set up the collection

#### Purpose
The `init-schema.ps1` PowerShell script is used to initialize the schema for the collection in a Typesense server. This script sets up the necessary fields and configurations for the collection to store and index papers and speeches.

#### Usage
To run the script, you need to provide the following arguments:
1. `TypesenseServerUrl`: The URL of the Typesense server.
2. `CollectionName`: The name of the collection for storing papers content and speech transcriptions.
3. `ApiKey`: The API key for authenticating with the Typesense server.

#### Example
```powershell
.\init-schema.ps1 "http://localhost:8108" "papers-and-speeches-0001" "abc123"
```

This command will initialize the specified collection on the Typesense server running at `http://localhost:8108` using the provided API key.

  
### Import data into Typesense

Typesense connection information has to be provided by setting the following environment variables:
- `TYPESENSE_SERVER_URL`
- `TYPESENSE_API_KEY`
- `TYPESENSE_COLLECTION_NAME`

```bash
npm run index-search -- <Path to directory containing text files> <Path to base directory of electoral periods folders> <Scraped Session file>
```

Example
```bash
npm run index-search -- ./output/papers/all-extracted ./data ./data/Magdeburg.json
```
