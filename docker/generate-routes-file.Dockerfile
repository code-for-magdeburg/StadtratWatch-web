FROM denoland/deno:2.1.0

WORKDIR /app

COPY deno.json /app
COPY deno.lock /app
COPY src /app/src

RUN deno install --entrypoint src/scripts/generate-routes-file/index.ts

RUN deno cache src/scripts/generate-routes-file/index.ts

CMD ["run", \
        "-R=/app/data", \
        "-W=/app/generated", \
        "src/scripts/generate-routes-file/index.ts", \
        "-d=./data", \
        "-o=./generated"]
