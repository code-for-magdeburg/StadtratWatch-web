FROM denoland/deno:2.1.1

WORKDIR /app

COPY deno.json /app
COPY deno.lock /app
COPY src /app/src

RUN deno install --entrypoint src/scripts/parse-speakers/index.ts

RUN deno cache src/scripts/parse-speakers/index.ts

ENTRYPOINT ["deno", "run", \
        "-R=/app/input,/app/output", \
        "-W=/app/output", \
        "src/scripts/parse-speakers/index.ts", \
        "-i=/app/input", \
        "-o=/app/output", \
        "-s"]
