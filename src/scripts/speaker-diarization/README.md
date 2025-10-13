# Speaker diarization

## Generate audio file from video file

This is a preparation step to generate the audio file from the video file. The audio file is used as input for the speaker diarization process.

```bash
DATE=2025-09-29
docker run \
  --rm \
  -v $(pwd)/sessions-media-files/$DATE:/session \
  -w /session jrottenberg/ffmpeg:4.4-scratch \
  -stats \
  -i ${DATE}-video.mp4 \
  -ac 1 -ar 16000 -y \
  ${DATE}-audio.wav
```

Alternative: Generate an mp3 file:

```bash
DATE=2025-09-25
docker run \
  --rm \
  -v $(pwd)/sessions-media-files/$DATE:/session \
  -w /session \
  jrottenberg/ffmpeg:4.4-scratch \
  -stats \
  -i $DATE-video.mp4 \
  -ac 1 -ar 16000 -b:a 256k -y \
  $DATE-audio.mp3
```

## Split wav file into smaller segments

In case the audio file is too large (>5 hrs), it is recommended to split the audio file into smaller segments.

```bash
DATE=2025-09-25
docker run \
  --rm \
  -v $(pwd)/sessions-media-files/$DATE:/session \
  -w /session \
  jrottenberg/ffmpeg:4.4-scratch \
  -stats \
  -i $DATE-audio.wav \
  -f segment -segment_time 14400 -c copy \
  $DATE-audio-%02d.wav
```

## Alternative: Combine both steps

The following command combines the two steps into one command. The audio file is generated from the video file and split into smaller segments.

```bash
DATE=2025-09-25
docker run \
  --rm \
  -v $(pwd)/sessions-media-files/$DATE:/session \
  -w /session \
  jrottenberg/ffmpeg:4.4-scratch \
  -stats \
  -i $DATE-video.mp4 \
  -ac 1 -ar 16000 -f segment -segment_time 14400 \
  $DATE-audio-%02d.wav
```

or as mp3 file

```bash
DATE=2025-09-25
docker run \
  --rm \
  -v $(pwd)/sessions-media-files/$DATE:/session \
  -w /session \
  jrottenberg/ffmpeg:4.4-scratch \
  -stats \
  -i $DATE-video.mp4 \
  -ac 1 -ar 16000 -b:a 256k -f segment -segment_time 14400 \
  $DATE-audio-%02d.mp3
```

## Build docker image for speaker diarization

Run the following command inside the speaker-diarization directory to build the docker image.

```
docker build -t srw-speaker-diarization .
```

## Generate RTTM file

The following command generates the RTTM file from the audio file. The RTTM file contains the speaker diarization information.
Depending on the size (length) of the audio file, the process can take several hours.

```bash
DATE=2025-09-25
INDEX=00
HUGGING_FACE_API_TOKEN=<HuggingFace API token>
docker run \
  --rm \
  -v $(pwd)/sessions-media-files/$DATE:/session \
  -w /session \
  srw-speaker-diarization $DATE-audio-$INDEX.wav $DATE-speakers-$INDEX.rttm \
  $HUGGING_FACE_API_TOKEN
```
