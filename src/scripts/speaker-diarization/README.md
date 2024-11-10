# Speaker diarization

## Generate audio file from video file

This is a preparation step to generate the audio file from the video file. The audio file is used as input for the speaker diarization process.

```
docker run --rm -v %cd%\sessions-media-files\2024-03-11:/session -w /session jrottenberg/ffmpeg:4.4-scratch -stats -i 2024-03-11-video.mp4 -ac 1 -ar 16000 -y 2024-03-11-audio.wav
```

Alternative: Generate an mp3 file:

```
docker run --rm -v %cd%\sessions-media-files\2024-03-11:/session -w /session jrottenberg/ffmpeg:4.4-scratch -stats -i 2024-03-11-video.mp4 -ac 1 -ar 16000 -b:a 256k -y 2024-03-11-audio.mp3
```

## Split wav file into smaller segments

In case the audio file is too large (>5 hrs), it is recommended to split the audio file into smaller segments.

```
docker run --rm -v %cd%\sessions-media-files\2024-03-11:/session -w /session jrottenberg/ffmpeg:4.4-scratch -stats -i 2024-03-11-audio.wav -f segment -segment_time 14400 -c copy 2024-03-11-audio-%02d.wav
```

## Alternative: Combine both steps

The following command combines the two steps into one command. The audio file is generated from the video file and split into smaller segments.

```
docker run --rm -v %cd%\sessions-media-files\2024-03-11:/session -w /session jrottenberg/ffmpeg:4.4-scratch -stats -i 2024-03-11-video.mp4 -ac 1 -ar 16000 -f segment -segment_time 14400 2024-03-11-audio-%02d.wav
```

or as mp3 file

```
docker run --rm -v %cd%\sessions-media-files\2024-03-11:/session -w /session jrottenberg/ffmpeg:4.4-scratch -stats -i 2024-03-11-video.mp4 -ac 1 -ar 16000 -b:a 256k -f segment -segment_time 14400 2024-03-11-audio-%02d.mp3
```

## Build docker image for speaker diarization

Run the following command inside the speaker-diarization directory to build the docker image.

```
docker build -t srw-speaker-diarization .
```

## Generate RTTM file

The following command generates the RTTM file from the audio file. The RTTM file contains the speaker diarization information.
Depending on the size (length) of the audio file, the process can take several hours.

```
docker run --rm -v %cd%\sessions-media-files\2024-03-11:/session -w /session srw-speaker-diarization 2024-03-11-audio-00.wav 2024-03-11-speakers-00.rttm <HuggingFace API token>
```
