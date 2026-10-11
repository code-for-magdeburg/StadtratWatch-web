FROM denoland/deno:2.3.3

WORKDIR /app

COPY deno.json /app
COPY deno.lock /app
COPY src /app/src

RUN deno install --entrypoint src/scripts/detect-ai-text/index.ts

RUN deno cache src/scripts/detect-ai-text/index.ts

ENTRYPOINT ["deno", "run", \
              "-R=/app/session-speeches.json", \
              "-W=/app/session-speeches.json", \
              "-E=PANGRAM_API_KEY", \
              "--allow-net", \
              "src/scripts/detect-ai-text/index.ts", \
              "-f=/app/session-speeches.json", \
              "-t"]
