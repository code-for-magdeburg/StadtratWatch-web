#!/bin/bash

speechesConfigFile="/session-speeches.json"

readarray -t speeches < <(jq -c '.[]' $speechesConfigFile)

for speech in "${speeches[@]}"
do
    isChairPerson=$(echo $speech | jq -r '.isChairPerson')
    if [[ "$isChairPerson" = "true" ]]; then
        continue
    fi

    speaker=$(echo $speech | jq -r '.speaker')
    speaker=$(echo $speaker | sed 's/ /_/g')

    start=$(echo $speech | jq -r '.start')
    start=$(printf "%06d" $start)

    duration=$(echo $speech | jq -r '.duration + 1')

    destinationFilename=/output/${start}-${speaker}.mp3

    ffmpeg_command=$(echo "ffmpeg -ss $start -i /session-audio.mp3 -t $duration -y $destinationFilename")

    $ffmpeg_command

done
