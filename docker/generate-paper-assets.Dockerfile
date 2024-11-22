FROM denoland/deno:2.1.0

WORKDIR /app

COPY deno.json /app
COPY deno.lock /app
COPY src /app/src

RUN deno install --entrypoint src/scripts/generate-paper-assets/index.ts

RUN deno cache src/scripts/generate-paper-assets/index.ts

CMD ["run", \
        "-R=/app/Magdeburg.json,/app/papers", \
        "-W=/app/generated", \
        "src/scripts/generate-paper-assets/index.ts", \
        "-s=./Magdeburg.json", \
        "-p=./papers", \
        "-o=./generated"]
