# Extract speeches

This tool extracts individual speech tracks from a session audio file and saves them as individual mp3 files.
The track information has to be provided by passing a json file containing the speeches data.

## Build the docker image

```powershell
docker build -t srw-extract-speeches src\scripts\extract-speeches
```

## Run the docker container

```powershell
$session = "2024-07-08"
docker run `
    --rm `
    -v $pwd\output\sessions-scan-results\$session\session-speeches-$session.json:/session-speeches.json:ro `
    -v $pwd\sessions-media-files\$session\$session-audio.mp3:/session-audio.mp3:ro `
    -v $pwd\output\speeches\$session:/output `
    srw-extract-speeches
```

```bash
SESSION=2025-05-22
docker run \
    --rm \
    -v $(pwd)/output/sessions-scan-results/$SESSION/session-speeches-$SESSION.json:/session-speeches.json:ro \
    -v $(pwd)/sessions-media-files/$SESSION/$SESSION-audio.mp3:/session-audio.mp3:ro \
    -v $(pwd)/output/speeches/$SESSION:/output \
    srw-extract-speeches
```
