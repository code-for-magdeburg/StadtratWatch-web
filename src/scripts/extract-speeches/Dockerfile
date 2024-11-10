FROM jrottenberg/ffmpeg:4.4-alpine

RUN apk add --no-cache bash jq

COPY ./extract-speeches.sh /extract-speeches.sh

WORKDIR /output

ENTRYPOINT ["/extract-speeches.sh"]
