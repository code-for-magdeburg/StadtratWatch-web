
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
The `init-schema.ps1` PowerShell script is used to initialize the schema for two collections (`files` and `papers`) in a Typesense server. This script sets up the necessary fields and configurations for these collections to store and index documents.

#### Usage
To run the script, you need to provide the following arguments:
1. `TypesenseServerUrl`: The URL of the Typesense server.
2. `FilesCollectionName`: The name of the collection for storing file metadata.
3. `PapersCollectionName`: The name of the collection for storing paper documents.
4. `ApiKey`: The API key for authenticating with the Typesense server.

#### Example
```powershell
.\init-schema.ps1 "http://localhost:8108" "files" "papers" "your-api-key"
```

This command will initialize the `files` and `papers` collections on the Typesense server running at `http://localhost:8108` using the provided API key.

  
### Import data into Typesense

#### Papers

```bash
npm run index-papers -- <Full path to directory containing text files> <Scraped Session file> <Typesense server url> <Papers collection name> <Api key>
```
