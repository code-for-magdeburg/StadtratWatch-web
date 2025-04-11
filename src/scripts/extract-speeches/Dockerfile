FROM jrottenberg/ffmpeg:4.4-alpine

RUN apk add --no-cache bash jq

COPY ./extract-speeches.sh /extract-speeches.sh

WORKDIR /output

RUN chmod +x /extract-speeches.sh

ENTRYPOINT ["/extract-speeches.sh"]
